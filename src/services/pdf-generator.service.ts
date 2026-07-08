import PDFDocument from "pdfkit";
import { recommendationLabels } from "@/validators/report.validator";
import type { Recommendation } from "@prisma/client";

export interface InterviewReportPdfData {
  candidateName: string;
  jobTitle: string;
  generatedDate: string;
  overallRating: number;
  recommendation: Recommendation;
  communication: number;
  confidence: number;
  problemSolving: number;
  technicalSkill: number;
  behavior: number;
  leadership: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

function colorForScore(score: number): string {
  if (score >= 75) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function drawMetricBar(doc: PDFKit.PDFDocument, label: string, value: number, y: number) {
  const barX = 160;
  const barWidth = 260;
  const barHeight = 8;
  const pct = Math.max(0, Math.min(100, value));

  doc.fontSize(10).fillColor("#1f2937").text(label, 40, y, { width: 110 });
  doc.text(String(Math.round(pct)), barX - 30, y, { width: 25, align: "right" });

  doc.roundedRect(barX, y + 1, barWidth, barHeight, 4).fill("#e5e7eb");
  if (pct > 0) {
    doc.roundedRect(barX, y + 1, (pct / 100) * barWidth, barHeight, 4).fill(colorForScore(value));
  }
}

/**
 * Renders the interview report as a PDF using pdfkit's imperative drawing
 * API. This avoids @react-pdf/renderer's React-reconciler entirely, which
 * proved unreliable inside Next.js Server Actions.
 */
export function generateInterviewReportPdfBuffer(data: InterviewReportPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).fillColor("#111827").text(`Interview Report — ${data.candidateName}`);
    doc
      .fontSize(11)
      .fillColor("#6b7280")
      .text(`${data.jobTitle} · Generated ${data.generatedDate}`);
    doc.moveDown(1);

    // Recommendation box
    const boxY = doc.y;
    doc.roundedRect(40, boxY, 515, 60, 6).fill("#f3f4f6");
    doc
      .fontSize(28)
      .fillColor("#111827")
      .text(String(Math.round(data.overallRating)), 56, boxY + 12);
    doc.fontSize(9).fillColor("#6b7280").text("Overall Rating", 56, boxY + 42);
    doc
      .fontSize(14)
      .fillColor(colorForScore(data.overallRating))
      .text(recommendationLabels[data.recommendation], 40, boxY + 22, { width: 495, align: "right" });
    doc.y = boxY + 60 + 16;

    // Evaluation scores
    doc.fontSize(13).fillColor("#111827").text("Evaluation Scores", 40, doc.y);
    doc.moveDown(0.5);
    let y = doc.y;
    const metrics: [string, number][] = [
      ["Communication", data.communication],
      ["Confidence", data.confidence],
      ["Problem Solving", data.problemSolving],
      ["Technical Skill", data.technicalSkill],
      ["Behavior", data.behavior],
      ["Leadership", data.leadership],
    ];
    for (const [label, value] of metrics) {
      drawMetricBar(doc, label, value, y);
      y += 22;
    }
    doc.y = y + 10;

    // Summary
    doc.fontSize(13).fillColor("#111827").text("Summary", 40, doc.y);
    doc.moveDown(0.4);
    doc.fontSize(10.5).fillColor("#374151").text(data.summary, 40, doc.y, { width: 515, lineGap: 3 });
    doc.moveDown(1);

    // Strengths
    doc.fontSize(13).fillColor("#111827").text("Strengths", 40, doc.y);
    doc.moveDown(0.3);
    data.strengths.forEach((s) => {
      doc.fontSize(10.5).fillColor("#16a34a").text(`+ ${s}`, 40, doc.y, { width: 515, lineGap: 2 });
    });
    doc.moveDown(0.7);

    // Weaknesses
    doc.fontSize(13).fillColor("#111827").text("Weaknesses", 40, doc.y);
    doc.moveDown(0.3);
    data.weaknesses.forEach((w) => {
      doc.fontSize(10.5).fillColor("#dc2626").text(`− ${w}`, 40, doc.y, { width: 515, lineGap: 2 });
    });

    doc.end();
  });
}
