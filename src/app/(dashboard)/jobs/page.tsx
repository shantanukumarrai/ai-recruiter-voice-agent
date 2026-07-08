import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobsList, JobsListSkeleton } from "@/components/dashboard/jobs-list";
import { getCurrentUser } from "@/lib/auth";
import { listJobsForRecruiter } from "@/services/job.service";

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-1 text-muted-foreground">Manage your open roles and their pipelines.</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4" /> Create Job
          </Link>
        </Button>
      </div>

      <Suspense fallback={<JobsListSkeleton />}>
        <JobsListContainer recruiterId={user.id} />
      </Suspense>
    </div>
  );
}

async function JobsListContainer({ recruiterId }: { recruiterId: string }) {
  const jobs = await listJobsForRecruiter(recruiterId);
  return <JobsList jobs={jobs} />;
}
