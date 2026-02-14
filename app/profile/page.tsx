'use client'

/** Profil sahifasi backend API ga ulangan: GET /api/auth/me (profil), PATCH /api/auth/profile (yangilash). */

import { Navbar } from '@/components/layout/navbar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { FREE_MAX_RESUMES, FREE_MAX_TOKENS } from '@/lib/plans'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, ImagePlus, Link2, Loader2, Save, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

type ProfileForm = {
  name: string
  avatarUrl: string
  phone: string
  bio: string
  location: string
  website: string
  linkedIn: string
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, refreshUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.auth.me(),
    enabled: !!user,
  })

  const form = useForm<ProfileForm>({
    defaultValues: {
      name: '',
      avatarUrl: '',
      phone: '',
      bio: '',
      location: '',
      website: '',
      linkedIn: '',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        website: profile.website ?? '',
        linkedIn: profile.linkedIn ?? '',
      })
    } else if (user) {
      form.reset({
        name: user.name ?? '',
        avatarUrl: user.avatarUrl ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? '',
        location: user.location ?? '',
        website: user.website ?? '',
        linkedIn: user.linkedIn ?? '',
      })
    }
  }, [profile, user, form])

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) =>
      api.auth.updateProfile({
        name: data.name?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        phone: data.phone?.trim() || null,
        bio: data.bio?.trim() || null,
        location: data.location?.trim() || null,
        website: data.website?.trim() || null,
        linkedIn: data.linkedIn?.trim() || null,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(['profile'], updated)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshUser()
      toast({ title: 'Profil yangilandi' })
    },
    onError: (e: Error) => {
      toast({ title: 'Xato', description: e.message, variant: 'destructive' })
    },
  })

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Faqat rasm fayllari', variant: 'destructive' })
        return
      }
      if (file.size > MAX_AVATAR_SIZE) {
        toast({ title: 'Rasm 2 MB dan oshmasligi kerak', variant: 'destructive' })
        return
      }
      try {
        const dataUrl = await fileToDataUrl(file)
        form.setValue('avatarUrl', dataUrl)
        toast({ title: 'Rasm yuklandi' })
      } catch {
        toast({ title: 'Yuklash xatosi', variant: 'destructive' })
      }
      e.target.value = ''
    },
    [form, toast],
  )

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  const tokens = profile?.tokens ?? user.tokens ?? FREE_MAX_TOKENS
  const resumeCount = profile?.resumeCount ?? user.resumeCount ?? 0

  const profileFields = {
    name: (profile?.name ?? user.name ?? '').trim(),
    avatarUrl: (profile?.avatarUrl ?? user.avatarUrl ?? '').trim(),
    phone: (profile?.phone ?? user.phone ?? '').trim(),
    bio: (profile?.bio ?? user.bio ?? '').trim(),
    location: (profile?.location ?? user.location ?? '').trim(),
    website: (profile?.website ?? user.website ?? '').trim(),
    linkedIn: (profile?.linkedIn ?? user.linkedIn ?? '').trim(),
  }
  const filled = Object.values(profileFields).filter(Boolean).length
  const totalFields = 7
  const profileProgress = Math.round((filled / totalFields) * 100)

  return (
    <div className="min-h-screen flex flex-col grain">
      <Navbar />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12" tabIndex={-1}>
        <motion.div
          className="max-w-2xl mx-auto space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {profileError && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">Profil ma&apos;lumotlarini yuklashda xato</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}
              >
                Qayta urinish
              </Button>
            </div>
          )}
          {/* Profile completion progress */}
          <Card className="border-2 border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-sm font-medium text-muted-foreground">Profil to‘ldirilganligi</span>
                <span className="text-sm font-semibold text-foreground">{profileProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileProgress}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats card */}
          <Card className="border-2 border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{tokens}</p>
                    <p className="text-sm text-muted-foreground">Token</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {resumeCount} / {FREE_MAX_RESUMES}
                    </p>
                    <p className="text-sm text-muted-foreground">Rezyume</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="ml-auto self-center">
                  <Link href="/resume/builder">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Yangi rezyume
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile form */}
          <Card className="border-2 shadow-card">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                  <AvatarImage
                    src={form.watch('avatarUrl') || profile?.avatarUrl || undefined}
                    alt={user.name || user.email}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">Profil</CardTitle>
                  <CardDescription>{profile?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((d) => updateProfile.mutate(d))}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="gap-2">
                        <Link2 className="h-4 w-4" />
                        URL
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="gap-2">
                        <ImagePlus className="h-4 w-4" />
                        Yuklash
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-3">
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        {...form.register('avatarUrl')}
                      />
                    </TabsContent>
                    <TabsContent value="upload" className="mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Rasm tanlash
                      </Button>
                      {form.watch('avatarUrl')?.startsWith('data:') && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Rasm yuklandi. Saqlash tugmasini bosing.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ism</Label>
                    <Input id="name" placeholder="Ismingiz" {...form.register('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" placeholder="+998 90 123 45 67" {...form.register('phone')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Manzil</Label>
                  <Input
                    id="location"
                    placeholder="Shahar, mamlakat"
                    {...form.register('location')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Qisqacha ma&apos;lumot</Label>
                  <Textarea
                    id="bio"
                    placeholder="O'zingiz haqingizda..."
                    rows={4}
                    className="resize-none"
                    {...form.register('bio')}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Veb-sayt</Label>
                    <Input id="website" placeholder="https://..." {...form.register('website')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      placeholder="https://linkedin.com/in/..."
                      {...form.register('linkedIn')}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={updateProfile.isPending} className="btn-lift">
                  {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Saqlash
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
