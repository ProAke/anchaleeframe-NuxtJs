import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

const text = (value: unknown, max = 180) => String(value ?? '').trim().slice(0, max)
const numeric = (value: unknown, fallback = 0) => {
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody<any>(event)
  const sku = text(body?.sku, 40).toUpperCase()
  const name = text(body?.name)
  if (!sku || !name) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุ SKU และชื่อสินค้า' })
  const price = numeric(body.price, -1)
  const stock = Math.floor(numeric(body.stock, -1))
  if (price < 0 || stock < 0) throw createError({ statusCode: 400, statusMessage: 'ราคาและจำนวนสต็อกต้องไม่ติดลบ' })
  const state = getDemoState()
  const categoryId = Math.max(1, Math.floor(numeric(body.categoryId, 1)))
  const category = state.categories.find((item) => item.id === categoryId) || state.categories[0]!
  const imageUrl = text(body.imageUrl, 800)
  if (imageUrl && !/^https:\/\//i.test(imageUrl)) throw createError({ statusCode: 400, statusMessage: 'ลิงก์รูปภาพต้องขึ้นต้นด้วย https://' })
  const slug = text(body.slug, 180) || `${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`
  const product = {
    sku,
    slug,
    name,
    subtitle: text(body.subtitle, 240),
    description: text(body.description, 2000),
    categoryId,
    price,
    compareAtPrice: numeric(body.compareAtPrice, 0) || null,
    stock,
    lowStock: Math.max(0, Math.floor(numeric(body.lowStock, 5))),
    status: body.status === 'draft' ? ('draft' as const) : ('active' as const),
    imageKey: text(body.imageKey, 40) || 'oak',
    imageUrl,
  }
  const db = await getDatabase()
  if (!db) {
    if (state.products.some((item) => item.sku.toLowerCase() === sku.toLowerCase())) throw createError({ statusCode: 409, statusMessage: 'SKU นี้ถูกใช้แล้ว' })
    const created = { ...product, id: state.nextProductId++, category: category.name, createdAt: new Date().toISOString() }
    state.products.unshift(created)
    if (stock > 0) state.movements.unshift({ id: state.nextMovementId++, productId: created.id, sku, productName: name, delta: stock, kind: 'received', reference: 'INITIAL', note: 'สต็อกตั้งต้นของสินค้าใหม่', createdBy: user.name, createdAt: new Date().toISOString() })
    return { product: created, demo: true }
  }

  const [categories] = await db.query<any[]>('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId])
  if (!categories.length) throw createError({ statusCode: 400, statusMessage: 'ไม่พบหมวดหมู่สินค้าที่เลือก' })
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<any>(
      `INSERT INTO products (sku, slug, name, subtitle, description, category_id, price, compare_at_price, stock, low_stock, status, image_key, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, slug, name, product.subtitle, product.description, categoryId, price, product.compareAtPrice, stock, product.lowStock, product.status, product.imageKey, product.imageUrl],
    )
    const id = Number(result.insertId)
    if (stock > 0) await connection.execute('INSERT INTO stock_movements (product_id, delta, kind, reference, note, created_by) VALUES (?, ?, ?, ?, ?, ?)', [id, stock, 'received', 'INITIAL', 'สต็อกตั้งต้นของสินค้าใหม่', user.name])
    await connection.commit()
    return { product: { ...product, id, category: category.name, createdAt: new Date().toISOString() }, demo: false }
  } catch (error: any) {
    await connection.rollback()
    if (error?.code === 'ER_DUP_ENTRY') throw createError({ statusCode: 409, statusMessage: 'SKU หรือ URL สินค้านี้ถูกใช้แล้ว' })
    throw error
  } finally {
    connection.release()
  }
})
