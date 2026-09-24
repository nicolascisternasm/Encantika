import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'
import type { ProxyConfig } from 'next/server'

export async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Refresh session so it doesn't expire mid-visit
  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isLoginPage) {
    // Already authenticated admin → redirect to dashboard
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile && (profile.role === 'owner' || profile.role === 'staff')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
    return response
  }

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'owner' && profile.role !== 'staff')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    }
  }

  return response
}

export const config: ProxyConfig = {
  matcher: ['/admin/:path*'],
}
