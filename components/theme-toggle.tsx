'use client'

import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const THEME_COOKIE = 'ai-resume-theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 yil

function setThemeCookie(value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !resolvedTheme) return
    setThemeCookie(resolvedTheme)
  }, [mounted, resolvedTheme])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full shrink-0" aria-label="Mavzu">
        <Sun className="h-5 w-5 text-muted-foreground" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full shrink-0 text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Yorug‘ rejim' : 'Qorong‘u rejim'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
      )}
    </Button>
  )
}
