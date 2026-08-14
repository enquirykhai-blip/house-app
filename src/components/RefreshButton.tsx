import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
  refreshing: boolean
}

export function RefreshButton({ onRefresh, refreshing }: RefreshButtonProps) {
  return (
    <button
      onClick={() => {
        if (!refreshing) void onRefresh()
      }}
      disabled={refreshing}
      className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
      aria-label="Muat semula"
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
    </button>
  )
}
