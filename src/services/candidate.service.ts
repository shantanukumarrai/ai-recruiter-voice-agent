import { prisma } from "@/lib/prisma";
import type { ResumeExtraction } from "@/validators/candidate.validator";

/**
 * Step 1 of the upload flow: we have a resume file but haven't parsed it
 * yet, so we don't know the candidate's real name/email. We create a
 * placeholder candidate + application immediately so the recruiter sees
 * something in the UI right away, then `saveParsedResumeData` fills in
 * the real details once AI parsing completes.
 */
export async function createCandidatePlaceholder(params: {
  jobId: string;
  recruiterId: string;
  resumeUrl: string;
}) {
  const job = await prisma.job.findFirst({
    where: { id: params.jobId, createdById: params.recruiterId },
    select: { id: true },
  });
  if (!job) {
    throw new Error("JOB_NOT_FOUND_OR_FORBIDDEN");
  }

  const placeholderEmail = `pending-${crypto.randomUUID()}@resume.pending`;

  const candidate = await prisma.candidate.create({
    data: {
      name: "Parsing resume...",
      email: placeholderEmail,
      resumeUrl: params.resumeUrl,
    },
  });

  const application = await prisma.application.create({
    data: { jobId: job.id, candidateId: candidate.id },
  });

  return { candidate, application };
}

/**
 * Step 2: after AI extraction, write the real data back. If the extracted
 * email already belongs to another (real) candidate — meaning this person
 * has applied to a different job before — we merge into that existing
 * candidate instead of creating a duplicate person, then discard the
 * placeholder we made in step 1.
 */
export async function saveParsedResumeData(
  candidateId: string,
  applicationId: string,
  extraction: ResumeExtraction,
  resumeText: string
) {
  const finalEmail = extraction.email ?? undefined;

  if (finalEmail) {
    const existing = await prisma.candidate.findUnique({ where: { email: finalEmail } });
    if (existing && existing.id !== candidateId) {
      // Merge: point this application at the existing candidate, then
      // delete the placeholder record we created for this upload.
      await prisma.application.update({
        where: { id: applicationId },
        data: { candidateId: existing.id },
      });
      await prisma.candidate.update({
        where: { id: existing.id },
        data: {
          resumeUrl: (await prisma.candidate.findUnique({ where: { id: candidateId } }))!.resumeUrl,
          name: extraction.name,
          phone: extraction.phone ?? undefined,
          skills: extraction.skills,
          experience: extraction.experience,
          education: extraction.education,
          projects: extraction.projects,
          resumeText,
        },
      });
      await prisma.candidate.delete({ where: { id: candidateId } });
      return existing.id;
    }
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      name: extraction.name,
      email: finalEmail,
      phone: extraction.phone ?? undefined,
      skills: extraction.skills,
      experience: extraction.experience,
      education: extraction.education,
      projects: extraction.projects,
      resumeText,
    },
  });
  return candidateId;
}

/** Every candidate who has applied to at least one job owned by this recruiter. */
export async function listCandidatesForRecruiter(recruiterId: string) {
  const applications = await prisma.application.findMany({
    where: { job: { createdById: recruiterId } },
    include: { candidate: true, job: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  // One candidate can have multiple applications to this recruiter's jobs;
  // dedupe for the list view, keeping their most recent application's job title visible.
  const seen = new Map<string, (typeof applications)[number]>();
  for (const app of applications) {
    if (!seen.has(app.candidateId)) seen.set(app.candidateId, app);
  }
  return Array.from(seen.values());
}

export async function getApplicationForRecruiter(applicationId: string, recruiterId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, job: { createdById: recruiterId } },
    include: {
      candidate: true,
      job: true,
      resumeAnalysis: true,
      interview: true,
    },
  });
}

/** Used by the /candidates/[candidateId] route — resolves the most recent
 * application this candidate has with a job owned by this recruiter. */
export async function getApplicationByCandidateForRecruiter(candidateId: string, recruiterId: string) {
  return prisma.application.findFirst({
    where: { candidateId, job: { createdById: recruiterId } },
    include: {
      candidate: true,
      job: true,
      resumeAnalysis: true,
      interview: { include: { report: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
