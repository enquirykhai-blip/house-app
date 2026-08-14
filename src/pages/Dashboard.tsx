import { useNavigate } from 'react-router-dom'
import { CalendarClock, CheckSquare, LogOut, ShoppingCart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useImportantDates } from '../hooks/useImportantDates'
import { useGroceries } from '../hooks/useGroceries'
import { useTasks } from '../hooks/useTasks'
import { countdownLabel } from '../utils/date'

export function Dashboard() {
  const { displayName, logout } = useAuth()
  const navigate = useNavigate()
  const { dates } = useImportantDates()
  const { items } = useGroceries()
  const { tasks } = useTasks()

  const nextDate = dates.find((d) => d.date >= Date.now() - 24 * 60 * 60 * 1000)
  const pendingGroceries = items.filter((i) => !i.isBought).length
  const pendingTasks = tasks.filter((t) => !t.isDone).length

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pb-2 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-400">Hai{displayName ? `, ${displayName}` : ''} 👋</p>
            <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
              Rumah kita
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
            aria-label="Log keluar"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main className="space-y-3 px-5 pt-4">
        <button
          onClick={() => navigate('/tarikh')}
          className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
                <CalendarClock className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[15px] font-medium text-neutral-900">
                  {nextDate ? nextDate.title : 'Tiada tarikh akan datang'}
                </p>
                <p className="text-sm text-neutral-400">
                  {nextDate ? countdownLabel(nextDate.date) : 'Tarikh Penting'}
                </p>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/runcit')}
          className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
              <ShoppingCart className="h-5 w-5 text-neutral-700" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[15px] font-medium text-neutral-900">
                {pendingGroceries} item belum beli
              </p>
              <p className="text-sm text-neutral-400">Senarai Runcit</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/tugasan')}
          className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
              <CheckSquare className="h-5 w-5 text-neutral-700" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[15px] font-medium text-neutral-900">
                {pendingTasks} tugasan belum siap
              </p>
              <p className="text-sm text-neutral-400">Tugasan Rumah</p>
            </div>
          </div>
        </button>
      </main>
    </div>
  )
}
