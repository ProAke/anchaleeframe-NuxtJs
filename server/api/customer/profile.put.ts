import { setResponseHeader } from 'h3'
import { getDatabase } from '../../utils/db'
import { requireCustomer } from '../../utils/customer-auth'

export default defineEventHandler(async (event) => {
  const account = await requireCustomer(event)
  const body = await readBody<{ phone?: string; address?: string }>(event)
  const phone = String(body?.phone || '').replace(/[\s()-]/g, '').slice(0, 40)
  const address = String(body?.address || '').trim().slice(0, 2000)
  if (!/^\+?\d{8,15}$/.test(phone) || address.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกเบอร์โทรศัพท์และที่อยู่จัดส่งให้ครบถ้วน' })
  }
  const db = await getDatabase()
  if (!db) throw createError({ statusCode: 503, statusMessage: 'ระบบบัญชียังไม่พร้อมใช้งาน' })
  await db.execute('UPDATE customer_accounts SET phone = ?, address = ? WHERE id = ?', [phone, address, account.id])
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { ok: true, user: { ...account, phone, address } }
})
