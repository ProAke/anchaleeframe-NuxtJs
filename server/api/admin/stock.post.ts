import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/db'
import { getDemoState } from '../../utils/demo'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody<any>(event)
  const productId = Number(body?.productId)
  const delta = Math.trunc(Number(body?.delta))
  const note = String(body?.note || '').trim().slice(0, 400)
  if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(delta) || delta === 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกสินค้าและระบุจำนวนที่ต้องการปรับสต็อก' })
  }
  if (!note) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหมายเหตุสำหรับรายการสต็อก' })
  const db = await getDatabase()
  if (!db) {
    const state = getDemoState()
    const product = state.products.find((item) => item.id === productId)
    if (!product) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้า' })
    if (product.stock + delta < 0) throw createError({ statusCode: 409, statusMessage: 'สต็อกคงเหลือไม่เพียงพอ' })
    product.stock += delta
    state.movements.unshift({ id: state.nextMovementId++, productId, sku: product.sku, productName: product.name, delta, kind: delta > 0 ? 'received' : 'adjustment', reference: `ADJ-${Date.now().toString().slice(-6)}`, note, createdBy: user.name, createdAt: new Date().toISOString() })
    return { product, demo: true }
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.query<any[]>('SELECT id, sku, name, stock FROM products WHERE id = ? FOR UPDATE', [productId])
    const product = rows[0]
    if (!product) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้า' })
    const newStock = Number(product.stock) + delta
    if (newStock < 0) throw createError({ statusCode: 409, statusMessage: 'สต็อกคงเหลือไม่เพียงพอ' })
    await connection.execute('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId])
    await connection.execute('INSERT INTO stock_movements (product_id, delta, kind, reference, note, created_by) VALUES (?, ?, ?, ?, ?, ?)', [productId, delta, delta > 0 ? 'received' : 'adjustment', `ADJ-${Date.now().toString().slice(-6)}`, note, user.name])
    await connection.commit()
    return { product: { id: productId, sku: product.sku, name: product.name, stock: newStock }, demo: false }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
