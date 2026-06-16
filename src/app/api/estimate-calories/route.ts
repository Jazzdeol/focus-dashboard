import { NextRequest, NextResponse } from 'next/server';
import { estimateCalories } from '@/lib/food';
export async function POST(req: NextRequest) {
  const { food } = await req.json();
  return NextResponse.json(estimateCalories(food || ''));
}
