-- ============================================================
-- CS HUB — SUPABASE SCHEMA
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
-- Created automatically when a user signs up (via trigger below)
create table public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  full_name   text,
  matric_no   text unique,
  email       text not null,
  role        text not null default 'student' check (role in ('student', 'admin')),
  streak      int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Students can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = user_id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));

-- Admins can update all profiles (e.g. assign admin role)
create policy "Admins can update all profiles"
  on public.profiles for update
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── ACADEMIC CALENDAR ───────────────────────────────────────
create table public.academic_calendar (
  id              uuid primary key default uuid_generate_v4(),
  semester        int not null,
  level           text not null default '200L',
  programme       text not null default 'Cybersecurity Engineering',
  session         text not null,           -- e.g. '2023/2024'
  current_week    int not null default 1,
  total_weeks     int not null default 15,
  semester_start_date date,
  exam_start_date date,
  first_exam      text,
  updated_at      timestamptz default now()
);

alter table public.academic_calendar enable row level security;

create policy "Anyone can read calendar"
  on public.academic_calendar for select using (true);

create policy "Admins can manage calendar"
  on public.academic_calendar for all
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));

-- Add missing calendar columns if the table already exists
alter table public.academic_calendar
  add column if not exists level text not null default '200L',
  add column if not exists programme text not null default 'Cybersecurity Engineering',
  add column if not exists semester_start_date date;

-- Seed initial calendar row if none exists
insert into public.academic_calendar (semester, level, programme, session, current_week, total_weeks, semester_start_date, exam_start_date, first_exam)
select 2, '200L', 'Cybersecurity Engineering', '2023/2024', 9, 15, '2024-01-08', '2024-07-08', 'MTH 102'
where not exists (select 1 from public.academic_calendar);


-- ─── COURSES ─────────────────────────────────────────────────
create table public.courses (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,         -- e.g. 'MTH 102'
  title       text not null,
  units       int not null,
  color       text not null default '#534AB7',
  light       text not null default '#EEEDFE',
  icon        text not null default 'ti-book',
  topics      text[] default '{}',
  progress    int default 0,
  semester    int not null default 2,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Anyone can read courses"
  on public.courses for select using (true);

create policy "Admins can manage courses"
  on public.courses for all
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));

-- Seed courses
insert into public.courses (code, title, units, color, light, icon, topics, progress) values
  ('MTH 102', 'General Mathematics II',    3, '#534AB7', '#EEEDFE', 'ti-math-function', array['Calculus','Differential Eq.','Series','Vectors'], 60),
  ('CSC 106', 'Introduction to Programming', 3, '#0F6E56', '#E1F5EE', 'ti-code',          array['C Language','Functions','Arrays','Pointers'], 55),
  ('PHY 102', 'General Physics II',         3, '#BA7517', '#FAEEDA', 'ti-atom',           array['Electromagnetism','Waves','Optics'], 40),
  ('COS 102', 'Computer Organisation',      2, '#185FA5', '#E6F1FB', 'ti-cpu',            array['Memory','CPU Architecture','I/O Systems'], 65),
  ('GST 112', 'Communication Skills',       2, '#993556', '#FBEAF0', 'ti-message-2',      array['Academic Writing','Oral Skills','Reports'], 75),
  ('PHY 108', 'Physics Practical II',       1, '#3B6D11', '#EAF3DE', 'ti-flask',          array['Lab Reports','Experiments','Graphs'], 80);


-- ─── SUMMARIES ───────────────────────────────────────────────
create table public.summaries (
  id           uuid primary key default uuid_generate_v4(),
  course_code  text not null references public.courses(code) on delete cascade,
  week         int not null,
  title        text not null,
  body         text not null,
  topics       text[] default '{}',
  quiz_ready   boolean not null default false,
  quiz_unlocks text,                        -- e.g. 'Monday', 'Wednesday'
  created_at   timestamptz not null default now(),
  unique(course_code, week)
);

alter table public.summaries enable row level security;

create policy "Anyone can read summaries"
  on public.summaries for select using (true);

create policy "Admins can manage summaries"
  on public.summaries for all
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));


-- ─── QUIZ QUESTIONS ──────────────────────────────────────────
create table public.quiz_questions (
  id           uuid primary key default uuid_generate_v4(),
  course_code  text not null references public.courses(code) on delete cascade,
  week         int not null,
  question     text not null,
  options      text[] not null,             -- array of 4 options
  answer_index int not null,                -- 0-based index of correct answer
  created_at   timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

create policy "Authenticated users can read questions"
  on public.quiz_questions for select
  using (auth.uid() is not null);

create policy "Admins can manage questions"
  on public.quiz_questions for all
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));


-- ─── QUIZ ATTEMPTS ───────────────────────────────────────────
create table public.quiz_attempts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  course_code  text not null references public.courses(code) on delete cascade,
  week         int not null,
  score        int not null,                -- e.g. 4 out of 5
  total        int not null default 5,
  taken_at     timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can insert own attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can view own attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Admins can view all attempts"
  on public.quiz_attempts for select
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));


-- ─── LEADERBOARD VIEW ────────────────────────────────────────
-- This is a view, not a table — it auto-calculates rankings
create or replace view public.leaderboard as
select
  p.user_id,
  p.full_name,
  p.matric_no,
  p.streak,
  round(avg(qa.score::numeric / qa.total::numeric * 100), 1) as avg_score,
  count(qa.id) as quizzes_taken,
  max(qa.taken_at) as last_active,
  row_number() over (order by avg(qa.score::numeric / qa.total::numeric * 100) desc) as rank
from public.profiles p
left join public.quiz_attempts qa on qa.user_id = p.user_id
group by p.user_id, p.full_name, p.matric_no, p.streak;

create or replace function public.reset_leaderboard(
  p_user_id uuid default null,
  p_course_code text default null,
  p_score int default 0
)
returns void language sql security definer as $$
  update public.quiz_attempts
  set score = p_score
  where (p_user_id is null or user_id = p_user_id)
    and (p_course_code is null or course_code = p_course_code);
$$;

create or replace function public.reset_leaderboard(
  p_course_code text default null,
  p_score int default 0,
  p_user_id uuid default null
)
returns void language sql security definer as $$
  update public.quiz_attempts
  set score = p_score
  where (p_user_id is null or user_id = p_user_id)
    and (p_course_code is null or course_code = p_course_code);
$$;


-- ─── ANNOUNCEMENTS ───────────────────────────────────────────
create table public.announcements (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('lesson', 'ticket', 'result', 'task', 'info')),
  text        text not null,
  link        text,
  link_label  text,
  urgent      boolean not null default false,
  active      boolean not null default true,
  expires_at  timestamptz,                  -- optional auto-expiry
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Anyone can read active announcements"
  on public.announcements for select
  using (active = true and (expires_at is null or expires_at > now()));

create policy "Admins can manage announcements"
  on public.announcements for all
  using (exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  ));

-- Seed some announcements
insert into public.announcements (type, text, link, link_label, urgent) values
  ('lesson', 'LIVE: MTH 102 — Differential Equations with Dr. Adeyemi', 'https://meet.google.com/placeholder', 'Join now', true),
  ('ticket', 'COS 102 results not showing for some students — raise a ticket on the portal', 'https://portal.miva.university', 'Raise ticket', true),
  ('task',   'Submit PHY 108 lab report by Friday 11:59 PM', null, null, false),
  ('result', 'GST 112 CA scores now available — check your student portal', 'https://portal.miva.university', 'Check portal', false),
  ('info',   'Week 10 live lessons timetable has been updated — check the calendar', null, null, false);


-- ============================================================
-- DONE. After running this:
-- 1. Go to Authentication → Email → enable "Confirm email"
-- 2. Set your site URL in Authentication → URL Configuration
-- 3. Make the first admin by running:
--    update public.profiles set role = 'admin' where email = 'your@miva.edu.ng';
-- ============================================================
