import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidatesList, CandidatesListSkeleton } from "@/components/dashboard/candidates-list";
import { getCurrentUser } from "@/lib/auth";
import { listCandidatesForRecruiter } from "@/services/candidate.service";

export default async function CandidatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Candidates</h1>
          <p className="mt-1 text-muted-foreground">Everyone who has applied to your jobs.</p>
        </div>
        <Button asChild>
          <Link href="/candidates/new">
            <Plus className="h-4 w-4" /> Add Candidate
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CandidatesListSkeleton />}>
        <CandidatesListContainer recruiterId={user.id} />
      </Suspense>
    </div>
  );
}

async function CandidatesListContainer({ recruiterId }: { recruiterId: string }) {
  const applications = await listCandidatesForRecruiter(recruiterId);
  return <CandidatesList applications={applications} />;
}
