import { prisma } from "@/lib/prisma";

export async function listInterviewsForRecruiter(recruiterId: string) {
  return prisma.interview.findMany({
    where: { application: { job: { createdById: recruiterId } } },
    include: { application: { include: { candidate: true, job: true } } },
    orderBy: { createdAt: "desc" },
  });
}
