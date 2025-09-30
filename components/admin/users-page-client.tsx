"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import UsersManager from '@/components/admin/users-manager'

export default function UsersPageClient() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [tools, setTools] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return router.replace('/login')

      const { data: me } = await supabase.from('profiles').select('role').eq('id', userData.user.id).maybeSingle()
      if (!me || (me.role || '').toLowerCase() !== 'admin') return router.replace('/')

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, trial_ends_at, created_at')
        .order('created_at', { ascending: false })
      setProfiles(profilesData || [])

      const { data: toolsData } = await supabase.from('tools').select('id, key, name').order('name')
      setTools(toolsData || [])

      setReady(true)
    }
    load()
  }, [router, supabase])

  if (!ready) return <main className="mx-auto max-w-6xl px-4 py-10">Memuat…</main>
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">User Management</h1>
      <UsersManager initialProfiles={profiles as any} tools={tools as any} />
    </main>
  )
}

