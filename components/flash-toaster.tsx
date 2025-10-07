"use client"

import { useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function FlashToaster() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const clearedRef = useRef(false)

  useEffect(() => {
    if (clearedRef.current) return
    // Read from cookie first for robustness on prod redirects
    let flag: string | null = null
    try {
      if (typeof document !== 'undefined') {
        const m = document.cookie.match(/(?:^|; )flash=([^;]+)/)
        if (m) flag = decodeURIComponent(m[1])
      }
    } catch {}
    // Fallback to query param
    if (!flag) flag = search.get('flash')
    if (!flag) return
    if (flag === 'denied') {
      toast({ variant: 'destructive', title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk mengakses halaman tersebut.' })
    } else if (flag === 'disabled') {
      toast({ variant: 'destructive', title: 'Akun dinonaktifkan', description: 'User anda dinon-aktifkan. Hubungi admin.' })
    } else if (flag === 'trial_expired') {
      toast({ variant: 'destructive', title: 'Trial berakhir', description: 'Masa trial akun anda telah berakhir.' })
    }
    // Bersihkan cookie + query agar tidak muncul saat refresh berikutnya
    clearedRef.current = true
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'flash=; Max-Age=0; path=/'
      }
      // Defer replace to next tick to avoid race during mount
      setTimeout(() => {
        try {
          router.replace(pathname)
        } catch {
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', pathname)
          }
        }
      }, 0)
    } catch {}
  }, [search, router, pathname])

  return null
}
