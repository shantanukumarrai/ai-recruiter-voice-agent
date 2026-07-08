import { prisma } from "@/lib/prisma";
import { generateInterviewerTurn, getNextStage, STAGE_SEQUENCE } from "@/services/interview-ai.service";
import { runEvaluationForInterview } from "@/services/interview-evaluation.service";

async function getInterviewByToken(accessToken: string) {
  return prisma.interview.findUnique({
    where: { accessToken },
    include: {
      application: { include: { candidate: true, job: true } },
      session: { include: { messages: { orderBy: { createdAt: "asc" } } } },
    },
  });
}

/**
 * Called when the candidate clicks "Start Interview". Creates the
 * InterviewSession if it doesn't exist yet, generates the greeting, and
 * returns everything the client needs to render the first turn.
 */
export async function startInterview(accessToken: string) {
  const interview = await getInterviewByToken(accessToken);
  if (!interview) throw new Error("INTERVIEW_NOT_FOUND");

  if (interview.session && interview.session.messages.length > 0) {
    // Already started (e.g. candidate refreshed the page) — just resume.
    return { interview, messages: interview.session.messages };
  }

  const session =
    interview.session ??
    (await prisma.interviewSession.create({
      data: { interviewId: interview.id, currentStage: "GREETING" },
    }));

  await prisma.interview.update({
    where: { id: interview.id },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
  });

  const greeting = await generateInterviewerTurn({
    job: interview.application.job,
    candidate: interview.application.candidate,
    history: [],
    stage: "GREETING",
  });

  const message = await prisma.message.create({
    data: {
      sessionId: session.id,
      sender: "AI",
      stage: "GREETING",
      content: greeting,
    },
  });

  return { interview, messages: [message] };
}

/**
 * Called after the candidate's spoken answer has been transcribed. Saves
 * their turn, then either generates the next AI question or — if we just
 * answered the CONCLUSION turn — marks the interview complete.
 */
export async function submitCandidateAnswer(accessToken: string, transcript: string) {
  const interview = await getInterviewByToken(accessToken);
  if (!interview || !interview.session) throw new Error("INTERVIEW_NOT_STARTED");

  const session = interview.session;
  const currentStage = session.currentStage;

  const candidateMessage = await prisma.message.create({
    data: {
      sessionId: session.id,
      sender: "CANDIDATE",
      stage: currentStage,
      content: transcript,
    },
  });

  // The candidate just answered the CONCLUSION prompt (a simple "thank
  // you" acknowledgment) — end the interview here.
  if (currentStage === STAGE_SEQUENCE[STAGE_SEQUENCE.length - 1]) {
    await completeInterview(interview.id, interview.applicationId);
    return { done: true, message: candidateMessage, nextMessage: null };
  }

  const nextStage = getNextStage(currentStage);
  if (!nextStage) {
    await completeInterview(interview.id, interview.applicationId);
    return { done: true, message: candidateMessage, nextMessage: null };
  }

  const history = await prisma.message.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
  });

  const nextContent = await generateInterviewerTurn({
    job: interview.application.job,
    candidate: interview.application.candidate,
    history,
    stage: nextStage,
  });

  const nextMessage = await prisma.message.create({
    data: {
      sessionId: session.id,
      sender: "AI",
      stage: nextStage,
      content: nextContent,
    },
  });

  await prisma.interviewSession.update({
    where: { id: session.id },
    data: { currentStage: nextStage },
  });

  const isConclusion = nextStage === "CONCLUSION";

  return { done: isConclusion, message: candidateMessage, nextMessage };
}

async function completeInterview(interviewId: string, applicationId: string) {
  await prisma.interview.update({
    where: { id: interviewId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "INTERVIEW_COMPLETED" },
    include: { job: true, candidate: true },
  });

  await prisma.notification.create({
    data: {
      userId: application.job.createdById,
      type: "INTERVIEW_COMPLETED",
      title: "Interview completed",
      message: `${application.candidate.name} finished their interview for ${application.job.title}.`,
      link: `/candidates/${application.candidateId}`,
    },
  });

  // Fire the evaluation right away so the recruiter's notification bell
  // and the candidate's report card are populated without a separate
  // manual step. If this fails (e.g. a transient AI error), the recruiter
  // can still trigger it manually later via evaluateInterviewForRecruiter.
  try {
    await runEvaluationForInterview(interviewId);
  } catch (err) {
    console.error("Auto-evaluation failed for interview", interviewId, err);
  }
}

export async function getInterviewState(accessToken: string) {
  const interview = await getInterviewByToken(accessToken);
  if (!interview) return null;
  return {
    interview,
    messages: interview.session?.messages ?? [],
  };
}
