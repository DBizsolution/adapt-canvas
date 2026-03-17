# How the VBS Intent Model Review Works

## Review Process

1. **Select your name** from the Reviewer dropdown
2. **Navigate to a section** — Actors, Entities, Journeys, Rules, Constraints, or Open Questions
3. **Read each item** and either Approve or Dispute it with a comment
4. **Track consensus progress** on the dashboard until all sections are approved

## When Disputes Arise

1. Disputed items are flagged for the model author to revise
2. The author updates the intent model via the AI Chat panel or directly in `model.ts`
3. Changed items automatically reset to "Revised" — reviewers re-review only what changed

## When Consensus Is Reached

1. All sections approved by all assigned reviewers → "Ready for Phase 3"
2. Run `pnpm intent:snapshot` to save the approved version
3. The approved intent model feeds directly into the next phases

## What the Approved Model Feeds Into

| Phase | Name | Description |
|---|---|---|
| Phase 3 | State Machines | Extract lifecycle transitions into formal state machines |
| Phase 4 | Domain Types | Generate TypeScript types, Zod schemas, and status utilities |
| Phase 5 | Info Architecture | Derive routes, screens, and navigation from actors and journeys |
| Phase 6–9 | Design → Code → Validate | Wireframes, design system, code generation, and final validation |

## Workflow in Practice

```bash
1. pnpm intent:snapshot           # save the approved v0.1.0
2. Bump version in model.ts       # → v0.2.0
3. Open Claude Code in the same repo
4. "Extract state machines from the approved intent model"
   → AI reads model.ts entities + journeys
   → Generates state machine definitions
5. Continue through Phase 4, 5, etc. — each phase reads the same model
```

The intent model is the single source of truth. Every downstream artifact is derived from it, never the other way around.
