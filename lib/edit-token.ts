const STORAGE_KEY = 'ai-resume-edit-token'

/**
 * Store edit token for an anonymous resume. Used for subsequent mutations (improve, delete, generatePdf).
 * Stored in localStorage so it persists across tab closes and browser restarts.
 */
export function setEditToken(resumeId: string, token: string): void {
  if (typeof window === 'undefined') return
  try {
    const map = getStoredMap()
    map[resumeId] = token
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // localStorage might be full or disabled
  }
}

/**
 * Retrieve edit token for an anonymous resume. Returns undefined if not found.
 */
export function getEditToken(resumeId: string): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const map = getStoredMap()
    return map[resumeId]
  } catch {
    return undefined
  }
}

const RESUMES_IDS_KEY = 'ai-resume-ids'

/**
 * Add resume ID to the list of anonymously created resumes (for listing on /resumes when not logged in).
 */
export function addResumeId(resumeId: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getResumeIds()
    if (!ids.includes(resumeId)) {
      ids.unshift(resumeId)
      localStorage.setItem(RESUMES_IDS_KEY, JSON.stringify(ids.slice(0, 100)))
    }
  } catch {
    //
  }
}

/**
 * Get list of resume IDs created by anonymous user in this browser.
 */
export function getResumeIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RESUMES_IDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * Remove resume ID from the list (e.g. when deleted).
 */
export function removeResumeId(resumeId: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getResumeIds().filter((id) => id !== resumeId)
    localStorage.setItem(RESUMES_IDS_KEY, JSON.stringify(ids))
  } catch {
    //
  }
}

function getStoredMap(): Record<string, string> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}
