import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import type { Application, Candidate, Job } from "@prisma/client";

type ApplicationWithRelations = Application & { candidate: Candidate; job: Pick<Job, "id" | "title"> };

export function CandidatesList({ applications }: { applications: ApplicationWithRelations[] }) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No candidates yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload a resume to add your first candidate — AI will parse their details automatically.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/candidates/new">
              <Plus className="h-4 w-4" /> Add Candidate
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const isPlaceholder = app.candidate.email.endsWith("@resume.pending");
        return (
          <Card key={app.id}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/candidates/${app.candidateId}`} className="font-medium hover:underline">
                    {app.candidate.name}
                  </Link>
                  <ApplicationStatusBadge status={app.status} />
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {isPlaceholder ? "Parsing in progress..." : app.candidate.email} · Applied to {app.job.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(app.createdAt, { addSuffix: true })}
                </p>
              </div>
              {app.candidate.skills.length > 0 && (
                <div className="hidden max-w-xs flex-wrap justify-end gap-1 sm:flex">
                  {app.candidate.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function CandidatesListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between p-5">
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
