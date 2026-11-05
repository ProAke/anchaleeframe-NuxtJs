import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  if (!db) return { shipments: [...getDemoState().shipments].sort((a, b) => b.shippedAt.localeCompare(a.shippedAt)), demo: true }
  const [rows] = await db.query<any[]>(
    `SELECT s.id, s.order_id AS orderId, o.order_no AS orderNo, o.shipping_name AS customerName,
            o.shipping_phone AS customerPhone, s.carrier, s.tracking_no AS trackingNo, s.status,
            s.shipped_at AS shippedAt, s.delivered_at AS deliveredAt, s.note
       FROM shipments s JOIN orders o ON o.id = s.order_id
      ORDER BY s.shipped_at DESC LIMIT 200`,
  )
  return { shipments: rows.map((row) => ({ ...row, id: Number(row.id), orderId: Number(row.orderId) })), demo: false }
})
