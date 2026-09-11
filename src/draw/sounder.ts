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
  const walnut = cssVar('--walnut', '#2c1a0e')

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = felt
  ctx.fillRect(0, 0, w, h)

  const g = ctx.createRadialGradient(w * 0.5, h * 0.08, 8, w * 0.5, h * 0.45, Math.max(w, h) * 0.55)
  g.addColorStop(0, live ? 'rgba(242,195,107,0.20)' : 'rgba(0,0,0,0.08)')
  g.addColorStop(1, 'rgba(0,0,0,0.22)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const dw = Math.min(420, w - 24)
  const dh = Math.min(280, h - 16)
  const ox = (w - dw) / 2
  const oy = (h - dh) / 2
  ctx.save()
  ctx.translate(ox, oy)

  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  roundRect(ctx, 28, dh - 38, dw - 56, 22, 6)
  ctx.fill()

  const bx = 48
  const by = dh - 86
  const bw = dw - 96
  const bh = 58
  ctx.fillStyle = walnut
  roundRect(ctx, bx - 8, by + 18, bw + 16, bh - 6, 4)
  ctx.fill()

  const plate = ctx.createLinearGradient(bx, by, bx, by + bh)
  plate.addColorStop(0, brassB)
  plate.addColorStop(0.38, brass)
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
  ctx.fillText('W.U. CO.  ·  SOUNDER  3-A', bx + bw / 2, by + bh - 12)

  drawScrew(ctx, bx + 14, by + 14, brass, brassD)
  drawScrew(ctx, bx + bw - 14, by + 14, brass, brassD)
  drawScrew(ctx, bx + 14, by + bh - 24, brass, brassD)
  drawScrew(ctx, bx + bw - 14, by + bh - 24, brass, brassD)

  const coilY = dh * 0.52
  drawCoil(ctx, dw * 0.38, coilY, copper, brass, brassD, soot)
  drawCoil(ctx, dw * 0.58, coilY, copper, brass, brassD, soot)

  ctx.strokeStyle = brassO
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(dw * 0.22, dh * 0.62)
  ctx.lineTo(dw * 0.22, dh * 0.30)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(dw * 0.78, dh * 0.62)
  ctx.lineTo(dw * 0.78, dh * 0.36)
  ctx.stroke()

  const restY = dh * 0.28
  const hitY = dh * 0.38
  const armY = lerp(restY, hitY, pose)
  const armX0 = dw * 0.16
  const armX1 = dw * 0.84

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(armX0 + 6, armY + 11, armX1 - armX0 - 8, 5)

  const armGrad = ctx.createLinearGradient(armX0, armY, armX0, armY + 14)
  armGrad.addColorStop(0, brassB)
  armGrad.addColorStop(0.5, brass)
  armGrad.addColorStop(1, brassO)
  ctx.fillStyle = armGrad
  roundRect(ctx, armX0, armY, armX1 - armX0, 12, 2)
  ctx.fill()
  ctx.strokeStyle = brassD
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = brassD
  ctx.beginPath()
  ctx.arc(dw * 0.22, armY + 6, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = brassB
  ctx.beginPath()
  ctx.arc(dw * 0.22, armY + 6, 2.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = soot
  roundRect(ctx, armX1 - 24, armY - 4, 22, 18, 2)
  ctx.fill()
  ctx.fillStyle = brass
  ctx.fillRect(armX1 - 17, armY + 2, 9, 7)

  ctx.fillStyle = brassO
  roundRect(ctx, dw * 0.72, dh * 0.42, 32, 11, 2)
  ctx.fill()
  ctx.fillStyle = brassD
  ctx.fillRect(dw * 0.74, dh * 0.4, 7, 9)
  ctx.fillRect(dw * 0.80, dh * 0.4, 7, 9)

  if (pose > 0.5 && live) {
    ctx.fillStyle = `rgba(242,195,107,${0.16 + pose * 0.22})`
    ctx.beginPath()
    ctx.arc(armX1 - 12, armY + 16, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = tungsten
    ctx.globalAlpha = 0.4 * pose
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(armX1 - 20, armY + 18)
    ctx.lineTo(armX1 - 4, armY + 26)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.fillStyle = brass
  ctx.beginPath()
  ctx.arc(dw * 0.18, dh * 0.72, 7, 0, Math.PI * 2)
  ctx.arc(dw * 0.26, dh * 0.72, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = brassD
  ctx.beginPath()
  ctx.arc(dw * 0.18, dh * 0.72, 2.4, 0, Math.PI * 2)
  ctx.arc(dw * 0.26, dh * 0.72, 2.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = ink
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(dw * 0.18, dh * 0.72)
  ctx.lineTo(dw * 0.18, dh * 0.8)
  ctx.lineTo(dw * 0.38, dh * 0.8)
  ctx.moveTo(dw * 0.26, dh * 0.72)
  ctx.lineTo(dw * 0.26, dh * 0.84)
  ctx.lineTo(dw * 0.58, dh * 0.84)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.restore()

  if (idle) {
    ctx.fillStyle = 'rgba(16,14,11,0.32)'
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
  ctx.fillRect(cx - 24, cy + 30, 48, 8)
  ctx.fillStyle = brass
  ctx.beginPath()
  ctx.ellipse(cx, cy - 28, 22, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  const wrap = ctx.createLinearGradient(cx - 22, cy, cx + 22, cy)
  wrap.addColorStop(0, '#6a3a16')
  wrap.addColorStop(0.45, copper)
  wrap.addColorStop(1, '#4a2410')
  ctx.fillStyle = wrap
  ctx.fillRect(cx - 22, cy - 28, 44, 58)
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const y = cy - 24 + i * 4.6
    ctx.beginPath()
    ctx.ellipse(cx, y, 22, 5.5, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.fillStyle = soot
  ctx.beginPath()
  ctx.ellipse(cx, cy - 28, 8, 3.2, 0, 0, Math.PI * 2)
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
