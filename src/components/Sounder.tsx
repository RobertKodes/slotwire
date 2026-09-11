import { useEffect, useRef } from 'react'
import { fitCanvas } from '../draw/canvas.ts'
import { armaturePose, drawSounder } from '../draw/sounder.ts'
import type { Strike } from '../lib/types.ts'

type Props = {
  strike: Strike | null
  live: boolean
  idle: boolean
  reduced: boolean
}

export function Sounder({ strike, live, idle, reduced }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const poseAt = useRef(0)
  const extraRef = useRef(0)
  const seqRef = useRef(0)

  useEffect(() => {
    if (strike && strike.seq !== seqRef.current) {
      seqRef.current = strike.seq
      poseAt.current = performance.now()
      extraRef.current = strike.extra
    }
  }, [strike])

  useEffect(() => {
    const canvas = ref.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    let raf = 0
    let running = true

    const tick = () => {
      if (!running) return
      const rect = wrap.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w >= 8 && h >= 8) {
        const ctx = fitCanvas(canvas, w, h)
        const elapsed = performance.now() - poseAt.current
        const pose = armaturePose(elapsed, extraRef.current, reduced)
        drawSounder(ctx, w, h, pose, live, idle)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [live, idle, reduced])

  return (
    <div className="sounder-well" ref={wrapRef}>
      <canvas ref={ref} aria-label="Telegraph sounder" />
    </div>
  )
}
