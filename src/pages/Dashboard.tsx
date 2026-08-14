import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  CheckSquare,
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  ShoppingCart,
  Sun,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useImportantDates } from '../hooks/useImportantDates'
import { useGroceries } from '../hooks/useGroceries'
import { useTasks } from '../hooks/useTasks'
import { useActivity } from '../hooks/useActivity'
import { Avatar } from '../components/Avatar'
import { ProfileSheet } from '../components/ProfileSheet'
import { countdownLabel, dateBadgeClass, relativeTime } from '../utils/date'
import type { ActivityType } from '../types'
import type { TranslationKey } from '../i18n/translations'

const activityVerb: Record<ActivityType, TranslationKey> = {
  date_added: 'activityAddedDate',
  date_updated: 'activityUpdatedDate',
  grocery_added: 'activityAddedItem',
  grocery_bought: 'activityBoughtItem',
  task_added: 'activityAddedTask',
  task_done: 'activityCompletedTask',
}

export function Dashboard() {
  const { config, displayName, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const { dates } = useImportantDates()
  const { items } = useGroceries()
  const { tasks } = useTasks()
  const { activities } = useActivity()
  const [profileOpen, setProfileOpen] = useState(false)

  function greeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return t('greetingMorning')
    if (hour < 15) return t('greetingNoon')
    if (hour < 19) return t('greetingEvening')
    return t('greetingNight')
  }

  const quickAdd = [
    { to: '/tarikh', label: t('navDates'), icon: CalendarClock },
    { to: '/runcit', label: t('navGroceries'), icon: ShoppingCart },
    { to: '/tugasan', label: t('navTasks'), icon: CheckSquare },
  ]

  const nextDate = dates.find((d) => d.date >= Date.now() - 24 * 60 * 60 * 1000)
  const unboughtGroceries = items.filter((i) => !i.isBought)
  const notDoneTasks = tasks.filter((t) => !t.isDone)
  const doneTasks = tasks.length - notDoneTasks.length
  const taskProgress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  // Older entries were logged before the type/detail schema — skip rather
  // than crash on the missing field.
  const renderableActivities = activities.filter((a) => a.type in activityVerb)

  return (
    <div className="min-h-screen pb-28">
      <header className="safe-top px-5 pb-3 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-400">
              {greeting()}
              {displayName ? `, ${displayName}` : ''}
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {t('homeTitle')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="press flex h-9 items-center justify-center gap-1 rounded-full bg-neutral-100 px-2.5 text-[11px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              aria-label={t('toggleLanguage')}
            >
              <Languages className="h-4 w-4" strokeWidth={1.75} />
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
              aria-label={t('toggleTheme')}
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
              aria-label={t('logout')}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {config && (
          <button
            onClick={() => setProfileOpen(true)}
            className="press mt-4 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex -space-x-2">
              <Avatar name={config.khaiName || '?'} size="sm" />
              <Avatar name={config.wifeName || '?'} size="sm" />
            </div>
            <p className="min-w-0 flex-1 truncate text-[13px] text-neutral-500 dark:text-neutral-400">
              {config.khaiName || 'Khai'} &amp; {config.wifeName || 'Wife'}
            </p>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600" strokeWidth={1.75} />
          </button>
        )}
      </header>

      <main className="animate-fade-in-up space-y-5 px-5 pt-1">
        <section>
          <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">{t('quickAdd')}</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAdd.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                onClick={() => navigate(to, { state: { openAdd: true } })}
                className="press flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white py-3.5 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft dark:bg-accent/15">
                  <Icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <button
            onClick={() => navigate('/tarikh')}
            className="press w-full rounded-2xl border border-neutral-200 bg-white p-4 text-left dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft dark:bg-accent/15">
                <CalendarClock className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                  {nextDate ? nextDate.title : t('noUpcomingDate')}
                </p>
                <p className="text-sm text-neutral-400">{t('datesPageTitle')}</p>
              </div>
              {nextDate && (
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${dateBadgeClass(nextDate.date)}`}
                >
                  {countdownLabel(nextDate.date, t)}
                </span>
              )}
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
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                  {t('itemsNotBought', {
                    count: unboughtGroceries.length,
                    plural: unboughtGroceries.length === 1 ? '' : 's',
                  })}
                </p>
                <p className="truncate text-sm text-neutral-400">
                  {unboughtGroceries.length > 0
                    ? unboughtGroceries
                        .slice(0, 3)
                        .map((i) => i.item)
                        .join(', ')
                    : t('groceriesPageTitle')}
                </p>
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
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                  {t('tasksNotDone', {
                    count: notDoneTasks.length,
                    plural: notDoneTasks.length === 1 ? '' : 's',
                  })}
                </p>
                <p className="text-sm text-neutral-400">{t('tasksPageTitle')}</p>
              </div>
              {tasks.length > 0 && (
                <div className="h-8 w-8 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="3"
                      className="stroke-neutral-100 dark:stroke-neutral-800"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(taskProgress / 100) * 97.4} 97.4`}
                      className="stroke-accent"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </section>

        {renderableActivities.length > 0 && (
          <section>
            <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">{t('recentActivity')}</p>
            <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {renderableActivities.map((a, idx) => (
                <div
                  key={a.id}
                  className={`px-4 py-3 text-[13px] text-neutral-500 dark:text-neutral-400 ${
                    idx !== renderableActivities.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''
                  }`}
                >
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">{a.actorName}</span>{' '}
                  {t(activityVerb[a.type])} &ldquo;{a.detail}&rdquo;
                  <span className="text-neutral-300 dark:text-neutral-600">
                    {' '}
                    · {relativeTime(a.createdAt, t, language)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
