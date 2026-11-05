import { loginAdmin } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'admin-login', 8, 15 * 60 * 1000)
  const body = await readBody<{ email?: string; password?: string }>(event)
  if (!body?.email || !body?.password) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกอีเมลและรหัสผ่าน' })
  const email = String(body.email).trim()
  const password = String(body.password)
  if (email.length > 254 || password.length > 200) throw createError({ statusCode: 400, statusMessage: 'ข้อมูลเข้าสู่ระบบยาวเกินกำหนด' })
  return loginAdmin(event, email, password)
})
