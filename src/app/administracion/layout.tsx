import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión: solo se llega aquí en /administracion/login (el proxy redirige el resto).
  // Renderizar children sin sidebar para no causar un loop de redirección.
  if (!user) {
    return (
      <>
        {children}
        <Toaster richColors position="top-right" />
      </>
    )
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar
        userEmail={user.email ?? ''}
        fullName={perfil?.nombre_completo ?? ''}
      />
      <main className="flex-1 p-8">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
