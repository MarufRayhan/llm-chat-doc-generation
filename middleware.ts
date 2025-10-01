// import NextAuth from 'next-auth'
// import { authConfig } from './auth.config'

// export default NextAuth(authConfig).auth

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
// }

export function middleware() {
  // no-op middleware, does nothing
  return
}

export const config = {
  matcher: [] // no routes matched
}
