import { useTheme } from './ThemeContext.jsx'
import s from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className={s.toggle}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={s.track} data-dark={isDark}>
        <span className={s.thumb}>
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  )
}
