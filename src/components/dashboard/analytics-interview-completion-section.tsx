import { InterviewCompletionChart } from "@/components/dashboard/interview-completion-chart";
import { getInterviewCompletionStats } from "@/services/analytics.service";

export async function InterviewCompletionSection({ recruiterId }: { recruiterId: string }) {
  const stats = await getInterviewCompletionStats(recruiterId);
  return <InterviewCompletionChart stats={stats} />;
}
