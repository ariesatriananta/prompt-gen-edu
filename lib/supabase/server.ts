import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server client (SSR). Await cookies() to comply with Next.js dynamic APIs.
export const createClient = async () => {
  const cookieStore: any = await (cookies() as any)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {}
        },
      },
    },
  )
}
