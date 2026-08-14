import type { ReactNode } from 'react'

interface ScreenProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function Screen({ title, action, children }: ScreenProps) {
  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 px-5 pb-3 pt-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
            {title}
          </h1>
          {action}
        </div>
      </header>
      <main className="px-5 pt-4">{children}</main>
    </div>
  )
}
