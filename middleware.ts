import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookie } from '@/lib/roles'

const PUBLIC_PATHS = ['/', '/esqueci-senha']
const AUTH_ONLY_PATHS = ['/definir-senha'] // requer cookie mas não redirect

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const roleCookie = request.cookies.get('chapateca-role')?.value
  const role = getRoleFromCookie(roleCookie)

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // /definir-senha e /esqueci-senha passam se tiverem cookie
  if (AUTH_ONLY_PATHS.includes(pathname)) {
    if (!role) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  if (!role) return NextResponse.redirect(new URL('/', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
