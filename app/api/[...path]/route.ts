/**
 * Barcha /api/* so'rovlarni backend (NEXT_PUBLIC_API_URL) ga proxy qiladi.
 * Rewrite ishlamasa (masalan Turbopack) bu route ishlatiladi.
 */
const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type RouteContext = { params: Promise<{ path: string[] | string }> }

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context)
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context)
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context)
}

export async function PUT(request: Request, context: RouteContext) {
  return proxy(request, context)
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context)
}

export async function OPTIONS(request: Request, context: RouteContext) {
  return proxy(request, context)
}

async function proxy(request: Request, _context: RouteContext) {
  // Pathni so'rov URLidan olamiz (relative yoki absolute URL bo'lishi mumkin)
  let pathname: string
  let search = ''
  try {
    const requestUrl = request.url.startsWith('http') ? new URL(request.url) : new URL(request.url, 'http://localhost')
    pathname = requestUrl.pathname
    search = requestUrl.search
  } catch {
    pathname = request.url.split('?')[0] || '/'
    search = request.url.includes('?') ? '?' + request.url.split('?')[1] : ''
  }
  const pathAfterApi = pathname.replace(/^\/api\/?/, '').trim() || ''
  const base = BACKEND.replace(/\/$/, '')
  const fullUrl = `${base}/api/${pathAfterApi}${search}`
  if (process.env.NODE_ENV === 'development') {
    console.log('[api proxy]', request.method, fullUrl)
  }

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: request.cache,
  }
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
    init.body = request.body
  }

  let res: Response
  try {
    res = await fetch(fullUrl, init)
  } catch (err) {
    console.error('[api proxy] backend unreachable:', fullUrl, err)
    return new Response(
      JSON.stringify({
        error: 'Backend ga ulanish imkonsiz. Server (port 4000) ishlayotganligini tekshiring.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }
  const contentType = res.headers.get('content-type')
  let body: string | object
  if (res.status === 204 || res.body === null) {
    body = ''
  } else if (contentType?.includes('application/json')) {
    body = await res.json()
  } else {
    body = await res.text()
  }

  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status: res.status,
    statusText: res.statusText,
    headers: {
      'Content-Type': res.status === 204 ? 'text/plain' : (contentType ?? 'application/json'),
    },
  })
}
