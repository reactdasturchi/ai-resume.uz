'use client'

import { Navbar } from '@/components/layout/navbar'
import { PageSkeleton } from '@/components/page-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { addResumeId, getEditToken, getResumeIds, setEditToken } from '@/lib/edit-token'
import type { ResumeListItem } from '@/lib/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Copy, FileText, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'

const SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Yangilangan (yangi)' },
  { value: 'updated-asc', label: 'Yangilangan (eski)' },
  { value: 'title-asc', label: 'Sarlavha (A–Z)' },
  { value: 'title-desc', label: 'Sarlavha (Z–A)' },
] as const

function filterAndSort(
  list: ResumeListItem[],
  query: string,
  sort: string,
): ResumeListItem[] {
  const q = query.trim().toLowerCase()
  let out = q
    ? list.filter((r) => r.title.toLowerCase().includes(q) || r.language.toLowerCase().includes(q))
    : [...list]
  switch (sort) {
    case 'updated-desc':
      out.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      break
    case 'updated-asc':
      out.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      break
    case 'title-asc':
      out.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'title-desc':
      out.sort((a, b) => b.title.localeCompare(a.title))
      break
    default:
      out.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  return out
}

export default function ResumesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<string>('updated-desc')
  const touchStartY = useRef<number | null>(null)

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['resumes', user?.id ?? 'anon'],
    queryFn: () => api.resumes.list(user ? undefined : getResumeIds()),
    enabled: !authLoading,
  })

  const duplicateMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const editToken = user ? undefined : getEditToken(resumeId)
      const result = await api.resumes.duplicate(resumeId, editToken)
      return { id: result.id, editToken: result.editToken }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      if (result && !user && typeof window !== 'undefined') {
        addResumeId(result.id)
        if (result.editToken) setEditToken(result.id, result.editToken)
      }
      toast({ title: 'Rezyume nusxalandi' })
    },
    onError: (e: Error) => {
      toast({ title: 'Nusxalash xatosi', description: e.message, variant: 'destructive' })
    },
  })

  const resumes = data?.resumes ?? []
  const filtered = useMemo(() => filterAndSort(resumes, search, sort), [resumes, search, sort])

  const handleDuplicate = useCallback(
    (e: React.MouseEvent, r: ResumeListItem) => {
      e.preventDefault()
      e.stopPropagation()
      duplicateMutation.mutate(r.id)
    },
    [duplicateMutation],
  )

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])
  const onTouchEnd = useCallback(() => {
    touchStartY.current = null
  }, [])
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return
      const y = e.touches[0].clientY
      const pull = y - touchStartY.current
      if (pull > 80 && window.scrollY < 20) {
        refetch()
        touchStartY.current = null
      }
    },
    [refetch],
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 container mx-auto px-4 py-12"
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
      >
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Mening rezyumelarim
              </h1>
              <p className="text-muted-foreground mt-1">Barcha yaratilgan rezyumelar</p>
            </div>
            <Button asChild>
              <Link href="/">
                <Plus className="mr-2 h-4 w-4" />
                Yangi
              </Link>
            </Button>
          </div>

          {!authLoading && resumes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish (sarlavha, til)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl"
                  aria-label="Rezyumelar orasida qidirish"
                />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-xl" aria-label="Tartiblash">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {authLoading || isLoading ? (
            <PageSkeleton variant="list" count={4} />
          ) : isRefetching && resumes.length > 0 ? (
            <div className="flex justify-center py-4">
              <span className="text-sm text-muted-foreground">Yangilanmoqda…</span>
            </div>
          ) : null}

          {!authLoading && !isLoading && resumes.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
                <CardTitle className="font-display text-xl">Rezyume yo‘q</CardTitle>
                <CardDescription className="mt-2 text-center max-w-sm">
                  Birinchi rezyumengizni AI yordamida yarating — bosh sahifada qisqa matn yozing.
                </CardDescription>
                <Button asChild className="mt-6">
                  <Link href="/">Rezyume yaratish</Link>
                </Button>
              </CardContent>
            </Card>
          ) : !authLoading && !isLoading && filtered.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-10 w-10 text-muted-foreground mb-3" aria-hidden />
                <CardTitle className="font-display text-lg">Hech narsa topilmadi</CardTitle>
                <CardDescription className="mt-1 text-center max-w-sm">
                  Qidiruv yoki filterni o‘zgartiring.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-4">
              {filtered.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="border-2 hover:border-primary/30 hover:shadow-md transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Link href={`/resume/${r.id}`} className="min-w-0">
                        <CardTitle className="font-display text-lg truncate">{r.title}</CardTitle>
                      </Link>
                      <span className="text-xs text-muted-foreground uppercase shrink-0">
                        {r.language}
                      </span>
                    </CardHeader>
                    <CardContent className="flex flex-row items-center justify-between gap-2">
                      <Link href={`/resume/${r.id}`} className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(r.updatedAt).toLocaleDateString('uz-UZ')}
                          {r.pdfUrl && ' · PDF mavjud'}
                        </p>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 opacity-70 group-hover:opacity-100 touch-manipulation min-h-[44px] min-w-[44px]"
                        onClick={(e) => handleDuplicate(e, r)}
                        disabled={duplicateMutation.isPending}
                        aria-label={`${r.title} rezyumeni nusxalash`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>
    </div>
  )
}
