'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCustomLists } from '@/hooks/useCustomLists'
import { useTrackedPlans, planStatus, TrackedPlan } from '@/hooks/useTrackedPlans'
import { CustomList } from '@/types/media'

function describeList(list: CustomList): string {
  const films = list.items.filter((i) => i.mediaType === 'movie').length
  const series = list.items.length - films
  const parts = []
  if (films) parts.push(`${films} film${films === 1 ? '' : 's'}`)
  if (series) parts.push(`${series} series`)
  const hours = Math.round(list.items.reduce((a, i) => a + i.runtime, 0) / 60)
  return `${parts.join(' · ')} · ${hours}h`
}

function statusLabel(plan: TrackedPlan): { text: string; tone: string } {
  const s = planStatus(plan)
  switch (s.kind) {
    case 'done':
      return { text: 'Finished', tone: 'text-gold' }
    case 'not-started':
      return { text: 'Not started', tone: 'text-parchment-dim' }
    case 'on-track':
      return { text: 'On track', tone: 'text-gold' }
    case 'ahead':
      return { text: `${s.by} ahead`, tone: 'text-gold' }
    case 'behind':
      return { text: `${s.by} behind`, tone: 'text-rose' }
  }
}

function ConfirmDelete({
  label,
  onConfirm,
  onCancel,
}: {
  label: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-parchment-dim font-sans text-sm">{label}</span>
      <button
        onClick={onConfirm}
        className="border-rose/50 text-rose hover:bg-rose/10 min-h-[40px] rounded-sm border px-3 font-sans text-sm transition-colors"
      >
        Yes
      </button>
      <button
        onClick={onCancel}
        className="text-parchment-dim hover:text-parchment min-h-[40px] px-2 font-sans text-sm transition-colors"
      >
        Keep
      </button>
    </div>
  )
}

export default function LibraryPage() {
  const { lists, ready: listsReady, deleteList } = useCustomLists()
  const { plans, ready: plansReady, unfollow } = useTrackedPlans()
  const [confirming, setConfirming] = useState<string | null>(null)
  const ready = listsReady && plansReady

  const sortedLists = [...lists].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        <div className="flex flex-col gap-2">
          <p className="text-gold font-mono text-xs tracking-widest">LIBRARY</p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            Your library
          </h1>
          <p className="text-parchment-dim font-sans">
            Plans you&apos;re following and lists you&apos;ve made, saved on
            this device.
          </p>
        </div>

        {!ready ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-ink h-20 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : (
          <>
            {/* Followed plans */}
            <section aria-labelledby="following" className="flex flex-col gap-4">
              <h2
                id="following"
                className="font-display text-parchment text-2xl"
              >
                Following
              </h2>
              {plans.length === 0 ? (
                <p className="text-parchment-dim border-line rounded-sm border px-5 py-6 font-sans text-sm">
                  Open any series plan and tap{' '}
                  <span className="text-parchment">Follow this plan</span> to
                  track your progress here.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {plans.map((plan) => {
                    const pct = Math.round(
                      (plan.watchedThrough / plan.totalEpisodes) * 100
                    )
                    const status = statusLabel(plan)
                    return (
                      <li
                        key={plan.id}
                        className="border-line bg-ink flex flex-wrap items-center gap-4 rounded-sm border p-3"
                      >
                        <div className="bg-raised relative aspect-[2/3] w-12 flex-shrink-0 overflow-hidden rounded-sm">
                          {plan.posterPath && (
                            <Image
                              src={plan.posterPath}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-parchment truncate font-sans text-base font-medium">
                              {plan.title}
                            </p>
                            <span
                              className={`flex-shrink-0 font-sans text-xs ${status.tone}`}
                            >
                              {status.text}
                            </span>
                          </div>
                          <div className="bg-espresso border-line h-1.5 overflow-hidden rounded-full border">
                            <div
                              className="bg-gold h-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-parchment-faint font-mono text-xs tabular-nums">
                            {plan.watchedThrough}/{plan.totalEpisodes} episodes ·
                            done {plan.completionDate}
                          </p>
                        </div>
                        {confirming === plan.id ? (
                          <ConfirmDelete
                            label="Stop following?"
                            onConfirm={() => {
                              unfollow(plan.id)
                              setConfirming(null)
                            }}
                            onCancel={() => setConfirming(null)}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link
                              href={plan.href}
                              className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[40px] items-center rounded-sm border px-4 font-sans text-sm transition-colors"
                            >
                              Open →
                            </Link>
                            <button
                              onClick={() => setConfirming(plan.id)}
                              aria-label={`Stop following ${plan.title}`}
                              className="text-parchment-faint hover:text-rose min-h-[40px] px-2 font-sans text-sm transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            {/* Lists */}
            <section aria-labelledby="lists" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="lists" className="font-display text-parchment text-2xl">
                  Your lists
                </h2>
                <Link
                  href="/list/new"
                  className="bg-gold text-espresso inline-flex min-h-[40px] items-center rounded-sm px-4 font-sans text-sm font-semibold transition-colors hover:bg-[#ecb95c]"
                >
                  + New list
                </Link>
              </div>
              {sortedLists.length === 0 ? (
                <div className="border-line flex flex-col items-center gap-3 rounded-sm border px-6 py-10 text-center">
                  <p className="text-parchment font-sans">No lists yet</p>
                  <p className="text-parchment-dim max-w-sm font-sans text-sm">
                    Mix any films and series into one list and Bingely will
                    plan the whole thing around your free time.
                  </p>
                  <Link
                    href="/challenges"
                    className="text-gold hover:underline font-sans text-sm"
                  >
                    Or start with a film challenge →
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {sortedLists.map((list) => (
                    <li
                      key={list.id}
                      className="border-line bg-ink flex flex-wrap items-center gap-4 rounded-sm border p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-parchment truncate font-sans text-base font-medium">
                          {list.title}
                        </p>
                        <p className="text-parchment-faint font-mono text-xs tabular-nums">
                          {describeList(list)}
                        </p>
                      </div>
                      {confirming === list.id ? (
                        <ConfirmDelete
                          label="Delete this list?"
                          onConfirm={() => {
                            deleteList(list.id)
                            setConfirming(null)
                          }}
                          onCancel={() => setConfirming(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/list/${list.id}/plan`}
                            className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[40px] items-center rounded-sm border px-4 font-sans text-sm transition-colors"
                          >
                            Plan it →
                          </Link>
                          <button
                            onClick={() => setConfirming(list.id)}
                            aria-label={`Delete ${list.title}`}
                            className="text-parchment-faint hover:text-rose min-h-[40px] px-2 font-sans text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
