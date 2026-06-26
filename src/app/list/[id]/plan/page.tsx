'use client'

import { use } from 'react'
import { useCustomLists } from '@/hooks/useCustomLists'
import AvailabilityForm from '@/components/plan/AvailabilityForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

export default function ListPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { getList } = useCustomLists()
  const router = useRouter()
  const list = getList(id)

  if (!list) {
    return (
      <main className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-body text-parchment/40">List not found</p>
        <Button onClick={() => router.push('/list/new')} variant="secondary">
          Create a new list
        </Button>
      </main>
    )
  }

  const totalRuntime = list.items.reduce((acc, i) => acc + i.runtime, 0)
  const avgRuntime = Math.round(totalRuntime / list.items.length)
  const hasTV = list.items.some((i) => i.mediaType === 'tv')

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Link
            href="/list/new"
            className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← BACK TO LIST BUILDER
          </Link>
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            CUSTOM LIST
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            {list.title}
          </h1>
          <p className="font-body text-parchment/40 italic">
            {list.items.length} titles · {Math.round(totalRuntime / 60)}h total
          </p>
        </div>

        <AvailabilityForm
          totalRuntime={totalRuntime}
          totalItems={list.items.length}
          itemLabel="titles"
          episodeRuntime={avgRuntime}
          mediaType={hasTV ? 'tv' : 'movie'}
          resultsPath={`/list/${id}/results`}
          exactItems={list.items.map((i) => ({
            title: i.title,
            runtime: i.runtime,
          }))}
        />
      </div>
    </main>
  )
}
