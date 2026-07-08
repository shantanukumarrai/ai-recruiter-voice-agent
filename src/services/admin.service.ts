import { prisma } from "@/lib/prisma";

export async function getPlatformStats() {
  const [totalRecruiters, totalJobs, totalCandidates, totalApplications, totalInterviews, completedInterviews] =
    await Promise.all([
      prisma.user.count({ where: { role: "RECRUITER" } }),
      prisma.job.count(),
      prisma.candidate.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.interview.count({ where: { status: "COMPLETED" } }),
    ]);

  return {
    totalRecruiters,
    totalJobs,
    totalCandidates,
    totalApplications,
    totalInterviews,
    completedInterviews,
  };
}

export async function listAllRecruiters() {
  return prisma.user.findMany({
    where: { role: "RECRUITER" },
    include: { _count: { select: { jobs: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllJobsAdmin() {
  return prisma.job.findMany({
    include: {
      createdBy: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllCandidatesAdmin() {
  const applications = await prisma.application.findMany({
    include: { candidate: true, job: { include: { createdBy: true } } },
    orderBy: { createdAt: "desc" },
  });

  // De-dupe by candidate, keeping their most recent application for display context.
  const seen = new Map<string, (typeof applications)[number]>();
  for (const app of applications) {
    if (!seen.has(app.candidateId)) seen.set(app.candidateId, app);
  }
  return Array.from(seen.values());
}
