import { useEffect, useRef } from 'react'
import { fitCanvas } from '../draw/canvas.ts'
import { drawTape } from '../draw/tape.ts'
import { tapeClock } from '../lib/clock.ts'
import type { CircuitSnap } from '../lib/types.ts'

type Props = {
  snap: CircuitSnap
  reduced: boolean
}

export function PaperTape({ snap, reduced }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const snapRef = useRef(snap)
  snapRef.current = snap

  useEffect(() => {
    const canvas = ref.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    let raf = 0
    let running = true
    const tick = () => {
      if (!running) return
      const s = snapRef.current
      const rect = wrap.getBoundingClientRect()
      const w = Math.max(320, rect.width)
      const h = Math.max(140, rect.height)
      const ctx = fitCanvas(canvas, w, h)
      const clock = tapeClock(s)
      const needle =
        s.strike && performance.now() - s.strike.wall < 90 ? 1 : 0
      const live = s.mode !== 'idle'
      drawTape(ctx, w, h, s.events, clock, live, reduced, live ? needle : 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <section className="tape-bay" aria-label="Punched paper tape">
      <div className="tape-label">
        <span>PAPER TAPE</span>
        <span>5-UNIT · SLOT / FEE / CALLSIGN</span>
      </div>
      <div className="tape-frame" ref={wrapRef}>
        <canvas ref={ref} />
      </div>
    </section>
  )
}
