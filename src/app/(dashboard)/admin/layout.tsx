import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/recruiters", label: "Recruiters" },
  { href: "/admin/jobs", label: "All Jobs" },
  { href: "/admin/candidates", label: "All Candidates" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="font-medium">Admins only</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You don&apos;t have access to the admin panel. If you believe this is a mistake, contact
            your workspace owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="mt-1 text-muted-foreground">Platform-wide visibility across every recruiter.</p>
      </div>

      <nav className="flex gap-1 border-b border-border">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-t-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
