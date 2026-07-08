"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FileCheck2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing-components";
import { createCandidateFromUploadAction, type UploadCandidateState } from "@/actions/candidate.actions";
import type { Job } from "@prisma/client";

const initialState: UploadCandidateState = { success: false };

export function CandidateUploadForm({ jobs }: { jobs: Job[] }) {
  const [state, formAction] = useActionState(createCandidateFromUploadAction, initialState);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [uploaded, setUploaded] = useState<{ url: string; name: string } | null>(null);

  return (
    <form action={formAction} className="space-y-6">
      {state.formError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.formError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="jobId">Job</Label>
        <Select name="jobId" value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger id="jobId">
            <SelectValue placeholder="Select which job this candidate is applying for" />
          </SelectTrigger>
          <SelectContent>
            {jobs.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                Create a job first before adding candidates.
              </div>
            ) : (
              jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Resume (PDF or DOCX)</Label>
        {uploaded ? (
          <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            <FileCheck2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{uploaded.name} uploaded</span>
          </div>
        ) : (
          <UploadDropzone
            endpoint="resumeUploader"
            onClientUploadComplete={(res) => {
              const file = res?.[0];
              if (file) setUploaded({ url: file.url, name: file.name });
            }}
            onUploadError={(error) => {
              alert(`Upload failed: ${error.message}`);
            }}
            className="rounded-lg border-dashed border-input ut-label:text-sm ut-allowed-content:text-xs ut-button:bg-primary ut-button:text-primary-foreground"
          />
        )}
      </div>

      <input type="hidden" name="resumeUrl" value={uploaded?.url ?? ""} />
      <input type="hidden" name="resumeFileName" value={uploaded?.name ?? ""} />

      <SubmitButton disabled={!uploaded || !selectedJobId} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Parsing resume with AI..." : "Add Candidate"}
    </Button>
  );
}
