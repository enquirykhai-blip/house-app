export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="skeleton h-6 w-6 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-3.5 w-2/5 rounded-full" />
        <div className="skeleton h-3 w-1/4 rounded-full" />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  )
}
