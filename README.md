# Shadowfax LM report schedule dashboard

Minimal dashboard for **what each report is about**, **how often it runs**, and **how many sends happen per day** — computed from schedules in code (IST). No WhatsApp, no uploads.

## Run locally

```bash
cd sfx-lm-audit-dashboard
npm install
npm run dev
```

## Deploy on Vercel

Repo: **https://github.com/Arunesh310/sfx-lm-audit-dashboard**

1. Open [Import this repo on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FArunesh310%2Fsfx-lm-audit-dashboard&project-name=sfx-lm-audit-dashboard&framework=vite).
2. Sign in with GitHub if prompted → **Deploy** (defaults are fine: build `npm run build`, output `dist`).
3. Or from this folder after `npx vercel login`: `npx vercel --prod`.


## Edit report logic

Update **`src/data/reports.ts`**: titles, schedules (`times` or `interval`), and `logic` bullets. The UI and daily counts update automatically.

Colors follow [shadowfax.in](https://shadowfax.in/): green `#008C44`, cream background, dark ink text — no orange accents.
