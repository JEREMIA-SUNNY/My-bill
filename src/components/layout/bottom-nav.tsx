"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Receipt, PieChart, Settings, Plus, Wallet, Menu, CreditCard, LogOut, X, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AddTransactionModal } from "@/components/features/add-transaction-modal"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { Separator } from "@/components/ui/separator"

const navItems = [
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
    title: "Add",
    href: "/add",
    icon: Plus,
    isFab: true,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: PieChart,
  },
  {
    title: "Menu",
    href: "#",
    icon: Menu,
    isMenu: true,
  },
]

const menuItems = [
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

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-t border-border md:hidden">
      <div className="grid h-full grid-cols-5 mx-auto max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.isFab) {
            return (
              <div key={item.title} className="flex items-center justify-center -mt-6">
                <AddTransactionModal 
                  trigger={
                    <Button
                      size="icon"
                      className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="sr-only">Add New</span>
                    </Button>
                  }
                />
              </div>
            )
          }

          if (item.isMenu) {
            return (
              <Sheet key={item.title}>
                <SheetTrigger asChild>
                  <div className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground">
                    <item.icon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium truncate max-w-full">
                      {item.title}
                    </span>
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        M
                      </div>
                      MyBill Menu
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 mt-6">
                    {menuItems.map((menuItem) => (
                      <SheetClose key={menuItem.href} asChild>
                        <Link href={menuItem.href}>
                          <Button
                            variant={pathname === menuItem.href ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 h-12 text-base"
                          >
                            <menuItem.icon className="h-5 w-5" />
                            {menuItem.title}
                          </Button>
                        </Link>
                      </SheetClose>
                    ))}
                    
                    <Separator className="my-2" />
                    
                    <SheetClose asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            )
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
              <span className="text-[10px] font-medium truncate max-w-full">
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
