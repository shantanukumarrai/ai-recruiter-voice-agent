import { prisma } from "@/lib/prisma";
import { groqGenerateJSON } from "@/lib/groq";
import { interviewEvaluationSchema, type InterviewEvaluation } from "@/validators/report.validator";

const EVALUATION_PROMPT = `You are an expert technical interviewer evaluating a completed interview transcript. Score the candidate objectively based ONLY on what they actually said in the transcript below.

Return ONLY valid JSON matching this exact shape, no markdown fences, no commentary:
{
  "communication": number (0-100, clarity and articulation of their answers),
  "confidence": number (0-100, how self-assured and decisive their responses were),
  "problemSolving": number (0-100, structured thinking and approach to technical/behavioral questions),
  "technicalSkill": number (0-100, depth and accuracy of technical knowledge demonstrated),
  "behavior": number (0-100, professionalism, attitude, and behavioral question quality),
  "leadership": number (0-100, ownership, initiative, and leadership signals — score lower if no evidence either way rather than assuming),
  "overallRating": number (0-100, holistic weighted assessment),
  "recommendation": "STRONG_HIRE" | "HIRE" | "MAYBE" | "NO_HIRE" | "STRONG_NO_HIRE",
  "strengths": string[] (2-6 specific, transcript-grounded points),
  "weaknesses": string[] (2-6 specific, transcript-grounded points),
  "summary": string (3-5 sentence overall summary of the interview and hiring recommendation rationale)
}

Rules:
- Base every score strictly on the transcript content — do not invent claims the candidate didn't make.
- If speech-to-text transcription seems to have garbled a name or word, do not penalize the candidate for that — focus on substance.
- Be fair but rigorous; a mediocre or vague answer should not score above 60.

Job Title: {{JOB_TITLE}}
Job Description: {{JOB_DESCRIPTION}}
Required Skills: {{JOB_SKILLS}}

Full Interview Transcript:
"""
{{TRANSCRIPT}}
"""`;

async function callEvaluationModel(prompt: string): Promise<InterviewEvaluation> {
  const attempt = async (extra = ""): Promise<InterviewEvaluation> => {
    const rawText = await groqGenerateJSON(prompt + extra);
    const json = JSON.parse(rawText);
    const parsed = interviewEvaluationSchema.safeParse(json);
    if (!parsed.success) throw new Error("AI_RESPONSE_SCHEMA_MISMATCH");
    return parsed.data;
  };

  try {
    return await attempt();
  } catch {
    return attempt(
      '\n\nReminder: respond with ONLY the raw JSON object matching the schema exactly. No ```json fences, no prose.'
    );
  }
}

/**
 * Core evaluation logic, with no auth check — called automatically the
 * moment an interview transitions to COMPLETED (from the candidate-facing
 * flow, which has no recruiter session to check against).
 */
export async function runEvaluationForInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: { include: { job: true, candidate: true } },
      session: { include: { messages: { orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!interview || !interview.session) {
    throw new Error("INTERVIEW_OR_SESSION_NOT_FOUND");
  }

  const transcript = interview.session.messages
    .map((m) => `${m.sender === "AI" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n");

  if (!transcript.trim()) {
    throw new Error("EMPTY_TRANSCRIPT");
  }

  const prompt = EVALUATION_PROMPT.replace("{{JOB_TITLE}}", interview.application.job.title)
    .replace("{{JOB_DESCRIPTION}}", interview.application.job.description.slice(0, 2000))
    .replace("{{JOB_SKILLS}}", interview.application.job.skills.join(", ") || "Not specified")
    .replace("{{TRANSCRIPT}}", transcript.slice(0, 12_000));

  const evaluation = await callEvaluationModel(prompt);

  const report = await prisma.report.upsert({
    where: { interviewId: interview.id },
    create: {
      interviewId: interview.id,
      communication: evaluation.communication,
      confidence: evaluation.confidence,
      problemSolving: evaluation.problemSolving,
      technicalSkill: evaluation.technicalSkill,
      behavior: evaluation.behavior,
      leadership: evaluation.leadership,
      overallRating: evaluation.overallRating,
      recommendation: evaluation.recommendation,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      summary: evaluation.summary,
      rawModelOutput: evaluation,
    },
    update: {
      communication: evaluation.communication,
      confidence: evaluation.confidence,
      problemSolving: evaluation.problemSolving,
      technicalSkill: evaluation.technicalSkill,
      behavior: evaluation.behavior,
      leadership: evaluation.leadership,
      overallRating: evaluation.overallRating,
      recommendation: evaluation.recommendation,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      summary: evaluation.summary,
      rawModelOutput: evaluation,
    },
  });

  await prisma.notification.create({
    data: {
      userId: interview.application.job.createdById,
      type: "REPORT_READY",
      title: "Interview report ready",
      message: `The AI evaluation for ${interview.application.candidate.name} is ready to review.`,
      link: `/candidates/${interview.application.candidateId}`,
    },
  });

  return report;
}

/** Recruiter-facing wrapper — verifies ownership before allowing a manual re-evaluation. */
export async function evaluateInterviewForRecruiter(interviewId: string, recruiterId: string) {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, application: { job: { createdById: recruiterId } } },
  });
  if (!interview) throw new Error("INTERVIEW_NOT_FOUND_OR_FORBIDDEN");
  return runEvaluationForInterview(interviewId);
}
