export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="h-4 w-96 bg-muted rounded"></div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border bg-card p-6 flex flex-col gap-4">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-8 w-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 h-[400px] rounded-xl border bg-card"></div>
        <div className="lg:col-span-3 h-[400px] rounded-xl border bg-card"></div>
      </div>
    </div>
  )
}
