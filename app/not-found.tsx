'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
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
            className="inline-flex rounded-2xl bg-muted/80 p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <FileQuestion className="h-20 w-20 text-muted-foreground" aria-hidden />
          </motion.div>
          <div className="space-y-2">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
              404
            </h1>
            <p className="text-lg text-muted-foreground">
              Sahifa topilmadi. Manzil noto‘g‘ri yoki sahifa o‘chirilgan bo‘lishi mumkin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/" className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Bosh sahifa
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/resumes">Rezyumelar</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
