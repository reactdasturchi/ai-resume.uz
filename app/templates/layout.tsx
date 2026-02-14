import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shablonlar | AI Rezyume',
  description: 'Professional rezyume shablonlari — zamonaviy, klassik, minimal. Tanlang va AI yordamida rezyume yarating.',
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
