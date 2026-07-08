import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardCandidatesChart } from "@/components/dashboard/dashboard-candidates-chart";
import { CandidatesPerJobChartSkeleton } from "@/components/dashboard/candidates-per-job-chart";
import { InterviewCompletionSection } from "@/components/dashboard/analytics-interview-completion-section";
import { InterviewCompletionChartSkeleton } from "@/components/dashboard/interview-completion-chart";
import { HiringFunnelSection } from "@/components/dashboard/analytics-hiring-funnel-section";
import { HiringFunnelChartSkeleton } from "@/components/dashboard/hiring-funnel-chart";
import { TopSkillsSection } from "@/components/dashboard/analytics-top-skills-section";
import { TopSkillsChartSkeleton } from "@/components/dashboard/top-skills-chart";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          How your pipeline is performing across every job.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<CandidatesPerJobChartSkeleton />}>
          <DashboardCandidatesChart recruiterId={user.id} />
        </Suspense>

        <Suspense fallback={<InterviewCompletionChartSkeleton />}>
          <InterviewCompletionSection recruiterId={user.id} />
        </Suspense>

        <Suspense fallback={<HiringFunnelChartSkeleton />}>
          <HiringFunnelSection recruiterId={user.id} />
        </Suspense>

        <Suspense fallback={<TopSkillsChartSkeleton />}>
          <TopSkillsSection recruiterId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}
