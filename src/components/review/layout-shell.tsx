'use client'

import { usePathname } from 'next/navigation'

export function ChatPanelWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDocsPage = pathname.startsWith('/review/docs')

  if (isDocsPage) return null
  return <>{children}</>
}

export function ModelToolbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDocsPage = pathname.startsWith('/review/docs')

  if (isDocsPage) return null
  return <>{children}</>
}

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDocsPage = pathname.startsWith('/review/docs')

  return (
    <div className={`flex flex-1 flex-col overflow-hidden ${isDocsPage ? 'mr-0' : ''}`}>
      {children}
    </div>
  )
}

export function ContentCard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDocsPage = pathname.startsWith('/review/docs')

  if (isDocsPage) {
    return (
      <div
        className="flex-1 overflow-y-auto custom-scroll"
        style={{
          background: 'var(--bg-white)',
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className="ml-1 flex-1 overflow-y-auto rounded-xl custom-scroll"
      style={{
        background: 'var(--bg-card-gray)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="px-5 py-5">
        {children}
      </div>
    </div>
  )
}
