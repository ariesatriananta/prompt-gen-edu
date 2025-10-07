import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Cek akses spesifik tool (login sudah diverifikasi di parent dan status akun dicek global)
export async function enforceToolAccess(toolKey: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?flash=denied')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = (profile?.role || '').toLowerCase()
  if (role === 'admin') return

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
