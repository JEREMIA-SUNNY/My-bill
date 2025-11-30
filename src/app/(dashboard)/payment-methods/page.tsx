"use client"

import { PaymentMethodList } from "@/components/features/payment-method-list"

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment methods (Cash, Card, UPI, etc).</p>
        </div>
      </div>
      
      <PaymentMethodList />
    </div>
  )
}
