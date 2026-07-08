import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { listAllRecruiters } from "@/services/admin.service";

export default async function AdminRecruitersPage() {
  const recruiters = await listAllRecruiters();

  if (recruiters.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No recruiters yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recruiters.map((recruiter) => {
        const name = [recruiter.firstName, recruiter.lastName].filter(Boolean).join(" ") || recruiter.email;
        return (
          <Card key={recruiter.id}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">{recruiter.email}</p>
                {recruiter.companyName && (
                  <p className="text-xs text-muted-foreground">{recruiter.companyName}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Joined {formatDistanceToNow(recruiter.createdAt, { addSuffix: true })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">{recruiter._count.jobs}</p>
                <p className="text-xs text-muted-foreground">jobs posted</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
