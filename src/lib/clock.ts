import type { CircuitSnap } from '../lib/types.ts'

export function tapeClock(snap: Pick<CircuitSnap, 'mode' | 'originMs' | 'replayMaxMs' | 'frozenClock'>): number {
  if (snap.mode === 'live') return performance.now() - snap.originMs
  if (snap.mode === 'replay') {
    return Math.min(snap.replayMaxMs, Math.max(0, performance.now() - snap.originMs))
  }
  return snap.frozenClock
}
