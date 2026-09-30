import { useEffect, useMemo, useRef, useState } from 'react'
import type { SkyEntry } from '../sky.config'
import { realTitle } from '../lib/format'
import { backgroundStars, emptySpot, layoutSky, skyArea } from '../sky/layout'
import { buildBackground, drawBgStars, drawFigure, drawPulse, drawRegionLabel } from '../sky/render'

export interface SkyCanvasProps {
  entries: SkyEntry[]
  mobile: boolean
  reducedMotion: boolean
  hotId: string | null
  selectedId: string | null
  drawingEnabled: boolean
  showPulse: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onEmptyClick: () => void
}

const STAGGER_MS = 220
const REVEAL_MS = 1600

export default function SkyCanvas(props: SkyCanvasProps) {
  const { entries, mobile, selectedId, onSelect, onHover, onEmptyClick } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const area = useMemo(() => skyArea(size.w, size.h, mobile), [size, mobile])
  const { figures, labels } = useMemo(() => layoutSky(entries, area, mobile), [entries, area, mobile])
  const bgStars = useMemo(() => backgroundStars(size.w, size.h), [size])
  const pulseAt = useMemo(() => emptySpot(figures, area), [figures, area])
  const byId = useMemo(() => new Map(entries.map(e => [e.id, e])), [entries])

  // The rAF loop reads the latest props through this ref instead of restarting each render.
  const live = useRef({ props, figures, labels, bgStars, pulseAt, byId })
  useEffect(() => { live.current = { props, figures, labels, bgStars, pulseAt, byId } })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(size.w * dpr)
    canvas.height = Math.round(size.h * dpr)
    const bg = buildBackground(size.w, size.h, dpr)
    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const { props: p, figures: figs, labels: labs, bgStars: stars, pulseAt: pulse, byId: map } = live.current
      const t = now - start
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(bg, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawBgStars(ctx, stars, now, p.reducedMotion)
      const first = p.reducedMotion ? 1 : Math.min(1, t / 800)
      for (const l of labs) drawRegionLabel(ctx, l, first)
      figs.forEach((f, i) => {
        const reveal = p.reducedMotion ? 1 : Math.min(1, Math.max(0, (t - 300 - i * STAGGER_MS) / REVEAL_MS))
        drawFigure(ctx, f, map.get(f.id)?.poeticName ?? '', {
          reveal,
          lit: p.hotId === f.id,
          dim: p.hotId !== null && p.hotId !== f.id,
        })
      })
      if (p.showPulse) drawPulse(ctx, pulse, now, p.reducedMotion)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size])

  return (
    <>
      <canvas ref={canvasRef} className="sky" aria-hidden="true" onClick={() => onEmptyClick()} />
      <div className="hotspots" role="group" aria-label="Constellations">
        {figures.map(f => {
          const e = byId.get(f.id)
          if (!e) return null
          return (
            <button
              key={f.id}
              type="button"
              className="hotspot"
              style={{ left: f.center.x - f.radius, top: f.center.y - f.radius, width: f.radius * 2, height: f.radius * 2 }}
              aria-label={`${e.poeticName} — ${realTitle(e)}`}
              aria-pressed={selectedId === f.id}
              onClick={() => onSelect(f.id)}
              onPointerEnter={() => onHover(f.id)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(f.id)}
              onBlur={() => onHover(null)}
            />
          )
        })}
      </div>
    </>
  )
}
