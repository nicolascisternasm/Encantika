'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Layers,
  SlidersHorizontal,
  BarChart2,
  Boxes,
  Users,
  MessageSquare,
  Gem,
  Wrench,
  Settings,
  Palette,
  Images,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface AdminSidebarProps {
  userEmail: string
  fullName: string
  consultasNoLeidas?: number
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  sub?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

export default function AdminSidebar({ userEmail, fullName, consultasNoLeidas = 0 }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/administracion/login')
    router.refresh()
  }

  const sections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard',  href: '/administracion',          icon: LayoutDashboard },
        { label: 'Pedidos',    href: '/administracion/pedidos',   icon: ShoppingCart },
        { label: 'Consultas',  href: '/administracion/consultas', icon: MessageSquare, badge: consultasNoLeidas },
        { label: 'Clientes',   href: '/administracion/clientes',  icon: Users },
      ],
    },
    {
      title: 'Catálogo',
      items: [
        { label: 'Productos',   href: '/administracion/productos',   icon: Package },
        { label: 'Categorías',  href: '/administracion/categorias',  icon: Tag,               sub: true },
        { label: 'Colecciones', href: '/administracion/colecciones', icon: Layers,            sub: true },
        { label: 'Atributos',   href: '/administracion/atributos',   icon: SlidersHorizontal, sub: true },
        { label: 'Inventario',  href: '/administracion/inventario',  icon: BarChart2 },
        { label: 'Insumos',     href: '/administracion/insumos',     icon: Boxes },
      ],
    },
    {
      title: 'Arma tu Joya',
      items: [
        { label: 'Componentes',   href: '/administracion/arma-joya/componentes',   icon: Gem },
        { label: 'Configuración', href: '/administracion/arma-joya/configuracion', icon: Wrench },
      ],
    },
    {
      title: 'Ajustes',
      items: [
        { label: 'Configuración', href: '/administracion/configuracion', icon: Settings },
        { label: 'Diseño',        href: '/administracion/diseno',        icon: Palette },
        { label: 'Imágenes',      href: '/administracion/imagenes',      icon: Images, sub: true },
      ],
    },
  ]

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : userEmail.slice(0, 2).toUpperCase()

  function isActive(href: string) {
    if (href === '/administracion') return pathname === '/administracion'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col" style={{ background: '#111827', borderRight: '1px solid #1f2937' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#1f2937' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Gem size={15} color="white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide" style={{ color: '#f9fafb' }}>ENCANTIKA</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: '#374151' }}>Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#374151' }}>
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex items-center gap-2.5 py-2 rounded-md text-sm transition-all"
                      style={{
                        paddingLeft: item.sub ? '28px' : '8px',
                        paddingRight: '8px',
                        background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: active ? '#a5b4fc' : item.sub ? '#4b5563' : '#9ca3af',
                        borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
                      }}
                    >
                      <Icon size={item.sub ? 13 : 15} style={{ flexShrink: 0 }} />
                      <span className="flex-1" style={{ fontSize: item.sub ? '12px' : '13px' }}>{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 text-[10px] font-medium flex items-center justify-center rounded-full" style={{ background: '#6366f1', color: 'white' }}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                      {active && !item.sub && (
                        <ChevronRight size={12} style={{ color: '#6366f1', flexShrink: 0 }} />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#1f2937' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-md" style={{ background: '#1f2937' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#f9fafb' }}>{fullName || userEmail}</p>
            <p className="text-[10px]" style={{ color: '#4b5563' }}>Admin</p>
          </div>
          <button onClick={handleSignOut} title="Cerrar sesión" className="p-1 rounded" style={{ color: '#4b5563' }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
