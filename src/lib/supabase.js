import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase project URL and anon key
// Get these from: https://app.supabase.com → Project Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

// Fetch the user's profile row from the `profiles` table (includes `role`)
export const getProfile = async (userId) => {
  if (!userId) return { data: null, error: new Error('missing userId') }
  // profiles table stores auth user id in `user_id` (see schema.sql)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

// ─── QUIZ HELPERS (connect when ready) ───────────────────────────────────────
export const getQuizQuestions = async (courseCode, week) => {
  let query = supabase
    .from('quiz_questions')
    .select('*')
    .order('created_at', { ascending: true })
  if (courseCode) query = query.eq('course_code', courseCode)
  if (week) query = query.eq('week', week)
  const { data, error } = await query
  return { data, error }
}

export const addQuizQuestion = async (question) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(question)
    .select()
  return { data, error }
}

export const updateQuizQuestion = async (id, updates) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteQuizQuestion = async (id) => {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', id)
  return { error }
}

export const submitScore = async (userId, course, week, score, total) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ user_id: userId, course_code: course, week, score, total })
    .select()
  return { data, error }
}

export const getUserQuizAttempts = async (userId) => {
  if (!userId) return { data: [], error: null }
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('taken_at, score, total, course_code, week')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
  return { data, error }
}

export const updateProfileStreak = async (userId, streak) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ streak })
    .eq('user_id', userId)
    .select()
  return { data, error }
}

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('avg_score', { ascending: false, nullsFirst: false })
  return { data, error }
}

export const resetLeaderboard = async ({ userId = null, courseCode = null, score = 0 } = {}) => {
  const { data, error } = await supabase.rpc('reset_leaderboard', {
    p_course_code: courseCode,
    p_score: score,
    p_user_id: userId,
  })
  return { data, error }
}

// ─── ADMIN: COURSES ──────────────────────────────────────────────────────────
export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('active', true)
    .order('code', { ascending: true })
  return { data, error }
}

export const addCourse = async (course) => {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
  return { data, error }
}

export const updateCourse = async (id, updates) => {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteCourse = async (id) => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  return { error }
}

// ─── ADMIN: ANNOUNCEMENTS ────────────────────────────────────────────────────
export const getAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const addAnnouncement = async (announcement) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
  return { data, error }
}

export const updateAnnouncement = async (id, updates) => {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteAnnouncement = async (id) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
  return { error }
}

export const getSummaries = async () => {
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .order('course_code', { ascending: true })
    .order('week', { ascending: true })
  return { data, error }
}

export const getLinks = async (activeOnly = true) => {
  let query = supabase
    .from('resource_links')
    .select('*')
    .order('position', { ascending: true })
    .order('title', { ascending: true })
  if (activeOnly) query = query.eq('active', true)
  const { data, error } = await query
  return { data, error }
}

export const addLink = async (link) => {
  const { data, error } = await supabase
    .from('resource_links')
    .insert(link)
    .select()
  return { data, error }
}

export const updateLink = async (id, updates) => {
  const { data, error } = await supabase
    .from('resource_links')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteLink = async (id) => {
  const { error } = await supabase
    .from('resource_links')
    .delete()
    .eq('id', id)
  return { error }
}

export const addSummary = async (summary) => {
  const { data, error } = await supabase
    .from('summaries')
    .insert(summary)
    .select()
  return { data, error }
}

export const updateSummary = async (id, updates) => {
  const { data, error } = await supabase
    .from('summaries')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteSummary = async (id) => {
  const { error } = await supabase
    .from('summaries')
    .delete()
    .eq('id', id)
  return { error }
}

// ─── ADMIN: CALENDAR ─────────────────────────────────────────────────────────
export const getCalendar = async () => {
  const { data, error } = await supabase
    .from('academic_calendar')
    .select('*')
    .single()
  return { data, error }
}

export const updateCalendar = async (id, updates) => {
  const { data, error } = await supabase
    .from('academic_calendar')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

// ─── ADMIN: USERS ────────────────────────────────────────────────────────────
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateUserRole = async (userId, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('user_id', userId)
    .select()
  return { data, error }
}
