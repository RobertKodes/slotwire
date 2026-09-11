import { clamp } from './util.ts'

export class SounderAudio {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private unlocked = false
  muted = false

  unlock(): void {
    const ctx = this.ensure()
    void ctx.resume()
    if (!this.unlocked) {
      const g = ctx.createGain()
      g.gain.value = 0.0001
      g.connect(ctx.destination)
      const o = ctx.createOscillator()
      o.frequency.value = 40
      o.connect(g)
      o.start()
      o.stop(ctx.currentTime + 0.04)
      this.unlocked = true
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.master) this.master.gain.value = muted ? 0 : 0.9
  }

  clack(intensity: number, extra: number): void {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running' || this.muted) return
    const n = 1 + Math.max(0, extra)
    for (let i = 0; i < n; i++) {
      const when = ctx.currentTime + i * 0.028
      const hot = clamp(intensity + i * 0.04, 0.2, 1)
      this.strike(ctx, when, hot, i > 0)
    }
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.9
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  private strike(ctx: AudioContext, when: number, intensity: number, train: boolean): void {
    const master = this.master
    if (!master) return

    const dur = 0.055
    const noise = ctx.createBufferSource()
    const frames = Math.floor(ctx.sampleRate * dur)
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let acc = 0
    for (let i = 0; i < frames; i++) {
      acc = acc * 0.92 + (Math.random() * 2 - 1) * 0.4
      data[i] = acc
    }
    noise.buffer = buf

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = train ? 1650 : 2100 + intensity * 700
    bp.Q.value = 7.5

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 420

    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.0001, when)
    ng.gain.exponentialRampToValueAtTime(0.22 + intensity * 0.28, when + 0.004)
    ng.gain.exponentialRampToValueAtTime(0.0001, when + dur)

    noise.connect(bp)
    bp.connect(hp)
    hp.connect(ng)
    ng.connect(master)
    noise.start(when)
    noise.stop(when + dur)

    const ping = ctx.createOscillator()
    ping.type = 'triangle'
    ping.frequency.setValueAtTime(train ? 1480 : 1880 + intensity * 420, when)
    ping.frequency.exponentialRampToValueAtTime(420, when + 0.07)
    const pg = ctx.createGain()
    pg.gain.setValueAtTime(0.0001, when)
    pg.gain.exponentialRampToValueAtTime(0.07 + intensity * 0.08, when + 0.003)
    pg.gain.exponentialRampToValueAtTime(0.0001, when + 0.08)
    ping.connect(pg)
    pg.connect(master)
    ping.start(when)
    ping.stop(when + 0.09)

    const thump = ctx.createOscillator()
    thump.type = 'sine'
    thump.frequency.value = 110 + intensity * 40
    const tg = ctx.createGain()
    tg.gain.setValueAtTime(0.0001, when)
    tg.gain.exponentialRampToValueAtTime(0.09 + intensity * 0.06, when + 0.002)
    tg.gain.exponentialRampToValueAtTime(0.0001, when + 0.045)
    thump.connect(tg)
    tg.connect(master)
    thump.start(when)
    thump.stop(when + 0.05)

    const clack = ctx.createOscillator()
    clack.type = 'square'
    clack.frequency.value = train ? 980 : 1260
    const cg = ctx.createGain()
    const t2 = when + 0.018
    cg.gain.setValueAtTime(0.0001, t2)
    cg.gain.exponentialRampToValueAtTime(0.035 + intensity * 0.03, t2 + 0.002)
    cg.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.03)
    clack.connect(cg)
    cg.connect(master)
    clack.start(t2)
    clack.stop(t2 + 0.035)
  }
}

export const sounderAudio = new SounderAudio()
