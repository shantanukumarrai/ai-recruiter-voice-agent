import { Users, Briefcase, UserSquare2, FileText, MessageSquareText, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getPlatformStats } from "@/services/admin.service";

export default async function AdminOverviewPage() {
  const stats = await getPlatformStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total Recruiters" value={stats.totalRecruiters} icon={Users} />
      <StatCard label="Total Jobs" value={stats.totalJobs} icon={Briefcase} />
      <StatCard label="Total Candidates" value={stats.totalCandidates} icon={UserSquare2} />
      <StatCard label="Total Applications" value={stats.totalApplications} icon={FileText} />
      <StatCard label="Total Interviews" value={stats.totalInterviews} icon={MessageSquareText} />
      <StatCard
        label="Completed Interviews"
        value={stats.completedInterviews}
        icon={CheckCircle2}
        accentClassName="bg-success/10 text-success"
      />
    </div>
  );
}
