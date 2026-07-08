import { prisma } from "@/lib/prisma";
import type { JobFormValues } from "@/validators/job.validator";
import type { JobStatus } from "@prisma/client";

export async function listJobsForRecruiter(recruiterId: string) {
  return prisma.job.findMany({
    where: { createdById: recruiterId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}

export async function getJobForRecruiter(jobId: string, recruiterId: string) {
  return prisma.job.findFirst({
    where: { id: jobId, createdById: recruiterId },
  });
}

export async function createJob(recruiterId: string, data: JobFormValues) {
  return prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      experience: data.experience,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      skills: data.skills,
      location: data.location,
      employmentType: data.employmentType,
      createdById: recruiterId,
      status: "DRAFT",
    },
  });
}

export async function updateJob(jobId: string, recruiterId: string, data: JobFormValues) {
  // updateMany (not update) so a mismatched recruiterId silently affects
  // zero rows instead of throwing — the caller checks `count` to decide
  // between "not found" and "forbidden" without leaking which one it is.
  const result = await prisma.job.updateMany({
    where: { id: jobId, createdById: recruiterId },
    data: {
      title: data.title,
      description: data.description,
      experience: data.experience,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      skills: data.skills,
      location: data.location,
      employmentType: data.employmentType,
    },
  });
  return result.count > 0;
}

export async function setJobStatus(jobId: string, recruiterId: string, status: JobStatus) {
  const extraFields =
    status === "PUBLISHED"
      ? { publishedAt: new Date() }
      : status === "CLOSED"
        ? { closedAt: new Date() }
        : {};

  const result = await prisma.job.updateMany({
    where: { id: jobId, createdById: recruiterId },
    data: { status, ...extraFields },
  });
  return result.count > 0;
}

export async function deleteJob(jobId: string, recruiterId: string) {
  const result = await prisma.job.deleteMany({
    where: { id: jobId, createdById: recruiterId },
  });
  return result.count > 0;
}
