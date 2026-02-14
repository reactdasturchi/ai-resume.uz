'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { PLANS, type Plan } from '@/lib/plans'
import { motion } from 'framer-motion'
import { CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function getPlan(planId: string | null): Plan | null {
  if (!planId) return null
  return PLANS.find((p) => p.id === planId) ?? null
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  const plan = getPlan(planId)
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardName, setCardName] = useState('')

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!user) {
    const redirect = '/checkout' + (planId ? '?plan=' + planId : '')
    router.replace('/login?redirect=' + encodeURIComponent(redirect))
    return null
  }

  if (!plan || plan.id === 'free') {
    router.replace(plan?.id === 'free' ? '/resume/builder' : '/#plans')
    return null
  }

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handlePayClick = async () => {
    const planId = plan.id as 'starter' | 'pro' | 'business'
    setCreateLoading(true)
    try {
      const { paymentUrl } = await api.payments.create(planId)
      window.location.href = paymentUrl
      return
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "To'lov serveri javob bermadi."
      if (message.includes('yoqilmagan') || message.includes('503')) {
        toast({
          title: "To'lov hozircha yoqilmagan",
          description: 'Simulyatsiya rejimida kartani kiritish oynasi ochiladi.',
          variant: 'default',
        })
        setPaymentOpen(true)
      } else {
        toast({ title: 'Xato', description: message, variant: 'destructive' })
      }
    } finally {
      setCreateLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !cardNumber.replace(/\s/g, '').match(/^\d{16}$/) ||
      !expiry.match(/^\d{2}\/\d{2}$/) ||
      cvc.length < 3 ||
      !cardName.trim()
    ) {
      toast({
        title: 'Ma’lumotlarni to‘ldiring',
        description: 'Barcha to‘lov maydonlarini tekshiring.',
        variant: 'destructive',
      })
      return
    }
    setPayLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      toast({
        title: 'To‘lov muvaffaqiyatli (simulyatsiya)',
        description: plan.name + ' rejasi faollashtirildi.',
      })
      setPaymentOpen(false)
      router.push('/profile')
    } catch {
      toast({ title: 'Xato', description: 'To‘lov amalga oshmadi.', variant: 'destructive' })
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground mb-8">Rejani tanlang va xavfsiz to‘lov qiling.</p>

          <Card className="border-2 mb-8">
            <CardHeader>
              <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
              <CardDescription className="text-2xl font-semibold text-foreground mt-1">
                {plan.priceLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 rounded-xl"
                  size="lg"
                  onClick={handlePayClick}
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Yo‘naltirilmoqda…
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      To‘lov qilish
                    </>
                  )}
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <Link href="/#plans">Bekor qilish</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            To‘lov ma’lumotlari shifrlangan va xavfsiz uzatiladi.
          </p>
        </motion.div>
      </main>

      {/* To'lov oynasi (modal) */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md" showClose={!payLoading}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Pul to‘lash
            </DialogTitle>
            <DialogDescription>
              {plan.name} — {plan.priceLabel}. Kartangizdan to‘lov olinadi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Karta raqami</Label>
              <Input
                id="card-number"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Amal qilish muddati</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-name">Karta egasi</Label>
              <Input
                id="card-name"
                placeholder="Ism Familiya"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentOpen(false)}
                disabled={payLoading}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={payLoading}>
                {payLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    To‘lanmoqda…
                  </>
                ) : (
                  'To‘lovni tasdiqlash'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  )
}
