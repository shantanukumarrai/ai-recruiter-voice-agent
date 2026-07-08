import { recommendationLabels } from "@/validators/report.validator";
import type { Application, Candidate, Job, Message, Report, ResumeAnalysis } from "@prisma/client";

export function generateMarkdownReport(params: {
  application: Application & { candidate: Candidate; job: Job };
  report: Report;
  resumeAnalysis: ResumeAnalysis | null;
  transcript: Message[];
}): string {
  const { application, report, resumeAnalysis, transcript } = params;
  const { candidate, job } = application;

  const lines: string[] = [];

  lines.push(`# Interview Report — ${candidate.name}`);
  lines.push("");
  lines.push(`**Role:** ${job.title}  `);
  lines.push(`**Generated:** ${new Date().toLocaleDateString()}`);
  lines.push("");
  lines.push("## Hiring Recommendation");
  lines.push("");
  lines.push(`**${recommendationLabels[report.recommendation]}** — Overall Rating: ${Math.round(report.overallRating)}/100`);
  lines.push("");
  lines.push("## Evaluation Scores");
  lines.push("");
  lines.push("| Metric | Score |");
  lines.push("|---|---|");
  lines.push(`| Communication | ${Math.round(report.communication)}/100 |`);
  lines.push(`| Confidence | ${Math.round(report.confidence)}/100 |`);
  lines.push(`| Problem Solving | ${Math.round(report.problemSolving)}/100 |`);
  lines.push(`| Technical Skill | ${Math.round(report.technicalSkill)}/100 |`);
  lines.push(`| Behavior | ${Math.round(report.behavior)}/100 |`);
  lines.push(`| Leadership | ${Math.round(report.leadership)}/100 |`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(report.summary);
  lines.push("");
  lines.push("## Strengths");
  lines.push("");
  report.strengths.forEach((s) => lines.push(`- ${s}`));
  lines.push("");
  lines.push("## Weaknesses");
  lines.push("");
  report.weaknesses.forEach((w) => lines.push(`- ${w}`));
  lines.push("");

  if (resumeAnalysis) {
    lines.push("## Resume Match (vs Job Description)");
    lines.push("");
    lines.push(
      `Overall Match: ${Math.round(resumeAnalysis.overallScore)}/100 · Skills: ${Math.round(resumeAnalysis.skillMatch)}% · Experience: ${Math.round(resumeAnalysis.experienceMatch)}% · Education: ${Math.round(resumeAnalysis.educationMatch)}%`
    );
    lines.push("");
  }

  lines.push("## Full Interview Transcript");
  lines.push("");
  transcript.forEach((m) => {
    lines.push(`**${m.sender === "AI" ? "Interviewer" : candidate.name}:** ${m.content}`);
    lines.push("");
  });

  return lines.join("\n");
}
