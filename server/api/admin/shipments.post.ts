import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody<any>(event)
  const orderId = Number(body?.orderId)
  const carrier = String(body?.carrier || '').trim().slice(0, 80)
  const trackingNo = String(body?.trackingNo || '').trim().slice(0, 100)
  const note = String(body?.note || '').trim().slice(0, 400)
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !carrier || !trackingNo) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกคำสั่งซื้อ พร้อมระบุขนส่งและเลขพัสดุ' })
  }
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    const order = state.orders.find((entry) => entry.id === orderId)
    if (!order) throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำสั่งซื้อ' })
    if (order.status === 'cancelled') throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อที่ยกเลิกแล้วไม่สามารถจัดส่งได้' })
    if (order.shipment) throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อนี้มีข้อมูลจัดส่งแล้ว' })
    const shipment = { id: state.nextShipmentId++, orderId, orderNo: order.orderNo, customerName: order.shippingName, customerPhone: order.shippingPhone, carrier, trackingNo, status: 'in_transit', shippedAt: new Date().toISOString(), deliveredAt: null, note }
    state.shipments.unshift(shipment)
    order.shipment = shipment
    order.status = 'shipped'
    return { shipment, demo: true }
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.query<any[]>('SELECT id, order_no AS orderNo, status, shipping_name AS customerName, shipping_phone AS customerPhone FROM orders WHERE id = ? FOR UPDATE', [orderId])
    const order = rows[0]
    if (!order) throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำสั่งซื้อ' })
    if (order.status === 'cancelled') throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อที่ยกเลิกแล้วไม่สามารถจัดส่งได้' })
    const [existing] = await connection.query<any[]>('SELECT id FROM shipments WHERE order_id = ? LIMIT 1', [orderId])
    if (existing.length) throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อนี้มีข้อมูลจัดส่งแล้ว' })
    const [result] = await connection.execute<any>(
      'INSERT INTO shipments (order_id, carrier, tracking_no, status, note) VALUES (?, ?, ?, ?, ?)',
      [orderId, carrier, trackingNo, 'in_transit', note],
    )
    await connection.execute("UPDATE orders SET status = 'shipped' WHERE id = ?", [orderId])
    await connection.commit()
    return { shipment: { id: Number(result.insertId), orderId, orderNo: order.orderNo, customerName: order.customerName, customerPhone: order.customerPhone, carrier, trackingNo, status: 'in_transit', shippedAt: new Date().toISOString(), deliveredAt: null, note }, demo: false }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
