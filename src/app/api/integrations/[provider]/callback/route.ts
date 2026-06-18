import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { isProvider, exchangeCode, saveTokens } from '@/lib/integrations';

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.redirect(new URL('/', req.url));
  const provider = params.provider;
  if (!isProvider(provider)) return NextResponse.redirect(new URL('/?settings=1&error=unknown_provider', req.url));

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const cookieState = req.cookies.get(`oauth_state_${provider}`)?.value;
  if (req.nextUrl.searchParams.get('error')) return NextResponse.redirect(new URL('/?settings=1&error=denied', req.url));
  if (!code || !state || state !== cookieState) return NextResponse.redirect(new URL('/?settings=1&error=bad_state', req.url));

  try {
    const tokens = await exchangeCode(provider, code);
    await saveTokens(userId, provider, tokens);
    const res = NextResponse.redirect(new URL('/?settings=1&connected=' + provider, req.url));
    res.cookies.delete(`oauth_state_${provider}`);
    return res;
  } catch {
    return NextResponse.redirect(new URL('/?settings=1&error=exchange_failed', req.url));
  }
}
