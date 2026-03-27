# BRD Ingest: Hybrid Approach (Domain + Requirements Separation)

**Date:** 2026-03-27
**Approach:** Option 1 - Clean separation of domain model and project requirements
**Target:** Generate BRD-compliant output without bloating the intent model

---

## Philosophy

**Keep the intent model pure** — it models the domain (actors, entities, journeys, business rules).

**Separate project requirements** — assumptions, dependencies, NFRs live in their own file.

**Auto-generate FRs** — derive from actor responsibilities, don't store them.

**BRD generator combines both** — domain model + project requirements = complete BRD.

---

## Architecture

```
src/domain/
├── intent-model/              # DOMAIN MODEL (unchanged)
│   ├── types.ts              # Domain types only
│   ├── model.ts              # Actors, entities, journeys, business rules
│   └── history/              # Model versions
│
└── project-requirements/      # NEW: PROJECT CONTEXT
    ├── types.ts              # Requirements types
    └── requirements.ts       # Assumptions, dependencies, NFRs

src/lib/
├── brd-generator.ts          # UPDATED: Combines both sources
└── fr-generator.ts           # NEW: Auto-generates FRs from responsibilities
```

---

## Phase 1: Create Project Requirements Structure

### Step 1.1: Create Requirements Types

**File:** `src/domain/project-requirements/types.ts`

```typescript
// Project requirements - context for delivery, not domain concepts

export type ProjectRequirements = {
  assumptions: Assumption[]
  dependencies: Dependency[]
  nfrs: NonFunctionalRequirement[]
}

export type Assumption = {
  id: string // e.g. "A-001"
  category: string // e.g. "User Roles and Access"
  assumption: string // The assumption statement
  rationale?: string // Why this assumption exists
  impact?: string // Impact if assumption changes
}

export type Dependency = {
  id: string // e.g. "DEP-001"
  name: string // e.g. "Identity and SSO"
  description: string // What is needed
  owner: string // Who owns/provides this
  status?: 'defined' | 'pending' | 'blocked' | 'resolved'
  risk?: 'low' | 'medium' | 'high'
}

export type NonFunctionalRequirement = {
  id: string // e.g. "NFR-001"
  category: 'performance' | 'availability' | 'audit' | 'security' | 'scalability' | 'usability'
  requirement: string // The NFR statement
  measurement?: string // How to measure/verify
  target?: string // Specific target (e.g. "< 2 seconds")
}
```

### Step 1.2: Create Requirements Data

**File:** `src/domain/project-requirements/requirements.ts`

```typescript
import type { ProjectRequirements, Assumption, Dependency, NonFunctionalRequirement } from './types'

// Extracted from VBS_Pickup_BRD(Final)_V1.5.pdf Sections 7.1, 7.3, 8

const assumptions: Assumption[] = [
  // User Roles and Access (5 assumptions)
  {
    id: 'A-001',
    category: 'User Roles and Access',
    assumption: 'A single, generic LSP role is used to represent wholesale freight forwarders, freight forwarders, and transport carriers.',
    rationale: 'Simplifies Phase 1 implementation; specific sub-roles can be added later if needed'
  },
  {
    id: 'A-002',
    category: 'User Roles and Access',
    assumption: 'LSP access is at company account level, not individual named users. One login per company; internal distribution and control of access are managed by the company itself.',
    rationale: 'Phase 1 focuses on company-level access; user management within LSP accounts is delegated'
  },
  {
    id: 'A-003',
    category: 'User Roles and Access',
    assumption: 'Supported user types are: LSP, ACFS Admin, and ACFS User. One ACFS Admin will act as a "Super User" at launch with authority to create subsequent users.',
    rationale: 'Bootstrap initial system access; Super User can create other admin and user accounts'
  },

  // Onboarding and Authentication (3 assumptions)
  {
    id: 'A-004',
    category: 'Onboarding and Authentication',
    assumption: 'There is no self-registration for Day 1. LSP and ACFS user accounts are created by ACFS Admin.',
    rationale: 'Controlled onboarding; prevents unauthorized access during initial rollout'
  },
  {
    id: 'A-005',
    category: 'Onboarding and Authentication',
    assumption: 'Welcome or activation links for LSP accounts expire after 72 hours; reactivation after expiry requires ACFS support.',
    rationale: 'Security measure; limits exposure window for activation links'
  },
  {
    id: 'A-006',
    category: 'Onboarding and Authentication',
    assumption: 'ACFS internal users authenticate via the existing ACFS SSO identity platform.',
    rationale: 'Leverages existing enterprise authentication; no duplicate credential management'
  },

  // Booking Eligibility and Readiness (2 assumptions)
  {
    id: 'A-007',
    category: 'Booking Eligibility and Readiness',
    assumption: 'A booking can only be submitted when, for all included HBLs: The shipment milestone is Unpacked, The shipment is fully customs cleared, and All required DOs are uploaded and validated or marked as free release.',
    rationale: 'Enforces operational readiness; prevents premature booking attempts'
  },
  {
    id: 'A-008',
    category: 'Booking Eligibility and Readiness',
    assumption: 'Missing or invalid DOs are resolved by upload or re-upload; a new booking is not required solely due to DO issues.',
    rationale: 'Allows in-place resolution without canceling and recreating entire booking'
  },

  // Shipment and HBL Visibility (2 assumptions)
  {
    id: 'A-009',
    category: 'Shipment and HBL Visibility',
    assumption: 'HBL-to-primary-hop mapping and detailed customs status are available in Maximas and will be provided to VBS as ready-to-consume fields.',
    rationale: 'Maximas is system of record; VBS consumes rather than derives this data'
  },
  {
    id: 'A-010',
    category: 'Shipment and HBL Visibility',
    assumption: 'Only the "next-hop" party name for an HBL is displayed at a time.',
    rationale: 'Hop-by-hop visibility model; commercial sensitivity and liability boundaries (C-009)'
  },

  // One-off Bookings (1 assumption)
  {
    id: 'A-011',
    category: 'One-off Bookings',
    assumption: 'One-off bookings, where only an email address is required and no account is created, are recognised but will not be implemented in Phase 1 and will be considered for a fast follow.',
    rationale: 'Deferred to reduce Phase 1 scope; P4TC functionality acknowledged but not built yet'
  },

  // Fees and Charges (6 assumptions)
  {
    id: 'A-012',
    category: 'Fees and Charges',
    assumption: 'Storage fee payment and storage fee calculation are outside the scope of VBS.',
    rationale: 'Separate billing system handles storage fees; VBS only shows indicator flag'
  },
  {
    id: 'A-013',
    category: 'Fees and Charges',
    assumption: 'A storage fee indicator flag will be available based on LFD; it indicates potential outstanding fees but does not drive calculation.',
    rationale: 'Informational only; actual fee calculation happens in separate finance system'
  },
  {
    id: 'A-014',
    category: 'Fees and Charges',
    assumption: 'A minimum charge applies per booking, not per HBL.',
    rationale: 'Ensures minimum revenue per transaction regardless of HBL count'
  },
  {
    id: 'A-015',
    category: 'Fees and Charges',
    assumption: 'A chargeable weight field is used to calculate individual HBL fees.',
    rationale: 'chargeable_weight = MAX(weight_kg, volume_m3); industry-standard volumetric pricing'
  },
  {
    id: 'A-016',
    category: 'Fees and Charges',
    assumption: 'Total booking fees equal the sum of all HBL fees plus the minimum booking charge.',
    rationale: 'Transparent fee breakdown; sum of per-HBL charges plus fixed minimum'
  },
  {
    id: 'A-017',
    category: 'Fees and Charges',
    assumption: 'Total load is calculated using the total weight and volume across all HBLs.',
    rationale: 'Informational for LSP dispatch planning; not used for fee calculation'
  },

  // Slot Booking and Configuration (4 assumptions)
  {
    id: 'A-018',
    category: 'Slot Booking and Configuration',
    assumption: 'Each booking supports a single slot selection.',
    rationale: 'Phase 1 simplification; multiple slots per booking deferred'
  },
  {
    id: 'A-019',
    category: 'Slot Booking and Configuration',
    assumption: 'No Day 1 restrictions are enforced on load or truck type.',
    rationale: 'LSP responsible for truck capacity matching; no slot capacity limits enforced'
  },
  {
    id: 'A-020',
    category: 'Slot Booking and Configuration',
    assumption: 'Site data will be uploaded once directly into the backend; no site configuration module is required for Phase 1.',
    rationale: 'Static data; DB-seeded approach sufficient for Phase 1 (C-006)'
  },
  {
    id: 'A-021',
    category: 'Slot Booking and Configuration',
    assumption: 'Heatmap indicators are informational only and do not prevent bookings.',
    rationale: 'Visual guidance for slot selection; no hard capacity enforcement'
  },

  // Driver and Truck Management (4 assumptions)
  {
    id: 'A-022',
    category: 'Driver and Truck Management',
    assumption: 'Driver details are captured and can be reused under the same LSP company account, subject to design.',
    rationale: 'Convenience for repeat bookings; driver records scoped per LSP account (BR-016)'
  },
  {
    id: 'A-023',
    category: 'Driver and Truck Management',
    assumption: 'Driver data is not shared across LSPs.',
    rationale: 'Privacy and commercial sensitivity; each LSP maintains own driver roster'
  },
  {
    id: 'A-024',
    category: 'Driver and Truck Management',
    assumption: 'Drivers do not receive system-generated emails; booking references and instructions are provided offline by the LSP.',
    rationale: 'Driver is not a portal user; booking party manages driver communication (BR-012)'
  },
  {
    id: 'A-025',
    category: 'Driver and Truck Management',
    assumption: 'Previously entered driver and truck data will not be maintained for Phase 1. This will be introduced in the fast follow/next phase.',
    rationale: 'Deferred feature; Phase 1 treats driver/truck as booking attributes only'
  },

  // Booking Modifications and Cancellations (6 assumptions)
  {
    id: 'A-026',
    category: 'Booking Modifications and Cancellations',
    assumption: 'Before the change cut-off, LSPs may update driver details, truck details, and slot selection (subject to new slot availability).',
    rationale: 'Flexibility for operational changes before cutoff deadline (BR-015)'
  },
  {
    id: 'A-027',
    category: 'Booking Modifications and Cancellations',
    assumption: 'After the change cut-off and until all HBLs in the booking are collected, LSPs may only update driver and truck details.',
    rationale: 'Limited changes after cutoff; slot/HBL changes locked to prevent operational disruption (BR-015)'
  },
  {
    id: 'A-028',
    category: 'Booking Modifications and Cancellations',
    assumption: 'Slot selection and any fee-impacting attributes are locked after change cut-off.',
    rationale: 'Protects ACFS operational planning; fee stability after cutoff'
  },
  {
    id: 'A-029',
    category: 'Booking Modifications and Cancellations',
    assumption: 'Fee-impacting changes are not supported via the LSP interface in Phase 1 and require ACFS Admin intervention.',
    rationale: 'Controlled process for changes affecting fees; ACFS oversight required'
  },
  {
    id: 'A-030',
    category: 'Booking Modifications and Cancellations',
    assumption: 'ACFS Admin can make such changes on the LSP's behalf in the backend.',
    rationale: 'Admin override capability; handles exceptional cases (BR-015)'
  },
  {
    id: 'A-031',
    category: 'Booking Modifications and Cancellations',
    assumption: 'Booking cancellations by LSPs are permitted, and upon cancellation, HBLs in that booking shall become available for rebooking; financial refunds or adjustments will be handled outside VBS.',
    rationale: 'VBS tracks cancellation status; finance system handles refund processing (BR-022)'
  },

  // Delivery Order Validation (4 assumptions)
  {
    id: 'A-032',
    category: 'Delivery Order Validation',
    assumption: 'DO validation is a manual administrative process performed by ACFS.',
    rationale: 'Complex validation rules requiring human judgment; not automatable in Phase 1'
  },
  {
    id: 'A-033',
    category: 'Delivery Order Validation',
    assumption: 'Invalid DOs must be corrected and re-uploaded before processing continues.',
    rationale: 'Hard gate for pickup authorization; compliance requirement'
  },
  {
    id: 'A-034',
    category: 'Delivery Order Validation',
    assumption: 'Validation criteria and decisions are governed by ACFS Operations and Compliance.',
    rationale: 'Business rules owned by operations team; VBS records validation results'
  },
  {
    id: 'A-035',
    category: 'Delivery Order Validation',
    assumption: 'Once all HBLs in a booking are reviewed and conditions are met, bookings are marked processed, and shipment statuses update from Maximas on the next sync cycle.',
    rationale: 'Maximas remains system of record for milestone updates; VBS reflects state'
  },
]

const dependencies: Dependency[] = [
  {
    id: 'DEP-001',
    name: 'Identity and SSO',
    description: 'Integration with ACFS SSO platform for internal user authentication.',
    owner: 'ACFS IT / Security',
    status: 'pending',
    risk: 'medium'
  },
  {
    id: 'DEP-002',
    name: 'Maximas Data Feed',
    description: 'Reliable provision of HBL data, milestones (e.g. Unpacked, Collected), customs status, and any required storage-related indicators to VBS.',
    owner: 'ACFS IT / Maximas Product Owner',
    status: 'pending',
    risk: 'high'
  },
  {
    id: 'DEP-003',
    name: 'Payment Gateway',
    description: 'Selection, configuration, and commercial enablement of Stripe or an alternative gateway (e.g. Compay). Final selection to be confirmed by ACFS.',
    owner: 'ACFS Finance / IT',
    status: 'pending',
    risk: 'medium'
  },
  {
    id: 'DEP-004',
    name: 'Charging Configuration',
    description: 'Definition and maintenance of pricing parameters (minimum booking charge, rates, and chargeable weight rules).',
    owner: 'ACFS Finance / Product',
    status: 'pending',
    risk: 'low'
  },
  {
    id: 'DEP-005',
    name: 'Communication Content',
    description: 'Provision of email templates and message copy for: Delegation notifications, Booking confirmations, DO invalid notifications, User activation/onboarding.',
    owner: 'ACFS Operations / Legal / Marketing (as applicable)',
    status: 'pending',
    risk: 'low'
  },
  {
    id: 'DEP-006',
    name: 'Slot and Site Configuration',
    description: 'Initial and ongoing slot and site configuration in backend.',
    owner: 'ACFS IT / Operations',
    status: 'pending',
    risk: 'low'
  },
  {
    id: 'DEP-007',
    name: 'DO Validation Rules',
    description: 'Business rules and criteria for what constitutes a valid DO and how non-compliance is treated.',
    owner: 'ACFS Operations / Compliance',
    status: 'pending',
    risk: 'medium'
  },
]

const nfrs: NonFunctionalRequirement[] = [
  // Performance
  {
    id: 'NFR-001',
    category: 'performance',
    requirement: 'The system should provide responsive HBL list and search operations suitable for day-to-day operational use.',
    measurement: 'User-perceived responsiveness; no hard target for Phase 1',
    target: 'Acceptable for operational use (< 3 seconds for typical queries)'
  },
  {
    id: 'NFR-002',
    category: 'performance',
    requirement: 'Slot availability views and booking submission should complete within acceptable operational timeframes.',
    measurement: 'End-to-end booking submission time',
    target: 'Acceptable for operational use (< 5 seconds for booking confirmation)'
  },

  // Availability
  {
    id: 'NFR-003',
    category: 'availability',
    requirement: 'The system should be available during ACFS-defined business operating hours for LSP and ACFS users, with specific targets defined in technical and support SLAs.',
    measurement: 'Uptime percentage during business hours',
    target: 'SLA-defined (typically 99%+ during business hours)'
  },

  // Audit and Logging
  {
    id: 'NFR-004',
    category: 'audit',
    requirement: 'Key actions must be auditable, including: Delegation of HBLs, Creation and modification of bookings, DO validation decisions, User creation and role changes.',
    measurement: 'Audit log completeness and retention',
    target: 'All listed actions logged with actor, timestamp, and key data changes'
  },
  {
    id: 'NFR-005',
    category: 'audit',
    requirement: 'Audit logs should capture actor, timestamp, and key data changes to support compliance and operational investigations.',
    measurement: 'Audit log detail and searchability',
    target: 'Sufficient detail for compliance audit and issue investigation'
  },

  // Security
  {
    id: 'NFR-006',
    category: 'security',
    requirement: 'Access control must enforce role-based permissions for LSP, ACFS Admin, and ACFS User roles.',
    measurement: 'Role-based access control (RBAC) enforcement',
    target: '100% of operations gated by role permissions'
  },
  {
    id: 'NFR-007',
    category: 'security',
    requirement: 'Data exchange with Maximas and the payment gateway must follow ACFS security guidelines and integration standards.',
    measurement: 'Security compliance assessment',
    target: 'Passes ACFS security review for data exchange'
  },
]

export const projectRequirements: ProjectRequirements = {
  assumptions,
  dependencies,
  nfrs,
}
```

---

## Phase 2: Create FR Generator (Auto-Generate from Responsibilities)

### Step 2.1: Create FR Generator

**File:** `src/lib/fr-generator.ts`

```typescript
import type { IntentModel, Actor, Responsibility } from '@/domain/intent-model/types'

export type FunctionalRequirement = {
  id: string // e.g. "FR-LSP-01"
  category: 'lsp' | 'admin'
  description: string
  mapped_to: string[] // Actor responsibility IDs
  source_actor: string // Actor ID
}

/**
 * Auto-generates functional requirements from actor responsibilities.
 *
 * Mapping logic:
 * - LSP actor → FR-LSP-XX
 * - ACFS actor → FR-ADM-XX
 * - Other actors → skipped (deferred or not requiring FRs)
 *
 * FR description format: Converts responsibility to "System shall..." format
 */
export function generateFunctionalRequirements(model: IntentModel): FunctionalRequirement[] {
  const frs: FunctionalRequirement[] = []

  // Counter for FR IDs
  let lspCounter = 1
  let admCounter = 1

  for (const actor of model.actors) {
    // Skip deferred actors
    if (actor.deferred) continue

    const category = getActorCategory(actor)
    if (!category) continue // Skip actors that don't map to FR categories

    for (const responsibility of actor.responsibilities) {
      const id = category === 'lsp'
        ? `FR-LSP-${String(lspCounter++).padStart(2, '0')}`
        : `FR-ADM-${String(admCounter++).padStart(2, '0')}`

      frs.push({
        id,
        category,
        description: toSystemShallFormat(responsibility, actor),
        mapped_to: [responsibility.id],
        source_actor: actor.id,
      })
    }
  }

  return frs
}

/**
 * Determines FR category from actor ID
 */
function getActorCategory(actor: Actor): 'lsp' | 'admin' | null {
  if (actor.id === 'lsp') return 'lsp'
  if (actor.id === 'acfs') return 'admin'
  // p4tc, driver, gatehouse don't get FRs (deferred or no system requirements)
  return null
}

/**
 * Converts responsibility description to "System shall..." format
 *
 * Examples:
 * - "View list of assigned HBLs" → "System shall display list of assigned HBLs to LSP"
 * - "Delegate shipments to another LSP" → "System shall allow LSP to delegate shipments"
 */
function toSystemShallFormat(responsibility: Responsibility, actor: Actor): string {
  const desc = responsibility.description

  // If already in "system shall" format, return as-is
  if (desc.toLowerCase().includes('system') && desc.toLowerCase().includes('shall')) {
    return desc
  }

  // Pattern: "View X" → "System shall display X to [actor]"
  if (desc.match(/^View\s/i)) {
    return `System shall display ${desc.substring(5)} to ${actor.name}.`
  }

  // Pattern: "Select X" → "System shall allow [actor] to select X"
  if (desc.match(/^Select\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Pattern: "Upload X" → "System shall allow [actor] to upload X"
  if (desc.match(/^Upload\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Pattern: "Book X" → "System shall allow [actor] to book X"
  if (desc.match(/^Book\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Pattern: "Delegate X" → "System shall allow [actor] to delegate X"
  if (desc.match(/^Delegate\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Pattern: "Modify X" → "System shall allow [actor] to modify X"
  if (desc.match(/^Modify\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Pattern: "Search X" → "System shall allow [actor] to search X"
  if (desc.match(/^Search\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Pattern: "Configure X" → "System shall allow [actor] to configure X"
  if (desc.match(/^Configure\s/i)) {
    return `System shall allow ${actor.name} to ${desc.toLowerCase()}.`
  }

  // Default: Wrap in "System shall allow [actor] to..."
  return `System shall allow ${actor.name} to: ${desc}`
}

/**
 * Groups FRs by category for rendering
 */
export function groupFunctionalRequirements(frs: FunctionalRequirement[]): {
  lsp: FunctionalRequirement[]
  admin: FunctionalRequirement[]
} {
  return {
    lsp: frs.filter(fr => fr.category === 'lsp'),
    admin: frs.filter(fr => fr.category === 'admin'),
  }
}
```

---

## Phase 3: Update BRD Generator

### Step 3.1: Update brd-generator.ts

**File:** `src/lib/brd-generator.ts`

```typescript
import type { IntentModel } from '@/domain/intent-model/types'
import type { ProjectRequirements } from '@/domain/project-requirements/types'
import { generateFunctionalRequirements, groupFunctionalRequirements } from './fr-generator'

// Update function signature to accept both sources
export function generateBRD(
  model: IntentModel,
  requirements: ProjectRequirements
): string {
  const lines: string[] = []

  function push(line: string) { lines.push(line) }
  function blank() { lines.push('') }

  // ... existing sections (meta, actors, entities, journeys, business rules, constraints) ...

  // --- NEW SECTION 8: Functional Requirements (Auto-Generated) ---
  push('## 8. Functional Requirements')
  blank()
  push('*Note: Functional requirements are auto-generated from actor responsibilities for traceability.*')
  blank()

  const frs = generateFunctionalRequirements(model)
  const grouped = groupFunctionalRequirements(frs)

  if (grouped.lsp.length > 0) {
    push('### 8.1 LSP Functional Requirements')
    blank()
    for (const fr of grouped.lsp) {
      push(`**${fr.id}:** ${fr.description}`)
      push(`  - *Derived from:* ${fr.mapped_to.join(', ')}`)
      blank()
    }
  }

  if (grouped.admin.length > 0) {
    push('### 8.2 ACFS Admin Functional Requirements')
    blank()
    for (const fr of grouped.admin) {
      push(`**${fr.id}:** ${fr.description}`)
      push(`  - *Derived from:* ${fr.mapped_to.join(', ')}`)
      blank()
    }
  }

  // --- NEW SECTION 9: Assumptions ---
  push('## 9. Assumptions')
  blank()

  const assumptionsByCategory = new Map<string, typeof requirements.assumptions>()
  for (const assumption of requirements.assumptions) {
    const group = assumptionsByCategory.get(assumption.category) ?? []
    group.push(assumption)
    assumptionsByCategory.set(assumption.category, group)
  }

  for (const [category, assumptions] of assumptionsByCategory) {
    push(`### ${category}`)
    blank()
    for (const a of assumptions) {
      push(`**${a.id}:** ${a.assumption}`)
      if (a.rationale) {
        push(`  - *Rationale:* ${a.rationale}`)
      }
      blank()
    }
  }

  // --- NEW SECTION 10: Dependencies and Ownership ---
  push('## 10. Dependencies and Ownership')
  blank()

  for (const dep of requirements.dependencies) {
    push(`### ${dep.name}`)
    blank()
    push(`**Dependency:** ${dep.description}`)
    blank()
    push(`**Owner:** ${dep.owner}`)
    blank()
    if (dep.status) {
      push(`**Status:** ${dep.status}`)
      blank()
    }
    if (dep.risk) {
      push(`**Risk:** ${dep.risk}`)
      blank()
    }
  }

  // --- NEW SECTION 11: Non-Functional Requirements ---
  push('## 11. High-Level Non-Functional Expectations')
  blank()

  const nfrsByCategory = new Map<string, typeof requirements.nfrs>()
  for (const nfr of requirements.nfrs) {
    const group = nfrsByCategory.get(nfr.category) ?? []
    group.push(nfr)
    nfrsByCategory.set(nfr.category, group)
  }

  for (const [category, nfrs] of nfrsByCategory) {
    push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`)
    blank()
    for (const nfr of nfrs) {
      push(`**${nfr.id}:** ${nfr.requirement}`)
      if (nfr.target) {
        push(`  - *Target:* ${nfr.target}`)
      }
      blank()
    }
  }

  // ... existing sections continue (open questions, decision log) ...

  return lines.join('\n')
}
```

### Step 3.2: Update BRD API Route

**File:** `src/app/api/brd/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getCurrentModel } from '@/lib/model-store'
import { projectRequirements } from '@/domain/project-requirements/requirements'
import { generateBRD } from '@/lib/brd-generator'

export async function GET(request: Request) {
  try {
    const model = await getCurrentModel()

    // Combine domain model + project requirements
    const markdown = generateBRD(model, projectRequirements)

    const { searchParams } = new URL(request.url)
    if (searchParams.get('format') === 'json') {
      return NextResponse.json({
        markdown,
        meta: {
          version: model.meta.version,
          project: model.meta.project,
          generatedAt: new Date().toISOString(),
        },
      })
    }

    return new NextResponse(markdown, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'brd_generation_failed', message }, { status: 500 })
  }
}
```

---

## Phase 4: Documentation & Validation

### Step 4.1: Update CHANGELOG

**File:** `docs/project/CHANGELOG.md`

Add entry for the enhancement:

```markdown
## [Unreleased] - 2026-03-27

### Added
- **Project Requirements Structure**: New `src/domain/project-requirements/` module for assumptions, dependencies, and NFRs
- **FR Auto-Generation**: Functional requirements now auto-generated from actor responsibilities for traceability
- **BRD Parity**: Generated BRD now includes all sections from PDF BRD v1.5 (Sections 8-11)
- 35 assumptions across 9 categories extracted from BRD v1.5 Section 7.1
- 7 dependencies with ownership tracking extracted from BRD v1.5 Section 7.3
- 7 non-functional requirements extracted from BRD v1.5 Section 8

### Changed
- `generateBRD()` now accepts both `IntentModel` and `ProjectRequirements` parameters
- BRD API route now combines domain model + project requirements
- Section numbering updated to match BRD v1.5 structure

### Technical
- Intent model remains pure (domain concepts only)
- No duplication: FRs are derived, not stored
- Clean separation of concerns: domain model vs project context
```

### Step 4.2: Create Comparison Document

**File:** `docs/brd-before-after-comparison-2026-03-27.md`

```markdown
# BRD Enhancement: Before vs After

## Before (v0.8.0)

**Sections:**
1. Purpose & Scope
2. Actors
3. Entities
4. User Journeys
5. Business Rules
6. Constraints
7. Open Questions & Decision Log

**Missing:**
- Functional Requirements (FR codes)
- Assumptions
- Dependencies
- Non-Functional Requirements

**Strengths:**
- Implementation-ready entity lifecycles
- Explicit business rules with traceability
- Recent updates (2026-03-24 meeting decisions)

**Gaps:**
- No formal FR codes for QA/dev tracking
- Project context scattered
- Not BRD-compliant for stakeholders

---

## After (v0.9.0)

**Sections:**
1. Purpose & Scope
2. Actors
3. Entities
4. User Journeys
5. Business Rules
6. Constraints
7. Open Questions & Decision Log
8. **Functional Requirements** (auto-generated from responsibilities)
9. **Assumptions** (35 items, 9 categories)
10. **Dependencies and Ownership** (7 items)
11. **High-Level Non-Functional Expectations** (7 items)

**Added:**
- FR-LSP-01 through FR-LSP-XX (auto-generated from LSP responsibilities)
- FR-ADM-01 through FR-ADM-XX (auto-generated from ACFS responsibilities)
- Complete assumptions from BRD v1.5 Section 7.1
- Complete dependencies from BRD v1.5 Section 7.3
- Complete NFRs from BRD v1.5 Section 8

**Architecture:**
- Intent model: Pure domain concepts (unchanged)
- Project requirements: Separate file for context
- FR generator: Auto-derives FRs from responsibilities
- BRD generator: Combines both sources

**Benefits:**
- ✅ BRD-compliant output
- ✅ No duplication (FRs auto-generated)
- ✅ Clean separation of concerns
- ✅ Requirements traceability
- ✅ Stakeholder-ready documentation
```

---

## Implementation Checklist

### Phase 1: Project Requirements Structure
- [ ] Create `src/domain/project-requirements/types.ts`
- [ ] Create `src/domain/project-requirements/requirements.ts`
- [ ] Add 35 assumptions to `requirements.ts`
- [ ] Add 7 dependencies to `requirements.ts`
- [ ] Add 7 NFRs to `requirements.ts`
- [ ] Verify TypeScript compiles

### Phase 2: FR Generator
- [ ] Create `src/lib/fr-generator.ts`
- [ ] Implement `generateFunctionalRequirements()`
- [ ] Implement `toSystemShallFormat()` transformation logic
- [ ] Implement `groupFunctionalRequirements()`
- [ ] Test FR generation with current model

### Phase 3: BRD Generator Updates
- [ ] Update `generateBRD()` signature in `brd-generator.ts`
- [ ] Add Section 8: Functional Requirements rendering
- [ ] Add Section 9: Assumptions rendering
- [ ] Add Section 10: Dependencies rendering
- [ ] Add Section 11: NFRs rendering
- [ ] Update `src/app/api/brd/route.ts` to pass both parameters
- [ ] Test BRD generation via API

### Phase 4: Documentation
- [ ] Update `docs/project/CHANGELOG.md`
- [ ] Create `docs/brd-before-after-comparison-2026-03-27.md`
- [ ] Verify generated BRD has all 11 sections
- [ ] Compare generated BRD with PDF BRD v1.5
- [ ] Commit changes with detailed commit message

---

## Testing Plan

### Unit Tests

```typescript
// Test FR generation
describe('generateFunctionalRequirements', () => {
  it('should generate FR-LSP codes from LSP responsibilities', () => {
    const model = { actors: [lspActor], ... }
    const frs = generateFunctionalRequirements(model)
    expect(frs[0].id).toBe('FR-LSP-01')
    expect(frs[0].category).toBe('lsp')
  })

  it('should generate FR-ADM codes from ACFS responsibilities', () => {
    const model = { actors: [acfsActor], ... }
    const frs = generateFunctionalRequirements(model)
    expect(frs[0].id).toBe('FR-ADM-01')
    expect(frs[0].category).toBe('admin')
  })

  it('should convert responsibility to system shall format', () => {
    const resp = { id: 'lsp:r1', description: 'View list of assigned HBLs' }
    const actor = { id: 'lsp', name: 'LSP' }
    const result = toSystemShallFormat(resp, actor)
    expect(result).toContain('System shall')
  })
})
```

### Integration Tests

```typescript
// Test BRD generation
describe('generateBRD with project requirements', () => {
  it('should include all 11 sections', () => {
    const brd = generateBRD(intentModel, projectRequirements)
    expect(brd).toContain('## 8. Functional Requirements')
    expect(brd).toContain('## 9. Assumptions')
    expect(brd).toContain('## 10. Dependencies')
    expect(brd).toContain('## 11. High-Level Non-Functional')
  })

  it('should include auto-generated FRs with traceability', () => {
    const brd = generateBRD(intentModel, projectRequirements)
    expect(brd).toContain('FR-LSP-01')
    expect(brd).toContain('*Derived from:* lsp:r1')
  })
})
```

### Manual Verification

1. **Generate BRD:**
   ```bash
   curl http://localhost:4444/api/brd > generated-brd.md
   ```

2. **Section checklist:**
   - [ ] Section 8: Functional Requirements present
   - [ ] FR-LSP codes generated (should match count of LSP responsibilities)
   - [ ] FR-ADM codes generated (should match count of ACFS responsibilities)
   - [ ] Section 9: Assumptions present with 9 categories
   - [ ] Section 10: Dependencies present with 7 items
   - [ ] Section 11: NFRs present with 4 categories

3. **Compare with PDF BRD v1.5:**
   - [ ] Structure matches (11 sections)
   - [ ] FR codes are traceable
   - [ ] Assumptions comprehensive
   - [ ] Dependencies have ownership
   - [ ] NFRs captured

---

## Timeline Estimate

| Phase | Estimated Effort |
|-------|-----------------|
| 1. Project Requirements Structure | 1-2 hours |
| 2. FR Generator | 2-3 hours |
| 3. BRD Generator Updates | 1-2 hours |
| 4. Documentation & Validation | 1 hour |
| **Total** | **5-8 hours** |

**Recommendation:** Complete in one focused session.

---

## Benefits Summary

### Conceptual Cleanliness
✅ Intent model stays pure (domain only)
✅ Project requirements separate (context)
✅ No duplication (FRs auto-generated)

### Requirements Traceability
✅ FR codes map back to actor responsibilities
✅ QA can write test cases against FR-XXX
✅ Dev can track implementation against FRs
✅ Bidirectional traceability maintained

### BRD Compliance
✅ Generated BRD matches PDF BRD v1.5 structure
✅ All 11 sections present
✅ Stakeholder-ready documentation

### Maintainability
✅ Single source of truth (domain model + project requirements)
✅ FRs update automatically when responsibilities change
✅ Project context isolated and easy to update

---

## Next Steps After Implementation

1. **Validate with Roni:**
   - Share generated BRD v0.9.0
   - Confirm FR auto-generation approach acceptable
   - Verify assumptions complete

2. **FR Enhancement (Optional):**
   - Improve `toSystemShallFormat()` transformation rules
   - Add acceptance criteria extraction
   - Add priority mapping

3. **Continuous Maintenance:**
   - Update assumptions when design decisions change
   - Track dependency resolution status
   - Measure NFRs and update targets

4. **Integration:**
   - Link FRs to test cases
   - Add FR coverage reporting
   - Track implementation status per FR
