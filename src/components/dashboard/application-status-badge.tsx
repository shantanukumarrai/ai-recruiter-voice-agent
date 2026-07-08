import { Badge } from "@/components/ui/badge";
import { applicationStatusLabels } from "@/validators/application-status.validator";
import type { ApplicationStatus } from "@prisma/client";

const variantByStatus: Record<ApplicationStatus, "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  APPLIED: "secondary",
  SCREENING: "secondary",
  INVITED: "warning",
  INTERVIEW_SCHEDULED: "warning",
  INTERVIEW_COMPLETED: "outline",
  SHORTLISTED: "success",
  REJECTED: "destructive",
  HIRED: "success",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={variantByStatus[status]}>{applicationStatusLabels[status]}</Badge>;
}
