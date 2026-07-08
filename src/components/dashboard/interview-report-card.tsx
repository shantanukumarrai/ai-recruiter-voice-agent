"use client";

import { useTransition } from "react";
import { ClipboardCheck, RefreshCw, FileDown, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricBar } from "@/components/dashboard/metric-bar";
import { RecommendationBadge } from "@/components/dashboard/recommendation-badge";
import { evaluateInterviewAction } from "@/actions/interview-evaluation.actions";
import { generateReportAction } from "@/actions/interview-report.actions";
import type { Report } from "@prisma/client";

export function InterviewReportCard({
  report,
  interviewId,
  candidateId,
  interviewCompleted,
}: {
  report: Report | null;
  interviewId: string;
  candidateId: string;
  interviewCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  function handleEvaluate() {
    startTransition(async () => {
      const result = await evaluateInterviewAction(interviewId, candidateId);
      if (!result.success && result.error) alert(result.error);
    });
  }

  function handleGenerateReport() {
    startGenerating(async () => {
      const result = await generateReportAction(interviewId, candidateId);
      if (!result.success && result.error) alert(result.error);
    });
  }

  if (!interviewCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ClipboardCheck className="h-4 w-4" /> Interview Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This candidate hasn&apos;t completed their AI voice interview yet. The evaluation will
            appear here automatically once they finish it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ClipboardCheck className="h-4 w-4" /> Interview Evaluation
        </CardTitle>
        <Button variant="outline" size="sm" disabled={isPending} onClick={handleEvaluate}>
          {isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
          {isPending ? "Evaluating..." : report ? "Re-evaluate" : "Evaluate Interview"}
        </Button>
      </CardHeader>

      {report ? (
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-semibold">{Math.round(report.overallRating)}</p>
              <p className="text-xs text-muted-foreground">Overall Rating</p>
            </div>
            <RecommendationBadge recommendation={report.recommendation} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetricBar label="Communication" value={report.communication} />
            <MetricBar label="Confidence" value={report.confidence} />
            <MetricBar label="Problem Solving" value={report.problemSolving} />
            <MetricBar label="Technical Skill" value={report.technicalSkill} />
            <MetricBar label="Behavior" value={report.behavior} />
            <MetricBar label="Leadership" value={report.leadership} />
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Summary
            </p>
            <p className="text-sm text-muted-foreground">{report.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Strengths
              </p>
              <ul className="space-y-1 text-sm">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-success">
                    + {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Weaknesses
              </p>
              <ul className="space-y-1 text-sm">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="text-destructive">
                    − {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            {report.pdfUrl && report.markdownUrl ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileDown className="h-4 w-4" /> Download PDF
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={report.markdownUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" /> Download Markdown
                  </a>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" disabled={isGenerating} onClick={handleGenerateReport}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {isGenerating ? "Generating report..." : "Generate PDF & Markdown Report"}
              </Button>
            )}
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Evaluation hasn&apos;t run yet or is still in progress. Click &quot;Evaluate Interview&quot;
            to generate it.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
