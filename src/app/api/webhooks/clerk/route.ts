import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

/**
 * Clerk fires this on every user lifecycle event. We mirror the subset we
 * care about into our own `User` table so the rest of the schema (Job,
 * Notification, RecruiterNote, ...) can hold a normal foreign key instead
 * of a Clerk ID string everywhere.
 */
export async function POST(req: Request) {
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        return new Response("No primary email on user", { status: 400 });
      }

      await prisma.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          imageUrl: image_url ?? undefined,
        },
        update: {
          email: primaryEmail,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          imageUrl: image_url ?? undefined,
        },
      });
      break;
    }
    case "user.deleted": {
      const clerkId = event.data.id;
      if (clerkId) {
        await prisma.user.deleteMany({ where: { clerkId } });
      }
      break;
    }
    default:
      // Ignore session/org events for now.
      break;
  }

  return new Response("OK", { status: 200 });
}