import { generateApiId } from './seeded-random'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type ParameterLocation = 'path' | 'query' | 'body'

export interface ApiParameter {
  name: string
  location: ParameterLocation
  type: string // 'UUID' | 'string' | 'number' | 'boolean' | 'enum' | 'array' | 'object'
  description: string
  required: boolean
  example?: string
}

export interface ApiEndpoint {
  id: string // API-H729
  domain: string // 'HBLs/Shipments'
  domainLetter: string // 'H'
  method: HttpMethod
  path: string // '/api/hbls'
  description: string
  parameters: ApiParameter[]
  auth: string[] // ['LSP', 'ACFS', 'P4TC']
  response: string
  usesUuid: boolean // true if path contains :id or similar
  tables?: string[] // schema tables used
  phaseDeferred?: boolean // true for P4TC endpoints
}

export interface DomainGroup {
  domain: string
  domainLetter: string
  count: number
  endpoints: ApiEndpoint[]
}

// Export generateApiId for use when seeding endpoint data
export { generateApiId }

// ============================================================================
// Domain: HBLs/Shipments (H)
// ============================================================================

const hblEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'HBLs/Shipments',
    domainLetter: 'H',
    method: 'GET',
    path: '/api/hbls',
    description: 'List HBLs with filtering (status, site, milestone, company)',
    parameters: [
      { name: 'status', location: 'query', type: 'enum', description: 'Filter by hbl_status (assigned, delegated, booked)', required: false },
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by pickup site', required: false },
      { name: 'milestone', location: 'query', type: 'enum', description: 'Filter by milestone (on_vessel, at_wharf, in_yard, unpacked, collected)', required: false },
      { name: 'company_id', location: 'query', type: 'UUID', description: 'Filter by assigned company (LSP auto-scoped)', required: false },
      { name: 'q', location: 'query', type: 'string', description: 'Search by HBL number, container number, or booking reference', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number for pagination', required: false, example: '1' },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false, example: '50' },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of HBL objects with nested container, company, site data',
    usesUuid: false,
    tables: ['hbls', 'containers', 'companies', 'sites'],
  },
  {
    domain: 'HBLs/Shipments',
    domainLetter: 'H',
    method: 'GET',
    path: '/api/hbls/:id',
    description: 'Get single HBL details with full relationships',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'HBL unique identifier', required: true, example: '550e8400-e29b-41d4-a716-446655440000' },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'HBL object with nested container, company, site, delivery orders',
    usesUuid: true,
    tables: ['hbls', 'containers', 'companies', 'sites', 'delivery_orders'],
  },
  {
    domain: 'HBLs/Shipments',
    domainLetter: 'H',
    method: 'PATCH',
    path: '/api/hbls/:id',
    description: 'Update HBL details (ACFS only: edit milestones, status, weight)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'HBL unique identifier', required: true },
      { name: 'milestone', location: 'body', type: 'enum', description: 'Update milestone status', required: false },
      { name: 'hbl_status', location: 'body', type: 'enum', description: 'Update business status', required: false },
      { name: 'customs_status', location: 'body', type: 'enum', description: 'Update customs clearance status', required: false },
      { name: 'under_bond', location: 'body', type: 'boolean', description: 'Flag as under-bond', required: false },
      { name: 'weight_kg', location: 'body', type: 'number', description: 'Update weight', required: false },
      { name: 'volume_m3', location: 'body', type: 'number', description: 'Update volume', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated HBL object',
    usesUuid: true,
    tables: ['hbls'],
  },
  {
    domain: 'HBLs/Shipments',
    domainLetter: 'H',
    method: 'GET',
    path: '/api/hbls/:id/audit-trail',
    description: 'Full custody chain history for HBL (all delegation hops)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'HBL unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of custody chain entries with company details and timestamps',
    usesUuid: true,
    tables: ['hbl_custody_chain', 'companies', 'delegations'],
  },
]

// Generate stable IDs for all HBL endpoints
export const hblEndpointsWithIds: ApiEndpoint[] = hblEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Bookings (B)
// ============================================================================

const bookingEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Bookings',
    domainLetter: 'B',
    method: 'GET',
    path: '/api/bookings',
    description: 'List bookings with filtering (status, site, date range, company)',
    parameters: [
      { name: 'status', location: 'query', type: 'enum', description: 'Filter by booking_status (draft, booked, pending_processing, processed, collected, cancelled)', required: false },
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site via slot relationship', required: false },
      { name: 'date_from', location: 'query', type: 'string', description: 'Filter by slot_date from (YYYY-MM-DD)', required: false, example: '2026-04-01' },
      { name: 'date_to', location: 'query', type: 'string', description: 'Filter by slot_date to (YYYY-MM-DD)', required: false, example: '2026-04-30' },
      { name: 'company_id', location: 'query', type: 'UUID', description: 'Filter by booked_by_company_id', required: false },
      { name: 'q', location: 'query', type: 'string', description: 'Search by booking reference, truck rego, driver name, or HBL number', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of booking objects with nested slot, site, company, HBLs',
    usesUuid: false,
    tables: ['bookings', 'slots', 'sites', 'companies', 'booking_hbls'],
  },
  {
    domain: 'Bookings',
    domainLetter: 'B',
    method: 'GET',
    path: '/api/bookings/:id',
    description: 'Get booking details with HBLs, payments, driver info',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Booking unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Booking object with nested HBLs, payments, slot, site, driver details',
    usesUuid: true,
    tables: ['bookings', 'booking_hbls', 'hbls', 'payments', 'slots'],
  },
  {
    domain: 'Bookings',
    domainLetter: 'B',
    method: 'POST',
    path: '/api/bookings',
    description: 'Create new booking with payment',
    parameters: [
      { name: 'slot_id', location: 'body', type: 'UUID', description: 'Selected slot', required: true },
      { name: 'slot_date', location: 'body', type: 'string', description: 'Pickup date (YYYY-MM-DD)', required: true },
      { name: 'hbl_ids', location: 'body', type: 'array', description: 'Array of HBL UUIDs to book', required: true },
      { name: 'driver_name', location: 'body', type: 'string', description: 'Driver full name', required: true },
      { name: 'driver_licence_number', location: 'body', type: 'string', description: 'Driver license number', required: true },
      { name: 'truck_rego', location: 'body', type: 'string', description: 'Vehicle registration', required: true },
      { name: 'terms_accepted_at', location: 'body', type: 'string', description: 'ISO timestamp of T&C acceptance', required: true },
      { name: 'site_induction_completed', location: 'body', type: 'boolean', description: 'Driver completed site induction', required: true },
    ],
    auth: ['LSP'],
    response: 'Created booking object with booking_reference and payment intent',
    usesUuid: true,
    tables: ['bookings', 'booking_hbls', 'payments', 'pricing_zones'],
  },
  {
    domain: 'Bookings',
    domainLetter: 'B',
    method: 'POST',
    path: '/api/bookings/calculate-fees',
    description: 'Calculate booking fees before committing (preview mode)',
    parameters: [
      { name: 'hbl_ids', location: 'body', type: 'array', description: 'Array of HBL UUIDs to calculate fees for', required: true },
      { name: 'site_id', location: 'body', type: 'UUID', description: 'Pickup site (determines pricing zone)', required: true },
    ],
    auth: ['LSP'],
    response: 'Fee breakdown: per-HBL fees, total_excl_gst, gst_amount, total_incl_gst',
    usesUuid: false,
    tables: ['hbls', 'pricing_zones'],
  },
  {
    domain: 'Bookings',
    domainLetter: 'B',
    method: 'PATCH',
    path: '/api/bookings/:id',
    description: 'Modify booking: change slot, driver, truck, or HBLs (subject to cutoffs)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Booking unique identifier', required: true },
      { name: 'slot_id', location: 'body', type: 'UUID', description: 'New slot (checks cutoff)', required: false },
      { name: 'slot_date', location: 'body', type: 'string', description: 'New pickup date', required: false },
      { name: 'driver_name', location: 'body', type: 'string', description: 'Update driver', required: false },
      { name: 'driver_licence_number', location: 'body', type: 'string', description: 'Update license number', required: false },
      { name: 'truck_rego', location: 'body', type: 'string', description: 'Update truck rego', required: false },
      { name: 'add_hbl_ids', location: 'body', type: 'array', description: 'HBLs to add (recalculates fees, checks cutoff)', required: false },
      { name: 'remove_hbl_ids', location: 'body', type: 'array', description: 'HBLs to remove (recalculates fees, checks cutoff)', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Updated booking with recalculated fees if HBLs changed',
    usesUuid: true,
    tables: ['bookings', 'booking_hbls', 'slots'],
  },
  {
    domain: 'Bookings',
    domainLetter: 'B',
    method: 'POST',
    path: '/api/bookings/:id/cancel',
    description: 'Cancel booking (sets status to cancelled)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Booking unique identifier', required: true },
      { name: 'cancellation_reason', location: 'body', type: 'string', description: 'Reason for cancellation (required for ACFS)', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Cancelled booking object',
    usesUuid: true,
    tables: ['bookings'],
  },
]

export const bookingEndpointsWithIds: ApiEndpoint[] = bookingEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Slots (S)
// ============================================================================

const slotEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Slots',
    domainLetter: 'S',
    method: 'GET',
    path: '/api/slots',
    description: 'List slots with filtering (site, date, day_of_week, is_active, is_blocked)',
    parameters: [
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site', required: false },
      { name: 'date_from', location: 'query', type: 'string', description: 'Filter from date (YYYY-MM-DD)', required: false },
      { name: 'date_to', location: 'query', type: 'string', description: 'Filter to date (YYYY-MM-DD)', required: false },
      { name: 'day_of_week', location: 'query', type: 'enum', description: 'Filter by day (MON, TUE, WED, THU, FRI, SAT, SUN)', required: false },
      { name: 'is_active', location: 'query', type: 'boolean', description: 'Filter by active status', required: false },
      { name: 'is_blocked', location: 'query', type: 'boolean', description: 'Filter by blocked status', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of slot objects with site and booking counts',
    usesUuid: false,
    tables: ['slots', 'sites'],
  },
  {
    domain: 'Slots',
    domainLetter: 'S',
    method: 'GET',
    path: '/api/slots/available',
    description: 'Get available slots for booking (excludes blocked, shows density)',
    parameters: [
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site', required: true },
      { name: 'date_from', location: 'query', type: 'string', description: 'From date (YYYY-MM-DD)', required: false },
      { name: 'date_to', location: 'query', type: 'string', description: 'To date (YYYY-MM-DD)', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of available slots with capacity and density info',
    usesUuid: false,
    tables: ['slots', 'bookings'],
  },
  {
    domain: 'Slots',
    domainLetter: 'S',
    method: 'POST',
    path: '/api/slots',
    description: 'Create slot template (ACFS admin only)',
    parameters: [
      { name: 'site_id', location: 'body', type: 'UUID', description: 'Site where slot is available', required: true },
      { name: 'slot_date', location: 'body', type: 'string', description: 'Slot date (YYYY-MM-DD)', required: true },
      { name: 'day_of_week', location: 'body', type: 'enum', description: 'Day of week (MON-SUN)', required: true },
      { name: 'time_window_start', location: 'body', type: 'string', description: 'Start time (HH:MM)', required: true },
      { name: 'time_window_end', location: 'body', type: 'string', description: 'End time (HH:MM)', required: true },
      { name: 'capacity_slots', location: 'body', type: 'number', description: 'Total available slots', required: true },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Slot is available', required: true },
      { name: 'is_blocked', location: 'body', type: 'boolean', description: 'Slot is blocked', required: false },
    ],
    auth: ['ACFS'],
    response: 'Created slot object',
    usesUuid: false,
    tables: ['slots'],
  },
  {
    domain: 'Slots',
    domainLetter: 'S',
    method: 'PATCH',
    path: '/api/slots/:id',
    description: 'Update slot configuration (ACFS admin only)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Slot unique identifier', required: true },
      { name: 'capacity_slots', location: 'body', type: 'number', description: 'Update capacity', required: false },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Toggle active status', required: false },
      { name: 'is_blocked', location: 'body', type: 'boolean', description: 'Toggle blocked status', required: false },
      { name: 'time_window_start', location: 'body', type: 'string', description: 'Update start time', required: false },
      { name: 'time_window_end', location: 'body', type: 'string', description: 'Update end time', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated slot object',
    usesUuid: true,
    tables: ['slots'],
  },
]

export const slotEndpointsWithIds: ApiEndpoint[] = slotEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Delivery Orders (D)
// ============================================================================

const deliveryOrderEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Delivery Orders',
    domainLetter: 'D',
    method: 'POST',
    path: '/api/delivery-orders',
    description: 'Upload delivery order document',
    parameters: [
      { name: 'hbl_id', location: 'body', type: 'UUID', description: 'HBL this DO relates to', required: true },
      { name: 'custody_chain_id', location: 'body', type: 'UUID', description: 'Custody chain entry', required: true },
      { name: 'issued_by_company_id', location: 'body', type: 'UUID', description: 'Company issuing DO', required: true },
      { name: 'issued_to_company_id', location: 'body', type: 'UUID', description: 'Company receiving DO', required: true },
      { name: 'do_number', location: 'body', type: 'string', description: 'Delivery order number', required: true },
      { name: 'document_url', location: 'body', type: 'string', description: 'URL to DO document', required: true },
      { name: 'tier_level', location: 'body', type: 'number', description: 'Delegation tier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Created delivery order object with validation_status = pending',
    usesUuid: false,
    tables: ['delivery_orders', 'hbls', 'companies'],
  },
  {
    domain: 'Delivery Orders',
    domainLetter: 'D',
    method: 'GET',
    path: '/api/delivery-orders',
    description: 'List delivery orders with filtering',
    parameters: [
      { name: 'validation_status', location: 'query', type: 'enum', description: 'Filter by status (pending, valid, invalid)', required: false },
      { name: 'hbl_id', location: 'query', type: 'UUID', description: 'Filter by HBL', required: false },
      { name: 'issued_to_company_id', location: 'query', type: 'UUID', description: 'Filter by receiving company', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of delivery order objects',
    usesUuid: false,
    tables: ['delivery_orders', 'hbls', 'companies'],
  },
  {
    domain: 'Delivery Orders',
    domainLetter: 'D',
    method: 'GET',
    path: '/api/delivery-orders/:id',
    description: 'Get delivery order details',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Delivery order unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Delivery order object with related HBL and company details',
    usesUuid: true,
    tables: ['delivery_orders', 'hbls', 'companies'],
  },
  {
    domain: 'Delivery Orders',
    domainLetter: 'D',
    method: 'PATCH',
    path: '/api/delivery-orders/:id/validate',
    description: 'Validate or flag delivery order (ACFS only)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Delivery order unique identifier', required: true },
      { name: 'validation_status', location: 'body', type: 'enum', description: 'Set to valid or invalid', required: true },
      { name: 'invalidation_reason', location: 'body', type: 'string', description: 'Reason if invalid', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated delivery order with validation result',
    usesUuid: true,
    tables: ['delivery_orders'],
  },
  {
    domain: 'Delivery Orders',
    domainLetter: 'D',
    method: 'DELETE',
    path: '/api/delivery-orders/:id',
    description: 'Delete delivery order (LSP who uploaded or ACFS)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Delivery order unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Success message',
    usesUuid: true,
    tables: ['delivery_orders'],
  },
]

export const deliveryOrderEndpointsWithIds: ApiEndpoint[] = deliveryOrderEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Delegations (G)
// ============================================================================

const delegationEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Delegations',
    domainLetter: 'G',
    method: 'POST',
    path: '/api/delegations',
    description: 'Create delegation of HBLs to another company',
    parameters: [
      { name: 'delegator_company_id', location: 'body', type: 'UUID', description: 'Company delegating', required: true },
      { name: 'delegation_method', location: 'body', type: 'enum', description: 'Method: email, manual, system', required: true },
      { name: 'delegatee_company_id', location: 'body', type: 'UUID', description: 'Company receiving delegation', required: false },
      { name: 'delegatee_email', location: 'body', type: 'string', description: 'Email if not yet registered', required: false },
      { name: 'hbl_ids', location: 'body', type: 'array', description: 'Array of HBL UUIDs to delegate', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Created delegation object with status = pending',
    usesUuid: false,
    tables: ['delegations', 'delegation_hbls', 'hbls', 'companies'],
  },
  {
    domain: 'Delegations',
    domainLetter: 'G',
    method: 'GET',
    path: '/api/delegations',
    description: 'List delegations with filtering',
    parameters: [
      { name: 'delegator_company_id', location: 'query', type: 'UUID', description: 'Filter by delegating company', required: false },
      { name: 'delegatee_company_id', location: 'query', type: 'UUID', description: 'Filter by receiving company', required: false },
      { name: 'status', location: 'query', type: 'enum', description: 'Filter by status (pending, active, revoked)', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of delegation objects',
    usesUuid: false,
    tables: ['delegations', 'companies'],
  },
  {
    domain: 'Delegations',
    domainLetter: 'G',
    method: 'GET',
    path: '/api/delegations/:id',
    description: 'Get delegation details with HBLs',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Delegation unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Delegation object with nested HBLs and company details',
    usesUuid: true,
    tables: ['delegations', 'delegation_hbls', 'hbls', 'companies'],
  },
  {
    domain: 'Delegations',
    domainLetter: 'G',
    method: 'POST',
    path: '/api/delegations/:id/revoke',
    description: 'Revoke delegation (ACFS admin only)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Delegation unique identifier', required: true },
    ],
    auth: ['ACFS'],
    response: 'Revoked delegation object with status = revoked',
    usesUuid: true,
    tables: ['delegations'],
  },
]

export const delegationEndpointsWithIds: ApiEndpoint[] = delegationEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Parties/LSPs (P)
// ============================================================================

const partyEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Parties/LSPs',
    domainLetter: 'P',
    method: 'GET',
    path: '/api/parties',
    description: 'List companies for delegation picker',
    parameters: [
      { name: 'company_type', location: 'query', type: 'enum', description: 'Filter by type (LSP, ACFS, P4TC)', required: false },
      { name: 'is_active', location: 'query', type: 'boolean', description: 'Filter by active status', required: false },
      { name: 'q', location: 'query', type: 'string', description: 'Search by company name', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of company objects with basic info',
    usesUuid: false,
    tables: ['companies'],
  },
  {
    domain: 'Parties/LSPs',
    domainLetter: 'P',
    method: 'GET',
    path: '/api/parties/:id',
    description: 'Get company details',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Company unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Company object with full details',
    usesUuid: true,
    tables: ['companies'],
  },
]

export const partyEndpointsWithIds: ApiEndpoint[] = partyEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Drivers (R)
// ============================================================================

const driverEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Drivers',
    domainLetter: 'R',
    method: 'GET',
    path: '/api/drivers',
    description: 'List drivers scoped to LSP company',
    parameters: [
      { name: 'is_active', location: 'query', type: 'boolean', description: 'Filter by active status', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP'],
    response: 'Array of driver objects for current LSP',
    usesUuid: false,
    tables: ['drivers', 'companies'],
  },
  {
    domain: 'Drivers',
    domainLetter: 'R',
    method: 'POST',
    path: '/api/drivers',
    description: 'Add driver to LSP company',
    parameters: [
      { name: 'company_id', location: 'body', type: 'UUID', description: 'LSP company', required: true },
      { name: 'driver_name', location: 'body', type: 'string', description: 'Driver full name', required: true },
      { name: 'driver_licence_number', location: 'body', type: 'string', description: 'License number', required: true },
      { name: 'driver_phone', location: 'body', type: 'string', description: 'Contact phone', required: true },
      { name: 'default_truck_rego', location: 'body', type: 'string', description: 'Default vehicle registration', required: false },
      { name: 'site_induction_completed', location: 'body', type: 'boolean', description: 'Induction status', required: true },
    ],
    auth: ['LSP'],
    response: 'Created driver object',
    usesUuid: false,
    tables: ['drivers'],
  },
  {
    domain: 'Drivers',
    domainLetter: 'R',
    method: 'PATCH',
    path: '/api/drivers/:id',
    description: 'Update driver details or soft-delete',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Driver unique identifier', required: true },
      { name: 'driver_name', location: 'body', type: 'string', description: 'Update driver name', required: false },
      { name: 'driver_licence_number', location: 'body', type: 'string', description: 'Update license number', required: false },
      { name: 'driver_phone', location: 'body', type: 'string', description: 'Update phone', required: false },
      { name: 'default_truck_rego', location: 'body', type: 'string', description: 'Update truck rego', required: false },
      { name: 'site_induction_completed', location: 'body', type: 'boolean', description: 'Update induction status', required: false },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Set to false to soft-delete', required: false },
    ],
    auth: ['LSP'],
    response: 'Updated driver object',
    usesUuid: true,
    tables: ['drivers'],
  },
]

export const driverEndpointsWithIds: ApiEndpoint[] = driverEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Users (U)
// ============================================================================

const userEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Users',
    domainLetter: 'U',
    method: 'GET',
    path: '/api/users',
    description: 'List users (ACFS admin only)',
    parameters: [
      { name: 'role', location: 'query', type: 'enum', description: 'Filter by role (admin, user, viewer)', required: false },
      { name: 'company_id', location: 'query', type: 'UUID', description: 'Filter by company', required: false },
      { name: 'is_active', location: 'query', type: 'boolean', description: 'Filter by active status', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['ACFS'],
    response: 'Array of user objects',
    usesUuid: false,
    tables: ['users', 'companies'],
  },
  {
    domain: 'Users',
    domainLetter: 'U',
    method: 'POST',
    path: '/api/users',
    description: 'Create user (ACFS admin only)',
    parameters: [
      { name: 'company_id', location: 'body', type: 'UUID', description: 'Company assignment', required: true },
      { name: 'first_name', location: 'body', type: 'string', description: 'First name', required: true },
      { name: 'last_name', location: 'body', type: 'string', description: 'Last name', required: true },
      { name: 'email', location: 'body', type: 'string', description: 'Email address', required: true },
      { name: 'role', location: 'body', type: 'enum', description: 'User role', required: true },
      { name: 'okta_id', location: 'body', type: 'string', description: 'Okta ID', required: false },
    ],
    auth: ['ACFS'],
    response: 'Created user object with is_active = true',
    usesUuid: false,
    tables: ['users', 'companies'],
  },
  {
    domain: 'Users',
    domainLetter: 'U',
    method: 'PATCH',
    path: '/api/users/:id',
    description: 'Update user (ACFS admin only)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'User unique identifier', required: true },
      { name: 'first_name', location: 'body', type: 'string', description: 'Update first name', required: false },
      { name: 'last_name', location: 'body', type: 'string', description: 'Update last name', required: false },
      { name: 'email', location: 'body', type: 'string', description: 'Update email', required: false },
      { name: 'role', location: 'body', type: 'enum', description: 'Update role', required: false },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Toggle active status', required: false },
      { name: 'company_id', location: 'body', type: 'UUID', description: 'Update company assignment', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated user object',
    usesUuid: true,
    tables: ['users'],
  },
  {
    domain: 'Users',
    domainLetter: 'U',
    method: 'DELETE',
    path: '/api/users/:id',
    description: 'Soft-delete user (ACFS admin only)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'User unique identifier', required: true },
    ],
    auth: ['ACFS'],
    response: 'Deleted user object with is_active = false',
    usesUuid: true,
    tables: ['users'],
  },
]

export const userEndpointsWithIds: ApiEndpoint[] = userEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Sites (I)
// ============================================================================

const siteEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Sites',
    domainLetter: 'I',
    method: 'GET',
    path: '/api/sites',
    description: 'List all ACFS sites',
    parameters: [
      { name: 'state', location: 'query', type: 'string', description: 'Filter by state (VIC, NSW, QLD, etc)', required: false },
      { name: 'is_active', location: 'query', type: 'boolean', description: 'Filter by active status', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of site objects with location and contact info',
    usesUuid: false,
    tables: ['sites'],
  },
  {
    domain: 'Sites',
    domainLetter: 'I',
    method: 'PATCH',
    path: '/api/sites/:id',
    description: 'Update site details (ACFS admin)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Site unique identifier', required: true },
      { name: 'site_name', location: 'body', type: 'string', description: 'Update site name', required: false },
      { name: 'street_address', location: 'body', type: 'string', description: 'Update address', required: false },
      { name: 'suburb', location: 'body', type: 'string', description: 'Update suburb', required: false },
      { name: 'state', location: 'body', type: 'string', description: 'Update state', required: false },
      { name: 'postcode', location: 'body', type: 'string', description: 'Update postcode', required: false },
      { name: 'contact_phone', location: 'body', type: 'string', description: 'Update contact phone', required: false },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Update active status', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated site object',
    usesUuid: true,
    tables: ['sites'],
  },
]

export const siteEndpointsWithIds: ApiEndpoint[] = siteEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Auth (A)
// ============================================================================

const authEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Auth',
    domainLetter: 'A',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Login (email/password for LSP, SSO for ACFS)',
    parameters: [
      { name: 'email', location: 'body', type: 'string', description: 'User email', required: true },
      { name: 'password', location: 'body', type: 'string', description: 'Password (LSP only)', required: false },
      { name: 'sso_token', location: 'body', type: 'string', description: 'SSO token (ACFS only)', required: false },
    ],
    auth: [],
    response: 'JWT token and user context',
    usesUuid: false,
    tables: ['users', 'companies'],
  },
  {
    domain: 'Auth',
    domainLetter: 'A',
    method: 'POST',
    path: '/api/auth/logout',
    description: 'Logout (invalidate session)',
    parameters: [],
    auth: ['LSP', 'ACFS'],
    response: 'Success message',
    usesUuid: false,
    tables: ['sessions'],
  },
  {
    domain: 'Auth',
    domainLetter: 'A',
    method: 'GET',
    path: '/api/auth/session',
    description: 'Get current session/user context',
    parameters: [],
    auth: ['LSP', 'ACFS'],
    response: 'Current user and company context',
    usesUuid: false,
    tables: ['users', 'companies'],
  },
]

export const authEndpointsWithIds: ApiEndpoint[] = authEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Payments (Y)
// ============================================================================

const paymentEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Payments',
    domainLetter: 'Y',
    method: 'POST',
    path: '/api/payments/create-intent',
    description: 'Create Stripe payment intent',
    parameters: [
      { name: 'booking_id', location: 'body', type: 'UUID', description: 'Booking to pay for', required: true },
      { name: 'amount_excl_gst', location: 'body', type: 'number', description: 'Amount before GST', required: true },
      { name: 'gst_amount', location: 'body', type: 'number', description: 'GST amount', required: true },
      { name: 'total_amount', location: 'body', type: 'number', description: 'Total amount including GST', required: true },
    ],
    auth: ['LSP'],
    response: 'Stripe payment intent object with client_secret',
    usesUuid: false,
    tables: ['payments', 'bookings'],
  },
  {
    domain: 'Payments',
    domainLetter: 'Y',
    method: 'POST',
    path: '/api/payments/:id/confirm',
    description: 'Confirm payment after gateway success',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Payment unique identifier', required: true },
      { name: 'stripe_charge_id', location: 'body', type: 'string', description: 'Stripe charge ID', required: true },
    ],
    auth: ['LSP'],
    response: 'Confirmed payment object with status = completed',
    usesUuid: true,
    tables: ['payments', 'bookings'],
  },
  {
    domain: 'Payments',
    domainLetter: 'Y',
    method: 'GET',
    path: '/api/payments/:id/status',
    description: 'Check payment status',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Payment unique identifier', required: true },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Payment object with current status',
    usesUuid: true,
    tables: ['payments'],
  },
]

export const paymentEndpointsWithIds: ApiEndpoint[] = paymentEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Stats/Dashboard (X)
// ============================================================================

const statEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Stats/Dashboard',
    domainLetter: 'X',
    method: 'GET',
    path: '/api/stats/hbls',
    description: 'HBL counts by status, milestone, site (scoped by role)',
    parameters: [
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site', required: false },
      { name: 'company_id', location: 'query', type: 'UUID', description: 'Filter by company (LSP scoped)', required: false },
      { name: 'date_from', location: 'query', type: 'string', description: 'From date (YYYY-MM-DD)', required: false },
      { name: 'date_to', location: 'query', type: 'string', description: 'To date (YYYY-MM-DD)', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Object with counts by status, milestone, and site',
    usesUuid: false,
    tables: ['hbls'],
  },
  {
    domain: 'Stats/Dashboard',
    domainLetter: 'X',
    method: 'GET',
    path: '/api/stats/bookings',
    description: 'Booking counts by status, upcoming slots',
    parameters: [
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site', required: false },
      { name: 'date_from', location: 'query', type: 'string', description: 'From date (YYYY-MM-DD)', required: false },
      { name: 'date_to', location: 'query', type: 'string', description: 'To date (YYYY-MM-DD)', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Object with counts by status and upcoming slots info',
    usesUuid: false,
    tables: ['bookings', 'slots'],
  },
  {
    domain: 'Stats/Dashboard',
    domainLetter: 'X',
    method: 'GET',
    path: '/api/stats/do-queue',
    description: 'Delivery order validation queue stats (ACFS only)',
    parameters: [
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site', required: false },
    ],
    auth: ['ACFS'],
    response: 'Object with pending, valid, invalid counts and queue age',
    usesUuid: false,
    tables: ['delivery_orders'],
  },
]

export const statEndpointsWithIds: ApiEndpoint[] = statEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Pricing Zones (Z)
// ============================================================================

const pricingZoneEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Pricing Zones',
    domainLetter: 'Z',
    method: 'GET',
    path: '/api/pricing-zones',
    description: 'List pricing zones',
    parameters: [
      { name: 'site_id', location: 'query', type: 'UUID', description: 'Filter by site', required: false },
      { name: 'is_active', location: 'query', type: 'boolean', description: 'Filter by active status', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of pricing zone objects',
    usesUuid: false,
    tables: ['pricing_zones', 'sites'],
  },
  {
    domain: 'Pricing Zones',
    domainLetter: 'Z',
    method: 'POST',
    path: '/api/pricing-zones',
    description: 'Create pricing zone (ACFS admin)',
    parameters: [
      { name: 'site_id', location: 'body', type: 'UUID', description: 'Site for zone', required: true },
      { name: 'pickup_fee_excl_gst', location: 'body', type: 'number', description: 'Pickup fee', required: true },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Zone is active', required: true },
    ],
    auth: ['ACFS'],
    response: 'Created pricing zone object',
    usesUuid: false,
    tables: ['pricing_zones'],
  },
  {
    domain: 'Pricing Zones',
    domainLetter: 'Z',
    method: 'PATCH',
    path: '/api/pricing-zones/:id',
    description: 'Update pricing zone rate (ACFS admin)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Pricing zone unique identifier', required: true },
      { name: 'pickup_fee_excl_gst', location: 'body', type: 'number', description: 'Update fee', required: false },
      { name: 'is_active', location: 'body', type: 'boolean', description: 'Update active status', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated pricing zone object',
    usesUuid: true,
    tables: ['pricing_zones'],
  },
  {
    domain: 'Pricing Zones',
    domainLetter: 'Z',
    method: 'DELETE',
    path: '/api/pricing-zones/:id',
    description: 'Soft-delete/deactivate pricing zone (ACFS admin)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Pricing zone unique identifier', required: true },
    ],
    auth: ['ACFS'],
    response: 'Deleted pricing zone object with is_active = false',
    usesUuid: true,
    tables: ['pricing_zones'],
  },
]

export const pricingZoneEndpointsWithIds: ApiEndpoint[] = pricingZoneEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Containers (C)
// ============================================================================

const containerEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Containers',
    domainLetter: 'C',
    method: 'GET',
    path: '/api/containers',
    description: 'List containers with filtering',
    parameters: [
      { name: 'status', location: 'query', type: 'enum', description: 'Filter by status (in_transit, at_site, collected, delivered)', required: false },
      { name: 'hbl_id', location: 'query', type: 'UUID', description: 'Filter by HBL', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['LSP', 'ACFS'],
    response: 'Array of container objects',
    usesUuid: false,
    tables: ['containers', 'hbls'],
  },
  {
    domain: 'Containers',
    domainLetter: 'C',
    method: 'PATCH',
    path: '/api/containers/:id',
    description: 'Update container status (ACFS)',
    parameters: [
      { name: 'id', location: 'path', type: 'UUID', description: 'Container unique identifier', required: true },
      { name: 'status', location: 'body', type: 'enum', description: 'Update status', required: true },
      { name: 'notes', location: 'body', type: 'string', description: 'Update notes', required: false },
    ],
    auth: ['ACFS'],
    response: 'Updated container object',
    usesUuid: true,
    tables: ['containers'],
  },
]

export const containerEndpointsWithIds: ApiEndpoint[] = containerEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Domain: Notifications (N)
// ============================================================================

const notificationEndpoints: Omit<ApiEndpoint, 'id'>[] = [
  {
    domain: 'Notifications',
    domainLetter: 'N',
    method: 'GET',
    path: '/api/notifications',
    description: 'List email notifications for audit (ACFS admin only)',
    parameters: [
      { name: 'notification_type', location: 'query', type: 'enum', description: 'Filter by type (hbl_assigned, booking_confirmed, payment_received, do_validated, delegation_revoked)', required: false },
      { name: 'sent_from', location: 'query', type: 'string', description: 'From date for sent_at (YYYY-MM-DD)', required: false },
      { name: 'sent_to', location: 'query', type: 'string', description: 'To date for sent_at (YYYY-MM-DD)', required: false },
      { name: 'page', location: 'query', type: 'number', description: 'Page number', required: false },
      { name: 'limit', location: 'query', type: 'number', description: 'Items per page', required: false },
    ],
    auth: ['ACFS'],
    response: 'Array of notification audit log entries',
    usesUuid: false,
    tables: ['email_audit_log'],
  },
]

export const notificationEndpointsWithIds: ApiEndpoint[] = notificationEndpoints.map(endpoint => ({
  ...endpoint,
  id: generateApiId(endpoint.domainLetter, `${endpoint.method} ${endpoint.path}`),
}))

// ============================================================================
// Aggregated Exports
// ============================================================================

export const allEndpoints: ApiEndpoint[] = [
  ...hblEndpointsWithIds,
  ...bookingEndpointsWithIds,
  ...slotEndpointsWithIds,
  ...deliveryOrderEndpointsWithIds,
  ...delegationEndpointsWithIds,
  ...partyEndpointsWithIds,
  ...driverEndpointsWithIds,
  ...userEndpointsWithIds,
  ...siteEndpointsWithIds,
  ...authEndpointsWithIds,
  ...paymentEndpointsWithIds,
  ...statEndpointsWithIds,
  ...pricingZoneEndpointsWithIds,
  ...containerEndpointsWithIds,
  ...notificationEndpointsWithIds,
]

export const endpointsByDomain: DomainGroup[] = [
  { domain: 'HBLs/Shipments', domainLetter: 'H', count: 4, endpoints: hblEndpointsWithIds },
  { domain: 'Bookings', domainLetter: 'B', count: 6, endpoints: bookingEndpointsWithIds },
  { domain: 'Slots', domainLetter: 'S', count: 4, endpoints: slotEndpointsWithIds },
  { domain: 'Delivery Orders', domainLetter: 'D', count: 5, endpoints: deliveryOrderEndpointsWithIds },
  { domain: 'Delegations', domainLetter: 'G', count: 4, endpoints: delegationEndpointsWithIds },
  { domain: 'Parties/LSPs', domainLetter: 'P', count: 2, endpoints: partyEndpointsWithIds },
  { domain: 'Drivers', domainLetter: 'R', count: 3, endpoints: driverEndpointsWithIds },
  { domain: 'Users', domainLetter: 'U', count: 4, endpoints: userEndpointsWithIds },
  { domain: 'Sites', domainLetter: 'I', count: 2, endpoints: siteEndpointsWithIds },
  { domain: 'Auth', domainLetter: 'A', count: 3, endpoints: authEndpointsWithIds },
  { domain: 'Payments', domainLetter: 'Y', count: 3, endpoints: paymentEndpointsWithIds },
  { domain: 'Stats/Dashboard', domainLetter: 'X', count: 3, endpoints: statEndpointsWithIds },
  { domain: 'Pricing Zones', domainLetter: 'Z', count: 4, endpoints: pricingZoneEndpointsWithIds },
  { domain: 'Containers', domainLetter: 'C', count: 2, endpoints: containerEndpointsWithIds },
  { domain: 'Notifications', domainLetter: 'N', count: 1, endpoints: notificationEndpointsWithIds },
]

export const endpointStats = {
  total: allEndpoints.length,
  domains: endpointsByDomain.length,
  methods: {
    GET: allEndpoints.filter(e => e.method === 'GET').length,
    POST: allEndpoints.filter(e => e.method === 'POST').length,
    PATCH: allEndpoints.filter(e => e.method === 'PATCH').length,
    DELETE: allEndpoints.filter(e => e.method === 'DELETE').length,
  },
  usesUuid: allEndpoints.filter(e => e.usesUuid).length,
}
