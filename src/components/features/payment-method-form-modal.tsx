"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { createClient } from "@/lib/supabase/client"
import { CATEGORY_ICONS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  icon: z.string().min(1, "Please select an icon"),
})

interface PaymentMethodFormModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  paymentMethodToEdit?: {
    id: string
    name: string
    icon: string
  }
  onSuccess?: () => void
}

export function PaymentMethodFormModal({ 
  trigger, 
  open, 
  onOpenChange, 
  paymentMethodToEdit,
  onSuccess 
}: PaymentMethodFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow = isControlled ? onOpenChange! : setInternalOpen

  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: paymentMethodToEdit?.name || "",
      icon: paymentMethodToEdit?.icon || "Wallet",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      if (paymentMethodToEdit) {
        const { error } = await supabase
          .from("payment_methods")
          .update({
            name: values.name,
            icon: values.icon,
          })
          .eq("id", paymentMethodToEdit.id)
        if (error) throw error
        toast.success("Payment method updated")
      } else {
        const { error } = await supabase
          .from("payment_methods")
          .insert({
            user_id: user.id,
            name: values.name,
            icon: values.icon,
          })
        if (error) throw error
        toast.success("Payment method created")
      }

      setShow(false)
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveDialog
      open={show}
      onOpenChange={setShow}
      trigger={trigger}
      title={paymentMethodToEdit ? "Edit Payment Method" : "New Payment Method"}
      description={paymentMethodToEdit ? "Update your payment method details." : "Add a new payment method for your transactions."}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Credit Card, Cash" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {CATEGORY_ICONS.map((item) => {
                    const Icon = item.icon
                    const isSelected = field.value === item.name
                    return (
                      <div
                        key={item.name}
                        className={cn(
                          "cursor-pointer rounded-md p-2 flex items-center justify-center border transition-all hover:bg-accent",
                          isSelected ? "border-primary bg-primary/10 text-primary" : "border-transparent"
                        )}
                        onClick={() => field.onChange(item.name)}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    )
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {paymentMethodToEdit ? "Update Method" : "Create Method"}
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  )
}
