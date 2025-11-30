"use client"

import { useEffect, useState } from "react"
import { Plus, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { format, startOfMonth, endOfMonth } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database"
import { CreateBudgetModal } from "./create-budget-modal"
import { formatCurrency, cn } from "@/lib/utils"
import { getIconComponent } from "@/lib/constants"

type BudgetWithCategory = Database["public"]["Tables"]["budgets"]["Row"] & {
  category: Database["public"]["Tables"]["categories"]["Row"] | null
}

export function BudgetList() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [expenses, setExpenses] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      
      // Use date-fns to get precise start and end of month dates formatted for DB comparison
      const startDate = format(startOfMonth(now), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(now), 'yyyy-MM-dd')

      // Fetch Budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from("budgets")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)

      if (budgetsError) throw budgetsError

      // Fetch Expenses for this month to calculate spent amount
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("amount, category_id")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)

      if (expensesError) throw expensesError

      // Aggregate expenses by category
      const expenseMap: Record<string, number> = {}
      expensesData?.forEach(e => {
        if (e.category_id) {
          expenseMap[e.category_id] = (expenseMap[e.category_id] || 0) + Number(e.amount)
        }
      })

      setBudgets(budgetsData as BudgetWithCategory[])
      setExpenses(expenseMap)
    } catch (error) {
      console.error("Error fetching budget data:", error)
      toast.error("Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading budgets...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monthly Budgets</h2>
        <CreateBudgetModal 
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Set Budget
            </Button>
          }
          onSuccess={fetchData}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No budgets set for this month.
          </div>
        ) : (
          budgets.map((budget) => {
            if (!budget.category) return null
            
            const spent = expenses[budget.category.id] || 0
            const percentage = Math.min(100, (spent / budget.amount) * 100)
            const isOverBudget = spent > budget.amount
            const Icon = getIconComponent(budget.category.icon)

            return (
              <Card key={budget.id} className="glass-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-opacity-10"
                      style={{ backgroundColor: `${budget.category.color}20`, color: budget.category.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base font-medium">
                      {budget.category.name}
                    </CardTitle>
                  </div>
                  {isOverBudget && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className={cn("font-medium", isOverBudget ? "text-destructive" : "")}>
                        {formatCurrency(spent)} <span className="text-muted-foreground">/ {formatCurrency(budget.amount)}</span>
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={cn("h-2", isOverBudget ? "bg-destructive/20" : "")}
                      indicatorClassName={cn(
                        isOverBudget ? "bg-destructive" : 
                        percentage > 80 ? "bg-yellow-500" : "bg-primary"
                      )}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{percentage.toFixed(0)}% used</span>
                      <span className={cn("font-medium", isOverBudget ? "text-destructive" : "text-emerald-500")}>
                        {isOverBudget 
                          ? `Over by ${formatCurrency(spent - budget.amount)}`
                          : `${formatCurrency(budget.amount - spent)} remaining`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
