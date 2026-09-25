'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminSidebarProps {
  userEmail: string
  fullName: string
}

export default function AdminSidebar({ userEmail, fullName }: AdminSidebarProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/administracion/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-white border-r border-stone-100 flex flex-col py-8 px-6 shrink-0">
      {/* Brand */}
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400">admin</p>
        <h2 className="text-xl font-light tracking-widest text-stone-800 mt-1">
          encantika
        </h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 text-sm">
        <a
          href="/administracion"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Inicio
        </a>
        <a
          href="/administracion/pedidos"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Pedidos
        </a>
        <a
          href="/administracion/productos"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Productos
        </a>
        <a
          href="/administracion/categorias"
          className="block px-3 py-2 pl-6 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors text-xs"
        >
          Categorías
        </a>
        <a
          href="/administracion/colecciones"
          className="block px-3 py-2 pl-6 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors text-xs"
        >
          Colecciones
        </a>
        <a
          href="/administracion/atributos"
          className="block px-3 py-2 pl-6 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors text-xs"
        >
          Atributos
        </a>
        <a
          href="/administracion/inventario"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Inventario
        </a>
        <a
          href="/administracion/insumos"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Insumos
        </a>
        <a
          href="/administracion/clientes"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Clientes
        </a>
        <a
          href="/administracion/configuracion"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Configuración
        </a>
        <a
          href="/administracion/diseno"
          className="block px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded transition-colors"
        >
          Diseño
        </a>
      </nav>

      {/* User info + sign-out */}
      <div className="border-t border-stone-100 pt-4 mt-4">
        <p className="text-xs text-stone-500 truncate">
          {fullName || userEmail}
        </p>
        <button
          onClick={handleSignOut}
          className="mt-3 w-full text-left text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
