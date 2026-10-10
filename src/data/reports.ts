/**
 * Report catalog — edit this file when you share updated logic.
 * No uploads: the dashboard derives frequency and “sends today” from these schedules (IST).
 */

export type ReportFrequency =
  | { kind: 'slots'; label: string; times: string[] }
  | { kind: 'interval'; label: string; hours: number; roundTheClock?: boolean }

export type ReportView = {
  id: string
  label: string
  description: string
}

export type ReportDefinition = {
  id: string
  title: string
  regarding: string
  frequency: ReportFrequency
  logic: string[]
  views?: ReportView[]
  notes?: string
}

export const REPORTS: ReportDefinition[] = [
  {
    id: 'departure-adherence',
    title: 'Origin departure adherence',
    regarding: 'Origin dock-out against scheduled departure',
    frequency: {
      kind: 'slots',
      label: '5× daily',
      times: ['09:00', '13:00', '17:00', '21:00', '23:00'],
    },
    logic: [
      'Compare actual origin dock-out time to scheduled departure (STD) for active linehaul trips.',
      'Flag trips where dock-out is late beyond the adherence threshold for the lane / product.',
      'Scope: national and zonal origins as configured for the audit pack.',
      'Sort by largest departure delay first.',
    ],
  },
  {
    id: 'unloading-pendency',
    title: 'Unloading pendency',
    regarding: 'National, zonal and intracity vehicles pending unloading',
    frequency: {
      kind: 'slots',
      label: '5× daily',
      times: ['06:00', '09:00', '13:00', '17:00', '21:00'],
    },
    logic: [
      'List vehicles arrived at destination (or hub) but not yet unloaded past the pending SLA.',
      'Split or tag by network: national, zonal, intracity where applicable.',
      'Include wait time since arrival and destination node.',
      'Sort by longest pending unload first.',
    ],
  },
  {
    id: 'ndd-bamnoli',
    title: 'NDD stoppage alert · to and fro Bamnoli',
    regarding: 'Active zonal trips with final destination NCR Bamnoli DC',
    frequency: {
      kind: 'interval',
      label: 'Hourly',
      hours: 1,
      roundTheClock: true,
    },
    logic: [
      'Covers all active zonal trips with final destination NCR Bamnoli DC.',
      'Stoppages table: stops lasting ≥ 30 minutes within the last hour; exclude stops within 1 km of a node.',
      'ETA table: upcoming via nodes with STA in the future when revised ETA is ≥ 1 hour later than STA.',
      'Sort trips by longest stoppage or worst ETA delay.',
    ],
    views: [
      {
        id: 'ndd-stop-1',
        label: 'NDD alert 1/2 — Stoppages ≥ 30 min (whole trip, last hour, not within 1 km of a node)',
        description: 'Stoppage-focused slice for the hourly Bamnoli corridor pack.',
      },
      {
        id: 'ndd-eta-1',
        label: 'NDD alert 2/2 — ETA delay vs STA on upcoming via nodes',
        description: 'ETA-focused slice when revised ETA breaches STA by ≥ 1 hour.',
      },
    ],
    notes: 'Exclude trips with empty tracking data when configured (e.g. specific TRP / vehicle IDs).',
  },
  {
    id: 'national-stoppage',
    title: 'National stoppage alert',
    regarding: 'National active or recently ended stoppages',
    frequency: {
      kind: 'interval',
      label: 'Every 2 hours',
      hours: 2,
      roundTheClock: true,
    },
    logic: [
      'National trips: active stoppages and stoppages ended within the lookback window.',
      'Apply minimum duration threshold per stoppage policy.',
      'Exclude stoppages within node geofence when geofence exclusion is enabled.',
      'Sort by stoppage duration and trip priority.',
    ],
  },
  {
    id: 'zonal-stoppage',
    title: 'Zonal stoppage alert',
    regarding: 'Zonal active or recently ended stoppages',
    frequency: {
      kind: 'interval',
      label: 'Every 2 hours',
      hours: 2,
      roundTheClock: true,
    },
    logic: [
      'Zonal trips: active stoppages and recently ended stoppages in the lookback window.',
      'Same stoppage duration and geofence rules as national, scoped to zonal network.',
      'Sort by duration and lane criticality.',
    ],
  },
  {
    id: 'in-transit-pendency',
    title: 'In-transit pendency',
    regarding: 'Trips pending closure or delayed while in transit',
    frequency: {
      kind: 'slots',
      label: '4× daily',
      times: ['08:00', '12:00', '16:00', '20:00'],
    },
    logic: [
      'Trips in transit past expected progress milestones or pending trip closure.',
      'Include age in current status and last known node.',
      'Highlight SLA breaches for NDD / priority lanes.',
      'Sort by oldest pendency first.',
    ],
  },
  {
    id: 'lm-audit',
    title: 'SFX LM audit pack',
    regarding: 'Last-mile audit exceptions, compliance checks, and sign-off summaries',
    frequency: {
      kind: 'slots',
      label: '3× daily',
      times: ['10:00', '14:00', '18:00'],
    },
    logic: [
      'Consolidate LM audit findings for the SFX LM AUDIT NEW workflow.',
      'Group by exception type (SLA, POD, route adherence, inventory handoff).',
      'Track owner and resolution state for open items.',
      'Replace or extend bullets here when you share final audit logic.',
    ],
  },
]
