"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionsList } from "@/components/features/transactions-list"
import { AddTransactionModal } from "@/components/features/add-transaction-modal"

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and manage all your income and expenses.</p>
        </div>
        <AddTransactionModal 
          trigger={
            <Button size="lg" className="gap-2 md:block hidden">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          }
        />
      </div>
      
      <TransactionsList />
    </div>
  )
}
