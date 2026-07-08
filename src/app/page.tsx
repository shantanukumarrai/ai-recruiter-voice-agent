import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        AI Recruiter <span className="text-primary">Voice Agent</span>
      </h1>
      <p className="max-w-xl text-muted-foreground">
        Source, screen, and interview candidates end-to-end — with an AI
        voice interviewer that asks real follow-up questions.
      </p>
      <div className="flex gap-3">
        <Link
          href="/sign-up"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
