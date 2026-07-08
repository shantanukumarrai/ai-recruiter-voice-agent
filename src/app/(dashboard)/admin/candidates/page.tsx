import { Card, CardContent } from "@/components/ui/card";
import { UserSquare2 } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import { listAllCandidatesAdmin } from "@/services/admin.service";

export default async function AdminCandidatesPage() {
  const applications = await listAllCandidatesAdmin();

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserSquare2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No candidates on the platform yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const isPlaceholder = app.candidate.email.endsWith("@resume.pending");
        const recruiterName =
          [app.job.createdBy.firstName, app.job.createdBy.lastName].filter(Boolean).join(" ") ||
          app.job.createdBy.email;
        return (
          <Card key={app.candidateId}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <p className="font-medium">{app.candidate.name}</p>
                <ApplicationStatusBadge status={app.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPlaceholder ? "Parsing in progress..." : app.candidate.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Applied to {app.job.title} · Recruiter: {recruiterName}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
