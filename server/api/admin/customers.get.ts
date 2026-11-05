import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  if (!db) return { customers: [...getDemoState().customers].sort((a, b) => b.totalSpent - a.totalSpent), demo: true }
  const [rows] = await db.query<any[]>(
    `SELECT c.id, c.name, c.email, c.phone, c.address, c.created_at AS createdAt,
            COUNT(CASE WHEN o.status <> 'cancelled' THEN o.id END) AS ordersCount,
            COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total ELSE 0 END), 0) AS totalSpent,
            MAX(o.created_at) AS lastOrderAt
       FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id ORDER BY lastOrderAt DESC, c.created_at DESC LIMIT 500`,
  )
  return { customers: rows.map((row) => ({ ...row, id: Number(row.id), ordersCount: Number(row.ordersCount), totalSpent: Number(row.totalSpent) })), demo: false }
})
