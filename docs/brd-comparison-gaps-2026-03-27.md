# BRD Comparison: PDF v1.5 vs Generated Markdown

**Date:** 2026-03-27
**Comparison:** `VBS_Pickup_BRD(Final)_V1.5.pdf` (Roni's source of truth) vs. Generated Markdown BRD (from Intent Model v0.8.0)

---

## Executive Summary

Your markdown documentation (generated from the intent model) is **significantly more detailed and implementation-focused** than Roni's PDF BRD v1.5, but it's **missing several critical BRD sections** that stakeholders expect. The good news: your content is more comprehensive in many ways. The challenge: the structure and format differ substantially.

**Key Finding:** The generated markdown BRD is missing formal functional requirements (FR-XXX codes), assumptions, dependencies/ownership, and non-functional expectations that are present in the PDF BRD v1.5.

---

## Detailed Structural Comparison

| Section | PDF BRD v1.5 (Roni) | Generated Markdown BRD | Gap Status |
|---------|---------------------|------------------------|------------|
| **1. Document Overview** | ✅ Purpose, Objectives, Intended Audience, Document Scope, Phase 1 vs Future | ✅ Brief Purpose & Scope (project-config driven) | ⚠️ **Missing**: Detailed objectives, intended audience, document scope details |
| **2. Actors** | ✅ Actor Summary + Core Responsibilities (concise, BRD-style) | ✅ Detailed actor descriptions with responsibilities | ✅ **Better** in markdown - more detailed |
| **3. High-Level Business Processes** | ✅ 8 numbered journeys (4.1-4.8): LSP HBL Management, LSP Pickup Booking, LSP Modify Booking, etc. | ✅ Grouped by actor with detailed steps | ⚠️ **Different format** - markdown is more implementation-focused |
| **4. Functional Requirements** | ✅ **FR-LSP-01 through FR-LSP-24** <br> ✅ **FR-ADM-01 through FR-ADM-15** | ❌ **MISSING** - No FR codes or formal requirement IDs | 🚨 **CRITICAL GAP** |
| **5. Data Model (Conceptual)** | ✅ Core Entities (6.1) <br> ✅ Integration Data from Maximas (6.2) | ✅ Much more detailed entities with lifecycle states and transitions | ✅ **Better** in markdown - implementation-ready |
| **6. Assumptions** | ✅ Detailed assumptions section (7.1) with User Roles, Onboarding, Booking Eligibility, Shipment Visibility, Fees, Slot Booking, Driver/Truck Management, etc. | ❌ **MISSING** - Some embedded in business rules | 🚨 **CRITICAL GAP** |
| **7. Constraints** | ✅ Phase 1 constraints (7.2) | ✅ Constraints by type (access, admin, platform, notification) | ✅ Similar coverage |
| **8. Dependencies & Ownership** | ✅ Identity/SSO, Maximas Data Feed, Payment Gateway, Charging Config, Communication Content, Slot/Site Config, DO Validation Rules (7.3) | ❌ **MISSING** - Only integration entities, no ownership | 🚨 **CRITICAL GAP** |
| **9. High-Level Non-Functional Expectations** | ✅ Performance, Availability, Audit/Logging, Security expectations | ❌ **COMPLETELY MISSING** | 🚨 **CRITICAL GAP** |
| **10. Business Rules** | ❌ Implicit in journey descriptions | ✅ **BR-001 through BR-033** - Explicit, numbered, traceable | ✅ **Much better** in markdown |
| **11. Open Questions & Decisions** | ❌ Not in BRD format | ✅ Decision log with status tracking | ✅ **Better** in markdown - includes recent updates |

---

## Critical Gaps in Generated Markdown Documentation

### 1. Missing: Formal Functional Requirements (FR-XXX)

**Impact:** High - QA, Dev, and PM teams need traceable requirements

The PDF BRD has **39 formal functional requirements** with IDs:
- **FR-LSP-01** through **FR-LSP-24** (LSP requirements)
- **FR-ADM-01** through **FR-ADM-15** (ACFS Admin requirements)

Your markdown has these requirements **embedded** in actor responsibilities and journeys, but they're **not separately listed with IDs**. This makes it hard for:
- QA to write test cases
- Devs to track which FR they're implementing
- PMs to do requirements traceability

**Example from PDF BRD:**
```
FR-LSP-08: For the booking flow, system shall validate that each selected HBL meets readiness criteria:
  • Shipment milestone is Unpacked.
  • Shipment is fully customs cleared.
  • All required DOs are uploaded and validated or marked as free release.
```

**In generated markdown:** This is described in journey steps but not numbered as FR-LSP-08.

#### Sample of Missing FR Requirements

**LSP Functional Requirements (FR-LSP-XX):**
- FR-LSP-01: Authenticate LSP access using company-level login
- FR-LSP-02: Display list of all HBLs assigned to the logged-in LSP
- FR-LSP-03: Allow LSP to select one or multiple HBLs and choose action (Delegate or Book)
- FR-LSP-04: Allow LSP to search for target LSP by company name or email address
- FR-LSP-05: Allow LSP to send delegation to unregistered email (creates secure link + OTP flow)
- FR-LSP-06: Allow LSP to upload one or more DO documents against each HBL
- FR-LSP-07: Send delegation notification emails to target LSP with portal link
- FR-LSP-08: Validate booking readiness (unpacked + customs cleared + DOs present)
- FR-LSP-09: Allow LSP to upload missing DOs within booking flow
- FR-LSP-10: Calculate total weight and volume across selected HBLs
- FR-LSP-11: Calculate per-HBL fees using chargeable weight × rate
- FR-LSP-12: Calculate total booking fee (sum of HBL fees + minimum charge)
- FR-LSP-13: Display per-HBL fee and total booking fee before payment
- FR-LSP-14: Display available slots with visual busyness indication (heat map)
- FR-LSP-15: Allow LSP to select exactly one slot for each booking
- FR-LSP-16: Allow LSP to enter driver details (name, license, site induction flag) and truck details
- FR-LSP-17: Require explicit acceptance of booking T&Cs and driver site induction T&Cs
- FR-LSP-18: Integrate with payment gateway and only confirm bookings after successful payment
- FR-LSP-19: Generate unique booking reference and send confirmation email
- FR-LSP-20: Allow LSPs to search for and view existing bookings
- FR-LSP-21: Before change cut-off, allow LSPs to modify driver/truck/slot/HBLs
- FR-LSP-22: After change cut-off, allow LSPs to modify only driver and truck details
- FR-LSP-23: After collection, prevent further modifications by LSP
- FR-LSP-24: Allow LSPs to request booking cancellations (refunds handled outside VBS)

**ACFS Admin Functional Requirements (FR-ADM-XX):**
- FR-ADM-01: Support storage of site data and slot definitions
- FR-ADM-02: Manage slot and site definitions via backend/database (no UI in Phase 1)
- FR-ADM-03: Allow ACFS Admin to manage bookings on behalf of LSPs (fee-free updates in Phase 1)
- FR-ADM-04: Provide DO validation capability for ACFS Admin and authorized ACFS Users
- FR-ADM-05: Maintain HBL-level "DOs Fully Validated" flag
- FR-ADM-06: Notify booking party when DO is marked Invalid
- FR-ADM-07: Allow ACFS Admin to perform pickup verification by searching bookings
- FR-ADM-08: Allow ACFS Admin to mark booking as "Processed" once conditions are met
- FR-ADM-09: Update HBL status to "Collected" based on Maximas milestones
- FR-ADM-10: Update booking status to "Complete" when all HBLs are collected
- FR-ADM-11: Maintain and display HBL lifecycle states (Unassigned, Assigned, Delegated, Booked, Collected)
- FR-ADM-12: Provide fail-safe manual assignment of Unassigned HBLs to LSP
- FR-ADM-13: Allow ACFS Admin to create LSP accounts, ACFS Admin accounts, and ACFS User accounts
- FR-ADM-14: Generate and send welcome/activation links for new LSP accounts (expire after 72 hours)
- FR-ADM-15: Integrate with ACFS SSO for internal ACFS Admin and ACFS User authentication

---

### 2. Missing: Assumptions Section

**Impact:** Medium - Provides context for design decisions

PDF BRD Section 7.1 lists critical assumptions like:

#### User Roles and Access
- A single, generic LSP role is used to represent wholesale freight forwarders, freight forwarders, and transport carriers
- LSP access is at company account level, not individual named users
- One login per company; internal access is managed within each company
- Supported user types: LSP, ACFS Admin, ACFS User
- One ACFS Admin "Super User" at launch with authority to create subsequent users

#### Onboarding and Authentication
- No self-registration for Day 1. LSP and ACFS user accounts are created by ACFS Admin
- Welcome/activation links for LSP accounts expire after 72 hours; reactivation requires ACFS support
- ACFS internal users authenticate via existing ACFS SSO identity platform

#### Booking Eligibility and Readiness
- A booking can only be submitted when, for all included HBLs:
  - The shipment milestone is Unpacked
  - The shipment is fully customs cleared
  - All required DOs are uploaded and validated or marked as free release
- Missing or invalid DOs are resolved by upload or re-upload; a new booking is not required solely due to DO issues

#### Shipment and HBL Visibility
- HBL-to-primary-hop mapping and detailed customs status are available in Maximas as ready-to-consume fields
- Only the "next-hop" party name for an HBL is displayed at a time

#### One-off Bookings
- One-off bookings, where only an email address is required and no account is created, are recognized but will not be implemented in Phase 1 and will be considered for a fast follow

#### Fees and Charges
- Storage fee payment and calculation are outside the scope of VBS
- A storage fee indicator flag will be available based on LFD; it indicates potential outstanding fees but does not drive calculation
- A minimum charge applies per booking, not per HBL
- A chargeable weight field is used to calculate individual HBL fees
- Total booking fees equal the sum of all HBL fees plus the minimum booking charge
- Total load is calculated using the total weight and volume across all HBLs

#### Slot Booking and Configuration
- Each booking supports a single slot selection
- No Day 1 restrictions are enforced on load or truck type
- Site data will be uploaded once directly into the backend; no site configuration module is required for Phase 1
- Heatmap indicators are informational only and do not prevent bookings

#### Driver and Truck Management
- Driver details are captured and can be reused under the same LSP company account
- Driver data is not shared across LSPs
- Drivers do not receive system-generated emails; booking references and instructions are provided offline by the LSP
- Previously entered driver and truck data will not be maintained for Phase 1. This will be introduced in the fast follow/next phase

#### Booking Modifications and Cancellations
- Before the change cut-off, LSPs may update driver details, truck details, and slot selection (subject to new slot availability)
- After the change cut-off and before all HBLs in the booking are collected, LSPs may only update driver and truck details
- Slot selection and any fee-impacting attributes are locked
- Fee-impacting changes are not supported via the LSP interface in Phase 1 and require ACFS Admin intervention
- ACFS Admin can make such changes on the LSP's behalf in the backend
- Booking cancellations by LSPs are permitted, and upon cancellation, HBLs in that booking shall become available for rebooking; financial refunds or adjustments will be handled outside VBS

#### Delivery Order Validation
- DO validation is a manual administrative process performed by ACFS
- Invalid DOs must be corrected and re-uploaded before processing continues
- Validation criteria and decisions are governed by ACFS Operations and Compliance
- Once all HBLs in a booking are reviewed and conditions are met, bookings are marked processed, and shipment statuses update from Maximas on the next sync cycle

**Your markdown:** Partially covered in business rules and constraints, but not as a separate, comprehensive assumptions section.

---

### 3. Missing: Dependencies and Ownership

**Impact:** High - Critical for project planning and stakeholder alignment

PDF BRD Section 7.3 explicitly lists:

#### Identity and SSO
- **Dependency:** Integration with ACFS SSO platform for internal user authentication
- **Owner:** ACFS IT / Security

#### Maximas Data Feed
- **Dependency:** Reliable provision of HBL data, milestones (e.g. Unpacked, Collected), customs status, and any required storage-related indicators to VBS
- **Owner:** ACFS IT / Maximas Product Owner

#### Payment Gateway
- **Dependency:** Selection, configuration, and commercial enablement of Stripe or an alternative gateway (e.g. Compay). Final selection to be confirmed by ACFS
- **Owner:** ACFS Finance / IT

#### Charging Configuration
- **Dependency:** Definition and maintenance of pricing parameters (minimum booking charge, rates, and chargeable weight rules)
- **Owner:** ACFS Finance / Product

#### Communication Content
- **Dependency:** Provision of email templates and message copy for:
  - Delegation notifications
  - Booking confirmations
  - DO invalid notifications
  - User activation/onboarding
- **Owner:** ACFS Operations / Legal / Marketing (as applicable)

#### Slot and Site Configuration
- **Dependency:** Initial and ongoing slot and site configuration in backend
- **Owner:** ACFS IT / Operations

#### DO Validation Rules
- **Dependency:** Business rules and criteria for what constitutes a valid DO and how non-compliance is treated
- **Owner:** ACFS Operations / Compliance

**Your markdown:** Integration entities exist but **no ownership or dependency tracking**.

---

### 4. Missing: High-Level Non-Functional Expectations

**Impact:** Medium - Sets performance, security, and operational expectations

PDF BRD Section 8 (last page of document) includes:

#### Performance
- The system should provide responsive HBL list and search operations suitable for day-to-day operational use
- Slot availability views and booking submission should complete within acceptable operational timeframes

#### Availability
- The system should be available during ACFS-defined business operating hours for LSP and ACFS users, with specific targets defined in technical and support SLAs

#### Audit and Logging
- Key actions must be auditable, including:
  - Delegation of HBLs
  - Creation and modification of bookings
  - DO validation decisions
  - User creation and role changes
- Audit logs should capture actor, timestamp, and key data changes to support compliance and operational investigations

#### Security
- Access control must enforce role-based permissions for LSP, ACFS Admin, and ACFS User roles
- Data exchange with Maximas and the payment gateway must follow ACFS security guidelines and integration standards

**Your markdown:** **Completely missing** - no NFR section at all.

---

## What Your Generated Markdown Does Better

### 1. Business Rules are Explicit and Traceable
- **BR-001 through BR-033** are numbered, traceable, with sources and rationale
- Each business rule includes "applies_to" and "source" attribution
- Rules include implementation context (e.g., BR-027 explains milestone vs hbl_status orthogonality)

### 2. Entity Lifecycle Management
- Detailed state machines for all major entities:
  - HBL: on_vessel → at_wharf → in_yard → unpacked → collected
  - Booking: draft → booked → pending_processing → processed → collected → cancelled
  - DO: not_provided → uploaded → pending_validation → validated → flagged
  - Delegation: active → revoked
- Clear transition triggers and guards
- Warnings for derived states (e.g., booking "collected" is auto-derived)

### 3. More Recent Updates
- Includes decisions from 2026-03-24 delivery meeting:
  - **BR-027:** Milestone vs hbl_status orthogonality clarified
  - **BR-031:** Pickup site visibility requirement
  - **BR-032:** Dual-identifier requirement (HBL + booking reference)
  - **BR-033:** Column customization for HBL table views
- AGS integration gap flagged in **OQ-034** (critical blocker)

### 4. Implementation-Ready Details
- Specific data field names and types
- Clear many-to-many relationships (booking_hbl_link junction table)
- Integration entities with direction, frequency, and data provided/not provided
- Computed vs stored fields clearly marked (e.g., chargeable_weight, do_waived)

### 5. Decision Tracking and Open Questions
- Open questions with:
  - Status (open/resolved/deferred)
  - Reason for the question
  - Impact and blocking information
  - Action needed
- Example: **OQ-034** flags AGS feed as critical blocker with specific context

---

## Gap Analysis Summary

| Category | PDF BRD v1.5 Strength | Generated Markdown Strength | Recommendation |
|----------|----------------------|----------------------------|----------------|
| **Formal Requirements** | 39 traceable FR codes | Requirements embedded in journeys | Add FR extraction to generator |
| **Assumptions** | Comprehensive section | Scattered across rules/constraints | Add assumptions section to model |
| **Dependencies** | Clear ownership matrix | Integration specs only | Add dependency tracking |
| **NFRs** | High-level expectations defined | Missing entirely | Add NFR section to generator |
| **Business Rules** | Implicit in descriptions | Explicit, numbered, traceable | ✅ Keep this approach |
| **Lifecycle States** | High-level only | Detailed state machines | ✅ Keep this approach |
| **Recent Decisions** | Fixed at v1.5 | Includes 2026-03-24 updates | ✅ Living document advantage |
| **Implementation Detail** | Conceptual | Code-ready | ✅ Better for dev teams |

---

## Recommendations

### Option 1: Enhance Generator to Match BRD Format
**Goal:** Single source of truth - generated BRD replaces PDF

**Tasks:**
1. Extract all FR-XXX requirements from PDF BRD
2. Add `functional_requirements` array to intent model
3. Update `brd-generator.ts` to render FR section
4. Add `assumptions` array to model
5. Add `dependencies` array with ownership tracking
6. Add `nfrs` section to generator
7. Regenerate BRD and compare

**Pros:**
- One canonical document
- Always in sync with intent model
- Easier to maintain

**Cons:**
- Significant upfront work
- May need stakeholder buy-in for format change

---

### Option 2: Keep Both Documents (Recommended Short-Term)
**Goal:** Complementary documents for different audiences

**Split:**
- **PDF BRD v1.5 (Roni)** = Stakeholder-facing requirements document
  - Business objectives, formal FR codes, assumptions
  - Dependencies, ownership, NFRs
  - What the system must do (requirements)

- **Generated Markdown BRD** = Implementation-focused technical spec
  - Detailed business rules with traceability
  - Entity lifecycle management
  - Integration specifications
  - How the system will be built (design)

**Pros:**
- Immediate solution - no backfill needed
- Each document serves its audience well
- Generated BRD stays implementation-focused

**Cons:**
- Maintenance burden of two documents
- Risk of drift between them

---

### Option 3: Reconcile and Merge
**Goal:** Backfill missing sections into intent model, generate unified BRD

**Tasks:**
1. Extract FR requirements from PDF
2. Add to intent model as new section
3. Extract assumptions from PDF
4. Add to model with structure
5. Extract dependencies/ownership
6. Add to model
7. Extract NFRs
8. Add to model
9. Update generator to produce complete BRD
10. Validate with Roni/stakeholders

**Pros:**
- Best long-term solution
- Intent model becomes complete requirements source
- Generated BRD fully replaces PDF

**Cons:**
- Most time-intensive
- Requires model schema changes
- Need stakeholder alignment

---

## Next Steps

### Immediate Actions
1. **Flag to Roni** that generated markdown BRD is missing:
   - Formal FR codes (39 requirements)
   - Assumptions section (7.1)
   - Dependencies and ownership (7.3)
   - Non-functional expectations (Section 8)

2. **Decide on approach**: Single source of truth vs complementary documents?

3. **If complementary**: Document the split (what lives where)

4. **If single source**: Prioritize backfilling FR codes first (highest QA/dev impact)

### Short-Term (This Sprint)
- Extract FR-LSP and FR-ADM requirements from PDF
- Map to current implementation
- Identify any unmapped requirements (implementation gaps)
- Add FR tracking to issue/task management

### Long-Term (Next Phase)
- Enhance intent model schema to support:
  - Functional requirements as first-class entities
  - Assumptions tracking
  - Dependency/ownership matrix
  - NFR specifications
- Update `brd-generator.ts` to produce BRD-compliant output
- Deprecate PDF BRD in favor of generated version

---

## Appendix: Document Metadata

### PDF BRD v1.5 (Roni's Version)
- **File:** `docs/project/VBS_Pickup_BRD(Final)_V1.5.pdf`
- **Title:** ACFS – VBS Pickup Portal Phase 1
- **Version:** V1.5
- **Author:** RONI JOSEPH PUTHENVEETIL
- **Date:** 2026
- **Pages:** 21 pages
- **Format:** Traditional BRD with formal FR codes

### Generated Markdown BRD
- **Source:** Intent Model v0.8.0 (`src/domain/intent-model/model.ts`)
- **Generator:** `src/lib/brd-generator.ts`
- **Last Updated:** 2026-03-24 (model), 2026-03-27 (generated)
- **URL:** `http://localhost:4444/api/brd`
- **Format:** Implementation-focused technical spec with state machines

### Key Differences in Scope
- **PDF BRD:** 39 functional requirements, stakeholder assumptions, dependencies
- **Markdown BRD:** 33 business rules, 14 entities with lifecycles, 12 journeys, 1 open question
- **Overlap:** Actors, constraints, high-level journeys, data model
- **PDF Only:** FR codes, assumptions, dependencies/ownership, NFRs
- **Markdown Only:** Explicit business rules, entity state machines, recent meeting decisions
