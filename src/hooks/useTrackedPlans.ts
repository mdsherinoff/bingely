'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'bingely_tracked_plans'

export interface TrackedPlan {
  // One followed plan per title: `${type}-${tmdbId}`
  id: string
  title: string
  posterPath: string | null
  href: string // results URL to reopen the plan
  totalEpisodes: number
  startEpisode: number // first episode the plan covers
  watchedThrough: number // last episode watched (absolute)
  startedAt: string // ISO date the plan was followed / re-planned
  completionDate: string
  // Last episode of each plan week, to work out where you "should" be
  weekEnds: number[]
}

export type PlanStatus =
  | { kind: 'done' }
  | { kind: 'not-started' }
  | { kind: 'on-track' }
  | { kind: 'ahead'; by: number }
  | { kind: 'behind'; by: number }

function weeksElapsed(plan: TrackedPlan, today: Date): number {
  const start = new Date(plan.startedAt)
  start.setHours(0, 0, 0, 0)
  const now = new Date(today)
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (7 * 86400000)))
}

// Where the plan expects you to be today: the end of the last fully
// elapsed plan week
export function expectedThrough(plan: TrackedPlan, today = new Date()): number {
  const weeks = weeksElapsed(plan, today)
  if (weeks === 0) return plan.startEpisode - 1
  return plan.weekEnds[Math.min(weeks, plan.weekEnds.length) - 1]
}

export function planStatus(plan: TrackedPlan, today = new Date()): PlanStatus {
  if (plan.watchedThrough >= plan.totalEpisodes) return { kind: 'done' }
  const expected = expectedThrough(plan, today)
  // The week in progress: anything up to its last episode is on track
  const weeks = weeksElapsed(plan, today)
  const thisWeekTarget =
    plan.weekEnds[Math.min(weeks, plan.weekEnds.length - 1)] ?? plan.totalEpisodes

  if (plan.watchedThrough < expected)
    return { kind: 'behind', by: expected - plan.watchedThrough }
  if (plan.watchedThrough > thisWeekTarget)
    return { kind: 'ahead', by: plan.watchedThrough - thisWeekTarget }
  // Only before a single episode has been watched — after a re-plan
  // you're simply on track for the new plan
  if (weeks === 0 && plan.watchedThrough === 0) return { kind: 'not-started' }
  return { kind: 'on-track' }
}

function read(): TrackedPlan[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function useTrackedPlans() {
  const [plans, setPlans] = useState<TrackedPlan[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPlans(read())
    setReady(true)
  }, [])

  // Always merge against what's stored, so two components on the same
  // page can't overwrite each other's changes
  const save = useCallback((update: (current: TrackedPlan[]) => TrackedPlan[]) => {
    const next = update(read())
    setPlans(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }, [])

  const follow = useCallback(
    (plan: TrackedPlan) =>
      save((current) => [plan, ...current.filter((p) => p.id !== plan.id)]),
    [save]
  )

  const update = useCallback(
    (id: string, changes: Partial<TrackedPlan>) =>
      save((current) =>
        current.map((p) => (p.id === id ? { ...p, ...changes } : p))
      ),
    [save]
  )

  const unfollow = useCallback(
    (id: string) => save((current) => current.filter((p) => p.id !== id)),
    [save]
  )

  const get = useCallback(
    (id: string) => plans.find((p) => p.id === id),
    [plans]
  )

  return { plans, ready, follow, update, unfollow, get }
}
