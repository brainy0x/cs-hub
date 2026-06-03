import { useEffect, useState } from 'react'
import { COURSES, ACADEMIC } from './data'
import { getAnnouncements, getCalendar, getCourses, getLeaderboard, getQuizQuestions, getSummaries, getUserQuizAttempts, supabase } from './supabase'
import { ANNOUNCEMENTS } from '../components/AnnouncementBanner'

const subscribeToTable = (table, onChange) => {
  const channelName = `${table}-changes-${Math.random().toString(36).slice(2)}`
  return supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe()
}

function computeCurrentWeek(calendar) {
  if (!calendar?.semester_start_date) return calendar
  const start = new Date(`${calendar.semester_start_date}T00:00:00`)
  if (Number.isNaN(start.getTime())) return calendar
  const today = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.floor((todayDay - startDay) / 86400000)
  const week = Math.floor(Math.max(days, 0) / 7) + 1
  return {
    ...calendar,
    current_week: Math.min(calendar.total_weeks || 15, Math.max(1, week)),
  }
}

export function calculateDailyStreak(attempts = []) {
  const dates = [...new Set(attempts.map(a => a.taken_at?.slice(0, 10)).filter(Boolean))].sort().reverse()
  if (!dates.length) return 0

  const today = new Date()
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let streak = 0

  for (const date of dates) {
    const iso = cursor.toISOString().slice(0, 10)
    if (date === iso) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1)
      if (date === cursor.toISOString().slice(0, 10)) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    } else {
      break
    }
  }

  return streak
}

export function useLiveCourses() {
  const [courses, setCourses] = useState(COURSES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data, error } = await getCourses()
      if (mounted && !error) setCourses(data || [])
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('courses', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { courses, loading }
}

export function useLiveAnnouncements() {
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data, error } = await getAnnouncements()
      if (mounted && !error) setAnnouncements(data || [])
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('announcements', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { announcements, loading }
}

export function useLiveCalendar() {
  const [calendar, setCalendar] = useState({
    semester: ACADEMIC.semester,
    current_week: ACADEMIC.currentWeek,
    total_weeks: ACADEMIC.totalWeeks,
    exam_start_date: ACADEMIC.examStartDate,
    session: '2023/2024',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data } = await getCalendar()
      if (mounted && data) setCalendar(computeCurrentWeek(data))
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('academic_calendar', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { calendar, loading }
}

export function useLiveQuizQuestions(courseCode, week) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data, error } = await getQuizQuestions(courseCode, week)
      if (mounted && !error) setQuestions(data || [])
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('quiz_questions', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [courseCode, week])

  return { questions, loading }
}

export function useUserQuizStats(userId) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setAttempts([])
      setLoading(false)
      return
    }
    let mounted = true
    async function load() {
      const { data, error } = await getUserQuizAttempts(userId)
      if (mounted && !error) setAttempts(data || [])
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('quiz_attempts', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { attempts, streak: calculateDailyStreak(attempts), loading }
}

export function useLiveLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data, error } = await getLeaderboard()
      if (mounted && !error) setLeaderboard(data || [])
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('quiz_attempts', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { leaderboard, loading }
}

export function useLiveSummaries() {
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data, error } = await getSummaries()
      if (mounted && !error) setSummaries(data || [])
      if (mounted) setLoading(false)
    }
    load()
    const channel = subscribeToTable('summaries', load)
    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return { summaries, loading }
}
