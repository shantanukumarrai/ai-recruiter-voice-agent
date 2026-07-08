import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { getRecentActivity } from "@/services/dashboard.service";

export async function DashboardRecentActivity({ recruiterId }: { recruiterId: string }) {
  const items = await getRecentActivity(recruiterId);
  return <RecentActivityFeed items={items} />;
}
