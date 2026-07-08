import { Badge } from "@/components/ui/badge";
import { recommendationLabels } from "@/validators/report.validator";
import type { Recommendation } from "@prisma/client";

const variantByRecommendation: Record<Recommendation, "success" | "secondary" | "warning" | "destructive"> = {
  STRONG_HIRE: "success",
  HIRE: "success",
  MAYBE: "warning",
  NO_HIRE: "destructive",
  STRONG_NO_HIRE: "destructive",
};

export function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Badge variant={variantByRecommendation[recommendation]}>
      {recommendationLabels[recommendation]}
    </Badge>
  );
}
