import { join } from 'node:path'
import { readdirSync } from 'node:fs'

export type DocCategory = 'project' | 'build-log' | 'uploads'

export type DocEntry = {
  slug: string
  label: string
  path: string
  category: DocCategory
  type?: 'md' | 'pdf'
}

const ROOT = process.cwd()
const DOCS = join(ROOT, 'docs')
const UPLOADS_DIR = join(DOCS, 'uploads')

const staticDocs: DocEntry[] = [
  // Project — team-facing docs
  { slug: 'brd', label: 'BRD (Final) V1.0', path: join(DOCS, 'project', 'VBS_Pickup_BRD(Final)_V1.0.pdf'), category: 'project', type: 'pdf' },
  { slug: 'team-guide', label: 'Team Guide — Designers, PMs & Engineers', path: join(DOCS, 'project', 'team-guide.md'), category: 'project' },
  { slug: 'changelog', label: 'Intent Model Changelog', path: join(DOCS, 'project', 'CHANGELOG.md'), category: 'project' },

  // Rahul's Build Log — working docs, superseded notes, build specs
  { slug: 'how-i-built-this', label: 'How I Built This', path: join(DOCS, 'project', 'how-i-built-this.md'), category: 'build-log' },
  { slug: 'how-it-works', label: 'How It Works (superseded by Team Guide)', path: join(DOCS, 'project', 'how-it-works.md'), category: 'build-log' },
  { slug: 'interface-guide', label: 'VBS Interface Guide', path: join(DOCS, 'project', 'VBS-interface-guide.md'), category: 'build-log' },
  { slug: 'pm-questions', label: 'PM Questions & Answers', path: join(DOCS, 'project', 'vbs-pm-questions.md'), category: 'build-log' },
  { slug: 'miro-review', label: 'Miro Board Review', path: join(DOCS, 'project', 'miro-board-review.md'), category: 'build-log' },
  { slug: 'spec-ai-editor', label: 'AI Model Editor Design', path: join(DOCS, 'superpowers', 'specs', '2026-03-17-ai-model-editor-design.md'), category: 'build-log' },
  { slug: 'plan-ai-editor', label: 'AI Model Editor Plan', path: join(DOCS, 'superpowers', 'plans', '2026-03-17-ai-model-editor.md'), category: 'build-log' },
  { slug: 'intent-update-strategy', label: 'Intent Model Update Strategy', path: join(DOCS, 'meeting-notes', 'vbs-intent-update-strategy.md'), category: 'build-log' },
  { slug: 'intent-update-payloads', label: 'Intent Model Update Payloads', path: join(DOCS, 'meeting-notes', 'vbs-intent-update-payloads.md'), category: 'build-log' },
  { slug: 'intent-update-prompts', label: 'Intent Model Update Prompts', path: join(DOCS, 'meeting-notes', 'vbs-intent-update-prompts.md'), category: 'build-log' },
]

function getUploadedDocs(): DocEntry[] {
  try {
    const files = readdirSync(UPLOADS_DIR)
    return files
      .filter(f => f.endsWith('.md') || f.endsWith('.pdf'))
      .map(f => {
        const ext = f.endsWith('.pdf') ? 'pdf' : 'md'
        const baseName = f.replace(/\.[^.]+$/, '')
        const label = baseName
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
        return {
          slug: `upload-${baseName}`,
          label,
          path: join(UPLOADS_DIR, f),
          category: 'uploads' as DocCategory,
          type: ext as 'md' | 'pdf',
        }
      })
  } catch {
    return []
  }
}

export function getAllDocs(): DocEntry[] {
  return [...staticDocs, ...getUploadedDocs()]
}

export function getDoc(slug: string): DocEntry | undefined {
  return getAllDocs().find(d => d.slug === slug)
}

export const categories = [
  { key: 'project' as const, label: 'Project' },
  { key: 'build-log' as const, label: "Rahul's Build Log" },
  { key: 'uploads' as const, label: 'Uploads' },
]

// Re-export for backwards compat
export const docs = staticDocs
