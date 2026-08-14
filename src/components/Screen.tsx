import type { ReactNode } from 'react'

interface ScreenProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function Screen({ title, action, children }: ScreenProps) {
  return (
    <div className="min-h-screen pb-28">
      <header className="safe-top sticky top-0 z-10 border-b border-neutral-200 bg-white/90 px-5 pb-3 pt-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h1>
          {action}
        </div>
      </header>
      <main className="animate-fade-in-up px-5 pt-4">{children}</main>
    </div>
  )
}
