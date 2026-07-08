import { z } from "zod";

export const employmentTypeValues = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "REMOTE",
] as const;

export const employmentTypeLabels: Record<(typeof employmentTypeValues)[number], string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

export const jobFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must be under 120 characters"),
    description: z
      .string()
      .trim()
      .min(50, "Description should be at least 50 characters so candidates understand the role")
      .max(10_000, "Description is too long"),
    experience: z
      .string()
      .trim()
      .min(1, "Experience requirement is required")
      .max(100, "Keep this brief, e.g. '3-5 years'"),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    skills: z
      .array(z.string().trim().min(1))
      .min(1, "Add at least one skill")
      .max(30, "Keep it to 30 skills or fewer"),
    location: z.string().trim().min(2, "Location is required").max(120),
    employmentType: z.enum(employmentTypeValues),
  })
  .refine(
    (data) =>
      data.salaryMin === undefined ||
      data.salaryMax === undefined ||
      data.salaryMin <= data.salaryMax,
    {
      message: "Minimum salary must be less than or equal to maximum salary",
      path: ["salaryMax"],
    }
  );

export type JobFormValues = z.infer<typeof jobFormSchema>;
