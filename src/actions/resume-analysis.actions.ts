"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { scoreAndRankApplication } from "@/services/resume-analysis.service";

export interface ScoreActionState {
  success: boolean;
  error?: string;
}

export async function scoreApplicationAction(
  applicationId: string,
  jobId: string
): Promise<ScoreActionState> {
  const user = await requireCurrentUser();
  try {
    await scoreAndRankApplication(applicationId, user.id);
  } catch (err) {
    if (err instanceof Error && err.message === "RESUME_NOT_PARSED_YET") {
      return { success: false, error: "This resume hasn't finished AI parsing yet. Try re-parsing it first." };
    }
    return { success: false, error: "Scoring failed. Please try again." };
  }
  revalidatePath(`/jobs/${jobId}/candidates`);
  revalidatePath(`/candidates`);
  return { success: true };
}
