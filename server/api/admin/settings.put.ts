import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { saveStoreSettings, type StoreSettings } from '../../utils/settings'

function validHttpsUrl(value: unknown) {
  if (!value) return true
  try { return new URL(String(value)).protocol === 'https:' } catch { return false }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<StoreSettings>>(event)
  const storeName = String(body?.storeName || '').trim()
  const supportEmail = String(body?.supportEmail || '').trim()
  if (!storeName) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อร้านค้า' })
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) throw createError({ statusCode: 400, statusMessage: 'รูปแบบอีเมลไม่ถูกต้อง' })
  if (!validHttpsUrl(body.lineUrl)) throw createError({ statusCode: 400, statusMessage: 'ลิงก์ LINE ต้องขึ้นต้นด้วย https://' })
  if (!validHttpsUrl(body.otherPaymentUrl)) throw createError({ statusCode: 400, statusMessage: 'ลิงก์ชำระเงินอื่นต้องขึ้นต้นด้วย https://' })

  const promptPayId = String(body.promptPayId || '').replace(/\D/g, '')
  if (body.promptPayEnabled && ![10, 13, 15].includes(promptPayId.length)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุ PromptPay ID เป็นเบอร์โทร 10 หลัก เลขประจำตัว/ภาษี 13 หลัก หรือ e-Wallet ID 15 หลัก' })
  }
  if (body.bankTransferEnabled && (!body.bankName || !body.bankAccountName || !String(body.bankAccountNumber || '').trim())) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกธนาคาร ชื่อบัญชี และเลขที่บัญชีก่อนเปิดรับโอน' })
  }
  if (body.otherPaymentEnabled && (!body.otherPaymentName || !body.otherPaymentInstructions)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อช่องทางและวิธีชำระเงินอื่นให้ครบถ้วน' })
  }

  for (const key of ['companyTruckFee', 'companyTruckFreeThreshold', 'privateCarrierFee'] as const) {
    if (body[key] !== undefined) {
      const amount = Number(body[key])
      if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
        throw createError({ statusCode: 400, statusMessage: 'ค่าจัดส่งและยอดขั้นต่ำต้องเป็นตัวเลขตั้งแต่ 0 ถึง 100,000 บาท' })
      }
    }
  }
  const normalizedBody = { ...body, promptPayId }
  const settings = await saveStoreSettings(await getDatabase(), normalizedBody)
  return { settings, ok: true }
})
