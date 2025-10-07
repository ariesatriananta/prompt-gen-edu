import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Parent guard untuk /tools: cukup pastikan sudah login.
// Status disabled/trial sudah dicek secara global di app/layout.tsx,
// dan hak akses per-tool dicek di layout tool masing-masing.
export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?flash=denied')
  return <>{children}</>
}
