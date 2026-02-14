import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil | AI Rezyume',
  description: 'Profil ma’lumotlaringiz, token va rezyume statistikasi.',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
