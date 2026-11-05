import { logoutAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await logoutAdmin(event)
  return { ok: true }
})
