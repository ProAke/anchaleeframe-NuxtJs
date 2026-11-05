import { demoDataAllowed, getDatabase } from '../utils/db'
import { getStoreSettings } from '../utils/settings'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  return { settings: await getStoreSettings(db), demo: demoDataAllowed(), setupRequired: !db && process.env.NODE_ENV === 'production' }
})
