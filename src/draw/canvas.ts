export function fitCanvas(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.max(1, Math.floor(cssW * dpr))
  const h = Math.max(1, Math.floor(cssH * dpr))
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d missing')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
