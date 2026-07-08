import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { employmentTypeLabels } from "@/validators/job.validator";
import { listAllJobsAdmin } from "@/services/admin.service";

export default async function AdminJobsPage() {
  const jobs = await listAllJobsAdmin();

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No jobs posted on the platform yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const recruiterName =
          [job.createdBy.firstName, job.createdBy.lastName].filter(Boolean).join(" ") || job.createdBy.email;
        return (
          <Card key={job.id}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{job.title}</p>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.location} · {employmentTypeLabels[job.employmentType]} · Posted by {recruiterName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {job._count.applications}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
