'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { registerSchema, type RegisterInput } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

export default function RegisterPage() {
  const router = useRouter()
  const { register: doRegister } = useAuth()
  const { toast } = useToast()
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: RegisterInput) => doRegister(data.email, data.password, data.name),
    onSuccess: () => {
      toast({ title: 'Hisob yaratildi' })
      router.push('/profile')
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
        <Card className="w-full border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Ro‘yxatdan o‘tish</CardTitle>
            <CardDescription>Yangi hisob yarating</CardDescription>
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
                <Label htmlFor="name">Ism (ixtiyoriy)</Label>
                <Input id="name" placeholder="Ismingiz" {...form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parol (kamida 6 belgi)</Label>
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
                  'Ro‘yxatdan o‘tish'
                )}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Allaqachon hisobingiz bormi?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Kirish
              </Link>
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  )
}
