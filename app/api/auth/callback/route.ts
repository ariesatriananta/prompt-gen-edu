import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ event: null, session: null }))
  const { event, session } = body as { event: string | null; session: any }

  // Create a response we can write cookies to
  const res = NextResponse.json({ ok: true })

  // Create a server client wired to this response's cookies
  const cookieStore: any = await (cookies() as any)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          res.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    },
  )

  try {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      if (session) await supabase.auth.setSession(session)
    }
    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    }
  } catch {}

  return res
}
