import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import { DashboardCandidatesChart } from "@/components/dashboard/dashboard-candidates-chart";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { StatCardSkeleton } from "@/components/dashboard/stat-card";
import { CandidatesPerJobChartSkeleton } from "@/components/dashboard/candidates-per-job-chart";
import { RecentActivityFeedSkeleton } from "@/components/dashboard/recent-activity-feed";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  // Layout already redirects if there's no user, so this is just for TS narrowing.
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{user.firstName ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening across your open roles.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStatCards recruiterId={user.id} />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<CandidatesPerJobChartSkeleton />}>
            <DashboardCandidatesChart recruiterId={user.id} />
          </Suspense>
        </div>
        <Suspense fallback={<RecentActivityFeedSkeleton />}>
          <DashboardRecentActivity recruiterId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}
