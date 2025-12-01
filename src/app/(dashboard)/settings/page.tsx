"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, LogOut, User, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/loading"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Appearance</CardTitle>
            <CardDescription className="text-xs md:text-sm">Customize how the app looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Select your preferred theme (Light/Dark)
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Account</CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="h-12 w-12 md:h-16 md:w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-base md:text-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-base md:text-lg truncate">{user?.user_metadata?.full_name || "User"}</h3>
                <div className="flex items-center text-muted-foreground text-xs md:text-sm">
                  <Mail className="mr-2 h-3 w-3 md:h-4 md:w-4 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>
            </div>
            
            <Separator />

            <div className="space-y-1">
              <Label>User ID</Label>
              <div className="text-xs md:text-sm text-muted-foreground font-mono bg-muted p-2 rounded break-all">
                {user?.id}
              </div>
            </div>

            <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
