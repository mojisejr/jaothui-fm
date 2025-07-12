import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/cron/(.*)',
  '/service-worker.js',
])

// Define profile completion and success routes
const isProfileCompletionRoute = createRouteMatcher([
  '/profile/complete',
  '/profile/success',
  '/api/profile/complete',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) return

  // Allow profile completion and success routes for authenticated users
  if (isProfileCompletionRoute(req)) {
    await auth.protect()
    return
  }

  // Protect all other routes
  await auth.protect()

  // For protected routes, let the route handlers handle profile checks
  // to avoid middleware complexity and potential auth issues
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}