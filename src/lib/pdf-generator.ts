import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { formatCurrency } from "./utils"

interface Transaction {
  amount: number
  date: string
  note?: string
  source?: string
  category?: {
    name: string
    color: string
  }
}

export const generatePDFReport = (
  expenses: Transaction[],
  incomes: Transaction[],
  period: string
) => {
  const doc = new jsPDF()

  // --- Header ---
  doc.setFontSize(22)
  doc.setTextColor(40, 40, 40)
  doc.text("Financial Report", 14, 20)

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Period: ${period}`, 14, 30)
  doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 36)

  // --- Summary Section ---
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netSavings = totalIncome - totalExpense

  doc.setDrawColor(200, 200, 200)
  doc.line(14, 45, 196, 45)

  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text("Summary", 14, 55)

  const summaryData = [
    ["Total Income", formatCurrency(totalIncome)],
    ["Total Expense", formatCurrency(totalExpense)],
    ["Net Savings", formatCurrency(netSavings)]
  ]

  autoTable(doc, {
    startY: 60,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 50 }
    },
    didParseCell: (data) => {
      if (data.row.index === 0) data.cell.styles.textColor = [16, 185, 129] // Emerald
      if (data.row.index === 1) data.cell.styles.textColor = [244, 63, 94] // Rose
      if (data.row.index === 2) {
        data.cell.styles.textColor = netSavings >= 0 ? [16, 185, 129] : [244, 63, 94]
        data.cell.styles.fontStyle = 'bold'
      }
    }
  })

  // --- Category Breakdown (Expenses) ---
  const categoryTotals: Record<string, number> = {}
  expenses.forEach(e => {
    const catName = e.category?.name || "Uncategorized"
    categoryTotals[catName] = (categoryTotals[catName] || 0) + Number(e.amount)
  })

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)

  let finalY = (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text("Expense Breakdown by Category", 14, finalY)

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Category', 'Amount', '% of Total']],
    body: sortedCategories.map(([name, amount]) => [
      name,
      formatCurrency(amount),
      `${((amount / totalExpense) * 100).toFixed(1)}%`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [63, 63, 70] }, // Zinc-700
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  })

  // --- Detailed Transactions (Grouped by Category) ---
  finalY = (doc as any).lastAutoTable.finalY + 15
  
  // Check if we need a new page
  if (finalY > 250) {
    doc.addPage()
    finalY = 20
  }

  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text("Detailed Expenses", 14, finalY)
  
  // Group expenses by category for the detailed list
  const expensesByCategory: Record<string, Transaction[]> = {}
  expenses.forEach(e => {
    const catName = e.category?.name || "Uncategorized"
    if (!expensesByCategory[catName]) expensesByCategory[catName] = []
    expensesByCategory[catName].push(e)
  })

  let currentY = finalY + 5

  Object.entries(expensesByCategory).sort().forEach(([category, items]) => {
    // Check space
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    // Category Header
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "bold")
    doc.text(category, 14, currentY + 5)
    
    autoTable(doc, {
      startY: currentY + 8,
      head: [['Date', 'Note', 'Amount']],
      body: items
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(item => [
          format(new Date(item.date), "MMM dd, yyyy"),
          item.note || "-",
          formatCurrency(item.amount)
        ]),
      theme: 'grid',
      headStyles: { fillColor: [244, 63, 94], fontSize: 9 }, // Rose color for headers
      styles: { fontSize: 9 },
      columnStyles: {
        2: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14 }
    })

    currentY = (doc as any).lastAutoTable.finalY + 5
  })

  // Save the PDF
  doc.save(`Financial_Report_${period.replace(/\s+/g, '_')}.pdf`)
}
