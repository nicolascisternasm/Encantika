import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'
import type { ProxyConfig } from 'next/server'

export async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // La página de login no requiere sesión — dejar pasar siempre sin verificar.
  if (pathname === '/administracion/login') {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Refresca la sesion para que no expire entre visitas
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/administracion/login', request.url))
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!perfil || (perfil.rol !== 'propietario' && perfil.rol !== 'colaborador')) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/administracion/login?error=unauthorized', request.url))
  }

  return response
}

export const config: ProxyConfig = {
  matcher: ['/administracion/:path*'],
}
