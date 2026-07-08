import { z } from "zod";

export const parsedExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  duration: z.string().describe("e.g. 'Jan 2021 - Present' or '2 years'"),
  description: z.string().optional().default(""),
});

export const parsedEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional().default(""),
  year: z.string().optional().default(""),
});

export const parsedProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  techStack: z.array(z.string()).optional().default([]),
});

/** Shape we ask Gemini to return, and validate its output against. */
export const resumeExtractionSchema = z.object({
  name: z.string().describe("Full name of the candidate"),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  skills: z.array(z.string()).default([]),
  experience: z.array(parsedExperienceSchema).default([]),
  education: z.array(parsedEducationSchema).default([]),
  projects: z.array(parsedProjectSchema).default([]),
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;

export const candidateApplicationSchema = z.object({
  jobId: z.string().min(1, "Select a job"),
  resumeUrl: z.string().url("Upload a resume first"),
  resumeFileName: z.string().min(1),
});

export type CandidateApplicationValues = z.infer<typeof candidateApplicationSchema>;
