export type LayoutKey = 'clasico' | 'lateral' | 'split' | 'magazine' | 'inmersivo'

export interface LayoutConfig {
  nombre: string
  descripcion: string
  badge: string
  menu: 'top' | 'side' | 'top-transparent' | 'hidden-scroll'
  heroStyle: 'full' | 'split' | 'compact' | 'fullscreen'
}

export const LAYOUTS: Record<LayoutKey, LayoutConfig> = {
  clasico: {
    nombre: 'Clásico centrado',
    descripcion: 'Menú arriba, hero pantalla completa, productos en grilla de 4',
    badge: 'El actual',
    menu: 'top',
    heroStyle: 'full',
  },
  lateral: {
    nombre: 'Menú lateral',
    descripcion: 'Navegación vertical izquierda, contenido ocupa toda la derecha',
    badge: 'Boutique',
    menu: 'side',
    heroStyle: 'full',
  },
  split: {
    nombre: 'Hero partido',
    descripcion: 'Mitad imagen, mitad texto. Menú arriba transparente',
    badge: 'Editorial',
    menu: 'top-transparent',
    heroStyle: 'split',
  },
  magazine: {
    nombre: 'Revista / Magazine',
    descripcion: 'Hero compacto arriba, grilla de 3 columnas debajo',
    badge: 'Moderna',
    menu: 'top',
    heroStyle: 'compact',
  },
  inmersivo: {
    nombre: 'Inmersivo sin menú',
    descripcion: 'Hero pantalla completa. Menú aparece al hacer scroll',
    badge: 'Premium',
    menu: 'hidden-scroll',
    heroStyle: 'fullscreen',
  },
}

export const LAYOUT_DEFAULT: LayoutKey = 'clasico'

export function getLayout(key: string | null | undefined): LayoutConfig {
  return LAYOUTS[(key as LayoutKey) ?? LAYOUT_DEFAULT] ?? LAYOUTS[LAYOUT_DEFAULT]
}
