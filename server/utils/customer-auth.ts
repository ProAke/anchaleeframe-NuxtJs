import { createHash, randomBytes } from 'node:crypto'
import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import type { Pool } from 'mysql2/promise'
import { databaseConfigured, getDatabase } from './db'

const COOKIE_NAME = 'af_customer_session'
const SESSION_DAYS = 30

export interface CustomerAccount {
  id: number
  lineUserId: string
  displayName: string
  email: string
  pictureUrl: string
  phone: string
  address: string
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function lineLoginIsConfigured() {
  const config = useRuntimeConfig()
  const redirectUri = String(config.lineLoginRedirectUri || '')
  const isSecureRedirect = redirectUri.startsWith('https://')
  const isLocalDevelopmentRedirect = process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(redirectUri)
  return Boolean(databaseConfigured() && config.lineLoginChannelId && config.lineLoginChannelSecret && (isSecureRedirect || isLocalDevelopmentRedirect))
}

export async function createCustomerSession(event: H3Event, db: Pool, customerId: number) {
  const previousToken = getCookie(event, COOKIE_NAME)
  if (previousToken) await db.execute('DELETE FROM customer_sessions WHERE token_hash = ?', [hashToken(previousToken)])
  const token = randomBytes(32).toString('hex')
  await db.execute(
    'INSERT INTO customer_sessions (token_hash, customer_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY))',
    [hashToken(token), customerId, SESSION_DAYS],
  )
  await db.execute('DELETE FROM customer_sessions WHERE expires_at < UTC_TIMESTAMP() LIMIT 500')
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export async function getCustomerSession(event: H3Event): Promise<CustomerAccount | null> {
  const token = getCookie(event, COOKIE_NAME)
  if (!token || !databaseConfigured()) return null
  const db = await getDatabase()
  if (!db) return null
  const [rows] = await db.query<any[]>(
    `SELECT a.id, a.line_user_id AS lineUserId, a.display_name AS displayName,
            a.email, a.picture_url AS pictureUrl, a.phone, a.address
       FROM customer_sessions s
       JOIN customer_accounts a ON a.id = s.customer_id
      WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() LIMIT 1`,
    [hashToken(token)],
  )
  const account = rows[0]
  return account ? { ...account, id: Number(account.id) } as CustomerAccount : null
}

export async function requireCustomer(event: H3Event) {
  const account = await getCustomerSession(event)
  if (!account) throw createError({ statusCode: 401, statusMessage: 'กรุณาเข้าสู่ระบบด้วย LINE ก่อนดำเนินการ' })
  return account
}

export async function logoutCustomer(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (token && databaseConfigured()) {
    const db = await getDatabase()
    if (db) await db.execute('DELETE FROM customer_sessions WHERE token_hash = ?', [hashToken(token)])
  }
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}
