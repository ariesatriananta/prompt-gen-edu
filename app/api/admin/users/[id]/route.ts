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
  return { user, supabase }
}

export async function PATCH(_: Request, { params }: any) {
  try {
    const ctx = await assertAdmin()
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await _.json()
    const { full_name, role, trial_ends_at, disabled, password } = body || {}

    // Update auth if password provided
    if (password) {
      const service = createServiceClient()
      const { error } = await service.auth.admin.updateUserById(params.id, { password })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const patch: any = {}
    if (full_name !== undefined) patch.full_name = full_name
    if (role !== undefined) patch.role = role
    if (trial_ends_at !== undefined) patch.trial_ends_at = new Date(trial_ends_at).toISOString()
    if (disabled !== undefined) patch.disabled = !!disabled

    if (Object.keys(patch).length) {
      const { error } = await ctx.supabase.from('profiles').update(patch).eq('id', params.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('id, email, full_name, role, trial_ends_at, created_at, disabled')
      .eq('id', params.id)
      .maybeSingle()

    return NextResponse.json({ ok: true, profile })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: any) {
  try {
    const ctx = await assertAdmin()
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const service = createServiceClient()
    const { error } = await service.auth.admin.deleteUser(params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
