import { BudgetList } from "@/components/features/budget-list"

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits for the current month.</p>
        </div>
      </div>
      
      <BudgetList />
    </div>
  )
}
