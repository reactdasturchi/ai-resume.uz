import { AUTH_TOKEN_KEY } from '@/stores/auth-store'

/** Doim Next.js /api ga so'rov (proxy orqali backendga ketadi). Brauzer to'g'ridan-to'g'ri backendga so'ramaydi. */
const API = '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

const REQUEST_TIMEOUT_MS = 15_000

type RequestOptions = RequestInit & { editToken?: string }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { editToken, ...init } = options
  const url = path.startsWith('http') ? path : `${API}${path}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  if (editToken) (headers as Record<string, string>)['X-Edit-Token'] = editToken

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, { ...init, headers, signal: controller.signal })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Server javob bermadi. Internet va backend ishlayotganligini tekshiring.')
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }

  if (!res.ok) {
    let err: { error?: string; message?: string; details?: Record<string, string[]> } = {
      error: res.statusText,
    }
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      err = (await res.json().catch(() => err)) as typeof err
    }
    const firstFieldError =
      err.details && (Object.values(err.details).flat()[0] as string | undefined)
    const msg = firstFieldError ?? err.error ?? err.message ?? res.statusText
    throw new Error(typeof msg === 'string' ? msg : res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name?: string }) =>
      request<{ user: { id: string; email: string; name: string | null }; token: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
    login: (body: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; name: string | null }; token: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
    me: () =>
      request<{
        id: string
        email: string
        name: string | null
        avatarUrl: string | null
        phone: string | null
        bio: string | null
        location: string | null
        website: string | null
        linkedIn: string | null
        tokens: number
        resumeCount: number
        planId?: string | null
        isAdmin?: boolean
        createdAt: string
        updatedAt: string
      }>('/auth/me'),
    updateProfile: (body: {
      name?: string | null
      avatarUrl?: string | null
      phone?: string | null
      bio?: string | null
      location?: string | null
      website?: string | null
      linkedIn?: string | null
    }) =>
      request<{
        id: string
        email: string
        name: string | null
        avatarUrl: string | null
        phone: string | null
        bio: string | null
        location: string | null
        website: string | null
        linkedIn: string | null
        tokens: number
        resumeCount: number
        planId?: string | null
        createdAt: string
        updatedAt: string
      }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },
  models: {
    list: () => request<{ ollamaAvailable: boolean; ollamaModels: string[] }>('/models'),
  },
  prompts: {
    improve: (body: { text: string; language?: 'uz' | 'ru' | 'en'; model?: string }) =>
      request<{ text: string }>('/prompts/improve', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  templates: {
    list: () =>
      request<{
        templates: Array<{
          id: string
          name: string
          slug: string
          description: string | null
          isDefault: boolean
        }>
      }>('/templates'),
    get: (slug: string) =>
      request<{
        id: string
        name: string
        slug: string
        description: string | null
        isDefault: boolean
        schema?: unknown
      }>(`/templates/${encodeURIComponent(slug)}`),
    create: (body: {
      name: string
      slug?: string
      description?: string | null
      schema: Record<string, unknown>
      isDefault?: boolean
    }) =>
      request<{ id: string; name: string; slug: string; description: string | null; schema: unknown; isDefault: boolean }>(
        '/templates',
        { method: 'POST', body: JSON.stringify(body) },
      ),
    update: (
      id: string,
      body: {
        name?: string
        slug?: string
        description?: string | null
        schema?: Record<string, unknown>
        isDefault?: boolean
      },
    ) =>
      request<{ id: string; name: string; slug: string; description: string | null; schema: unknown; isDefault: boolean }>(
        `/templates/id/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify(body) },
      ),
    delete: (id: string) =>
      request<void>(`/templates/id/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
  resumes: {
    list: (ids?: string[]) => {
      const url = ids && ids.length > 0 ? `/resumes?ids=${ids.join(',')}` : '/resumes'
      return request<{ resumes: import('@/lib/schemas').ResumeListItem[] }>(url)
    },
    get: (idOrSlug: string) =>
      request<import('@/lib/schemas').ResumeDetail>(`/resumes/${encodeURIComponent(idOrSlug)}`),
    generate: (body: {
      prompt: string
      language: 'uz' | 'ru' | 'en'
      title?: string
      templateId?: string
      model?: string
    }) =>
      request<import('@/lib/schemas').ResumeDetail & { slug: string; createdAt: string }>(
        '/resumes/generate',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      ),
    improve: (
      body: {
        resumeId: string
        section: string
        instructions: string
        language?: 'uz' | 'ru' | 'en'
        model?: string
      },
      editToken?: string,
    ) =>
      request<{ id: string; content: import('@/lib/schemas').ResumeContent }>('/resumes/improve', {
        method: 'POST',
        body: JSON.stringify(body),
        editToken,
      }),
    update: (
      id: string,
      body: { title?: string; content?: object; templateId?: string; language?: string },
      editToken?: string,
    ) =>
      request<import('@/lib/schemas').ResumeDetail>(`/resumes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        editToken,
      }),
    delete: (id: string, editToken?: string) =>
      request<void>(`/resumes/${id}`, { method: 'DELETE', editToken }),
    duplicate: (resumeId: string, editToken?: string) =>
      request<
        import('@/lib/schemas').ResumeDetail & { editToken?: string }
      >('/resumes/duplicate', {
        method: 'POST',
        body: JSON.stringify({ resumeId }),
        editToken,
      }),
    export: (resumeId: string) =>
      request<{
        id: string
        title: string
        content: import('@/lib/schemas').ResumeContent
        templateId: string
        language: string
        pdfUrl: string | null
      }>('/resumes/export', {
        method: 'POST',
        body: JSON.stringify({ resumeId }),
      }),
    generatePdf: (resumeId: string, editToken?: string) =>
      request<{ pdfUrl: string }>('/resumes/generate-pdf', {
        method: 'POST',
        body: JSON.stringify({ resumeId }),
        editToken,
      }),
  },
  admin: {
    stats: () =>
      request<{
        totalUsers: number
        totalResumes: number
        resumesWithUser: number
        resumesAnonymous: number
        resumesLast24h: number
        resumesLast7d: number
        recentUsers: Array<{
          id: string
          email: string
          name: string | null
          createdAt: string
          resumeCount: number
        }>
        recentResumes: Array<{
          id: string
          title: string
          slug: string
          createdAt: string
          user: { email: string; name: string | null } | null
        }>
      }>('/admin/stats'),
    errors: (limit?: number) =>
      request<{
        errors: Array<{
          id: string
          message: string
          stack: string | null
          path: string | null
          method: string | null
          statusCode: number | null
          createdAt: string
        }>
      }>(limit ? `/admin/errors?limit=${limit}` : '/admin/errors'),
  },
  payments: {
    create: (planId: 'starter' | 'pro' | 'business') =>
      request<{ paymentUrl: string; orderId: string }>('/payments/create', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),
  },
}
