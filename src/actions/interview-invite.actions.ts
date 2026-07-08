"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { sendInterviewInvitation } from "@/services/interview-invite.service";

export interface InviteActionState {
  success: boolean;
  error?: string;
}

export async function sendInterviewInviteAction(
  applicationId: string,
  candidateId: string
): Promise<InviteActionState> {
  const user = await requireCurrentUser();

  try {
    await sendInterviewInvitation(applicationId, user.id);
  } catch (err) {
    if (err instanceof Error && err.message === "CANDIDATE_EMAIL_NOT_PARSED_YET") {
      return {
        success: false,
        error: "This candidate's email hasn't been extracted yet. Re-parse their resume first.",
      };
    }
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.startsWith("RESEND_SEND_FAILED")) {
      return { success: false, error: `Email provider rejected the send: ${message.replace("RESEND_SEND_FAILED: ", "")}` };
    }
    return { success: false, error: "Could not send the invitation email. Please try again." };
  }

  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath("/candidates");
  return { success: true };
}
