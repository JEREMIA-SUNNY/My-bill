import { CategoryList } from "@/components/features/category-list"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your expense and income categories.</p>
        </div>
      </div>
      
      <CategoryList />
    </div>
  )
}
