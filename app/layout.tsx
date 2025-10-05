import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { FlashToaster } from '@/components/flash-toaster'
import PageOverlay from '@/components/page-overlay'
import { Sidebar } from '@/components/sidebar'
import { ContentWrapper } from '@/components/content-wrapper'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClassToon - AI & Digital Tools',
  description:
    'Toko online SaaS untuk generator prompt edukasi. Template siap pakai, kustomisasi fleksibel, dan hasil konsisten.',
  icons: {
    icon: '/icon.svg',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let profile: { role?: string; full_name?: string; email?: string; disabled?: boolean; trial_ends_at?: string } | null = null
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('role, full_name, email, disabled, trial_ends_at')
      .eq('id', user.id)
      .maybeSingle()
    profile = (p as any) ?? null
    const now = new Date()
    const trialExpired = !!profile?.trial_ends_at && new Date(profile!.trial_ends_at!) < now
    if (profile?.disabled || trialExpired) {
      // Kill session and redirect with flash cause for client toast
      try { await supabase.auth.signOut() } catch {}
      redirect(`/login?flash=${profile?.disabled ? 'disabled' : 'trial_expired'}`)
    }
  }

  // Compute allowed tool keys for sidebar (admin: all, member: by member_tools)
  let allowedKeys: string[] = []
  if (user) {
    const { data: tools } = await supabase.from('tools').select('id, key')
    const allKeys = (tools || []).map((t: any) => t.key as string)
    const roleLower = (profile?.role || '').toLowerCase()
    if (roleLower === 'admin') {
      allowedKeys = allKeys
    } else {
      const { data: mt } = await supabase.from('member_tools').select('tool_id').eq('profile_id', user.id)
      const allowedIds = new Set((mt || []).map((r: any) => r.tool_id))
      allowedKeys = (tools || []).filter((t: any) => allowedIds.has(t.id)).map((t: any) => t.key)
    }
  }
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <style>{`
                html {
                font-family: ${GeistSans.style.fontFamily};
                --font-sans: ${GeistSans.variable};
                --font-mono: ${GeistMono.variable};
                }
        `}</style>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar initialUser={user ? { id: user.id, email: user.email ?? undefined } : undefined} initialProfile={profile ?? undefined} />
          <FlashToaster />
          {/* Client-side short overlay for very fast transitions */}
          
          {user ? <Sidebar allowedKeys={allowedKeys} role={(profile?.role || '').toLowerCase()} /> : null}
          <ContentWrapper enabled={!!user}>{children}</ContentWrapper>
          <PageOverlay />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
