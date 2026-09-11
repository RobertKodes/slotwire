export function holesFor(slot: number, pressure: number, kind: string): boolean[] {
  const bits = [false, false, false, false, false]
  const n = (slot ^ (slot >>> 5) ^ Math.floor(pressure * 17)) & 31
  for (let i = 0; i < 5; i++) bits[i] = Boolean(n & (1 << i))
  if (pressure > 0.32) bits[1] = true
  if (pressure > 0.52) bits[3] = true
  if (pressure > 0.72) bits[0] = true
  if (pressure > 0.88) bits[4] = true
  if (kind === 'skip' || kind === 'fail' || kind === 'noline') {
    bits[0] = true
    bits[4] = true
  }
  if (kind === 'stress') {
    bits[2] = true
    bits[3] = true
  }
  if (!bits.some(Boolean)) bits[2] = true
  return bits
}

export function extraClicks(pressure: number): number {
  if (pressure < 0.22) return 0
  if (pressure < 0.4) return 1
  if (pressure < 0.62) return 2
  if (pressure < 0.82) return 3
  return 4
}
