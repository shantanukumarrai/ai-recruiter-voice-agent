import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { InterviewStatusBadge } from "@/components/dashboard/interview-status-badge";
import { formatDistanceToNow } from "date-fns";
import type { Application, Candidate, Interview, Job } from "@prisma/client";

type InterviewWithRelations = Interview & {
  application: Application & { candidate: Candidate; job: Job };
};

export function InterviewsList({ interviews }: { interviews: InterviewWithRelations[] }) {
  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MessageSquareText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No interviews yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Send an interview invite from a candidate&apos;s profile to see it show up here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {interviews.map((interview) => (
        <Card key={interview.id}>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/candidates/${interview.application.candidateId}`}
                className="font-medium hover:underline"
              >
                {interview.application.candidate.name}
              </Link>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {interview.application.job.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {interview.completedAt
                  ? `Completed ${formatDistanceToNow(interview.completedAt, { addSuffix: true })}`
                  : interview.startedAt
                    ? `Started ${formatDistanceToNow(interview.startedAt, { addSuffix: true })}`
                    : `Invited ${formatDistanceToNow(interview.createdAt, { addSuffix: true })}`}
              </p>
            </div>
            <InterviewStatusBadge status={interview.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function InterviewsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
