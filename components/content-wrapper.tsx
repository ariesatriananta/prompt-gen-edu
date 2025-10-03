"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ContentWrapper({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const onToggleSidebar = () => setOpen((p) => !p)
    document.addEventListener('app:toggleSidebar', onToggleSidebar as EventListener)
    return () => document.removeEventListener('app:toggleSidebar', onToggleSidebar as EventListener)
  }, [])

  return (
    <div id="main" tabIndex={-1} className={cn('pt-14', enabled && open ? 'md:pl-64' : '')}>
      {children}
    </div>
  )
}
