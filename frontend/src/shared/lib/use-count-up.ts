import { useEffect, useRef, useState } from 'react'

/** Eases a number up from 0 to `target` over `durationMs`, matching the
 * design's kcal counter animation (cubic ease-out). */
export function useCountUp(target: number, durationMs = 1100): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, durationMs])

  return value
}
