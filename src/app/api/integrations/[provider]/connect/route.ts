import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserId } from '@/lib/auth';
import { isProvider, buildAuthUrl, PROVIDERS } from '@/lib/integrations';

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.redirect(new URL('/', req.url));
  const provider = params.provider;
  if (!isProvider(provider)) return NextResponse.redirect(new URL('/?settings=1&error=unknown_provider', req.url));
  if (!PROVIDERS[provider].clientId()) return NextResponse.redirect(new URL('/?settings=1&error=not_configured', req.url));

  const state = crypto.randomBytes(16).toString('hex');
  const res = NextResponse.redirect(buildAuthUrl(provider, state));
  // short-lived, httpOnly state cookie for CSRF protection
  res.cookies.set(`oauth_state_${provider}`, state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  return res;
}
