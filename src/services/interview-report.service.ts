import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing-server";
import { generateInterviewReportPdfBuffer } from "@/services/pdf-generator.service";
import { generateMarkdownReport } from "@/services/report-generator.service";

/**
 * Generates both the PDF and Markdown versions of the interview report,
 * uploads them via UploadThing, and saves the resulting URLs on the
 * Report row. Requires that AI evaluation has already run (Report exists).
 */
export async function generateInterviewReportFiles(interviewId: string, recruiterId: string) {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, application: { job: { createdById: recruiterId } } },
    include: {
      application: {
        include: { candidate: true, job: true, resumeAnalysis: true },
      },
      session: { include: { messages: { orderBy: { createdAt: "asc" } } } },
      report: true,
    },
  });

  if (!interview) throw new Error("INTERVIEW_NOT_FOUND_OR_FORBIDDEN");
  if (!interview.report) throw new Error("REPORT_NOT_EVALUATED_YET");

  const { report, application } = interview;
  const transcript = interview.session?.messages ?? [];

  const pdfBuffer = await generateInterviewReportPdfBuffer({
    candidateName: application.candidate.name,
    jobTitle: application.job.title,
    generatedDate: new Date().toLocaleDateString(),
    overallRating: report.overallRating,
    recommendation: report.recommendation,
    communication: report.communication,
    confidence: report.confidence,
    problemSolving: report.problemSolving,
    technicalSkill: report.technicalSkill,
    behavior: report.behavior,
    leadership: report.leadership,
    summary: report.summary,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
  });

  const markdown = generateMarkdownReport({
    application,
    report,
    resumeAnalysis: application.resumeAnalysis,
    transcript,
  });

  const safeSlug = application.candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const pdfFile = new File([new Uint8Array(pdfBuffer)], `interview-report-${safeSlug}.pdf`, {
    type: "application/pdf",
  });
  const markdownFile = new File([markdown], `interview-report-${safeSlug}.md`, {
    type: "text/markdown",
  });

  const [pdfUpload, markdownUpload] = await Promise.all([
    utapi.uploadFiles(pdfFile),
    utapi.uploadFiles(markdownFile),
  ]);

  if (pdfUpload.error || !pdfUpload.data) {
    throw new Error(`PDF upload failed: ${pdfUpload.error?.message ?? "unknown error"}`);
  }
  if (markdownUpload.error || !markdownUpload.data) {
    throw new Error(`Markdown upload failed: ${markdownUpload.error?.message ?? "unknown error"}`);
  }

  const updated = await prisma.report.update({
    where: { id: report.id },
    data: {
      pdfUrl: pdfUpload.data.url,
      markdownUrl: markdownUpload.data.url,
    },
  });

  return updated;
}
