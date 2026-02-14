'use client'

import { useAuth } from '@/contexts/auth-context'
import { FREE_MAX_RESUMES, FREE_MAX_TOKENS } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

const TOKEN_LOW_THRESHOLD = 3
const TOKEN_CRITICAL = 1

export function TokenWarning() {
  const { user } = useAuth()
  if (!user) return null

  const tokens = user.tokens ?? FREE_MAX_TOKENS
  const resumeCount = user.resumeCount ?? 0
  const tokensLow = tokens <= TOKEN_LOW_THRESHOLD
  const tokensCritical = tokens < TOKEN_CRITICAL
  const resumesNearLimit = resumeCount >= FREE_MAX_RESUMES - 1

  if (!tokensLow && !resumesNearLimit) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 shrink-0"
    >
      <Link
        href="/profile"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors',
          tokensCritical
            ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25',
        )}
      >
        {tokensCritical ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        <span>
          {tokensCritical
            ? 'Token tugadi'
            : tokensLow
              ? `${tokens} token`
              : resumesNearLimit
                ? `${resumeCount}/${FREE_MAX_RESUMES} rezyume`
                : ''}
        </span>
      </Link>
    </motion.div>
  )
}
