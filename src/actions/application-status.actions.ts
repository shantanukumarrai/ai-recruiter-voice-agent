"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import {
  hireApplication,
  rejectApplication,
  revertApplicationStatus,
  shortlistApplication,
} from "@/services/application-status.service";

async function revalidateCandidatePages(candidateId: string) {
  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath("/candidates");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

export async function shortlistApplicationAction(applicationId: string, candidateId: string) {
  const user = await requireCurrentUser();
  await shortlistApplication(applicationId, user.id);
  await revalidateCandidatePages(candidateId);
}

export async function rejectApplicationAction(applicationId: string, candidateId: string) {
  const user = await requireCurrentUser();
  await rejectApplication(applicationId, user.id);
  await revalidateCandidatePages(candidateId);
}

export async function hireApplicationAction(applicationId: string, candidateId: string) {
  const user = await requireCurrentUser();
  await hireApplication(applicationId, user.id);
  await revalidateCandidatePages(candidateId);
}

export async function revertApplicationStatusAction(
  applicationId: string,
  candidateId: string,
  status: "APPLIED" | "INTERVIEW_COMPLETED"
) {
  const user = await requireCurrentUser();
  await revertApplicationStatus(applicationId, user.id, status);
  await revalidateCandidatePages(candidateId);
}
