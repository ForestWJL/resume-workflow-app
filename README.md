# Resume Workflow — V1 (local MVP)

A calm, Apple-inspired local assistant for routing job descriptions through
your six-track resume system (A_PMC, A_REGULATED, AB_HYBRID, AC_DEMAND,
CB_BUYER, D_SUPPORT), generating the right prompt package, and keeping verified
facts in a Memory Bank.

> V1 is intentionally a **workflow assistant**, not an autonomous agent.
> No web scraping. No API calls. No automation. All data lives in
> LocalStorage on your machine.

---

## Pages

| Route         | What it does                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------- |
| `/router`     | Paste a JD → classify into a track → worth-apply score, gaps, recommendation (Strong Apply / Apply / Stretch / Skip) |
| `/workflow`   | Loads the latest routing → shows confirmed file stack + Round 1 / 2 / QA prompts ready to copy |
| `/memory`     | Edit verified experience facts, project facts, reusable wording, metrics to verify, track notes |
| `/library`    | Read-only view of the file-role setup grouped by track and by file role                       |

## Project shape

```
resume-workflow-app/
├── app/
│   ├── layout.tsx              # Nav + shell + fonts
│   ├── globals.css             # Tailwind base + Apple-style body background
│   ├── page.tsx                # redirect → /router
│   ├── router/page.tsx         # Page 1 — JD Router
│   ├── workflow/page.tsx       # Page 2 — Workflow Assistant
│   ├── memory/page.tsx         # Page 3 — Memory Bank
│   └── library/page.tsx        # Page 4 — File Library
├── components/
│   ├── ui/                     # shadcn-style primitives (Button, Card, Badge, Textarea, Tabs, Input, Label, Separator)
│   ├── Nav.tsx                 # Top nav with active-route highlight
│   ├── TrackBadge.tsx          # TrackId pill with per-track colour
│   ├── ScoreMeter.tsx          # Big number + thin progress bar
│   ├── ConfidenceBar.tsx       # Per-track distribution bar
│   ├── KeywordChips.tsx        # Match / gap chip list
│   ├── StatChip.tsx            # Small stat card
│   ├── PromptBlock.tsx         # Titled prompt viewer with Copy button
│   └── FileStackCard.tsx       # Track → 4 file roles
├── config/
│   ├── tracks.ts               # Title / domain / functional / tool signals + positioning + anchors
│   ├── scoring.ts              # Keyword weights, confidence thresholds, recommendation bands, seniority penalty
│   ├── fileStacks.ts           # Format template / content master / evidence bank / supporting reference per track
│   ├── memorySeed.ts           # Seed data for the Memory Bank (from the uploaded MDs)
│   └── prompts/
│   └── prompts/
│       ├── index.ts            # Registry: one prompt package per TrackId
│       ├── A_PMC.ts            # Pharma / medtech supply planning
│       ├── A_REGULATED.ts      # Regulated supply chain / GMP-adjacent
│       ├── AB_HYBRID.ts        # Planning + procurement hybrid
│       ├── AC_DEMAND.ts        # Demand / replenishment / forecasting
│       ├── CB_BUYER.ts         # Buyer / procurement / sourcing
│       └── D_SUPPORT.ts        # Analytics / reporting / KPI
├── lib/
│   ├── types.ts                # Shared types (RoutingResult, WorkflowSession, MemoryBank)
│   ├── classify.ts             # Keyword-weighted JD classifier + confidence
│   ├── score.ts                # Worth-apply score, functional/domain fit, gap analysis
│   ├── storage.ts              # Typed LocalStorage helpers
│   └── utils.ts                # cn(), shortId(), nowIso(), formatScore(), truncate()
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

## Data flow

1. **Router page** → user pastes JD → `scoreJD()` calls `classifyJD()` on every
   track, ranks them by weighted keyword matches, then builds a full
   `RoutingResult` (score, recommendation, fits, ATS keywords, gaps,
   tracker tag, next-step). Saved to LocalStorage.
2. **Workflow page** → reads the latest routing (or lets you pick from
   history). Shows confirmed track + file stack + Round 1 / Round 2 / QA
   prompts from `config/prompts/*`. A `WorkflowSession` is saved with status
   and notes per routing.
3. **Memory page** → CRUD on `MemoryBank` in LocalStorage. First-load
   uses `config/memorySeed.ts` as defaults.
4. **Library page** → pure read of `config/fileStacks.ts`. Two views: by
   Track and by File Role.

## Run it locally

```bash
cd resume-workflow-app
npm install
npm run dev
```

Open <http://localhost:3000>. The root redirects to `/router`.

No environment variables. No backend. Data persists in LocalStorage for the
origin `http://localhost:3000`.

## How to tune the system without touching components

All the rules live in `config/`:

- **Add a keyword** to a track → edit `config/tracks.ts` (push to
  `titleSignals` / `domainSignals` / `functionalSignals` / `toolSignals`).
- **Change recommendation thresholds** → edit `config/scoring.ts`
  (`recommendationWithContext` bands and confidence settings in `SCORING`).
- **Rename a reference file** → edit `config/fileStacks.ts` once; it
  propagates to the Router, Workflow, and Library pages.
- **Tune the prompt for one track** → edit `config/prompts/<TrackId>.ts`.
  The Workflow page renders whatever string is exported from that package.

## Keyboard / UX niceties

- Each prompt block has a **Copy** button.
- Routing history shows the last 50 routings with a one-click “View”.
- Override the auto-selected track from the Router page (big blue panel
  after you run a routing).
- D_SUPPORT-oriented memory handles portfolio projects with honest status labels
  (Completed / Prototype / In Progress / Concept) so the resume never
  overstates a project's maturity.

## Honest limits of V1

- Classifier is keyword-weighted, not ML. It's fast and explainable but
  will miss paraphrases — the Override button is the safety net.
- No cross-device sync. Data is in LocalStorage for the browser profile.
- The "Real gaps vs Positioning gaps" split uses a corpus-search over
  your Memory Bank text — you'll want to keep Memory Bank up to date for
  this to stay useful.

## Suggested next upgrade (V2)

Pick one of these based on what's actually slowing you down:

1. **Export / Import Memory Bank as JSON** — so you can sync between
   machines and back it up with the rest of your resume workflow files.
2. **Router history search + filters** — filter by track, recommendation,
   or date; useful once you pass ~20 routings.
3. **Per-routing workflow timer + log** — capture how long Round 1 / 2 /
   3 actually took so you can spot slow roles.
4. **Local JSON persistence via Next.js API routes** — swap LocalStorage
   for file-backed storage under `./data/` so results survive browser
   resets (still fully local, no backend service needed).
5. **Round 1 → Round 2 → QA status workflow on Router history** — surface
   "still at Round 1 after 2 days" as a gentle nudge.
6. **Memory Bank search + tag filtering** — once you have 30+ facts.

I'd pick **#1 (JSON export / import)** first; it's the smallest change
and unlocks a real backup workflow.
