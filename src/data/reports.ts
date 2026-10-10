/**
 * Pendency report coverage — “Intransit Pendency logic (end to end) (5)” (Oct 10, 2026).
 * Schedules per cover page; most morning packs by 9:30 AM IST unless noted.
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
  /** Live BI dashboard (URLs from pendency logic PDF when linked). */
  dashboard?: { label: string; url?: string }
  closureReport?: boolean
  notes?: string
}

const DAILY_930: ReportFrequency = {
  kind: 'slots',
  label: 'Daily · 9:30 AM',
  times: ['09:30'],
}

const TWICE_MORNING_EVENING: ReportFrequency = {
  kind: 'slots',
  label: 'Twice daily · 9:30 AM & evening closure',
  times: ['09:30', '19:00'],
}

const DCH_SCHEDULE: ReportFrequency = {
  kind: 'slots',
  label: '7 AM & 7 PM · live refresh every 15 min (7 AM–7 PM)',
  times: ['07:00', '19:00'],
}

const LM_AUDIT_SHARING =
  'Posted to SFX LM AUDIT New WhatsApp for team and leadership; zone snaps and the file to four regional groups: North || Loss Control, Loss Reduction | South, Lost Reduction - East Zone and Maharshtra Loss control.'

const LEADERSHIP_MAIL_SHARING =
  'Sent by mail to leadership; included in the P0 Metric Report.'

export const REPORTS: ReportDefinition[] = [
  {
    id: 'p0-metric-report',
    number: '01',
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
      'Automailer per SZM with consolidated AOR pendency is in progress. Day-end closure reports for Intransit, DCH Short Shipments and CB Pendency go to the same five WhatsApp groups.',
  },
  {
    id: 'shipments-tally',
    number: '02',
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
    id: 'cb-pendency',
    number: '03',
    title: 'CB Pendency',
    regarding: 'Bagging and connection pendency by zone, POD and hub, ageing 3 to 10+ days.',
    frequency: TWICE_MORNING_EVENING,
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
    id: 'intransit-pendency',
    number: '04',
    title: 'Intransit Pendency',
    regarding:
      'AWBs in transit 2+ days between hubs — forward and reverse, by zone, POD and ageing (2 to 30+ days).',
    frequency: TWICE_MORNING_EVENING,
    dataSource: 'Line-haul pendency base data (FM, RTS and lean routes excluded).',
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
    number: '05',
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
    id: 'fwd-dch-short',
    number: '06',
    title: 'Forward Short Shipment (DCH)',
    regarding:
      'Forward shipments mapped short at the DC (DCH2): open AWBs by zone, POD and hub, ageing 1 to 15+ days, morning to evening clearance.',
    frequency: DCH_SCHEDULE,
    dataSource:
      'Forward Short Shipment export on Zoho Analytics + Shipment Scan Time Summary for first-scan timing and ageing; master mapping for zone, POD and destination hub.',
    ageing: '1 to 15 days and 15+.',
    logic: [
      'North, South, East and West zones.',
      'Morning report ~7:00 AM; open and cleared counts refresh every 15 minutes until ~7:00 PM; evening closure ~7:00 PM.',
      'Evening closure workbook is the day-end view — same five WhatsApp groups and email.',
    ],
    views: [
      {
        id: 'dch-pod-zone-am',
        label: 'POD & zone · morning pendency',
        description: 'Morning snapshot cuts.',
      },
      {
        id: 'dch-top-hubs',
        label: 'Top hubs per zone',
        description: 'Highest pending hubs.',
      },
      {
        id: 'dch-trend-2plus',
        label: 'Last 7 days · 2+ days pending',
        description: 'Trend vs prior runs.',
      },
      {
        id: 'dch-clearance',
        label: 'Evening clearance',
        description: 'Evening clearance views.',
      },
    ],
    sharing:
      'Morning report by email and WhatsApp. Full pack to SFX LM AUDIT New; zone snapshots, POD trend images and file to four regional groups (North || Loss Control, Loss Reduction | South, Lost Reduction - East Zone, Maharashtra Loss control). Mondays: week-on-week summary by email and WhatsApp.',
    dashboard: {
      label: 'Short Shipment web dashboard (live KPIs, zone table, ageing heatmap, hub drill-down)',
    },
    closureReport: true,
    notes: 'Live KPI refresh every 15 minutes between morning and evening runs (7 AM–7 PM IST).',
  },
  {
    id: 'fwd-high-ageing',
    number: '07',
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
    sharing: LEADERSHIP_MAIL_SHARING,
    dashboard: {
      label: 'Fwd Pendency Dashboard',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245000014314500',
    },
  },
  {
    id: 'open-runsheet',
    number: '08',
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
    number: '09',
    title: 'Reverse Pendency',
    regarding:
      'Reverse shipments still pending, tagged by stage (bagging, connection, LM ODC, RTS and others).',
    frequency: DAILY_930,
    dataSource: 'Reverse Pendency master file + mapping master (hub type, POD, zone, state head).',
    ageing: 'Actual days up to 14; 15+ bucket.',
    logic: [
      'North, South, East, West; 0–2 attempts; exclude on hold, cancelled, delivered.',
      'One tag per AWB: Bagging Pendency, Connection Pendency, LM-ODC, BRSNR, PU Inmanifest, Received at DC, Misroute / Pincode Updated, Re-attempt, 0 Attempt.',
      'Leadership roll-up: C & B Pendency (bagging + connection), LM-ODC, RTS Pendency (all other tags).',
      'Output: one sheet of tagged AWBs.',
    ],
    sharing: LEADERSHIP_MAIL_SHARING,
    dashboard: {
      label: 'Reverse Pendency Dashboard',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245000016805432',
    },
  },
]

export const PROGRAM_SUMMARY = {
  title: "LM Audit Team's Reports Summary",
  subtitle:
    'Nine reports track pendency and scan adherence across the network; this page shows what each one covers.',
  publishBy:
    'Most reports publish by 9:30 AM IST daily; CB, Intransit and DCH also have evening closure (DCH from ~7 AM with 15-minute live updates).',
  documentDate: 'Oct 10, 2026',
}
