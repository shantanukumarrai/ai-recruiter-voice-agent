"use client";

import { useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Rocket, Ban, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  closeJobAction,
  deleteJobAction,
  publishJobAction,
  unpublishToDraftAction,
} from "@/actions/job.actions";
import type { JobStatus } from "@prisma/client";

export function JobActionsMenu({ jobId, status }: { jobId: string; status: JobStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this job permanently? This also removes its applications and interview data. This can't be undone."
    );
    if (!confirmed) return;
    startTransition(() => deleteJobAction(jobId));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label="Job actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/jobs/${jobId}/edit`} className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>

        {status === "DRAFT" && (
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => startTransition(() => publishJobAction(jobId))}
          >
            <Rocket className="h-4 w-4" /> Publish
          </DropdownMenuItem>
        )}

        {status === "PUBLISHED" && (
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => startTransition(() => closeJobAction(jobId))}
          >
            <Ban className="h-4 w-4" /> Close
          </DropdownMenuItem>
        )}

        {status === "CLOSED" && (
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => startTransition(() => unpublishToDraftAction(jobId))}
          >
            <RotateCcw className="h-4 w-4" /> Reopen as Draft
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive focus:text-destructive"
          onSelect={handleDelete}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
