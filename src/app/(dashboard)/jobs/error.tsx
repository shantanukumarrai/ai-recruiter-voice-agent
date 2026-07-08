"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="font-medium">Something went wrong loading your jobs</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This has been logged. You can try again, or refresh the page.
          </p>
        </div>
        <Button onClick={reset} className="mt-2">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
