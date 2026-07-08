import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@prisma/client";

async function getOwnedApplication(applicationId: string, recruiterId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, job: { createdById: recruiterId } },
    include: { candidate: true, job: true },
  });
}

export async function shortlistApplication(applicationId: string, recruiterId: string) {
  const application = await getOwnedApplication(applicationId, recruiterId);
  if (!application) throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");

  await prisma.application.update({ where: { id: applicationId }, data: { status: "SHORTLISTED" } });

  await prisma.notification.create({
    data: {
      userId: recruiterId,
      type: "CANDIDATE_SHORTLISTED",
      title: "Candidate shortlisted",
      message: `${application.candidate.name} was shortlisted for ${application.job.title}.`,
      link: `/candidates/${application.candidateId}`,
    },
  });
}

export async function rejectApplication(applicationId: string, recruiterId: string) {
  const application = await getOwnedApplication(applicationId, recruiterId);
  if (!application) throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");

  await prisma.application.update({ where: { id: applicationId }, data: { status: "REJECTED" } });

  await prisma.notification.create({
    data: {
      userId: recruiterId,
      type: "CANDIDATE_REJECTED",
      title: "Candidate rejected",
      message: `${application.candidate.name} was marked as rejected for ${application.job.title}.`,
      link: `/candidates/${application.candidateId}`,
    },
  });
}

export async function hireApplication(applicationId: string, recruiterId: string) {
  const application = await getOwnedApplication(applicationId, recruiterId);
  if (!application) throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");

  await prisma.application.update({ where: { id: applicationId }, data: { status: "HIRED" } });

  await prisma.notification.create({
    data: {
      userId: recruiterId,
      type: "SYSTEM",
      title: "Candidate hired 🎉",
      message: `${application.candidate.name} was marked as hired for ${application.job.title}.`,
      link: `/candidates/${application.candidateId}`,
    },
  });
}

/** Reopen a shortlisted/rejected/hired application back to a working state, in case of a mistake. */
export async function revertApplicationStatus(
  applicationId: string,
  recruiterId: string,
  status: ApplicationStatus
) {
  const application = await getOwnedApplication(applicationId, recruiterId);
  if (!application) throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");
  await prisma.application.update({ where: { id: applicationId }, data: { status } });
}
