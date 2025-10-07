import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function enforceToolAccess(toolKey: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?flash=denied')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, disabled, trial_ends_at')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role || '').toLowerCase()
  const now = new Date()
  const trialExpired = !!profile?.trial_ends_at && new Date(profile.trial_ends_at as any) < now

  if (profile?.disabled || trialExpired) {
    try {
      await supabase.auth.signOut()
    } catch {}
    redirect(`/login?flash=${profile?.disabled ? 'disabled' : 'trial_expired'}`)
  }

  if (role === 'admin') return

  // Resolve tool id from key
  const { data: tool } = await supabase.from('tools').select('id').eq('key', toolKey).maybeSingle()
  if (!tool?.id) redirect('/?flash=denied')

  const { data: grant } = await supabase
    .from('member_tools')
    .select('tool_id')
    .eq('profile_id', user.id)
    .eq('tool_id', tool.id)
    .maybeSingle()

  if (!grant) redirect('/?flash=denied')
}

