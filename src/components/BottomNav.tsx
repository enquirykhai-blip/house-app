import { NavLink } from 'react-router-dom'
import { CalendarClock, CheckSquare, Home, ShoppingCart } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/tarikh', label: 'Tarikh', icon: CalendarClock, end: false },
  { to: '/runcit', label: 'Runcit', icon: ShoppingCart, end: false },
  { to: '/tugasan', label: 'Tugasan', icon: CheckSquare, end: false },
]

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-neutral-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
