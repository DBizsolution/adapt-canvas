# VBS Intent Model Review

A structured review platform for the ACFS VBS Pickup Portal intent model — actors, entities, journeys, business rules, constraints, and open questions. Teams use it to reach consensus on business requirements before development begins.

Built with Next.js, React, TypeScript, TailwindCSS, and ShadCN.

## Current model (v0.7.1)

| Pillar | Count | Examples |
|--------|-------|---------|
| **Actors** | 5 | LSP, P4TC, Driver, ACFS Internal, Gatehouse |
| **Entities** | 7 + 5 integrations | HBL, Booking, Pickup Slot, Site, Delivery Order, Delegation, Driver Record |
| **Journeys** | 14 | LSP Books a Pickup, ACFS Validates DOs, P4TC Books a Pickup |
| **Business Rules** | 21 | Booking gates, DO policy, modification cutoffs, fee calculation |
| **Constraints** | 5 | Desktop only, no persistent P4TC credentials, DB-seeded sites |
| **Open Questions** | 1 | HBL hierarchy data source (OQ-034) |

## Features

- **Consensus review** — section-by-section review with approve/dispute tracking across reviewers
- **AI-powered editing** — describe changes in plain language, see diffs, approve/reject
- **Version history** — full diff tracking between any two model versions
- **BRD generation** — auto-generated business requirements document from the live model
- **3D explorer** — interactive visualizations:
  - **Force graph** — translucent spheres with Lucide icons, force-directed layout
  - **Lifecycle view** — HBL milestone spine with icon badges (ship, anchor, warehouse, package, truck)
  - **Actor layers** — horizontal platforms per actor with icon-based nodes
- **IA map** — implementation architecture linking responsibilities to screens
- **Docs hub** — upload and reference project documents alongside the model

## Getting started

```bash
pnpm install
pnpm dev        # starts on http://localhost:4444
```

## Project structure

```
src/
  domain/intent-model/
    model.ts          # the intent model (source of truth)
    types.ts          # TypeScript types for all model sections
    history/          # archived model snapshots
  components/
    explorer/         # 3D graph visualizations (force, lifecycle, actor layers)
    review/           # consensus review UI (dashboard, section pages, diff)
    ai/               # AI chat panel, diff preview, version history
    ia/               # implementation architecture map
  lib/
    model-store.ts    # versioning, KV/local persistence
    model-diff.ts     # diff computation between model versions
    model-schemas.ts  # zod validation schemas
    ai-prompt.ts      # AI system prompt for model editing
    brd-generator.ts  # BRD generation logic
    docs-config.ts    # docs page configuration
  app/
    review/           # review pages (consensus, BRD, diff, docs)
    api/              # API routes (model edit, versions, BRD export)
docs/
  project/            # team guide, changelog, BRD PDF
  intent-model-simplification.md  # v0.7.1 simplification proposal and status
```

## Using for a new project

This repo is designed to be reused for any software project's intent model. Three files to change:

### 1. Replace the model data

Edit `src/domain/intent-model/model.ts` with your project's actors, entities, journeys, rules, constraints, and open questions. The data must conform to the `IntentModel` type defined in `src/domain/intent-model/types.ts`.

### 2. Edit the project config

All project-specific UI text lives in `project.config.ts` at the repo root:

```ts
export const projectConfig: ProjectConfig = {
  name: 'Your Project — Intent Model Review',
  shortName: 'Your Project',
  iconLetter: 'Y',
  description: 'A review tool for Your Project business requirements',
  abbreviations: { /* domain acronyms */ },
  brd: { introText: '...', scopeText: '...' },
  ai: { idExamples: '...', journeyIdExamples: '...', idPatternHint: '...' },
}
```

### 3. Clear previous project state

```bash
rm -rf src/domain/intent-model/history/*
echo '{}' > src/domain/intent-model/review-state.json
```

### 4. Optional: update reference docs

Update `src/lib/docs-config.ts` with paths to your project's reference documents.

## Environment variables

- `OPENAI_API_KEY` — required for AI-powered model editing
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — optional, for Vercel KV storage in production (falls back to local JSON files in dev)

## Related repos

- **[vbs-portal](https://github.com/DBizsolution/vbs-portal)** — the actual pickup portal frontend (LSP, P4TC, ACFS, Gatehouse views)
