import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    return {
      products: [...state.products].sort((a, b) => a.stock - b.stock),
      movements: state.movements.slice(0, 40),
      summary: { units: state.products.reduce((sum, product) => sum + product.stock, 0), lowStock: state.products.filter((product) => product.stock <= product.lowStock).length },
      demo: true,
    }
  }
  const [products] = await db.query<any[]>(
    `SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.price, p.stock, p.low_stock AS lowStock, p.status, p.image_key AS imageKey, p.image_url AS imageUrl, c.name AS category
       FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.stock ASC, p.name`,
  )
  const [movements] = await db.query<any[]>(
    `SELECT m.id, m.product_id AS productId, p.sku, p.name AS productName, m.delta, m.kind,
            m.reference, m.note, m.created_by AS createdBy, m.created_at AS createdAt
       FROM stock_movements m JOIN products p ON p.id = m.product_id
      ORDER BY m.created_at DESC, m.id DESC LIMIT 40`,
  )
  const [summaryRows] = await db.query<any[]>(
    `SELECT COALESCE(SUM(stock), 0) AS units, SUM(status = 'active' AND stock <= low_stock) AS lowStock FROM products`,
  )
  return {
    products: products.map((item) => ({ ...item, id: Number(item.id), price: Number(item.price), stock: Number(item.stock), lowStock: Number(item.lowStock) })),
    movements: movements.map((item) => ({ ...item, id: Number(item.id), productId: Number(item.productId), delta: Number(item.delta) })),
    summary: { units: Number(summaryRows[0]?.units || 0), lowStock: Number(summaryRows[0]?.lowStock || 0) },
    demo: false,
  }
})
