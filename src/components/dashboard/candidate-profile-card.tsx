"use client";

import { useTransition } from "react";
import { RefreshCw, Mail, Phone, GraduationCap, Briefcase, Code2, Trophy } from "lucide-react";
import { ScoreBadge } from "@/components/dashboard/score-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reparseResumeAction } from "@/actions/candidate.actions";
import { scoreApplicationAction } from "@/actions/resume-analysis.actions";
import type { Candidate, ResumeAnalysis } from "@prisma/client";

interface ParsedExperience {
  company: string;
  title: string;
  duration: string;
  description?: string;
}
interface ParsedEducation {
  institution: string;
  degree: string;
  field?: string;
  year?: string;
}
interface ParsedProject {
  name: string;
  description?: string;
  techStack?: string[];
}

export function CandidateProfileCard({
  candidate,
  applicationId,
  jobId,
  resumeAnalysis,
}: {
  candidate: Candidate;
  applicationId: string;
  jobId: string;
  resumeAnalysis: ResumeAnalysis | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [isScoring, startScoring] = useTransition();
  const isPlaceholder = candidate.email.endsWith("@resume.pending");

  const experience = (candidate.experience as unknown as ParsedExperience[] | null) ?? [];
  const education = (candidate.education as unknown as ParsedEducation[] | null) ?? [];
  const projects = (candidate.projects as unknown as ParsedProject[] | null) ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">{candidate.name}</CardTitle>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {!isPlaceholder && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {candidate.email}
                </span>
              )}
              {candidate.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {candidate.phone}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => reparseResumeAction(applicationId))}
          >
            <RefreshCw className={isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            {isPending ? "Re-parsing..." : "Re-parse with AI"}
          </Button>
        </CardHeader>
        {isPlaceholder && (
          <CardContent className="pt-0">
            <p className="text-sm text-warning">
              AI parsing hasn&apos;t completed for this resume yet. Click &quot;Re-parse with AI&quot; to try again.
            </p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Trophy className="h-4 w-4" /> AI Match Score
          </CardTitle>
          <Button
            variant={resumeAnalysis ? "outline" : "default"}
            size="sm"
            disabled={isScoring || isPlaceholder}
            onClick={() =>
              startScoring(async () => {
                const result = await scoreApplicationAction(applicationId, jobId);
                if (!result.success && result.error) alert(result.error);
              })
            }
          >
            {isScoring && <RefreshCw className="h-4 w-4 animate-spin" />}
            {isScoring ? "Scoring..." : resumeAnalysis ? "Re-score" : "Score with AI"}
          </Button>
        </CardHeader>
        {resumeAnalysis ? (
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <ScoreBadge score={resumeAnalysis.overallScore} />
              <div>
                <p className="font-medium">Overall Match</p>
                <p className="text-xs text-muted-foreground">
                  Skills {Math.round(resumeAnalysis.skillMatch)}% · Experience{" "}
                  {Math.round(resumeAnalysis.experienceMatch)}% · Education{" "}
                  {Math.round(resumeAnalysis.educationMatch)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Strengths
                </p>
                <ul className="space-y-1 text-sm">
                  {resumeAnalysis.strengths.map((s, i) => (
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
                  {resumeAnalysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-destructive">
                      − {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Not scored yet against this job. Click &quot;Score with AI&quot; to compare this resume
              against the job description.
            </p>
          </CardContent>
        )}
      </Card>

      {candidate.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Code2 className="h-4 w-4" /> Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Briefcase className="h-4 w-4" /> Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-border pl-4">
                <p className="font-medium">
                  {exp.title} · {exp.company}
                </p>
                <p className="text-xs text-muted-foreground">{exp.duration}</p>
                {exp.description && <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <GraduationCap className="h-4 w-4" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {education.map((edu, i) => (
              <div key={i}>
                <p className="font-medium">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p>
                <p className="text-xs text-muted-foreground">
                  {edu.institution} {edu.year ? `· ${edu.year}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project, i) => (
              <div key={i}>
                <p className="font-medium">{project.name}</p>
                {project.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                )}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
