import { setResponseHeader } from 'h3'
import { logoutCustomer } from '../../utils/customer-auth'

export default defineEventHandler(async (event) => {
  await logoutCustomer(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { ok: true }
})
