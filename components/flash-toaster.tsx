"use client"

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

export function FlashToaster() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const flag = search.get('flash')
    if (!flag) return
    if (flag === 'denied') {
      toast({ variant: 'destructive', title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk mengakses halaman tersebut.' })
    }
    // Bersihkan query agar tidak muncul saat refresh berikutnya
    router.replace(pathname)
  }, [search, router, pathname])

  return null
}

