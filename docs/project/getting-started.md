# Getting Started — VBS Intent Model & Portal

> **Note:** This guide is specific to the VBS Pickup Portal implementation. It documents a real-world usage of the Intent Model Canvas platform. For general setup instructions, see the main [README](../../README.md).

A complete setup guide for designers, PMs, and front-end engineers working on the VBS Pickup Portal project.

---

## Overview

The VBS project consists of two interconnected repositories:

| Repo | Purpose | Port | Stack |
|------|---------|------|-------|
| **vbs-intent** | Intent model review platform — consensus, AI editing, visualizations, BRD generation | 4444 | Next.js, React, TailwindCSS, ShadCN, Three.js |
| **vbs-portal** | Actual pickup portal — LSP, P4TC, ACFS, Gatehouse interfaces | 3000 | Next.js, React, TypeScript, TailwindCSS, ShadCN |

The intent model in `vbs-intent` is the **source of truth** for business requirements. The portal in `vbs-portal` is built from those requirements. Changes flow from intent model → portal via an auto-exported TypeScript contract file.

---

## Prerequisites

- **Node.js** 18+ (check with `node -v`)
- **pnpm** 8+ (install with `npm install -g pnpm`)
- **Git** configured with access to DBizsolution GitHub org
- **Code editor** (VS Code recommended)

---

## Part 1: Setting up vbs-intent (Intent Model Review)

### 1.1 Clone the repository

```bash
cd ~/DBiz
git clone git@github.com:DBizsolution/vbs-canvas.git vbs-intent
cd vbs-intent
```

> **Note:** The repo is named `vbs-canvas` on GitHub but lives locally as `vbs-intent`.

### 1.2 Install dependencies

```bash
pnpm install
```

### 1.3 Set up environment variables

Create `.env.local`:

```bash
# Required for AI-powered model editing
OPENAI_API_KEY=sk-...

# Optional: Vercel KV for production storage
# In dev, the app uses local JSON files
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

> Ask the project lead (Rahul) for the OpenAI API key.

### 1.4 Start the dev server

```bash
pnpm dev
```

The platform opens at **http://localhost:4444**

### 1.5 Verify the setup

1. Open http://localhost:4444 in your browser
2. You should see a modal asking you to select your name (Designer / PM / Engineer)
3. Select your role → you're taken to the dashboard showing 6 section cards
4. Click "Actors" → you should see 5 actor cards (LSP, P4TC, Driver, ACFS Internal, Gatehouse)

If you see this, setup is complete. ✅

---

## Part 2: Setting up vbs-portal (Pickup Portal Frontend)

### 2.1 Clone the repository

```bash
cd ~/DBiz
git clone git@github.com:DBizsolution/vbs-portal.git
cd vbs-portal
```

### 2.2 Install dependencies

```bash
pnpm install
```

### 2.3 Set up environment variables

Create `.env.local`:

```bash
# Database (if using Supabase/Postgres)
DATABASE_URL=postgresql://...

# Auth (if using NextAuth or similar)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# Payment (if using Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

> Ask the project lead for production/staging credentials if needed.

### 2.4 Start the dev server

```bash
pnpm dev
```

The portal opens at **http://localhost:3000**

### 2.5 Verify the setup

1. Open http://localhost:3000
2. You should see the portal landing page or login screen
3. Check the browser console — no errors should appear

If you see this, setup is complete. ✅

---

## Part 3: Connecting the two projects

The intent model in `vbs-intent` exports a **TypeScript contract file** to `vbs-portal` so that the portal's types, validation schemas, and state machines stay in sync with the model.

### 3.1 Export the contract (from vbs-intent)

```bash
cd ~/DBiz/vbs-intent
pnpm export:contract
```

This runs `scripts/export-contract.ts`, which:
1. Reads the intent model from `src/domain/intent-model/model.ts`
2. Generates `intent-contract.ts` with typed actors, entities, journeys, rules
3. Writes the file to `../vbs-portal/src/lib/intent-contract.ts`

You should see:
```
Contract exported (v0.8.0, 21 rules, 7 entities)
```

### 3.2 Use the contract in vbs-portal

In `vbs-portal/src`, import from the contract:

```typescript
import { actors, entities, businessRules } from '@/lib/intent-contract'

// Example: Check if a user can book
const lspActor = actors.find(a => a.id === 'lsp')
const canBook = lspActor?.responsibilities.some(r => r.includes('book'))

// Example: Get HBL fields
const hblEntity = entities.find(e => e.id === 'hbl')
const hblFields = hblEntity?.key_fields
```

### 3.3 When to re-export

Re-run `pnpm export:contract` in `vbs-intent` whenever:
- The intent model changes (entities, actors, rules)
- A new version is released (e.g., v0.8.0 → v0.7.2)
- Open questions are resolved and affect entity fields or rules

> **Tip:** Add a git hook to auto-export on model changes, or run it as part of your CI pipeline.

---

## Part 4: Workflows by role

### For Designers

#### Daily workflow

1. **Check for model updates**
   - Open http://localhost:4444/review
   - Dashboard shows if any items are "Revised" (yellow badge)
   - Go to the Diff page to see what changed since your last review

2. **Review items relevant to design**
   - Click "Actors" → review responsibilities, auth methods, constraints
   - Click "Journeys" → review step-by-step flows
   - Click "Constraints" → review platform limits (desktop-only, no mobile)

3. **Approve or dispute**
   - Expand each card → read details
   - Click "Approve" if it's clear and complete
   - Click "Dispute" if something is unclear, missing, or contradicts your understanding
   - Add a specific comment (e.g., "Step 3 should split into two — notification to LSP and driver should be separate")

4. **Propose changes via AI**
   - Use the chat panel on the right
   - Example: "Add a precondition to the LSP booking journey: LSP must have at least one saved driver OR enter new driver details"
   - The AI shows a plan → you confirm → it shows a diff → you approve

5. **Design screens referencing the model**
   - Use the entity `key_fields` for what data to show
   - Use the actor `responsibilities` for what actions are available
   - Use the `business_rules` for validation logic
   - Check `open_questions` — don't design around unresolved questions

#### Deliverables

- **Design files** (Figma, Pencil, or direct in vbs-portal code)
- **Screen inventory** mapping journeys to screens (see `docs/intent-model-to-screens-process.md`)
- **Approved items** in the intent model consensus review

---

### For PMs

#### Daily workflow

1. **Track consensus progress**
   - Open http://localhost:4444/review
   - Dashboard shows approval percentage across all reviewers
   - Reviewer table shows who's blocking consensus

2. **Manage open questions**
   - Click "Open Questions" section
   - Each open question blocks implementation of related features
   - Click "Resolve" when you have an answer from the client/team
   - Document the decision, impact, and source

3. **Run review sessions**
   - Share your screen with http://localhost:4444 open
   - Walk through disputed items
   - Use the AI chat to make updates in real-time:
     ```
     "Update BR-002 to clarify that DO waiver applies to free_release
      OR under_bond shipments. Confirmed by Matt 2026-03-18."
     ```
   - Ask reviewers to re-review revised items

4. **Generate BRDs and reports**
   - Click "BRD" in the nav → auto-generated business requirements document
   - Export sections as markdown for stakeholder emails
   - Upload reference docs (meeting notes, recordings, emails) to the Docs page

5. **Version management**
   - After major updates, snapshot the model:
     ```bash
     cd ~/DBiz/vbs-intent
     pnpm intent:snapshot
     ```
   - This saves a version to `src/domain/intent-model/history/`
   - Versions are used for diffing and rollback

#### Deliverables

- **Resolved open questions** with documented decisions
- **Updated model** reflecting client feedback
- **Version snapshots** before/after major changes
- **Consensus sign-off** from design and engineering

---

### For Front-end Engineers

#### Daily workflow

1. **Check the model for new/changed requirements**
   - Open http://localhost:4444/review
   - Go to Diff page → see exactly what changed since last version
   - Focus on Entities and Business Rules sections

2. **Review for implementability**
   - Click "Entities" → check if field types are precise enough
   - Click "Business Rules" → verify each rule is testable
   - Click "Journeys" → verify steps map to clear API sequences
   - Dispute if something is too vague:
     ```
     "BR-005 says cutoffs are relative day+time but doesn't specify
      timezone handling. What timezone are cutoffs evaluated in?"
     ```

3. **Import the intent contract**
   - Make sure the latest contract is exported:
     ```bash
     cd ~/DBiz/vbs-intent
     pnpm export:contract
     ```
   - In `vbs-portal`, import types and data:
     ```typescript
     import { actors, entities, businessRules } from '@/lib/intent-contract'
     ```

4. **Derive code from the model**
   - **State machines** from entity lifecycles:
     ```typescript
     const hblMilestoneTransitions = {
       on_vessel: ['at_wharf'],
       at_wharf: ['in_yard'],
       in_yard: ['unpacked'],
       unpacked: ['collected'],
       collected: [],
     }
     ```
   - **Validation functions** from business rules:
     ```typescript
     // From BR-001
     function canBook(hbls: HBL[]): boolean {
       return hbls.every(h =>
         h.milestone === 'unpacked' || h.milestone === 'collected'
       )
     }
     ```
   - **Zod schemas** from entity key_fields:
     ```typescript
     const HBLSchema = z.object({
       hbl_number: z.string(),
       milestone: z.enum(['on_vessel', 'at_wharf', 'in_yard', 'unpacked', 'collected']),
       hbl_status: z.enum(['unassigned', 'assigned', 'delegated', 'booked']),
       // ...
     })
     ```

5. **Flag implementation issues**
   - Use the AI chat to add warnings or edge cases:
     ```
     "Add a warn to the customs_clearance_status field —
      ICS update frequency is unknown, data may be stale at booking time"
     ```

#### Deliverables

- **Implemented features** in `vbs-portal` matching the intent model spec
- **Tests** validating business rules and state transitions
- **Code reviews** ensuring portal matches intent contract
- **Approved entities and rules** in consensus review

---

## Part 5: Cross-role workflows

### After a client meeting (PM + Designer + Engineer)

```
PM:       Opens vbs-intent, uses AI chat to update model with decisions
          Resolves open questions, adds new ones
          Runs: pnpm intent:snapshot

Designer: Opens Diff page → sees what changed
          Re-reviews affected journeys and actors
          Updates designs if journey steps changed

Engineer: Opens Diff page → sees what changed
          Re-reviews affected entities and business rules
          Runs: pnpm export:contract (in vbs-intent)
          Updates state machines / validation logic in vbs-portal
```

### When a dispute arises (any role)

```
1. Find the item in the section page
2. Click "Dispute"
3. Write a clear comment: what's wrong, what you think it should be
4. Item shows as "Disputed" (red) on dashboard
5. PM reviews dispute in next session
6. PM updates model → item resets to "Revised"
7. Original disputer re-reviews and approves
```

### When designing a new screen (Designer + Engineer)

```
Designer: 1. Check vbs-intent → find the relevant journey
          2. Extract steps, preconditions, and actor responsibilities
          3. Check entities for fields to display
          4. Check business rules for validation/gating logic
          5. Design the screen in Figma or directly in vbs-portal code

Engineer: 1. Review the design against the intent model
          2. Verify all business rules are represented
          3. Import intent contract in vbs-portal
          4. Build components using contract types
          5. Write tests that validate business rules
```

---

## Part 6: Key files and directories

### vbs-intent structure

```
vbs-intent/
├── src/domain/intent-model/
│   ├── model.ts              # THE SOURCE OF TRUTH — the intent model
│   ├── types.ts              # TypeScript types for all model sections
│   ├── history/              # Versioned snapshots (JSON)
│   └── review-state.json     # Reviewer approvals (local dev only)
├── src/components/
│   ├── review/               # Consensus review UI
│   ├── ai/                   # AI chat panel, diff preview
│   ├── explorer/             # 2D/3D visualizations
│   └── ia/                   # Implementation architecture map
├── src/lib/
│   ├── model-store.ts        # Versioning, KV/local persistence
│   ├── model-diff.ts         # Diff computation
│   ├── model-schemas.ts      # Zod validation schemas
│   ├── ai-prompt.ts          # AI system prompt
│   └── contract-export.ts    # Exports model to vbs-portal
├── docs/project/
│   ├── team-guide.md         # How to use the platform (all roles)
│   ├── getting-started.md    # This file
│   ├── brd-to-engineering-process.md  # Process validation doc
│   └── how-i-built-this.md   # Rahul's build log
└── scripts/
    └── export-contract.ts    # CLI script to export contract
```

### vbs-portal structure

```
vbs-portal/
├── src/
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   ├── lib/
│   │   └── intent-contract.ts  # GENERATED — do not edit manually
│   └── types/                # TypeScript types
└── docs/                     # Portal-specific docs
```

---

## Part 7: Common tasks

### Update the intent model (PM/Designer)

```bash
# Option 1: Use the AI chat in the browser (recommended)
1. Open http://localhost:4444
2. Use the chat panel: "Add a new journey for..."
3. Review the plan → confirm → approve the diff

# Option 2: Edit model.ts directly (advanced)
cd ~/DBiz/vbs-intent
code src/domain/intent-model/model.ts
# Make changes, save
pnpm lint  # Check for errors
```

### Export the contract to the portal (Engineer)

```bash
cd ~/DBiz/vbs-intent
pnpm export:contract
```

Verify the export:
```bash
cd ~/DBiz/vbs-portal
cat src/lib/intent-contract.ts  # Check the file exists and has data
```

### Snapshot a model version (PM)

```bash
cd ~/DBiz/vbs-intent
pnpm intent:snapshot
```

This saves the current model to `src/domain/intent-model/history/v0.8.0.json` (or next version).

### View version history (anyone)

```bash
cd ~/DBiz/vbs-intent
ls -lh src/domain/intent-model/history/
```

Or use the Diff page in the browser:
1. Open http://localhost:4444/review/diff
2. Select two versions to compare
3. See a side-by-side diff of changes

### Generate a BRD (PM)

```bash
# Option 1: View in browser (recommended)
Open http://localhost:4444/review/brd

# Option 2: Export to PDF
1. Open BRD page in browser
2. Cmd+P (macOS) or Ctrl+P (Windows)
3. "Save as PDF"
```

### Run both projects simultaneously

```bash
# Terminal 1
cd ~/DBiz/vbs-intent
pnpm dev  # Runs on :4444

# Terminal 2
cd ~/DBiz/vbs-portal
pnpm dev  # Runs on :3000
```

Now you have:
- Intent model platform at http://localhost:4444
- Pickup portal at http://localhost:3000

---

## Part 8: Troubleshooting

### vbs-intent won't start

**Error: `Module not found: Can't resolve '@/domain/intent-model/model'`**

Fix:
```bash
cd ~/DBiz/vbs-intent
rm -rf .next node_modules
pnpm install
pnpm dev
```

**Error: `OpenAI API key not found`**

Fix: Add `OPENAI_API_KEY` to `.env.local` (ask project lead for the key)

### vbs-portal can't find intent-contract.ts

**Error: `Cannot find module '@/lib/intent-contract'`**

Fix:
```bash
cd ~/DBiz/vbs-intent
pnpm export:contract
```

Then restart the portal dev server.

### Contract export fails

**Error: `Portal directory not found at ../vbs-portal`**

Fix: Make sure both repos are siblings under `~/DBiz/`:
```bash
ls ~/DBiz/
# Should show: vbs-intent  vbs-portal
```

If `vbs-portal` is elsewhere, update the path in `vbs-intent/src/lib/contract-export.ts`.

### Consensus review not saving

**Issue:** Approvals/disputes disappear on page refresh

This is expected in dev mode — review state lives in `src/domain/intent-model/review-state.json` (local file). In production, it uses Vercel KV.

To persist locally:
```bash
cd ~/DBiz/vbs-intent
cat src/domain/intent-model/review-state.json  # Check the file exists
```

If the file is missing, it will be created on your first approval/dispute.

---

## Part 9: What's next

### After getting set up

1. **Read the team guide**: `docs/project/team-guide.md` for role-specific workflows
2. **Read the process doc**: `docs/project/brd-to-engineering-process.md` for the BRD → intent → code pipeline
3. **Read the drift policy**: `docs/intent-model-to-screens-process.md` for when to update the model vs when to let code diverge

### Ongoing work

- **Designers**: Focus on screen inventory, journey flows, and consensus review of actors/journeys
- **PMs**: Focus on open question resolution, business rule validation, and version snapshots
- **Engineers**: Focus on implementing the portal, deriving code from the contract, and reviewing entities/rules for implementability

### Questions?

Ask the project lead (Rahul) or check:
- `docs/project/team-guide.md` — detailed role-specific workflows
- `docs/project/CHANGELOG.md` — version history and major changes
- `docs/project/how-i-built-this.md` — Rahul's build log and design decisions

---

**Last updated:** 2026-03-24
