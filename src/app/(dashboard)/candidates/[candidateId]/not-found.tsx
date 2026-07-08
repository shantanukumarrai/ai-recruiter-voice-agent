import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CandidateNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Candidate not found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            They may not have applied to any of your jobs, or the link is incorrect.
          </p>
        </div>
        <Button asChild className="mt-2">
          <Link href="/candidates">Back to Candidates</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
