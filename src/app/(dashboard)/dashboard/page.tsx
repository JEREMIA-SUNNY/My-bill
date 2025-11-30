"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Calendar, PiggyBank } from "lucide-react"
import { AddTransactionModal } from "@/components/features/add-transaction-modal"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { formatCurrency, cn } from "@/lib/utils"
import { DashboardCharts } from "@/components/features/dashboard-charts"

export default function DashboardPage() {
  const { loading, transactions, summary, monthlyData, budgetData } = useDashboardData()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary).map(([key, value], index) => (
          <motion.div
            key={key}
            variants={item}
          >
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </CardTitle>
                {key === "balance" && <Wallet className="h-4 w-4 text-muted-foreground" />}
                {key === "income" && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                {key === "expenses" && <ArrowDownRight className="h-4 w-4 text-rose-500" />}
                {key === "savingsRate" && <PiggyBank className="h-4 w-4 text-blue-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {key === "savingsRate" ? `${value.toFixed(1)}%` : formatCurrency(value)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {key === "savingsRate" ? "of income saved" : "Current month"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <DashboardCharts 
        transactions={transactions} 
        summary={summary} 
        monthlyData={monthlyData}
        budgetData={budgetData}
      />

      <motion.div variants={item}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors border border-border/50">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium leading-none text-sm md:text-base truncate">{t.category?.name || "Uncategorized"}</p>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                          {t.note || "No note"}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "font-bold text-sm md:text-base whitespace-nowrap ml-2",
                      t.category?.type === 'income' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {t.category?.type === 'income' ? "+" : "-"}{formatCurrency(t.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
