import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const status = String(query.status || '')
  const search = String(query.q || '').trim().toLowerCase()
  const db = await getDatabase()
  if (!db) {
    let orders = [...getDemoState().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (status && status !== 'all') orders = orders.filter((order) => order.status === status)
    if (search) orders = orders.filter((order) => `${order.orderNo} ${order.customer.name} ${order.customer.phone}`.toLowerCase().includes(search))
    return { orders, demo: true }
  }

  const conditions: string[] = []
  const params: unknown[] = []
  if (status && status !== 'all') { conditions.push('o.status = ?'); params.push(status) }
  if (search) { conditions.push('(LOWER(o.order_no) LIKE ? OR LOWER(o.shipping_name) LIKE ? OR o.shipping_phone LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  const [rows] = await db.query<any[]>(
    `SELECT o.id, o.order_no AS orderNo, o.customer_id AS customerId, o.status,
            o.payment_status AS paymentStatus, o.payment_method AS paymentMethod, o.subtotal,
            o.shipping_fee AS shippingFee, o.total, o.shipping_name AS shippingName,
            o.shipping_phone AS shippingPhone, o.shipping_address AS shippingAddress, o.note,
            o.created_at AS createdAt, c.email AS customerEmail
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY o.created_at DESC LIMIT 200`, params,
  )
  if (!rows.length) return { orders: [], demo: false }
  const ids = rows.map((row) => Number(row.id))
  const placeholders = ids.map(() => '?').join(',')
  const [itemRows] = await db.query<any[]>(
    `SELECT order_id AS orderId, product_id AS productId, sku, product_name AS productName, quantity, unit_price AS unitPrice, line_total AS lineTotal
       FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`, ids,
  )
  const [shipmentRows] = await db.query<any[]>(
    `SELECT id, order_id AS orderId, carrier, tracking_no AS trackingNo, status, shipped_at AS shippedAt, delivered_at AS deliveredAt, note
       FROM shipments WHERE order_id IN (${placeholders})`, ids,
  )
  const itemMap = new Map<number, any[]>()
  for (const item of itemRows) {
    const key = Number(item.orderId)
    if (!itemMap.has(key)) itemMap.set(key, [])
    itemMap.get(key)!.push({ ...item, productId: Number(item.productId), quantity: Number(item.quantity), unitPrice: Number(item.unitPrice), lineTotal: Number(item.lineTotal) })
  }
  const shipmentMap = new Map(shipmentRows.map((shipment) => [Number(shipment.orderId), { ...shipment, id: Number(shipment.id), orderId: Number(shipment.orderId) }]))
  const orders = rows.map((order) => ({
    ...order,
    id: Number(order.id),
    customerId: order.customerId ? Number(order.customerId) : null,
    customer: { id: order.customerId ? Number(order.customerId) : null, name: order.shippingName, email: order.customerEmail || '', phone: order.shippingPhone },
    subtotal: Number(order.subtotal), shippingFee: Number(order.shippingFee), total: Number(order.total),
    items: itemMap.get(Number(order.id)) || [],
    shipment: shipmentMap.get(Number(order.id)) || null,
  }))
  return { orders, demo: false }
})
