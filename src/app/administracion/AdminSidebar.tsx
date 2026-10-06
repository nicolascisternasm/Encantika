'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Layers,
  SlidersHorizontal,
  BarChart2,
  Wrench,
  Users,
  MessageSquare,
  Gem,
  Puzzle,
  Settings2,
  Palette,
  Image,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminSidebarProps {
  userEmail: string
  fullName: string
  consultasNoLeidas?: number
}

const NAV = [
  {
    label: 'Principal',
    items: [
      { href: '/administracion',          icon: LayoutDashboard, label: 'Dashboard'  },
      { href: '/administracion/pedidos',   icon: ShoppingBag,     label: 'Pedidos'    },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/administracion/productos',   icon: Package,           label: 'Productos'   },
      { href: '/administracion/categorias',  icon: Tag,               label: 'Categorías'  },
      { href: '/administracion/colecciones', icon: Layers,            label: 'Colecciones' },
      { href: '/administracion/atributos',   icon: SlidersHorizontal, label: 'Atributos'   },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { href: '/administracion/inventario', icon: BarChart2,     label: 'Inventario' },
      { href: '/administracion/insumos',    icon: Wrench,        label: 'Insumos'    },
      { href: '/administracion/clientes',   icon: Users,         label: 'Clientes'   },
      { href: '/administracion/consultas',  icon: MessageSquare, label: 'Consultas', badge: true },
    ],
  },
  {
    label: 'Arma tu Joya',
    items: [
      { href: '/administracion/arma-joya',                icon: Gem,     label: 'Vista general' },
      { href: '/administracion/arma-joya/componentes',    icon: Puzzle,  label: 'Componentes'   },
      { href: '/administracion/arma-joya/configuracion',  icon: Settings2, label: 'Configuración' },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { href: '/administracion/diseno',        icon: Palette, label: 'Diseño'        },
      { href: '/administracion/imagenes',      icon: Image,   label: 'Imágenes'      },
      { href: '/administracion/configuracion', icon: Settings, label: 'Configuración' },
    ],
  },
]

interface SidebarContentProps {
  pathname: string
  consultasNoLeidas: number
  fullName: string
  userEmail: string
  onNavClick?: () => void
  onSignOut: () => void
}

function SidebarContent({
  pathname,
  consultasNoLeidas,
  fullName,
  userEmail,
  onNavClick,
  onSignOut,
}: SidebarContentProps) {
  const initials = fullName
    ? fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : userEmail[0]?.toUpperCase() ?? 'A'

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#111111' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#C9A035' }}>
          <Sparkles className="w-4 h-4 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight tracking-widest uppercase" style={{ color: '#F5F0EB' }}>
            Encántika
          </div>
          <div className="text-xs" style={{ color: '#555' }}>Panel admin</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#444' }}>
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href === '/administracion'
                  ? pathname === '/administracion'
                  : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavClick}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group"
                      style={{
                        backgroundColor: isActive ? 'rgba(201,160,53,0.12)' : undefined,
                        color: isActive ? '#C9A035' : '#9A9490',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#1a1a1a'
                          e.currentTarget.style.color = '#F5F0EB'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = ''
                          e.currentTarget.style.color = '#9A9490'
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && consultasNoLeidas > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-medium flex items-center justify-center rounded-full leading-none"
                          style={{ backgroundColor: '#C9A035', color: '#111111' }}>
                          {consultasNoLeidas > 99 ? '99+' : consultasNoLeidas}
                        </span>
                      )}
                      {isActive && !item.badge && (
                        <ChevronRight className="w-3 h-3 opacity-60" style={{ color: '#C9A035' }} />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid #2a2a2a' }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ backgroundColor: '#C9A035', color: '#111111' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: '#D0CBC5' }}>
              {fullName || userEmail}
            </div>
            <div className="text-[10px]" style={{ color: '#555' }}>Administrador</div>
          </div>
          <button
            onClick={onSignOut}
            title="Cerrar sesión"
            className="transition-colors p-1"
            style={{ color: '#444' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#444' }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSidebar({ userEmail, fullName, consultasNoLeidas = 0 }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/administracion/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30">
        <SidebarContent
          pathname={pathname}
          consultasNoLeidas={consultasNoLeidas}
          fullName={fullName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 transition-colors"
          style={{ color: '#9A9490' }}
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#C9A035' }}>
          Encántika
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 transition-colors"
                style={{ color: '#9A9490' }}
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              consultasNoLeidas={consultasNoLeidas}
              fullName={fullName}
              userEmail={userEmail}
              onNavClick={() => setMobileOpen(false)}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}
    </>
  )
}
