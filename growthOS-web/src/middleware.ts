import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Landing page and auth pages are public; everything else (dashboard, API)
// requires authentication.
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files unless found in search params.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ico|woff2?|ttf|map)).*)',
    '/(api|trpc)(.*)',
  ],
}
