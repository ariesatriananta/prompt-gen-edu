import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?flash=denied')

  // Cek status akun: disabled / trial berakhir
  const { data: profile } = await supabase
    .from('profiles')
    .select('disabled, trial_ends_at')
    .eq('id', user.id)
    .maybeSingle()

  const now = new Date()
  const trialExpired = !!profile?.trial_ends_at && new Date(profile.trial_ends_at as any) < now

  if (profile?.disabled || trialExpired) {
    try {
      await supabase.auth.signOut()
    } catch {}
    redirect(`/login?flash=${profile?.disabled ? 'disabled' : 'trial_expired'}`)
  }

  return <>{children}</>
}

