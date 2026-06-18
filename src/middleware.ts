import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk runs on every route so the API handlers can read the signed-in user.
// Pages decide what to show via <SignedIn>/<SignedOut>; API routes enforce auth
// themselves (returning 401 when there's no user).
export default clerkMiddleware();

export const config = {
  matcher: [
    // skip Next internals and static files, run on everything else
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
