"use client"

import { useEffect, useState } from "react"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"
import { format, subMonths, startOfMonth } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import { CalendarView } from "@/components/features/calendar-view"
import { LoadingSpinner } from "@/components/ui/loading"
import { TextAnalyticsView } from "@/components/features/text-analytics-view"
import { generatePDFReport } from "@/lib/pdf-generator"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isWithinInterval, endOfMonth } from "date-fns"

export function AnalyticsView() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [rawExpenses, setRawExpenses] = useState<any[]>([])
  const [rawIncomes, setRawIncomes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch Monthly Trends (Last 6 months)
        const today = new Date()
        const sixMonthsAgo = subMonths(today, 5)
        const startDate = startOfMonth(sixMonthsAgo).toISOString()
        
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("amount, date, note, category:categories(name, color)")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .order("date", { ascending: true })

        const { data: incomes, error: incomesError } = await supabase
          .from("incomes")
          .select("amount, date, source")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .order("date", { ascending: true })

        if (expensesError) throw expensesError
        if (incomesError) throw incomesError

        setRawExpenses(expenses || [])
        setRawIncomes(incomes || [])

        // Process Monthly Data
        const monthsMap: Record<string, { name: string, income: number, expense: number }> = {}
        
        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
          const d = subMonths(today, i)
          const key = format(d, "yyyy-MM")
          monthsMap[key] = {
            name: format(d, "MMM"),
            income: 0,
            expense: 0
          }
        }

        expenses?.forEach(e => {
          const key = e.date.substring(0, 7) // YYYY-MM
          if (monthsMap[key]) {
            monthsMap[key].expense += Number(e.amount)
          }
        })

        incomes?.forEach(i => {
          const key = i.date.substring(0, 7)
          if (monthsMap[key]) {
            monthsMap[key].income += Number(i.amount)
          }
        })

        const sortedMonthlyData = Object.entries(monthsMap)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([_, val]) => val)

        setMonthlyData(sortedMonthlyData)

        // Process Category Data (Current Month)
        const currentMonthStart = startOfMonth(today).toISOString()
        const currentMonthExpenses = expenses?.filter(e => e.date >= currentMonthStart) || []
        
        const catMap: Record<string, { name: string, value: number, color: string }> = {}
        
        currentMonthExpenses.forEach(e => {
          // @ts-ignore
          const catName = e.category?.name || "Uncategorized"
          // @ts-ignore
          const catColor = e.category?.color || "#888888"
          
          if (!catMap[catName]) {
            catMap[catName] = { name: catName, value: 0, color: catColor }
          }
          catMap[catName].value += Number(e.amount)
        })

        setCategoryData(Object.values(catMap).sort((a, b) => b.value - a.value))

      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function handleDownload(period: 'current' | 'last' | 'last3') {
    const today = new Date()
    let start: Date
    let end: Date
    let title: string

    switch (period) {
      case 'current':
        start = startOfMonth(today)
        end = endOfMonth(today)
        title = format(today, "MMMM yyyy")
        break
      case 'last':
        start = startOfMonth(subMonths(today, 1))
        end = endOfMonth(subMonths(today, 1))
        title = format(subMonths(today, 1), "MMMM yyyy")
        break
      case 'last3':
        start = startOfMonth(subMonths(today, 2))
        end = endOfMonth(today)
        title = `Last 3 Months (${format(start, "MMM")} - ${format(end, "MMM yyyy")})`
        break
    }

    const filteredExpenses = rawExpenses.filter(e => 
      isWithinInterval(new Date(e.date), { start, end })
    )
    const filteredIncomes = rawIncomes.filter(i => 
      isWithinInterval(new Date(i.date), { start, end })
    )

    generatePDFReport(filteredExpenses, filteredIncomes, title)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownload('current')}>
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('last')}>
              Last Month
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('last3')}>
              Last 3 Months
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs md:text-sm">Categories</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
          <TabsTrigger value="text" className="text-xs md:text-sm">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Income vs Expense (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Expense Breakdown (This Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] md:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: 'none' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView />
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <TextAnalyticsView expenses={rawExpenses} incomes={rawIncomes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
