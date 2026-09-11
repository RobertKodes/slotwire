import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sounderAudio } from '../lib/audio.ts'
import { nextWatch } from '../lib/callsigns.ts'
import { extraClicks, holesFor } from '../lib/punch.ts'
import { congestionProxy } from '../lib/pressure.ts'
import {
  medianFee,
  RpcPool,
  rpcEndpoints,
  sampleTps,
} from '../lib/rpc.ts'
import type { CircuitSnap, PunchEvent, PunchKind, Strike, TapeSave } from '../lib/types.ts'
import { tapeClock } from '../lib/clock.ts'
import { isAbort, sleep } from '../lib/util.ts'

const SLOT_MS = 450
const SLOW_MS = 8000
const SIG_MS = 7000
const EVENT_CAP = 420
const TAPE_WINDOW = 10_000

let nextId = 1

function blank(): CircuitSnap {
  return {
    mode: 'idle',
    line: 'dead',
    endpoint: null,
    slot: null,
    rttMs: null,
    tps: null,
    feeMicro: null,
    pressure: 0,
    mute: false,
    events: [],
    strike: null,
    originMs: 0,
    clockMs: 0,
    frozenClock: 0,
    replayMaxMs: TAPE_WINDOW,
    statusNote: 'LINE DEAD',
  }
}

export function useCircuit() {
  const [snap, setSnap] = useState<CircuitSnap>(blank)
  const snapRef = useRef(snap)
  snapRef.current = snap
  const liveRef = useRef(false)
  const muteRef = useRef(false)
  const idRef = useRef(0)

  const patch = useCallback((partial: Partial<CircuitSnap>) => {
    setSnap((prev) => {
      const next = { ...prev, ...partial }
      snapRef.current = next
      return next
    })
  }, [])

  const pushEvent = useCallback((ev: PunchEvent) => {
    setSnap((prev) => {
      const events = [...prev.events, ev]
      if (events.length > EVENT_CAP) events.splice(0, events.length - EVENT_CAP)
      const next = { ...prev, events }
      snapRef.current = next
      return next
    })
  }, [])

  const strikeNow = useCallback((pressure: number, t: number) => {
    const extra = extraClicks(pressure)
    const strike: Strike = {
      seq: ++idRef.current,
      at: t,
      wall: performance.now(),
      intensity: 0.32 + pressure * 0.68,
      extra,
    }
    patch({ strike, pressure })
    sounderAudio.clack(strike.intensity, extra)
  }, [patch])

  const arm = useCallback(() => {
    sounderAudio.unlock()
    sounderAudio.setMuted(muteRef.current)
    liveRef.current = true
    const originMs = performance.now()
    patch({
      mode: 'live',
      line: 'searching',
      originMs,
      clockMs: 0,
      events: [],
      slot: null,
      statusNote: 'CALLING MAINNET',
    })
  }, [patch])

  const kill = useCallback(() => {
    liveRef.current = false
    const s = snapRef.current
    const frozen =
      s.mode === 'live' ? performance.now() - s.originMs : s.clockMs
    patch({
      mode: 'idle',
      line: 'dead',
      statusNote: 'LINE DEAD',
      strike: null,
      frozenClock: frozen,
      clockMs: frozen,
    })
  }, [patch])

  const setMute = useCallback((mute: boolean) => {
    muteRef.current = mute
    sounderAudio.setMuted(mute)
    patch({ mute })
  }, [patch])

  const saveTape = useCallback((): TapeSave => {
    const s = snapRef.current
    const toMs = tapeClock(s)
    const fromMs = Math.max(0, toMs - TAPE_WINDOW)
    return {
      instrument: 'slotwire',
      version: 1,
      savedAt: new Date().toISOString(),
      endpoint: s.endpoint,
      fromMs,
      toMs,
      events: s.events.filter((e) => e.t >= fromMs && e.t <= toMs),
    }
  }, [])

  const startReplay = useCallback((tape?: TapeSave) => {
    liveRef.current = false
    const s = snapRef.current
    const nowClock = tapeClock(s)
    const saved = tape ?? {
      instrument: 'slotwire' as const,
      version: 1 as const,
      savedAt: new Date().toISOString(),
      endpoint: s.endpoint,
      fromMs: Math.max(0, nowClock - TAPE_WINDOW),
      toMs: nowClock,
      events: s.events.filter((e) => e.t >= nowClock - TAPE_WINDOW),
    }
    const origin = saved.fromMs
    const events = saved.events.map((e) => ({ ...e, t: e.t - origin }))
    const max = Math.max(400, saved.toMs - saved.fromMs)
    patch({
      mode: 'replay',
      line: 'open',
      events,
      originMs: performance.now(),
      clockMs: 0,
      replayMaxMs: max,
      statusNote: 'REPLAY TAPE',
      strike: null,
    })
  }, [patch])

  const setReplayMs = useCallback((ms: number) => {
    patch({ clockMs: ms, originMs: performance.now() - ms })
  }, [patch])

  useEffect(() => {
    if (snap.mode !== 'live') return
    const ac = new AbortController()
    const pool = new RpcPool(rpcEndpoints())
    let lastSlot: number | null = null
    let lastSlow = performance.now()
    let lastSig = performance.now() - 3500
    let watchIndex = 0
    let lastNoline = 0
    let tps: number | null = null
    let slotMs: number | null = null
    let feeMicro: number | null = null
    let lastStress = 0

    const emit = (
      kind: PunchKind,
      slot: number,
      delta: number,
      pressure: number,
      t: number,
      extra?: { label?: string; rttMs?: number },
    ) => {
      pushEvent({
        id: nextId++,
        t,
        slot,
        delta,
        pressure,
        kind,
        holes: holesFor(slot, pressure, kind),
        label: extra?.label,
        rttMs: extra?.rttMs,
      })
    }

    const loop = async () => {
      while (!ac.signal.aborted && liveRef.current) {
        const t = performance.now() - snapRef.current.originMs
        try {
          const t0 = performance.now()
          const slot = await pool.getSlot(ac.signal)
          const rttMs = Math.round(performance.now() - t0)
          const delta = lastSlot == null ? 1 : slot - lastSlot
          const pressure = congestionProxy({
            slotDelta: Math.max(1, delta),
            medianFeeMicro: feeMicro,
            tps,
            slotMs,
          })

          patch({
            line: 'open',
            endpoint: pool.url,
            slot,
            rttMs,
            tps,
            feeMicro,
            pressure,
            statusNote: 'ON CIRCUIT',
            clockMs: t,
          })

          if (lastSlot == null || slot !== lastSlot) {
            if (lastSlot != null && delta > 1) {
              emit('skip', slot, delta, Math.max(pressure, 0.55), t, {
                label: delta > 9 ? 'SKIP+' : 'SKIP',
                rttMs,
              })
            }
            emit('slot', slot, Math.max(1, delta), pressure, t, { rttMs })
            strikeNow(pressure, t)
            if (pressure > 0.78 && t - lastStress > 1400) {
              emit('stress', slot, delta, pressure, t, { label: 'BUSY' })
              lastStress = t
            }
          }
          lastSlot = slot
        } catch (err) {
          if (isAbort(err)) break
          pool.rotate()
          patch({
            line: 'lost',
            endpoint: pool.url,
            statusNote: 'NO LINE — ROTATING',
          })
          if (t - lastNoline > 2800) {
            emit('noline', lastSlot ?? 0, 0, 0.4, t, { label: 'NFG' })
            lastNoline = t
          }
        }

        if (performance.now() - lastSlow > SLOW_MS) {
          lastSlow = performance.now()
          try {
            const [samples, fees] = await Promise.all([
              pool.getPerf(ac.signal),
              pool.getFees(ac.signal),
            ])
            const stats = sampleTps(samples)
            tps = stats?.tps ?? tps
            slotMs = stats?.slotMs ?? slotMs
            feeMicro = medianFee(fees)
            patch({ tps, feeMicro, endpoint: pool.url })
          } catch (err) {
            if (isAbort(err)) break
          }
        }

        if (performance.now() - lastSig > SIG_MS) {
          lastSig = performance.now()
          const watch = nextWatch(watchIndex++)
          try {
            const sigs = await pool.getSigs(watch.id, ac.signal)
            const cur = snapRef.current.slot
            const fresh = sigs.filter((s) => cur == null || cur - s.slot < 80)
            if (fresh.length) {
              const tt = performance.now() - snapRef.current.originMs
              emit('callsign', cur ?? fresh[0]!.slot, 1, snapRef.current.pressure, tt, {
                label: watch.callsign,
              })
              const failed = fresh.find((s) => s.err != null)
              if (failed) {
                emit('fail', failed.slot, 1, 0.7, tt + 40, {
                  label: `F ${watch.callsign}`,
                })
              }
            }
          } catch (err) {
            if (isAbort(err)) break
          }
        }

        try {
          await sleep(SLOT_MS, ac.signal)
        } catch {
          break
        }
      }
    }

    void loop()
    return () => ac.abort()
  }, [snap.mode, patch, pushEvent, strikeNow])

  useEffect(() => {
    if (snap.mode !== 'replay') return
    let raf = 0
    let prev = 0
    const tick = () => {
      const s = snapRef.current
      const next = Math.min(s.replayMaxMs, performance.now() - s.originMs)
      if (next > prev) {
        const crossed = s.events.filter(
          (e) => e.t > prev && e.t <= next && e.kind === 'slot',
        )
        if (crossed.length) {
          strikeNow(crossed[crossed.length - 1]!.pressure, next)
        }
      }
      prev = next
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [snap.mode, strikeNow])

  const downloadTape = useCallback(() => {
    const tape = saveTape()
    const blob = new Blob([JSON.stringify(tape, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `slotwire-tape-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }, [saveTape])

  const loadTapeFile = useCallback(async (file: File) => {
    const text = await file.text()
    const parsed = JSON.parse(text) as TapeSave
    if (parsed.instrument !== 'slotwire' || !Array.isArray(parsed.events)) {
      throw new Error('not a slotwire tape')
    }
    startReplay(parsed)
  }, [startReplay])

  return useMemo(
    () => ({
      snap,
      arm,
      kill,
      setMute,
      saveTape,
      downloadTape,
      startReplay,
      setReplayMs,
      loadTapeFile,
    }),
    [snap, arm, kill, setMute, saveTape, downloadTape, startReplay, setReplayMs, loadTapeFile],
  )
}
