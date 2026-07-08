import { Card, CardContent } from "@/components/ui/card";
import { JobForm } from "@/components/dashboard/job-form";
import { createJobAction } from "@/actions/job.actions";

export default function NewJobPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Job</h1>
        <p className="mt-1 text-muted-foreground">
          It starts as a draft — publish it when you&apos;re ready for candidates to apply.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <JobForm action={createJobAction} submitLabel="Create Job" />
        </CardContent>
      </Card>
    </div>
  );
}
