import { NextRequest, NextResponse } from 'next/server';
import { estimateCalories } from '@/lib/food';
import { getUserId, unauthorized } from '@/lib/auth';
export async function POST(req: NextRequest) {
  const userId = await getUserId(); if (!userId) return unauthorized();
  const { food } = await req.json();
  return NextResponse.json(estimateCalories(food || ''));
}
