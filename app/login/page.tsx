'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { loginSchema, type LoginInput } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/profile'
  const { login } = useAuth()
  const { toast } = useToast()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: LoginInput) => login(data.email, data.password),
    onSuccess: () => {
      toast({ title: 'Tizimga kirdingiz' })
      router.push(redirect.startsWith('/') ? redirect : '/profile')
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
    <Card className="w-full max-w-md border-2 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Kirish</CardTitle>
        <CardDescription>Hisobingizga kiring</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <Input id="password" type="password" {...form.register('password')} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              'Kirish'
            )}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Hisobingiz yo‘qmi?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Ro‘yxatdan o‘tish
          </Link>
        </p>
      </CardContent>
    </Card>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="w-full max-w-md h-64 rounded-lg bg-muted animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
