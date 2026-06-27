import jsPDF from 'jspdf'
import { WatchPlan } from '@/types/media'

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const ESPRESSO = [26, 20, 16] as const
const INK = [44, 24, 16] as const
const PARCHMENT = [242, 232, 213] as const
const GOLD = [201, 146, 42] as const
const MUTED = [140, 120, 100] as const

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2])
}

function setDraw(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2])
}

function setTextColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2])
}

export async function exportPlanAsPdf(
  plan: WatchPlan,
  title: string,
  releaseYear: string,
  posterUrl?: string | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 20
  const CW = W - M * 2

  // Background
  setFill(doc, ESPRESSO)
  doc.rect(0, 0, W, H, 'F')

  // Top gold line
  setDraw(doc, GOLD)
  doc.setLineWidth(0.8)
  doc.line(M, 18, W - M, 18)

  // Header label
  setTextColor(doc, GOLD)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('BINGELY · WATCH PLAN', M, 14)
  doc.text(
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    W - M,
    14,
    { align: 'right' }
  )

  let y = 30

  // Poster + title block
  const hasPoster = !!posterUrl
  const posterW = 28
  const posterH = 42

  if (hasPoster) {
    try {
      // Draw poster placeholder box — real image loading requires canvas
      setFill(doc, INK)
      setDraw(doc, GOLD)
      doc.setLineWidth(0.3)
      doc.rect(M, y, posterW, posterH, 'FD')
      setTextColor(doc, GOLD)
      doc.setFontSize(7)
      doc.text('◎', M + posterW / 2, y + posterH / 2, { align: 'center' })
    } catch {}
  }

  const titleX = hasPoster ? M + posterW + 6 : M
  const titleW = hasPoster ? CW - posterW - 6 : CW

  setTextColor(doc, PARCHMENT)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title, titleW)
  doc.text(titleLines, titleX, y + 10)

  setTextColor(doc, MUTED)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(releaseYear, titleX, y + 10 + titleLines.length * 10 + 3)

  y = Math.max(y + posterH + 8, y + titleLines.length * 10 + 20)

  // Divider
  setDraw(doc, GOLD)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 8

  // Stats grid
  const stats =
    plan.mediaType === 'tv'
      ? [
          { label: 'COMPLETION', value: plan.completionDate },
          { label: 'TOTAL WEEKS', value: `${plan.totalWeeks} weeks` },
          { label: 'EPS / WEEK', value: `${plan.episodesPerWeek} eps` },
          { label: 'TOTAL HOURS', value: formatHours(plan.totalHours) },
          {
            label: 'PACE',
            value: plan.pace.charAt(0).toUpperCase() + plan.pace.slice(1),
          },
          { label: 'TOTAL EPISODES', value: `${plan.totalEpisodes}` },
        ]
      : [
          { label: 'COMPLETION', value: plan.completionDate },
          { label: 'RUNTIME', value: `${plan.runtime} min` },
          { label: 'TOTAL HOURS', value: formatHours(plan.totalHours) },
        ]

  const cols = plan.mediaType === 'tv' ? 3 : 3
  const colW = CW / cols

  stats.forEach((s, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const sx = M + col * colW
    const sy = y + row * 18

    // Stat box
    setFill(doc, INK)
    setDraw(doc, [60, 40, 20])
    doc.setLineWidth(0.2)
    doc.rect(sx, sy - 4, colW - 3, 15, 'FD')

    setTextColor(doc, GOLD)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, sx + 3, sy + 1)

    setTextColor(doc, PARCHMENT)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(s.value, sx + 3, sy + 8)
  })

  const statRows = Math.ceil(stats.length / cols)
  y += statRows * 18 + 8

  // Divider
  setDraw(doc, GOLD)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 8

  if (plan.mediaType === 'tv') {
    // Milestones section
    setTextColor(doc, GOLD)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('MILESTONES', M, y)
    y += 6

    plan.milestones.forEach((m) => {
      // Milestone row
      setFill(doc, INK)
      doc.rect(M, y - 3, CW, 10, 'F')

      setTextColor(doc, PARCHMENT)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(m.label, M + 3, y + 4)

      setTextColor(doc, MUTED)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Week ${m.week}`, M + 60, y + 4)
      doc.text(`Episode ${m.episode}`, M + 90, y + 4)

      // Progress bar
      const barX = M + 125
      const barW = CW - 125 - 3
      const fillW = (barW * m.percent) / 100
      setFill(doc, [44, 24, 16])
      doc.rect(barX, y, barW, 3, 'F')
      setFill(doc, GOLD)
      doc.rect(barX, y, fillW, 3, 'F')

      setTextColor(doc, GOLD)
      doc.setFontSize(7)
      doc.text(`${m.percent}%`, W - M - 3, y + 3, { align: 'right' })

      y += 13
    })

    y += 4
    setDraw(doc, GOLD)
    doc.setLineWidth(0.3)
    doc.line(M, y, W - M, y)
    y += 8

    // Weekly breakdown
    setTextColor(doc, GOLD)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('WEEK BY WEEK', M, y)
    y += 6

    // Column headers
    setTextColor(doc, MUTED)
    doc.setFontSize(7)
    doc.text('WEEK', M + 3, y)
    doc.text('EPISODES', M + 25, y)
    doc.text('RANGE', M + 60, y)
    doc.text('HOURS', M + 100, y)
    doc.text('PROGRESS', M + 125, y)
    y += 5

    const maxWeeks = plan.weeklyBlocks.length
    let pageBreakUsed = false

    plan.weeklyBlocks.forEach((block, i) => {
      if (y > H - 25) {
        if (!pageBreakUsed) {
          // Footer on first page
          drawFooter(doc, W, H, M, title)
          doc.addPage()
          setFill(doc, ESPRESSO)
          doc.rect(0, 0, W, H, 'F')
          y = 20
          pageBreakUsed = true
        } else {
          return
        }
      }

      const isLast = block.endEpisode >= plan.totalEpisodes
      if (isLast) {
        setFill(doc, INK)
        doc.rect(M, y - 2, CW, 9, 'F')
      }

      setTextColor(doc, isLast ? GOLD : PARCHMENT)
      doc.setFontSize(8)
      doc.setFont('helvetica', isLast ? 'bold' : 'normal')
      doc.text(`${block.week}`, M + 3, y + 4)

      setTextColor(doc, MUTED)
      doc.setFont('helvetica', 'normal')
      doc.text(`${block.episodes} eps`, M + 25, y + 4)
      doc.text(`${block.startEpisode}–${block.endEpisode}`, M + 60, y + 4)
      doc.text(`${block.hoursWatched}h`, M + 100, y + 4)

      // Mini progress bar
      const barX = M + 125
      const barW = CW - 125 - 3
      setFill(doc, [44, 24, 16])
      doc.rect(barX, y + 1, barW, 2.5, 'F')
      setFill(doc, GOLD)
      doc.rect(barX, y + 1, (barW * block.cumulativePercent) / 100, 2.5, 'F')

      setTextColor(doc, GOLD)
      doc.setFontSize(6)
      doc.text(`${block.cumulativePercent}%`, W - M - 3, y + 4, {
        align: 'right',
      })

      y += 8
    })

    if (maxWeeks > 30 && !pageBreakUsed) {
      setTextColor(doc, MUTED)
      doc.setFontSize(7)
      doc.text(`... and ${maxWeeks - 30} more weeks`, M, y + 4)
    }
  } else {
    // Movie — simple viewing note
    setFill(doc, INK)
    doc.rect(M, y, CW, 20, 'F')
    setTextColor(doc, PARCHMENT)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Your viewing plan has been generated by Bingely.', M + 4, y + 8)
    setTextColor(doc, MUTED)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Open the share link to view your full session breakdown and calendar.',
      M + 4,
      y + 15
    )
    y += 28
  }

  drawFooter(doc, W, H, M, title)
  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-watch-plan.pdf`)
}

function drawFooter(
  doc: jsPDF,
  W: number,
  H: number,
  M: number,
  title: string
) {
  doc.setDrawColor(201, 146, 42)
  doc.setLineWidth(0.3)
  doc.line(M, H - 14, W - M, H - 14)
  doc.setTextColor(201, 146, 42)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Generated by Bingely · bingeplan.vercel.app', M, H - 9)
  doc.text(title, W - M, H - 9, { align: 'right' })
}
