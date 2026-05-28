import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromCookie } from '@/lib/roles'

const PUBLIC_PATHS = ['/', '/esqueci-senha']
const AUTH_ONLY_PATHS = ['/definir-senha'] // requer cookie mas não redirect

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deixa passar qualquer ficheiro estático (tem extensão tipo .png, .svg, .json…).
  // Isto inclui /logo-chapateca-icone.png, /manifest.json, etc. servidos por /public.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return NextResponse.next()

  const roleCookie = request.cookies.get('chapateca-role')?.value
  const role = getRoleFromCookie(roleCookie)

  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/album/') || pathname === '/projetos' || pathname.startsWith('/projetos/')) return NextResponse.next()

  // /definir-senha e /esqueci-senha passam se tiverem cookie
  if (AUTH_ONLY_PATHS.includes(pathname)) {
    if (!role) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  if (!role) return NextResponse.redirect(new URL('/', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclui assets internos do Next, favicon, ficheiros com extensão (png, svg, json, etc.)
    '/((?!api|_next/static|_next/image|favicon.ico|icon\\.png|apple-icon\\.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json|webmanifest|css|js|map|txt|xml)).*)',
  ],
}
