'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const { refreshUser } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    refreshUser?.()
  }, [refreshUser])

  useEffect(() => {
    const t = setTimeout(() => {
      setRedirecting(true)
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            To‘lov muvaffaqiyatli
          </h1>
          <p className="text-muted-foreground mb-8">
            Rejangiz faollashtirildi. Profil sahifasida token va reja yangilanishini ko‘rishingiz
            mumkin.
            {orderId && <span className="block mt-2 text-sm opacity-80">Buyurtma: {orderId}</span>}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/profile">
                {redirecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Profilga o‘tish…
                  </>
                ) : (
                  'Profilga o‘tish'
                )}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/">Bosh sahifa</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </main>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
