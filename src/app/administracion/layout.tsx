import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <>
        {children}
        <Toaster richColors position="top-right" />
      </>
    )
  }

  const [perfilResult, consultasResult] = await Promise.all([
    supabase.from('perfiles').select('*').eq('id', user.id).single(),
    (async () => {
      try {
        const admin = createAdminClient()
        const { count } = await admin
          .from('consultas_contacto')
          .select('*', { count: 'exact', head: true })
          .eq('leido', false)
        return count ?? 0
      } catch {
        return 0
      }
    })(),
  ])

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar
        userEmail={user.email ?? ''}
        fullName={perfilResult.data?.nombre_completo ?? ''}
        consultasNoLeidas={consultasResult}
      />
      <main className="flex-1 p-8">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
