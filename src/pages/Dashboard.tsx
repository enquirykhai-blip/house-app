import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckSquare, LogOut, Moon, ShoppingCart, Sun } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useImportantDates } from '../hooks/useImportantDates'
import { useGroceries } from '../hooks/useGroceries'
import { useTasks } from '../hooks/useTasks'
import { useActivity } from '../hooks/useActivity'
import { countdownLabel, relativeTime } from '../utils/date'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat pagi'
  if (hour < 15) return 'Selamat tengah hari'
  if (hour < 19) return 'Selamat petang'
  return 'Selamat malam'
}

export function Dashboard() {
  const { displayName, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { dates } = useImportantDates()
  const { items } = useGroceries()
  const { tasks } = useTasks()
  const { activities } = useActivity()

  const nextDate = dates.find((d) => d.date >= Date.now() - 24 * 60 * 60 * 1000)
  const pendingGroceries = items.filter((i) => !i.isBought).length
  const pendingTasks = tasks.filter((t) => !t.isDone).length

  return (
    <div className="min-h-screen pb-28">
      <header className="safe-top px-5 pb-2 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-400">
              {greeting()}{displayName ? `, ${displayName}` : ''}
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Rumah kita
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              aria-label={theme === 'dark' ? 'Tukar ke mod cerah' : 'Tukar ke mod gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Moon className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
            <button
              onClick={logout}
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              aria-label="Log keluar"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <main className="animate-fade-in-up space-y-3 px-5 pt-4">
        <button
          onClick={() => navigate('/tarikh')}
          className="press w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft dark:bg-accent/15">
              <CalendarClock className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                {nextDate ? nextDate.title : 'Tiada tarikh akan datang'}
              </p>
              <p className="text-sm text-neutral-400">
                {nextDate ? countdownLabel(nextDate.date) : 'Tarikh Penting'}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/runcit')}
          className="press w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <ShoppingCart className="h-5 w-5 text-neutral-700 dark:text-neutral-300" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                {pendingGroceries} item belum beli
              </p>
              <p className="text-sm text-neutral-400">Senarai Runcit</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/tugasan')}
          className="press w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
              <CheckSquare className="h-5 w-5 text-neutral-700 dark:text-neutral-300" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                {pendingTasks} tugasan belum siap
              </p>
              <p className="text-sm text-neutral-400">Tugasan Rumah</p>
            </div>
          </div>
        </button>

        {activities.length > 0 && (
          <div className="pt-3">
            <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">Aktiviti Terkini</p>
            <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {activities.map((a, idx) => (
                <div
                  key={a.id}
                  className={`px-4 py-3 text-[13px] text-neutral-500 dark:text-neutral-400 ${
                    idx !== activities.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
                  }`}
                >
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    {a.actorName}
                  </span>{' '}
                  {a.action}
                  <span className="text-neutral-300 dark:text-neutral-600"> · {relativeTime(a.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
