import { demoDataAllowed, getDatabase } from '../utils/db'
import { getStoreSettings } from '../utils/settings'
import { lineLoginIsConfigured } from '../utils/customer-auth'

export default defineEventHandler(async () => {
  const db = await getDatabase()
  const settings = await getStoreSettings(db)
  return {
    settings,
    capabilities: {
      lineLoginEnabled: lineLoginIsConfigured(),
      promptPayEnabled: settings.promptPayEnabled && Boolean(settings.promptPayId),
      bankTransferEnabled: settings.bankTransferEnabled && Boolean(settings.bankName && settings.bankAccountName && settings.bankAccountNumber),
      otherPaymentEnabled: settings.otherPaymentEnabled && Boolean(settings.otherPaymentName && settings.otherPaymentInstructions),
    },
    demo: demoDataAllowed(),
    setupRequired: !db && process.env.NODE_ENV === 'production',
  }
})
