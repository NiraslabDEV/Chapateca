import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookie } from '@/lib/roles'

const PUBLIC_PATHS = ['/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const roleCookie = request.cookies.get('chapateca-role')?.value
  const role = getRoleFromCookie(roleCookie)

  // Permite paths públicos e rotas internas do Next.js
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Sem role → redireciona para login
  if (!role) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
