# AI-Assisted Opportunity Screening

*Applying supply chain prioritisation and workflow routing principles to high-volume job opportunities.*

A workflow automation and decision-support case study by a supply chain operator.

---

## 1 · Project Overview

A working end-to-end pipeline that takes hundreds of inbound opportunity alerts every week and turns them into a small, prioritised, audit-tracked shortlist — using the same exception-management pattern an operator runs every day in distribution, replenishment, or demand planning.

The Next.js app in this repo is the live decision engine (classification, scoring, recommendation, workflow handoff). The supporting notebook captures and dedupes the inbox; the Excel tracker holds the audit trail.

The brief in one sentence:

> "I used the same exception-management and prioritisation logic from supply chain operations to automate the screening, classification, routing and tracking of high-volume incoming opportunities."

## 2 · Problem

196 alerts per week across six channels (LinkedIn, SEEK, Glassdoor, recruiter outreach, Telegram, Gmail) was producing review overload. Manual triage was slow, inconsistent, and was consuming senior-operator time on items that did not deserve it. No audit trail. No deterministic priority. Duplicate work was common.

## 3 · Solution

A four-pillar workflow modelled on supply chain exception management:

- **Screen** — every incoming opportunity passes through a five-second check
- **Sort** — sort into one of six operational categories
- **Prioritise** — explicit priority band (Strong Apply / Apply / Stretch / Skip) with the rationale visible
- **Route & Track** — assign the right response materials and four-step playbook; log every decision

AI handles the structured language work. The operator owns the calls and the audit trail.

## 4 · Workflow Architecture

Seven stages, end-to-end:

| Stage | What it does | Where it runs |
|---|---|---|
| 1 · Incoming Sources | Six email channels feed the queue | Tooling (notebook) |
| 2 · Extract & Deduplicate | Pull structured fields; collapse repeats | Tooling (notebook) |
| 3 · Classify | Sort each opportunity into one of six categories | Live (`/router`) |
| 4 · Score Priority | Strong Apply / Apply / Stretch / Skip with rationale | Live (`/router`) |
| 5 · Recommend | Apply-This-Week shortlist | Live (`/router`) |
| 6 · Route the Workflow | Response materials + four-step playbook | Live (`/workflow`) |
| 7 · Track and Audit | Full audit trail per decision | Tooling (`job_triage_log_LIVE.xlsx`) |

The six categories: Supply Planning / Inventory, Regulated Supply Chain / GMP, Operations / Coordination, Demand Planning / Forecasting, Procurement / Buyer, Analytics / Reporting.

## 5 · Production Results

A real morning, end-to-end in six minutes:

| Time | Event | Result |
|---|---|---|
| 08:00 | Gmail and web sources ingested | **196** raw alerts captured |
| 08:03 | Deduplication completed | **49** unique opportunities |
| 08:05 | AI classification and scoring completed | **23** prioritised opportunities |
| 08:06 | Audit tracker updated | `job_triage_log_LIVE.xlsx` refreshed |

That morning's breakdown across the 23 prioritised entries:

- **Category split:** 14 Supply Planning · 5 Procurement · 2 Demand · 2 Analytics
- **Priority split:** 9 Strong Apply · 13 Apply · 1 Skip
- **Audit trail:** every decision logged with reference, status, rationale, and outcome

## 6 · Technology Stack

| Layer | Stack |
|---|---|
| Decision engine (this app) | **Next.js 14** · TypeScript · Tailwind CSS · shadcn-style primitives |
| Classifier + scoring | Keyword-weighted scoring with four layered overrides (operations-execution, regulated-context, analyst-title, clinical-supply) |
| Response generation | **Claude** + **GPT** as the AI assistants in the four-step response playbook |
| Inbound capture | Gmail search queries via a Python notebook |
| Audit trail | Excel (`job_triage_log_LIVE.xlsx`) — system of record for every decision |
| Persistence | LocalStorage on the device — no backend, no external calls |

## 7 · Screenshots

Drop screenshots into `public/screenshots/` and the references below will resolve. Suggested set:

- `case-study-hero.png` — landing page hero + KPI snapshot
- `production-run.png` — Production Run Example timeline
- `architecture.png` — Seven-stage workflow diagram
- `router-screening.png` — `/router` live screening engine
- `workflow-playbook.png` — `/workflow` four-step response playbook
- `tracker-audit.png` — `job_triage_log_LIVE.xlsx` audit trail

```
![Case study hero](public/screenshots/case-study-hero.png)
![Production run timeline](public/screenshots/production-run.png)
![Seven-stage workflow](public/screenshots/architecture.png)
```

## 8 · Live Demo

- **Live URL:** _(populated after the first Vercel deploy)_
- **Local:** `npm install` then `npm run dev`, then open `http://localhost:3000`

The app runs entirely on your device. No external API keys are required. No data leaves your machine.

---

## Built by

Forest Wang. Fifteen-plus years in supply chain, procurement, logistics and operations: Sanofi, YCH Group, Cainiao, Ryder, CWT. Pharma, e-commerce, third-party logistics, freight. Recently upskilled in analytics, automation and AI.

## Notes for engineers

Builder-facing detail (file structure, classifier internals, scoring weights, verification probes) lives in [`DEV.md`](./DEV.md). The verification probes can be run any time with:

```
node scripts/probe-trackd.mjs       # six-category file-stack check
node scripts/probe-rules-1-6.mjs    # classifier overrides
node scripts/probe-case-study.mjs   # case-study sections + copy
```
