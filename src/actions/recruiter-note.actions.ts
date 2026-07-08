"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { recruiterNoteSchema } from "@/validators/recruiter-note.validator";
import { createNote, deleteNote } from "@/services/recruiter-note.service";

export interface NoteActionState {
  success: boolean;
  error?: string;
}

export async function createNoteAction(
  applicationId: string,
  candidateId: string,
  _prevState: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const user = await requireCurrentUser();

  const parsed = recruiterNoteSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid note." };
  }

  try {
    await createNote(applicationId, user.id, parsed.data.content);
  } catch {
    return { success: false, error: "Could not save the note. Please try again." };
  }

  revalidatePath(`/candidates/${candidateId}`);
  return { success: true };
}

export async function deleteNoteAction(noteId: string, candidateId: string) {
  const user = await requireCurrentUser();
  await deleteNote(noteId, user.id);
  revalidatePath(`/candidates/${candidateId}`);
}
