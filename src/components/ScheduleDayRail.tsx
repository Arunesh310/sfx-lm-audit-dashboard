import { memo, useMemo } from 'react'
import type { ReportFrequency } from '../data/reports'
import { getSendMarkers, istParts } from '../lib/schedule'

type Props = {
  frequency: ReportFrequency
  compact?: boolean
  now?: Date
}

function ScheduleDayRailInner({ frequency, compact, now = new Date() }: Props) {
  const markers = useMemo(() => getSendMarkers(frequency, now), [frequency, now])
  const nowPct = useMemo(() => {
    const { minutesSinceMidnight } = istParts(now)
    return (minutesSinceMidnight / (24 * 60)) * 100
  }, [now])

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
            <span
              key={mark.minute}
              className={`day-rail-dot ${mark.passed ? 'passed' : 'upcoming'}`}
              style={{ left: `${left}%` }}
              title={`${String(Math.floor(mark.minute / 60)).padStart(2, '0')}:${String(mark.minute % 60).padStart(2, '0')}`}
            />
          )
        })}
        <span className="day-rail-now" style={{ left: `${nowPct}%` }} aria-hidden />
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

export const ScheduleDayRail = memo(ScheduleDayRailInner)
