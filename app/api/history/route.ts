import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getUserAndRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, role: null }
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = (prof?.role || '').toLowerCase()
  return { supabase, user, role }
}

export async function GET(req: Request) {
  try {
    const { supabase, user, role } = await getUserAndRole()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const url = new URL(req.url)
    const tool = url.searchParams.get('tool') || undefined
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const from = parseInt(url.searchParams.get('from') || '0', 10)
    const q = url.searchParams.get('q') || ''
    const start = url.searchParams.get('start') || ''
    const end = url.searchParams.get('end') || ''

    let query = supabase.from('prompt_logs').select('id, created_at, tool_key, subject, grade, style, topic, scene_count, status, error_message').order('created_at', { ascending: false })
    if (role !== 'admin') {
      query = query.eq('user_id', user.id)
    }
    if (tool) query = query.eq('tool_key', tool)
    if (q) query = query.ilike('topic', `%${q}%`)
    if (start) query = query.gte('created_at', new Date(start).toISOString())
    if (end) query = query.lte('created_at', new Date(end).toISOString())
    const { data, error } = await query.range(from, from + limit - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ items: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { supabase, user } = await getUserAndRole()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const payload: any = {
      user_id: user.id,
      tool_key: String(body.tool_key || 'motionprompt'),
      subject: body.subject ?? null,
      grade: body.grade ?? null,
      style: body.style ?? null,
      topic: body.topic ?? null,
      story: body.story ?? null,
      negative: body.negative ?? null,
      scene_count: body.scene_count ?? null,
      model: body.model ?? null,
      prompt: body.prompt ?? null,
      response_json: body.response_json ?? null,
      response_text: body.response_text ?? null,
      status: body.status ?? 'ok',
      error_message: body.error_message ?? null,
      duration_ms: body.duration_ms ?? null,
      meta: body.meta ?? null,
    }
    const { data, error } = await supabase.from('prompt_logs').insert(payload).select('id').maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
