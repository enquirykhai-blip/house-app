import { NavLink } from 'react-router-dom'
import { CalendarClock, CheckSquare, Home, ShoppingCart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export function BottomNav() {
  const { t } = useLanguage()

  const tabs = [
    { to: '/', label: t('navHome'), icon: Home, end: true },
    { to: '/tarikh', label: t('navDates'), icon: CalendarClock, end: false },
    { to: '/runcit', label: t('navGroceries'), icon: ShoppingCart, end: false },
    { to: '/tugasan', label: t('navTasks'), icon: CheckSquare, end: false },
  ]

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/85 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/85">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="press flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-neutral-400"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
                    isActive ? 'bg-accent-soft dark:bg-accent/15' : ''
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-accent' : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                </span>
                <span className={isActive ? 'text-accent' : 'text-neutral-400 dark:text-neutral-500'}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
