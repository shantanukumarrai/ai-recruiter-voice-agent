import { Card, CardContent } from "@/components/ui/card";
import { CandidateUploadForm } from "@/components/dashboard/candidate-upload-form";
import { getCurrentUser } from "@/lib/auth";
import { listJobsForRecruiter } from "@/services/job.service";

export default async function NewCandidatePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const jobs = await listJobsForRecruiter(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Candidate</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a resume — AI will extract their details automatically.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <CandidateUploadForm jobs={jobs} />
        </CardContent>
      </Card>
    </div>
  );
}
