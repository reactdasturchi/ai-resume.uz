'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col grain">
      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center px-4 py-16"
        tabIndex={-1}
      >
        <motion.div
          className="max-w-md w-full text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex rounded-2xl bg-destructive/10 p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <AlertTriangle className="h-20 w-20 text-destructive" aria-hidden />
          </motion.div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Xatolik yuz berdi
            </h1>
            <p className="text-muted-foreground">
              Kutilmagan xato. Sahifani yangilab yoki keyinroq qayta urinib ko‘ring.
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-xl inline-flex items-center gap-2"
            onClick={reset}
          >
            <RefreshCw className="h-4 w-4" />
            Qayta urinish
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
