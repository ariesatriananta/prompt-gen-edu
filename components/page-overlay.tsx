"use client"

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageOverlay() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const lastPath = useRef<string | null>(null)
  const awaitingNav = useRef(false)

  // Show immediately when user clicks internal links
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      let el = e.target as HTMLElement | null
      while (el && el.tagName !== 'A') el = el.parentElement
      const a = el as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('download')) return
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
      } catch {}
      awaitingNav.current = true
      lastPath.current = pathname
      setVisible(true)
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true } as any)
  }, [pathname])

  // Hide after navigation completes (path changed)
  useEffect(() => {
    if (!awaitingNav.current) return
    if (lastPath.current !== null && pathname !== lastPath.current) {
      // Give the new page a frame to paint, then hide overlay
      const id = requestAnimationFrame(() => setVisible(false))
      awaitingNav.current = false
      return () => cancelAnimationFrame(id)
    }
  }, [pathname])

  if (!visible) return null
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Memuat…</span>
      </div>
    </div>
  )
}

