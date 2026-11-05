import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    const paid = state.orders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled')
    const products = state.products.map((product) => ({
      id: product.id, name: product.name, sku: product.sku,
      unitsSold: state.orders.flatMap((order) => order.items).filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0),
      revenue: state.orders.flatMap((order) => order.items).filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.lineTotal, 0),
      stock: product.stock,
    })).sort((a, b) => b.revenue - a.revenue)
    return { revenue: paid.reduce((sum, order) => sum + order.total, 0), orders: state.orders.length, averageOrder: paid.length ? Math.round(paid.reduce((sum, order) => sum + order.total, 0) / paid.length) : 0, products, chart: paid.slice(0, 7).reverse().map((order) => ({ label: new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(new Date(order.createdAt)), value: order.total })), demo: true }
  }
  const [[aggregate]] = await db.query<any[]>(
    `SELECT COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
            COUNT(CASE WHEN status <> 'cancelled' THEN id END) AS orders,
            COALESCE(AVG(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total END), 0) AS averageOrder FROM orders`,
  )
  const [products] = await db.query<any[]>(
    `SELECT p.id, p.name, p.sku, p.stock, COALESCE(SUM(oi.quantity), 0) AS unitsSold,
            COALESCE(SUM(oi.line_total), 0) AS revenue
       FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id ORDER BY revenue DESC LIMIT 20`,
  )
  const [chartRows] = await db.query<any[]>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
            COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total ELSE 0 END), 0) AS value
       FROM orders WHERE created_at >= UTC_DATE() - INTERVAL 6 DAY GROUP BY DATE(created_at) ORDER BY day`,
  )
  const chartMap = new Map(chartRows.map((row) => [row.day, Number(row.value)]))
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - (6 - index))
    const day = date.toISOString().slice(0, 10)
    return { label: new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date), value: chartMap.get(day) || 0 }
  })
  return { revenue: Number(aggregate.revenue || 0), orders: Number(aggregate.orders || 0), averageOrder: Math.round(Number(aggregate.averageOrder || 0)), products: products.map((row) => ({ ...row, id: Number(row.id), stock: Number(row.stock), unitsSold: Number(row.unitsSold), revenue: Number(row.revenue) })), chart, demo: false }
})
