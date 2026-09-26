'use client'

import { useEffect, useRef } from 'react'
import type { Componente } from '@/features/arma-joya/types'

type Props = {
  componente: Componente
  index: number
  visible: boolean
}

// Convierte hex → [r, g, b]
function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

// ── Chispa: destellos de luz que aparecen y desaparecen ──────────────────────

function drawChispa(
  ctx: CanvasRenderingContext2D,
  particles: ChispaParticle[],
  color: string,
  alpha: number
) {
  const [r, g, b] = hexToRgb(color)
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = p.opacity * alpha
    ctx.beginPath()
    // Cruz de 4 puntas
    ctx.moveTo(p.x, p.y - p.size * 2.5)
    ctx.lineTo(p.x, p.y + p.size * 2.5)
    ctx.moveTo(p.x - p.size * 2.5, p.y)
    ctx.lineTo(p.x + p.size * 2.5, p.y)
    // Diagonales más cortas
    ctx.moveTo(p.x - p.size, p.y - p.size)
    ctx.lineTo(p.x + p.size, p.y + p.size)
    ctx.moveTo(p.x + p.size, p.y - p.size)
    ctx.lineTo(p.x - p.size, p.y + p.size)
    ctx.strokeStyle = `rgba(${r},${g},${b},1)`
    ctx.lineWidth = p.size * 0.6
    ctx.lineCap = 'round'
    ctx.stroke()
    // Halo central
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},${b},0.6)`
    ctx.fill()
    ctx.restore()
  }
}

// ── Polvo: micro-puntos flotantes ─────────────────────────────────────────────

function drawPolvo(
  ctx: CanvasRenderingContext2D,
  particles: PolvoParticle[],
  color: string,
  alpha: number
) {
  const [r, g, b] = hexToRgb(color)
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = p.opacity * alpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},${b},1)`
    ctx.fill()
    ctx.restore()
  }
}

// ── Burbuja: círculos translúcidos que suben ──────────────────────────────────

function drawBurbuja(
  ctx: CanvasRenderingContext2D,
  particles: BurbujaParticle[],
  color: string,
  alpha: number
) {
  const [r, g, b] = hexToRgb(color)
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = p.opacity * alpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`
    ctx.lineWidth = 0.8
    ctx.stroke()
    // Reflejo interior
    ctx.beginPath()
    ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,0.3)`
    ctx.fill()
    ctx.restore()
  }
}

// ── Tipos de partículas ───────────────────────────────────────────────────────

type ChispaParticle = { x: number; y: number; size: number; opacity: number; life: number; maxLife: number; vx: number; vy: number }
type PolvoParticle = { x: number; y: number; r: number; opacity: number; vx: number; vy: number; phase: number }
type BurbujaParticle = { x: number; y: number; r: number; opacity: number; vy: number; vx: number; life: number; maxLife: number }

// ── Canvas component ──────────────────────────────────────────────────────────

export default function CapaParticulas({ componente, index, visible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const alphaRef = useRef(0)
  const frameRef = useRef(0)

  const estilo = componente.estilo_particulas ?? 'ninguno'
  const color = componente.color_primario ?? '#C9A035'
  const intensidad = (componente.intensidad ?? 5) / 10

  useEffect(() => {
    if (estilo === 'ninguno') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Inicializar partículas según tipo
    const N = Math.round(30 * intensidad)

    let chispas: ChispaParticle[] = []
    let polvos: PolvoParticle[] = []
    let burbujas: BurbujaParticle[] = []

    if (estilo === 'chispa') {
      chispas = Array.from({ length: N }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 0.8 + Math.random() * 1.4,
        opacity: 0,
        life: Math.random() * 120,
        maxLife: 60 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }))
    } else if (estilo === 'polvo') {
      polvos = Array.from({ length: N * 2 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
      }))
    } else if (estilo === 'burbuja') {
      burbujas = Array.from({ length: N }, () => ({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 200,
        r: 3 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.35,
        vy: -(0.3 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.3,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 300,
      }))
    }

    let t = 0

    function tick() {
      if (!canvas || !ctx) return

      // Fade del canvas según visibilidad
      const target = visible ? 1 : 0
      alphaRef.current += (target - alphaRef.current) * 0.025
      const alpha = alphaRef.current * 0.65

      if (alpha < 0.01) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t++

      if (estilo === 'chispa') {
        for (const p of chispas) {
          p.life++
          p.x += p.vx
          p.y += p.vy
          const half = p.maxLife / 2
          p.opacity = p.life < half
            ? (p.life / half)
            : (1 - (p.life - half) / half)
          if (p.life >= p.maxLife) {
            p.x = Math.random() * canvas.width
            p.y = Math.random() * canvas.height
            p.life = 0
            p.maxLife = 60 + Math.random() * 80
            p.size = 0.8 + Math.random() * 1.4
            p.vx = (Math.random() - 0.5) * 0.3
            p.vy = (Math.random() - 0.5) * 0.3
          }
        }
        drawChispa(ctx, chispas, color, alpha)

      } else if (estilo === 'polvo') {
        for (const p of polvos) {
          p.x += p.vx + Math.sin(t * 0.01 + p.phase) * 0.12
          p.y += p.vy
          if (p.y < -5) {
            p.y = canvas.height + 5
            p.x = Math.random() * canvas.width
          }
        }
        drawPolvo(ctx, polvos, color, alpha)

      } else if (estilo === 'burbuja') {
        for (const p of burbujas) {
          p.life++
          p.y += p.vy
          p.x += p.vx + Math.sin(t * 0.008 + p.x) * 0.12
          if (p.life >= p.maxLife || p.y < -p.r * 2) {
            p.y = canvas.height + p.r
            p.x = Math.random() * canvas.width
            p.life = 0
            p.maxLife = 200 + Math.random() * 300
          }
        }
        drawBurbuja(ctx, burbujas, color, alpha)
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [estilo, color, intensidad, visible])

  if (estilo === 'ninguno') return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 + index }}
    />
  )
}
