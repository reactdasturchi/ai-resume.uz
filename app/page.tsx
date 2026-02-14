'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, FileText, Layout, MessageCircle, Send, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI yordamida',
    desc: 'Qisqa matnni professional rezyumega aylantiramiz',
  },
  {
    icon: FileText,
    title: 'Tayyor shablonlar',
    desc: 'Zamonaviy va professional rezyume shablonlari',
  },
  {
    icon: Layout,
    title: 'Tahrirlash oson',
    desc: 'Yaratilgan rezyumeni istalgancha o‘zgartiring',
  },
  {
    icon: Zap,
    title: 'Tez natija',
    desc: 'Bir daqiqada tayyor rezyume oling',
  },
]

const STEPS = [
  { num: 1, title: 'Matn yozing', desc: "O'zingiz haqingizda 2–3 jumla kiriting" },
  { num: 2, title: 'AI yaratadi', desc: 'AI professional rezyumega aylantiradi' },
  { num: 3, title: 'Tahrirlang', desc: 'Kerak joylarni o‘zgartiring va PDF yuklab oling' },
]

const FAQ_ITEMS = [
  {
    q: 'Rezyume yaratish bepulmi?',
    a: "Ha. Ro'yxatdan o'tmasdan ham sinab ko'rishingiz mumkin. Ro'yxatdan o'tgan foydalanuvchilar 10 ta token va 4 ta rezyume bepul olishadi. Keyin qo'shimcha tokenlar uchun reja tanlashingiz mumkin.",
  },
  {
    q: 'Qanday shablonlar mavjud?',
    a: "Shablonlar sahifasida zamonaviy, klassik va minimal dizaynlar mavjud. Shablonni tanlab rezyume yaratishingiz yoki o'zingiz JSON orqali yangi shablon yuklashingiz mumkin.",
  },
  {
    q: "PDF qanday yuklab olaman?",
    a: "Rezyume yaratgach yoki tahrirlagach, rezyume sahifasida «PDF» tugmasini bosing. PDF fayl yaratiladi va yangi oynada ochiladi — shu yerdan yuklab olishingiz mumkin.",
  },
  {
    q: "Token nima va nima uchun kerak?",
    a: "Token — AI xizmatidan foydalanish uchun birlik. Har bir rezyume yaratish yoki bo'limni AI bilan yaxshilash 1 token ishlatadi. Bepul rejada 10 token beriladi, keyin reja bo'yicha tokenlar sotib olinadi.",
  },
  {
    q: "Ma'lumotlarim xavfsizmi?",
    a: "Ha. Parolingiz shifrlangan holda saqlanadi. Rezyume ma'lumotlaringiz faqat siz ko'rasiz; tizimda reklama yoki uchinchi tomonlarga ma'lumot berilmaydi.",
  },
]

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="container mx-auto px-4 py-16 md:py-24 border-t border-border/60 bg-muted/30"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        id="how-it-works-heading"
        className="font-display text-2xl md:text-3xl font-semibold text-center mb-12 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Qanday ishlaydi?
      </motion.h2>

      <div className="relative max-w-3xl mx-auto pl-0">
        {/* Timeline vertical line — always aligned with node column (w-12 center = 24px) */}
        <motion.div
          className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/60 to-primary/40 rounded-full origin-top"
          style={{ transformOrigin: 'top' }}
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />

        <ul className="space-y-0 list-none pl-0" role="list">
          {STEPS.map((s, i) => (
            <li
              key={s.num}
              className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-6 md:py-8 first:pt-0 last:pb-0"
            >
              {/* Node column: fixed width so line (left-6) passes through center */}
              <div className="w-12 flex-shrink-0 flex justify-center sm:justify-start">
                <motion.div
                  className="relative z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-background"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.25 + i * 0.18,
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-hidden
                >
                  {s.num}
                </motion.div>
              </div>

              {/* Content */}
              <motion.div
                className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 min-w-0"
                initial={{ opacity: 0, x: 12 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <motion.h3
                    className="font-semibold text-foreground text-lg"
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.18 }}
                  >
                    {s.title}
                  </motion.h3>
                  <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 6 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.45 + i * 0.18 }}
                  >
                    {s.desc}
                  </motion.p>
                </div>
                {i < STEPS.length - 1 && (
                  <motion.div
                    className="hidden sm:flex shrink-0"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.18, type: 'spring', stiffness: 200 }}
                  >
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/resume/builder"
                        className="group flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-primary/30 bg-primary/5 text-primary shadow-sm transition-[color,background-color,box-shadow,border-color] duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label="Keyingi qadam — Rezyume yaratish"
                      >
                        <ArrowRight className="h-7 w-7 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        className="text-center mt-12 md:mt-16"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.75 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/resume/builder">
              Boshlash
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

function FAQSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <motion.section
      ref={sectionRef}
      id="faq"
      className="container mx-auto px-4 py-16 md:py-24 border-t border-border/60 bg-muted/20"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="font-display text-2xl md:text-3xl font-semibold text-center mb-3"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Ko‘p so‘raladigan savollar
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center mb-12 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        Servis haqida tez-tez beriladigan savollar va javoblar
      </motion.p>
      <div className="max-w-2xl mx-auto space-y-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <motion.div
              key={i}
              initial={isInView ? { opacity: 0, y: 12 } : false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.06 }}
              className={cn(
                'rounded-xl border-2 bg-background overflow-hidden transition-colors',
                isOpen ? 'border-primary/40' : 'border-border/60 hover:border-primary/30',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-medium text-foreground select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-border/40"
                  >
                    <div className="px-5 pb-4 pt-0 text-muted-foreground text-sm leading-relaxed">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

function PlansSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={sectionRef}
      id="plans"
      className="container mx-auto px-4 py-16 md:py-24 border-t border-border/60"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
    >
      <motion.h2
        className="font-display text-2xl md:text-3xl font-semibold text-center mb-3"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        Tariflar
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center mb-10 sm:mb-12 max-w-md mx-auto px-2"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Tokenlar AI operatsiyalari uchun ishlatiladi. Ko‘proq rezyume va token olish uchun
        rejani tanlang.
      </motion.p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.12 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Card
              className={cn(
                'relative overflow-hidden transition-all hover:shadow-lg h-full flex flex-col',
                plan.highlighted && 'border-2 border-primary shadow-lg sm:scale-[1.02]',
              )}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 sm:px-3 rounded-bl-lg">
                  Tavsiya
                </div>
              )}
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="font-display text-base sm:text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-lg sm:text-2xl font-semibold text-foreground mt-1 break-words">
                  {plan.priceLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col">
                <ul className="space-y-1.5 sm:space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs sm:text-sm">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="sm"
                  className="w-full mt-auto rounded-xl text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  <Link
                    href={plan.id === 'free' ? '/resume/builder' : '/checkout?plan=' + plan.id}
                  >
                    {plan.id === 'free' ? 'Boshlash' : 'Sotib olish'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <motion.p
        className="text-center text-sm text-muted-foreground mt-6 px-4"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        «Sotib olish» bosilganda checkout sahifasiga o‘tasiz va xavfsiz to‘lov oynasi orqali to‘lashingiz mumkin.
      </motion.p>
    </motion.section>
  )
}

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen flex flex-col grain">
      <Navbar />

      <main className="flex-1">
        {/* Hero — zur fon: gradient mesh + geometrik texture */}
        <section className="relative overflow-hidden">
          <div className="hero-bg absolute inset-0 -z-10" aria-hidden />
          <div className="container relative z-0 mx-auto px-4 pt-16 md:pt-24 pb-20">
            <div
              className="text-center max-w-3xl mx-auto opacity-0 animate-fade-in-up animation-fill-forwards"
              style={{ animationDelay: '0.05s' }}
            >
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4 opacity-90">
              AI yordamida
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
              Rezyumengizni
              <br />
              <span className="text-primary relative inline-block">
                bir daqiqada
                <span className="absolute bottom-1 left-0 right-0 h-2 bg-primary/20 -z-10 rounded-full" />
              </span>
              yarating
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
              Qisqacha yozing — AI professional rezyumega aylantiradi. Keyin tahrirlashingiz mumkin.
            </p>
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-2xl btn-lift">
              <Link href="/resume/builder">
                <Sparkles className="mr-2 h-5 w-5" />
                Rezyume yaratish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16 md:py-24 border-t border-border/60">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-center mb-12">
            Nima uchun biz?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => (
              <Card
                key={i}
                className={cn(
                  'border-2 bg-card/80 backdrop-blur-sm opacity-0 animate-fade-in-up animation-fill-forwards',
                )}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <CardHeader>
                  <div className="rounded-xl bg-primary/10 w-12 h-12 flex items-center justify-center mb-2">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works — Timeline + Framer Motion */}
        <HowItWorksSection />

        {/* Plans — 4 tarif, responsive + Framer Motion */}
        <PlansSection />

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 md:py-24 border-t border-border/60">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
                Hoziroq boshlang
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Ro‘yxatdan o‘tmasdan ham sinab ko‘ring. Ro‘yxatdan o‘tgan foydalanuvchilar 10 token
                va 4 ta rezyume bepul olishadi.
              </p>
              <Button asChild size="lg" className="h-12 px-8 rounded-xl btn-lift">
                <Link href="/resume/builder">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Rezyume yaratish
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* FAQ — Ko'p so'raladigan savollar (Framer Motion) */}
        <FAQSection />

        {/* Footer — Telegram, muhitimiz, copyright */}
        <footer className="border-t border-border/60 bg-muted/30">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-2 md:gap-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-lg font-semibold">Telegram kanalimiz</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Yangiliklar, maslahatlar va rezyume namunalari uchun kanalimizga obuna bo‘ling.
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-lg gap-2">
                  <a
                    href="https://t.me/ai_resume_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram kanal"
                  >
                    <Send className="h-4 w-4" />
                    t.me/ai_resume_uz
                  </a>
                </Button>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-lg font-semibold">Muhitimiz haqida</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AI Resume — O‘zbekiston uchun AI asosida rezyume yaratish va shablonlar platformasi.
                  Biz ish qidiruvchilar va talabalar uchun professional rezyume tayyorlashni osonlashtiramiz.
                  Savollar va takliflar uchun Telegram orqali bog‘laning.
                </p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} AI Resume. Barcha huquqlar himoyalangan.</p>
              <div className="flex items-center gap-6">
                <Link href="/templates" className="hover:text-foreground transition-colors">
                  Shablonlar
                </Link>
                <Link href="/resume/builder" className="hover:text-foreground transition-colors">
                  Rezyume yaratish
                </Link>
                <a
                  href="https://t.me/ai_resume_uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
