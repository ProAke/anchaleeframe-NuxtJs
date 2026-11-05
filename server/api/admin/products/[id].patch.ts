import { requireAdmin } from '../../../utils/auth'
import { getDatabase } from '../../../utils/db'
import { getDemoState } from '../../../utils/demo'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isSafeInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'รหัสสินค้าไม่ถูกต้อง' })
  const body = await readBody<any>(event)
  if (body.imageUrl && !/^https:\/\//i.test(String(body.imageUrl))) throw createError({ statusCode: 400, statusMessage: 'ลิงก์รูปภาพต้องขึ้นต้นด้วย https://' })
  const allowed = ['sku', 'slug', 'name', 'subtitle', 'description', 'price', 'compareAtPrice', 'lowStock', 'status', 'imageKey', 'imageUrl', 'categoryId'] as const
  const demo = await getDatabase()
  if (!demo) {
    const state = getDemoState()
    const product = state.products.find((item) => item.id === id)
    if (!product) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้า' })
    for (const key of allowed) {
      if (body[key] === undefined) continue
      if (key === 'price') product.price = Math.max(0, Number(body[key]) || 0)
      else if (key === 'compareAtPrice') product.compareAtPrice = Number(body[key]) || null
      else if (key === 'lowStock') product.lowStock = Math.max(0, Math.floor(Number(body[key]) || 0))
      else if (key === 'categoryId') {
        const category = state.categories.find((item) => item.id === Number(body[key]))
        if (category) { product.categoryId = category.id; product.category = category.name }
      } else if (key === 'status' && ['active', 'draft', 'archived'].includes(body[key])) product.status = body[key]
      else if (key === 'imageUrl') product.imageUrl = String(body[key]).trim().slice(0, 800)
      else if (key !== 'status') (product as any)[key] = String(body[key]).trim().slice(0, key === 'description' ? 2000 : 240)
    }
    return { product, demo: true }
  }
  const fields: Record<string, { column: string; value: (value: unknown) => unknown }> = {
    sku: { column: 'sku', value: (value) => String(value).trim().toUpperCase().slice(0, 40) },
    slug: { column: 'slug', value: (value) => String(value).trim().slice(0, 180) },
    name: { column: 'name', value: (value) => String(value).trim().slice(0, 180) },
    subtitle: { column: 'subtitle', value: (value) => String(value).trim().slice(0, 240) },
    description: { column: 'description', value: (value) => String(value).trim().slice(0, 2000) },
    price: { column: 'price', value: (value) => Math.max(0, Number(value) || 0) },
    compareAtPrice: { column: 'compare_at_price', value: (value) => Number(value) > 0 ? Number(value) : null },
    lowStock: { column: 'low_stock', value: (value) => Math.max(0, Math.floor(Number(value) || 0)) },
    status: { column: 'status', value: (value) => ['active', 'draft', 'archived'].includes(String(value)) ? String(value) : 'active' },
    imageKey: { column: 'image_key', value: (value) => String(value).trim().slice(0, 40) },
    imageUrl: { column: 'image_url', value: (value) => String(value).trim().slice(0, 800) },
    categoryId: { column: 'category_id', value: (value) => Math.max(1, Math.floor(Number(value) || 1)) },
  }
  const updates: string[] = []
  const values: unknown[] = []
  for (const key of allowed) {
    if (body[key] === undefined) continue
    updates.push(`${fields[key].column} = ?`)
    values.push(fields[key].value(body[key]))
  }
  if (!updates.length) throw createError({ statusCode: 400, statusMessage: 'ไม่มีข้อมูลสำหรับบันทึก' })
  const db = await getDatabase()
  if (!db) return { demo: true }
  const [result] = await db.execute<any>(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, [...values, id] as any[])
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้า' })
  const [rows] = await db.query<any[]>(
    `SELECT p.id, p.sku, p.slug, p.name, p.subtitle, p.description, p.category_id AS categoryId, c.name AS category,
            p.price, p.compare_at_price AS compareAtPrice, p.stock, p.low_stock AS lowStock, p.status, p.image_key AS imageKey, p.image_url AS imageUrl
       FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`, [id],
  )
  return { product: { ...rows[0], id: Number(rows[0].id), categoryId: Number(rows[0].categoryId), price: Number(rows[0].price), compareAtPrice: rows[0].compareAtPrice == null ? null : Number(rows[0].compareAtPrice), stock: Number(rows[0].stock), lowStock: Number(rows[0].lowStock) }, demo: false }
})
