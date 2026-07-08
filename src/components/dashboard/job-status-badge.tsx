import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@prisma/client";

const statusConfig: Record<JobStatus, { label: string; variant: "secondary" | "success" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PUBLISHED: { label: "Published", variant: "success" },
  CLOSED: { label: "Closed", variant: "outline" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
