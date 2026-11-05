import { getRequestHeader } from 'h3'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  const method = (event.node.req.method || 'GET').toUpperCase()
  if (SAFE_METHODS.has(method)) return
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (Number.isFinite(contentLength) && contentLength > 2 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'ขนาดคำขอใหญ่เกินกำหนด' })
  }
  const origin = getRequestHeader(event, 'origin')
  if (!origin) return // Allows non-browser API clients; browsers attach Origin to unsafe same-origin requests.
  if (origin === 'null') throw createError({ statusCode: 403, statusMessage: 'คำขอจากต้นทางนี้ไม่ได้รับอนุญาต' })

  let originHost = ''
  try { originHost = new URL(origin).host.toLowerCase() } catch {
    throw createError({ statusCode: 403, statusMessage: 'ต้นทางของคำขอไม่ถูกต้อง' })
  }
  const forwardedHost = getRequestHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim().toLowerCase()
  const requestHost = getRequestHeader(event, 'host')?.toLowerCase()
  const allowedHosts = [forwardedHost, requestHost].filter(Boolean)
  if (!allowedHosts.includes(originHost)) {
    throw createError({ statusCode: 403, statusMessage: 'คำขอจากต้นทางนี้ไม่ได้รับอนุญาต' })
  }
})
