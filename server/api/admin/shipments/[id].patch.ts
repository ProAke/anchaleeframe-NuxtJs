import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/db'
import { getDemoState } from '../../../utils/demo'

const allowed = ['in_transit', 'delivered', 'returned']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const status = String((await readBody<any>(event))?.status || '')
  if (!Number.isSafeInteger(id) || id < 1 || !allowed.includes(status)) throw createError({ statusCode: 400, statusMessage: 'ข้อมูลสถานะจัดส่งไม่ถูกต้อง' })
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    const shipment = state.shipments.find((item) => item.id === id)
    if (!shipment) throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการจัดส่ง' })
    shipment.status = status
    shipment.deliveredAt = status === 'delivered' ? new Date().toISOString() : null
    const order = state.orders.find((item) => item.id === shipment.orderId)
    if (order && status === 'delivered') order.status = 'delivered'
    if (order && status === 'returned') order.status = 'processing'
    return { shipment, demo: true }
  }
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.query<any[]>('SELECT id, order_id AS orderId FROM shipments WHERE id = ? FOR UPDATE', [id])
    if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการจัดส่ง' })
    const orderId = Number(rows[0].orderId)
    await connection.execute('UPDATE shipments SET status = ?, delivered_at = ? WHERE id = ?', [status, status === 'delivered' ? new Date() : null, id])
    if (status === 'delivered') await connection.execute("UPDATE orders SET status = 'delivered' WHERE id = ?", [orderId])
    if (status === 'returned') await connection.execute("UPDATE orders SET status = 'processing' WHERE id = ?", [orderId])
    await connection.commit()
    return { ok: true, demo: false }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
