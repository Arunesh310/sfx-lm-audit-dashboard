/**
 * LM Audit reports — “Intransit Pendency logic (end to end) (7)” · Oct 10, 2026.
 * Catalog matches the logic PDF; dashboard URLs from PDF link annotations.
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
  dashboard?: { label: string; url?: string }
  closureReport?: boolean
  notes?: string
}

const LM_AUDIT_SHARING =
  'Posted to SFX LM AUDIT New WhatsApp for team and leadership; zone snaps and the file to four regional groups: North || Loss Control, Loss Reduction | South, Lost Reduction - East Zone and Maharshtra Loss control.'

const LEADERSHIP_MAIL_SHARING =
  'Sent by mail to leadership; covered in the P0 Metric Report.'

export const REPORTS: ReportDefinition[] = [
  {
    id: 'p0-metric-report',
    number: '01',
    title: 'P0 Metrics Report',
    regarding:
      '19 P0 metrics on one page vs BIC — last 4 weeks and last 7 days trend (Excel summary, not a live dashboard).',
    frequency: {
      kind: 'slots',
      label: 'Daily · 10:00 AM',
      times: ['10:00'],
    },
    dataSource:
      'Latest outputs: CB Pendency, Shipments Tally, DCH short shipments, LM ODC, Intransit, Fwd High Ageing, Open runsheet, Jul–Sep picked RTS pendency file.',
    logic: [
      'Summary on one page — not a dashboard; mailed to leadership and other team members.',
      '10 P0 metrics for LM Audit vs fixed BIC with weekly and daily trend.',
      'Groups: Shipments Tally (overall, Self Hub, Franchise); Bagging & Connection; Short Shipments (DCH, LM-ODC); Intransit (fwd/rev × zonal/intracity/tertiary); Fwd High Ageing (AD/JIT, BRSNR, PU Inmanifest, Open runsheets); RTS pendency.',
      'Trend: last 4 weeks and last 7 days, skip Sundays. Current week = avg of last 7 days; each Monday lock prior week using Saturday value.',
      'Shipments Tally runs a day behind → placed under the previous day.',
      'Colours green→red: lower better for pendency, higher better for Tally %.',
      'History saved between runs; output one Excel sheet.',
    ],
    sharing:
      'Emailed to leadership and other team members; also posted to SFX LM AUDIT New WhatsApp group.',
    notes:
      'In progress: automailer to send each SZM consolidated hub-wise pendency for their AOR. Day-end closure reports for Intransit, DCH Short Shipments and CB Pendency go to the same five WhatsApp groups.',
  },
  {
    id: 'shipments-tally',
    number: '02',
    title: 'Shipments Tally',
    regarding:
      'Daily Shipment Tally scan adherence by POD and hub; top defaulter Self Hubs.',
    frequency: {
      kind: 'slots',
      label: 'Daily · 8:30 AM',
      times: ['08:30'],
    },
    dataSource:
      'Daily raw CSV export from Zoho — per hub: scanned count, exceptions reported, exceptions rejected, pending scans. CSV downloaded from Ecom LM Live Dashboard v3.0.',
    logic: [
      'Shipments Tally % = (scanned + net exceptions) ÷ (scanned + pending + net exceptions); net exceptions = reported − rejected.',
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
    frequency: {
      kind: 'slots',
      label: 'Daily · 8:30 AM + closure 12 / 3 / 7 PM',
      times: ['08:30', '12:00', '15:00', '19:00'],
    },
    dataSource:
      'Live bagging pendency export from Zoho; duplicate AWBs removed; each location matched to hub type, POD, zone and state head from mapping master. CSV from Ecom LM Live Dashboard v3.0.',
    ageing: 'Days 3 to 10 and 10+.',
    logic: [
      'North, South, East, West; hub types Franchise or Self Hub.',
      'Closure report goes out three times a day at 12:00 PM, 3:00 PM and 7:00 PM to the same five WhatsApp groups.',
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
    frequency: {
      kind: 'slots',
      label: 'Daily · 9:00 AM + closure 7:00 PM',
      times: ['09:00', '19:00'],
    },
    dataSource:
      'Line-haul pendency base data (FM, RTS and lean routes excluded). CSV downloaded from DC Floor Pendency dashboard.',
    ageing: '2, 3, 4, 5–7, 8–10, 11–15, 16–30 and 30+ days.',
    logic: [
      'Forward and reverse pendency across zonal, intracity and tertiary movements.',
      'Cuts by zone, POD, top hubs, lane code; trend of last 7 runs per zone and POD.',
      'Day-end closure report sent to the same five WhatsApp groups.',
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
    notes: 'Live Google Sheet tracker updates manifest-level status every 2 hours.',
  },
  {
    id: 'lm-odc',
    number: '05',
    title: 'LM ODC',
    regarding:
      'Shipments sent short from last-mile hubs to the DC, by zone, POD and ageing (1 to 60+ days).',
    frequency: {
      kind: 'slots',
      label: 'Daily · 9:00 AM',
      times: ['09:00'],
    },
    dataSource:
      'Reverse Short Shipment export from Zoho. CSV downloaded from LM Reverse Connection — Short Shipments in DC dashboard.',
    ageing: '1 day through 60+ days.',
    logic: [
      'North, South, East, West; hub types Self Hub, Franchise, ODH, OPMH.',
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
        label: 'Last 7 days · 2+ days pending',
        description: 'Trend per zone and POD vs fixed BIC.',
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
    frequency: {
      kind: 'slots',
      label: '7 AM & 7 PM · live refresh every 15 min (7 AM–7 PM)',
      times: ['07:00', '19:00'],
    },
    dataSource:
      'Forward Short Shipment export on Zoho Analytics + Shipment Scan Time Summary; master mapping for zone, POD and destination hub. CSV from Ecom LM Control Tower Dashboard.',
    ageing: '1 to 15 days and 15+.',
    logic: [
      'North, South, East and West zones.',
      'Morning ~7:00 AM; live open and cleared counts every 15 minutes until ~7:00 PM; evening closure ~7:00 PM.',
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
      label:
        'Ecom LM Control Tower Dashboard · Short Shipment web dashboard (live KPIs, zone table, ageing heatmap, hub drill-down)',
      url: 'https://analytics.zoho.in/workspace/159245000001470070/view/159245000039339199',
    },
    closureReport: true,
  },
  {
    id: 'fwd-high-ageing',
    number: '07',
    title: 'Fwd High Ageing',
    regarding:
      'Forward shipments with high ageing, tagged PU Inmanifest, AD/JIT or BRSNR.',
    frequency: {
      kind: 'slots',
      label: 'Daily · 9:30 AM',
      times: ['09:30'],
    },
    dataSource:
      'Fwd High Ageing file; locations matched to hub type, POD and zone from mapping master. CSV from Fwd Pendency Dashboard.',
    logic: [
      'North, South, East, West only.',
      'PU Inmanifest by default; AD/JIT for JIT Virtual DC; BRSNR when manifest status is received at hub (overrides AD/JIT).',
      'Unmatched locations → separate unmatched list. Output one sheet of tagged AWBs.',
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
    frequency: {
      kind: 'slots',
      label: 'Daily · 8:30 AM',
      times: ['08:30'],
    },
    dataSource: 'Open Runsheet data Google Sheet (read directly by script).',
    ageing: '0–1 days through 90+; each day from 2 to 10 shown separately.',
    logic: [
      'Forward runsheets only; North, South, East, West; hub types Self Hub, Franchise, OPMH.',
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
      label: 'Open Runsheet Google Sheet (updated by the daily auto mailer)',
      url: 'https://docs.google.com/spreadsheets/d/1ACxSuS6f8uVA7RfOZYX6RVIbJeqPL5PuI-dp9ZOMGys/edit?gid=0#gid=0',
    },
  },
  {
    id: 'reverse-pendency',
    number: '09',
    title: 'Reverse Pendency',
    regarding:
      'Reverse shipments still pending, tagged by stage (bagging, connection, LM ODC, RTS and others).',
    frequency: {
      kind: 'slots',
      label: 'Daily · 9:30 AM',
      times: ['09:30'],
    },
    dataSource:
      'Reverse Pendency master file; locations matched to hub type, POD, zone and state head. CSV from Reverse Pendency Dashboard.',
    ageing: 'Actual days up to 14; 15+ beyond.',
    logic: [
      'North, South, East, West; 0–2 attempts; exclude on hold, cancelled, delivered.',
      'One tag per AWB: Bagging Pendency, Connection Pendency, LM-ODC, BRSNR, PU Inmanifest, Received at DC, Misroute / Pincode Updated, Re-attempt, 0 Attempt.',
      'Roll-up: C & B Pendency (bagging + connection), LM-ODC, RTS Pendency (everything else).',
      'Output one sheet of tagged AWBs.',
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
    'Schedules vary by report (e.g. P0 by 10:00 AM, Tally and Open runsheet by 8:30 AM, DCH from 7 AM with 15-minute live updates, CB closure at 12 / 3 / 7 PM).',
  documentDate: 'Oct 10, 2026',
}
