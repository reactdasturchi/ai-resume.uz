import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mening rezyumelarim | AI Rezyume',
  description: 'Barcha yaratilgan rezyumelaringizni boshqarish, qidirish va nusxalash.',
}

export default function ResumesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
