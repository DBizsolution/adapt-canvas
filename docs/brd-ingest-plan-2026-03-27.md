# BRD Ingest Plan: Enhancing Intent Model from PDF BRD v1.5

**Date:** 2026-03-27
**Goal:** Ingest missing sections from Roni's PDF BRD v1.5 into the intent model
**Target Model Version:** v0.9.0 (after enhancement)

---

## Overview

This plan adds four new top-level sections to the intent model to achieve parity with the PDF BRD v1.5:

1. **Functional Requirements** (`functional_requirements`) - 39 traceable FR codes
2. **Assumptions** (`assumptions`) - Project assumptions and design decisions
3. **Dependencies** (`dependencies`) - External dependencies with ownership
4. **Non-Functional Requirements** (`nfrs`) - Performance, availability, audit, security

---

## Phase 1: Schema Enhancement

### Step 1.1: Update Type Definitions

**File:** `src/domain/intent-model/types.ts`

Add new types and update `IntentModel`:

```typescript
export type IntentModel = {
  meta: ModelMeta
  actors: Actor[]
  entities: Entity[]
  journeys: Journey[]
  business_rules: BusinessRule[]
  constraints: Constraint[]
  open_questions: OpenQuestion[]
  // NEW SECTIONS:
  functional_requirements: FunctionalRequirement[]
  assumptions: Assumption[]
  dependencies: Dependency[]
  nfrs: NonFunctionalRequirement[]
}

// NEW TYPE: Functional Requirement
export type FunctionalRequirement = {
  id: string // e.g. "FR-LSP-01"
  category: 'lsp' | 'admin' // LSP or ACFS Admin
  description: string // Full requirement text
  acceptance_criteria?: string[] // Optional bullet list
  mapped_to?: string[] // Optional: links to actor responsibilities or journey steps
  priority?: 'must' | 'should' | 'could' // Optional MoSCoW priority
}

// NEW TYPE: Assumption
export type Assumption = {
  id: string // e.g. "A-001"
  category: string // e.g. "User Roles and Access", "Booking Eligibility"
  assumption: string // The assumption statement
  rationale?: string // Optional: why this assumption exists
  impact?: string // Optional: impact if assumption changes
}

// NEW TYPE: Dependency
export type Dependency = {
  id: string // e.g. "DEP-001"
  name: string // e.g. "Identity and SSO"
  description: string // What is needed
  owner: string // Who owns/provides this
  status?: 'defined' | 'pending' | 'blocked' | 'resolved' // Optional status
  risk?: 'low' | 'medium' | 'high' // Optional risk assessment
}

// NEW TYPE: Non-Functional Requirement
export type NonFunctionalRequirement = {
  id: string // e.g. "NFR-001"
  category: 'performance' | 'availability' | 'audit' | 'security' | 'scalability' | 'usability'
  requirement: string // The NFR statement
  measurement?: string // Optional: how to measure/verify
  target?: string // Optional: specific target (e.g. "< 2 seconds")
}
```

### Step 1.2: Update Section Type Mappings

Add new section types to the mapping utilities:

```typescript
export type SectionType =
  | 'actor'
  | 'entity'
  | 'journey'
  | 'business_rule'
  | 'constraint'
  | 'open_question'
  | 'functional_requirement' // NEW
  | 'assumption' // NEW
  | 'dependency' // NEW
  | 'nfr' // NEW

export const SECTION_TYPE_TO_MODEL_KEY: Record<SectionType, keyof IntentModel> = {
  // ... existing mappings ...
  functional_requirement: 'functional_requirements',
  assumption: 'assumptions',
  dependency: 'dependencies',
  nfr: 'nfrs',
}

// Update reverse mappings and URL mappings accordingly
```

---

## Phase 2: Data Extraction from PDF BRD v1.5

### Step 2.1: Extract Functional Requirements

**Source:** PDF Pages 11-14 (Section 5)

#### LSP Functional Requirements (24 items)

```typescript
const lspRequirements: FunctionalRequirement[] = [
  {
    id: 'FR-LSP-01',
    category: 'lsp',
    description: 'System shall authenticate LSP access using a single company-level login per LSP and present an LSP dashboard upon successful authentication.',
    mapped_to: ['lsp:r1']
  },
  {
    id: 'FR-LSP-02',
    category: 'lsp',
    description: 'System shall display a list of all HBLs assigned to the logged-in LSP, showing at least: Lowest HBL Reference, Other HBL Reference, Container Number, OBL, Description, Weight, Volume, Next Hop (Next step party name), Milestone Status, Customs Status, Quantity, Pack Type, Storage Fee flag',
    mapped_to: ['lsp:r1']
  },
  {
    id: 'FR-LSP-03',
    category: 'lsp',
    description: 'System shall allow the LSP to select one or multiple HBLs from the list and choose an action: Delegate Shipments or Book Pickup.',
    mapped_to: ['lsp:r2', 'lsp:r3', 'lsp:r4']
  },
  {
    id: 'FR-LSP-04',
    category: 'lsp',
    description: 'For the delegation flow, system shall allow the LSP to search for a target LSP by company name or email address.',
    mapped_to: ['lsp:r3']
  },
  {
    id: 'FR-LSP-05',
    category: 'lsp',
    description: 'For unregistered email addresses, system shall record the delegation and send a notification email with a secure link to the specified address; the secure temporary access flow may be delivered as a fast follow.',
    mapped_to: ['lsp:r3']
  },
  {
    id: 'FR-LSP-06',
    category: 'lsp',
    description: 'System shall allow the LSP to upload one or more DO documents against each HBL and to mark HBLs as free release where appropriate.',
    mapped_to: ['lsp:r6']
  },
  {
    id: 'FR-LSP-07',
    category: 'lsp',
    description: 'System shall send delegation notification emails to the target LSP, using message copy provided by ACFS and including a link to the portal.',
    mapped_to: ['lsp:r3']
  },
  {
    id: 'FR-LSP-08',
    category: 'lsp',
    description: 'For the booking flow, system shall validate that each selected HBL meets readiness criteria: Shipment milestone is Unpacked, Shipment is fully customs cleared, All required DOs are uploaded and validated or marked as free release. If any HBL does not meet criteria, system shall prevent booking submission for that HBL and display an explanation.',
    mapped_to: ['lsp:r4'],
    acceptance_criteria: [
      'Milestone validation: HBL.milestone IN ("unpacked", "collected")',
      'Customs validation: HBL.customs_clearance_status = "fully_cleared"',
      'DO validation: (HBL.release_type = "free_release" OR HBL.under_bond = true OR all DOs validated)'
    ]
  },
  {
    id: 'FR-LSP-09',
    category: 'lsp',
    description: 'System shall allow the LSP to upload missing DOs within the booking flow to resolve readiness issues.',
    mapped_to: ['lsp:r4', 'lsp:r5']
  },
  {
    id: 'FR-LSP-10',
    category: 'lsp',
    description: 'System shall calculate total weight and total volume across all selected HBLs and display these to the LSP.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-11',
    category: 'lsp',
    description: 'System shall calculate per-HBL fees using: Per-HBL Chargeable Weight attribute, Configured Rate (provided by ACFS), Fee per HBL = Chargeable Weight × Rate.',
    mapped_to: ['lsp:r4'],
    acceptance_criteria: [
      'chargeable_weight = MAX(weight_kg, volume_m3)',
      'per_hbl_fee = chargeable_weight × rate'
    ]
  },
  {
    id: 'FR-LSP-12',
    category: 'lsp',
    description: 'System shall calculate total booking fee as: Total Booking Fee = Sum of all HBL fees + Minimum Booking Charge, where Minimum Booking Charge is provided by ACFS.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-13',
    category: 'lsp',
    description: 'System shall display per-HBL fee and total booking fee to the LSP before payment.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-14',
    category: 'lsp',
    description: 'System shall display available slots for the relevant site(s), including start time, end time, and a visual indication of slot busyness (for example, heat map), without revealing actual booking counts.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-15',
    category: 'lsp',
    description: 'System shall allow the LSP to select exactly one slot for each booking.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-16',
    category: 'lsp',
    description: 'System shall allow the LSP to enter and update driver details (Driver Name, Licence Number, Site Induction flag) and truck details (Truck Registration) for the booking.',
    mapped_to: ['lsp:r4', 'lsp:r8']
  },
  {
    id: 'FR-LSP-17',
    category: 'lsp',
    description: 'System shall require explicit acceptance of: Booking Terms and Conditions, Driver Site Induction Terms and Conditions (except when Site Induction = Yes, subject to ACFS confirmation). System shall store acceptance status and timestamps.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-18',
    category: 'lsp',
    description: 'System shall integrate with the selected payment gateway to process booking payments and shall only confirm bookings after payment is successfully completed.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-19',
    category: 'lsp',
    description: 'Upon successful payment, system shall: Confirm the booking in VBS, Generate a unique booking reference, Associate selected HBLs with the booking with their respective fee components, Send a booking confirmation email to the LSP with booking reference and key details.',
    mapped_to: ['lsp:r4']
  },
  {
    id: 'FR-LSP-20',
    category: 'lsp',
    description: 'System shall allow LSPs to search for and view existing bookings, including their status and associated HBLs.',
    mapped_to: ['lsp:r9']
  },
  {
    id: 'FR-LSP-21',
    category: 'lsp',
    description: 'Before the configured change cut-off, system shall allow LSPs to modify: Driver details, Truck details, Slot selection (subject to availability), while preventing any automated fee recalculation that affects total booking fees.',
    mapped_to: ['lsp:r8']
  },
  {
    id: 'FR-LSP-22',
    category: 'lsp',
    description: 'After change cut-off and before all HBLs in the booking are collected, system shall allow LSPs to modify only driver and truck details.',
    mapped_to: ['lsp:r8']
  },
  {
    id: 'FR-LSP-23',
    category: 'lsp',
    description: 'After all HBLs in a booking are collected, system shall prevent further modifications by LSP.',
    mapped_to: ['lsp:r8']
  },
  {
    id: 'FR-LSP-24',
    category: 'lsp',
    description: 'System shall allow LSPs to request booking cancellations, and upon cancellation, HBLs in that booking shall become available for rebooking; financial refunds or adjustments will be handled outside VBS.',
    mapped_to: ['lsp-cancels-booking']
  }
]
```

#### ACFS Admin Functional Requirements (15 items)

```typescript
const adminRequirements: FunctionalRequirement[] = [
  {
    id: 'FR-ADM-01',
    category: 'admin',
    description: 'System shall support the storage of site data and slot definitions, including: Site identifiers and names, Slot days of the week, Slot start and end times, Booking cut-off (relative day and time), Change cut-off (relative day and time), Heatmap indicator thresholds.',
    mapped_to: ['acfs:r3']
  },
  {
    id: 'FR-ADM-02',
    category: 'admin',
    description: 'In Phase 1, slot and site definitions shall be managed via backend/database configuration rather than a front-end configuration module.',
    mapped_to: ['acfs:r3']
  },
  {
    id: 'FR-ADM-03',
    category: 'admin',
    description: 'System shall allow ACFS Admin users to manage bookings on behalf of LSPs, including updating all booking attributes, with changes in Phase 1 being fee-free for the LSP.',
    mapped_to: ['acfs:r4']
  },
  {
    id: 'FR-ADM-04',
    category: 'admin',
    description: 'System shall provide DO validation capability for ACFS Admin and authorised ACFS Users, including: Viewing DO attachments per HBL, Marking each DO as Valid or Invalid, Recording validator identity and timestamp.',
    mapped_to: ['acfs:r5']
  },
  {
    id: 'FR-ADM-05',
    category: 'admin',
    description: 'System shall maintain an HBL-level "DOs Fully Validated" flag that is set when all associated DOs are marked Valid.',
    mapped_to: ['acfs:r5']
  },
  {
    id: 'FR-ADM-06',
    category: 'admin',
    description: 'When a DO is marked Invalid, system shall notify the relevant booking party requesting upload of corrected DOs.',
    mapped_to: ['acfs:r5']
  },
  {
    id: 'FR-ADM-07',
    category: 'admin',
    description: 'System shall allow ACFS Admin and authorised ACFS Users to perform pickup verification by: Searching bookings by multiple keys (booking reference, driver name, licence number, truck registration), Viewing booking details, included HBLs, and their DO validation status.',
    mapped_to: ['acfs:r6']
  },
  {
    id: 'FR-ADM-08',
    category: 'admin',
    description: 'System shall allow ACFS Admin and authorised ACFS Users to mark a booking as "Processed" once all conditions (including DO validation) are met.',
    mapped_to: ['acfs:r6']
  },
  {
    id: 'FR-ADM-09',
    category: 'admin',
    description: 'System shall update HBL status to "Collected" based on Maximas milestones received via integration.',
    mapped_to: ['acfs:r6']
  },
  {
    id: 'FR-ADM-10',
    category: 'admin',
    description: 'When all HBLs within a booking have status "Collected", system shall update the booking status to "Complete".',
    mapped_to: ['acfs:r6']
  },
  {
    id: 'FR-ADM-11',
    category: 'admin',
    description: 'System shall maintain and display HBL lifecycle states: Unassigned, Assigned, Delegated, Booked, Collected.',
    mapped_to: ['acfs:r7']
  },
  {
    id: 'FR-ADM-12',
    category: 'admin',
    description: 'System shall provide a function for fail-safe manual assignment of Unassigned HBLs to an LSP as the primary custody party, without requiring DOs.',
    mapped_to: ['acfs:r1', 'acfs:r7']
  },
  {
    id: 'FR-ADM-13',
    category: 'admin',
    description: 'System shall allow ACFS Admin to: Create LSP company accounts with single logins, Create ACFS Admin and ACFS User accounts, Update user details and roles, Deactivate/reactivate LSP and ACFS user accounts.',
    mapped_to: ['acfs:r7']
  },
  {
    id: 'FR-ADM-14',
    category: 'admin',
    description: 'System shall generate and send welcome or activation links for new LSP accounts, with links expiring after 72 hours.',
    mapped_to: ['acfs:r7']
  },
  {
    id: 'FR-ADM-15',
    category: 'admin',
    description: 'System shall integrate with ACFS SSO for internal ACFS Admin and ACFS User authentication.',
    mapped_to: ['acfs']
  }
]
```

### Step 2.2: Extract Assumptions

**Source:** PDF Pages 17-18 (Section 7.1)

```typescript
const assumptions: Assumption[] = [
  // User Roles and Access
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
  // Onboarding and Authentication
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
  // Booking Eligibility and Readiness
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
  // Shipment and HBL Visibility
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
  // One-off Bookings
  {
    id: 'A-011',
    category: 'One-off Bookings',
    assumption: 'One-off bookings, where only an email address is required and no account is created, are recognised but will not be implemented in Phase 1 and will be considered for a fast follow.',
    rationale: 'Deferred to reduce Phase 1 scope; P4TC functionality acknowledged but not built yet'
  },
  // Fees and Charges
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
  // Slot Booking and Configuration
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
  // Driver and Truck Management
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
  // Booking Modifications and Cancellations
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
  // Delivery Order Validation
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
  }
]
```

### Step 2.3: Extract Dependencies

**Source:** PDF Page 19 (Section 7.3)

```typescript
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
  }
]
```

### Step 2.4: Extract Non-Functional Requirements

**Source:** PDF Page 21 (Section 8)

```typescript
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
  }
]
```

---

## Phase 3: Update Intent Model

### Step 3.1: Update model.ts

**File:** `src/domain/intent-model/model.ts`

Add the extracted data arrays to the `intentModel` export:

```typescript
export const intentModel: IntentModel = {
  meta: {
    version: '0.9.0', // Bump version
    project: 'ACFS VBS Pickup Portal',
    lastUpdated: '2026-03-27',
    status: 'draft',
  },
  actors: [ /* existing actors */ ],
  entities: [ /* existing entities */ ],
  journeys: [ /* existing journeys */ ],
  business_rules: [ /* existing business rules */ ],
  constraints: [ /* existing constraints */ ],
  open_questions: [ /* existing open questions */ ],
  // NEW SECTIONS:
  functional_requirements: [
    ...lspRequirements,
    ...adminRequirements
  ],
  assumptions: assumptions,
  dependencies: dependencies,
  nfrs: nfrs,
}
```

---

## Phase 4: Update BRD Generator

### Step 4.1: Update brd-generator.ts

**File:** `src/lib/brd-generator.ts`

Add rendering logic for the four new sections:

```typescript
export function generateBRD(model: IntentModel): string {
  // ... existing sections (meta, actors, entities, journeys, business rules, constraints) ...

  // --- NEW: Functional Requirements ---
  push('## 8. Functional Requirements')
  blank()

  const lspFRs = model.functional_requirements.filter(fr => fr.category === 'lsp')
  const adminFRs = model.functional_requirements.filter(fr => fr.category === 'admin')

  if (lspFRs.length > 0) {
    push('### 8.1 LSP Functional Requirements')
    blank()
    for (const fr of lspFRs) {
      push(`**${fr.id}:** ${fr.description}`)
      if (fr.acceptance_criteria && fr.acceptance_criteria.length > 0) {
        blank()
        for (const criterion of fr.acceptance_criteria) {
          push(`  - ${criterion}`)
        }
      }
      if (fr.mapped_to && fr.mapped_to.length > 0) {
        push(`  - *Maps to:* ${fr.mapped_to.join(', ')}`)
      }
      blank()
    }
  }

  if (adminFRs.length > 0) {
    push('### 8.2 ACFS Admin Functional Requirements')
    blank()
    for (const fr of adminFRs) {
      push(`**${fr.id}:** ${fr.description}`)
      if (fr.acceptance_criteria && fr.acceptance_criteria.length > 0) {
        blank()
        for (const criterion of fr.acceptance_criteria) {
          push(`  - ${criterion}`)
        }
      }
      if (fr.mapped_to && fr.mapped_to.length > 0) {
        push(`  - *Maps to:* ${fr.mapped_to.join(', ')}`)
      }
      blank()
    }
  }

  // --- NEW: Assumptions ---
  push('## 9. Assumptions')
  blank()

  const assumptionsByCategory = new Map<string, typeof model.assumptions>()
  for (const assumption of model.assumptions) {
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

  // --- NEW: Dependencies and Ownership ---
  push('## 10. Dependencies and Ownership')
  blank()

  for (const dep of model.dependencies) {
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

  // --- NEW: Non-Functional Requirements ---
  push('## 11. High-Level Non-Functional Expectations')
  blank()

  const nfrsByCategory = new Map<string, typeof model.nfrs>()
  for (const nfr of model.nfrs) {
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

---

## Phase 5: Update Zod Schemas

### Step 5.1: Update model-schemas.ts

**File:** `src/lib/model-schemas.ts`

Add Zod validators for the new types:

```typescript
import { z } from 'zod'

// NEW SCHEMAS:
export const functionalRequirementSchema = z.object({
  id: z.string(),
  category: z.enum(['lsp', 'admin']),
  description: z.string(),
  acceptance_criteria: z.array(z.string()).optional(),
  mapped_to: z.array(z.string()).optional(),
  priority: z.enum(['must', 'should', 'could']).optional(),
})

export const assumptionSchema = z.object({
  id: z.string(),
  category: z.string(),
  assumption: z.string(),
  rationale: z.string().optional(),
  impact: z.string().optional(),
})

export const dependencySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  owner: z.string(),
  status: z.enum(['defined', 'pending', 'blocked', 'resolved']).optional(),
  risk: z.enum(['low', 'medium', 'high']).optional(),
})

export const nfrSchema = z.object({
  id: z.string(),
  category: z.enum(['performance', 'availability', 'audit', 'security', 'scalability', 'usability']),
  requirement: z.string(),
  measurement: z.string().optional(),
  target: z.string().optional(),
})

// Update intentModelSchema:
export const intentModelSchema = z.object({
  meta: modelMetaSchema,
  actors: z.array(actorSchema),
  entities: z.array(entitySchema),
  journeys: z.array(journeySchema),
  business_rules: z.array(businessRuleSchema),
  constraints: z.array(constraintSchema),
  open_questions: z.array(openQuestionSchema),
  // NEW:
  functional_requirements: z.array(functionalRequirementSchema),
  assumptions: z.array(assumptionSchema),
  dependencies: z.array(dependencySchema),
  nfrs: z.array(nfrSchema),
})
```

---

## Phase 6: Update AI Prompt

### Step 6.1: Update ai-prompt.ts

**File:** `src/lib/ai-prompt.ts`

Add the new types to the system prompt type definitions (if hardcoded):

```typescript
// Add to type definitions section:
type FunctionalRequirement = {
  id: string // e.g. "FR-LSP-01"
  category: 'lsp' | 'admin'
  description: string
  acceptance_criteria?: string[]
  mapped_to?: string[]
  priority?: 'must' | 'should' | 'could'
}

type Assumption = {
  id: string // e.g. "A-001"
  category: string
  assumption: string
  rationale?: string
  impact?: string
}

type Dependency = {
  id: string // e.g. "DEP-001"
  name: string
  description: string
  owner: string
  status?: 'defined' | 'pending' | 'blocked' | 'resolved'
  risk?: 'low' | 'medium' | 'high'
}

type NonFunctionalRequirement = {
  id: string // e.g. "NFR-001"
  category: 'performance' | 'availability' | 'audit' | 'security' | 'scalability' | 'usability'
  requirement: string
  measurement?: string
  target?: string
}

type IntentModel = {
  // ... existing fields ...
  functional_requirements: FunctionalRequirement[]
  assumptions: Assumption[]
  dependencies: Dependency[]
  nfrs: NonFunctionalRequirement[]
}
```

---

## Implementation Checklist

### Prerequisites
- [ ] Backup current `model.ts` before changes
- [ ] Create branch: `git checkout -b enhancement/brd-ingest-v09`

### Phase 1: Schema
- [ ] Update `types.ts` with new type definitions
- [ ] Update section type mappings
- [ ] Update `model-schemas.ts` with Zod validators
- [ ] Update `ai-prompt.ts` with type definitions

### Phase 2: Data
- [ ] Extract all 39 FR requirements from PDF pages 11-14
- [ ] Extract all 35 assumptions from PDF pages 17-18
- [ ] Extract all 7 dependencies from PDF page 19
- [ ] Extract all 7 NFRs from PDF page 21

### Phase 3: Model Update
- [ ] Add FR array to `model.ts`
- [ ] Add assumptions array to `model.ts`
- [ ] Add dependencies array to `model.ts`
- [ ] Add NFRs array to `model.ts`
- [ ] Bump version to 0.9.0
- [ ] Update lastUpdated to 2026-03-27

### Phase 4: Generator
- [ ] Add FR section rendering to `brd-generator.ts`
- [ ] Add assumptions section rendering
- [ ] Add dependencies section rendering
- [ ] Add NFRs section rendering
- [ ] Test generated BRD output

### Phase 5: Validation
- [ ] Run TypeScript type check
- [ ] Validate model against Zod schema
- [ ] Generate BRD and verify all sections present
- [ ] Compare generated BRD with PDF BRD v1.5

### Phase 6: Documentation
- [ ] Update CHANGELOG.md with v0.9.0 changes
- [ ] Document new sections in project docs
- [ ] Create comparison document showing before/after

---

## Expected Outcomes

After completing this ingest:

1. **Intent Model v0.9.0** will include:
   - 39 formal functional requirements (FR-LSP-01 through FR-LSP-24, FR-ADM-01 through FR-ADM-15)
   - 35 assumptions across 9 categories
   - 7 dependencies with ownership tracking
   - 7 non-functional requirements across 4 categories

2. **Generated BRD** will match PDF BRD v1.5 structure:
   - Section 8: Functional Requirements
   - Section 9: Assumptions
   - Section 10: Dependencies and Ownership
   - Section 11: High-Level Non-Functional Expectations

3. **Requirements Traceability**:
   - FR codes traceable to actor responsibilities and journeys
   - QA can write test cases against FR-XXX codes
   - Dev can track implementation against formal requirements
   - PM can do requirements coverage analysis

4. **Gap Resolution**:
   - All four critical gaps identified in comparison document addressed
   - Generated BRD now BRD-compliant and stakeholder-ready
   - Single source of truth established (intent model → generated BRD)

---

## Timeline Estimate

| Phase | Estimated Effort | Dependencies |
|-------|-----------------|--------------|
| 1. Schema Enhancement | 1-2 hours | None |
| 2. Data Extraction | 2-3 hours | PDF BRD v1.5 |
| 3. Model Update | 1 hour | Phase 1, Phase 2 |
| 4. Generator Update | 2-3 hours | Phase 1, Phase 3 |
| 5. Validation | 1-2 hours | Phase 4 |
| 6. Documentation | 1 hour | Phase 5 |
| **Total** | **8-12 hours** | Sequential |

**Recommendation:** Split across 2-3 sessions for quality control.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Type errors after schema changes | Medium | Medium | Incremental changes, run type check after each phase |
| Data extraction errors from PDF | Low | High | Manual verification against PDF, spot-check 10% of entries |
| BRD generator breaks existing sections | Low | High | Test existing sections first, compare before/after |
| Zod schema validation failures | Medium | Medium | Validate after each data addition, fix schema mismatches |
| FR mapping to responsibilities incomplete | Medium | Low | Mark as optional field, complete mappings incrementally |

---

## Next Steps After Ingest

1. **Reconcile with Implementation:**
   - Map FR requirements to actual implemented features
   - Identify any FRs not yet implemented (implementation gaps)
   - Add FR tracking to issue/task management

2. **Enhance with Recent Decisions:**
   - Add FR codes for new features discovered post-v1.5 (e.g., column customization BR-033)
   - Update dependencies status as they're resolved
   - Track NFR measurements in monitoring/observability

3. **Continuous Maintenance:**
   - When new requirements are added, assign FR codes
   - When assumptions change, update assumption records with impact
   - When dependencies are resolved, update status
   - When NFR targets are defined, document in NFR records

4. **Stakeholder Alignment:**
   - Share generated BRD v0.9.0 with Roni for validation
   - Confirm FR numbering matches expectations
   - Verify assumptions capture design intent
   - Validate dependencies ownership assignments

---

## Questions for Discussion

1. **FR Numbering:** Should we keep FR-LSP-01 through FR-LSP-24 as-is, or renumber to match any implementation changes?

2. **Assumptions Status:** Should assumptions have a `status` field (active/retired) to track when assumptions change?

3. **Dependencies Tracking:** Should we track dependency resolution progress (e.g., "Maximas feed: 60% complete")?

4. **NFR Targets:** Should we define specific targets now or mark as "TBD" and fill in during implementation?

5. **FR-to-Code Traceability:** Should we add code file references to FRs to enable bidirectional traceability?

6. **Version Strategy:** Should the intent model version match the BRD version (i.e., jump to v1.5) or maintain separate versioning?
