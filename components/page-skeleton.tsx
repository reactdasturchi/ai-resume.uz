'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Variant = 'list' | 'form' | 'card-grid' | 'single'

interface PageSkeletonProps {
  variant?: Variant
  className?: string
  /** List: number of rows. Form: number of fields. Card-grid: number of cards. */
  count?: number
}

export function PageSkeleton({
  variant = 'list',
  className,
  count = 3,
}: PageSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <div className={cn('space-y-6 max-w-2xl', className)}>
        <Skeleton className="h-10 w-64 rounded-lg" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg mt-4" />
      </div>
    )
  }

  if (variant === 'card-grid') {
    return (
      <div className={cn('grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // single
  return (
    <div className={cn('max-w-2xl space-y-6', className)}>
      <Skeleton className="h-12 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-32 w-full rounded-xl mt-6" />
    </div>
  )
}
