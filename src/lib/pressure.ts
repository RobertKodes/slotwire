import { clamp } from './util.ts'

export function congestionProxy(input: {
  slotDelta: number
  medianFeeMicro: number | null
  tps: number | null
  slotMs: number | null
}): number {
  const skipN = input.slotDelta <= 1 ? 0 : clamp((input.slotDelta - 1) / 6, 0, 1)
  const fee = input.medianFeeMicro ?? 0
  const feeN = clamp(Math.log10(1 + fee) / 6, 0, 1)
  const tpsN = input.tps == null ? 0 : clamp((input.tps - 800) / 7000, 0, 1)
  const slowN =
    input.slotMs == null ? 0 : clamp((input.slotMs - 400) / 450, 0, 1)
  return clamp(0.38 * feeN + 0.24 * tpsN + 0.16 * slowN + 0.36 * skipN, 0, 1)
}
