import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/db'
import { getDemoState } from '../../../utils/demo'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded']

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const orderId = Number(getRouterParam(event, 'id'))
  const body = await readBody<any>(event)
  const nextStatus = body?.status ? String(body.status) : ''
  const paymentStatus = body?.paymentStatus ? String(body.paymentStatus) : ''
  if (!Number.isSafeInteger(orderId) || orderId < 1) throw createError({ statusCode: 400, statusMessage: 'เลขคำสั่งซื้อไม่ถูกต้อง' })
  if (nextStatus && !ORDER_STATUSES.includes(nextStatus)) throw createError({ statusCode: 400, statusMessage: 'สถานะคำสั่งซื้อไม่ถูกต้อง' })
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) throw createError({ statusCode: 400, statusMessage: 'สถานะการชำระเงินไม่ถูกต้อง' })
  if (!nextStatus && !paymentStatus) throw createError({ statusCode: 400, statusMessage: 'ไม่มีข้อมูลสำหรับอัปเดต' })
  const db = await getDatabase()

  if (!db) {
    const state = getDemoState()
    const order = state.orders.find((item) => item.id === orderId)
    if (!order) throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำสั่งซื้อ' })
    if (order.status === 'cancelled' && nextStatus && nextStatus !== 'cancelled') throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อที่ยกเลิกแล้วไม่สามารถเปิดใหม่ได้' })
    if (nextStatus === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อที่จัดส่งแล้วไม่สามารถยกเลิกได้' })
    if (nextStatus === 'shipped' && !order.shipment) throw createError({ statusCode: 409, statusMessage: 'กรุณาบันทึกข้อมูลจัดส่งก่อนเปลี่ยนเป็นจัดส่งแล้ว' })
    if (nextStatus === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = state.products.find((entry) => entry.id === item.productId)
        if (product) {
          product.stock += item.quantity
          state.movements.unshift({ id: state.nextMovementId++, productId: product.id, sku: product.sku, productName: product.name, delta: item.quantity, kind: 'return', reference: order.orderNo, note: 'คืนสต็อกจากการยกเลิกคำสั่งซื้อ', createdBy: user.name, createdAt: new Date().toISOString() })
        }
      }
    }
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      const customer = state.customers.find((item) => item.phone === order.customer.phone)
      if (customer && paymentStatus === 'paid') customer.totalSpent += order.total
      if (customer && paymentStatus !== 'paid' && order.paymentStatus === 'paid') customer.totalSpent = Math.max(0, customer.totalSpent - order.total)
    }
    if (nextStatus) order.status = nextStatus
    if (paymentStatus) order.paymentStatus = paymentStatus
    return { order, demo: true }
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [orderRows] = await connection.query<any[]>('SELECT id, order_no AS orderNo, status FROM orders WHERE id = ? FOR UPDATE', [orderId])
    const order = orderRows[0]
    if (!order) throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำสั่งซื้อ' })
    if (order.status === 'cancelled' && nextStatus && nextStatus !== 'cancelled') throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อที่ยกเลิกแล้วไม่สามารถเปิดใหม่ได้' })
    if (nextStatus === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) throw createError({ statusCode: 409, statusMessage: 'คำสั่งซื้อที่จัดส่งแล้วไม่สามารถยกเลิกได้' })
    if (nextStatus === 'shipped') {
      const [shipments] = await connection.query<any[]>('SELECT id FROM shipments WHERE order_id = ? LIMIT 1', [orderId])
      if (!shipments.length) throw createError({ statusCode: 409, statusMessage: 'กรุณาบันทึกข้อมูลจัดส่งก่อนเปลี่ยนเป็นจัดส่งแล้ว' })
    }
    if (nextStatus === 'cancelled' && order.status !== 'cancelled') {
      const [items] = await connection.query<any[]>('SELECT product_id AS productId, sku, product_name AS productName, quantity FROM order_items WHERE order_id = ?', [orderId])
      for (const item of items) {
        if (item.productId) {
          await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.productId])
          await connection.execute('INSERT INTO stock_movements (product_id, delta, kind, reference, note, created_by) VALUES (?, ?, ?, ?, ?, ?)', [item.productId, item.quantity, 'return', order.orderNo, 'คืนสต็อกจากการยกเลิกคำสั่งซื้อ', user.name])
        }
      }
    }
    const updates: string[] = []
    const values: unknown[] = []
    if (nextStatus) { updates.push('status = ?'); values.push(nextStatus) }
    if (paymentStatus) { updates.push('payment_status = ?'); values.push(paymentStatus) }
    await connection.execute(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, [...values, orderId] as any[])
    await connection.commit()
    return { ok: true, demo: false }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
