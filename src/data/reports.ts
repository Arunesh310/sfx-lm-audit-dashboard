/**
 * Pendency report coverage — “Intransit Pendency logic (end to end) (1)” (Oct 10, 2026 · @abinthomas).
 * All reports publish by 9:30 AM IST daily unless noted.
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
  number: string
  title: string
  regarding: string
  frequency: ReportFrequency
  dataSource: string
  logic: string[]
  views?: ReportView[]
  ageing?: string
  sharing: string
  /** Live BI dashboard (URLs from pendency logic PDF). */
  dashboard?: { label: string; url: string }
  closureReport?: boolean
  notes?: string
}

const DAILY_930: ReportFrequency = {
  kind: 'slots',
  label: 'Daily · 9:30 AM',
  times: ['09:30'],
}

const LM_AUDIT_SHARING =
  'Posted to LM Audit New WhatsApp for team and leadership; zone snaps and files to four regional groups for ground teams.'

export const REPORTS: ReportDefinition[] = [
  {
    id: 'intransit-pendency',
    number: '01',
    title: 'Intransit Pendency',
    regarding:
      'AWBs in transit 2+ days between hubs — forward and reverse, by zone, POD and ageing (2 to 30+ days).',
    frequency: DAILY_930,
    dataSource: 'Line-haul pendency base data (FM, RTS, large and lean routes excluded).',
    ageing: '2, 3, 4, 5–7, 8–10, 11–15, 16–30 and 30+ days.',
    logic: [
      'Every AWB in transit ≥ 2 days between network hubs so zone and POD teams see stuck volume and duration.',
      'Split: forward and reverse pendency across zonal, intracity and tertiary movements.',
      'Cuts: zone, POD, top hubs, lane code; trend of last 7 runs per zone and POD.',
    ],
    views: [
      {
        id: 'intransit-cuts',
        label: 'Zone · POD · hubs · lane',
        description: 'Summary cuts plus 7-run trend by zone and POD.',
      },
    ],
    sharing: LM_AUDIT_SHARING,
    dashboard: {
      label: 'DC Floor Pendency',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245005933557801',
    },
    closureReport: true,
  },
  {
    id: 'lm-odc',
    number: '02',
    title: 'LM ODC',
    regarding:
      'Shipments sent short from last-mile hubs to the DC, by zone, POD and ageing (1 to 60+ days).',
    frequency: DAILY_930,
    dataSource: 'Reverse Short Shipment export from Zoho.',
    ageing: '1 day through 60+ days.',
    logic: [
      'Last-mile hub sent short — DC received fewer than mapped; shows pending duration.',
      'Zones: North, South, East, West. Hub types: Self Hub, Franchise, ODH, OPMH.',
      'Origin hub matched to zone, hub type and POD from SH Mapping sheet; unmatched hubs excluded.',
    ],
    views: [
      {
        id: 'lm-odc-zone-pod',
        label: 'Zone & POD counts',
        description: 'Volume by zone and POD.',
      },
      {
        id: 'lm-odc-trend',
        label: 'Last 7 runs · 2+ days pending',
        description: 'Trend per zone and POD vs fixed BIC (manual entry, not calculated).',
      },
      {
        id: 'lm-odc-top50',
        label: 'Top 50 hubs per zone',
        description: 'Highest short-shipment hubs within each zone.',
      },
    ],
    sharing: LM_AUDIT_SHARING,
    dashboard: {
      label: 'LM Reverse Connection — Short Shipments in DC',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245003428839912',
    },
    notes:
      'Automailer to Franchise Partners and SZMs with hub-level pendency and a Google Form link for bagging footage.',
  },
  {
    id: 'open-runsheet',
    number: '03',
    title: 'Open runsheet',
    regarding:
      'Forward runsheets still open — by runsheet and by AWB, zone, POD and ageing (0–1 to 90+ days).',
    frequency: DAILY_930,
    dataSource: 'Open Runsheet data Google Sheet (read directly by script).',
    ageing: '0–1 days through 90+; each day from 2 to 10 shown separately.',
    logic: [
      'Forward runsheets only; North, South, East, West.',
      'Hub types: Self Hub, Franchise, OPMH.',
      'Shows open runsheet count, AWB counts, and days each runsheet has been open.',
    ],
    views: [
      {
        id: 'or-zone-pod',
        label: 'Zone & POD',
        description: 'Counts by runsheet and by AWB.',
      },
      {
        id: 'or-top30',
        label: 'Top 30 hubs per zone',
        description: 'Runsheets open 7+ days.',
      },
    ],
    sharing: LM_AUDIT_SHARING,
    dashboard: {
      label: 'Open Runsheet Google Sheet (updated by BI team)',
      url: 'https://docs.google.com/spreadsheets/d/1ACxSuS6f8uVA7RfOZYX6RVIbJeqPL5PuI-dp9ZOMGys/edit?gid=0#gid=0',
    },
  },
  {
    id: 'reverse-pendency',
    number: '04',
    title: 'Reverse Pendency',
    regarding:
      'Reverse shipments still pending, tagged by stage (bagging, connection, LM ODC, RTS and others).',
    frequency: DAILY_930,
    dataSource: 'Reverse Pendency master file + mapping master (hub type, POD, zone, state head).',
    ageing: 'Actual days up to 14; 15+ bucket.',
    logic: [
      'North, South, East, West; 0–2 attempts; exclude on hold, cancelled, delivered.',
      'One tag per AWB: Bagging Pendency, Connection Pendency, LM-ODC, BRSNR, PU Inmanifest, Received at DC, Misroute / Pincode Updated, Re-attempt, 0 Attempt.',
      'Drop rows tagged “Need to Remove”.',
      'Leadership roll-up: C & B Pendency (bagging + connection), LM-ODC, RTS Pendency (all other tags).',
      'Output: one sheet of tagged AWBs.',
    ],
    sharing: 'Emailed to leadership; included in P0 Metrics Report.',
    dashboard: {
      label: 'Reverse Pendency Dashboard',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245000016805432',
    },
  },
  {
    id: 'fwd-high-ageing',
    number: '05',
    title: 'Fwd High Ageing',
    regarding:
      'Forward shipments with high ageing, tagged PU Inmanifest, AD/JIT or BRSNR.',
    frequency: DAILY_930,
    dataSource: 'Fwd High Ageing file + mapping master (hub type, POD, zone).',
    logic: [
      'North, South, East, West only.',
      'Default tag PU Inmanifest; AD/JIT if hub is JIT Virtual DC; BRSNR if manifest status is received at hub (overrides AD/JIT).',
      'Unmatched locations → separate unmatched list for follow-up.',
      'Output: one sheet of tagged AWBs.',
    ],
    sharing: 'Emailed to leadership; included in P0 Metrics Report.',
    dashboard: {
      label: 'Fwd Pendency Dashboard',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245000014314500',
    },
  },
  {
    id: 'cb-pendency',
    number: '06',
    title: 'CB Pendency',
    regarding: 'Bagging and connection pendency by zone, POD and hub, ageing 3 to 10+ days.',
    frequency: DAILY_930,
    dataSource: 'Live bagging pendency export + mapping master; duplicate AWBs removed.',
    ageing: 'Day 2 excluded from summary; days 3–10 and 10+.',
    logic: [
      'North, South, East, West; hub types simplified to Franchise or Self Hub.',
      'Each location matched to hub type, POD, zone and state head.',
    ],
    views: [
      {
        id: 'cb-pod-2plus',
        label: 'POD-wise 2+ bagging & connection',
        description: 'Pendency at POD level.',
      },
      {
        id: 'cb-top50',
        label: 'Top 50 hubs per zone',
        description: 'Separate lists for bagging and connection.',
      },
      {
        id: 'cb-day3',
        label: '3rd-day additions',
        description: 'POD counts for Self Hubs, Franchises and overall.',
      },
    ],
    sharing: LM_AUDIT_SHARING,
    dashboard: {
      label: 'Ecom LM Live Dashboard v3.0',
      url: 'https://analytics.zoho.in/workspace/159245000286997288/view/159245007273104249',
    },
    closureReport: true,
  },
  {
    id: 'shipments-tally',
    number: '07',
    title: 'Shipments Tally',
    regarding:
      'Daily Shipment Tally scan adherence by POD and hub; top defaulter Self Hubs.',
    frequency: DAILY_930,
    dataSource: 'Daily raw CSV — per hub: scanned, exceptions reported/rejected, pending scans.',
    logic: [
      'Shipments Tally % = (scanned + net exceptions) ÷ (scanned + pending + net exceptions).',
      'Net exceptions = reported − rejected.',
      'Exclude combined ROK/KL rows and Others zone.',
    ],
    views: [
      {
        id: 'st-pod',
        label: 'POD-wise',
        description: 'All hubs, Self Hubs and Franchises.',
      },
      {
        id: 'st-hub',
        label: 'Hub-wise',
        description: 'Hub-level adherence.',
      },
      {
        id: 'st-top50',
        label: 'Top 50 defaulter Self Hubs',
        description: 'Ranked by pending scans; share of Self Hub total still untallied.',
      },
    ],
    sharing: LM_AUDIT_SHARING,
    dashboard: {
      label: 'Ecom LM Live Dashboard v3.0',
      url: 'https://analytics.zoho.in/workspace/159245000286997288/view/159245007273104249',
    },
  },
  {
    id: 'p0-metric-report',
    number: '08',
    title: 'P0 Metrics Report',
    regarding:
      '19 P0 metrics on one page vs BIC — last 4 weeks and last 7 days trend (Excel summary, not a live dashboard).',
    frequency: DAILY_930,
    dataSource:
      'Latest outputs: CB Pendency, Shipments Tally, DCH short shipments, LM ODC, Intransit, Fwd High Ageing, Open runsheet, Jul–Sep picked RTS pendency file.',
    logic: [
      'Summary built from all other reports on one page — not a dashboard.',
      '10 P0 metrics for LM Audit vs fixed BIC with weekly and daily trend.',
      'Groups: Shipments Tally (overall, Self Hub, Franchise); Bagging & Connection; Short Shipments (DCH, LM-ODC); Intransit (fwd/rev × zonal/intracity/tertiary); Fwd High Ageing (AD/JIT, BRSNR, PU Inmanifest, Open runsheets); RTS pendency.',
      'Trend: last 4 weeks and last 7 days, skip Sundays. Current week = avg of last 7 days; each Monday lock prior week using Saturday value.',
      'Shipments Tally lags one day → placed under previous day.',
      'Row colours green→red: lower better for pendency, higher better for Tally %.',
      'History persisted between runs; output one Excel sheet.',
    ],
    sharing: 'Emailed to leadership and other team members.',
    notes:
      'In progress: automailer per SZM with consolidated AOR pendency. Day-end closure also produced for Intransit, DCH Short Shipments and CB Pendency.',
  },
]

export const PROGRAM_SUMMARY = {
  title: 'Pendency report coverage',
  subtitle:
    'Eight reports track pendency and scan adherence across the network; this page shows what each one covers.',
  publishBy: 'All reports are published and sent by 9:30 AM IST every day.',
  documentDate: 'Oct 10, 2026 · @abinthomas',
}
