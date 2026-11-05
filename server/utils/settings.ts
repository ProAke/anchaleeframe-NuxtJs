import type { Pool } from 'mysql2/promise'

export interface StoreSettings {
  storeName: string
  supportEmail: string
  supportPhone: string
  announcementText: string
  lineUrl: string
  promptPayEnabled: boolean
  promptPayId: string
  bankTransferEnabled: boolean
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  otherPaymentEnabled: boolean
  otherPaymentName: string
  otherPaymentInstructions: string
  otherPaymentUrl: string
  companyTruckEnabled: boolean
  companyTruckFee: number
  companyTruckFreeThreshold: number
  privateCarrierEnabled: boolean
  privateCarrierFee: number
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'อัญชลีกรอบรูป',
  supportEmail: '',
  supportPhone: '086-066-9103',
  announcementText: 'กรอบสำเร็จรูป · รับทำกรอบตามขนาด · จัดส่งทั่วประเทศ',
  lineUrl: 'https://lin.ee/USvuiWP',
  promptPayEnabled: false,
  promptPayId: '',
  bankTransferEnabled: false,
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  otherPaymentEnabled: false,
  otherPaymentName: '',
  otherPaymentInstructions: '',
  otherPaymentUrl: '',
  companyTruckEnabled: true,
  companyTruckFee: 150,
  companyTruckFreeThreshold: 10000,
  privateCarrierEnabled: true,
  privateCarrierFee: 120,
}

const settingsState = globalThis as typeof globalThis & { __anchaleeFrameSettings?: StoreSettings }
const keys = Object.keys(DEFAULT_STORE_SETTINGS) as Array<keyof StoreSettings>
const booleanKeys = new Set<keyof StoreSettings>([
  'promptPayEnabled', 'bankTransferEnabled', 'otherPaymentEnabled', 'companyTruckEnabled', 'privateCarrierEnabled',
])
const numericKeys = new Set<keyof StoreSettings>(['companyTruckFee', 'companyTruckFreeThreshold', 'privateCarrierFee'])
const textLimits: Partial<Record<keyof StoreSettings, number>> = {
  storeName: 120,
  supportEmail: 190,
  supportPhone: 40,
  announcementText: 180,
  lineUrl: 240,
  promptPayId: 32,
  bankName: 120,
  bankAccountName: 160,
  bankAccountNumber: 80,
  otherPaymentName: 100,
  otherPaymentInstructions: 1000,
  otherPaymentUrl: 500,
}

function parseSettings(values: Record<string, unknown>): StoreSettings {
  const result = { ...DEFAULT_STORE_SETTINGS }
  for (const key of keys) {
    const value = values[key]
    if (value === undefined || value === null) continue
    if (booleanKeys.has(key)) {
      ;(result as any)[key] = value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1'
    } else if (numericKeys.has(key)) {
      const number = Number(value)
      if (Number.isFinite(number) && number >= 0) (result as any)[key] = number
    } else {
      ;(result as any)[key] = String(value).trim().slice(0, textLimits[key] ?? 240)
    }
  }
  return result
}

export async function getStoreSettings(db: Pool | null): Promise<StoreSettings> {
  if (!db) {
    const values = settingsState.__anchaleeFrameSettings
    return values ? parseSettings(values as unknown as Record<string, unknown>) : { ...DEFAULT_STORE_SETTINGS }
  }
  const [rows] = await db.query<any[]>('SELECT setting_key AS settingKey, setting_value AS settingValue FROM store_settings')
  return parseSettings(Object.fromEntries(rows.map((row) => [row.settingKey, row.settingValue])))
}

export async function saveStoreSettings(db: Pool | null, patch: Partial<StoreSettings>) {
  const allowed: Partial<StoreSettings> = {}
  for (const key of keys) {
    const value = patch[key]
    if (value === undefined) continue
    if (booleanKeys.has(key)) {
      ;(allowed as any)[key] = value === true || String(value).toLowerCase() === 'true' || String(value) === '1'
    } else if (numericKeys.has(key)) {
      const number = Number(value)
      if (Number.isFinite(number) && number >= 0) (allowed as any)[key] = number
    } else {
      ;(allowed as any)[key] = String(value).trim().slice(0, textLimits[key] ?? 240)
    }
  }
  const current = await getStoreSettings(db)
  const next = { ...current, ...allowed }
  if (!db) {
    settingsState.__anchaleeFrameSettings = next
    return next
  }
  for (const key of keys) {
    if (allowed[key] !== undefined) {
      await db.execute(
        'INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, String(next[key])],
      )
    }
  }
  return next
}
