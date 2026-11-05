import { loginAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  if (!body?.email || !body?.password) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกอีเมลและรหัสผ่าน' })
  return loginAdmin(event, String(body.email), String(body.password))
})
