import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Pedidos', value: ordersRes.count ?? 0 },
    { label: 'Productos', value: productsRes.count ?? 0 },
    { label: 'Clientes', value: customersRes.count ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-8">
        Panel de control
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-stone-100 rounded p-6"
          >
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">
              {s.label}
            </p>
            <p className="text-3xl font-light text-stone-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
