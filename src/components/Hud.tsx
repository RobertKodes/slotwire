import type { CircuitSnap } from '../lib/types.ts'
import { groupDigits, hostOf } from '../lib/util.ts'

type Props = {
  snap: CircuitSnap
  onMute: (mute: boolean) => void
}

export function Hud({ snap, onMute }: Props) {
  const host = snap.endpoint ? hostOf(snap.endpoint) : '—'
  const slot = snap.slot == null ? '—' : groupDigits(snap.slot)
  const rtt = snap.rttMs == null ? '—' : `${snap.rttMs} ms`
  const tps =
    snap.tps == null ? '—' : `${snap.tps >= 1000 ? (snap.tps / 1000).toFixed(1) + 'k' : snap.tps.toFixed(0)} tps`
  const fee = snap.feeMicro == null ? '—' : `${Math.round(snap.feeMicro)} µL`
  const load = `${Math.round(snap.pressure * 100)}%`

  return (
    <aside className="hud" aria-label="Circuit HUD">
      <div className="hud-row">
        <span>LINE</span>
        <b className={`lamp lamp-${snap.line}`}>{snap.statusNote}</b>
      </div>
      <div className="hud-row">
        <span>ENDPOINT</span>
        <b className="hud-ep" title={snap.endpoint ?? undefined}>{host}</b>
      </div>
      <div className="hud-row">
        <span>SLOT</span>
        <b className="hud-slot">{slot}</b>
      </div>
      <div className="hud-row">
        <span>RTT</span>
        <b>{rtt}</b>
      </div>
      <div className="hud-row">
        <span>SAMPLE</span>
        <b>{tps}</b>
      </div>
      <div className="hud-row">
        <span>PRIO</span>
        <b>{fee}</b>
      </div>
      <div className="hud-row">
        <span>LOAD</span>
        <b>{load}</b>
      </div>
      <div className="hud-row hud-mute">
        <span>SOUNDER</span>
        <button
          type="button"
          className={snap.mute ? 'bakelite is-off' : 'bakelite'}
          onClick={() => onMute(!snap.mute)}
          aria-pressed={snap.mute}
        >
          {snap.mute ? 'MUTED' : 'LIVE'}
        </button>
      </div>
    </aside>
  )
}
