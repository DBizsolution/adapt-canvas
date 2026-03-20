# Intent Model Review

A structured review tool for software intent models — actors, entities, journeys, business rules, constraints, and open questions. Teams use it to reach consensus on business requirements before development begins.

Built with Next.js, React, TypeScript, TailwindCSS, and ShadCN.

## Features

- **Section-by-section review** with consensus tracking across reviewers
- **AI-powered editing** — describe changes in plain language, see diffs, approve/reject
- **Version history** with side-by-side diffs between any two versions
- **BRD generation** — auto-generate a Business Requirements Document from the model
- **Interactive explorer** — visual graph of actors, entities, and journeys
- **Abbreviation tooltips** — domain acronyms expand on hover

## Using for a new project

This repo is designed to be reused for any software project's intent model. Three files to change:

### 1. Replace the model data

Edit `src/domain/intent-model/model.ts` with your project's actors, entities, journeys, rules, constraints, and open questions. The data must conform to the `IntentModel` type defined in `src/domain/intent-model/types.ts`.

### 2. Edit the project config

All project-specific UI text lives in `project.config.ts` at the repo root:

```ts
export const projectConfig: ProjectConfig = {
  // App chrome
  name: 'Your Project — Intent Model Review',
  shortName: 'Your Project',
  iconLetter: 'Y',
  description: 'A review tool for Your Project business requirements',

  // Domain abbreviations (shown as tooltips)
  abbreviations: {
    API: 'Application Programming Interface',
    // ... your domain acronyms
  },

  // BRD generation text — {project} is replaced with model.meta.project
  brd: {
    introText: 'The {project} is a ...',
    scopeText: 'It enables ...',
  },

  // AI editing hints — examples for ID generation
  ai: {
    idExamples: "short lowercase, e.g. 'admin', 'user'",
    journeyIdExamples: "kebab-case, e.g. 'user-signs-up'",
    idPatternHint: 'if actors have admin, user — a new actor gets a short lowercase ID',
  },
}
```

### 3. Clear previous project state

```bash
rm -rf src/domain/intent-model/history/*
echo '{}' > src/domain/intent-model/review-state.json
```

This removes version history and review state from the previous project.

### 4. Optional: update reference docs

If you use the docs viewer, update `src/lib/docs-config.ts` with paths to your project's reference documents.

## Model structure

The intent model has 6 fixed section types:

| Section | Purpose |
|---------|---------|
| **Actors** | Who interacts with the system (users, roles, external systems) |
| **Entities** | Core data objects with fields and lifecycle states |
| **Journeys** | User flows with ordered steps, preconditions, and outcomes |
| **Business Rules** | Logic constraints, validation rules, behavioral rules |
| **Constraints** | Technical/business limitations (capacity, compliance, etc.) |
| **Open Questions** | Unresolved items needing stakeholder decisions |

## Development

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:4444`.

## Environment variables

- `OPENAI_API_KEY` — required for AI-powered model editing
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — optional, for Vercel KV storage in production (falls back to local JSON files in dev)
