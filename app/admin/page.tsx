'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  FileText,
  RefreshCw,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function formatDate(s: string) {
  return new Date(s).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.admin.stats(),
    enabled: Boolean(user?.isAdmin),
  })

  const { data: errorsData, isLoading: errorsLoading, refetch: refetchErrors } = useQuery({
    queryKey: ['admin', 'errors'],
    queryFn: () => api.admin.errors(50),
    enabled: Boolean(user?.isAdmin),
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/login?redirect=/admin')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Skeleton className="h-12 w-64" />
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <h1 className="font-display text-2xl font-semibold">Admin huquqi yo‘q</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Ushbu sahifaga faqat administratorlar kira oladi. Agar bu xato bo‘lsa, tizim
            administratori bilan bog‘laning.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Bosh sahifaga</Link>
          </Button>
        </main>
      </div>
    )
  }

  const errors = errorsData?.errors ?? []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Sayt statistikasi, foydalanuvchilar, rezyumelar va server xatolari
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchStats()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yangilash
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetchErrors()}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Xatolar
            </Button>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Jami foydalanuvchilar
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Jami rezyumelar
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalResumes}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ro‘yxatdan o‘tgan: {stats.resumesWithUser} · Anonim: {stats.resumesAnonymous}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    So‘nggi 24 soat
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.resumesLast24h}</p>
                  <p className="text-xs text-muted-foreground">yangi rezyume</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    So‘nggi 7 kun
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.resumesLast7d}</p>
                  <p className="text-xs text-muted-foreground">yangi rezyume</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    So‘nggi ro‘yxatdan o‘tganlar
                  </CardTitle>
                  <CardDescription>Oxirgi 10 ta foydalanuvchi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.recentUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Hali yo‘q</p>
                    ) : (
                      stats.recentUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="font-medium">{u.name || u.email}</span>
                            {u.name && (
                              <span className="text-muted-foreground ml-1">({u.email})</span>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {u.resumeCount} rezyume · {formatDate(u.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    So‘nggi yaratilgan rezyumelar
                  </CardTitle>
                  <CardDescription>Oxirgi 15 ta rezyume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.recentResumes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Hali yo‘q</p>
                    ) : (
                      stats.recentResumes.map((r) => (
                        <Link
                          key={r.id}
                          href={`/resume/${r.id}`}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          <span className="font-medium truncate">{r.title}</span>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            {r.user?.email ?? 'Anonim'} · {formatDate(r.createdAt)}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Server xatolari
            </CardTitle>
            <CardDescription>
              So‘nggi 50 ta xato (500 va boshqa kutilmagan xatolar)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorsLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : errors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Xatolar yo‘q</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {errors.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-mono"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                      <span>{e.method}</span>
                      <span>{e.path}</span>
                      {e.statusCode != null && (
                        <span className="text-destructive font-semibold">{e.statusCode}</span>
                      )}
                      <span>{formatDate(e.createdAt)}</span>
                    </div>
                    <p className="mt-1 break-words">{e.message}</p>
                    {e.stack && (
                      <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                        {e.stack.slice(0, 500)}
                        {e.stack.length > 500 ? '…' : ''}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Sanity CMS integratsiyasi kerak bo‘lsa, keyingi versiyada qo‘shiladi. Hozircha barcha
          ma’lumotlar PostgreSQL va API orqali olinadi.
        </p>
        </motion.div>
      </main>
    </div>
  )
}
