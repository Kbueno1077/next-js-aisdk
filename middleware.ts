import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/ui/rag(.*)",
  "/api/rag(.*)",
  "/upload(.*)",
]);

const isAdminRoute = createRouteMatcher(["/upload(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // NOT WORKING
  // const sessionClaims = await auth();
  // const isAdmin = sessionClaims?.sessionClaims?.metadata?.role === "admin";

  if (isAdminRoute(req) && !process.env.IS_DEV_MODE) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
