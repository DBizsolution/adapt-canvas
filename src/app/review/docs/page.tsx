'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileText, ChevronRight, Loader2, Link as LinkIcon, Upload, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type DocMeta = { slug: string; label: string; category: string; type: 'md' | 'pdf' }

const categoryLabels: Record<string, string> = {
  project: 'Project',
  specs: 'Specs',
  plans: 'Plans',
  'meeting-notes': 'Meeting Notes',
}

const categoryOrder = ['project', 'specs', 'plans', 'meeting-notes']

export default function DocsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
        <Loader2 size={20} className="animate-spin" />
      </div>
    }>
      <DocsPageInner />
    </Suspense>
  )
}

function DocsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slugFromUrl = searchParams.get('doc')

  const [docList, setDocList] = useState<DocMeta[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>(slugFromUrl)
  const [content, setContent] = useState<string>('')
  const [activeLabel, setActiveLabel] = useState<string>('')
  const [activeType, setActiveType] = useState<'md' | 'pdf'>('md')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prevPdfUrl = useRef<string | null>(null)
  const initialLoadDone = useRef(false)

  // Fetch doc list
  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => setDocList(data.docs ?? []))
  }, [])

  // Load doc from URL on initial render
  useEffect(() => {
    if (initialLoadDone.current || !slugFromUrl || docList.length === 0) return
    const doc = docList.find(d => d.slug === slugFromUrl)
    if (doc) {
      initialLoadDone.current = true
      loadDoc(doc.slug, doc.label, doc.type, false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugFromUrl, docList])

  const loadDoc = useCallback((slug: string, label: string, type: 'md' | 'pdf', pushUrl = true) => {
    setActiveSlug(slug)
    setActiveLabel(label)
    setActiveType(type)
    setLoading(true)

    if (pushUrl) {
      router.push(`/review/docs?doc=${slug}`, { scroll: false })
    }

    fetch(`/api/docs?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (prevPdfUrl.current) {
          URL.revokeObjectURL(prevPdfUrl.current)
          prevPdfUrl.current = null
        }

        if (data.type === 'pdf' && data.content) {
          const byteChars = atob(data.content)
          const bytes = new Uint8Array(byteChars.length)
          for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i)
          const blob = new Blob([bytes], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
          prevPdfUrl.current = url
          setContent('')
        } else {
          setPdfUrl(null)
          setContent(data.content ?? '')
        }
        setLoading(false)
      })
      .catch(() => {
        setContent('Failed to load document.')
        setLoading(false)
      })
  }, [router])

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}/review/docs?doc=${activeSlug}`
    navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }, [activeSlug])

  const uploadFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'md') {
      alert('Only .pdf and .md files are allowed.')
      return
    }

    setUploading(true)
    setUploadDone(false)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/docs/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Upload failed')
        setUploading(false)
        return
      }

      const data = await res.json()
      setUploading(false)
      setUploadDone(true)
      setTimeout(() => setUploadDone(false), 2000)

      // Refresh doc list and open the uploaded doc
      const listRes = await fetch('/api/docs')
      const listData = await listRes.json()
      setDocList(listData.docs ?? [])
      loadDoc(data.slug, data.label, data.type)
    } catch {
      alert('Upload failed')
      setUploading(false)
    }
  }, [loadDoc])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }, [uploadFile])

  const grouped = categoryOrder
    .map(cat => ({
      key: cat,
      label: categoryLabels[cat] ?? cat,
      items: docList.filter(d => d.category === cat),
    }))
    .filter(g => g.items.length > 0)

  return (
    <div className="flex h-full gap-0">
      {/* Doc sidebar */}
      <div
        className="w-[220px] shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {/* Scrollable doc list */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 custom-scroll">
          <p
            className="px-2 mb-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Documents
          </p>
          {grouped.map(group => (
            <div key={group.key} className="mb-3">
              <p
                className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)', opacity: 0.6 }}
              >
                {group.label}
              </p>
              {group.items.map(doc => (
                <button
                  key={doc.slug}
                  type="button"
                  onClick={() => loadDoc(doc.slug, doc.label, doc.type)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] leading-tight transition-colors duration-150 ${
                    activeSlug === doc.slug
                      ? 'font-semibold'
                      : 'hover:bg-black/[0.03]'
                  }`}
                  style={{
                    color: activeSlug === doc.slug ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    background: activeSlug === doc.slug ? 'var(--bg-blue-subtle)' : undefined,
                  }}
                >
                  <FileText size={13} className="shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{doc.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Sticky upload zone */}
        <div className="shrink-0 border-t px-2.5 py-3" style={{ borderColor: 'var(--border-default)' }}>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-3 py-3 text-center cursor-pointer transition-colors duration-150 ${
              dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-black/[0.02]'
            }`}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
            ) : uploadDone ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <Upload size={16} style={{ color: 'var(--text-muted)' }} />
            )}
            <span className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>
              {uploading ? 'Uploading...' : uploadDone ? 'Uploaded' : 'Drop file or click to upload'}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
              .pdf or .md only
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {!activeSlug && (
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: 'var(--text-muted)' }}>
            <FileText size={40} className="mb-3 opacity-20" />
            <p className="text-base font-medium">Select a document</p>
            <p className="text-sm mt-1">Choose from the sidebar to view</p>
          </div>
        )}

        {activeSlug && loading && (
          <div className="flex items-center gap-2 py-16 justify-center" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" />
            Loading...
          </div>
        )}

        {activeSlug && !loading && activeType === 'pdf' && pdfUrl && (
          <div className="h-full flex flex-col px-6 py-4">
            <div className="flex items-center gap-1.5 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Docs</span>
              <ChevronRight size={11} />
              <span style={{ color: 'var(--text-secondary)' }}>{activeLabel}</span>
              <button
                type="button"
                onClick={copyLink}
                className="ml-2 flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors duration-150 hover:bg-black/[0.04]"
                title="Copy link"
              >
                <LinkIcon size={11} />
                <span>{linkCopied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full flex-1 rounded border"
              style={{ borderColor: 'var(--border-default)', minHeight: 0 }}
              title={activeLabel}
            />
          </div>
        )}

        {activeSlug && !loading && activeType !== 'pdf' && (
          <div className="max-w-[780px] mx-auto px-10 py-8">
            <div className="flex items-center gap-1.5 mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Docs</span>
              <ChevronRight size={11} />
              <span style={{ color: 'var(--text-secondary)' }}>{activeLabel}</span>
              <button
                type="button"
                onClick={copyLink}
                className="ml-2 flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors duration-150 hover:bg-black/[0.04]"
                title="Copy link"
              >
                <LinkIcon size={11} />
                <span>{linkCopied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>

            <article
              className="prose max-w-none
                prose-headings:tracking-tight
                prose-h1:text-[28px] prose-h1:font-bold prose-h1:leading-tight prose-h1:mb-4
                prose-h2:text-[22px] prose-h2:font-semibold prose-h2:leading-snug prose-h2:mt-10 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b
                prose-h3:text-[17px] prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2
                prose-h4:text-[15px] prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-1.5
                prose-p:text-[15px] prose-p:leading-[1.7] prose-p:mb-4
                prose-li:text-[15px] prose-li:leading-[1.7]
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold
                prose-code:text-[13px] prose-code:font-medium prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-lg prose-pre:text-[13px]
                prose-blockquote:border-l-blue-400 prose-blockquote:bg-blue-50/40 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-[14px]
                prose-table:text-[14px]
                prose-th:text-left prose-th:font-semibold prose-th:pb-2 prose-th:border-b-2
                prose-td:py-2 prose-td:align-top
                prose-hr:my-8 prose-hr:border-slate-200
                prose-img:rounded-lg"
              style={{ color: 'var(--text-primary)', '--tw-prose-headings': 'var(--text-primary)', '--tw-prose-body': 'var(--text-secondary)', '--tw-prose-bold': 'var(--text-primary)', '--tw-prose-counters': 'var(--text-muted)', '--tw-prose-bullets': 'var(--text-muted)', '--tw-prose-hr': 'var(--border-default)', '--tw-prose-th-borders': 'var(--border-default)', '--tw-prose-td-borders': 'var(--border-default)' } as React.CSSProperties}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  )
}
