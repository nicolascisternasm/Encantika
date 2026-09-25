export type TemaKey = 'dorado_clasico' | 'plata_moderno' | 'rosa_nude' | 'oscuro_elegante' | 'blanco_minimal'
export type FuenteKey = 'cormorant' | 'great_vibes' | 'pinyon_script' | 'sacramento' | 'tangerine' | 'alex_brush'

export interface TemaVars {
  '--color-fondo': string
  '--color-texto': string
  '--color-acento': string
  '--color-tarjeta': string
  '--color-borde': string
  '--color-texto-suave': string
}

export interface TemaConfig {
  nombre: string
  vars: TemaVars
}

export interface FuenteConfig {
  nombre: string
  css: string
  googleFont: string | null
}

export const TEMAS: Record<TemaKey, TemaConfig> = {
  dorado_clasico: {
    nombre: 'Dorado Clásico',
    vars: {
      '--color-fondo': '#FAF7F2',
      '--color-texto': '#1A1A1A',
      '--color-acento': '#C6A15B',
      '--color-tarjeta': '#EDE0D4',
      '--color-borde': '#D4C4A8',
      '--color-texto-suave': '#7C7269',
    },
  },
  plata_moderno: {
    nombre: 'Plata Moderno',
    vars: {
      '--color-fondo': '#F5F6F8',
      '--color-texto': '#1A1B1E',
      '--color-acento': '#7A8FA3',
      '--color-tarjeta': '#E8EAED',
      '--color-borde': '#CDD0D5',
      '--color-texto-suave': '#6B7280',
    },
  },
  rosa_nude: {
    nombre: 'Rosa Nude',
    vars: {
      '--color-fondo': '#FDF6F4',
      '--color-texto': '#2D1B1B',
      '--color-acento': '#C48A82',
      '--color-tarjeta': '#F0DDD9',
      '--color-borde': '#E3C8C4',
      '--color-texto-suave': '#8F6B67',
    },
  },
  oscuro_elegante: {
    nombre: 'Oscuro Elegante',
    vars: {
      '--color-fondo': '#141414',
      '--color-texto': '#F0EDE8',
      '--color-acento': '#C6A15B',
      '--color-tarjeta': '#1E1E1E',
      '--color-borde': '#2E2E2E',
      '--color-texto-suave': '#9A9490',
    },
  },
  blanco_minimal: {
    nombre: 'Blanco Minimal',
    vars: {
      '--color-fondo': '#FFFFFF',
      '--color-texto': '#111111',
      '--color-acento': '#111111',
      '--color-tarjeta': '#F5F5F5',
      '--color-borde': '#E5E5E5',
      '--color-texto-suave': '#888888',
    },
  },
}

export const FUENTES: Record<FuenteKey, FuenteConfig> = {
  cormorant: {
    nombre: 'Cormorant',
    css: "'Cormorant Garamond', Georgia, serif",
    googleFont: null,
  },
  great_vibes: {
    nombre: 'Great Vibes',
    css: "'Great Vibes', cursive",
    googleFont: 'Great+Vibes',
  },
  pinyon_script: {
    nombre: 'Pinyon Script',
    css: "'Pinyon Script', cursive",
    googleFont: 'Pinyon+Script',
  },
  sacramento: {
    nombre: 'Sacramento',
    css: "'Sacramento', cursive",
    googleFont: 'Sacramento',
  },
  tangerine: {
    nombre: 'Tangerine',
    css: "'Tangerine', cursive",
    googleFont: 'Tangerine:wght@700',
  },
  alex_brush: {
    nombre: 'Alex Brush',
    css: "'Alex Brush', cursive",
    googleFont: 'Alex+Brush',
  },
}

export const TEMA_DEFAULT: TemaKey = 'dorado_clasico'
export const FUENTE_DEFAULT: FuenteKey = 'cormorant'

export function getTema(key: string | null | undefined): TemaConfig {
  return TEMAS[(key as TemaKey) ?? TEMA_DEFAULT] ?? TEMAS[TEMA_DEFAULT]
}

export function getFuente(key: string | null | undefined): FuenteConfig {
  return FUENTES[(key as FuenteKey) ?? FUENTE_DEFAULT] ?? FUENTES[FUENTE_DEFAULT]
}
