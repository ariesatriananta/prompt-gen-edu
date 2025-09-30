import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ user: null })
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, trial_ends_at')
    .eq('id', user.id)
    .maybeSingle()
  return NextResponse.json({ user, profile })
}
