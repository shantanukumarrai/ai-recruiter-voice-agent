import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { JobForm } from "@/components/dashboard/job-form";
import { updateJobAction } from "@/actions/job.actions";
import { getCurrentUser } from "@/lib/auth";
import { getJobForRecruiter } from "@/services/job.service";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const job = await getJobForRecruiter(jobId, user.id);
  if (!job) {
    notFound();
  }

  const updateWithId = updateJobAction.bind(null, job.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Job</h1>
        <p className="mt-1 text-muted-foreground">{job.title}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <JobForm action={updateWithId} defaultValues={job} submitLabel="Save Changes" />
        </CardContent>
      </Card>
    </div>
  );
}
