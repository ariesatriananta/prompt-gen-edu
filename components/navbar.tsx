"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wand2, Menu, PanelLeft, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
 
import { ThemeToggle } from "@/components/theme-toggle"
 
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type InitialUser = { id: string; email?: string }
type InitialProfile = { role?: string; full_name?: string; email?: string }

export function Navbar({ initialUser, initialProfile }: { initialUser?: InitialUser; initialProfile?: InitialProfile }) {
  const notifications = 3
  const [user, setUser] = useState<any>(initialUser ?? null)
  const [profile, setProfile] = useState<{ role?: string; full_name?: string; email?: string } | null>(initialProfile ?? null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', data.user.id)
          .maybeSingle()
        setProfile(p as any)
      } else {
        setProfile(null)
      }
    })
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', session.user.id)
          .maybeSingle()
        setProfile(p as any)
      } else {
        setProfile(null)
      }
      router.refresh()
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    // Serahkan proses sign-out ke route server agar cookie SSR pasti dibersihkan
    window.location.href = '/logout'
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
    document.dispatchEvent(new CustomEvent("app:toggleSidebar"))
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-2 md:px-4">
        {/* Left: Sidebar toggles + Logo */}
        <div className="flex items-center gap-2">
            <Link href="/" aria-label="Beranda" className="flex items-center gap-3 select-none">
                <div className="flex aspect-square size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Wand2 className="size-5" />
                </div>
                <span className="font-semibold">ClassToon</span>
            </Link>

          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => document.dispatchEvent(new CustomEvent("app:toggleMobileMenu"))}
                aria-label="Toggle mobile menu"
                type="button"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                aria-pressed={sidebarOpen}
                type="button"
              >
                <PanelLeft className={"h-5 w-5 transition-transform " + (sidebarOpen ? "rotate-0" : "-rotate-90 opacity-60")} />
              </Button>
            </>
          ) : null}
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="#features">Fitur</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#testimonials">Testimoni</Link>
            <Link href="#contact">Contact</Link>
          </nav> */}

          <ThemeToggle />

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-2xl" aria-label="Menu akun" type="button">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden sm:inline text-sm">{profile?.full_name || profile?.email || 'Akun'}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl">
                  <DropdownMenuLabel>
                    <div className="text-xs text-muted-foreground">Masuk sebagai</div>
                    <div className="text-sm font-medium">{profile?.email || user?.email}</div>
                    {profile?.role?.toLowerCase() === 'admin' ? (
                      <div className="mt-1">
                        <Badge className="rounded-full" variant="secondary">Admin</Badge>
                      </div>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/reset-password">Lupa Password</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Keluar...
                      </span>
                    ) : (
                      'Logout'
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Link href="/login">Login Member</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}







