'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageLoading() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [pathname])

  if (!loading) return null

  return <div className="page-loading-bar" />
}
