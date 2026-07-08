import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CandidateProfileCard } from "@/components/dashboard/candidate-profile-card";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { InviteToInterviewButton } from "@/components/dashboard/invite-to-interview-button";
import { InterviewReportCard } from "@/components/dashboard/interview-report-card";
import { RecruiterNotesCard } from "@/components/dashboard/recruiter-notes-card";
import { ApplicationStatusActions } from "@/components/dashboard/application-status-actions";
import { listNotesForApplication } from "@/services/recruiter-note.service";
import { getCurrentUser } from "@/lib/auth";
import { getApplicationByCandidateForRecruiter } from "@/services/candidate.service";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const application = await getApplicationByCandidateForRecruiter(candidateId, user.id);
  if (!application) {
    notFound();
  }

  const notes = await listNotesForApplication(application.id, user.id);

  const isPlaceholder = application.candidate.email.endsWith("@resume.pending");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/candidates"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Candidates
        </Link>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Candidate Profile</h1>
          <InviteToInterviewButton
            applicationId={application.id}
            candidateId={application.candidateId}
            interview={application.interview}
            disabled={isPlaceholder}
          />
        </div>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          Applied to{" "}
          <Link href={`/jobs/${application.job.id}/edit`} className="font-medium hover:underline">
            {application.job.title}
          </Link>
          <JobStatusBadge status={application.job.status} />
        </div>
        <div className="mt-3">
          <ApplicationStatusActions
            applicationId={application.id}
            candidateId={application.candidateId}
            status={application.status}
          />
        </div>
      </div>

      {application.interview && (
        <InterviewReportCard
          report={application.interview.report}
          interviewId={application.interview.id}
          candidateId={application.candidateId}
          interviewCompleted={application.interview.status === "COMPLETED"}
        />
      )}

      <CandidateProfileCard
        candidate={application.candidate}
        applicationId={application.id}
        jobId={application.jobId}
        resumeAnalysis={application.resumeAnalysis}
      />

      <RecruiterNotesCard
        applicationId={application.id}
        candidateId={application.candidateId}
        notes={notes}
        currentUserId={user.id}
      />
    </div>
  );
}
