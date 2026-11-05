import { getAdminSession, isDemoLoginAllowed } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAdminSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'ยังไม่ได้เข้าสู่ระบบ' })
  return { user, demo: isDemoLoginAllowed() }
})
