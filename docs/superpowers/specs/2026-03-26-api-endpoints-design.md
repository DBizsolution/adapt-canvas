---
name: API Endpoints Documentation Page
description: Documentation page for 52 VBS Portal API endpoints with consolidation analysis
type: design
---

# API Endpoints Documentation Page Design

## Overview

Create a documentation page at `/review/api-endpoints` that lists all 52 API endpoints for the VBS Pickup Portal, organized by domain, with detailed specs and a consolidation analysis section to help the team evaluate whether the API surface can be reduced.

## Context

The team expressed concern that 52 endpoints is high. This page serves two purposes:
1. **Reference documentation** — comprehensive API specs for developers
2. **Architecture review** — analysis of consolidation opportunities to reduce API count

## Goals

- Document all 52 endpoints with clear specs (method, route, params, auth, permissions)
- Use non-sequential reference IDs (e.g., `API-H047`) for easy discussion
- Note that all resource IDs in responses use UUIDs (not sequential integers)
- Provide consolidation analysis showing which endpoints could be merged
- Match the existing review page aesthetic (warm minimal, Linear-inspired)

## Page Structure

### Route
`/review/api-endpoints`

### Layout
Uses the existing `layout-shell` component with nav. Follows the same spacing, typography, and color scheme as other review pages.

### Sections

```
┌─────────────────────────────────────────────┐
│ Header                                      │
│ • Title: "API Endpoints"                    │
│ • Subtitle: "Portal API Reference & Analysis"│
│ • Stats badge: "52 endpoints across 11..."  │
│ • Search/filter bar                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Quick Summary Stats                         │
│ [Card: 52 total | 11 domains | ...]        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Endpoint Catalog (by domain)                │
│                                             │
│ ▼ HBLs/Shipments (6)                       │
│   [endpoint cards...]                       │
│                                             │
│ ▼ Bookings (7)                             │
│   [endpoint cards...]                       │
│                                             │
│ ▼ Slots (6)                                │
│ ▼ Delivery Orders (6)                      │
│ ▼ Delegations (4)                          │
│ ▼ Parties/LSPs (2)                         │
│ ▼ Drivers (4)                              │
│ ▼ Users (5)                                │
│ ▼ Sites (1)                                │
│ ▼ Auth (3)                                 │
│ ▼ Payments (3)                             │
│ ▼ P4TC (2) - deferred                      │
│ ▼ Stats/Dashboard (3)                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Consolidation Analysis                      │
│                                             │
│ Summary: Potential reduction from 52 → ~35  │
│                                             │
│ By domain:                                  │
│ • HBLs/Shipments: 6 → 4 (merge search)     │
│ • Bookings: 7 → 5 (merge search/calc)      │
│ • ...                                       │
│                                             │
│ Detailed recommendations with trade-offs    │
└─────────────────────────────────────────────┘
```

## Endpoint Card Design

Each endpoint is displayed as a card with the following structure:

```
┌─────────────────────────────────────────────┐
│ [GET] /api/hbls/:id              API-H294   │ ← method badge, route, ref ID
│                                             │
│ Get single HBL details                      │ ← description
│                                             │
│ Parameters:                                 │
│ • id (path): HBL UUID - unique identifier   │ ← UUID notation
│                                             │
│ Auth: Bearer token (LSP, ACFS, P4TC)        │
│                                             │
│ Response: HBL object with nested data       │
└─────────────────────────────────────────────┘
```

### Visual treatment
- **HTTP method badge**: color-coded pill
  - GET: green (#10b981)
  - POST: blue (#3b82f6)
  - PATCH: amber (#f59e0b)
  - DELETE: red (#ef4444)
- **Reference ID**: top-right corner, muted text, format `API-X###` (X = domain letter, ### = 3-digit random number)
- **Background**: warm off-white (#F8F8F7) with subtle border
- **Typography**: DM Sans, weights 400/500/600

### Non-sequential reference IDs

Format: `API-{domain-letter}{3-digit-random}`

Domain letters:
- H = HBLs/Shipments
- B = Bookings
- S = Slots
- D = Delivery Orders
- G = Delegations
- P = Parties/LSPs
- R = Drivers
- U = Users
- I = Sites
- A = Auth
- Y = Payments
- T = P4TC
- X = Stats/Dashboard

Examples: `API-H294`, `API-B731`, `API-S047`

**Why random 3-digit?** Prevents the appearance of a sequence (not 001, 002, 003). Makes it clear these are stable reference identifiers for discussion, not implementation order.

### UUID notation

Every endpoint that uses resource IDs in the path or response includes a note:

> **:id parameter uses UUID** — e.g., `550e8400-e29b-41d4-a716-446655440000`

This applies to:
- Path parameters (`:id`, `:hblId`, `:bookingId`, etc.)
- Response fields (`id`, `hbl_id`, `booking_id`, etc.)

## Data Model

The page sources its data from a static TypeScript object (no API call needed). Structure:

```typescript
type ApiEndpoint = {
  id: string                    // API-H294
  domain: string                // 'HBLs/Shipments'
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string                  // '/api/hbls/:id'
  description: string           // 'Get single HBL details'
  parameters: {
    name: string                // 'id'
    location: 'path' | 'query' | 'body'
    type: string                // 'UUID' | 'string' | 'number' | ...
    description: string         // 'HBL unique identifier'
    required: boolean
  }[]
  auth: string[]                // ['LSP', 'ACFS', 'P4TC']
  response: string              // 'HBL object with nested data'
  usesUuid: boolean             // true if :id or similar in path
}

type ConsolidationOpportunity = {
  domain: string
  current: number               // 6 endpoints
  proposed: number              // 4 endpoints
  savings: number               // 2
  recommendations: {
    action: string              // 'Merge search endpoints'
    endpoints: string[]         // ['API-H047', 'API-H291']
    rationale: string           // 'Both do keyword search...'
    newEndpoint: string         // 'GET /api/hbls with ?q= param'
    tradeoff: string            // 'Slightly more complex query params'
  }[]
}
```

## Consolidation Analysis Section

This section appears after all endpoint cards. Structure:

### Summary card
```
┌─────────────────────────────────────────────┐
│ Consolidation Potential                     │
│                                             │
│ Current: 52 endpoints                       │
│ Proposed: ~35 endpoints                     │
│ Reduction: 17 endpoints (33%)               │
│                                             │
│ Strategy: Merge similar operations, use     │
│ query params for filtering/search           │
└─────────────────────────────────────────────┘
```

### By-domain breakdown

For each domain, show:
1. Current count → Proposed count
2. List of consolidation opportunities
3. Rationale and trade-offs

Example:

```markdown
### HBLs/Shipments: 6 → 4 endpoints (-2)

**Opportunity 1: Merge search endpoints**
- Current: `API-H047` (search) + `API-H291` (list with filter)
- Proposed: Single `GET /api/hbls` with flexible query params
- Rationale: Both perform filtering/searching. Combine into one endpoint with query params: `?q=`, `?status=`, `?site=`, `?milestone=`, `?lsp=`
- Trade-off: Query param parsing slightly more complex, but standard REST pattern
- **Recommendation: Merge**

**Opportunity 2: Flag under-bond**
- Current: `API-H582` (dedicated POST endpoint)
- Proposed: Use `PATCH /api/hbls/:id` with `{ under_bond: true }`
- Rationale: Flagging is a property update, not a separate action
- Trade-off: None — simpler and more RESTful
- **Recommendation: Merge**
```

### Consolidation principles

Document the guiding principles for API design:

1. **Use query params for filtering** — `GET /api/resource?filter=value` instead of dedicated filter endpoints
2. **Use PATCH for property updates** — don't create dedicated POST endpoints for boolean flags
3. **Combine list + search** — single endpoint with optional `?q=` param
4. **Nested resources for tight coupling** — e.g., `/api/bookings/:id/hbls` instead of separate endpoint
5. **Avoid action-specific endpoints** — use HTTP verbs + resource updates instead of `/api/resource/:id/do-thing`

## Interactive Features

### Search/filter bar
- Filter by domain (checkboxes)
- Filter by method (GET/POST/PATCH/DELETE)
- Filter by actor permission (LSP/ACFS/P4TC)
- Text search across endpoint descriptions

### Collapsible sections
- Each domain section can collapse/expand
- Default: all expanded
- State persists in localStorage

### Copy reference ID
- Click reference ID (e.g., `API-H294`) to copy to clipboard
- Brief toast confirmation

## Implementation Notes

### File structure

```
src/
  app/
    review/
      api-endpoints/
        page.tsx                      # main page component
        endpoint-card.tsx             # individual endpoint card
        consolidation-analysis.tsx    # analysis section
  lib/
    api-endpoints-data.ts            # source data (52 endpoints)
    api-consolidation-data.ts        # consolidation opportunities
```

### Key decisions

1. **Static data, no API** — all endpoint specs are hardcoded TypeScript objects. This is documentation, not dynamic data.

2. **Non-sequential ID generation** — use a seeded random number generator to create stable IDs (same run = same IDs). Avoids sequential appearance while remaining deterministic.

3. **UUID format** — document that UUIDs follow v4 format (random). Don't prescribe ULID/nanoid unless there's a specific requirement.

4. **Responsive design** — endpoint cards stack on mobile, 2-col on tablet, 3-col on desktop.

5. **Print-friendly** — consolidation analysis should print well (team may want to discuss offline).

## Open Questions

None — design is complete and approved.

## Success Metrics

- Team can reference specific endpoints by ID during discussions
- Clear visibility into consolidation opportunities
- Decision made: keep 52, consolidate to ~35, or something in between
