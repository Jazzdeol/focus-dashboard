import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Returns the signed-in Clerk user id, or null.
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export const unauthorized = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
