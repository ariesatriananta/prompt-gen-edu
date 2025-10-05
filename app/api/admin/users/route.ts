import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function assertAdmin() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!me || (me.role || '').toLowerCase() !== 'admin') return null
  return user
}

export async function POST(req: Request) {
  try {
    const adminUser = await assertAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { email, password, full_name, role = 'member', trial_ends_at, disabled } = body || {}
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })

    const service = createServiceClient()
    const { data: created, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw error

    const uid = created.user?.id
    if (!uid) return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })

    // Upsert profiles to apply role/full_name/trial/disabled if provided
    const profilePatch: any = { id: uid, email, role }
    if (full_name != null) profilePatch.full_name = full_name
    if (trial_ends_at != null) profilePatch.trial_ends_at = new Date(trial_ends_at).toISOString()
    if (disabled != null) profilePatch.disabled = !!disabled

    const supabase = await createServerSupabase()
    await supabase.from('profiles').upsert(profilePatch)

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, trial_ends_at, created_at, disabled')
      .eq('id', uid)
      .maybeSingle()

    return NextResponse.json({ user: created.user, profile })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const adminUser = await assertAdmin()
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, trial_ends_at, created_at, disabled')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ profiles: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
