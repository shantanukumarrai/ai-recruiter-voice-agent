import { z } from "zod";

export const resumeScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillMatch: z.number().min(0).max(100),
  experienceMatch: z.number().min(0).max(100),
  educationMatch: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1).max(8),
  weaknesses: z.array(z.string()).min(1).max(8),
});

export type ResumeScore = z.infer<typeof resumeScoreSchema>;
