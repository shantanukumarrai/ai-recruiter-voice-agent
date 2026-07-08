export default function InterviewNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-xl font-semibold">Interview link not found</h1>
      <p className="max-w-sm text-muted-foreground">
        This link may be incorrect or the interview may have been removed. Please check the email
        again or contact the recruiter.
      </p>
    </div>
  );
}
