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
}
