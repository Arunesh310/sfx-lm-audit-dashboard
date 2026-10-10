import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatedNumber } from './components/AnimatedNumber'
import { LiveIstClock } from './components/LiveIstClock'
import { ScheduleDayRail } from './components/ScheduleDayRail'
import { ScrollToTop } from './components/ScrollToTop'
import { REPORTS, type ReportDefinition } from './data/reports'
import { useNow } from './hooks/useNow'
import {
  aggregateDailyStats,
  expectedSendsPerDay,
  istParts,
  nextGlobalSend,
  nextSendLabel,
  scheduleSummary,
  sendsSoFarToday,
} from './lib/schedule'
import { fadeUp, spring, springSoft, staggerContainer, staggerItem } from './lib/motion'
import './App.css'

type Tab = 'overview' | string
type SortMode = 'order' | 'progress' | 'frequency'

function OverviewCard({
  report,
  index,
  onOpen,
  now,
}: {
  report: ReportDefinition
  index: number
  onOpen: () => void
  now: Date
}) {
  const perDay = expectedSendsPerDay(report.frequency)
  const soFar = sendsSoFarToday(report.frequency, now)
  const progress = perDay > 0 ? Math.min(100, (soFar / perDay) * 100) : 0

  return (
    <motion.article
      className="card card-clickable"
      variants={staggerItem}
      layout
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      whileHover={{ y: -4, transition: springSoft }}
      whileTap={{ scale: 0.992 }}
      aria-label={`Open ${report.title}`}
    >
      <div className="card-top">
        <span className="index">{String(index + 1).padStart(2, '0')}</span>
        <motion.span className="freq" layout transition={spring}>
          {report.frequency.label}
        </motion.span>
      </div>
      <h2>{report.title}</h2>
      <p className="regarding">{report.regarding}</p>
      <ScheduleDayRail frequency={report.frequency} compact now={now} />
      <p className="schedule">{scheduleSummary(report.frequency)}</p>
      <div className="progress-track" aria-hidden>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ...springSoft, delay: 0.08 + index * 0.04 }}
        />
      </div>
      <dl className="meta">
        <div>
          <dt>Expected / day</dt>
          <dd>
            <AnimatedNumber value={perDay} />
          </dd>
        </div>
        <div>
          <dt>Sent today</dt>
          <dd>
            <AnimatedNumber value={soFar} />
            <span className="pct">{Math.round(progress)}%</span>
          </dd>
        </div>
      </dl>
      <span className="linkish">View logic →</span>
    </motion.article>
  )
}

function ReportDetail({
  report,
  onBack,
  now,
}: {
  report: ReportDefinition
  onBack: () => void
  now: Date
}) {
  const perDay = expectedSendsPerDay(report.frequency)
  const soFar = sendsSoFarToday(report.frequency, now)
  const [copied, setCopied] = useState(false)

  const panelVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { ...springSoft, delay: 0.06 * i },
    }),
  }

  const copyLogic = async () => {
    const text = [
      report.title,
      report.regarding,
      '',
      'Logic:',
      ...report.logic.map((l) => `• ${l}`),
    ].join('\n')
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
      transition={spring}
    >
      <div className="detail-toolbar">
        <motion.button
          type="button"
          className="back"
          onClick={onBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          transition={springSoft}
        >
          ← All reports
        </motion.button>
        <motion.button
          type="button"
          className="copy-btn"
          onClick={copyLogic}
          whileTap={{ scale: 0.97 }}
        >
          {copied ? 'Copied' : 'Copy logic'}
        </motion.button>
      </div>
      <header className="detail-head">
        <p className="freq-line">
          {report.frequency.label} · {scheduleSummary(report.frequency)}
        </p>
        <motion.h1 layout="position" transition={spring}>
          {report.title}
        </motion.h1>
        <p className="regarding">{report.regarding}</p>
      </header>

      <motion.section
        className="panel"
        custom={0}
        variants={panelVariants}
        initial="hidden"
        animate="show"
      >
        <h3>Today · IST</h3>
        <ScheduleDayRail frequency={report.frequency} now={now} />
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
          <li>Next slot · {nextSendLabel(report.frequency, now)}</li>
        </ul>
      </motion.section>

      <motion.section
        className="panel"
        custom={1}
        variants={panelVariants}
        initial="hidden"
        animate="show"
      >
        <h3>Logic</h3>
        <motion.ul className="logic" variants={staggerContainer} initial="initial" animate="animate">
          {report.logic.map((line, i) => (
            <motion.li key={line} variants={staggerItem} className="logic-item">
              <span className="logic-num">{i + 1}</span>
              <span>{line}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.section>

      {report.views && report.views.length > 0 && (
        <motion.section
          className="panel"
          custom={2}
          variants={panelVariants}
          initial="hidden"
          animate="show"
        >
          <h3>Views</h3>
          <ul className="views">
            {report.views.map((v) => (
              <li key={v.id}>
                <strong>{v.label}</strong>
                <span>{v.description}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {report.notes && (
        <motion.section
          className="panel note"
          custom={3}
          variants={panelVariants}
          initial="hidden"
          animate="show"
        >
          <p>{report.notes}</p>
        </motion.section>
      )}
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
      {active && <motion.span className="tab-highlight" layoutId="tab-pill" transition={spring} />}
      <span className="tab-label">{children}</span>
    </button>
  )
}

function OverviewStats({
  stats,
  reportCount,
  next,
}: {
  stats: ReturnType<typeof aggregateDailyStats>
  reportCount: number
  next: ReturnType<typeof nextGlobalSend>
}) {
  const completion =
    stats.expectedToday > 0 ? Math.round((stats.sentSoFar / stats.expectedToday) * 100) : 0

  return (
    <motion.div
      className="stats-strip"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSoft, delay: 0.08 }}
    >
      <div className="stat-cell">
        <span className="stat-label">Report types</span>
        <span className="stat-value">{reportCount}</span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">Day progress</span>
        <span className="stat-value">{completion}%</span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">Remaining today</span>
        <span className="stat-value">
          <AnimatedNumber value={Math.max(0, stats.remainingToday)} />
        </span>
      </div>
      <div className="stat-cell stat-cell-wide">
        <span className="stat-label">Next send</span>
        <span className="stat-value stat-value-sm">
          {next ? (
            <>
              {next.report.title.split(' ').slice(0, 3).join(' ')} · {next.label}
            </>
          ) : (
            'None left today'
          )}
        </span>
      </div>
    </motion.div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('order')
  const now = useNow()

  const { label: dayLabel } = istParts(now)
  const stats = aggregateDailyStats(REPORTS, now)
  const next = nextGlobalSend(REPORTS, now)
  const dayProgress =
    stats.expectedToday > 0 ? Math.min(100, (stats.sentSoFar / stats.expectedToday) * 100) : 0

  const active = tab === 'overview' ? null : REPORTS.find((r) => r.id === tab)

  const goTab = useCallback((nextTab: Tab) => {
    setTab(nextTab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          sendsSoFarToday(b.frequency, now) / expectedSendsPerDay(b.frequency) -
          sendsSoFarToday(a.frequency, now) / expectedSendsPerDay(a.frequency),
      )
    } else if (sort === 'frequency') {
      list.sort((a, b) => expectedSendsPerDay(b.frequency) - expectedSendsPerDay(a.frequency))
    }
    return list
  }, [query, sort, now])

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

      <motion.header
        className="mast"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="brand">
          <motion.img
            className="logo"
            src="/logo.webp"
            alt="Shadowfax"
            width={40}
            height={40}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring}
            whileHover={{ scale: 1.05, rotate: -2 }}
          />
          <div>
            <p className="eyebrow">Shadowfax · LM audit</p>
            <h1 className="title">Report schedule dashboard</h1>
            <p className="subtitle">
              {dayLabel} · <LiveIstClock />
            </p>
          </div>
        </div>
        <motion.div
          className="summary-pill"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springSoft, delay: 0.12 }}
          title={`${Math.round(dayProgress)}% of scheduled sends have passed today`}
        >
          <div className="summary-progress" aria-hidden>
            <motion.div
              className="summary-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${dayProgress}%` }}
              transition={{ ...springSoft, delay: 0.2 }}
            />
          </div>
          <span>
            <strong>
              <AnimatedNumber value={stats.sentSoFar} />
            </strong>{' '}
            / {stats.expectedToday} sends today
          </span>
        </motion.div>
      </motion.header>

      <LayoutGroup>
        <nav className="tabs" aria-label="Reports">
          <TabButton active={tab === 'overview'} onClick={() => goTab('overview')}>
            Overview
          </TabButton>
          {REPORTS.map((r) => (
            <TabButton key={r.id} active={tab === r.id} onClick={() => goTab(r.id)}>
              {r.title.replace(' alert', '').replace(' · to and fro Bamnoli', '')}
            </TabButton>
          ))}
        </nav>
      </LayoutGroup>

      <main id="main-content" className="main-stage">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeUp}
              transition={spring}
            >
              <OverviewStats stats={stats} reportCount={REPORTS.length} next={next} />

              <div className="toolbar">
                <label className="search-wrap">
                  <span className="sr-only">Search reports</span>
                  <input
                    id="report-search"
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

              <motion.p
                className="lede"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Scheduled coverage — frequency, daily volume, and logic from{' '}
                <code>src/data/reports.ts</code>. Press <kbd>1</kbd>–<kbd>{REPORTS.length}</kbd> to
                jump to a report, <kbd>0</kbd> for overview.
              </motion.p>

              <motion.div
                className="grid"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredReports.map((r, i) => (
                    <OverviewCard
                      key={r.id}
                      index={i}
                      report={r}
                      onOpen={() => goTab(r.id)}
                      now={now}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredReports.length === 0 && (
                <p className="empty-search">No reports match “{query}”.</p>
              )}
            </motion.div>
          )}
          {active && (
            <ReportDetail key={active.id} report={active} onBack={() => goTab('overview')} now={now} />
          )}
        </AnimatePresence>
      </main>

      <footer className="site-foot">
        <span>Schedules in IST · updates every 30s</span>
        <span className="kbd-hint">Esc · back</span>
      </footer>

      <ScrollToTop />
    </div>
  )
}
