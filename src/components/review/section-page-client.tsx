'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SectionCard } from './section-renderer'
import { SectionToc } from './section-toc'
import type { SectionReview, SectionType } from '@/domain/intent-model/types'

type ModelItem = { id: string; [key: string]: unknown }

type SectionPageClientProps = {
  items: Array<{
    item: ModelItem
    type: SectionType
    review: SectionReview
  }>
}

export function SectionPageClient({ items }: SectionPageClientProps) {
  const [showToc, setShowToc] = useState(false)
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null
      const parent = element.parentElement
      if (!parent) return null

      const overflowY = window.getComputedStyle(parent).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent
      }

      return findScrollContainer(parent)
    }

    if (containerRef.current) {
      const container = findScrollContainer(containerRef.current)
      setScrollContainer(container)
    }
  }, [])

  useEffect(() => {
    if (!scrollContainer) return

    const handleScroll = () => {
      const scrolled = scrollContainer.scrollTop > 100
      setShowToc(scrolled)
    }

    handleScroll()
    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [scrollContainer])

  const scrollToItem = useCallback((targetId: string) => {
    const element = document.getElementById(targetId)
    if (element && scrollContainer) {
      const elementTop = element.offsetTop
      const containerTop = scrollContainer.offsetTop
      scrollContainer.scrollTo({ top: elementTop - containerTop - 80, behavior: 'smooth' })
    }
  }, [scrollContainer])

  return (
    <div ref={containerRef} className="flex gap-6">
      <SectionToc
        items={items}
        scrollContainer={scrollContainer}
        onItemClick={scrollToItem}
      />
      <div className="flex-1 space-y-4 min-w-0">
        {items.map(({ item, type, review }) => (
          <SectionCard
            key={review.targetId}
            item={item as any}
            type={type}
            review={review}
          />
        ))}
      </div>
    </div>
  )
}
