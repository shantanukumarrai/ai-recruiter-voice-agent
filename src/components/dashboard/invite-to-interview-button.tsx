"use client";

import { useState, useTransition } from "react";
import { Mail, Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendInterviewInviteAction } from "@/actions/interview-invite.actions";
import type { Interview } from "@prisma/client";

export function InviteToInterviewButton({
  applicationId,
  candidateId,
  interview,
  disabled,
}: {
  applicationId: string;
  candidateId: string;
  interview: Interview | null;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleClick() {
    startTransition(async () => {
      const result = await sendInterviewInviteAction(applicationId, candidateId);
      if (!result.success && result.error) {
        alert(result.error);
      }
    });
  }

  function copyLink() {
    if (!interview) return;
    const url = `${window.location.origin}/interview/${interview.accessToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const alreadyInvited = !!interview;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        {alreadyInvited && (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Invited
          </span>
        )}
        <Button
          variant={alreadyInvited ? "outline" : "default"}
          size="sm"
          disabled={disabled || isPending}
          onClick={handleClick}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {isPending ? "Sending..." : alreadyInvited ? "Resend Invite" : "Send Interview Invite"}
        </Button>
      </div>
      {alreadyInvited && (
        <button
          onClick={copyLink}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy interview link"}
        </button>
      )}
    </div>
  );
}
