"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { createClient } from "@/lib/supabase/client"
import { useReferenceData } from "@/hooks/use-reference-data"

const formSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateBudgetModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CreateBudgetModal({ trigger, onSuccess }: CreateBudgetModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { categories, loading: loadingRefs } = useReferenceData()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      amount: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const date = new Date()
      const currentMonth = date.getMonth() + 1 // 1-12
      const currentYear = date.getFullYear()

      // Check if budget already exists for this category/month
      const { data: existing } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("category_id", values.categoryId)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("budgets")
          .update({
            amount: parseFloat(values.amount),
          })
          .eq("id", existing.id)
        if (error) throw error
        toast.success("Budget updated successfully")
      } else {
        // Create new
        const { error } = await supabase
          .from("budgets")
          .insert({
            user_id: user.id,
            category_id: values.categoryId,
            amount: parseFloat(values.amount),
            month: currentMonth,
            year: currentYear,
          })
        if (error) throw error
        toast.success("Budget set successfully")
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Failed to save budget")
    } finally {
      setSubmitting(false)
    }
  }

  const expenseCategories = categories.filter(c => c.type === "expense")

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Set Monthly Budget"
      description="Set a spending limit for a category this month."
      trigger={trigger}
    >
      <div className="p-3 md:p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm md:text-base h-10 md:h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingRefs ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">Loading...</div>
                      ) : (
                        expenseCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Amount Limit</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm md:text-base text-muted-foreground">$</span>
                      <Input 
                        placeholder="0.00" 
                        className="pl-7 text-sm md:text-base h-10 md:h-11" 
                        type="number" 
                        step="0.01"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-10 md:h-11 text-sm md:text-base" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Set Budget"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </ResponsiveDialog>
  )
}
