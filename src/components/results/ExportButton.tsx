'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { exportPlanAsPdf } from '@/lib/exportPdf'
import { WatchPlan } from '@/types/media'
import { MoviePlan } from '@/lib/scheduler'

interface ExportButtonProps {
  plan: WatchPlan
  title: string
  releaseYear: string
  posterUrl?: string | null
  genres?: string[]
  moviePlan?: MoviePlan | null
}

export default function ExportButton({
  plan,
  title,
  releaseYear,
  posterUrl,
  genres,
  moviePlan,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const shareUrl =
        typeof window !== 'undefined' ? window.location.href : undefined
      await exportPlanAsPdf(
        plan,
        title,
        releaseYear,
        posterUrl,
        genres,
        shareUrl,
        moviePlan
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      variant="primary"
      onClick={handleExport}
      disabled={exporting}
      className="w-full"
    >
      {exporting ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  )
}
