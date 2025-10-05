import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get('key') || ''
    if (!key) return NextResponse.json({ allowed: false, error: 'Missing key' }, { status: 400 })
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ allowed: false }, { status: 200 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = (profile?.role || '').toLowerCase()
    if (role === 'admin') return NextResponse.json({ allowed: true })

    const { data: tools } = await supabase.from('tools').select('id, key').eq('key', key).maybeSingle()
    if (!tools?.id) return NextResponse.json({ allowed: false })

    const { data: mt } = await supabase
      .from('member_tools')
      .select('tool_id')
      .eq('profile_id', user.id)
      .eq('tool_id', tools.id)
      .maybeSingle()
    return NextResponse.json({ allowed: !!mt })
  } catch (e: any) {
    return NextResponse.json({ allowed: false, error: e?.message || 'Internal error' }, { status: 500 })
  }
}

