"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionsList } from "@/components/features/transactions-list"
import { AddTransactionModal } from "@/components/features/add-transaction-modal"

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your income and expenses.</p>
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
