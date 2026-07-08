import { Suspense } from "react";
import { InterviewsList, InterviewsListSkeleton } from "@/components/dashboard/interviews-list";
import { getCurrentUser } from "@/lib/auth";
import { listInterviewsForRecruiter } from "@/services/interview-list.service";

export default async function InterviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Interviews</h1>
        <p className="mt-1 text-muted-foreground">Track every AI voice interview across your jobs.</p>
      </div>

      <Suspense fallback={<InterviewsListSkeleton />}>
        <InterviewsListContainer recruiterId={user.id} />
      </Suspense>
    </div>
  );
}

async function InterviewsListContainer({ recruiterId }: { recruiterId: string }) {
  const interviews = await listInterviewsForRecruiter(recruiterId);
  return <InterviewsList interviews={interviews} />;
}
