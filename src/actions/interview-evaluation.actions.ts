"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { evaluateInterviewForRecruiter } from "@/services/interview-evaluation.service";

export interface EvaluateActionState {
  success: boolean;
  error?: string;
}

export async function evaluateInterviewAction(
  interviewId: string,
  candidateId: string
): Promise<EvaluateActionState> {
  const user = await requireCurrentUser();
  try {
    await evaluateInterviewForRecruiter(interviewId, user.id);
  } catch (err) {
    console.error(err);
    return { success: false, error: "Evaluation failed. Please try again." };
  }
  revalidatePath(`/candidates/${candidateId}`);
  return { success: true };
}
