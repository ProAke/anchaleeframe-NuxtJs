import type { Pool } from 'mysql2/promise'

export interface StoreSettings {
  storeName: string
  supportEmail: string
  supportPhone: string
  announcementText: string
  lineUrl: string
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'อัญชลีกรอบรูป',
  supportEmail: '',
  supportPhone: '086-066-9103',
  announcementText: 'กรอบสำเร็จรูป · รับทำกรอบตามขนาด · จัดส่งทั่วประเทศ',
  lineUrl: 'https://lin.ee/USvuiWP',
}

const settingsState = globalThis as typeof globalThis & { __anchaleeFrameSettings?: StoreSettings }
const keys = Object.keys(DEFAULT_STORE_SETTINGS) as Array<keyof StoreSettings>

export async function getStoreSettings(db: Pool | null): Promise<StoreSettings> {
  if (!db) return { ...DEFAULT_STORE_SETTINGS, ...(settingsState.__anchaleeFrameSettings || {}) }
  const [rows] = await db.query<any[]>('SELECT setting_key AS settingKey, setting_value AS settingValue FROM store_settings')
  const values = Object.fromEntries(rows.map((row) => [row.settingKey, row.settingValue]))
  return { ...DEFAULT_STORE_SETTINGS, ...Object.fromEntries(keys.filter((key) => values[key] !== undefined).map((key) => [key, values[key]])) } as StoreSettings
}

export async function saveStoreSettings(db: Pool | null, patch: Partial<StoreSettings>) {
  const allowed: Partial<StoreSettings> = {}
  for (const key of keys) {
    if (patch[key] !== undefined) allowed[key] = String(patch[key]).trim().slice(0, key === 'announcementText' ? 180 : 240)
  }
  const current = await getStoreSettings(db)
  const next = { ...current, ...allowed }
  if (!db) {
    settingsState.__anchaleeFrameSettings = next
    return next
  }
  for (const key of keys) {
    if (allowed[key] !== undefined) {
      await db.execute('INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [key, next[key]])
    }
  }
  return next
}
