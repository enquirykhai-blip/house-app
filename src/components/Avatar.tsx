interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  accent?: boolean
}

const sizeClass = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
}

export function Avatar({ name, size = 'md', accent = false }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass[size]} ${
        accent
          ? 'bg-accent text-white'
          : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
      }`}
    >
      {initial}
    </div>
  )
}
