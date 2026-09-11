import { cssVar, lerp } from '../lib/util.ts'
import { roundRect } from './canvas.ts'

export function armaturePose(elapsedMs: number, extra: number, reduced: boolean): number {
  if (elapsedMs < 0 || elapsedMs > 420) return 0
  if (reduced) {
    if (elapsedMs < 90) return 1
    return 0
  }
  const buzz = extra > 0 && elapsedMs < 30 + extra * 28 ? 1 : 0
  if (elapsedMs < 18) return elapsedMs / 18
  const t = elapsedMs - 18
  const spring = Math.exp(-t / 72) * Math.cos(t / 16)
  return Math.max(buzz * 0.85, Math.abs(spring))
}

export function drawSounder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pose: number,
  live: boolean,
  idle: boolean,
): void {
  const brass = cssVar('--brass', '#c4a15a')
  const brassB = cssVar('--brass-bright', '#e6d199')
  const brassO = cssVar('--brass-oxide', '#6b4e24')
  const brassD = cssVar('--brass-deep', '#3d2c12')
  const soot = cssVar('--soot', '#100e0b')
  const copper = cssVar('--copper', '#b87333')
  const felt = cssVar('--felt-green', '#243226')
  const ink = cssVar('--ink', '#1c1610')
  const tungsten = cssVar('--tungsten', '#f2c36b')

  ctx.clearRect(0, 0, w, h)

  const g = ctx.createRadialGradient(w * 0.45, h * 0.1, 10, w * 0.5, h * 0.55, w * 0.7)
  g.addColorStop(0, live ? 'rgba(242,195,107,0.16)' : 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = felt
  roundRect(ctx, 18, h - 46, w - 36, 28, 4)
  ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  roundRect(ctx, 22, h - 42, w - 44, 8, 2)
  ctx.fill()

  const bx = 36
  const by = h - 92
  const bw = w - 72
  const bh = 52
  const plate = ctx.createLinearGradient(bx, by, bx, by + bh)
  plate.addColorStop(0, brassB)
  plate.addColorStop(0.35, brass)
  plate.addColorStop(1, brassO)
  ctx.fillStyle = plate
  roundRect(ctx, bx, by, bw, bh, 5)
  ctx.fill()
  ctx.strokeStyle = brassD
  ctx.lineWidth = 1.2
  ctx.stroke()

  ctx.fillStyle = brassD
  ctx.font = '11px "Special Elite", serif'
  ctx.textAlign = 'center'
  ctx.fillText('W.U. CO.  ·  SOUNDER  3-A', bx + bw / 2, by + bh - 10)

  drawScrew(ctx, bx + 12, by + 12, brass, brassD)
  drawScrew(ctx, bx + bw - 12, by + 12, brass, brassD)
  drawScrew(ctx, bx + 12, by + bh - 22, brass, brassD)
  drawScrew(ctx, bx + bw - 12, by + bh - 22, brass, brassD)

  drawCoil(ctx, w * 0.38, h * 0.52, copper, brass, brassD, soot)
  drawCoil(ctx, w * 0.56, h * 0.52, copper, brass, brassD, soot)

  ctx.strokeStyle = brassO
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(w * 0.22, h * 0.62)
  ctx.lineTo(w * 0.22, h * 0.28)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w * 0.78, h * 0.62)
  ctx.lineTo(w * 0.78, h * 0.34)
  ctx.stroke()

  const restY = h * 0.275
  const hitY = h * 0.355
  const armY = lerp(restY, hitY, pose)
  const armX0 = w * 0.18
  const armX1 = w * 0.82

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(armX0 + 8, armY + 10, armX1 - armX0 - 10, 6)

  const armGrad = ctx.createLinearGradient(armX0, armY, armX0, armY + 14)
  armGrad.addColorStop(0, brassB)
  armGrad.addColorStop(0.5, brass)
  armGrad.addColorStop(1, brassO)
  ctx.fillStyle = armGrad
  roundRect(ctx, armX0, armY, armX1 - armX0, 11, 2)
  ctx.fill()
  ctx.strokeStyle = brassD
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = brassD
  ctx.beginPath()
  ctx.arc(w * 0.22, armY + 5.5, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = brassB
  ctx.beginPath()
  ctx.arc(w * 0.22, armY + 5.5, 2.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = soot
  roundRect(ctx, armX1 - 22, armY - 3, 20, 16, 2)
  ctx.fill()
  ctx.fillStyle = brass
  ctx.fillRect(armX1 - 16, armY + 2, 8, 6)

  ctx.fillStyle = brassO
  roundRect(ctx, w * 0.74, h * 0.40, 28, 10, 2)
  ctx.fill()
  ctx.fillStyle = brassD
  ctx.fillRect(w * 0.76, h * 0.385, 6, 8)
  ctx.fillRect(w * 0.81, h * 0.385, 6, 8)

  if (pose > 0.55 && live) {
    ctx.fillStyle = `rgba(242,195,107,${0.18 + pose * 0.2})`
    ctx.beginPath()
    ctx.arc(armX1 - 12, armY + 14, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = tungsten
    ctx.globalAlpha = 0.35 * pose
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(armX1 - 18, armY + 16)
    ctx.lineTo(armX1 - 6, armY + 22)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = brass
  ctx.beginPath()
  ctx.arc(w * 0.14, h * 0.70, 7, 0, Math.PI * 2)
  ctx.arc(w * 0.20, h * 0.70, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = brassD
  ctx.beginPath()
  ctx.arc(w * 0.14, h * 0.70, 2.5, 0, Math.PI * 2)
  ctx.arc(w * 0.20, h * 0.70, 2.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = ink
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(w * 0.14, h * 0.70)
  ctx.lineTo(w * 0.14, h * 0.78)
  ctx.lineTo(w * 0.38, h * 0.78)
  ctx.moveTo(w * 0.20, h * 0.70)
  ctx.lineTo(w * 0.20, h * 0.82)
  ctx.lineTo(w * 0.56, h * 0.82)
  ctx.stroke()
  ctx.globalAlpha = 1

  if (idle) {
    ctx.fillStyle = 'rgba(16,14,11,0.28)'
    ctx.fillRect(0, 0, w, h)
  }
}

function drawCoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  copper: string,
  brass: string,
  brassD: string,
  soot: string,
): void {
  ctx.fillStyle = brassD
  ctx.fillRect(cx - 22, cy + 28, 44, 8)
  ctx.fillStyle = brass
  ctx.beginPath()
  ctx.ellipse(cx, cy - 26, 20, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  const wrap = ctx.createLinearGradient(cx - 20, cy, cx + 20, cy)
  wrap.addColorStop(0, '#6a3a16')
  wrap.addColorStop(0.45, copper)
  wrap.addColorStop(1, '#4a2410')
  ctx.fillStyle = wrap
  ctx.fillRect(cx - 20, cy - 26, 40, 54)
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 1
  for (let i = 0; i < 11; i++) {
    const y = cy - 22 + i * 4.6
    ctx.beginPath()
    ctx.ellipse(cx, y, 20, 5, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.fillStyle = soot
  ctx.beginPath()
  ctx.ellipse(cx, cy - 26, 8, 3, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawScrew(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brass: string,
  brassD: string,
): void {
  ctx.fillStyle = brass
  ctx.beginPath()
  ctx.arc(x, y, 4.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = brassD
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - 2.4, y)
  ctx.lineTo(x + 2.4, y)
  ctx.moveTo(x, y - 2.4)
  ctx.lineTo(x, y + 2.4)
  ctx.stroke()
}
