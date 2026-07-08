import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RankedCandidatesList } from "@/components/dashboard/ranked-candidates-list";
import { getCurrentUser } from "@/lib/auth";
import { listRankedApplicationsForJob } from "@/services/resume-analysis.service";

export default async function JobCandidatesPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const applications = await listRankedApplicationsForJob(jobId, user.id);
  if (!applications) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/jobs"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Jobs
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Ranked Candidates</h1>
        <p className="mt-1 text-muted-foreground">
          Sorted by AI match score, best fit first. Unscored candidates appear at the bottom.
        </p>
      </div>

      <RankedCandidatesList applications={applications} jobId={jobId} />
    </div>
  );
}
