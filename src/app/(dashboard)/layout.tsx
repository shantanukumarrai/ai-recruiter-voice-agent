import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already blocks unauthenticated requests, but we resolve the
  // internal User row here too — every dashboard page needs it, and this
  // is the single place that redirects if sync somehow failed.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userId={user.id} />
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
