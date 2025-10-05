import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsersManager from '@/components/admin/users-manager'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (me?.role ?? '').toString().toLowerCase()
  if (!me || role !== 'admin') redirect('/')

  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, trial_ends_at, created_at, disabled')
    .order('created_at', { ascending: false })

  const profiles = profilesRaw ?? []

  const { data: toolsRaw } = await supabase
    .from('tools')
    .select('id, key, name')
    .order('name')
  const tools = toolsRaw ?? []

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">User Management</h1>
      <UsersManager initialProfiles={profiles} tools={tools} />
    </main>
  )
}
