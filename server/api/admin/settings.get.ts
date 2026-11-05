import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getStoreSettings } from '../../utils/settings'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  return { settings: await getStoreSettings(db), demo: !db }
})
