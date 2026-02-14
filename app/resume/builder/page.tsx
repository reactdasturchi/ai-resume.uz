'use client'

import { Navbar } from '@/components/layout/navbar'
import { ResumeBuilderForm } from '@/components/resume/resume-builder-form'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function BuilderContent() {
  const searchParams = useSearchParams()
  const templateSlug = searchParams.get('template') ?? undefined

  return (
    <div className="relative min-h-screen flex flex-col grain">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center mb-10">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Rezyume yaratish
            </h1>
            <p className="text-muted-foreground">
              O&apos;zingiz haqingizda qisqacha yozing — AI professional rezyumega aylantiradi.
            </p>
          </div>
          <ResumeBuilderForm initialTemplateId={templateSlug} />
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary/70" />
            <span>Rezyumeni keyinroq tahrirlashingiz mumkin.</span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Yuklanmoqda…</div>
          </main>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  )
}
