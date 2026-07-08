import { prisma } from "@/lib/prisma";
import { groqGenerateJSON } from "@/lib/groq";
import { resumeScoreSchema, type ResumeScore } from "@/validators/resume-analysis.validator";
import type { Candidate, Job } from "@prisma/client";

const SCORING_PROMPT = `You are an expert technical recruiter. Compare the candidate's resume against the job description and produce an objective evaluation.

Return ONLY valid JSON matching this exact shape, no markdown fences, no commentary:
{
  "overallScore": number (0-100),
  "skillMatch": number (0-100, how well the candidate's skills match the required/preferred skills),
  "experienceMatch": number (0-100, how well their experience level matches what's required),
  "educationMatch": number (0-100, how relevant their education is to the role),
  "strengths": string[] (2-6 concise bullet points, specific to this candidate and this job),
  "weaknesses": string[] (2-6 concise bullet points, specific gaps relative to this job)
}

Rules:
- Be objective and specific — reference actual skills/experience from the resume, not generic statements.
- overallScore should reasonably reflect a weighted combination of the three sub-scores, but use your judgment for holistic fit.
- Do not invent experience or skills not present in the resume.

Job Title: {{JOB_TITLE}}
Job Description: {{JOB_DESCRIPTION}}
Required Experience: {{JOB_EXPERIENCE}}
Required Skills: {{JOB_SKILLS}}

Candidate Name: {{CANDIDATE_NAME}}
Candidate Skills: {{CANDIDATE_SKILLS}}
Candidate Resume Text:
"""
{{RESUME_TEXT}}
"""`;

export async function scoreResumeAgainstJob(
  candidate: Candidate,
  job: Job
): Promise<ResumeScore> {
  const prompt = SCORING_PROMPT.replace("{{JOB_TITLE}}", job.title)
    .replace("{{JOB_DESCRIPTION}}", job.description)
    .replace("{{JOB_EXPERIENCE}}", job.experience)
    .replace("{{JOB_SKILLS}}", job.skills.join(", ") || "Not specified")
    .replace("{{CANDIDATE_NAME}}", candidate.name)
    .replace("{{CANDIDATE_SKILLS}}", candidate.skills.join(", ") || "Not specified")
    .replace("{{RESUME_TEXT}}", (candidate.resumeText ?? "").slice(0, 12_000));

  const attempt = async (extraInstruction = ""): Promise<ResumeScore> => {
    const rawText = await groqGenerateJSON(prompt + extraInstruction);
    let json: unknown;
    try {
      json = JSON.parse(rawText);
    } catch {
      throw new Error("AI_RESPONSE_NOT_JSON");
    }
    const parsed = resumeScoreSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("AI_RESPONSE_SCHEMA_MISMATCH");
    }
    return parsed.data;
  };

  try {
    return await attempt();
  } catch {
    return attempt(
      "\n\nReminder: respond with ONLY the raw JSON object. No ```json fences, no prose before or after."
    );
  }
}

/**
 * Scores an application's resume against its job, saves the result, then
 * recomputes rank positions for every application on that job so the
 * ranked list is always consistent (not just the one we just scored).
 */
export async function scoreAndRankApplication(applicationId: string, recruiterId: string) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { createdById: recruiterId } },
    include: { candidate: true, job: true },
  });
  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");
  }
  if (!application.candidate.resumeText) {
    throw new Error("RESUME_NOT_PARSED_YET");
  }

  const score = await scoreResumeAgainstJob(application.candidate, application.job);

  await prisma.resumeAnalysis.upsert({
    where: { applicationId: application.id },
    create: {
      applicationId: application.id,
      overallScore: score.overallScore,
      skillMatch: score.skillMatch,
      experienceMatch: score.experienceMatch,
      educationMatch: score.educationMatch,
      strengths: score.strengths,
      weaknesses: score.weaknesses,
      rawModelOutput: score,
    },
    update: {
      overallScore: score.overallScore,
      skillMatch: score.skillMatch,
      experienceMatch: score.experienceMatch,
      educationMatch: score.educationMatch,
      strengths: score.strengths,
      weaknesses: score.weaknesses,
      rawModelOutput: score,
    },
  });

  await recomputeRankPositions(application.jobId);
}

async function recomputeRankPositions(jobId: string) {
  const analyses = await prisma.resumeAnalysis.findMany({
    where: { application: { jobId } },
    orderBy: { overallScore: "desc" },
  });

  await Promise.all(
    analyses.map((analysis, index) =>
      prisma.resumeAnalysis.update({
        where: { id: analysis.id },
        data: { rankPosition: index + 1 },
      })
    )
  );
}

/** All applications for a job, with their resume analysis (if scored), ranked best-first. */
export async function listRankedApplicationsForJob(jobId: string, recruiterId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, createdById: recruiterId } });
  if (!job) return null;

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: { candidate: true, resumeAnalysis: true },
  });

  // Scored candidates first (best score first), then unscored candidates by application date.
  return applications.sort((a, b) => {
    if (a.resumeAnalysis && b.resumeAnalysis) {
      return b.resumeAnalysis.overallScore - a.resumeAnalysis.overallScore;
    }
    if (a.resumeAnalysis) return -1;
    if (b.resumeAnalysis) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}
