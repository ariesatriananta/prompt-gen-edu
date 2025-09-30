import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
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
  let profile: { role?: string; full_name?: string; email?: string } | null = null
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .maybeSingle()
    profile = (p as any) ?? null
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
          {user ? <Sidebar /> : null}
          <ContentWrapper enabled={!!user}>{children}</ContentWrapper>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
