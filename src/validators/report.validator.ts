import { z } from "zod";

export const recommendationValues = [
  "STRONG_HIRE",
  "HIRE",
  "MAYBE",
  "NO_HIRE",
  "STRONG_NO_HIRE",
] as const;

export const recommendationLabels: Record<(typeof recommendationValues)[number], string> = {
  STRONG_HIRE: "Strong Hire",
  HIRE: "Hire",
  MAYBE: "Maybe",
  NO_HIRE: "No Hire",
  STRONG_NO_HIRE: "Strong No Hire",
};

export const interviewEvaluationSchema = z.object({
  communication: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
  technicalSkill: z.number().min(0).max(100),
  behavior: z.number().min(0).max(100),
  leadership: z.number().min(0).max(100),
  overallRating: z.number().min(0).max(100),
  recommendation: z.enum(recommendationValues),
  strengths: z.array(z.string()).min(1).max(8),
  weaknesses: z.array(z.string()).min(1).max(8),
  summary: z.string().min(20).max(2000),
});

export type InterviewEvaluation = z.infer<typeof interviewEvaluationSchema>;
