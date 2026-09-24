import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'
import type { ProxyConfig } from 'next/server'

export async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Refresca la sesion para que no expire entre visitas
  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isLoginPage) {
    // Admin ya autenticado → redirigir al dashboard
    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (perfil && (perfil.rol === 'propietario' || perfil.rol === 'colaborador')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
    return response
  }

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!perfil || (perfil.rol !== 'propietario' && perfil.rol !== 'colaborador')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    }
  }

  return response
}

export const config: ProxyConfig = {
  matcher: ['/admin/:path*'],
}
