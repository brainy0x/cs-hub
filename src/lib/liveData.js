import { useEffect, useState } from 'react'
import { COURSES, ACADEMIC } from './data'
import { getAnnouncements, getCalendar, getCourses, getLeaderboard, supabase } from './supabase'
import { ANNOUNCEMENTS } from '../components/AnnouncementBanner'

const subscribeToTable = (table, onChange) =>
  supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe()

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
      if (mounted && data) setCalendar(data)
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
