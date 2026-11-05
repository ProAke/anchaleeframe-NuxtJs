import { randomBytes } from 'node:crypto'
import { sendRedirect, setCookie, setResponseHeader } from 'h3'
import { enforceRateLimit } from '../../../utils/rate-limit'
import { lineLoginIsConfigured } from '../../../utils/customer-auth'

const STATE_COOKIE = 'af_line_login_state'
const NONCE_COOKIE = 'af_line_login_nonce'

export default defineEventHandler((event) => {
  enforceRateLimit(event, 'line-login-start', 20, 10 * 60 * 1000)
  if (!lineLoginIsConfigured()) throw createError({ statusCode: 503, statusMessage: 'LINE Login ยังไม่ได้ตั้งค่า กรุณาติดต่อร้านค้า' })

  const config = useRuntimeConfig()
  const state = randomBytes(32).toString('hex')
  const nonce = randomBytes(32).toString('hex')
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/customer/line/callback',
    maxAge: 10 * 60,
  }
  setCookie(event, STATE_COOKIE, state, cookieOptions)
  setCookie(event, NONCE_COOKIE, nonce, cookieOptions)
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const authorizeUrl = new URL('https://access.line.me/oauth2/v2.1/authorize')
  authorizeUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: String(config.lineLoginChannelId),
    redirect_uri: String(config.lineLoginRedirectUri),
    state,
    scope: 'openid profile',
    nonce,
  }).toString()
  return sendRedirect(event, authorizeUrl.toString(), 302)
})
