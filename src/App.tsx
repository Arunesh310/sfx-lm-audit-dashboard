import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatedNumber } from './components/AnimatedNumber'
import { DashboardLink } from './components/DashboardLink'
import { LiveIstClock } from './components/LiveIstClock'
import { ScheduleDayRail } from './components/ScheduleDayRail'
import { ScrollToTop } from './components/ScrollToTop'
import { PROGRAM_SUMMARY, REPORTS, type ReportDefinition } from './data/reports'
import { useNow } from './hooks/useNow'
import {
  aggregateDailyStats,
  expectedSendsPerDay,
  istParts,
  nextSendLabel,
  scheduleSummary,
  sendsSoFarToday,
} from './lib/schedule'
import { fadeUp, staggerContainer, staggerItem, tweenFast } from './lib/motion'
import './App.css'

type Tab = 'overview' | string
type SortMode = 'order' | 'progress' | 'frequency'

const OverviewCard = memo(function OverviewCard({
  report,
  onOpen,
  scheduleNow,
}: {
  report: ReportDefinition
  onOpen: () => void
  scheduleNow: Date
}) {
  const perDay = expectedSendsPerDay(report.frequency)
  const soFar = sendsSoFarToday(report.frequency, scheduleNow)
  const progress = perDay > 0 ? Math.min(100, (soFar / perDay) * 100) : 0

  return (
    <article
      className="card card-clickable ios-glass"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`Open ${report.title}`}
    >
      <div className="card-top">
        <span className="index">{report.number}</span>
        <span className="freq">{report.frequency.label}</span>
      </div>
      <h2>{report.title}</h2>
      {report.dashboard && <DashboardLink dashboard={report.dashboard} />}
      <p className="regarding">{report.regarding}</p>
      <ScheduleDayRail frequency={report.frequency} compact now={scheduleNow} />
      <p className="schedule">{scheduleSummary(report.frequency)}</p>
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="linkish">View logic →</span>
    </article>
  )
})

function ReportDetail({
  report,
  onBack,
  scheduleNow,
}: {
  report: ReportDefinition
  onBack: () => void
  scheduleNow: Date
}) {
  const perDay = expectedSendsPerDay(report.frequency)
  const soFar = sendsSoFarToday(report.frequency, scheduleNow)
  const [copied, setCopied] = useState(false)

  const copyLogic = async () => {
    const text = [
      `${report.number} ${report.title}`,
      report.regarding,
      '',
      `Source: ${report.dataSource}`,
      report.ageing ? `Ageing: ${report.ageing}` : '',
      report.dashboard
        ? `Dashboard: ${report.dashboard.label}${report.dashboard.url ? ` (${report.dashboard.url})` : ''}`
        : '',
      '',
      'Logic:',
      ...report.logic.map((l) => `• ${l}`),
      '',
      `Sharing: ${report.sharing}`,
      report.closureReport ? 'Day-end closure report: yes' : '',
      report.notes ?? '',
    ]
      .filter(Boolean)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="detail"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeUp}
      transition={tweenFast}
    >
      <div className="detail-toolbar">
        <button type="button" className="back" onClick={onBack}>
          ← All reports
        </button>
        <button type="button" className="copy-btn ios-glass-pill" onClick={copyLogic}>
          {copied ? 'Copied' : 'Copy logic'}
        </button>
      </div>
      <header className="detail-head ios-glass ios-glass-strong">
        <p className="freq-line">
          {report.frequency.label} · {scheduleSummary(report.frequency)}
        </p>
        <h1>{report.title}</h1>
        <p className="regarding">{report.regarding}</p>
        {report.dashboard && (
          <DashboardLink dashboard={report.dashboard} className="dashboard-ref detail-dashboard" />
        )}
        {!report.dashboard && report.id === 'p0-metric-report' && (
          <p className="dashboard-ref detail-dashboard muted-dash">Not a live dashboard — one Excel summary sheet.</p>
        )}
      </header>

      <div className="detail-panels">
        <section className="panel ios-glass">
          <h3>Today · IST</h3>
          <ScheduleDayRail frequency={report.frequency} now={scheduleNow} />
          <ul className="stats-inline">
            <li>
              <strong>
                <AnimatedNumber value={soFar} />
              </strong>{' '}
              sent so far
            </li>
            <li>
              <strong>
                <AnimatedNumber value={perDay} />
              </strong>{' '}
              scheduled per day
            </li>
            <li>Next slot · {nextSendLabel(report.frequency, scheduleNow)}</li>
          </ul>
        </section>

        <section className="panel ios-glass">
          <h3>Data source</h3>
          <p className="panel-body">{report.dataSource}</p>
        </section>

        {report.ageing && (
          <section className="panel ios-glass">
            <h3>Ageing</h3>
            <p className="panel-body">{report.ageing}</p>
          </section>
        )}

        <section className="panel ios-glass panel-span-full">
          <h3>Logic</h3>
          <ul className="logic">
            {report.logic.map((line, i) => (
              <li key={line} className="logic-item">
                <span className="logic-num">{i + 1}</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {report.views && report.views.length > 0 && (
          <section className="panel ios-glass panel-span-full">
            <h3>Views</h3>
            <ul className="views">
              {report.views.map((v) => (
                <li key={v.id}>
                  <strong>{v.label}</strong>
                  <span>{v.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="panel ios-glass">
          <h3>Sharing</h3>
          <p className="panel-body">{report.sharing}</p>
          {report.closureReport && (
            <p className="panel-body closure-tag">Day-end closure report published.</p>
          )}
        </section>

        {report.notes && (
          <section className="panel note ios-glass panel-span-full">
            <p>{report.notes}</p>
          </section>
        )}
      </div>
    </motion.div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className={`tab-btn ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="tab-label">{children}</span>
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('order')
  const now = useNow()

  const scheduleNow = useMemo(() => now, [now.getTime()])
  const { label: dayLabel } = istParts(scheduleNow)
  const stats = useMemo(() => aggregateDailyStats(REPORTS, scheduleNow), [scheduleNow])
  const dayProgress =
    stats.expectedToday > 0 ? Math.min(100, (stats.sentSoFar / stats.expectedToday) * 100) : 0

  const active = tab === 'overview' ? null : REPORTS.find((r) => r.id === tab)

  const goTab = useCallback((nextTab: Tab) => {
    setTab(nextTab)
    window.scrollTo(0, 0)
  }, [])

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? REPORTS.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.regarding.toLowerCase().includes(q) ||
            r.logic.some((l) => l.toLowerCase().includes(q)),
        )
      : [...REPORTS]

    if (sort === 'progress') {
      list.sort(
        (a, b) =>
          sendsSoFarToday(b.frequency, scheduleNow) / expectedSendsPerDay(b.frequency) -
          sendsSoFarToday(a.frequency, scheduleNow) / expectedSendsPerDay(a.frequency),
      )
    } else if (sort === 'frequency') {
      list.sort((a, b) => expectedSendsPerDay(b.frequency) - expectedSendsPerDay(a.frequency))
    }
    return list
  }, [query, sort, scheduleNow])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape' && tab !== 'overview') {
        goTab('overview')
        return
      }
      if (e.key === '/' && tab === 'overview') {
        e.preventDefault()
        document.getElementById('report-search')?.focus()
        return
      }
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= REPORTS.length && !e.metaKey && !e.ctrlKey && !e.altKey) {
        goTab(REPORTS[num - 1]!.id)
      }
      if (e.key === '0') goTab('overview')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTab, tab])

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="mast ios-glass ios-glass-strong">
        <div className="brand">
          <img className="logo" src="/logo.webp" alt="Shadowfax" width={40} height={40} />
          <div>
            <p className="eyebrow">SHADOWFAX · {PROGRAM_SUMMARY.documentDate}</p>
            <h1 className="title">{PROGRAM_SUMMARY.title}</h1>
            <p className="subtitle">
              {dayLabel} · <LiveIstClock />
            </p>
          </div>
        </div>
        <div
          className="summary-pill ios-glass ios-glass-pill"
          title={`${Math.round(dayProgress)}% of scheduled sends have passed today`}
        >
          <div className="summary-progress" aria-hidden>
            <div className="summary-progress-fill" style={{ width: `${dayProgress}%` }} />
          </div>
          <span>
            <strong>
              <AnimatedNumber value={stats.sentSoFar} />
            </strong>{' '}
            / {stats.expectedToday} scheduled sends · IST
          </span>
        </div>
      </header>

      <div className="tabs-scroll">
        <nav className="tabs ios-glass" aria-label="Reports">
          <TabButton active={tab === 'overview'} onClick={() => goTab('overview')}>
            Overview
          </TabButton>
          {REPORTS.map((r) => (
            <TabButton key={r.id} active={tab === r.id} onClick={() => goTab(r.id)}>
              {r.number} {r.title.length > 18 ? r.title.split(' ')[0] : r.title}
            </TabButton>
          ))}
        </nav>
      </div>

      <main id="main-content" className="main-stage">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              className="overview-page"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeUp}
              transition={tweenFast}
            >
              <div className="toolbar">
                <label className="search-wrap">
                  <span className="sr-only">Search reports</span>
                  <input
                    id="report-search"
                    className="ios-glass-input"
                    type="search"
                    placeholder="Search reports…  ( / )"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                </label>
                <div className="sort-chips" role="group" aria-label="Sort">
                  {(
                    [
                      ['order', 'Default'],
                      ['progress', 'Progress'],
                      ['frequency', 'Volume'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`chip ${sort === id ? 'active' : ''}`}
                      onClick={() => setSort(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div
                className="grid"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredReports.map((r) => (
                  <motion.div key={r.id} variants={staggerItem} transition={tweenFast}>
                    <OverviewCard report={r} onOpen={() => goTab(r.id)} scheduleNow={scheduleNow} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredReports.length === 0 && (
                <p className="empty-search ios-glass">No reports match “{query}”.</p>
              )}
            </motion.div>
          )}
          {active && (
            <ReportDetail
              key={active.id}
              report={active}
              onBack={() => goTab('overview')}
              scheduleNow={scheduleNow}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="site-foot ios-glass">
        <span>Schedules in IST · updates every minute</span>
        <span className="kbd-hint">Esc · back</span>
      </footer>

      <ScrollToTop />
    </div>
  )
}
