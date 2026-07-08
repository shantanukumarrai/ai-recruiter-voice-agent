import { Briefcase, Users, CalendarClock, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDashboardStats } from "@/services/dashboard.service";

export async function DashboardStatCards({ recruiterId }: { recruiterId: string }) {
  const stats = await getDashboardStats(recruiterId);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Jobs" value={stats.totalJobs} icon={Briefcase} />
      <StatCard label="Candidates" value={stats.totalCandidates} icon={Users} />
      <StatCard
        label="Scheduled Interviews"
        value={stats.scheduledInterviews}
        icon={CalendarClock}
        accentClassName="bg-warning/10 text-warning"
      />
      <StatCard
        label="Completed Interviews"
        value={stats.completedInterviews}
        icon={CheckCircle2}
        accentClassName="bg-success/10 text-success"
      />
    </div>
  );
}
