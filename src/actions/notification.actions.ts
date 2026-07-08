"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireCurrentUser();
  await markNotificationRead(notificationId, user.id);
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  const user = await requireCurrentUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/dashboard");
}
