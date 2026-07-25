# Roadmap

Sequencing follows validate-before-scale: prove the translation layer on one product line (REDDOT) before touching a second. Each item below maps 1:1 to a GitHub Issue.

## Phase 1 — Foundation & REDDOT Pilot

1. **Project scaffold & local dev environment**
   Next.js + TypeScript + Tailwind + Prisma + Docker Compose Postgres. Done when `npm run dev` boots clean against an empty database.

2. **Data model v1 — Product / ProductLine / Supplier**
   Implement the branching schema (JSONB specs per category, line-phase status, per-product-per-supplier terms). Migrate and seed 2–3 placeholder REDDOT records to validate the shape before real data lands.

3. **Ingest real REDDOT data** 🔒 *blocked on Peter*
   Spec sheets, pricing bands, lead times, and supplier terms for REDDOT. Everything past this point is being built against placeholder data until this lands — it's the one input that can't be generated.

4. **Catalog UI — browse & manage products**
   Internal pages to list/add/edit REDDOT products against the live schema. Also the QA step that proves the schema holds real data cleanly, not just placeholder shapes.

5. **Client-need intake**
   Form capturing a client's stated need (free text) plus light structure (sector, application). Persists to `ClientNeed`.

6. **Recommendation engine v1**
   Given a `ClientNeed`, filter matching REDDOT products/suppliers, pass as context to the Claude API, return equipment + material + sourcing with visible reasoning. Internal review only (`reviewed` flag) — nothing client-facing yet.

7. **Internal validation**
   Run it live, internally, on 2–3 real upcoming REDDOT conversations. Capture what it got right and wrong. This is the gate for Phase 2 — expand to Motofil, cranes, or structural steel, or go deeper on REDDOT first.

## Phase 2 — Not yet scoped

Deliberately left open. Which line comes next, and whether this goes client-facing, is a Phase-1-signal decision, not a Phase-1 assumption.
