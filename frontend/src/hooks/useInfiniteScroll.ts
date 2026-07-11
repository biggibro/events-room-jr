import { useEffect, useRef } from 'react'

type UseInfiniteScrollOptions = {
  enabled?: boolean
  rootMargin?: string
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  { enabled = true, rootMargin = '200px' }: UseInfiniteScrollOptions = {},
) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sentinelRef.current
    if (!element || !enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, onLoadMore, rootMargin])

  return sentinelRef
}
