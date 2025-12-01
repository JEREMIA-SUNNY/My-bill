"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Receipt, PieChart, Settings, Wallet, LogOut, User, CreditCard, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: PieChart,
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: Wallet,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Wallet,
  },
  {
    title: "Payment Methods",
    href: "/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Meal Plan",
    href: "/meal-plan",
    icon: Utensils,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            M
          </div>
          MyBill
        </div>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-base font-medium",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="p-4 mt-auto">
        <Separator className="my-4" />
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <LogOut 
            className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" 
            onClick={handleSignOut}
          />
        </div>
      </div>
    </div>
  )
}
