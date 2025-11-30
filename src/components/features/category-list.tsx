"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database"
import { CategoryFormModal } from "./category-form-modal"
import { getIconComponent } from "@/lib/constants"

type Category = Database["public"]["Tables"]["categories"]["Row"]

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function fetchCategories() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
      toast.success("Category deleted")
      fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>
  }

  const expenseCategories = categories.filter(c => c.type === "expense")
  const incomeCategories = categories.filter(c => c.type === "income")

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <CategoryFormModal 
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Category
            </Button>
          }
          onSuccess={fetchCategories}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Expense Categories</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => {
              const Icon = getIconComponent(category.icon)
              return (
                <Card key={category.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5" 
                    style={{ backgroundColor: category.color }} 
                  />
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 pl-2">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center bg-opacity-10"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    
                    {!category.is_default && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <CategoryFormModal 
                            category={category} 
                            onSuccess={fetchCategories}
                            trigger={
                              <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </div>
                            }
                          />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Income Categories</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => {
              const Icon = getIconComponent(category.icon)
              return (
                <Card key={category.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5" 
                    style={{ backgroundColor: category.color }} 
                  />
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 pl-2">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center bg-opacity-10"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    
                    {!category.is_default && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <CategoryFormModal 
                            category={category} 
                            onSuccess={fetchCategories}
                            trigger={
                              <div className="relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </div>
                            }
                          />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
