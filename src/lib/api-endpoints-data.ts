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
