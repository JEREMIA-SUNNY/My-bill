import { AnalyticsView } from "@/components/features/analytics-view"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Visualize your financial health and spending habits.</p>
        </div>
      </div>
      
      <AnalyticsView />
    </div>
  )
}
