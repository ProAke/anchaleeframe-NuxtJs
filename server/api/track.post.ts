import { setResponseHeader } from 'h3'
import { demoDataAllowed, getDatabase } from '../utils/db'
import { getDemoState } from '../utils/demo'
import { enforceRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'order-tracking', 20, 10 * 60 * 1000)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const body = await readBody<{ orderNo?: string; phone?: string }>(event)
  const orderNo = String(body?.orderNo || '').trim().toUpperCase().slice(0, 32)
  const phone = String(body?.phone || '').replace(/\D/g, '').slice(0, 40)
  if (!orderNo || phone.length < 8) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกเลขคำสั่งซื้อและเบอร์โทรศัพท์' })
  const db = await getDatabase()
  if (!db && !demoDataAllowed()) throw createError({ statusCode: 503, statusMessage: 'ระบบติดตามคำสั่งซื้อยังไม่พร้อมใช้งาน' })
  if (!db) {
    const order = getDemoState().orders.find((item) => item.orderNo.toUpperCase() === orderNo && item.shippingPhone.replace(/\D/g, '') === phone)
    if (!order) throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบข้อมูลอีกครั้ง' })
    return {
      order: {
        orderNo: order.orderNo,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod || 'private_carrier',
        total: order.total,
        createdAt: order.createdAt,
        shippingName: order.shippingName,
        items: order.items,
        shipment: order.shipment || null,
      },
      demo: true,
    }
  }
  const [rows] = await db.query<any[]>(
    `SELECT id, order_no AS orderNo, status,
            payment_status AS paymentStatus, payment_method AS paymentMethod,
            shipping_method AS shippingMethod, total, created_at AS createdAt,
            shipping_name AS shippingName
       FROM orders
      WHERE order_no = ?
        AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(shipping_phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') = ?
      LIMIT 1`,
    [orderNo, phone],
  )
  const order = rows[0]
  if (!order) throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบข้อมูลอีกครั้ง' })
  const [items] = await db.query<any[]>('SELECT sku, product_name AS productName, quantity, unit_price AS unitPrice, line_total AS lineTotal FROM order_items WHERE order_id = ? ORDER BY id', [order.id])
  const [shipments] = await db.query<any[]>('SELECT carrier, tracking_no AS trackingNo, status AS shipmentStatus, shipped_at AS shippedAt, delivered_at AS deliveredAt FROM shipments WHERE order_id = ? LIMIT 1', [order.id])
  return {
    order: {
      ...order,
      id: Number(order.id),
      total: Number(order.total),
      items: items.map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice), lineTotal: Number(item.lineTotal) })),
      shipment: shipments[0] || null,
    },
    demo: false,
  }
})
