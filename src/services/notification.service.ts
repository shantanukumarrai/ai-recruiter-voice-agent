import { prisma } from "@/lib/prisma";

export async function getUnreadNotifications(userId: string, limit = 8) {
  return prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  // `userId` in the where-clause prevents one recruiter from marking
  // another recruiter's notification as read via a guessed ID.
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
