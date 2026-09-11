import type { PunchEvent } from '../lib/types.ts'
import { cssVar, hash01 } from '../lib/util.ts'
import { roundRect } from './canvas.ts'

export const PX_PER_MS = 0.055
export const PUNCH_HEAD = 86

export function drawTape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  events: PunchEvent[],
  clockMs: number,
  live: boolean,
  reduced: boolean,
  needle: number,
): void {
  const cream = cssVar('--paper-cream', '#e6d7b8')
  const aged = cssVar('--paper-aged', '#cbb992')
  const ink = cssVar('--ink', '#1c1610')
  const inkF = cssVar('--ink-faded', '#5c4e3a')
  const red = cssVar('--alert-red', '#9b2a1a')
  const redInk = cssVar('--alert-red-ink', '#7a1e14')
  const brass = cssVar('--brass', '#c4a15a')
  const brassO = cssVar('--brass-oxide', '#6b4e24')
  const brassD = cssVar('--brass-deep', '#3d2c12')
  const soot = cssVar('--soot', '#100e0b')

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = soot
  ctx.fillRect(0, 0, w, h)

  const tapeY = 10
  const tapeH = h - 20
  const paperW = w - 28

  ctx.save()
  ctx.beginPath()
  roundRect(ctx, 10, tapeY, paperW, tapeH, 3)
  ctx.clip()

  const paper = ctx.createLinearGradient(0, tapeY, 0, tapeY + tapeH)
  paper.addColorStop(0, aged)
  paper.addColorStop(0.12, cream)
  paper.addColorStop(0.88, cream)
  paper.addColorStop(1, aged)
  ctx.fillStyle = paper
  ctx.fillRect(10, tapeY, paperW, tapeH)

  const cam = cameraX(clockMs, w, reduced)
  const startX = Math.floor((cam - 40) / 10) * 10
  const endX = cam + w + 40

  ctx.strokeStyle = 'rgba(92,78,58,0.18)'
  ctx.lineWidth = 1
  for (let y = tapeY + 8; y < tapeY + tapeH; y += 7) {
    ctx.beginPath()
    ctx.moveTo(10, y)
    ctx.lineTo(10 + paperW, y)
    ctx.stroke()
  }

  for (let wx = startX; wx < endX; wx += 22) {
    const hx = worldToScreen(wx, cam)
    if (hash01(wx * 3 + 9) > 0.82) {
      ctx.fillStyle = `rgba(160,120,70,${0.08 + hash01(wx) * 0.12})`
      ctx.beginPath()
      ctx.ellipse(
        hx + hash01(wx + 1) * 18,
        tapeY + 20 + hash01(wx + 4) * (tapeH - 40),
        8 + hash01(wx + 2) * 10,
        5 + hash01(wx + 5) * 6,
        hash01(wx + 7) * 1.2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }

  const sprocketY0 = tapeY + 14
  const sprocketY1 = tapeY + tapeH - 14
  for (let wx = startX; wx < endX; wx += 10) {
    const x = worldToScreen(wx, cam)
    drawSprocket(ctx, x, sprocketY0, cream)
    drawSprocket(ctx, x, sprocketY1, cream)
  }

  const rows = rowYs(tapeY, tapeH)
  for (const ev of events) {
    const x = worldToScreen(ev.t * PX_PER_MS, cam)
    if (x < -30 || x > w + 20) continue
    const hot = ev.kind === 'fail' || ev.kind === 'skip' || ev.kind === 'noline'
    const stress = ev.kind === 'stress'
    for (let i = 0; i < 5; i++) {
      if (!ev.holes[i]) continue
      drawHole(ctx, x, rows[i]!, hot ? redInk : ink, cream)
    }
    if (hot) drawStamp(ctx, x + 10, tapeY + tapeH * 0.52, stampText(ev), red, redInk)
    if (stress && !hot) drawStamp(ctx, x + 8, tapeY + tapeH * 0.3, 'BUSY', inkF, ink)
    if (ev.kind === 'callsign' && ev.label) {
      ctx.save()
      ctx.fillStyle = ink
      ctx.globalAlpha = 0.82
      ctx.font = '13px "Courier Prime", "Courier New", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(ev.label, x + 6, tapeY + 36)
      ctx.restore()
    }
    if (ev.kind === 'slot' && ev.slot % 8 === 0) {
      ctx.fillStyle = inkF
      ctx.globalAlpha = 0.55
      ctx.font = '9px "Courier Prime", "Courier New", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(String(ev.slot).slice(-5), x, tapeY + tapeH - 6)
      ctx.globalAlpha = 1
    }
  }

  ctx.restore()

  ctx.strokeStyle = 'rgba(28,22,16,0.55)'
  ctx.lineWidth = 2
  roundRect(ctx, 10, tapeY, paperW, tapeH, 3)
  ctx.stroke()

  drawRoll(ctx, 4, tapeY - 2, tapeH + 4, aged, brassD, soot)
  drawPunchHead(ctx, w - PUNCH_HEAD + 8, tapeY - 6, tapeH + 12, needle, brass, brassO, brassD, live)
}

function cameraX(clockMs: number, w: number, reduced: boolean): number {
  const head = w - PUNCH_HEAD
  if (reduced) {
    const step = Math.floor(clockMs / 180) * 180 * PX_PER_MS
    return step - head
  }
  return clockMs * PX_PER_MS - head
}

function worldToScreen(worldX: number, cam: number): number {
  return worldX - cam
}

function rowYs(tapeY: number, tapeH: number): number[] {
  const top = tapeY + 32
  const bot = tapeY + tapeH - 32
  const span = bot - top
  return [0, 1, 2, 3, 4].map((i) => top + (span * i) / 4)
}

function drawSprocket(ctx: CanvasRenderingContext2D, x: number, y: number, cream: string): void {
  ctx.fillStyle = 'rgba(16,14,11,0.78)'
  ctx.beginPath()
  ctx.ellipse(x, y, 3.1, 3.4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.globalAlpha = 0.35
  ctx.beginPath()
  ctx.ellipse(x, y + 1.2, 1.4, 1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawHole(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  cream: string,
): void {
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.ellipse(x, y, 3.4, 4.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.globalAlpha = 0.28
  ctx.beginPath()
  ctx.ellipse(x, y + 1.6, 1.6, 1.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  ring: string,
  fill: string,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.18)
  ctx.strokeStyle = ring
  ctx.globalAlpha = 0.72
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = fill
  ctx.globalAlpha = 0.8
  ctx.font = '11px "Special Elite", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 1)
  ctx.restore()
}

function stampText(ev: PunchEvent): string {
  if (ev.kind === 'noline') return 'NFG'
  if (ev.kind === 'fail') return ev.label ?? 'FAIL'
  if (ev.kind === 'skip') return ev.label ?? 'SKIP'
  return 'ERR'
}

function drawRoll(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  aged: string,
  brassD: string,
  soot: string,
): void {
  const g = ctx.createLinearGradient(x, 0, x + 22, 0)
  g.addColorStop(0, soot)
  g.addColorStop(0.45, brassD)
  g.addColorStop(0.7, aged)
  g.addColorStop(1, soot)
  ctx.fillStyle = g
  roundRect(ctx, x, y, 22, h, 4)
  ctx.fill()
  ctx.fillStyle = soot
  ctx.beginPath()
  ctx.arc(x + 11, y + h / 2, 5, 0, Math.PI * 2)
  ctx.fill()
}

function drawPunchHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  needle: number,
  brass: string,
  brassO: string,
  brassD: string,
  live: boolean,
): void {
  const g = ctx.createLinearGradient(x, y, x + 70, y)
  g.addColorStop(0, 'rgba(61,44,18,0)')
  g.addColorStop(0.25, brassO)
  g.addColorStop(1, brass)
  ctx.fillStyle = g
  roundRect(ctx, x, y, 70, h, 3)
  ctx.fill()
  ctx.strokeStyle = brassD
  ctx.lineWidth = 1.2
  ctx.stroke()

  const ny = y + 18 + needle * 10
  ctx.fillStyle = brassD
  ctx.fillRect(x + 28, y + 8, 10, 14)
  ctx.fillStyle = live ? '#1c1610' : brassO
  ctx.fillRect(x + 31, ny, 4, h - 36)
  ctx.fillStyle = brass
  ctx.fillRect(x + 29, ny + h - 42, 8, 8)

  ctx.fillStyle = brassD
  ctx.font = '9px "Special Elite", serif'
  ctx.textAlign = 'center'
  ctx.fillText('PUNCH', x + 36, y + h - 8)
}
