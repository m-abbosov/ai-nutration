import { useEffect, useState } from 'react'

/** True on the frame after mount — used to trigger CSS transitions (ring fill,
 * bar width) from a 0 starting state, matching the design's `mounted` flag. */
export function useMountedTransition(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])
  return mounted
}
