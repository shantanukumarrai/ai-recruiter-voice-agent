"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { jobFormSchema, type JobFormValues } from "@/validators/job.validator";
import {
  createJob,
  deleteJob,
  setJobStatus,
  updateJob,
} from "@/services/job.service";

export interface JobActionState {
  success: boolean;
  errors?: Partial<Record<keyof JobFormValues, string>>;
  formError?: string;
}

function parseSkills(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toJobFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    experience: formData.get("experience"),
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    skills: parseSkills(formData.get("skills")),
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
  };
}

export async function createJobAction(
  _prevState: JobActionState,
  formData: FormData
): Promise<JobActionState> {
  const user = await requireCurrentUser();

  const parsed = jobFormSchema.safeParse(toJobFormValues(formData));
  if (!parsed.success) {
    return { success: false, errors: flattenZodErrors(parsed.error) };
  }

  const job = await createJob(user.id, parsed.data);
  revalidatePath("/jobs");
  redirect(`/jobs/${job.id}/edit`);
}

export async function updateJobAction(
  jobId: string,
  _prevState: JobActionState,
  formData: FormData
): Promise<JobActionState> {
  const user = await requireCurrentUser();

  const parsed = jobFormSchema.safeParse(toJobFormValues(formData));
  if (!parsed.success) {
    return { success: false, errors: flattenZodErrors(parsed.error) };
  }

  const updated = await updateJob(jobId, user.id, parsed.data);
  if (!updated) {
    return { success: false, formError: "Job not found, or you don't have access to it." };
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}/edit`);
  return { success: true };
}

export async function publishJobAction(jobId: string) {
  const user = await requireCurrentUser();
  await setJobStatus(jobId, user.id, "PUBLISHED");
  revalidatePath("/jobs");
}

export async function closeJobAction(jobId: string) {
  const user = await requireCurrentUser();
  await setJobStatus(jobId, user.id, "CLOSED");
  revalidatePath("/jobs");
}

export async function unpublishToDraftAction(jobId: string) {
  const user = await requireCurrentUser();
  await setJobStatus(jobId, user.id, "DRAFT");
  revalidatePath("/jobs");
}

export async function deleteJobAction(jobId: string) {
  const user = await requireCurrentUser();
  await deleteJob(jobId, user.id);
  revalidatePath("/jobs");
}

function flattenZodErrors(error: import("zod").ZodError): Partial<Record<keyof JobFormValues, string>> {
  const out: Partial<Record<keyof JobFormValues, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof JobFormValues | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
