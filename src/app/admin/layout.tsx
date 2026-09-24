import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil || (perfil.rol !== 'propietario' && perfil.rol !== 'colaborador')) {
    redirect('/admin/login?error=unauthorized')
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar userEmail={user.email ?? ''} fullName={perfil.nombre_completo ?? ''} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
