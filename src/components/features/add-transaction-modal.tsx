import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"

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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { toast } from "sonner"
import { predictCategory } from "@/lib/smart-categorization"
import { useReferenceData } from "@/hooks/use-reference-data"
import { createClient } from "@/lib/supabase/client"
import { getIconComponent } from "@/lib/constants"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.string().optional(),
  date: z.date(),
  note: z.string().optional(),
  isRecurring: z.boolean().optional(),
  paymentMethodId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function AddTransactionModal({ 
  trigger, 
  transactionToEdit,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: { 
  trigger?: React.ReactNode
  transactionToEdit?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = setControlledOpen || setInternalOpen

  const [type, setType] = useState<"expense" | "income">("expense")
  const [submitting, setSubmitting] = useState(false)
  
  const { categories, paymentMethods, loading: loadingRefs } = useReferenceData()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      date: new Date(),
      isRecurring: false,
      note: "",
      categoryId: "",
      paymentMethodId: "",
    },
  })

  // Initialize form with transaction data when editing
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type)
      form.reset({
        amount: transactionToEdit.amount.toString(),
        date: new Date(transactionToEdit.date),
        isRecurring: transactionToEdit.is_recurring || false,
        note: transactionToEdit.note || "",
        categoryId: transactionToEdit.category?.id || "", // Note: This assumes transactionToEdit has nested category object with id, or we need to handle flat structure
        paymentMethodId: transactionToEdit.payment_method?.id || "",
      })
      
      // If the transaction object structure from the list is different (e.g. joined tables), we might need to adjust.
      // The Transaction type in list has category: { name, icon, color } but maybe not ID if it was a join without ID.
      // Let's check the fetch query in TransactionsList.
      // It selects: category:categories(name, icon, color). It DOES NOT select ID!
      // This is a problem. We need the category ID to pre-fill the form.
    }
  }, [transactionToEdit, form])

  // Smart Categorization (only for new transactions or when note changes)
  const noteValue = form.watch("note")
  useEffect(() => {
    if (!transactionToEdit && noteValue && categories.length > 0) {
      const predictedId = predictCategory(noteValue, categories)
      if (predictedId) {
        const currentCategory = form.getValues("categoryId")
        if (!currentCategory) {
          form.setValue("categoryId", predictedId)
          toast.info("Category auto-selected based on note", { duration: 2000 })
        }
      }
    }
  }, [noteValue, categories, form, transactionToEdit])

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      if (type === "expense") {
        if (!values.categoryId) {
          form.setError("categoryId", { message: "Category is required" })
          setSubmitting(false)
          return
        }
        if (!values.paymentMethodId) {
          form.setError("paymentMethodId", { message: "Payment method is required" })
          setSubmitting(false)
          return
        }

        const transactionData = {
          amount: parseFloat(values.amount),
          category_id: values.categoryId,
          payment_method_id: values.paymentMethodId,
          date: format(values.date, "yyyy-MM-dd"),
          note: values.note || null,
          is_recurring: values.isRecurring || false,
        }

        if (transactionToEdit) {
          const { error } = await supabase
            .from("expenses")
            .update(transactionData)
            .eq("id", transactionToEdit.id)
          if (error) throw error
          toast.success("Expense updated successfully!")
        } else {
          const { error } = await supabase.from("expenses").insert({
            user_id: user.id,
            ...transactionData
          })
          if (error) throw error
          toast.success("Expense added successfully!")
        }
      } else {
        // For income
        let source = values.note || "Income"
        if (values.categoryId) {
          const category = categories.find(c => c.id === values.categoryId)
          if (category) {
            source = category.name
          }
        }

        const transactionData = {
          amount: parseFloat(values.amount),
          source: source,
          date: format(values.date, "yyyy-MM-dd"),
          is_recurring: values.isRecurring || false,
        }

        if (transactionToEdit) {
          const { error } = await supabase
            .from("incomes")
            .update(transactionData)
            .eq("id", transactionToEdit.id)
          if (error) throw error
          toast.success("Income updated successfully!")
        } else {
          const { error } = await supabase.from("incomes").insert({
            user_id: user.id,
            ...transactionData
          })
          if (error) throw error
          toast.success("Income added successfully!")
        }
      }

      setOpen(false)
      form.reset()
      window.location.reload() 
    } catch (error: any) {
      toast.error(error.message || "Failed to save transaction")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCategories = categories.filter(c => c.type === type)

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title={transactionToEdit ? "Edit Transaction" : `Add ${type === "expense" ? "Expense" : "Income"}`}
      description={transactionToEdit ? "Update transaction details" : "Track your financial activity"}
      trigger={
        trigger || (
          <Button size="lg" className="rounded-full shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        )
      }
    >
      <div className="space-y-3 md:space-y-4 py-3 md:py-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-4 md:mb-6">
          <Button
            variant={type === "expense" ? "default" : "outline"}
            onClick={() => setType("expense")}
            className="w-28 md:w-32 text-sm md:text-base h-9 md:h-10"
          >
            Expense
          </Button>
          <Button
            variant={type === "income" ? "default" : "outline"}
            onClick={() => setType("income")}
            className="w-28 md:w-32 text-sm md:text-base h-9 md:h-10"
          >
            Income
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm md:text-base text-muted-foreground"></span>
                      <Input 
                        placeholder="0.00" 
                        className="pl-7 text-base md:text-lg font-semibold h-10 md:h-11" 
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className={type === "income" ? "md:col-span-2" : ""}>
                    <FormLabel className="text-sm md:text-base">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm md:text-base h-10 md:h-11">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingRefs ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">Loading...</div>
                        ) : filteredCategories.length === 0 ? (
                           <div className="p-2 text-center text-xs text-muted-foreground">No categories found</div>
                        ) : (
                          filteredCategories.map((category) => {
                            const Icon = getIconComponent(category.icon)
                            return (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" style={{ color: category.color }} />
                                  {category.name}
                                </span>
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === "expense" && (
                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Payment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-sm md:text-base h-10 md:h-11">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingRefs ? (
                            <div className="p-2 text-center text-xs text-muted-foreground">Loading...</div>
                          ) : (
                            paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm md:text-base">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-10 md:h-11 text-sm md:text-base",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was this for?"
                      className="resize-none text-sm md:text-base min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-sm md:text-base">Recurring</FormLabel>
                <div className="text-[0.7rem] md:text-[0.8rem] text-muted-foreground">
                  Repeat this transaction monthly
                </div>
              </div>
              <FormControl>
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </FormControl>
            </div>

            <Button type="submit" className="w-full h-11 md:h-12 text-base md:text-lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </ResponsiveDialog>
  )
}
