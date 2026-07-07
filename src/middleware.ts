import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getAdminEmail,
  isClerkUserAdminByEmail,
} from "@/lib/admin-email";

const isPublicRoute = createRouteMatcher([
  "/",
  "/explore(.*)",
  "/search(.*)",
  "/prompts/(.*)",
  "/creators/(.*)",
  "/categories(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/tools/x-checker(.*)",
  "/api/buyer/social/x/callback(.*)",
  "/api/buyer/scrubber/x/callback(.*)",
  "/api/buyer/social-tools/facebook/callback(.*)",
  "/api/buyer/social-tools/instagram/callback(.*)",
  "/api/buyer/social-tools/linkedin/callback(.*)",
  "/api/webhooks(.*)",
  "/api/stripe/webhook",
  "/api/tool-preview(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isPublicRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  if (isAdminRoute(req) && userId && getAdminEmail()) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (isClerkUserAdminByEmail(user)) {
        requestHeaders.set("x-admin-access", "true");
      }
    } catch {
      // Fall through to layout-level admin checks when Clerk is unavailable.
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
