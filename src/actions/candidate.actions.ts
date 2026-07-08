"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { createCandidatePlaceholder, saveParsedResumeData, getApplicationForRecruiter } from "@/services/candidate.service";
import { parseResumeFromUrl } from "@/services/resume-parsing.service";
import { candidateApplicationSchema } from "@/validators/candidate.validator";

export interface UploadCandidateState {
  success: boolean;
  formError?: string;
}

export async function createCandidateFromUploadAction(
  _prevState: UploadCandidateState,
  formData: FormData
): Promise<UploadCandidateState> {
  const user = await requireCurrentUser();

  const parsed = candidateApplicationSchema.safeParse({
    jobId: formData.get("jobId"),
    resumeUrl: formData.get("resumeUrl"),
    resumeFileName: formData.get("resumeFileName"),
  });

  if (!parsed.success) {
    return { success: false, formError: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  let applicationId: string;
  let candidateId: string;

  try {
    const { candidate, application } = await createCandidatePlaceholder({
      jobId: parsed.data.jobId,
      recruiterId: user.id,
      resumeUrl: parsed.data.resumeUrl,
    });
    candidateId = candidate.id;
    applicationId = application.id;
  } catch {
    return { success: false, formError: "Could not link this resume to the selected job." };
  }

  // Parse synchronously so the recruiter lands on a fully-populated profile.
  // If AI parsing fails, the candidate record still exists as a placeholder
  // that can be retried from the detail page — we never lose the upload.
  try {
    const { extraction, resumeText } = await parseResumeFromUrl(
      parsed.data.resumeUrl,
      parsed.data.resumeFileName
    );
    const finalCandidateId = await saveParsedResumeData(candidateId, applicationId, extraction, resumeText);
    revalidatePath("/candidates");
    redirect(`/candidates/${finalCandidateId}`);
  } catch (err) {
    // redirect() throws internally in Next — rethrow so it isn't swallowed here.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    revalidatePath("/candidates");
    redirect(`/candidates/${candidateId}?parseError=1`);
  }
}

export async function reparseResumeAction(applicationId: string) {
  const user = await requireCurrentUser();
  const application = await getApplicationForRecruiter(applicationId, user.id);
  if (!application) {
    throw new Error("Application not found or you don't have access to it.");
  }

  const { extraction, resumeText } = await parseResumeFromUrl(
    application.candidate.resumeUrl,
    application.candidate.resumeUrl.split("/").pop() ?? "resume.pdf"
  );
  await saveParsedResumeData(application.candidateId, application.id, extraction, resumeText);
  revalidatePath(`/candidates/${application.candidateId}`);
}
