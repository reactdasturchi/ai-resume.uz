'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="uz">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col items-center justify-center p-6">
        <main id="main-content" className="max-w-md w-full text-center space-y-6" tabIndex={-1}>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Xatolik yuz berdi
          </h1>
          <p className="text-muted-foreground">
            Ilova ishlashda xato. Sahifani yangilang yoki keyinroq qayta urinib ko‘ring.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Sahifani yangilash
          </button>
        </main>
      </body>
    </html>
  )
}
