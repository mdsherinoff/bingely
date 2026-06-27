import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { WatchPlan } from '@/types/media'

// Color constants
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
    color: {
      dark: '#C9922A',
      light: '#1A1410',
    },
  })
}

export async function exportPlanAsPdf(
  plan: WatchPlan,
  title: string,
  releaseYear: string,
  posterUrl?: string | null,
  genres?: string[],
  shareUrl?: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 14

  // ── Background ──────────────────────────────────────────────
  rgb(doc, 'fill', C.espresso)
  doc.rect(0, 0, W, H, 'F')

  // ── Top bar ─────────────────────────────────────────────────
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

  // ── Gold rule ────────────────────────────────────────────────
  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.6)
  doc.line(M, 12, W - M, 12)

  // ── Poster ───────────────────────────────────────────────────
  const posterX = M
  const posterY = 18
  const posterW = 42
  const posterH = 63

  rgb(doc, 'fill', C.ink)
  rgb(doc, 'draw', C.border)
  doc.setLineWidth(0.3)
  doc.rect(posterX, posterY, posterW, posterH, 'FD')

  if (posterUrl) {
    const imgData = await loadImageAsBase64(posterUrl)
    if (imgData) {
      doc.addImage(imgData, 'JPEG', posterX, posterY, posterW, posterH)
    } else {
      rgb(doc, 'text', C.gold)
      doc.setFontSize(16)
      doc.text('◎', posterX + posterW / 2, posterY + posterH / 2, {
        align: 'center',
      })
    }
  } else {
    rgb(doc, 'text', C.gold)
    doc.setFontSize(16)
    doc.text('◎', posterX + posterW / 2, posterY + posterH / 2, {
      align: 'center',
    })
  }

  // ── Title block (right of poster) ────────────────────────────
  const titleX = posterX + posterW + 8
  const titleW = W - titleX - M
  let ty = posterY + 6

  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text(plan.mediaType === 'tv' ? 'SERIES' : 'FILM', titleX, ty)
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
    rgb(doc, 'text', C.muted)
    doc.setFontSize(7.5)
    doc.text(genres.slice(0, 3).join(' · '), titleX, ty)
    ty += 6
  }

  ty += 2

  // ── Stat pills ───────────────────────────────────────────────
  const stats =
    plan.mediaType === 'tv'
      ? [
          { label: 'DONE BY', value: plan.completionDate },
          { label: 'WEEKS', value: `${plan.totalWeeks}` },
          { label: 'EPS/WEEK', value: `${plan.episodesPerWeek}` },
          { label: 'HOURS', value: formatHours(plan.totalHours) },
          { label: 'PACE', value: plan.pace.toUpperCase() },
        ]
      : [
          { label: 'DONE BY', value: plan.completionDate },
          { label: 'RUNTIME', value: `${plan.runtime} min` },
          { label: 'HOURS', value: formatHours(plan.totalHours) },
        ]

  const pillW = titleW / 2 - 2
  const pillH = 12

  stats.forEach((s, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const px = titleX + col * (pillW + 4)
    const py = ty + row * (pillH + 3)

    rgb(doc, 'fill', C.ink)
    rgb(doc, 'draw', C.border)
    doc.setLineWidth(0.2)
    doc.rect(px, py, pillW, pillH, 'FD')

    rgb(doc, 'text', C.gold)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text(s.label, px + 3, py + 4)

    rgb(doc, 'text', C.parchment)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const val = doc.splitTextToSize(s.value, pillW - 6)
    doc.text(val[0], px + 3, py + 9.5)
  })

  // ── Section divider ──────────────────────────────────────────
  const sectionY = posterY + posterH + 10

  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.4)
  doc.line(M, sectionY, W - M, sectionY)

  // ── Milestones ───────────────────────────────────────────────
  let y = sectionY + 7

  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text('MILESTONES', M, y)
  y += 5

  const milestoneW = (W - M * 2 - 9) / 4

  plan.milestones.forEach((m, i) => {
    const mx = M + i * (milestoneW + 3)

    // Box
    rgb(doc, 'fill', C.ink)
    rgb(doc, 'draw', C.border)
    doc.setLineWidth(0.2)
    doc.rect(mx, y, milestoneW, 20, 'FD')

    // Percent
    rgb(doc, 'text', C.gold)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${m.percent}%`, mx + milestoneW / 2, y + 9, { align: 'center' })

    // Label
    rgb(doc, 'text', C.parchment)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    const labelLines = doc.splitTextToSize(m.label, milestoneW - 4)
    doc.text(labelLines[0], mx + milestoneW / 2, y + 14, { align: 'center' })

    // Week
    rgb(doc, 'text', C.muted)
    doc.setFontSize(6)
    doc.text(`Week ${m.week}`, mx + milestoneW / 2, y + 18.5, {
      align: 'center',
    })
  })

  y += 26

  // ── Progress bar ─────────────────────────────────────────────
  rgb(doc, 'text', C.gold)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.text('OVERALL PROGRESS', M, y)
  y += 4

  const barH = 4
  const barW = W - M * 2

  rgb(doc, 'fill', C.ink)
  doc.rect(M, y, barW, barH, 'F')

  // Milestone markers on bar
  plan.milestones.forEach((m) => {
    const fillW = (barW * m.percent) / 100
    if (m.percent === 100) {
      rgb(doc, 'fill', C.gold)
      doc.rect(M, y, fillW, barH, 'F')
    }
    // Tick mark
    rgb(doc, 'draw', C.espresso)
    doc.setLineWidth(0.5)
    doc.line(M + fillW, y, M + fillW, y + barH)
  })

  // Show empty bar outline
  rgb(doc, 'draw', C.border)
  doc.setLineWidth(0.3)
  doc.rect(M, y, barW, barH, 'D')

  y += barH + 6

  // ── Weekly breakdown (compact) ───────────────────────────────
  if (plan.mediaType === 'tv' && plan.weeklyBlocks.length > 0) {
    rgb(doc, 'draw', C.border)
    doc.setLineWidth(0.2)
    doc.line(M, y, W - M, y)
    y += 5

    rgb(doc, 'text', C.gold)
    doc.setFontSize(6.5)
    doc.text('WEEK BY WEEK', M, y)
    y += 4

    // How many weeks fit before QR section (leave 40mm for QR)
    const rowH = 6.5
    const availableH = H - 50 - y
    const maxRows = Math.floor(availableH / rowH)
    const weeksToShow = Math.min(plan.weeklyBlocks.length, maxRows)

    // Column widths
    const cols = [
      { label: 'WK', x: M, w: 10 },
      { label: 'EPISODES', x: M + 12, w: 35 },
      { label: 'COUNT', x: M + 49, w: 20 },
      { label: 'HOURS', x: M + 71, w: 20 },
      { label: 'PROGRESS', x: M + 93, w: W - M - 93 - M },
    ]

    // Header row
    rgb(doc, 'fill', C.ink)
    doc.rect(M, y, W - M * 2, 5, 'F')
    cols.forEach((col) => {
      rgb(doc, 'text', C.gold)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'normal')
      doc.text(col.label, col.x + 1, y + 3.5)
    })
    y += 6

    plan.weeklyBlocks.slice(0, weeksToShow).forEach((block) => {
      const isLast = block.endEpisode >= plan.totalEpisodes

      if (isLast) {
        rgb(doc, 'fill', C.ink)
        doc.rect(M, y - 1, W - M * 2, rowH, 'F')
      }

      rgb(doc, 'text', isLast ? C.gold : C.parchment)
      doc.setFontSize(6.5)
      doc.setFont('helvetica', isLast ? 'bold' : 'normal')
      doc.text(`${block.week}`, cols[0].x + 1, y + 3.5)

      rgb(doc, 'text', C.muted)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Eps ${block.startEpisode}–${block.endEpisode}`,
        cols[1].x + 1,
        y + 3.5
      )
      doc.text(`${block.episodes}`, cols[2].x + 1, y + 3.5)
      doc.text(`${block.hoursWatched}h`, cols[3].x + 1, y + 3.5)

      // Mini bar
      const bx = cols[4].x + 1
      const bw = cols[4].w - 10
      const fillW = (bw * block.cumulativePercent) / 100
      rgb(doc, 'fill', C.border)
      doc.rect(bx, y + 1, bw, 2, 'F')
      rgb(doc, 'fill', isLast ? C.gold : [120, 80, 30])
      doc.rect(bx, y + 1, fillW, 2, 'F')

      rgb(doc, 'text', C.muted)
      doc.setFontSize(5.5)
      doc.text(`${block.cumulativePercent}%`, bx + bw + 2, y + 3.5)

      y += rowH
    })

    if (plan.weeklyBlocks.length > weeksToShow) {
      rgb(doc, 'text', C.muted)
      doc.setFontSize(6)
      doc.text(
        `+ ${plan.weeklyBlocks.length - weeksToShow} more weeks — view full plan via QR code`,
        M,
        y + 3
      )
      y += 6
    }
  }

  // ── QR code + footer ─────────────────────────────────────────
  const footerY = H - 38
  rgb(doc, 'draw', C.gold)
  doc.setLineWidth(0.4)
  doc.line(M, footerY, W - M, footerY)

  const url =
    shareUrl ??
    (typeof window !== 'undefined'
      ? window.location.href
      : 'https://bingeplan.vercel.app')

  try {
    const qrDataUrl = await generateQRDataUrl(url)
    const qrSize = 26
    const qrX = W - M - qrSize
    const qrY = footerY + 5

    // QR background
    rgb(doc, 'fill', C.ink)
    doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'F')
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // QR label
    rgb(doc, 'text', C.muted)
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'normal')
    doc.text('SCAN FOR', qrX + qrSize / 2, qrY + qrSize + 4, {
      align: 'center',
    })
    doc.text('FULL PLAN', qrX + qrSize / 2, qrY + qrSize + 8, {
      align: 'center',
    })

    // Footer text
    rgb(doc, 'text', C.gold)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Bingely', M, footerY + 9)

    rgb(doc, 'text', C.muted)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Your personal cinema planner', M, footerY + 15)

    rgb(doc, 'text', C.muted)
    doc.setFontSize(6)
    doc.text('bingeplan.vercel.app', M, footerY + 21)
    doc.text(title, M, footerY + 27)
  } catch {
    // QR failed silently — footer still renders
    rgb(doc, 'text', C.gold)
    doc.setFontSize(7)
    doc.text('BINGELY · bingeplan.vercel.app', M, footerY + 10)
  }

  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-watch-plan.pdf`)
}
