import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, Package, Users, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [pedidosRes, productosRes, clientesRes, consultasRes] = await Promise.all([
    supabase.from('pedidos').select('id', { count: 'exact', head: true }),
    supabase.from('productos').select('id', { count: 'exact', head: true }),
    supabase.from('clientes').select('id', { count: 'exact', head: true }),
    (async () => {
      try {
        const admin = createAdminClient()
        const { count } = await admin
          .from('consultas_contacto')
          .select('id', { count: 'exact', head: true })
        return count ?? 0
      } catch { return 0 }
    })(),
  ])

  const now = new Date()
  const greeting = (() => {
    const h = now.getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  const dateLabel = now.toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const stats = [
    {
      label: 'Pedidos',
      value: pedidosRes.count ?? 0,
      icon: ShoppingCart,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.1)',
      trend: null,
    },
    {
      label: 'Productos',
      value: productosRes.count ?? 0,
      icon: Package,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      trend: null,
    },
    {
      label: 'Clientes',
      value: clientesRes.count ?? 0,
      icon: Users,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      trend: null,
    },
    {
      label: 'Consultas',
      value: consultasRes,
      icon: MessageSquare,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.1)',
      trend: null,
    },
  ]

  return (
    <div>
      {/* Header greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: '#f9fafb' }}>
          {greeting} 👋
        </h1>
        <p className="mt-1 text-sm capitalize" style={{ color: '#6b7280' }}>{dateLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-xl p-5"
              style={{ background: '#1f2937', border: '1px solid #374151' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: '#f9fafb' }}>
                {s.value.toLocaleString('es-CL')}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>
                {s.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Activity placeholder grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: '#1f2937', border: '1px solid #374151' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#f9fafb' }}>Pedidos Recientes</h2>
            <a href="/administracion/pedidos" className="text-xs transition-colors" style={{ color: '#6366f1' }}>
              Ver todos →
            </a>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCart size={28} style={{ color: '#374151' }} />
            <p className="mt-3 text-sm" style={{ color: '#4b5563' }}>Sin pedidos aún</p>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: '#1f2937', border: '1px solid #374151' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#f9fafb' }}>Consultas sin leer</h2>
            <a href="/administracion/consultas" className="text-xs transition-colors" style={{ color: '#6366f1' }}>
              Ver todas →
            </a>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare size={28} style={{ color: '#374151' }} />
            <p className="mt-3 text-sm" style={{ color: '#4b5563' }}>Sin consultas pendientes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
