import { LogOut, Moon, Sun } from 'lucide-react'
import { Screen } from '../components/Screen'
import { ProfileFields } from '../components/ProfileFields'
import { segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'

export function SettingsPage() {
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <Screen title={t('settingsTitle')}>
      <section className="mb-6">
        <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">{t('settingsProfile')}</p>
        <ProfileFields />
      </section>

      <section className="mb-6">
        <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">{t('settingsAppearance')}</p>
        <div className="flex gap-2 rounded-2xl border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
          <button className={segmentClass(theme === 'light')} onClick={() => setTheme('light')}>
            <span className="flex items-center justify-center gap-1.5">
              <Sun className="h-4 w-4" strokeWidth={1.75} />
              {t('appearanceLight')}
            </span>
          </button>
          <button className={segmentClass(theme === 'dark')} onClick={() => setTheme('dark')}>
            <span className="flex items-center justify-center gap-1.5">
              <Moon className="h-4 w-4" strokeWidth={1.75} />
              {t('appearanceDark')}
            </span>
          </button>
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">{t('settingsLanguage')}</p>
        <div className="flex gap-2 rounded-2xl border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
          <button className={segmentClass(language === 'ms')} onClick={() => setLanguage('ms')}>
            {t('languageMalay')}
          </button>
          <button className={segmentClass(language === 'en')} onClick={() => setLanguage('en')}>
            {t('languageEnglish')}
          </button>
        </div>
      </section>

      <section>
        <p className="mb-2 px-1 text-[13px] font-medium text-neutral-400">{t('settingsAccount')}</p>
        <button
          onClick={logout}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-[15px] font-medium text-danger dark:border-neutral-800 dark:bg-neutral-900"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          {t('logout')}
        </button>
      </section>
    </Screen>
  )
}
