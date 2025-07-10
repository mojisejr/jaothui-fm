import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/cron/(.*)',
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

  // For protected routes, check if user needs to complete profile
  const { userId } = await auth()
  if (userId) {
    try {
      const user = await currentUser()
      
      // Check if user has required profile fields
      const hasRequiredData = user && 
        user.firstName && 
        user.lastName && 
        user.phoneNumbers && 
        user.phoneNumbers.length > 0

      // If missing required data, redirect to profile completion
      if (!hasRequiredData) {
        const profileCompleteUrl = new URL('/profile/complete', req.url)
        return NextResponse.redirect(profileCompleteUrl)
      }
    } catch (error) {
      // If check fails, let the request proceed to avoid breaking the app
      console.error('Profile check failed in middleware:', error)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}