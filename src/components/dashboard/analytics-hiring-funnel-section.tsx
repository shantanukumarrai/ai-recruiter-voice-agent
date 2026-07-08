import { HiringFunnelChart } from "@/components/dashboard/hiring-funnel-chart";
import { getHiringFunnel } from "@/services/analytics.service";

export async function HiringFunnelSection({ recruiterId }: { recruiterId: string }) {
  const { stages, rejected } = await getHiringFunnel(recruiterId);
  return <HiringFunnelChart stages={stages} rejected={rejected} />;
}
