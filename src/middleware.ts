import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes: marketing pages, auth pages, the candidate-facing interview
// link (candidates never sign in — they access via a unique accessToken),
// and the Clerk webhook (authenticated via svix signature, not a session).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/interview/(.*)", // candidate voice-interview experience
  "/api/webhooks/(.*)",
  "/api/uploadthing(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Role check for /admin happens again server-side in the layout (defense
  // in depth) — middleware only blocks unauthenticated access here since
  // role isn't available on the JWT without a custom claim, which we set
  // up in Step "Admin Panel" later.
  if (isAdminRoute(req)) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
