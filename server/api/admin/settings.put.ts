import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { saveStoreSettings, type StoreSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<StoreSettings>>(event)
  const storeName = String(body?.storeName || '').trim()
  const supportEmail = String(body?.supportEmail || '').trim()
  if (!storeName) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อร้านค้า' })
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) throw createError({ statusCode: 400, statusMessage: 'รูปแบบอีเมลไม่ถูกต้อง' })
  if (body.lineUrl && !/^https:\/\//i.test(body.lineUrl)) throw createError({ statusCode: 400, statusMessage: 'ลิงก์ LINE ต้องขึ้นต้นด้วย https://' })
  const settings = await saveStoreSettings(await getDatabase(), body)
  return { settings, ok: true }
})
