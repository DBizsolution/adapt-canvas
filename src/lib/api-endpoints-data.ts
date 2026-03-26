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
