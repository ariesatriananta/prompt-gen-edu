import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!me || (me.role || '').toLowerCase() !== 'admin') return null
  return supabase
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await assertAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabase.from('member_tools').select('tool_id').eq('profile_id', params.id)
  return NextResponse.json({ toolIds: (data || []).map((d: any) => d.tool_id) })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await assertAdmin()
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const desired: string[] = body?.toolIds || []
    const { data: current = [] } = await supabase.from('member_tools').select('tool_id').eq('profile_id', params.id)
    const currentIds = new Set((current as any[]).map((r) => r.tool_id))
    const desiredIds = new Set(desired)
    const toAdd = [...desiredIds].filter((id) => !currentIds.has(id)).map((tool_id) => ({ profile_id: params.id, tool_id }))
    const toRemove = [...currentIds].filter((id) => !desiredIds.has(id))
    if (toAdd.length) await supabase.from('member_tools').insert(toAdd)
    if (toRemove.length) await supabase.from('member_tools').delete().in('tool_id', toRemove).eq('profile_id', params.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

