# CS Hub — Miva Open University

A student dashboard for Cybersecurity 100L students. Academic week tracker, exam countdown, weekly AI-generated summaries, quizzes with leaderboard.

## Stack
- React + Vite
- Supabase (auth + database)
- Tabler Icons
- Syne + DM Sans fonts

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# 3. Run dev server
npm run dev
```

## Project Structure

```
src/
  pages/
    Dashboard.jsx     ← Main overview page
    Courses.jsx       ← All semester courses
    Quiz.jsx          ← Weekly timed quiz
    Leaderboard.jsx   ← Score rankings
    Summaries.jsx     ← AI study summaries
    Calendar.jsx      ← Academic timeline
  components/
    Sidebar.jsx       ← Navigation sidebar
  lib/
    data.js           ← All static data (courses, quiz questions, etc.)
    supabase.js       ← Supabase client + helper functions
  styles/
    globals.css       ← CSS variables and base styles
```

## Connecting Supabase

1. Create a project at https://app.supabase.com
2. Copy your URL and anon key into `.env`
3. Run the SQL schema (see below) in the Supabase SQL editor

### SQL Schema

```sql
-- Users table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  matric_no text unique,
  level text default '100L',
  programme text default 'Cybersecurity',
  created_at timestamp default now()
);

-- Quiz attempts
create table quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  course_code text,
  week_number int,
  score int,
  taken_at timestamp default now()
);

-- Leaderboard view
create view leaderboard as
  select
    p.name,
    p.matric_no,
    avg(qa.score) as avg_score,
    count(qa.id) as total_quizzes,
    qa.week_number
  from quiz_attempts qa
  join profiles p on p.id = qa.user_id
  group by p.name, p.matric_no, qa.week_number
  order by avg_score desc;
```

## Roadmap
- [ ] Supabase auth (email login)
- [ ] Real-time leaderboard
- [ ] AI summary generation from syllabus upload
- [ ] Admin panel for content management
- [ ] Mobile responsive layout
- [ ] Push notifications for quiz unlocks

## Deploy
```bash
npm run build
# Deploy /dist folder to Vercel, Netlify, or any static host
```
