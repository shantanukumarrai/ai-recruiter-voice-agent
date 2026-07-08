import { Badge } from "@/components/ui/badge";
import type { InterviewStatus } from "@prisma/client";

const config: Record<InterviewStatus, { label: string; variant: "secondary" | "warning" | "success" | "destructive" | "outline" }> = {
  SCHEDULED: { label: "Scheduled", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  EXPIRED: { label: "Expired", variant: "outline" },
};

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
