'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, FileText, Layout, Loader2, Search, Sparkles, Upload } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

type TemplateItem = {
  id: string
  name: string
  slug: string
  description: string | null
  isDefault: boolean
}

const TEMPLATE_PREVIEW_STYLES: Record<string, { accent: string; bg: string; icon: string; label: string }> = {
  modern: { accent: 'bg-primary', bg: 'bg-primary/5', icon: 'text-primary', label: 'Zamonaviy' },
  classic: {
    accent: 'bg-slate-700 dark:bg-slate-500',
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    icon: 'text-slate-700 dark:text-slate-300',
    label: 'Klassik',
  },
  minimal: { accent: 'bg-foreground', bg: 'bg-muted/50', icon: 'text-foreground', label: 'Minimal' },
  creative: {
    accent: 'bg-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    icon: 'text-violet-600',
    label: 'Ijodiy',
  },
}

function TemplatePreviewPlaceholder({
  slug,
  showPhoto,
  compact,
}: {
  slug: string
  showPhoto: boolean
  compact: boolean
}) {
  const style = TEMPLATE_PREVIEW_STYLES[slug] ?? TEMPLATE_PREVIEW_STYLES.modern
  return (
    <div className="space-y-2">
      <div className={cn('h-2 rounded', style.accent, compact ? 'w-3/4' : 'w-full')} />
      <div className="flex gap-2">
        {showPhoto && (
          <div className={cn('rounded bg-muted shrink-0', compact ? 'h-8 w-8' : 'h-10 w-10')} />
        )}
        <div className="flex-1 space-y-1">
          <div className={cn('h-2 rounded bg-muted-foreground/30', compact ? 'w-1/2' : 'w-2/3')} />
          <div className="h-1.5 rounded bg-muted-foreground/20 w-full" />
        </div>
      </div>
      {!compact && (
        <>
          <div className="h-1.5 rounded bg-muted-foreground/10 w-full" />
          <div className="h-1.5 rounded bg-muted-foreground/10 w-4/5" />
        </>
      )}
    </div>
  )
}

const defaultTemplateSchema = {
  fields: [],
  layout: 'single',
} as Record<string, unknown>

export default function TemplatesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showPhoto, setShowPhoto] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.templates.list(),
  })

  const createMutation = useMutation({
    mutationFn: (body: { name: string; slug?: string; description?: string | null; schema: Record<string, unknown>; isDefault?: boolean }) =>
      api.templates.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast({ title: 'Shablon qo‘shildi' })
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  const parseAndCreate = useCallback(
    (raw: string) => {
      let parsed: { name?: string; slug?: string; description?: string; schema?: unknown; isDefault?: boolean }
      try {
        parsed = JSON.parse(raw) as typeof parsed
      } catch {
        toast({ title: 'Noto‘g‘ri JSON', variant: 'destructive' })
        return
      }
      const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : null
      const schema = parsed.schema && typeof parsed.schema === 'object' && !Array.isArray(parsed.schema)
        ? (parsed.schema as Record<string, unknown>)
        : defaultTemplateSchema
      if (!name) {
        toast({ title: 'JSON da "name" maydoni bo‘lishi kerak', variant: 'destructive' })
        return
      }
      createMutation.mutate({
        name,
        slug: typeof parsed.slug === 'string' ? parsed.slug : undefined,
        description: typeof parsed.description === 'string' ? parsed.description : null,
        schema,
        isDefault: Boolean(parsed.isDefault),
      })
    },
    [createMutation, toast],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (!user) return
      const file = e.dataTransfer.files?.[0]
      if (!file || !file.name.endsWith('.json')) {
        toast({ title: 'Faqat .json fayl yuklang', variant: 'destructive' })
        return
      }
      const reader = new FileReader()
      reader.onload = () => parseAndCreate(String(reader.result ?? ''))
      reader.readAsText(file)
    },
    [user, parseAndCreate, toast],
  )

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || !user) return
      const reader = new FileReader()
      reader.onload = () => parseAndCreate(String(reader.result ?? ''))
      reader.readAsText(file)
    },
    [user, parseAndCreate],
  )

  const templates = data?.templates ?? []
  const filtered = searchQuery.trim()
    ? templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : templates

  return (
    <div className="min-h-screen flex flex-col grain">
      <Navbar />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-12" tabIndex={-1}>
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">Shablonlar</h1>
            <p className="text-muted-foreground mb-6">
              Rezyume yaratishda tanlashingiz mumkin bo&apos;lgan professional shablonlar
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search">Qidirish</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
                  <Input
                    id="search"
                    placeholder="Shablon nomi yoki tavsifi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg pl-9"
                    aria-label="Shablonlar orasida qidirish"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="show-photo" checked={showPhoto} onCheckedChange={setShowPhoto} />
                  <Label htmlFor="show-photo" className="cursor-pointer text-sm">
                    Rasm ko&apos;rsatish
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="compact" checked={compactMode} onCheckedChange={setCompactMode} />
                  <Label htmlFor="compact" className="cursor-pointer text-sm">
                    Qisqa format
                  </Label>
                </div>
              </div>
            </div>

          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((t, i) => {
                const style = TEMPLATE_PREVIEW_STYLES[t.slug] ?? TEMPLATE_PREVIEW_STYLES.modern
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                  >
                    <Card
                      className={cn(
                        'border-2 overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:border-primary/40 h-full flex flex-col',
                        t.isDefault && 'ring-2 ring-primary/30',
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={cn('rounded-xl p-2.5', style.bg)}>
                              <Layout className={cn('h-5 w-5', style.icon)} />
                            </div>
                            <div>
                              <CardTitle className="font-display text-lg">{t.name}</CardTitle>
                              {t.isDefault && (
                                <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  Tavsiya etiladi
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="shrink-0 rounded-xl touch-manipulation min-h-[44px]"
                            onClick={() => setPreviewTemplate(t)}
                            aria-label={`${t.name} shablonini oldindan ko'rish`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ko&apos;rish
                          </Button>
                        </div>
                        {t.description && (
                          <CardDescription className="mt-2 text-sm leading-relaxed">
                            {t.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div
                          className={cn(
                            'rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 flex-1 min-h-[120px]',
                            style.bg,
                            compactMode && 'p-3',
                          )}
                        >
                          <div className="space-y-2">
                            <div
                              className={cn(
                                'h-2 rounded',
                                style.accent,
                                compactMode ? 'w-3/4' : 'w-full',
                              )}
                            />
                            <div className="flex gap-2">
                              {showPhoto && (
                                <div
                                  className={cn(
                                    'rounded bg-muted shrink-0',
                                    compactMode ? 'h-8 w-8' : 'h-10 w-10',
                                  )}
                                />
                              )}
                              <div className="flex-1 space-y-1">
                                <div
                                  className={cn(
                                    'h-2 rounded bg-muted-foreground/30',
                                    compactMode ? 'w-1/2' : 'w-2/3',
                                  )}
                                />
                                <div className="h-1.5 rounded bg-muted-foreground/20 w-full" />
                              </div>
                            </div>
                            {!compactMode && (
                              <>
                                <div className="h-1.5 rounded bg-muted-foreground/10 w-full" />
                                <div className="h-1.5 rounded bg-muted-foreground/10 w-4/5" />
                              </>
                            )}
                          </div>
                        </div>
                        <Button asChild className="w-full rounded-xl gap-2" size="sm">
                          <Link href={`/resume/builder?template=${t.slug}`}>
                            <Sparkles className="h-4 w-4" />
                            Ushbu shablon bilan yaratish
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Shablon preview modal */}
          <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
            <DialogContent className="max-w-md rounded-2xl gap-0">
              {previewTemplate && (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                      <Layout className="h-5 w-5 text-primary" />
                      {previewTemplate.name}
                    </DialogTitle>
                  </DialogHeader>
                  {previewTemplate.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {previewTemplate.description}
                    </p>
                  )}
                  <div
                    className={cn(
                      'mt-6 rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 min-h-[200px]',
                      (TEMPLATE_PREVIEW_STYLES[previewTemplate.slug] ?? TEMPLATE_PREVIEW_STYLES.modern).bg,
                    )}
                  >
                    <TemplatePreviewPlaceholder
                      slug={previewTemplate.slug}
                      showPhoto={showPhoto}
                      compact={false}
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button asChild className="flex-1 rounded-xl" size="sm">
                      <Link href={`/resume/builder?template=${previewTemplate.slug}`} onClick={() => setPreviewTemplate(null)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ushbu shablon bilan yaratish
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPreviewTemplate(null)}>
                      Yopish
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onDragOver={user ? (e) => { e.preventDefault(); setDragActive(true) } : undefined}
              onDragLeave={user ? () => setDragActive(false) : undefined}
              onDrop={user ? onDrop : undefined}
            >
              <Card
                className={cn(
                  'border-2 border-dashed rounded-2xl transition-all duration-200',
                  user && 'cursor-pointer',
                  user && (dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/30'),
                  !user && 'border-muted bg-muted/30',
                )}
              >
                {user && (
                  <input
                    type="file"
                    accept=".json"
                    className="sr-only"
                    id="template-upload-empty"
                    onChange={onFileSelect}
                  />
                )}
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  {user ? (
                    <label
                      htmlFor="template-upload-empty"
                      className="flex flex-col items-center justify-center gap-1 text-center cursor-pointer outline-none w-full min-h-[200px]"
                    >
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
                      <CardTitle className="font-display text-xl">Shablon topilmadi</CardTitle>
                      <CardDescription className="mt-2 max-w-sm">
                        Boshqa so&apos;z bilan qidiring yoki shablonni shu yerga tashlang (drag-and-drop).
                      </CardDescription>
                      {createMutation.isPending && (
                        <div className="mt-5 flex justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                    </label>
                  ) : (
                    <>
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
                      <CardTitle className="font-display text-xl">Shablon topilmadi</CardTitle>
                      <CardDescription className="mt-2 max-w-sm">
                        Boshqa so&apos;z bilan qidirib ko&apos;ring. Shablon yuklash uchun tizimga kiring.
                      </CardDescription>
                      <Button asChild className="mt-6 rounded-xl">
                        <Link href="/login">Tizimga kirish</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
