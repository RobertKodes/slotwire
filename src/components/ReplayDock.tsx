import { useEffect, useRef, useState } from 'react'
import { tapeClock } from '../lib/clock.ts'
import type { CircuitSnap } from '../lib/types.ts'

type Props = {
  snap: CircuitSnap
  onSave: () => void
  onReplay: () => void
  onLive: () => void
  onScrub: (ms: number) => void
  onLoad: (file: File) => void
}

export function ReplayDock({ snap, onSave, onReplay, onLive, onScrub, onLoad }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pos, setPos] = useState(0)
  const armed = snap.mode !== 'idle'

  useEffect(() => {
    if (snap.mode !== 'replay') return
    let raf = 0
    const tick = () => {
      setPos(tapeClock(snap))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [snap, snap.mode, snap.originMs])

  return (
    <div className="replay">
      <button type="button" className="chip" onClick={onSave} disabled={!armed && snap.events.length === 0}>
        SAVE 10s
      </button>
      <button type="button" className="chip" onClick={onReplay} disabled={snap.events.length === 0}>
        REPLAY
      </button>
      <button type="button" className="chip" onClick={() => fileRef.current?.click()}>
        LOAD
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void onLoad(f)
          e.target.value = ''
        }}
      />
      {snap.mode === 'replay' ? (
        <>
          <label className="scrub">
            <span>SCRUB</span>
            <input
              type="range"
              min={0}
              max={snap.replayMaxMs}
              value={pos}
              onChange={(e) => onScrub(Number(e.target.value))}
            />
          </label>
          <button type="button" className="chip chip-live" onClick={onLive}>
            ARM AGAIN
          </button>
        </>
      ) : null}
    </div>
  )
}
