import { neon } from '@neondatabase/serverless';

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function initDb() {
  const sql = getDb();

  // ── Weekly view ──────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN DEFAULT FALSE,
    week_start DATE, category TEXT DEFAULT 'general', sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS gym_sessions (
    id SERIAL PRIMARY KEY, week_start DATE, day_label TEXT, focus TEXT,
    completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY, log_date DATE NOT NULL, food TEXT NOT NULL,
    calories INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS weekly_goals (
    id SERIAL PRIMARY KEY, week_start DATE, goal TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS weekly_reflections (
    id SERIAL PRIMARY KEY, week_start DATE UNIQUE, content TEXT,
    updated_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS fun_ideas (
    id SERIAL PRIMARY KEY, content TEXT NOT NULL, done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW())`;

  // ── Habits ───────────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, icon TEXT DEFAULT '✨',
    color TEXT DEFAULT '#a78bfa', section TEXT DEFAULT 'daily',
    weekly_goal INTEGER DEFAULT 7, sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY, habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL, created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(habit_id, logged_date))`;

  // ── Quarterly view ───────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS finances (
    id SERIAL PRIMARY KEY, quarter TEXT NOT NULL, label TEXT NOT NULL,
    amount NUMERIC DEFAULT 0, kind TEXT DEFAULT 'expense',
    created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS quarterly_goals (
    id SERIAL PRIMARY KEY, quarter TEXT NOT NULL, goal TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY, quarter TEXT, content TEXT NOT NULL,
    achieved_date DATE DEFAULT CURRENT_DATE, created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS parking_lot (
    id SERIAL PRIMARY KEY, content TEXT NOT NULL, archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW())`;

  // ── Yearly view ──────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS yearly_goals (
    id SERIAL PRIMARY KEY, year INTEGER NOT NULL, goal TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

  await sql`CREATE TABLE IF NOT EXISTS yearly_reflections (
    id SERIAL PRIMARY KEY, year INTEGER UNIQUE, q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT,
    updated_at TIMESTAMP DEFAULT NOW())`;

  // ── Bucket list ──────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS bucket_list (
    id SERIAL PRIMARY KEY, category TEXT NOT NULL, item TEXT NOT NULL,
    notes TEXT, completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW())`;

  // ── Study view ───────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS study_items (
    id SERIAL PRIMARY KEY, subject TEXT NOT NULL, title TEXT NOT NULL,
    task_type TEXT DEFAULT 'notes', completed BOOLEAN DEFAULT FALSE,
    notion_url TEXT, created_at TIMESTAMP DEFAULT NOW())`;

  // ── Cover scrapbook ──────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS cover_photos (
    id SERIAL PRIMARY KEY, image_data TEXT NOT NULL, caption TEXT,
    rotation REAL DEFAULT 0, sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW())`;

  // ── Protein on food logs (added in update 2) ─────────────────
  await sql`ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS protein INTEGER DEFAULT 0`;

  // ── Backfill columns on tables that pre-date Life Book ────────
  // (the original "Focus" app created tasks/habits with fewer columns;
  //  CREATE TABLE IF NOT EXISTS won't add new ones, so do it explicitly)
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS week_start DATE`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'`;
  await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '✨'`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#a78bfa'`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'daily'`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS weekly_goal INTEGER DEFAULT 7`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`;

  // ── Nutrition profile (single row) ───────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY DEFAULT 1, weight NUMERIC, height NUMERIC, age INTEGER,
    sex TEXT DEFAULT 'female', activity TEXT DEFAULT 'moderate',
    updated_at TIMESTAMP DEFAULT NOW())`;

  // ── Gym: exercises + per-week weight logs ────────────────────
  await sql`CREATE TABLE IF NOT EXISTS gym_exercises (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS gym_weight_logs (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER REFERENCES gym_exercises(id) ON DELETE CASCADE,
    week_start DATE NOT NULL, weight NUMERIC, reps INTEGER, sets INTEGER,
    updated_at TIMESTAMP DEFAULT NOW(), UNIQUE(exercise_id, week_start))`;

  // ── Sleep tracking ───────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS sleep_logs (
    id SERIAL PRIMARY KEY, log_date DATE UNIQUE, bedtime TEXT, wake_time TEXT,
    hours NUMERIC, quality INTEGER, notes TEXT, updated_at TIMESTAMP DEFAULT NOW())`;

  // ── Places / countries visited (for the yearly Wrapped) ──────
  await sql`CREATE TABLE IF NOT EXISTS places_visited (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, year INTEGER,
    created_at TIMESTAMP DEFAULT NOW())`;

  // ── Book tracker ─────────────────────────────────────────────
  await sql`CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, author TEXT, cover_id TEXT,
    status TEXT DEFAULT 'want', created_at TIMESTAMP DEFAULT NOW())`;

  // ── Daily metrics: steps + screen time (manual) ──────────────
  await sql`CREATE TABLE IF NOT EXISTS daily_metrics (
    id SERIAL PRIMARY KEY, log_date DATE UNIQUE, steps INTEGER,
    screen_minutes INTEGER, updated_at TIMESTAMP DEFAULT NOW())`;
}
