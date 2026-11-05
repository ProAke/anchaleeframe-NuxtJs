import { demoDataAllowed, getDatabase } from '../utils/db'
import { getDemoState } from '../utils/demo'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = String(query.q || '').trim().toLowerCase()
  const category = String(query.category || '').trim()
  const slug = String(query.slug || '').trim()
  const db = await getDatabase()

  if (!db && !demoDataAllowed()) return { products: [], categories: [], demo: false, setupRequired: true }
  if (!db) {
    const state = getDemoState()
    let products = state.products.filter((product) => product.status === 'active')
    if (category) products = products.filter((product) => product.category === category || String(product.categoryId) === category)
    if (slug) products = products.filter((product) => product.slug === slug)
    if (search) products = products.filter((product) => `${product.name} ${product.subtitle} ${product.sku}`.toLowerCase().includes(search))
    const categories = state.categories.map((item) => ({ ...item, count: state.products.filter((product) => product.categoryId === item.id && product.status === 'active').length }))
    return { products, categories, demo: true }
  }

  const conditions = ["p.status = 'active'"]
  const values: unknown[] = []
  if (slug) { conditions.push('p.slug = ?'); values.push(slug) }
  if (category) { conditions.push('(c.slug = ? OR c.name = ?)'); values.push(category, category) }
  if (search) { conditions.push('(LOWER(p.name) LIKE ? OR LOWER(p.subtitle) LIKE ? OR LOWER(p.sku) LIKE ?)'); values.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  const [rows] = await db.query<any[]>(
    `SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.description,
            p.category_id AS categoryId, c.name AS category, c.slug AS categorySlug,
            p.price, p.compare_at_price AS compareAtPrice, p.stock, p.low_stock AS lowStock,
            p.status, p.image_key AS imageKey, p.image_url AS imageUrl, p.created_at AS createdAt
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${conditions.join(' AND ')} ORDER BY p.id ASC`,
    values,
  )
  const [categoryRows] = await db.query<any[]>(
    `SELECT c.id, c.slug, c.name, COUNT(p.id) AS count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
      GROUP BY c.id, c.slug, c.name ORDER BY c.sort_order, c.name`,
  )
  return {
    products: rows.map((product) => ({ ...product, id: Number(product.id), categoryId: product.categoryId ? Number(product.categoryId) : null, price: Number(product.price), compareAtPrice: product.compareAtPrice == null ? null : Number(product.compareAtPrice), stock: Number(product.stock), lowStock: Number(product.lowStock), createdAt: product.createdAt })),
    categories: categoryRows.map((item) => ({ ...item, id: Number(item.id), count: Number(item.count) })),
    demo: false,
  }
})
