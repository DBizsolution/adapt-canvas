# Project Context — VBS Intent Model Review

**Quick Reference** — Load this at the start of new Claude sessions for instant context.

## What This Is

A visual intent model editor for freight forwarding requirements. Users (internal team + client stakeholders) review structured business requirements (actors, entities, journeys, rules) before development. The tool helps teams reach consensus through visualization and AI-assisted iteration.

## Stack

- **Framework**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, DM Sans Variable font
- **3D**: Three.js (React Three Fiber), R3F Drei
- **State**: Zustand
- **Validation**: Zod
- **Package Manager**: pnpm

## Directory Layout

```
vbs-intent/
├── src/
│   ├── app/              # Next.js routes (single page)
│   ├── components/
│   │   ├── explorer/     # Main model viewer
│   │   │   ├── model-reader.tsx  # Core component (reads YAML)
│   │   │   └── views-3d/         # 3D visualizations
│   │   ├── chat/         # AI chat panel
│   │   └── ui/           # ShadCN components
│   ├── domain/
│   │   └── intent-model/ # Model schema & validation
│   │       ├── model.ts  # Core types
│   │       └── schema.ts # Zod schemas
│   └── lib/              # Utilities
├── docs/
│   ├── BRD-v1.5-proposed-updates.md  # Requirements doc
│   ├── project-context.md            # THIS FILE
│   ├── ui-patterns.md                # Design patterns
│   └── claude-workflows.md           # Cost optimization
└── public/
    └── models/           # YAML model files

Dev server: http://localhost:4444
```

## Key Files

| File | Purpose | Read when... |
|------|---------|--------------|
| `src/domain/intent-model/model.ts` | Model types & schema | Working with model structure |
| `src/components/explorer/model-reader.tsx` | Main model viewer | Changing core UI |
| `src/components/explorer/views-3d/` | 3D visualizations | Fixing 3D rendering |
| `docs/BRD-v1.5-proposed-updates.md` | Business requirements | Understanding features |
| `docs/ui-patterns.md` | Design system rules | UI consistency questions |

## Current Focus

3D visualization improvements (galaxy, constellation, journey views). Recent work: card rendering, opacity, text layout, selection indicators.

## Design Principles (TL;DR)

- **Clean, Linear-like** — minimal, precise, professional
- **Warm neutrals** — off-white (#F8F8F7) backgrounds, navy (#002C61) brand, blue (#0081F2) interactive
- **Clarity over decoration** — every element earns its place
- **AI as collaborator** — transparent diffs, version history, user approval required

## Common Tasks

**Adding a model field:**
1. Update `src/domain/intent-model/model.ts` (types)
2. Update `src/domain/intent-model/schema.ts` (validation)
3. Update relevant UI components

**Fixing 3D rendering:**
1. Check `src/components/explorer/views-3d/shared/` for shared components
2. Test in browser at :4444
3. Specific views: `galaxy/`, `constellation/`, `journey/`

**Changing UI patterns:**
1. Read `docs/ui-patterns.md` first
2. Check if ShadCN component exists
3. Keep consistent with existing patterns

## Running Locally

```bash
pnpm dev       # Start dev server (port 4444)
pnpm lint      # Run linter
pnpm build     # Production build
```

## Git Workflow

- Main branch: `main`
- Commit small, frequent changes
- Descriptive commit messages: `fix(3d): improve card opacity`

---

*Last updated: 2026-03-24*
