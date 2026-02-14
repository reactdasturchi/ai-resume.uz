import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email noto‘g‘ri'),
  password: z.string().min(6, 'Parol kamida 6 belgi'),
  name: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email noto‘g‘ri'),
  password: z.string().min(1, 'Parol kiriting'),
})

const PROMPT_MIN = 15
const PROMPT_MAX = 2000

export const generateResumeSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(PROMPT_MIN, `Kamida ${PROMPT_MIN} belgi yozing`)
    .max(PROMPT_MAX, `Ko‘pi bilan ${PROMPT_MAX} belgi`),
  language: z.enum(['uz', 'ru', 'en'], { required_error: 'Tilni tanlang' }),
  title: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(100).optional()),
  templateId: z.string().optional(),
  model: z.string().max(64).optional(),
})

export { PROMPT_MAX, PROMPT_MIN }

/** AI modellari – Free tier rate limit bo‘yicha tartiblangan (barqaror modellar birinchi) */
export const AI_MODELS = [
  // Barqaror – keng limit (Tavsiya)
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Tavsiya — 1,500/kun, barqaror' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2 Flash', desc: 'Tavsiya — 1,500/kun, yangi' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Yuqori sifat — 1,500/kun' },
  // Gemini 2.5 — limit qattiq (20/kun)
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: '5 RPM, 20/kun — ehtiyot' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', desc: '10 RPM, 20/kun' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: '15 RPM, 1,500/kun' },
  // Gemini 2 qo‘shimcha
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2 Flash Exp', desc: 'Eksperimental' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2 Flash Lite', desc: 'Yengil' },
  { id: 'gemini-2.0-pro-exp-02-05', label: 'Gemini 2 Pro Exp', desc: 'Pro eksperimental' },
  // Gemini 3
  { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', desc: 'Eng kuchli' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', desc: '5 RPM, 20/kun' },
  // Gemma 3
  { id: 'gemma-3-1b-it', label: 'Gemma 3 1B', desc: '30 RPM, 15K TPM' },
  { id: 'gemma-3-2b-it', label: 'Gemma 3 2B', desc: '30 RPM, 15K TPM' },
  { id: 'gemma-3-4b-it', label: 'Gemma 3 4B', desc: '30 RPM, 15K TPM' },
  { id: 'gemma-3-12b-it', label: 'Gemma 3 12B', desc: '30 RPM, 15K TPM' },
  { id: 'gemma-3-27b-it', label: 'Gemma 3 27B', desc: '30 RPM, 15K TPM' },
  // Ollama (lokal yoki hosted)
  { id: 'ollama/llama3.2', label: 'Ollama Llama 3.2', desc: 'Lokal / hosted' },
  { id: 'ollama/llama3.1', label: 'Ollama Llama 3.1', desc: 'Lokal' },
  { id: 'ollama/phi3', label: 'Ollama Phi 3', desc: 'Lokal' },
  { id: 'ollama/qwen2.5', label: 'Ollama Qwen 2.5', desc: 'Lokal' },
  { id: 'ollama/mistral', label: 'Ollama Mistral', desc: 'Lokal' },
  { id: 'ollama/gemma2', label: 'Ollama Gemma 2', desc: 'Lokal' },
] as const

/** Default: barqaror model, Free tier da limitga tushmaslik uchun */
export const DEFAULT_AI_MODEL = 'gemini-1.5-flash'

export const improveResumeSchema = z.object({
  resumeId: z.string().min(1),
  section: z.enum(['personal', 'experience', 'education', 'skills', 'languages', 'certifications']),
  instructions: z.string().min(1),
  language: z.enum(['uz', 'ru', 'en']).optional(),
  model: z.string().max(64).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type GenerateResumeInput = z.infer<typeof generateResumeSchema>
export type ImproveResumeInput = z.infer<typeof improveResumeSchema>

export type ResumeContent = {
  personal: {
    fullName: string
    email: string
    phone: string
    location: string
    summary: string
  }
  experience: Array<{
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    location: string
    year: string
    details?: string
  }>
  skills: string[]
  languages: Array<{ language: string; level: string }>
  certifications: Array<{ name: string; issuer: string; year: string }>
}

export type ResumeListItem = {
  id: string
  slug: string
  title: string
  language: string
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

export type ResumeDetail = ResumeListItem & {
  userId?: string | null
  content: ResumeContent
  rawText: string | null
  templateId: string
  /** Only returned on create for anonymous resumes; store via setEditToken for mutations */
  editToken?: string
}
