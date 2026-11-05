import { setResponseHeader } from 'h3'
import { getCustomerSession } from '../../utils/customer-auth'
import { lineLoginIsConfigured } from '../../utils/customer-auth'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const account = await getCustomerSession(event)
  return {
    user: account ? {
      id: account.id,
      displayName: account.displayName,
      email: account.email,
      pictureUrl: account.pictureUrl,
      phone: account.phone,
      address: account.address,
    } : null,
    lineLoginEnabled: lineLoginIsConfigured(),
  }
})
