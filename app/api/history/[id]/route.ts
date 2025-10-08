import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Check admin
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = (prof?.role || '').toLowerCase() === 'admin'
    let query = supabase.from('prompt_logs').delete().eq('id', params.id)
    if (!isAdmin) query = query.eq('user_id', user.id)
    const { error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = (prof?.role || '').toLowerCase() === 'admin'
    let query = supabase
      .from('prompt_logs')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()
    if (!isAdmin) query = query.eq('user_id', user.id)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
