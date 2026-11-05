import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

const money = (value: unknown) => Number(value || 0)

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    const liveOrders = state.orders.filter((order) => order.status !== 'cancelled')
    const paidOrders = liveOrders.filter((order) => order.paymentStatus === 'paid')
    const today = new Date().toISOString().slice(0, 10)
    const month = today.slice(0, 7)
    const recentOrders = [...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
    const lowStockProducts = state.products.filter((product) => product.status === 'active' && product.stock <= product.lowStock)
    const chart = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const key = date.toISOString().slice(0, 10)
      const value = paidOrders.filter((order) => order.createdAt.slice(0, 10) === key).reduce((sum, order) => sum + order.total, 0)
      return { date: key, label: new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(date), value }
    })
    return {
      demo: true,
      stats: {
        revenueToday: paidOrders.filter((order) => order.createdAt.slice(0, 10) === today).reduce((sum, order) => sum + order.total, 0),
        revenueMonth: paidOrders.filter((order) => order.createdAt.slice(0, 7) === month).reduce((sum, order) => sum + order.total, 0),
        totalOrders: state.orders.length,
        pendingOrders: state.orders.filter((order) => ['pending', 'processing'].includes(order.status)).length,
        lowStock: lowStockProducts.length,
        activeProducts: state.products.filter((product) => product.status === 'active').length,
        averageOrder: paidOrders.length ? Math.round(paidOrders.reduce((sum, order) => sum + order.total, 0) / paidOrders.length) : 0,
      },
      recentOrders,
      lowStockProducts,
      chart,
    }
  }

  const [[aggregate]] = await db.query<any[]>(
    `SELECT
       COALESCE(SUM(CASE WHEN payment_status = 'paid' AND DATE(created_at) = UTC_DATE() AND status <> 'cancelled' THEN total ELSE 0 END), 0) AS revenueToday,
       COALESCE(SUM(CASE WHEN payment_status = 'paid' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(UTC_DATE(), '%Y-%m') AND status <> 'cancelled' THEN total ELSE 0 END), 0) AS revenueMonth,
       COUNT(*) AS totalOrders,
       SUM(status IN ('pending', 'processing')) AS pendingOrders,
       (SELECT COUNT(*) FROM products WHERE status = 'active' AND stock <= low_stock) AS lowStock,
       (SELECT COUNT(*) FROM products WHERE status = 'active') AS activeProducts,
       COALESCE(AVG(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total END), 0) AS averageOrder
     FROM orders`,
  )
  const [orderRows] = await db.query<any[]>(
    `SELECT o.id, o.order_no AS orderNo, o.status, o.payment_status AS paymentStatus, o.total,
            o.created_at AS createdAt, o.shipping_name AS customerName, o.shipping_phone AS customerPhone,
            COUNT(oi.id) AS itemCount
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT 6`,
  )
  const [stockRows] = await db.query<any[]>(
    `SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.price, p.stock, p.low_stock AS lowStock,
            p.image_key AS imageKey, p.image_url AS imageUrl, c.name AS category
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'active' AND p.stock <= p.low_stock
      ORDER BY p.stock ASC, p.name LIMIT 6`,
  )
  const [chartRows] = await db.query<any[]>(
    `SELECT DATE(created_at) AS day, COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total ELSE 0 END), 0) AS value
       FROM orders WHERE created_at >= UTC_DATE() - INTERVAL 6 DAY
      GROUP BY DATE(created_at) ORDER BY day`,
  )
  const chartMap = new Map(chartRows.map((row) => [String(row.day).slice(0, 10), money(row.value)]))
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    return { date: key, label: new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date), value: chartMap.get(key) || 0 }
  })

  return {
    demo: false,
    stats: Object.fromEntries(Object.entries(aggregate).map(([key, value]) => [key, money(value)])),
    recentOrders: orderRows.map((row) => ({ ...row, id: Number(row.id), total: money(row.total), itemCount: Number(row.itemCount), createdAt: row.createdAt })),
    lowStockProducts: stockRows.map((row) => ({ ...row, id: Number(row.id), price: money(row.price), stock: Number(row.stock), lowStock: Number(row.lowStock) })),
    chart,
  }
})
