"use client"

import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'

export default function StorypromptPage() {
  const [accessChecked, setAccessChecked] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/tools/access?key=storyprompt', { cache: 'no-store' })
        const json = await res.json()
        if (!json?.allowed) {
          toast({ variant: 'destructive', title: 'Akses ditolak', description: 'Anda tidak memiliki akses ke tool ini.' })
          window.location.href = '/?flash=denied'
          return
        }
        setAccessChecked(true)
      } catch {
        toast({ variant: 'destructive', title: 'Gagal memeriksa akses', description: 'Coba lagi nanti.' })
        window.location.href = '/?flash=denied'
      }
    })()
  }, [])
  if (!accessChecked) return null
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Storyprompt</h1>
      <p className="mt-2 text-muted-foreground">Halaman Storyprompt akan segera diisi.</p>
    </main>
  )
}
