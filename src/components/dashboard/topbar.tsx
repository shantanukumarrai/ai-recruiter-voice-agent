import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { getUnreadNotifications } from "@/services/notification.service";

export async function Topbar({ userId }: { userId: string }) {
  const notifications = await getUnreadNotifications(userId);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-sm text-muted-foreground sm:flex">
        <Search className="h-4 w-4" />
        <span>Search jobs, candidates...</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell notifications={notifications} />
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
        />
      </div>
    </header>
  );
}
