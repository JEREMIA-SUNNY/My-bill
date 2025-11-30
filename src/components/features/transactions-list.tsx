"use client"

import { useEffect, useState } from "react"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, Trash2, Edit, Calendar as CalendarIcon, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import { Database } from "@/types/database"
import { getIconComponent } from "@/lib/constants"

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  note: string | null
  category?: { name: string, icon: string, color: string } | null
  source?: string | null
  payment_method?: { name: string, icon: string } | null
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPayment, setFilterPayment] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  
  const supabase = createClient()

  async function fetchTransactions() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
      
      setCategories(categoriesData || [])

      // Fetch Payment Methods
      const { data: paymentMethodsData } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
      
      setPaymentMethods(paymentMethodsData || [])

      // Fetch Expenses
      let expensesQuery = supabase
        .from("expenses")
        .select(`
          id, amount, date, note,
          category:categories(name, icon, color),
          payment_method:payment_methods(name, icon)
        `)
        .eq("user_id", user.id)

      if (dateRange.from) {
        expensesQuery = expensesQuery.gte("date", format(dateRange.from, "yyyy-MM-dd"))
      }
      if (dateRange.to) {
        expensesQuery = expensesQuery.lte("date", format(dateRange.to, "yyyy-MM-dd"))
      }

      const { data: expenses, error: expensesError } = await expensesQuery.order("date", { ascending: false })

      // Fetch Incomes
      let incomesQuery = supabase
        .from("incomes")
        .select("id, amount, date, source")
        .eq("user_id", user.id)

      if (dateRange.from) {
        incomesQuery = incomesQuery.gte("date", format(dateRange.from, "yyyy-MM-dd"))
      }
      if (dateRange.to) {
        incomesQuery = incomesQuery.lte("date", format(dateRange.to, "yyyy-MM-dd"))
      }

      const { data: incomes, error: incomesError } = await incomesQuery.order("date", { ascending: false })

      if (expensesError) throw expensesError
      if (incomesError) throw incomesError

      // Combine and Sort
      const combined: Transaction[] = [
        ...(expenses?.map(e => ({ ...e, type: 'expense' } as unknown as Transaction)) || []),
        ...(incomes?.map(i => ({ ...i, type: 'income', note: i.source } as unknown as Transaction)) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setTransactions(combined)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [dateRange])

  async function handleDelete(id: string, type: 'income' | 'expense') {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    try {
      const table = type === 'expense' ? 'expenses' : 'incomes'
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
      
      toast.success("Transaction deleted")
      fetchTransactions()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction")
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.note || t.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || t.type === filterType
    const matchesCategory = filterCategory === "all" || (t.type === 'expense' && t.category?.name === filterCategory)
    const matchesPayment = filterPayment === "all" || (t.payment_method?.name === filterPayment)
    
    return matchesSearch && matchesType && matchesCategory && matchesPayment
  })

  const activeFiltersCount = [
    filterType !== "all",
    filterCategory !== "all",
    filterPayment !== "all",
    dateRange.from || dateRange.to
  ].filter(Boolean).length

  function clearFilters() {
    setFilterType("all")
    setFilterCategory("all")
    setFilterPayment("all")
    setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    setSearchTerm("")
  }

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by note or category..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c.type === 'expense').map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map(pm => (
                  <SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 md:w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
                  >
                    This Month
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setDateRange({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) })}
                  >
                    Last Month
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Note</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const Icon = transaction.category ? getIconComponent(transaction.category.icon) : (transaction.type === 'income' ? ArrowUpRight : ArrowDownRight)
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(transaction.date), "MMM d")}
                        <div className="text-xs text-muted-foreground md:hidden">
                          {format(new Date(transaction.date), "yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-opacity-10 shrink-0"
                            style={{ 
                              backgroundColor: transaction.category?.color ? `${transaction.category.color}20` : (transaction.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'),
                              color: transaction.category?.color || (transaction.type === 'income' ? '#10b981' : '#f43f5e')
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">
                              {transaction.type === 'income' ? (transaction.source || "Income") : (transaction.category?.name || "Uncategorized")}
                            </span>
                            {/* Show note on mobile below category */}
                            {transaction.note && (
                              <span className="text-xs text-muted-foreground md:hidden truncate max-w-[120px]">
                                {transaction.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                        {transaction.note}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.payment_method ? (
                          <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                            {transaction.payment_method.icon}
                            {transaction.payment_method.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-bold whitespace-nowrap",
                        transaction.type === 'income' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {transaction.type === 'income' ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(transaction.id, transaction.type)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredTransactions.length} transactions</p>
      </div>
    </div>
  )
}
