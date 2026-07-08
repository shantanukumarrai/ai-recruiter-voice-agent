"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { generateInterviewReportFiles } from "@/services/interview-report.service";

export interface GenerateReportActionState {
  success: boolean;
  error?: string;
}

export async function generateReportAction(
  interviewId: string,
  candidateId: string
): Promise<GenerateReportActionState> {
  const user = await requireCurrentUser();
  try {
    await generateInterviewReportFiles(interviewId, user.id);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "REPORT_NOT_EVALUATED_YET") {
      return { success: false, error: "Run the AI evaluation first, then generate the report." };
    }
    return { success: false, error: "Could not generate the report. Please try again." };
  }
  revalidatePath(`/candidates/${candidateId}`);
  return { success: true };
}
