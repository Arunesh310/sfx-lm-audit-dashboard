# Shadowfax LM report schedule dashboard

Minimal dashboard for **what each report is about**, **how often it runs**, and **how many sends happen per day** — computed from schedules in code (IST). No WhatsApp, no uploads.

## Run

```bash
cd sfx-lm-audit-dashboard
npm install
npm run dev
```

## Edit report logic

Update **`src/data/reports.ts`**: titles, schedules (`times` or `interval`), and `logic` bullets. The UI and daily counts update automatically.

Colors follow [shadowfax.in](https://shadowfax.in/): green `#008C44`, cream background, dark ink text — no orange accents.
