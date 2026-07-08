import { CandidatesPerJobChart } from "@/components/dashboard/candidates-per-job-chart";
import { getCandidatesPerJob } from "@/services/dashboard.service";

export async function DashboardCandidatesChart({ recruiterId }: { recruiterId: string }) {
  const data = await getCandidatesPerJob(recruiterId);
  return <CandidatesPerJobChart data={data} />;
}
