"use client"

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function FlashToaster() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const flag = search.get('flash')
    if (!flag) return
    if (flag === 'denied') {
      toast({ variant: 'destructive', title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk mengakses halaman tersebut.' })
    } else if (flag === 'disabled') {
      toast({ variant: 'destructive', title: 'Akun dinonaktifkan', description: 'User anda dinon-aktifkan. Hubungi admin.' })
    } else if (flag === 'trial_expired') {
      toast({ variant: 'destructive', title: 'Trial berakhir', description: 'Masa trial akun anda telah berakhir.' })
    }
    // Bersihkan query agar tidak muncul saat refresh berikutnya
    router.replace(pathname)
  }, [search, router, pathname])

  return null
}
