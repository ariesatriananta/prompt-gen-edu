"use client"

import { Wand2, Cloud, MessageSquare, Bell, Menu, PanelLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Plus } from "lucide-react"

export function Navbar() {
  const notifications = 3

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-2 md:px-4">
        {/* Left: Sidebar toggles + Logo */}
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 select-none">
                <div className="flex aspect-square size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Wand2 className="size-5" />
                </div>
                <span className="font-semibold">ClassToon</span>
            </Link>

          {/* <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => document.dispatchEvent(new CustomEvent("app:toggleMobileMenu"))}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => document.dispatchEvent(new CustomEvent("app:toggleSidebar"))}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button> */}
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="#features">Fitur</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#testimonials">Testimoni</Link>
            <Link href="#contact">Contact</Link>
          </nav>

          <ThemeToggle />

          <Button asChild className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Link href="/login">Coba Gratis</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
