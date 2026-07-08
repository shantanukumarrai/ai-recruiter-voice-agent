import { render } from "@react-email/render";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import InterviewInvitationEmail from "@/emails/interview-invitation";
import { employmentTypeLabels } from "@/validators/job.validator";

export async function sendInterviewInvitation(applicationId: string, recruiterId: string) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { createdById: recruiterId } },
    include: { candidate: true, job: { include: { createdBy: true } } },
  });
  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND_OR_FORBIDDEN");
  }
  if (application.candidate.email.endsWith("@resume.pending")) {
    throw new Error("CANDIDATE_EMAIL_NOT_PARSED_YET");
  }

  // Reuse an existing interview if one was already created for this
  // application (e.g. a recruiter re-sending the invite), otherwise create
  // one — `accessToken` defaults via Prisma's @default(cuid()) and is what
  // the candidate-facing /interview/[accessToken] route will look up.
  const interview = await prisma.interview.upsert({
    where: { applicationId: application.id },
    create: { applicationId: application.id, status: "SCHEDULED", scheduledAt: new Date() },
    update: { status: "SCHEDULED", scheduledAt: new Date() },
  });

  const interviewUrl = `${env.NEXT_PUBLIC_APP_URL}/interview/${interview.accessToken}`;
  const recruiterName =
    [application.job.createdBy.firstName, application.job.createdBy.lastName].filter(Boolean).join(" ") ||
    application.job.createdBy.email;

  const emailHtml = await render(
    InterviewInvitationEmail({
      candidateName: application.candidate.name,
      jobTitle: application.job.title,
      companyName: application.job.createdBy.companyName ?? "",
      recruiterName,
      interviewUrl,
      location: application.job.location,
      employmentTypeLabel: employmentTypeLabels[application.job.employmentType],
    })
  );

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: application.candidate.email,
    subject: `Interview Invitation: ${application.job.title}`,
    html: emailHtml,
  });

  if (error) {
    // Resend's SDK returns { data: null, error } on failure instead of
    // throwing — surfacing it explicitly here is what makes this
    // catchable by the server action instead of silently "succeeding."
    throw new Error(`RESEND_SEND_FAILED: ${error.message}`);
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { status: "INVITED" },
  });

  await prisma.notification.create({
    data: {
      userId: recruiterId,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview invite sent",
      message: `${application.candidate.name} was invited to interview for ${application.job.title}.`,
      link: `/candidates/${application.candidateId}`,
    },
  });

  return interview;
}
