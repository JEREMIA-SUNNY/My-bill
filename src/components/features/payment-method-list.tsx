"use client"

import { useEffect, useState } from "react"
import { Plus, MoreVertical, Pencil, Trash2, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { getIconComponent } from "@/lib/constants"
import { PaymentMethodFormModal } from "./payment-method-form-modal"

type PaymentMethod = {
  id: string
  name: string
  icon: string
}

export function PaymentMethodList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const supabase = createClient()

  async function fetchPaymentMethods() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast.error("Failed to load payment methods")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this payment method?")) return

    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)

      if (error) throw error
      
      toast.success("Payment method deleted")
      fetchPaymentMethods()
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast.error("Failed to delete payment method")
    }
  }

  if (loading) {
    return <div>Loading payment methods...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Payment Methods</h2>
        <PaymentMethodFormModal 
          trigger={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Method
            </Button>
          }
          onSuccess={fetchPaymentMethods}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            No payment methods found. Add one to start tracking expenses.
          </div>
        ) : (
          paymentMethods.map((method) => {
            const Icon = getIconComponent(method.icon)
            
            return (
              <Card key={method.id} className="glass-card hover:bg-accent/5 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{method.name}</span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingMethod(method)
                        setIsEditOpen(true)
                      }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <PaymentMethodFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        paymentMethodToEdit={editingMethod!}
        onSuccess={() => {
          fetchPaymentMethods()
          setEditingMethod(null)
        }}
      />
    </div>
  )
}
