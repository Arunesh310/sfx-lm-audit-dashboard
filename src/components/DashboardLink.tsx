import type { MouseEvent } from 'react'
import type { ReportDefinition } from '../data/reports'

type Props = {
  dashboard: NonNullable<ReportDefinition['dashboard']>
  className?: string
  onClick?: (e: MouseEvent) => void
}

export function DashboardLink({ dashboard, className = 'dashboard-ref', onClick }: Props) {
  return (
    <p className={className}>
      Dashboard ·{' '}
      <a
        href={dashboard.url}
        target="_blank"
        rel="noopener noreferrer"
        className="dashboard-anchor"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(e)
        }}
      >
        {dashboard.label}
        <span className="ext" aria-hidden>
          ↗
        </span>
      </a>
    </p>
  )
}
