export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Aggregates a year's worth of activity for the "Your YEAR Wrapped" card.
export async function GET(req: NextRequest) {
  const sql = getDb();
  const year = parseInt(req.nextUrl.searchParams.get('year') || `${new Date().getFullYear()}`);
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const [workouts, habitChecks, achievements, bucketDone, yearGoalsDone, qGoalsDone, places, sleepAgg, foodAgg, topExercise] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM gym_weight_logs WHERE week_start BETWEEN ${start} AND ${end}`,
    sql`SELECT COUNT(*)::int AS n FROM habit_logs WHERE logged_date BETWEEN ${start} AND ${end}`,
    sql`SELECT COUNT(*)::int AS n FROM achievements WHERE achieved_date BETWEEN ${start} AND ${end}`,
    sql`SELECT COUNT(*)::int AS n FROM bucket_list WHERE completed=TRUE`,
    sql`SELECT COUNT(*)::int AS n FROM yearly_goals WHERE year=${year} AND completed=TRUE`,
    sql`SELECT COUNT(*)::int AS n FROM quarterly_goals WHERE quarter LIKE ${year + '-%'} AND completed=TRUE`,
    sql`SELECT name FROM places_visited WHERE year=${year} ORDER BY created_at`,
    sql`SELECT ROUND(AVG(hours)::numeric, 1) AS avg_hours, COUNT(*)::int AS nights FROM sleep_logs WHERE log_date BETWEEN ${start} AND ${end} AND hours IS NOT NULL`,
    sql`SELECT COUNT(DISTINCT log_date)::int AS days, COALESCE(SUM(calories),0)::int AS kcal, COALESCE(SUM(protein),0)::int AS protein FROM food_logs WHERE log_date BETWEEN ${start} AND ${end}`,
    sql`SELECT e.name, MAX(g.weight) AS top FROM gym_weight_logs g JOIN gym_exercises e ON e.id=g.exercise_id WHERE g.week_start BETWEEN ${start} AND ${end} GROUP BY e.name ORDER BY top DESC NULLS LAST LIMIT 1`,
  ]);

  return NextResponse.json({
    year,
    workouts: workouts[0].n,
    habitChecks: habitChecks[0].n,
    achievements: achievements[0].n,
    bucketDone: bucketDone[0].n,
    goalsAchieved: yearGoalsDone[0].n + qGoalsDone[0].n,
    countries: (places as { name: string }[]).map((p) => p.name),
    avgSleep: sleepAgg[0].avg_hours,
    nightsTracked: sleepAgg[0].nights,
    foodDays: foodAgg[0].days,
    totalProtein: foodAgg[0].protein,
    topLift: topExercise[0] ? { name: topExercise[0].name, weight: topExercise[0].top } : null,
  });
}
