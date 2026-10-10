import { motion } from 'framer-motion'
import type { ReportFrequency } from '../data/reports'
import { getSendMarkers, istParts } from '../lib/schedule'
import { springSoft } from '../lib/motion'

type Props = {
  frequency: ReportFrequency
  compact?: boolean
  now?: Date
}

export function ScheduleDayRail({ frequency, compact, now = new Date() }: Props) {
  const markers = getSendMarkers(frequency, now)
  const { minutesSinceMidnight } = istParts(now)
  const nowPct = (minutesSinceMidnight / (24 * 60)) * 100

  return (
    <div
      className={`day-rail ${compact ? 'compact' : ''}`}
      role="img"
      aria-label="Send schedule across the IST day"
    >
      <div className="day-rail-track">
        {markers.map((mark) => {
          const left = (mark.minute / (24 * 60)) * 100
          return (
            <motion.span
              key={mark.minute}
              className={`day-rail-dot ${mark.passed ? 'passed' : 'upcoming'}`}
              style={{ left: `${left}%` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springSoft, delay: left / 200 }}
              title={`${String(Math.floor(mark.minute / 60)).padStart(2, '0')}:${String(mark.minute % 60).padStart(2, '0')}`}
            />
          )
        })}
        <motion.span
          className="day-rail-now"
          style={{ left: `${nowPct}%` }}
          layout
          transition={springSoft}
          aria-hidden
        />
      </div>
      {!compact && (
        <div className="day-rail-labels">
          <span>12 AM</span>
          <span>12 PM</span>
          <span>11 PM</span>
        </div>
      )}
    </div>
  )
}
