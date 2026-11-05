import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { deleteCookie, getCookie, setCookie, setResponseHeader, type H3Event } from 'h3'
import { databaseConfigured, demoDataAllowed, getDatabase } from './db'

const COOKIE_NAME = 'af_admin_session'
const DEMO_EMAIL = 'admin@anchaleeframe.com'
const DEMO_PASSWORD = 'Frame2026!'
const DEMO_TOKEN = 'anchalee-demo-admin-session'

export interface AdminUser {
  id: number | string
  name: string
  email: string
  role: string
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function demoAllowed() {
  return demoDataAllowed()
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }
}

export async function loginAdmin(event: H3Event, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!databaseConfigured()) {
    if (!demoAllowed()) throw createError({ statusCode: 503, statusMessage: 'กรุณาตั้งค่าฐานข้อมูลก่อนเข้าสู่ระบบ' })
    if (normalizedEmail !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw createError({ statusCode: 401, statusMessage: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }
    setCookie(event, COOKIE_NAME, DEMO_TOKEN, cookieOptions())
    return { user: { id: 'demo-admin', name: 'ผู้ดูแลระบบ', email: DEMO_EMAIL, role: 'admin' }, demo: true }
  }

  const db = await getDatabase()
  if (!db) throw createError({ statusCode: 503, statusMessage: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้' })
  const [rows] = await db.query<any[]>('SELECT id, name, email, password_hash AS passwordHash, role FROM admin_users WHERE email = ? AND active = 1 LIMIT 1', [normalizedEmail])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
  }

  const token = randomBytes(32).toString('hex')
  await db.execute('INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY))', [hashToken(token), user.id])
  setCookie(event, COOKIE_NAME, token, cookieOptions())
  return { user: { id: Number(user.id), name: user.name, email: user.email, role: user.role }, demo: false }
}

export async function getAdminSession(event: H3Event): Promise<AdminUser | null> {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null

  if (!databaseConfigured()) {
    if (demoAllowed() && token === DEMO_TOKEN) {
      return { id: 'demo-admin', name: 'ผู้ดูแลระบบ', email: DEMO_EMAIL, role: 'admin' }
    }
    return null
  }

  const db = await getDatabase()
  if (!db) return null
  const [rows] = await db.query<any[]>(
    `SELECT u.id, u.name, u.email, u.role
       FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.active = 1 LIMIT 1`,
    [hashToken(token)],
  )
  const user = rows[0]
  return user ? { id: Number(user.id), name: user.name, email: user.email, role: user.role } : null
}

export async function requireAdmin(event: H3Event): Promise<AdminUser> {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  if (!databaseConfigured() && !demoAllowed()) throw createError({ statusCode: 503, statusMessage: 'กรุณาตั้งค่าฐานข้อมูลก่อนใช้งานระบบจัดการ' })
  try {
    const user = await getAdminSession(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' })
    return user
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 503, statusMessage: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการตั้งค่า' })
  }
}

export async function logoutAdmin(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (token && databaseConfigured()) {
    const db = await getDatabase()
    if (db) await db.execute('DELETE FROM admin_sessions WHERE token_hash = ?', [hashToken(token)])
  }
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function isDemoLoginAllowed() {
  return demoAllowed()
}
