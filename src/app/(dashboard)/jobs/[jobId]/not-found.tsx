import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function JobNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Job not found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            It may have been deleted, or it belongs to a different account.
          </p>
        </div>
        <Button asChild className="mt-2">
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
