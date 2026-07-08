import { TopSkillsChart } from "@/components/dashboard/top-skills-chart";
import { getTopSkills } from "@/services/analytics.service";

export async function TopSkillsSection({ recruiterId }: { recruiterId: string }) {
  const skills = await getTopSkills(recruiterId);
  return <TopSkillsChart skills={skills} />;
}
