"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillsInput } from "@/components/dashboard/skills-input";
import { employmentTypeLabels, employmentTypeValues } from "@/validators/job.validator";
import type { JobActionState } from "@/actions/job.actions";
import type { Job } from "@prisma/client";

const initialState: JobActionState = { success: false };

interface JobFormProps {
  action: (state: JobActionState, formData: FormData) => Promise<JobActionState>;
  defaultValues?: Partial<Job>;
  submitLabel: string;
}

export function JobForm({ action, defaultValues, submitLabel }: JobFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.formError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Senior Backend Engineer"
          defaultValue={defaultValues?.title}
          aria-invalid={!!state.errors?.title}
        />
        {state.errors?.title && <p className="text-xs text-destructive">{state.errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={8}
          placeholder="Describe the role, responsibilities, and what a great candidate looks like..."
          defaultValue={defaultValues?.description}
          aria-invalid={!!state.errors?.description}
        />
        {state.errors?.description && (
          <p className="text-xs text-destructive">{state.errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experience">Experience Required</Label>
          <Input
            id="experience"
            name="experience"
            placeholder="e.g. 3-5 years"
            defaultValue={defaultValues?.experience}
            aria-invalid={!!state.errors?.experience}
          />
          {state.errors?.experience && (
            <p className="text-xs text-destructive">{state.errors.experience}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Bengaluru, India / Remote"
            defaultValue={defaultValues?.location}
            aria-invalid={!!state.errors?.location}
          />
          {state.errors?.location && <p className="text-xs text-destructive">{state.errors.location}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMin">Salary Min (annual, optional)</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            min={0}
            placeholder="e.g. 1200000"
            defaultValue={defaultValues?.salaryMin ?? undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryMax">Salary Max (annual, optional)</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            min={0}
            placeholder="e.g. 1800000"
            defaultValue={defaultValues?.salaryMax ?? undefined}
            aria-invalid={!!state.errors?.salaryMax}
          />
          {state.errors?.salaryMax && (
            <p className="text-xs text-destructive">{state.errors.salaryMax}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select name="employmentType" defaultValue={defaultValues?.employmentType ?? "FULL_TIME"}>
            <SelectTrigger id="employmentType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypeValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {employmentTypeLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Radix Select doesn't submit a native form value on its own in all
              browsers reliably without this hidden mirror; kept simple by
              relying on the `name` prop above, which Radix's Select does
              forward via a hidden input when uncontrolled. */}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <SkillsInput name="skills" defaultValue={defaultValues?.skills ?? []} error={state.errors?.skills as string | undefined} />
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}
