import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { WatchPlan } from '@/types/media'
import { MoviePlan } from '@/lib/scheduler'

const C = {
  espresso: [26, 20, 16] as const,
  ink: [44, 24, 16] as const,
  parchment: [242, 232, 213] as const,
  gold: [201, 146, 42] as const,
  muted: [140, 120, 100] as const,
  border: [60, 40, 20] as const,
}

function rgb(
  doc: jsPDF,
  type: 'fill' | 'draw' | 'text',
  color: readonly [number, number, number]
) {
  if (type === 'fill') doc.setFillColor(color[0], color[1], color[2])
  if (type === 'draw') doc.setDrawColor(color[0], color[1], color[2])
  if (type === 'text') doc.setTextColor(color[0], color[1], color[2])
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function generateQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 120,
    margin: 1,
    color: { dark: '#C9922A', light: '#1A1410' },
  })
}

function drawHeader(doc: jsPDF, W: number, M: number) {
  rgb(doc, 'fill', C.ink)
  doc.rect(0, 0, W, 12, 'F')
  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text('BINGELY · WATCH PLAN', M, 8)
  doc.text(
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    W - M,
    8,
    { align: 'right' }
  )
  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.6)
  doc.line(M, 12, W - M, 12)
}

function drawFooter(
  doc: jsPDF,
  W: number,
  H: number,
  M: number,
  title: string,
  qrDataUrl: string
) {
  const footerY = H - 38
  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.4)
  doc.line(M, footerY, W - M, footerY)

  const qrSize = 26
  const qrX = W - M - qrSize
  const qrY = footerY + 5

  rgb(doc, 'fill', C.ink)
  doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'F')
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  rgb(doc, 'text', C.muted)
  doc.setFontSize(5.5)
  doc.text('SCAN FOR', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' })
  doc.text('FULL PLAN', qrX + qrSize / 2, qrY + qrSize + 8, { align: 'center' })

  rgb(doc, 'text', C.gold)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Bingely', M, footerY + 9)

  rgb(doc, 'text', C.muted)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Your personal cinema planner', M, footerY + 15)
  doc.setFontSize(6)
  doc.text('bingeplan.vercel.app', M, footerY + 21)
  doc.text(title, M, footerY + 27)
}

function drawPosterAndTitle(
  doc: jsPDF,
  M: number,
  W: number,
  imgData: string | null,
  title: string,
  releaseYear: string,
  genres: string[] | undefined,
  mediaLabel: string
): number {
  const posterX = M
  const posterY = 18
  const posterW = 42
  const posterH = 63

  rgb(doc, 'fill', C.ink)
  rgb(doc, 'draw', C.border)
  doc.setLineWidth(0.3)
  doc.rect(posterX, posterY, posterW, posterH, 'FD')

  if (imgData) {
    doc.addImage(imgData, 'JPEG', posterX, posterY, posterW, posterH)
  } else {
    rgb(doc, 'text', C.gold)
    doc.setFontSize(16)
    doc.text('◎', posterX + posterW / 2, posterY + posterH / 2, {
      align: 'center',
    })
  }

  const titleX = posterX + posterW + 8
  const titleW = W - titleX - M
  let ty = posterY + 6

  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text(mediaLabel, titleX, ty)
  ty += 6

  rgb(doc, 'text', C.parchment)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title, titleW)
  doc.text(titleLines, titleX, ty)
  ty += titleLines.length * 7 + 2

  rgb(doc, 'text', C.muted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(releaseYear, titleX, ty)
  ty += 5

  if (genres && genres.length > 0) {
    doc.text(genres.slice(0, 3).join(' · '), titleX, ty)
    ty += 5
  }

  return Math.max(posterY + posterH + 8, ty + 4)
}

// ── MOVIE PDF ──────────────────────────────────────────────────────────────────
async function exportMoviePdf(
  doc: jsPDF,
  W: number,
  H: number,
  M: number,
  title: string,
  releaseYear: string,
  genres: string[] | undefined,
  posterUrl: string | null | undefined,
  moviePlan: MoviePlan,
  qrDataUrl: string
) {
  drawHeader(doc, W, M)

  const imgData = posterUrl ? await loadImageAsBase64(posterUrl) : null
  let y = drawPosterAndTitle(
    doc,
    M,
    W,
    imgData,
    title,
    releaseYear,
    genres,
    'FILM'
  )

  // Divider
  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.4)
  doc.line(M, y, W - M, y)
  y += 7

  // Summary stats row
  const summaryStats = [
    {
      label: 'FINISH DATE',
      value: moviePlan.completionDate,
    },
    {
      label: 'TOTAL RUNTIME',
      value: `${moviePlan.totalRuntime} min`,
    },
    {
      label: 'TOTAL HOURS',
      value: formatHours(moviePlan.totalRuntime / 60),
    },
    {
      label: 'SESSIONS',
      value: `${moviePlan.totalSessions}`,
    },
  ]

  const statW = (W - M * 2 - 9) / 4
  summaryStats.forEach((s, i) => {
    const sx = M + i * (statW + 3)
    rgb(doc, 'fill', C.ink)
    rgb(doc, 'draw', C.border)
    doc.setLineWidth(0.2)
    doc.rect(sx, y, statW, 14, 'FD')

    rgb(doc, 'text', C.gold)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, sx + 3, y + 4.5)

    rgb(doc, 'text', C.parchment)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text(s.value, sx + 3, y + 11)
  })

  y += 20

  // Divider
  rgb(doc, 'draw', C.border)
  doc.setLineWidth(0.2)
  doc.line(M, y, W - M, y)
  y += 6

  // Session breakdown header
  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text('VIEWING SESSIONS', M, y)
  y += 5

  // Column headers
  rgb(doc, 'fill', C.ink)
  doc.rect(M, y - 1, W - M * 2, 6, 'F')

  const sessionCols = [
    { label: 'SESSION', x: M + 2, w: 16 },
    { label: 'DATE', x: M + 20, w: 40 },
    { label: 'TIME', x: M + 62, w: 38 },
    { label: 'DURATION', x: M + 102, w: 24 },
    { label: 'MINUTES', x: M + 128, w: W - M - 128 - M },
  ]

  sessionCols.forEach((col) => {
    rgb(doc, 'text', C.gold)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(col.label, col.x, y + 3.5)
  })
  y += 7

  // Session rows
  const footerStart = H - 42
  const rowH = 9

  moviePlan.sessions.forEach((session, i) => {
    if (y + rowH > footerStart) return

    const isLast = session.isComplete
    const isAlt = i % 2 === 1

    if (isLast) {
      rgb(doc, 'fill', C.ink)
      doc.rect(M, y - 1, W - M * 2, rowH, 'F')
      rgb(doc, 'draw', C.gold)
      doc.setLineWidth(0.2)
      doc.rect(M, y - 1, W - M * 2, rowH, 'S')
    } else if (isAlt) {
      rgb(doc, 'fill', [35, 26, 20])
      doc.rect(M, y - 1, W - M * 2, rowH, 'F')
    }

    // Session number
    rgb(doc, 'text', isLast ? C.gold : C.parchment)
    doc.setFontSize(8)
    doc.setFont('helvetica', isLast ? 'bold' : 'normal')
    doc.text(`${session.sessionNumber}`, sessionCols[0].x, y + 5)

    // Date
    rgb(doc, 'text', isLast ? C.parchment : C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(
      session.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      sessionCols[1].x,
      y + 5
    )

    // Time
    doc.text(
      `${formatTime(session.start)} – ${formatTime(session.end)}`,
      sessionCols[2].x,
      y + 5
    )

    // Duration
    rgb(doc, 'text', C.gold)
    doc.text(`${session.durationMins} min`, sessionCols[3].x, y + 5)

    // Minute range
    rgb(doc, 'text', C.muted)
    doc.setFontSize(7)
    doc.text(
      `${session.minuteStart}–${session.minuteEnd}`,
      sessionCols[4].x,
      y + 5
    )

    // Completion marker
    if (isLast) {
      rgb(doc, 'text', C.gold)
      doc.setFontSize(6.5)
      doc.text('✓ COMPLETE', W - M - 2, y + 5, { align: 'right' })
    }

    // Progress bar under each row
    const barY = y + 6.5
    const barW = W - M * 2
    const fillPct = session.minuteEnd / moviePlan.totalRuntime
    rgb(doc, 'fill', C.border)
    doc.rect(M, barY, barW, 1, 'F')
    rgb(doc, 'fill', isLast ? C.gold : [100, 65, 20])
    doc.rect(M, barY, barW * fillPct, 1, 'F')

    y += rowH
  })

  // If sessions were cut off
  const shownSessions = Math.min(
    moviePlan.sessions.length,
    Math.floor((footerStart - (y - moviePlan.sessions.length * rowH)) / rowH)
  )
  if (shownSessions < moviePlan.sessions.length) {
    rgb(doc, 'text', C.muted)
    doc.setFontSize(6.5)
    doc.text(
      `Scan QR code to view all ${moviePlan.sessions.length} sessions`,
      M,
      y + 3
    )
  }

  drawFooter(doc, W, H, M, title, qrDataUrl)
}

// ── TV PDF ─────────────────────────────────────────────────────────────────────
async function exportTVPdf(
  doc: jsPDF,
  W: number,
  H: number,
  M: number,
  title: string,
  releaseYear: string,
  genres: string[] | undefined,
  posterUrl: string | null | undefined,
  plan: WatchPlan,
  qrDataUrl: string
) {
  drawHeader(doc, W, M)

  const imgData = posterUrl ? await loadImageAsBase64(posterUrl) : null
  let y = drawPosterAndTitle(
    doc,
    M,
    W,
    imgData,
    title,
    releaseYear,
    genres,
    'SERIES'
  )

  // Divider
  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.4)
  doc.line(M, y, W - M, y)
  y += 7

  // Stats grid
  const stats = [
    { label: 'DONE BY', value: plan.completionDate },
    { label: 'TOTAL WEEKS', value: `${plan.totalWeeks} weeks` },
    { label: 'EPS / WEEK', value: `${plan.episodesPerWeek} eps` },
    { label: 'TOTAL HOURS', value: formatHours(plan.totalHours) },
    {
      label: 'PACE',
      value: plan.pace.charAt(0).toUpperCase() + plan.pace.slice(1),
    },
    { label: 'TOTAL EPISODES', value: `${plan.totalEpisodes}` },
  ]

  const cols = 3
  const colW = (W - M * 2 - (cols - 1) * 3) / cols

  stats.forEach((s, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const sx = M + col * (colW + 3)
    const sy = y + row * 15

    rgb(doc, 'fill', C.ink)
    rgb(doc, 'draw', C.border)
    doc.setLineWidth(0.2)
    doc.rect(sx, sy, colW, 12, 'FD')

    rgb(doc, 'text', C.gold)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, sx + 3, sy + 4.5)

    rgb(doc, 'text', C.parchment)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(doc.splitTextToSize(s.value, colW - 6)[0], sx + 3, sy + 10)
  })

  const statRows = Math.ceil(stats.length / cols)
  y += statRows * 15 + 5

  // Divider
  rgb(doc, 'draw', C.border)
  doc.setLineWidth(0.2)
  doc.line(M, y, W - M, y)
  y += 6

  // Milestones
  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text('MILESTONES', M, y)
  y += 5

  const mW = (W - M * 2 - 9) / 4
  plan.milestones.forEach((m, i) => {
    const mx = M + i * (mW + 3)
    rgb(doc, 'fill', C.ink)
    rgb(doc, 'draw', C.border)
    doc.setLineWidth(0.2)
    doc.rect(mx, y, mW, 20, 'FD')

    rgb(doc, 'text', C.gold)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${m.percent}%`, mx + mW / 2, y + 9, { align: 'center' })

    rgb(doc, 'text', C.parchment)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    const labelLines = doc.splitTextToSize(m.label, mW - 4)
    doc.text(labelLines[0], mx + mW / 2, y + 14, { align: 'center' })

    rgb(doc, 'text', C.muted)
    doc.setFontSize(6)
    doc.text(`Week ${m.week}`, mx + mW / 2, y + 18.5, { align: 'center' })
  })

  y += 26

  // Divider
  rgb(doc, 'draw', C.border)
  doc.setLineWidth(0.2)
  doc.line(M, y, W - M, y)
  y += 6

  // Weekly breakdown
  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.text('WEEK BY WEEK', M, y)
  y += 5

  const footerStart = H - 42
  const rowH = 7

  // Column headers
  rgb(doc, 'fill', C.ink)
  doc.rect(M, y - 1, W - M * 2, 5.5, 'F')
  const weekCols = [
    { label: 'WK', x: M + 2 },
    { label: 'EPISODES', x: M + 18 },
    { label: 'COUNT', x: M + 65 },
    { label: 'HOURS', x: M + 90 },
    { label: 'PROGRESS', x: M + 115 },
  ]
  weekCols.forEach((col) => {
    rgb(doc, 'text', C.gold)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(col.label, col.x, y + 3.5)
  })
  y += 7

  let shownWeeks = 0
  for (const block of plan.weeklyBlocks) {
    if (y + rowH > footerStart) break

    const isLast = block.endEpisode >= plan.totalEpisodes
    const isAlt = shownWeeks % 2 === 1

    if (isLast) {
      rgb(doc, 'fill', C.ink)
      doc.rect(M, y - 1, W - M * 2, rowH, 'F')
      rgb(doc, 'draw', C.gold)
      doc.setLineWidth(0.2)
      doc.rect(M, y - 1, W - M * 2, rowH, 'S')
    } else if (isAlt) {
      rgb(doc, 'fill', [35, 26, 20])
      doc.rect(M, y - 1, W - M * 2, rowH, 'F')
    }

    rgb(doc, 'text', isLast ? C.gold : C.parchment)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', isLast ? 'bold' : 'normal')
    doc.text(`${block.week}`, weekCols[0].x, y + 4)

    rgb(doc, 'text', C.muted)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Eps ${block.startEpisode}–${block.endEpisode}`,
      weekCols[1].x,
      y + 4
    )
    doc.text(`${block.episodes}`, weekCols[2].x, y + 4)
    doc.text(`${block.hoursWatched}h`, weekCols[3].x, y + 4)

    const bx = weekCols[4].x
    const bw = W - M - bx - M
    const fillW = (bw * block.cumulativePercent) / 100
    rgb(doc, 'fill', C.border)
    doc.rect(bx, y + 1, bw, 2.5, 'F')
    rgb(doc, 'fill', isLast ? C.gold : [100, 65, 20])
    doc.rect(bx, y + 1, fillW, 2.5, 'F')

    rgb(doc, 'text', C.muted)
    doc.setFontSize(6)
    doc.text(`${block.cumulativePercent}%`, W - M - 2, y + 4, {
      align: 'right',
    })

    y += rowH
    shownWeeks++
  }

  if (shownWeeks < plan.weeklyBlocks.length) {
    rgb(doc, 'text', C.muted)
    doc.setFontSize(6)
    doc.text(
      `+ ${plan.weeklyBlocks.length - shownWeeks} more weeks — scan QR for full plan`,
      M,
      y + 3
    )
  }

  drawFooter(doc, W, H, M, title, qrDataUrl)
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────────
export async function exportPlanAsPdf(
  plan: WatchPlan,
  title: string,
  releaseYear: string,
  posterUrl?: string | null,
  genres?: string[],
  shareUrl?: string,
  moviePlan?: MoviePlan | null
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 14

  // Background
  rgb(doc, 'fill', C.espresso)
  doc.rect(0, 0, W, H, 'F')

  const url =
    shareUrl ??
    (typeof window !== 'undefined'
      ? window.location.href
      : 'https://bingeplan.vercel.app')

  const qrDataUrl = await generateQRDataUrl(url)

  if (moviePlan && moviePlan.sessions.length > 0) {
    await exportMoviePdf(
      doc,
      W,
      H,
      M,
      title,
      releaseYear,
      genres,
      posterUrl,
      moviePlan,
      qrDataUrl
    )
  } else {
    await exportTVPdf(
      doc,
      W,
      H,
      M,
      title,
      releaseYear,
      genres,
      posterUrl,
      plan,
      qrDataUrl
    )
  }

  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-watch-plan.pdf`)
}
