import { clerkMiddleware } from '@clerk/nextjs/server'

// The empty clerkMiddleware simply validates and extracts tokens from headers/cookies,
// making auth() available in Next.js Server Components and API Routes.
// Route-specific protection is manually enforced inside /api/... handlers.
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
