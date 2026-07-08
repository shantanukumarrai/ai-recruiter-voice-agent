import { prisma } from "@/lib/prisma";
import type { InterviewStatus } from "@prisma/client";

export interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  scheduledInterviews: number;
  completedInterviews: number;
}

/**
 * All dashboard reads are scoped to `recruiterId` (the internal User.id).
 * A recruiter should only ever see counts derived from jobs they created —
 * this is the enforcement point, not just a UI filter.
 */
export async function getDashboardStats(recruiterId: string): Promise<DashboardStats> {
  const jobWhere = { createdById: recruiterId };

  const [totalJobs, totalCandidates, scheduledInterviews, completedInterviews] =
    await Promise.all([
      prisma.job.count({ where: jobWhere }),

      // Candidates are global, so "total candidates" for a recruiter means
      // distinct candidates who applied to one of *their* jobs.
      prisma.application
        .findMany({
          where: { job: jobWhere },
          select: { candidateId: true },
          distinct: ["candidateId"],
        })
        .then((rows) => rows.length),

      countInterviewsByStatus(recruiterId, ["SCHEDULED", "IN_PROGRESS"]),
      countInterviewsByStatus(recruiterId, ["COMPLETED"]),
    ]);

  return { totalJobs, totalCandidates, scheduledInterviews, completedInterviews };
}

function countInterviewsByStatus(recruiterId: string, statuses: InterviewStatus[]) {
  return prisma.interview.count({
    where: {
      status: { in: statuses },
      application: { job: { createdById: recruiterId } },
    },
  });
}

export interface CandidatesPerJob {
  jobTitle: string;
  candidateCount: number;
}

/** Powers the "Candidates per Job" bar chart. */
export async function getCandidatesPerJob(recruiterId: string): Promise<CandidatesPerJob[]> {
  const jobs = await prisma.job.findMany({
    where: { createdById: recruiterId },
    select: {
      title: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return jobs.map((job) => ({ jobTitle: job.title, candidateCount: job._count.applications }));
}

export interface RecentActivityItem {
  id: string;
  type: "APPLICATION" | "INTERVIEW_COMPLETED" | "JOB_PUBLISHED";
  title: string;
  subtitle: string;
  timestamp: Date;
}

/** Simple recent-activity feed — most recent applications + completed interviews, merged and sorted. */
export async function getRecentActivity(recruiterId: string, limit = 6): Promise<RecentActivityItem[]> {
  const [recentApplications, recentInterviews] = await Promise.all([
    prisma.application.findMany({
      where: { job: { createdById: recruiterId } },
      include: { candidate: true, job: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.interview.findMany({
      where: { status: "COMPLETED", application: { job: { createdById: recruiterId } } },
      include: { application: { include: { candidate: true, job: true } } },
      orderBy: { completedAt: "desc" },
      take: limit,
    }),
  ]);

  const items: RecentActivityItem[] = [
    ...recentApplications.map((app) => ({
      id: `application-${app.id}`,
      type: "APPLICATION" as const,
      title: `${app.candidate.name} applied`,
      subtitle: app.job.title,
      timestamp: app.createdAt,
    })),
    ...recentInterviews.map((interview) => ({
      id: `interview-${interview.id}`,
      type: "INTERVIEW_COMPLETED" as const,
      title: `${interview.application.candidate.name} completed their interview`,
      subtitle: interview.application.job.title,
      timestamp: interview.completedAt ?? interview.updatedAt,
    })),
  ];

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}
