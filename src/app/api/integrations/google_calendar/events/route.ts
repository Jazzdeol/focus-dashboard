export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getUserId, unauthorized } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/integrations';

// Example of consuming an integration: returns the signed-in user's next events
// using ONLY their own stored Google token. No other user's data is reachable.
export async function GET() {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const token = await getValidAccessToken(userId, 'google_calendar');
  if (!token) return NextResponse.json({ connected: false, events: [] });
  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&singleEvents=true&orderBy=startTime`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return NextResponse.json({ connected: true, error: `Calendar said ${res.status}`, events: [] });
    const data = await res.json();
    type Ev = { summary?: string; start?: { dateTime?: string; date?: string } };
    const events = (data.items as Ev[] || []).map((e) => ({ title: e.summary || '(no title)', start: e.start?.dateTime || e.start?.date || null }));
    return NextResponse.json({ connected: true, events });
  } catch {
    return NextResponse.json({ connected: true, error: 'Could not reach Google Calendar', events: [] });
  }
}
