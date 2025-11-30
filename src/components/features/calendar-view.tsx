"use client"

import { useEffect, useState } from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  getDay,
  startOfWeek,
  endOfWeek
} from "date-fns"
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import { getIconComponent } from "@/lib/constants"

type DailyExpense = {
  date: Date
  total: number
  transactions: any[]
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [days, setDays] = useState<DailyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DailyExpense | null>(null)
  
  const supabase = createClient()

  async function fetchMonthData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const start = format(startOfMonth(currentDate), "yyyy-MM-dd")
      const end = format(endOfMonth(currentDate), "yyyy-MM-dd")

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
          id, amount, date, note,
          category:categories(name, icon, color)
        `)
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })

      if (error) throw error

      // Aggregate by day
      const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      })

      const aggregatedDays = daysInMonth.map(day => {
        const dayExpenses = expenses?.filter(e => isSameDay(new Date(e.date), day)) || []
        const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
        
        return {
          date: day,
          total,
          transactions: dayExpenses
        }
      })

      setDays(aggregatedDays)
    } catch (error) {
      console.error("Error fetching calendar data:", error)
      toast.error("Failed to load calendar data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthData()
  }, [currentDate])

  function nextMonth() {
    setCurrentDate(addMonths(currentDate, 1))
  }

  function prevMonth() {
    setCurrentDate(subMonths(currentDate, 1))
  }

  // Calculate spending intensity for heatmap
  const maxDailySpend = Math.max(...days.map(d => d.total), 1) // Avoid divide by zero

  function getIntensityColor(total: number) {
    if (total === 0) return "bg-card hover:bg-accent"
    const ratio = total / maxDailySpend
    if (ratio < 0.2) return "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30"
    if (ratio < 0.5) return "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30"
    return "bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30"
  }

  // Generate calendar grid days (including padding for start/end of week)
  const calendarGrid = []
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const rows = []
  let daysArray = []
  let day = startDate
  let formattedDate = ""

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat)
      const cloneDay = day
      const dayData = days.find(d => isSameDay(d.date, cloneDay))
      
      daysArray.push(
        <div
          key={day.toString()}
          className={cn(
            "h-24 md:h-32 border p-2 transition-colors relative cursor-pointer flex flex-col justify-between",
            !isSameMonth(day, monthStart) ? "text-muted-foreground bg-muted/20" : getIntensityColor(dayData?.total || 0),
            isSameDay(day, new Date()) && "ring-2 ring-primary ring-inset"
          )}
          onClick={() => {
            if (dayData && dayData.transactions.length > 0) {
              setSelectedDay(dayData)
            }
          }}
        >
          <span className="text-sm font-medium">{formattedDate}</span>
          {dayData && dayData.total > 0 && (
            <div className="text-xs font-bold truncate">
              {formatCurrency(dayData.total)}
            </div>
          )}
          {dayData && dayData.transactions.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap content-end">
              {dayData.transactions.slice(0, 3).map((t, idx) => {
                // @ts-ignore
                const Icon = getIconComponent(t.category?.icon || "Wallet")
                return (
                  <div 
                    key={idx} 
                    className="h-1.5 w-1.5 rounded-full"
                    // @ts-ignore
                    style={{ backgroundColor: t.category?.color || "gray" }}
                  />
                )
              })}
              {dayData.transactions.length > 3 && (
                <span className="text-[8px] text-muted-foreground leading-none">+</span>
              )}
            </div>
          )}
        </div>
      )
      day = new Date(day.setDate(day.getDate() + 1)) // Add 1 day safely
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {daysArray}
      </div>
    )
    daysArray = []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 border-b bg-muted/50 text-center py-2 text-sm font-medium text-muted-foreground">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="divide-y">
                {rows}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Transactions for {selectedDay && format(selectedDay.date, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {selectedDay?.transactions.map((t) => {
              // @ts-ignore
              const Icon = getIconComponent(t.category?.icon || "Wallet")
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-opacity-10"
                      // @ts-ignore
                      style={{ backgroundColor: `${t.category?.color}20`, color: t.category?.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.category?.name || "Uncategorized"}</p>
                      <p className="text-xs text-muted-foreground">{t.note || "No note"}</p>
                    </div>
                  </div>
                  <span className="font-bold text-rose-500">
                    -{formatCurrency(t.amount)}
                  </span>
                </div>
              )
            })}
            <div className="pt-4 border-t flex justify-between items-center font-bold">
              <span>Total Spent</span>
              <span>{formatCurrency(selectedDay?.total || 0)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
