export type LineState = 'dead' | 'searching' | 'open' | 'lost'

export type PunchKind = 'slot' | 'skip' | 'fail' | 'stress' | 'callsign' | 'noline'

export type PunchEvent = {
  id: number
  t: number
  slot: number
  delta: number
  pressure: number
  kind: PunchKind
  holes: boolean[]
  label?: string
  rttMs?: number
}

export type Strike = {
  seq: number
  at: number
  wall: number
  intensity: number
  extra: number
}

export type TapeSave = {
  instrument: 'slotwire'
  version: 1
  savedAt: string
  endpoint: string | null
  fromMs: number
  toMs: number
  events: PunchEvent[]
}

export type CircuitSnap = {
  mode: 'idle' | 'live' | 'replay'
  line: LineState
  endpoint: string | null
  slot: number | null
  rttMs: number | null
  tps: number | null
  feeMicro: number | null
  pressure: number
  mute: boolean
  events: PunchEvent[]
  strike: Strike | null
  originMs: number
  clockMs: number
  frozenClock: number
  replayMaxMs: number
  statusNote: string
}
