"use client";

import { useTransition } from "react";
import { ThumbsUp, ThumbsDown, Award, Undo2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import {
  hireApplicationAction,
  rejectApplicationAction,
  revertApplicationStatusAction,
  shortlistApplicationAction,
} from "@/actions/application-status.actions";
import type { ApplicationStatus } from "@prisma/client";

export function ApplicationStatusActions({
  applicationId,
  candidateId,
  status,
}: {
  applicationId: string;
  candidateId: string;
  status: ApplicationStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const isFinal = status === "SHORTLISTED" || status === "REJECTED" || status === "HIRED";
  const revertTo = status === "REJECTED" ? "APPLIED" : "INTERVIEW_COMPLETED";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ApplicationStatusBadge status={status} />

      {!isFinal ? (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => shortlistApplicationAction(applicationId, candidateId))}
          >
            <ThumbsUp className="h-4 w-4" /> Shortlist
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => rejectApplicationAction(applicationId, candidateId))}
          >
            <ThumbsDown className="h-4 w-4" /> Reject
          </Button>
        </>
      ) : status === "SHORTLISTED" ? (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => hireApplicationAction(applicationId, candidateId))}
          >
            <Award className="h-4 w-4" /> Mark as Hired
          </Button>
          <RevertButton
            isPending={isPending}
            onClick={() =>
              startTransition(() => revertApplicationStatusAction(applicationId, candidateId, revertTo))
            }
          />
        </>
      ) : (
        <RevertButton
          isPending={isPending}
          onClick={() =>
            startTransition(() => revertApplicationStatusAction(applicationId, candidateId, revertTo))
          }
        />
      )}

      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}

function RevertButton({ isPending, onClick }: { isPending: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={onClick}>
      <Undo2 className="h-4 w-4" /> Undo
    </Button>
  );
}
