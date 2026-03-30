'use client'

import Link from 'next/link'
import {
  Users,
  Box,
  Route,
  Scale,
  Lock,
  HelpCircle,
  LayoutDashboard,
  Network,
  FileText,
  ClipboardList,
  Code,
  Map,
  TableProperties,
  GitCompare,
  ArrowRight,
} from 'lucide-react'

type Card = {
  title: string
  description: string
  href: string
  icon: typeof Users
  items?: string[]
}

const cardGroups = [
  {
    title: 'Model',
    cards: [
      {
        title: 'Consensus Dashboard',
        description: 'Review and approve model sections across the team',
        href: '/consensus',
        icon: LayoutDashboard,
        items: ['Track approval status', 'See disputed items', 'Monitor progress'],
      },
      {
        title: 'Model Sections',
        description: 'Deep dive into actors, entities, journeys, rules, and constraints',
        href: '/actors',
        icon: Users,
        items: ['5 Actors', '10 Entities', '14 Journeys', '21 Business Rules', '5 Constraints', '1 Open Question'],
      },
    ],
  },
  {
    title: 'Docs',
    cards: [
      {
        title: 'Business Requirements',
        description: 'Complete BRD generated from the intent model',
        href: '/brd',
        icon: ClipboardList,
        items: ['Export to PDF', 'Version-controlled', 'Auto-generated'],
      },
      {
        title: 'API Specification',
        description: 'Technical API endpoints and integration details',
        href: '/api-spec',
        icon: Code,
        items: ['Endpoint documentation', 'Request/response schemas', 'Authentication flows'],
      },
      {
        title: 'Project Documents',
        description: 'Upload, search, and reference supporting documentation',
        href: '/documents',
        icon: FileText,
        items: ['AI-powered search', 'File uploads', 'Cross-reference with model'],
      },
    ],
  },
  {
    title: 'Technical',
    cards: [
      {
        title: 'Model Explorer',
        description: 'Interactive 3D and graph visualizations of the intent model',
        href: '/explorer',
        icon: Network,
        items: ['Force-directed graph', '2D layout editor', 'Model structure view'],
      },
      {
        title: 'Implementation Map',
        description: 'Connect model responsibilities to frontend screens',
        href: '/architecture',
        icon: Map,
        items: ['Responsibility → screen mapping', 'Implementation tracking', 'Coverage analysis'],
      },
      {
        title: 'Data Model',
        description: 'Database schema and entity relationships',
        href: '/data-model',
        icon: TableProperties,
        items: ['Entity-relationship diagram', 'Table definitions', 'Foreign key relationships'],
      },
      {
        title: 'Version History',
        description: 'Compare model versions and track changes over time',
        href: '/versions',
        icon: GitCompare,
        items: ['Side-by-side diffs', 'Version timeline', 'Rollback capability'],
      },
    ],
  },
]

export function HomeCards() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          VBS Canvas
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Collaborative platform for structuring and reviewing business requirements
        </p>
      </div>

      {/* What is the Intent Model */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          What is the Intent Model?
        </h2>
        <p className="text-base leading-relaxed max-w-4xl" style={{ color: 'var(--text-secondary)' }}>
          The intent model is a structured representation of business requirements that captures <strong>who</strong> interacts with the system (actors), <strong>what</strong> they manage (entities), <strong>how</strong> they accomplish their goals (journeys), and <strong>why</strong> certain behaviors are enforced (business rules and constraints). Unlike traditional documents that scatter requirements across paragraphs and sections, the intent model organizes knowledge into discrete, cross-referenced components that can be queried, validated, and transformed into specifications, tests, and documentation. It serves as a single source of truth that bridges stakeholder conversations and technical implementation.
        </p>
      </div>

      {/* How it helps */}
      <div className="mb-16">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: 'var(--text-muted)' }}>
          How it helps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Engineering
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Engineers get structured, unambiguous requirements with clear entity relationships and business rules. Journey steps map directly to user stories and acceptance criteria. API specifications and data models are auto-generated from the same source, eliminating translation errors between requirements and implementation.
            </p>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Design
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Designers use journey maps to identify every screen and interaction pattern needed. Actor roles and their responsibilities inform information architecture decisions. Entity attributes and business rules surface validation requirements, empty states, and error conditions that need design attention before wireframing begins.
            </p>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Product
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Product managers track consensus on each model section, identify gaps and conflicts early, and maintain a living specification that evolves as requirements change. Open questions are flagged in context, and the structured format makes it easy to scope releases by actor, journey, or feature area without losing system coherence.
            </p>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              AI
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              AI assistants can reason about the system holistically, suggest changes that respect cross-references, generate test cases from journey steps, and draft technical specifications grounded in the model's structure. The intent model provides the schema and constraints that help AI tools stay coherent and aligned with actual requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Card groups */}
      <div className="space-y-12">
        {cardGroups.map(group => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              {group.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.cards.map(card => {
                const Icon = card.icon
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group block rounded-lg transition-all duration-200"
                    style={{
                      background: 'var(--bg-white)',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-subtle)',
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200"
                          style={{
                            background: 'var(--bg-blue-subtle)',
                            color: 'var(--accent-blue)',
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <ArrowRight
                          size={18}
                          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          style={{ color: 'var(--accent-blue)' }}
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {card.title}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {card.description}
                      </p>
                      {card.items && (
                        <ul className="space-y-1">
                          {card.items.map(item => (
                            <li key={item} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                              <div className="h-1 w-1 rounded-full" style={{ background: 'var(--border-dark)' }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
