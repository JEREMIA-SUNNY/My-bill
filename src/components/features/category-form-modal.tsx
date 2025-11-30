"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Check } from "lucide-react"
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
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["income", "expense"]),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormModalProps {
  trigger?: React.ReactNode
  category?: {
    id: string
    name: string
    type: "income" | "expense"
    color: string
    icon: string
  }
  onSuccess?: () => void
}

export function CategoryFormModal({ trigger, category, onSuccess }: CategoryFormModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "expense",
      color: category?.color || CATEGORY_COLORS[0],
      icon: category?.icon || "Wallet",
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

      if (category) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({
            name: values.name,
            type: values.type,
            color: values.color,
            icon: values.icon,
          })
          .eq("id", category.id)
        
        if (error) throw error
        toast.success("Category updated successfully")
      } else {
        // Create
        const { error } = await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: values.name,
            type: values.type,
            color: values.color,
            icon: values.icon,
            is_default: false,
          })

        if (error) throw error
        toast.success("Category created successfully")
      }

      setOpen(false)
      form.reset()
      if (onSuccess) onSuccess()
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to save category")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title={category ? "Edit Category" : "New Category"}
      description="Customize your category details"
      trigger={trigger}
    >
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORY_COLORS.map((color) => (
                        <div
                          key={color}
                          className={cn(
                            "h-8 w-8 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center",
                            field.value === color ? "ring-2 ring-offset-2 ring-primary" : ""
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        >
                          {field.value === color && <Check className="h-4 w-4 text-white" />}
                        </div>
                      ))}
                    </div>
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
                  <FormControl>
                    <div className="grid grid-cols-5 gap-3 max-h-[200px] overflow-y-auto p-1">
                      {CATEGORY_ICONS.map(({ name, icon: Icon }) => (
                        <div
                          key={name}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer border hover:bg-accent transition-colors",
                            field.value === name ? "border-primary bg-primary/10" : "border-transparent"
                          )}
                          onClick={() => field.onChange(name)}
                        >
                          <Icon className="h-6 w-6 mb-1" />
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Category"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </ResponsiveDialog>
  )
}
