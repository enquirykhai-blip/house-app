import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { inputClass } from './ui'
import { useLanguage } from '../contexts/LanguageContext'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  minLength?: number
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${inputClass} pr-11`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="press absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 dark:text-neutral-500"
        aria-label={visible ? t('hidePassword') : t('showPassword')}
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
        ) : (
          <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}
