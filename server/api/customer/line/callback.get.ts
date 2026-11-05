import { timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, getQuery, sendRedirect, setResponseHeader } from 'h3'
import { getDatabase } from '../../../utils/db'
import { createCustomerSession, lineLoginIsConfigured } from '../../../utils/customer-auth'
import { enforceRateLimit } from '../../../utils/rate-limit'

const STATE_COOKIE = 'af_line_login_state'
const NONCE_COOKIE = 'af_line_login_nonce'
const CALLBACK_PATH = '/api/customer/line/callback'

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function clearLoginCookies(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, STATE_COOKIE, { path: CALLBACK_PATH })
  deleteCookie(event, NONCE_COOKIE, { path: CALLBACK_PATH })
}

function failed(event: Parameters<typeof deleteCookie>[0]) {
  clearLoginCookies(event)
  return sendRedirect(event, '/account?line=failed', 302)
}

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'line-login-callback', 20, 10 * 60 * 1000)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  if (!lineLoginIsConfigured()) throw createError({ statusCode: 503, statusMessage: 'LINE Login ยังไม่ได้ตั้งค่า' })

  const query = getQuery(event)
  if (query.error) return failed(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const suppliedState = typeof query.state === 'string' ? query.state : ''
  const expectedState = getCookie(event, STATE_COOKIE) || ''
  const expectedNonce = getCookie(event, NONCE_COOKIE) || ''
  if (!code || code.length > 2048 || !expectedState || !expectedNonce || !suppliedState || !secureEqual(expectedState, suppliedState)) {
    return failed(event)
  }
  clearLoginCookies(event)

  const config = useRuntimeConfig()
  try {
    const tokenResponse = await $fetch<{ id_token?: string }>('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: String(config.lineLoginRedirectUri),
        client_id: String(config.lineLoginChannelId),
        client_secret: String(config.lineLoginChannelSecret),
      }).toString(),
    })
    if (!tokenResponse.id_token) throw new Error('LINE did not return an ID token')

    const identity = await $fetch<{
      iss?: string
      sub?: string
      aud?: string
      exp?: number
      nonce?: string
      name?: string
      picture?: string
    }>('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: tokenResponse.id_token, client_id: String(config.lineLoginChannelId) }).toString(),
    })
    if (
      identity.iss !== 'https://access.line.me' ||
      identity.aud !== String(config.lineLoginChannelId) ||
      !identity.sub ||
      !Number.isFinite(Number(identity.exp)) ||
      Number(identity.exp) <= Math.floor(Date.now() / 1000) ||
      !identity.nonce ||
      !secureEqual(expectedNonce, identity.nonce)
    ) {
      throw new Error('LINE identity verification failed')
    }

    const db = await getDatabase()
    if (!db) throw new Error('Persistent database is required for LINE Login')
    const displayName = String(identity.name || 'LINE customer').trim().slice(0, 160)
    let pictureUrl = ''
    try {
      const candidate = new URL(String(identity.picture || ''))
      if (candidate.protocol === 'https:') pictureUrl = candidate.toString().slice(0, 800)
    } catch { /* LINE profile picture is optional. */ }

    await db.execute(
      `INSERT INTO customer_accounts (line_user_id, display_name, picture_url, address)
       VALUES (?, ?, ?, '')
       ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), picture_url = VALUES(picture_url)`,
      [identity.sub, displayName, pictureUrl],
    )
    const [accounts] = await db.query<any[]>('SELECT id FROM customer_accounts WHERE line_user_id = ? LIMIT 1', [identity.sub])
    if (!accounts[0]) throw new Error('Customer account was not created')
    await createCustomerSession(event, db, Number(accounts[0].id))
    return sendRedirect(event, '/account?line=success', 302)
  } catch (error) {
    console.error('LINE Login callback failed:', error instanceof Error ? error.message : 'unknown error')
    return sendRedirect(event, '/account?line=failed', 302)
  }
})
