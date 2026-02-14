'use client'

import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { getEditToken, removeResumeId } from '@/lib/edit-token'
import type { ResumeContent } from '@/lib/schemas'
import { AI_MODELS, DEFAULT_AI_MODEL, improveResumeSchema, type ImproveResumeInput } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, ExternalLink, Loader2, Pencil, Sparkles, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'

const SECTION_LABELS: Record<string, string> = {
  personal: "Shaxsiy ma'lumot",
  experience: 'Tajriba',
  education: "Ta'lim",
  skills: "Ko'nikmalar",
  languages: 'Tillar',
  certifications: 'Sertifikatlar',
}

function ResumePreview({ content }: { content: ResumeContent }) {
  const p = content.personal ?? {}
  const exp = content.experience ?? []
  const edu = content.education ?? []
  const skills = content.skills ?? []

  return (
    <div className="font-sans text-sm space-y-6 print:text-black">
      <div data-section="personal">
        <h1 className="font-display text-2xl font-semibold">{p.fullName}</h1>
        <p className="text-muted-foreground">
          {[p.email, p.phone, p.location].filter(Boolean).join(' · ')}
        </p>
        {p.summary && <p className="mt-2 text-foreground/90">{p.summary}</p>}
      </div>
      {exp.length > 0 && (
        <div data-section="experience">
          <h2 className="font-display text-lg font-semibold border-b pb-1 mb-2">Ish tajribasi</h2>
          <ul className="space-y-3">
            {exp.map((e, i) => (
              <li key={i}>
                <strong>{e.title}</strong> — {e.company}
                <br />
                <span className="text-muted-foreground text-xs">
                  {e.location} | {e.startDate} – {e.endDate}
                </span>
                {e.description && <p className="mt-1 whitespace-pre-line">{e.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {edu.length > 0 && (
        <div data-section="education">
          <h2 className="font-display text-lg font-semibold border-b pb-1 mb-2">Ta’lim</h2>
          <ul className="space-y-2">
            {edu.map((e, i) => (
              <li key={i}>
                <strong>{e.degree}</strong> — {e.institution} ({e.year})
              </li>
            ))}
          </ul>
        </div>
      )}
      {skills.length > 0 && (
        <div data-section="skills">
          <h2 className="font-display text-lg font-semibold border-b pb-1 mb-2">Ko‘nikmalar</h2>
          <p>{skills.join(' · ')}</p>
        </div>
      )}
    </div>
  )
}

export default function ResumeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [improveOpen, setImproveOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [selectionPrompt, setSelectionPrompt] = useState<{ section: string; rect: DOMRect } | null>(null)
  const [selectionInstructions, setSelectionInstructions] = useState('')

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => api.resumes.get(id),
    enabled: !!id,
  })

  const improveForm = useForm<ImproveResumeInput>({
    resolver: zodResolver(improveResumeSchema),
    defaultValues: {
      resumeId: id,
      section: 'experience',
      instructions: '',
      language: 'uz',
      model: DEFAULT_AI_MODEL,
    },
  })

  const editToken = typeof window !== 'undefined' ? getEditToken(id) : undefined

  const improveMutation = useMutation({
    mutationFn: (data: ImproveResumeInput) => api.resumes.improve(data, editToken),
    onSuccess: (updated) => {
      queryClient.setQueryData(['resume', id], (old: typeof resume) =>
        old ? { ...old, content: updated.content } : old,
      )
      toast({ title: 'Bo‘lim yangilandi' })
      setImproveOpen(false)
      setSelectionPrompt(null)
      setSelectionInstructions('')
      improveForm.reset()
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  const handlePreviewMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    let node: Node | null = range.commonAncestorContainer
    while (node && node !== document.body) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const section = el.getAttribute('data-section')
        if (section) {
          setSelectionPrompt({ section, rect: range.getBoundingClientRect() })
          setSelectionInstructions('')
          return
        }
      }
      node = node.parentNode
    }
  }, [])

  const pdfMutation = useMutation({
    mutationFn: () => api.resumes.generatePdf(id, editToken),
    onSuccess: (data) => {
      toast({ title: 'PDF yaratildi' })
      window.open(data.pdfUrl, '_blank')
      queryClient.invalidateQueries({ queryKey: ['resume', id] })
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { title?: string }) => api.resumes.update(id, data, editToken),
    onSuccess: (updated) => {
      queryClient.setQueryData(['resume', id], (old: typeof resume) =>
        old ? { ...old, ...updated } : old,
      )
      toast({ title: 'Sarlavha yangilandi' })
      setEditOpen(false)
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.resumes.delete(id, editToken),
    onSuccess: () => {
      removeResumeId(id)
      toast({ title: 'Rezyume o‘chirildi' })
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      router.push('/resumes')
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  if (isLoading || !resume) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  const content = resume.content as ResumeContent

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6">
        <motion.div
          className="max-w-3xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/resumes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Orqaga
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditTitle(resume.title)
                  setEditOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Tahrirlash
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  improveForm.setValue('resumeId', id)
                  setImproveOpen(true)
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI bilan yaxshilash
              </Button>
              <Button
                size="sm"
                onClick={() => pdfMutation.mutate()}
                disabled={pdfMutation.isPending}
              >
                {pdfMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF
              </Button>
              {resume.pdfUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={resume.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Card className="border-2 print:border-0 print:shadow-none">
            <CardHeader className="print:pb-2">
              <CardTitle className="font-display text-2xl">{resume.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Til: {resume.language} · Yangilangan:{' '}
                {new Date(resume.updatedAt).toLocaleDateString('uz-UZ')}
              </p>
            </CardHeader>
            <CardContent
              className="relative select-text"
              onMouseUp={handlePreviewMouseUp}
            >
              <ResumePreview content={content} />
            </CardContent>
          </Card>

          <AnimatePresence>
            {selectionPrompt && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="fixed z-50 w-full max-w-md rounded-xl border-2 border-primary/20 bg-background shadow-xl p-4"
                style={{
                  left: typeof window !== 'undefined'
                    ? Math.max(16, Math.min(selectionPrompt.rect.left, window.innerWidth - 420))
                    : selectionPrompt.rect.left,
                  top: selectionPrompt.rect.bottom + 12,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">
                    AI bilan yaxshilash — {SECTION_LABELS[selectionPrompt.section] ?? selectionPrompt.section}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Tanlangan bo‘lim uchun ko‘rsatma yozing (masalan: rasmiy qiling, qisqartiring)
                </p>
                <Textarea
                  placeholder="Masalan: Faqat shu bandni rasmiyroq qiling"
                  value={selectionInstructions}
                  onChange={(e) => setSelectionInstructions(e.target.value)}
                  rows={3}
                  className="resize-none mb-3"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.getSelection()?.removeAllRanges()
                      setSelectionPrompt(null)
                      setSelectionInstructions('')
                    }}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectionInstructions.trim() || improveMutation.isPending}
                    onClick={() => {
                      improveMutation.mutate({
                        resumeId: id,
                        section: selectionPrompt.section as ImproveResumeInput['section'],
                        instructions: selectionInstructions.trim(),
                        language: 'uz',
                      })
                    }}
                  >
                    {improveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Yaxshilash'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Rezyume sarlavhasini tahrirlash</DialogTitle>
            <DialogDescription>Sarlavha rezyume ro‘yxatida ko‘rinadi.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const t = editTitle.trim()
              if (t && t !== resume.title) updateMutation.mutate({ title: t })
              else setEditOpen(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Sarlavha</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Rezyume sarlavhasi"
                maxLength={100}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || !editTitle.trim()}>
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Saqlash'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={improveOpen} onOpenChange={setImproveOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Bo‘limni AI bilan yaxshilash</DialogTitle>
            <DialogDescription>
              Qaysi bo‘limni qanday o‘zgartirish kerakligini yozing.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={improveForm.handleSubmit((data) => improveMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Bo‘lim</Label>
              <Select
                value={improveForm.watch('section')}
                onValueChange={(v) =>
                  improveForm.setValue('section', v as ImproveResumeInput['section'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Shaxsiy ma’lumot</SelectItem>
                  <SelectItem value="experience">Tajriba</SelectItem>
                  <SelectItem value="education">Ta’lim</SelectItem>
                  <SelectItem value="skills">Ko‘nikmalar</SelectItem>
                  <SelectItem value="languages">Tillar</SelectItem>
                  <SelectItem value="certifications">Sertifikatlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI model</Label>
              <Select
                value={improveForm.watch('model') ?? DEFAULT_AI_MODEL}
                onValueChange={(v) => improveForm.setValue('model', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modelni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ko‘rsatma</Label>
              <Textarea
                placeholder="Masalan: Har bir ish uchun natijalar va raqamlarni qo‘shing"
                {...improveForm.register('instructions')}
                rows={4}
              />
              {improveForm.formState.errors.instructions && (
                <p className="text-sm text-destructive">
                  {improveForm.formState.errors.instructions.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImproveOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={improveMutation.isPending}>
                {improveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Yaxshilash'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
