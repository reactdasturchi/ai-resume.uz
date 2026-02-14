'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { addResumeId, setEditToken } from '@/lib/edit-token'
import { FREE_MAX_RESUMES, FREE_MAX_TOKENS } from '@/lib/plans'
import {
    AI_MODELS,
    DEFAULT_AI_MODEL,
    PROMPT_MAX,
    PROMPT_MIN,
    generateResumeSchema,
    type GenerateResumeInput,
} from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Cpu, FileText, Globe, Layout, Loader2, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

type ResumeBuilderFormProps = {
  initialTemplateId?: string
}

export function ResumeBuilderForm({ initialTemplateId }: ResumeBuilderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const form = useForm<GenerateResumeInput>({
    resolver: zodResolver(generateResumeSchema),
    defaultValues: { language: 'uz', prompt: '', model: DEFAULT_AI_MODEL, title: '' },
    mode: 'onChange',
  })

  const promptValue = form.watch('prompt') ?? ''
  const promptLength = promptValue.trim().length
  const isPromptValid = promptLength >= PROMPT_MIN && promptLength <= PROMPT_MAX

  const tokens = user?.tokens ?? FREE_MAX_TOKENS
  const resumeCount = user?.resumeCount ?? 0
  const canGenerate = tokens >= 1 && resumeCount < FREE_MAX_RESUMES
  const canImprovePrompt = tokens >= 1

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.templates.list(),
  })
  const templates = templatesData?.templates ?? []
  const defaultTemplateSlug =
    initialTemplateId && templates.some((t) => t.slug === initialTemplateId)
      ? initialTemplateId
      : (templates.find((t) => t.isDefault)?.slug ?? 'modern')

  useEffect(() => {
    form.setValue('templateId', defaultTemplateSlug)
  }, [defaultTemplateSlug, form])

  const improvePrompt = useMutation({
    mutationFn: (text: string) =>
      api.prompts.improve({
        text,
        language: form.watch('language'),
        model: form.watch('model'),
      }),
    onSuccess: async (data) => {
      form.setValue('prompt', data.text)
      await refreshUser()
      toast({ title: 'Matn yaxshilandi' })
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  const generate = useMutation({
    mutationFn: (data: GenerateResumeInput) =>
      api.resumes.generate({
        prompt: data.prompt.trim(),
        language: data.language,
        model: data.model,
        templateId: data.templateId || defaultTemplateSlug,
        ...(data.title?.trim() && { title: data.title.trim() }),
      }),
    onSuccess: async (data) => {
      if (data.editToken) setEditToken(data.id, data.editToken)
      addResumeId(data.id)
      await refreshUser()
      toast({ title: 'Rezyume yaratildi', description: data.title })
      router.push(`/resume/${data.id}`)
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  return (
    <Card
      className={cn(
        'border-2 shadow-card rounded-2xl overflow-hidden',
        'hover:shadow-card-hover transition-shadow duration-300',
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Sparkles className="h-5 w-5 text-primary animate-float" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Yangi rezyume</CardTitle>
            <CardDescription className="mt-1.5 text-[15px] leading-relaxed">
              O&apos;zingiz haqingizda 2–3 jumla yozing (ta&apos;lim, ish tajribasi,
              ko&apos;nikmalar). AI qolganini to&apos;ldiradi.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit((data) => generate.mutate(data))} className="space-y-6">
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5 text-muted-foreground" />
                Rezyume shablon
              </Label>
              <Select
                value={form.watch('templateId') || defaultTemplateSlug}
                onValueChange={(v) => form.setValue('templateId', v)}
              >
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue placeholder="Shablon tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.slug} className="rounded-lg">
                      <span className="flex items-center gap-2">
                        {t.name}
                        {t.isDefault && (
                          <span className="text-xs text-primary font-medium">(Tavsiya)</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templates.find((t) => t.slug === (form.watch('templateId') || defaultTemplateSlug))?.description && (
                <p className="text-xs text-muted-foreground">
                  {templates.find((t) => t.slug === (form.watch('templateId') || defaultTemplateSlug))?.description}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt">Matn</Label>
              <span
                className={cn(
                  'text-xs tabular-nums transition-colors',
                  promptLength > PROMPT_MAX
                    ? 'text-destructive font-medium'
                    : isPromptValid
                      ? 'text-muted-foreground'
                      : 'text-amber-600',
                )}
              >
                {promptLength} / {PROMPT_MIN}–{PROMPT_MAX} belgi
              </span>
            </div>
            <div
              className={cn(
                'relative rounded-lg border-2 bg-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
                form.formState.errors.prompt || promptLength > PROMPT_MAX
                  ? 'border-destructive/60 focus-within:border-destructive'
                  : 'border-input focus-within:border-primary/50',
              )}
            >
              <Textarea
                id="prompt"
                placeholder="Masalan: Men 4 yillik frontend dasturchi, React va TypeScript. Toshkent. TATU da bakalavr..."
                className="min-h-[160px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-lg placeholder:text-muted-foreground/70 pr-12 pb-10"
                maxLength={PROMPT_MAX + 50}
                {...form.register('prompt')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2 h-8 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  const t = promptValue.trim()
                  if (t.length < 5) {
                    toast({ title: 'Kamida 5 belgi yozing', variant: 'destructive' })
                    return
                  }
                  improvePrompt.mutate(t)
                }}
                disabled={
                  improvePrompt.isPending ||
                  promptValue.trim().length < 5 ||
                  Boolean(user && !canImprovePrompt)
                }
                title="AI bilan matnni yaxshilash"
              >
                {improvePrompt.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-1.5 text-xs font-medium">Yaxshilash</span>
              </Button>
            </div>
            {form.formState.errors.prompt && (
              <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>
            )}
            {promptLength > PROMPT_MAX && !form.formState.errors.prompt && (
              <p className="text-sm text-destructive">
                Matn {PROMPT_MAX} belgidan oshmasligi kerak.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                AI model
              </Label>
              <Controller
                name="model"
                control={form.control}
                defaultValue={DEFAULT_AI_MODEL}
                render={({ field }) => (
                  <Select value={field.value ?? DEFAULT_AI_MODEL} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg h-11 w-full">
                      <SelectValue placeholder="Model tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label} — {m.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                Til
              </Label>
              <Controller
                name="language"
                control={form.control}
                defaultValue="uz"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg h-11 w-full">
                      <SelectValue placeholder="Til tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uz">O&apos;zbekcha</SelectItem>
                      <SelectItem value="ru">Ruscha</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <Label htmlFor="title" className="text-sm">
                Sarlavha (ixtiyoriy)
              </Label>
              <Input
                id="title"
                placeholder="Mening rezyumem"
                className="rounded-lg h-11 w-full"
                maxLength={100}
                {...form.register('title')}
              />
            </div>
          </div>

          {user && (
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">
                Token: <strong className="text-foreground">{tokens}</strong>/{FREE_MAX_TOKENS}
                {' · '}
                Rezyume: <strong className="text-foreground">{resumeCount}</strong>/
                {FREE_MAX_RESUMES}
              </span>
              {(!canGenerate || !canImprovePrompt) && (
                <Link href="/#plans" className="text-primary hover:underline font-medium">
                  Rejani yangilash
                </Link>
              )}
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium btn-lift"
            size="lg"
            disabled={generate.isPending || !isPromptValid || Boolean(user && !canGenerate)}
          >
            {generate.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Yaratilmoqda…
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Rezyume yaratish
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
