import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InterviewRoom } from "@/components/interview/interview-room";

export default async function InterviewLandingPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = await params;

  const interview = await prisma.interview.findUnique({
    where: { accessToken },
    include: { application: { include: { candidate: true, job: true } } },
  });

  if (!interview) {
    notFound();
  }

  return (
    <InterviewRoom
      accessToken={accessToken}
      candidateFirstName={interview.application.candidate.name.split(" ")[0] ?? "there"}
      jobTitle={interview.application.job.title}
      alreadyCompleted={interview.status === "COMPLETED"}
    />
  );
}
