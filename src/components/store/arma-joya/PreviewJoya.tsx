'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { TipoJoya, Componente } from '@/features/arma-joya/types'

type Props = {
  tipoJoya: TipoJoya
  selecciones: Partial<Record<string, Componente>>
}

const GOLD = '#C9A035'
const PLATA = '#C0C0C0'
const GHOST = 'rgba(255,255,255,0.08)'
const GHOST_STROKE = 'rgba(255,255,255,0.12)'

function colorComp(comp: Componente | undefined, fallback = GHOST): string {
  return comp?.color_primario ?? fallback
}

// ── Formas predefinidas para dijes ────────────────────────────────────────────

function ShapeDije({ color, slug }: { color: string; slug: string }) {
  if (slug === 'DIJ-LUNA') return (
    <path d="M 0,-16 A 16,16 0 1 0 14,8 A 10,10 0 1 1 0,-16 Z" fill={color} />
  )
  if (slug === 'DIJ-SOL') return (
    <>
      <circle r="10" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={13 * Math.cos(a * Math.PI / 180)} y1={13 * Math.sin(a * Math.PI / 180)}
          x2={17 * Math.cos(a * Math.PI / 180)} y2={17 * Math.sin(a * Math.PI / 180)}
          stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      ))}
    </>
  )
  if (slug === 'DIJ-OJO') return (
    <>
      <ellipse rx="16" ry="9" fill="white" opacity={0.9} />
      <ellipse rx="8" ry="8" fill={color} />
      <ellipse rx="3" ry="3" fill="black" />
    </>
  )
  if (slug === 'DIJ-FLOR-VIDA') return (
    <>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={9 * Math.cos(a * Math.PI / 180)} cy={9 * Math.sin(a * Math.PI / 180)} r={9}
          fill="none" stroke={color} strokeWidth={1.2} opacity={0.8} />
      ))}
      <circle r={9} fill="none" stroke={color} strokeWidth={1.2} opacity={0.8} />
    </>
  )
  if (slug === 'DIJ-INFINITO') return (
    <path d="M -14,0 C -14,-10 -6,-10 0,0 C 6,10 14,10 14,0 C 14,-10 6,-10 0,0 C -6,10 -14,10 -14,0 Z"
      fill="none" stroke={color} strokeWidth={2} />
  )
  if (slug === 'DIJ-MARIPOSA') return (
    <>
      <ellipse cx="-10" cy="-8" rx="10" ry="7" fill={color} opacity={0.9} transform="rotate(-20 -10 -8)" />
      <ellipse cx="10" cy="-8" rx="10" ry="7" fill={color} opacity={0.9} transform="rotate(20 10 -8)" />
      <ellipse cx="-8" cy="8" rx="7" ry="5" fill={color} opacity={0.7} transform="rotate(30 -8 8)" />
      <ellipse cx="8" cy="8" rx="7" ry="5" fill={color} opacity={0.7} transform="rotate(-30 8 8)" />
      <ellipse cx="0" cy="0" rx="2" ry="6" fill={color} />
    </>
  )
  // Corazón y genérico
  return (
    <path d="M 0,-8 C 0,-14 -12,-14 -12,-6 C -12,0 0,10 0,14 C 0,10 12,0 12,-6 C 12,-14 0,-14 0,-8 Z"
      fill={color} />
  )
}

// ── Preview Collar ─────────────────────────────────────────────────────────────

function PreviewCollar({ selecciones }: { selecciones: Partial<Record<string, Componente>> }) {
  const cadena = selecciones['cadena']
  const piedra = selecciones['piedra']
  const dije = selecciones['dije']
  const signo = selecciones['signo_zodiacal']

  // El material (piedra) determina el color de la cadena en el preview
  const materialColor = piedra?.color_primario ?? null
  const cadenaColor = cadena
    ? (materialColor ?? (cadena.sku.includes('ORO') ? GOLD : PLATA))
    : GHOST_STROKE
  const cadenaStroke = cadena ? 1.8 : 1
  const cadenaDash = cadena ? 'none' : '5,4'

  // Largo afecta la curva de la cadena
  const largo = selecciones['largo']
  const curvaY = largo
    ? (largo.sku.includes('60') ? 195 : largo.sku.includes('50') ? 185 : largo.sku.includes('45') ? 175 : 168)
    : 175

  return (
    <svg viewBox="0 0 300 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gPiedra" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity={piedra ? 0.4 : 0.05} />
          <stop offset="100%" stopColor={colorComp(piedra, GHOST)} stopOpacity={1} />
        </radialGradient>
        <radialGradient id="gDije" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity={0.3} />
          <stop offset="100%" stopColor={colorComp(dije, GHOST)} stopOpacity={1} />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cadena principal */}
      <motion.path
        d={`M 62 52 Q 52 ${curvaY} 150 ${curvaY + 16} Q 248 ${curvaY} 238 52`}
        stroke={cadenaColor}
        strokeWidth={cadenaStroke}
        strokeDasharray={cadenaDash}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Broche izquierdo */}
      <motion.circle cx="62" cy="52" r="4"
        fill={cadena ? cadenaColor : 'none'}
        stroke={cadenaColor} strokeWidth={1}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.6 }} />

      {/* Broche derecho */}
      <motion.circle cx="238" cy="52" r="4"
        fill={cadena ? cadenaColor : 'none'}
        stroke={cadenaColor} strokeWidth={1}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.7 }} />

      {/* Signo zodiacal (en el broche/centro superior) */}
      <AnimatePresence>
        {signo && (
          <motion.g
            key={signo.id}
            transform="translate(150, 40)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            filter="url(#glow)"
          >
            <circle r="12" fill={colorComp(signo)} opacity={0.85} />
            <text textAnchor="middle" dy="5" fontSize="11" fill="white" fontFamily="serif">
              {ZODIAC_GLYPH[signo.sku] ?? '★'}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Piedra */}
      <AnimatePresence>
        {piedra ? (
          <motion.g
            key={piedra.id}
            transform={`translate(150, ${curvaY + 45})`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <ellipse rx="22" ry="28" fill="url(#gPiedra)" filter="url(#glow)" />
            <ellipse rx="22" ry="28" fill="none" stroke={colorComp(piedra)} strokeWidth={0.8} opacity={0.4} />
            {/* Destello interno */}
            <ellipse cx="-7" cy="-9" rx="5" ry="3" fill="white" opacity={0.2} transform="rotate(-30 -7 -9)" />
          </motion.g>
        ) : (
          <motion.g transform={`translate(150, ${curvaY + 45})`} initial={{ opacity: 0.3 }} animate={{ opacity: 0.3 }}>
            <ellipse rx="22" ry="28" fill="none" stroke={GHOST_STROKE} strokeWidth={1} strokeDasharray="4,3" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Dije (bajo la piedra o en su lugar) */}
      <AnimatePresence>
        {dije && (
          <motion.g
            key={dije.id}
            transform={`translate(150, ${curvaY + 85})`}
            initial={{ scale: 0, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            filter="url(#glow)"
          >
            <ShapeDije color={colorComp(dije)} slug={dije.sku} />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Placeholder central cuando nada está seleccionado */}
      <AnimatePresence>
        {!cadena && !piedra && !dije && (
          <motion.g
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="150" cy="170" r="30" fill="none" stroke="rgba(201,160,53,0.2)" strokeWidth={1} strokeDasharray="3,4" />
            <text x="150" y="174" textAnchor="middle" fill="rgba(245,240,235,0.15)" fontSize="9" fontFamily="sans-serif" letterSpacing="1">
              TU JOYA
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

// ── Preview Pulsera ────────────────────────────────────────────────────────────

function PreviewPulsera({ selecciones }: { selecciones: Partial<Record<string, Componente>> }) {
  const cadena = selecciones['cadena']
  const piedra = selecciones['piedra']
  const dije = selecciones['dije']

  const materialColor = piedra?.color_primario ?? null
  const cadenaColor = cadena
    ? (materialColor ?? (cadena.sku.includes('ORO') ? GOLD : PLATA))
    : GHOST_STROKE

  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gPiedraPuls" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity={piedra ? 0.4 : 0.05} />
          <stop offset="100%" stopColor={colorComp(piedra, GHOST)} />
        </radialGradient>
        <filter id="glowP"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
      </defs>

      {/* Aro de la pulsera */}
      <motion.ellipse cx="150" cy="110" rx="100" ry="55"
        stroke={cadenaColor} strokeWidth={cadena ? 2 : 1}
        strokeDasharray={cadena ? 'none' : '6,5'} fill="none"
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }} />

      {/* Piedra en la pulsera */}
      <AnimatePresence>
        {piedra ? (
          <motion.g key={piedra.id} transform="translate(150, 55)"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
            <ellipse rx="18" ry="22" fill="url(#gPiedraPuls)" filter="url(#glowP)" />
            <ellipse rx="18" ry="22" fill="none" stroke={colorComp(piedra)} strokeWidth={0.8} opacity={0.4} />
          </motion.g>
        ) : (
          <ellipse cx="150" cy="55" rx="18" ry="22" fill="none"
            stroke={GHOST_STROKE} strokeWidth={1} strokeDasharray="3,3" />
        )}
      </AnimatePresence>

      {/* Dije */}
      <AnimatePresence>
        {dije && (
          <motion.g key={dije.id} transform="translate(150, 165)"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }} filter="url(#glowP)">
            <ShapeDije color={colorComp(dije)} slug={dije.sku} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

// ── Preview Aros ───────────────────────────────────────────────────────────────

function PreviewAros({ selecciones }: { selecciones: Partial<Record<string, Componente>> }) {
  const piedra = selecciones['piedra']
  const signo = selecciones['signo_zodiacal']

  return (
    <svg viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="gAro" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity={0.35} />
          <stop offset="100%" stopColor={colorComp(piedra, GHOST)} />
        </radialGradient>
        <filter id="glowA"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
      </defs>

      {[80, 220].map((cx, i) => (
        <g key={cx}>
          {/* Enganche */}
          <circle cx={cx} cy={44} r={3} fill={GHOST_STROKE} />
          {/* Cuerpo del aro (gota) */}
          <AnimatePresence>
            {piedra ? (
              <motion.g key={`${piedra.id}-${i}`} transform={`translate(${cx}, 160)`}
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: i * 0.1 }}>
                <path d="M 0,-100 C -30,-100 -40,-60 -40,0 C -40,50 0,80 0,80 C 0,80 40,50 40,0 C 40,-60 30,-100 0,-100 Z"
                  fill="url(#gAro)" filter="url(#glowA)" />
                <path d="M 0,-100 C -30,-100 -40,-60 -40,0 C -40,50 0,80 0,80 C 0,80 40,50 40,0 C 40,-60 30,-100 0,-100 Z"
                  fill="none" stroke={colorComp(piedra)} strokeWidth={0.8} opacity={0.4} />
              </motion.g>
            ) : (
              <path d={`M ${cx} 60 C ${cx - 30} 60 ${cx - 40} 100 ${cx - 40} 160 C ${cx - 40} 210 ${cx} 240 ${cx} 240 C ${cx} 240 ${cx + 40} 210 ${cx + 40} 160 C ${cx + 40} 100 ${cx + 30} 60 ${cx} 60 Z`}
                fill="none" stroke={GHOST_STROKE} strokeWidth={1} strokeDasharray="4,3" />
            )}
          </AnimatePresence>
          {/* Signo zodiacal si existe */}
          {signo && (
            <motion.g transform={`translate(${cx}, 155)`}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 + i * 0.1 }}>
              <text textAnchor="middle" dy="5" fontSize="18" fill="white" opacity={0.6} fontFamily="serif">
                {ZODIAC_GLYPH[signo.sku] ?? '★'}
              </text>
            </motion.g>
          )}
        </g>
      ))}
    </svg>
  )
}

// ── Glifos zodiacales ─────────────────────────────────────────────────────────

const ZODIAC_GLYPH: Record<string, string> = {
  'ZOD-ARIES': '♈', 'ZOD-TAURO': '♉', 'ZOD-GEMINIS': '♊', 'ZOD-CANCER': '♋',
  'ZOD-LEO': '♌', 'ZOD-VIRGO': '♍', 'ZOD-LIBRA': '♎', 'ZOD-ESCORPIO': '♏',
  'ZOD-SAGITARIO': '♐', 'ZOD-CAPRICORNIO': '♑', 'ZOD-ACUARIO': '♒', 'ZOD-PISCIS': '♓',
}

// ── Posición del ornato (dije/signo) sobre la foto base, por tipo de joya ────
// Ajustar estos valores según la composición real de las fotos.

const ORNATO_POS: Record<string, { left: string; top: string; width: string }> = {
  collar:  { left: '50%', top: '68%', width: '26%' },
  pulsera: { left: '50%', top: '64%', width: '22%' },
  aros:    { left: '50%', top: '52%', width: '38%' },
}

// ── Preview con fotos reales (composición de capas) ───────────────────────────

function PreviewFotos({
  tipoJoya,
  baseImg,
  ornatoImg,
}: {
  tipoJoya: TipoJoya
  baseImg: string
  ornatoImg: string | null
}) {
  const pos = ORNATO_POS[tipoJoya.slug] ?? ORNATO_POS.collar

  return (
    <div className="relative w-full h-full">
      {/* Capa base: foto de la cadena/material */}
      <AnimatePresence mode="wait">
        <motion.img
          key={baseImg}
          src={baseImg}
          alt={tipoJoya.nombre}
          className="w-full h-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>

      {/* Capa ornato: dije o signo zodiacal encima */}
      <AnimatePresence>
        {ornatoImg && (
          <motion.img
            key={ornatoImg}
            src={ornatoImg}
            alt="ornato"
            className="absolute object-contain pointer-events-none"
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.width,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PreviewJoya({ tipoJoya, selecciones }: Props) {
  // La cadena base puede ser la cadena de estilo o el material (piedra), mutuamente exclusivos
  const cadenaBase = selecciones['cadena'] ?? selecciones['piedra'] ?? null
  const baseImg = cadenaBase?.url_imagen ?? null

  // El ornato puede ser un dije o un signo zodiacal, mutuamente exclusivos
  const ornato = selecciones['dije'] ?? selecciones['signo_zodiacal'] ?? null
  const ornatoImg = ornato?.url_imagen ?? null

  const usarFotos = Boolean(baseImg)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[220px] sm:max-w-[260px] aspect-[3/4]">
        {usarFotos ? (
          <PreviewFotos
            tipoJoya={tipoJoya}
            baseImg={baseImg!}
            ornatoImg={ornatoImg}
          />
        ) : (
          <>
            {tipoJoya.slug === 'collar'  && <PreviewCollar  selecciones={selecciones} />}
            {tipoJoya.slug === 'pulsera' && <PreviewPulsera selecciones={selecciones} />}
            {tipoJoya.slug === 'aros'    && <PreviewAros    selecciones={selecciones} />}
          </>
        )}
      </div>
    </div>
  )
}
