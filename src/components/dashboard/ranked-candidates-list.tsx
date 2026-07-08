"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/dashboard/score-badge";
import { scoreApplicationAction } from "@/actions/resume-analysis.actions";
import type { Application, Candidate, ResumeAnalysis } from "@prisma/client";

type RankedApplication = Application & { candidate: Candidate; resumeAnalysis: ResumeAnalysis | null };

export function RankedCandidatesList({
  applications,
  jobId,
}: {
  applications: RankedApplication[];
  jobId: string;
}) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No applicants yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Once candidates apply to this job, you can rank them here with AI.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app, index) => (
        <RankedRow key={app.id} application={app} rank={index + 1} jobId={jobId} />
      ))}
    </div>
  );
}

function RankedRow({
  application,
  rank,
  jobId,
}: {
  application: RankedApplication;
  rank: number;
  jobId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isPlaceholder = application.candidate.email.endsWith("@resume.pending");

  function handleScore() {
    startTransition(async () => {
      const result = await scoreApplicationAction(application.id, jobId);
      if (!result.success && result.error) {
        alert(result.error);
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="w-6 shrink-0 text-center text-sm font-medium text-muted-foreground">
          #{rank}
        </span>

        {application.resumeAnalysis ? (
          <ScoreBadge score={application.resumeAnalysis.overallScore} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
            —
          </div>
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/candidates/${application.candidateId}`} className="font-medium hover:underline">
            {application.candidate.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">
            {isPlaceholder ? "Parsing in progress..." : application.candidate.email}
          </p>
          {application.resumeAnalysis && (
            <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
              <span>Skills {Math.round(application.resumeAnalysis.skillMatch)}%</span>
              <span>Experience {Math.round(application.resumeAnalysis.experienceMatch)}%</span>
              <span>Education {Math.round(application.resumeAnalysis.educationMatch)}%</span>
            </div>
          )}
        </div>

        <Button
          variant={application.resumeAnalysis ? "outline" : "default"}
          size="sm"
          disabled={isPending || isPlaceholder}
          onClick={handleScore}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {application.resumeAnalysis ? "Re-score" : "Score with AI"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function RankedCandidatesListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
