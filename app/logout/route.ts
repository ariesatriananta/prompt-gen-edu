import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
const url = new URL(req.url)
// Redirect ke origin saat ini (production/dev), bukan fallback localhost
const res = NextResponse.redirect(new URL('/', url.origin))

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
    await supabase.auth.signOut()
} catch {}

return res
}


