# Claude-Project
PMG Trading with Claude Ai
# PMG Solution Engine

Internal tool for PMG Trading EG that turns a client's stated need into a matched set of equipment, material, and sourcing recommendations — PMG's "tell me the problem, I'll spec the solution" differentiator, built one product line at a time.

## Status

Concept validated → active build. **Pilot line: REDDOT** (aviation obstruction lighting). Internal use only — not client-facing yet. See [ROADMAP.md](./ROADMAP.md) for sequencing and open dependencies.

## Why this exists

PMG competes as a trading and procurement consulting agency across several unrelated product lines (aviation lighting, robotic welding, crane sourcing, structural steel). The differentiator isn't any single line — it's the ability to take a client's plain-language problem and translate it into the right mix of equipment, material, and sourcing across whichever lines actually apply, backed by real spec depth instead of a sales pitch.

Because PMG can't run every line at full capacity at once, the engine is built to respect line status: a recommendation should never surface a line that isn't actually deliverable yet.

## Core Features

- **Category-branching product catalog** — lighting specs (electrical / optical / certification) and structural steel specs (grade / dimension / mill certification) don't share a template; the schema adapts per category instead of forcing a generic product model.
- **Supplier & commercial terms tracking** — pricing bands, lead times, and payment terms live per product-per-supplier, since the same product can carry different terms depending on who's quoting it.
- **Client-need intake** — captures what a client actually said, in their own words, plus light structure (sector, application).
- **AI-assisted recommendation layer** — given a client need, retrieves matching products by structured filter and uses the Claude API to propose equipment + material + sourcing, with the reasoning kept visible for review. Nothing reaches a client unreviewed.
- **Line-phase awareness** — every product line carries a status (active / planned / exploration) so the engine only recommends what PMG can currently deliver.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router, TypeScript) | Single deployable — UI and API routes in one codebase, nothing separate to host |
| Database | PostgreSQL (Docker locally, Supabase for hosted) | Real filtering/joins once catalog + supplier data grows past what a flat store handles cleanly |
| ORM | Prisma | Type-safe schema and migrations, minimal boilerplate |
| AI layer | Anthropic Claude API | Direct API calls with structured product data as context — no vector DB; at this data volume embedding-based retrieval is overhead, not value |
| Styling | Tailwind CSS | Fast to build and maintain solo |
| Hosting | Netlify | Already part of the existing PMG toolchain |
| CI | GitHub Actions | Lint, type-check, and build on every push/PR |

## Prerequisites

- Node.js 20 or later
- npm
- Docker (for local Postgres) — or a Supabase project if you'd rather skip local Docker
- An Anthropic API key
- Git

## Installation

1. **Clone the repository**
```bash
   git clone https://github.com/<your-org>/pmg-solution-engine.git
   cd pmg-solution-engine
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
```bash
   cp .env.example .env.local
```
   Fill in `ANTHROPIC_API_KEY`. Leave `DATABASE_URL` as-is if you're using the Docker default below, or replace it with a Supabase connection string.

4. **Start the local database**
```bash
   docker compose up -d
```

5. **Run migrations**
```bash
   npx prisma migrate dev
```

6. **(Optional) Seed sample data**
```bash
   npm run seed
```

7. **Start the dev server**
```bash
   npm run dev
```
   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
pmg-solution-engine/
├── .github/
│   └── workflows/
│       └── main.yml          # CI: lint, typecheck, build
├── prisma/
│   ├── schema.prisma         # Product / Supplier / ClientNeed / Recommendation models
│   └── seed.ts                # placeholder seed data for local dev
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── recommend/route.ts   # Layer 2 — Claude API recommendation endpoint
│   │   │   ├── products/route.ts    # Layer 1 — catalog CRUD
│   │   │   └── suppliers/route.ts
│   │   ├── catalog/page.tsx         # browse/manage products
│   │   ├── intake/page.tsx          # client-need intake form
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── claude.ts           # Anthropic SDK wrapper
│   │   └── recommendation-engine.ts
│   └── types/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
└── ROADMAP.md
```

`src/app`, `src/components`, and the API route handlers are scaffolded as the structure the codebase grows into — they're built out issue by issue per the roadmap, not all at once on day one.

## Roadmap

Sequencing and open dependencies (including what's currently blocked on real REDDOT data) are tracked in [ROADMAP.md](./ROADMAP.md) and mirrored as GitHub Issues.

## What changes as this scales

Flagging now, not solving now:

- **Auth** — single-user internal tool for now; add real auth (NextAuth or similar) once a second person touches it or it goes client-facing.
- **Retrieval** — structured SQL filtering is enough under current data volume; revisit only if the catalog grows into the thousands of SKUs across many lines simultaneously.
- **Service boundaries** — Next.js monolith is correct at this scale; split the recommendation engine into its own service only if latency or deploy cadence actually forces it, not preemptively.

## License

Proprietary — internal PMG Trading EG tool, not for external distribution.
