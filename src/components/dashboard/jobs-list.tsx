import Link from "next/link";
import { Briefcase, Users, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { JobActionsMenu } from "@/components/dashboard/job-actions-menu";
import { employmentTypeLabels } from "@/validators/job.validator";
import { formatDistanceToNow } from "date-fns";
import type { Job } from "@prisma/client";

type JobWithCount = Job & { _count: { applications: number } };

export function JobsList({ jobs }: { jobs: JobWithCount[] }) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No jobs yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first job opening to start sourcing and screening candidates.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" /> Create Job
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/jobs/${job.id}/edit`} className="truncate font-medium hover:underline">
                  {job.title}
                </Link>
                <JobStatusBadge status={job.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.location} · {employmentTypeLabels[job.employmentType]} · {job.experience}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {formatDistanceToNow(job.createdAt, { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/jobs/${job.id}/candidates`}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                <Users className="h-4 w-4" />
                {job._count.applications}
              </Link>
              <JobActionsMenu jobId={job.id} status={job.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function JobsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
