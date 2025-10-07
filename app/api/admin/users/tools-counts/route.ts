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

export async function GET() {
  try {
    const supabase = await assertAdmin()
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase.from('member_tools').select('profile_id')
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const counts: Record<string, number> = {}
    ;(data || []).forEach((r: any) => {
      counts[r.profile_id] = (counts[r.profile_id] || 0) + 1
    })
    return NextResponse.json({ counts })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

