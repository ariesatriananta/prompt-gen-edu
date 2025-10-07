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
    // Prevent multiple clears during hydration/navigation
    if (clearedRef.current) return
    const flag = search.get('flash')
    if (!flag) return
    if (flag === 'denied') {
      toast({ variant: 'destructive', title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk mengakses halaman tersebut.' })
    } else if (flag === 'disabled') {
      toast({ variant: 'destructive', title: 'Akun dinonaktifkan', description: 'User anda dinon-aktifkan. Hubungi admin.' })
    } else if (flag === 'trial_expired') {
      toast({ variant: 'destructive', title: 'Trial berakhir', description: 'Masa trial akun anda telah berakhir.' })
    }
    // Bersihkan query agar tidak muncul saat refresh berikutnya (robust on prod)
    clearedRef.current = true
    try {
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
