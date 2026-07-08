import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@prisma/client";

export interface InterviewCompletionStats {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  completionRate: number; // 0-100
}

export async function getInterviewCompletionStats(recruiterId: string): Promise<InterviewCompletionStats> {
  const interviews = await prisma.interview.findMany({
    where: { application: { job: { createdById: recruiterId } } },
    select: { status: true },
  });

  const total = interviews.length;
  const completed = interviews.filter((i) => i.status === "COMPLETED").length;
  const inProgress = interviews.filter((i) => i.status === "IN_PROGRESS").length;
  const scheduled = interviews.filter((i) => i.status === "SCHEDULED").length;

  return {
    total,
    completed,
    inProgress,
    scheduled,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

const FUNNEL_ORDER: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "INVITED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "SHORTLISTED",
  "HIRED",
];

const FUNNEL_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INVITED: "Invited",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_COMPLETED: "Interview Completed",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

export interface FunnelStage {
  status: ApplicationStatus;
  label: string;
  count: number;
}

export async function getHiringFunnel(recruiterId: string): Promise<{ stages: FunnelStage[]; rejected: number }> {
  const applications = await prisma.application.findMany({
    where: { job: { createdById: recruiterId } },
    select: { status: true },
  });

  const counts = new Map<ApplicationStatus, number>();
  for (const app of applications) {
    counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
  }

  const stages = FUNNEL_ORDER.map((status) => ({
    status,
    label: FUNNEL_LABELS[status],
    count: counts.get(status) ?? 0,
  }));

  return { stages, rejected: counts.get("REJECTED") ?? 0 };
}

export interface TopSkill {
  skill: string;
  count: number;
}

export async function getTopSkills(recruiterId: string, limit = 10): Promise<TopSkill[]> {
  const applications = await prisma.application.findMany({
    where: { job: { createdById: recruiterId } },
    select: { candidate: { select: { skills: true } } },
    distinct: ["candidateId"],
  });

  const skillCounts = new Map<string, number>();
  for (const app of applications) {
    for (const skill of app.candidate.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
    }
  }

  return Array.from(skillCounts.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
