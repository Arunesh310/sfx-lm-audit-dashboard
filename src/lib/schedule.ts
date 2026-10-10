import type { ReportDefinition, ReportFrequency } from '../data/reports'

const IST = 'Asia/Kolkata'

export function istParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value]),
  ) as Record<string, string>
  const hour = parseInt(parts.hour ?? '0', 10)
  const minute = parseInt(parts.minute ?? '0', 10)
  return {
    label: now.toLocaleDateString('en-IN', {
      timeZone: IST,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    minutesSinceMidnight: hour * 60 + minute,
  }
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map((x) => parseInt(x, 10))
  return (h ?? 0) * 60 + (m ?? 0)
}

export function expectedSendsPerDay(frequency: ReportFrequency): number {
  if (frequency.kind === 'slots') return frequency.times.length
  if (frequency.roundTheClock) return Math.floor(24 / frequency.hours)
  return Math.floor(24 / frequency.hours)
}

export function sendsSoFarToday(frequency: ReportFrequency, now = new Date()): number {
  const { minutesSinceMidnight } = istParts(now)
  if (frequency.kind === 'slots') {
    return frequency.times.filter((t) => parseTime(t) <= minutesSinceMidnight).length
  }
  const intervalMin = frequency.hours * 60
  return Math.floor(minutesSinceMidnight / intervalMin) + (minutesSinceMidnight >= 0 ? 1 : 0)
}

export function nextSendLabel(frequency: ReportFrequency, now = new Date()): string {
  const { minutesSinceMidnight } = istParts(now)
  if (frequency.kind === 'slots') {
    const next = frequency.times.map(parseTime).find((m) => m > minutesSinceMidnight)
    if (next == null) return 'Tomorrow · first slot'
    const h = Math.floor(next / 60)
    const min = next % 60
    return `Today · ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} IST`
  }
  const intervalMin = frequency.hours * 60
  const next = Math.ceil((minutesSinceMidnight + 1) / intervalMin) * intervalMin
  if (next >= 24 * 60) return 'Tomorrow · 00:00 IST'
  const h = Math.floor(next / 60)
  const min = next % 60
  return `Today · ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} IST`
}

export function scheduleSummary(frequency: ReportFrequency): string {
  if (frequency.kind === 'slots') {
    return frequency.times
      .map((t) => {
        const [h, m] = t.split(':').map(Number)
        const d = new Date()
        d.setHours(h ?? 0, m ?? 0, 0, 0)
        return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      })
      .join(' / ')
  }
  if (frequency.roundTheClock) return 'Round the clock · IST'
  return `Every ${frequency.hours}h · IST`
}

export function aggregateDailyStats(reports: ReportDefinition[], now = new Date()) {
  const expectedToday = reports.reduce((n, r) => n + expectedSendsPerDay(r.frequency), 0)
  const sentSoFar = reports.reduce((n, r) => n + sendsSoFarToday(r.frequency, now), 0)
  return { expectedToday, sentSoFar, remainingToday: expectedToday - sentSoFar }
}

export type SendMarker = { minute: number; passed: boolean }

export function getSendMarkers(frequency: ReportFrequency, now = new Date()): SendMarker[] {
  const { minutesSinceMidnight } = istParts(now)
  if (frequency.kind === 'slots') {
    return frequency.times.map((t) => ({
      minute: parseTime(t),
      passed: parseTime(t) <= minutesSinceMidnight,
    }))
  }
  const intervalMin = frequency.hours * 60
  const markers: SendMarker[] = []
  for (let m = 0; m < 24 * 60; m += intervalMin) {
    markers.push({ minute: m, passed: m <= minutesSinceMidnight })
  }
  return markers
}

function minutesUntilNext(frequency: ReportFrequency, now = new Date()): number | null {
  const { minutesSinceMidnight } = istParts(now)
  if (frequency.kind === 'slots') {
    const next = frequency.times.map(parseTime).find((m) => m > minutesSinceMidnight)
    if (next == null) return null
    return next - minutesSinceMidnight
  }
  const intervalMin = frequency.hours * 60
  const next = Math.ceil((minutesSinceMidnight + 1) / intervalMin) * intervalMin
  if (next >= 24 * 60) return null
  return next - minutesSinceMidnight
}

export function nextGlobalSend(
  reports: ReportDefinition[],
  now = new Date(),
): { report: ReportDefinition; minutes: number; label: string } | null {
  let best: { report: ReportDefinition; minutes: number } | null = null
  for (const report of reports) {
    const mins = minutesUntilNext(report.frequency, now)
    if (mins == null) continue
    if (!best || mins < best.minutes) best = { report, minutes: mins }
  }
  if (!best) return null
  const h = Math.floor(best.minutes / 60)
  const m = best.minutes % 60
  const label =
    h > 0 ? `in ${h}h ${m}m` : m > 0 ? `in ${m} min` : 'imminent'
  return { ...best, label }
}

export function formatIstClock(now = new Date()): string {
  return now.toLocaleTimeString('en-IN', {
    timeZone: IST,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}
