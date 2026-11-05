import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    return { products: state.products, categories: state.categories, demo: true }
  }
  const [products] = await db.query<any[]>(
    `SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.description,
            p.category_id AS categoryId, c.name AS category, c.slug AS categorySlug,
            p.price, p.compare_at_price AS compareAtPrice, p.stock, p.low_stock AS lowStock,
            p.status, p.image_key AS imageKey, p.image_url AS imageUrl, p.created_at AS createdAt
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC, p.id DESC`,
  )
  const [categories] = await db.query<any[]>('SELECT id, slug, name FROM categories ORDER BY sort_order, name')
  return {
    products: products.map((product) => ({ ...product, id: Number(product.id), categoryId: product.categoryId ? Number(product.categoryId) : null, price: Number(product.price), compareAtPrice: product.compareAtPrice == null ? null : Number(product.compareAtPrice), stock: Number(product.stock), lowStock: Number(product.lowStock) })),
    categories: categories.map((category) => ({ ...category, id: Number(category.id) })),
    demo: false,
  }
})
