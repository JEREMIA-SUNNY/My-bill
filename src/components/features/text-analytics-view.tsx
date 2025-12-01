import { useMemo } from "react"
import { format, startOfMonth, endOfMonth, isSameMonth, subMonths } from "date-fns"
import { TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface TextAnalyticsViewProps {
  expenses: any[]
  incomes: any[]
}

export function TextAnalyticsView({ expenses, incomes }: TextAnalyticsViewProps) {
  const analytics = useMemo(() => {
    const today = new Date()
    const currentMonthStart = startOfMonth(today)
    
    // Filter for current month
    const currentMonthExpenses = expenses.filter(e => new Date(e.date) >= currentMonthStart)
    const currentMonthIncomes = incomes.filter(i => new Date(i.date) >= currentMonthStart)
    
    // Totals
    const totalExpense = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + Number(i.amount), 0)
    const netSavings = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // Previous Month Comparison
    const lastMonthStart = startOfMonth(subMonths(today, 1))
    const lastMonthEnd = endOfMonth(subMonths(today, 1))
    const lastMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      return d >= lastMonthStart && d <= lastMonthEnd
    })
    const lastMonthTotalExpense = lastMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const expenseChange = lastMonthTotalExpense > 0 
      ? ((totalExpense - lastMonthTotalExpense) / lastMonthTotalExpense) * 100 
      : 0

    // Largest Transaction
    const largestExpense = [...currentMonthExpenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0]
    
    // Category Analysis
    const categoryTotals: Record<string, number> = {}
    currentMonthExpenses.forEach(e => {
      const catName = e.category?.name || "Uncategorized"
      categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(e.amount)
    })
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0]

    // Daily Average
    const daysInMonth = today.getDate() // Average based on days passed so far
    const dailyAverage = totalExpense / (daysInMonth || 1)

    return {
      totalExpense,
      totalIncome,
      netSavings,
      savingsRate,
      expenseChange,
      largestExpense,
      topCategory,
      dailyAverage,
      transactionCount: currentMonthExpenses.length + currentMonthIncomes.length
    }
  }, [expenses, incomes])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Financial Health Summary */}
      <Card className="col-span-full glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Financial Health Summary (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You have earned <span className="font-bold text-emerald-500">{formatCurrency(analytics.totalIncome)}</span> and 
            spent <span className="font-bold text-rose-500">{formatCurrency(analytics.totalExpense)}</span> this month.
            Your net savings are <span className={analytics.netSavings >= 0 ? "font-bold text-emerald-500" : "font-bold text-rose-500"}>
              {formatCurrency(analytics.netSavings)}
            </span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Savings Rate</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {analytics.savingsRate.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Daily Average</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(analytics.dailyAverage)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Transactions</div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {analytics.transactionCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Insights */}
      <Card className="glass-card md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-rose-500" />
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="font-medium">Top Spending Category</p>
                <p className="text-sm text-muted-foreground">
                  Most of your money went to <span className="font-bold text-foreground">{analytics.topCategory ? analytics.topCategory[0] : "None"}</span> 
                  {analytics.topCategory && ` (${formatCurrency(analytics.topCategory[1])})`}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full">
                <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium">Largest Transaction</p>
                <p className="text-sm text-muted-foreground">
                  Your biggest single expense was <span className="font-bold text-foreground">
                    {analytics.largestExpense ? formatCurrency(analytics.largestExpense.amount) : "N/A"}
                  </span>
                  {analytics.largestExpense?.note && ` for "${analytics.largestExpense.note}"`}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Month over Month</p>
                <p className="text-sm text-muted-foreground">
                  Your spending is <span className={analytics.expenseChange > 0 ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                    {Math.abs(analytics.expenseChange).toFixed(1)}% {analytics.expenseChange > 0 ? "higher" : "lower"}
                  </span> than last month.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            Smart Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {analytics.savingsRate < 20 && (
              <li className="flex gap-2">
                <span>💡</span>
                <span>Try to increase your savings rate to at least 20% for better financial health.</span>
              </li>
            )}
            {analytics.topCategory && (
              <li className="flex gap-2">
                <span>💡</span>
                <span>Consider setting a budget for {analytics.topCategory[0]} to control spending.</span>
              </li>
            )}
            {analytics.expenseChange > 10 && (
              <li className="flex gap-2">
                <span>⚠️</span>
                <span>Your spending has increased significantly compared to last month. Review your recent transactions.</span>
              </li>
            )}
            <li className="flex gap-2">
              <span>📅</span>
              <span>You're spending an average of {formatCurrency(analytics.dailyAverage)} per day.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
