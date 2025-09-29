"use client"

import { useEffect, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Grid,
  FileText,
  Layers,
  BookOpen,
  Users,
  Bookmark,
  ChevronDown,
  Wand2,
  X,
  Search,
  Settings,
} from "lucide-react"

type SidebarGroup = {
  title: string
  icon: ReactNode
  badge?: string
  items?: { title: string; url: string; badge?: string }[]
  isActive?: boolean
}

const sidebarItems: SidebarGroup[] = [
  { title: "Home", icon: <Home />, isActive: true },
  {
    title: "Apps",
    icon: <Grid />,
    badge: "2",
    items: [
      { title: "All Apps", url: "#" },
      { title: "Recent", url: "#" },
      { title: "Updates", url: "#", badge: "2" },
      { title: "Installed", url: "#" },
    ],
  },
  {
    title: "Files",
    icon: <FileText />,
    items: [
      { title: "Recent", url: "#" },
      { title: "Shared with me", url: "#", badge: "3" },
      { title: "Favorites", url: "#" },
      { title: "Trash", url: "#" },
    ],
  },
  {
    title: "Projects",
    icon: <Layers />,
    badge: "4",
    items: [
      { title: "Active Projects", url: "#", badge: "4" },
      { title: "Archived", url: "#" },
      { title: "Templates", url: "#" },
    ],
  },
  {
    title: "Learn",
    icon: <BookOpen />,
    items: [
      { title: "Tutorials", url: "#" },
      { title: "Courses", url: "#" },
      { title: "Webinars", url: "#" },
      { title: "Resources", url: "#" },
    ],
  },
  {
    title: "Community",
    icon: <Users />,
    items: [
      { title: "Explore", url: "#" },
      { title: "Following", url: "#" },
      { title: "Challenges", url: "#" },
      { title: "Events", url: "#" },
    ],
  },
  {
    title: "Resources",
    icon: <Bookmark />,
    items: [
      { title: "Stock Photos", url: "#" },
      { title: "Fonts", url: "#" },
      { title: "Icons", url: "#" },
      { title: "Templates", url: "#" },
    ],
  },
]

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const onToggleSidebar = () => setSidebarOpen((prev) => !prev)
    const onToggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)
    document.addEventListener("app:toggleSidebar", onToggleSidebar as EventListener)
    document.addEventListener("app:toggleMobileMenu", onToggleMobileMenu as EventListener)
    return () => {
      document.removeEventListener("app:toggleSidebar", onToggleSidebar as EventListener)
      document.removeEventListener("app:toggleMobileMenu", onToggleMobileMenu as EventListener)
    }
  }, [])

  const toggleExpanded = (title: string) =>
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }))

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Wand2 className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">ClassToon</h2>
                <p className="text-xs text-muted-foreground">AI & Digital Tools</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                      item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => item.items && toggleExpanded(item.title)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.items && <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", expandedItems[item.title] ? "rotate-180" : "")} />}
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <a key={subItem.title} href={subItem.url} className="block rounded-xl px-2 py-1 text-sm hover:bg-muted">
                          {subItem.title}
                          {subItem.badge && (
                            <Badge variant="outline" className="ml-2 rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>John Doe</span>
                </div>
                <Badge variant="outline" className="ml-auto">Pro</Badge>
              </button>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">


          <ScrollArea className="flex-1 px-3 py-2 pt-16">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.title} className="mb-1">
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                      item.isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                    onClick={() => item.items && toggleExpanded(item.title)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.items && (
                      <ChevronDown
                        className={cn("ml-2 h-4 w-4 transition-transform", expandedItems[item.title] ? "rotate-180" : "")}
                      />
                    )}
                  </button>

                  {item.items && expandedItems[item.title] && (
                    <div className="mt-1 ml-6 space-y-1 border-l pl-3">
                      {item.items.map((subItem) => (
                        <a key={subItem.title} href={subItem.url} className="block rounded-xl px-2 py-1 text-sm hover:bg-muted">
                          {subItem.title}
                          {subItem.badge && (
                            <Badge variant="outline" className="ml-2 rounded-full px-2 py-0.5 text-xs">
                              {subItem.badge}
                            </Badge>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
