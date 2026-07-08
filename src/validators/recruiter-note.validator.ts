import { z } from "zod";

export const recruiterNoteSchema = z.object({
  content: z.string().trim().min(1, "Note can't be empty").max(2000, "Keep notes under 2000 characters"),
});

export type RecruiterNoteValues = z.infer<typeof recruiterNoteSchema>;
