import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database"

type Transaction = Database["public"]["Tables"]["expenses"]["Row"] & {
  category: Database["public"]["Tables"]["categories"]["Row"] | null
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
  })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [budgetData, setBudgetData] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date()
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString()

        // 1. Fetch Recent Transactions (Last 5)
        const { data: recentExpenses, error: recentError } = await supabase
          .from("expenses")
          .select(`
            *,
            category:categories(*)
          `)
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(5)

        if (recentError) throw recentError
        setTransactions(recentExpenses as Transaction[])

        // 2. Fetch All Data for Summary & Charts (Last 6 Months)
        const { data: allExpenses, error: expensesError } = await supabase
          .from("expenses")
          .select("amount, date, category:categories(name, color)")
          .eq("user_id", user.id)
          .gte("date", sixMonthsAgo)

        const { data: allIncomes, error: incomesError } = await supabase
          .from("incomes")
          .select("amount, date")
          .eq("user_id", user.id)
          .gte("date", sixMonthsAgo)

        if (expensesError) throw expensesError
        if (incomesError) throw incomesError

        // --- Calculate Summary (Current Month) ---
        const currentMonthExpenses = allExpenses?.filter(e => e.date >= startOfCurrentMonth) || []
        const currentMonthIncomes = allIncomes?.filter(i => i.date >= startOfCurrentMonth) || []

        const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0)
        const totalExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const balance = totalIncome - totalExpense
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

        setSummary({
          balance,
          income: totalIncome,
          expenses: totalExpense,
          savingsRate: Math.max(0, savingsRate),
        })

        // --- Calculate Monthly Chart Data ---
        const monthsMap: Record<string, { name: string, income: number, expense: number }> = {}
        // Init last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const key = d.toISOString().substring(0, 7) // YYYY-MM
          monthsMap[key] = {
            name: d.toLocaleString('default', { month: 'short' }),
            income: 0,
            expense: 0
          }
        }

        allExpenses?.forEach(e => {
          const key = e.date.substring(0, 7)
          if (monthsMap[key]) monthsMap[key].expense += e.amount
        })
        allIncomes?.forEach(i => {
          const key = i.date.substring(0, 7)
          if (monthsMap[key]) monthsMap[key].income += i.amount
        })

        setMonthlyData(Object.values(monthsMap))

        // --- Calculate Budget/Category Pie Chart (Current Month) ---
        // Group expenses by category
        const categoryMap: Record<string, { name: string, value: number, color: string }> = {}
        
        currentMonthExpenses.forEach(e => {
          // @ts-ignore
          const name = e.category?.name || "Uncategorized"
          // @ts-ignore
          const color = e.category?.color || "#888888"
          
          if (!categoryMap[name]) {
            categoryMap[name] = { name, value: 0, color }
          }
          categoryMap[name].value += e.amount
        })

        // Top 5 categories + Others
        const sortedCategories = Object.values(categoryMap).sort((a, b) => b.value - a.value)
        const topCategories = sortedCategories.slice(0, 4)
        const otherValue = sortedCategories.slice(4).reduce((sum, c) => sum + c.value, 0)
        
        if (otherValue > 0) {
          topCategories.push({ name: "Others", value: otherValue, color: "#cbd5e1" })
        }

        setBudgetData(topCategories)

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    loading,
    transactions,
    summary,
    monthlyData,
    budgetData
  }
}
