import { randomBytes } from 'node:crypto'
import QRCode from 'qrcode'
import generatePromptPayPayload from 'promptpay-qr'
import { setResponseHeader } from 'h3'
import { demoDataAllowed, getDatabase } from '../utils/db'
import { getDemoState } from '../utils/demo'
import { getCustomerSession } from '../utils/customer-auth'
import { enforceRateLimit } from '../utils/rate-limit'
import { getStoreSettings } from '../utils/settings'

function makeOrderNo() {
  const date = new Date()
  const datePart = `${String(date.getUTCFullYear()).slice(-2)}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`
  return `AF-${datePart}-${randomBytes(8).toString('hex').toUpperCase()}`
}

function calculateShippingFee(settings: Awaited<ReturnType<typeof getStoreSettings>>, method: string, zone: string, subtotal: number) {
  if (method === 'company_truck') {
    if (!settings.companyTruckEnabled) throw createError({ statusCode: 400, statusMessage: 'ขณะนี้ยังไม่เปิดบริการรถขนส่งของร้าน' })
    if (!['bangkok_metro', 'other'].includes(zone)) throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกพื้นที่จัดส่ง' })
    if (zone === 'bangkok_metro' && settings.companyTruckFreeThreshold > 0 && subtotal >= settings.companyTruckFreeThreshold) return 0
    return Math.round(settings.companyTruckFee * 100) / 100
  }
  if (method === 'private_carrier') {
    if (!settings.privateCarrierEnabled) throw createError({ statusCode: 400, statusMessage: 'ขณะนี้ยังไม่เปิดบริการบริษัทขนส่งเอกชน' })
    return Math.round(settings.privateCarrierFee * 100) / 100
  }
  throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกวิธีจัดส่งที่ถูกต้อง' })
}

async function buildPaymentDetails(paymentMethod: string, total: number, settings: Awaited<ReturnType<typeof getStoreSettings>>) {
  if (paymentMethod === 'cod') return { type: 'cod' as const, amount: total }
  if (paymentMethod === 'promptpay_qr') {
    if (!settings.promptPayEnabled || !settings.promptPayId) throw createError({ statusCode: 400, statusMessage: 'PromptPay ยังไม่ได้เปิดให้บริการ กรุณาเลือกวิธีชำระเงินอื่น' })
    const payload = generatePromptPayPayload(settings.promptPayId, { amount: total })
    const qrDataUrl = await QRCode.toDataURL(payload, { width: 256, margin: 2, errorCorrectionLevel: 'M' })
    return { type: 'promptpay_qr' as const, amount: total, promptPayId: settings.promptPayId, qrDataUrl }
  }
  if (paymentMethod === 'bank_transfer') {
    if (!settings.bankTransferEnabled || !settings.bankName || !settings.bankAccountName || !settings.bankAccountNumber) {
      throw createError({ statusCode: 400, statusMessage: 'ยังไม่ได้ตั้งค่าบัญชีรับโอน กรุณาเลือกวิธีชำระเงินอื่น' })
    }
    return {
      type: 'bank_transfer' as const,
      amount: total,
      bankName: settings.bankName,
      accountName: settings.bankAccountName,
      accountNumber: settings.bankAccountNumber,
    }
  }
  if (paymentMethod === 'other') {
    if (!settings.otherPaymentEnabled || !settings.otherPaymentName || !settings.otherPaymentInstructions) {
      throw createError({ statusCode: 400, statusMessage: 'ช่องทางชำระเงินอื่นยังไม่ได้ตั้งค่า กรุณาเลือกวิธีชำระเงินอื่น' })
    }
    return {
      type: 'other' as const,
      amount: total,
      name: settings.otherPaymentName,
      instructions: settings.otherPaymentInstructions,
      url: settings.otherPaymentUrl,
    }
  }
  throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกวิธีชำระเงินที่ถูกต้อง' })
}

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'checkout', 8, 10 * 60 * 1000)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const body = await readBody<any>(event)
  const customer = body?.customer || {}
  const name = String(customer.name || '').trim().slice(0, 160)
  const email = String(customer.email || '').trim().slice(0, 190)
  const phone = String(customer.phone || '').replace(/[\s()-]/g, '').slice(0, 40)
  const address = String(customer.address || '').trim().slice(0, 2000)
  const note = String(body?.note || '').trim().slice(0, 1000)
  const paymentMethod = String(body?.paymentMethod || '')
  const shippingMethod = String(body?.shippingMethod || '')
  const shippingZone = shippingMethod === 'company_truck' ? String(body?.shippingZone || '') : 'other'
  const rawItems = Array.isArray(body?.items) ? body.items : []
  if (!name || !address || phone.length < 8 || !/^\+?\d{8,15}$/.test(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกชื่อ ที่อยู่ และเบอร์โทรศัพท์ให้ถูกต้อง' })
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'รูปแบบอีเมลไม่ถูกต้อง' })
  if (!rawItems.length || rawItems.length > 30) throw createError({ statusCode: 400, statusMessage: 'ไม่มีสินค้าในตะกร้า' })
  const items = new Map<number, number>()
  for (const item of rawItems) {
    const id = Number(item?.productId)
    const quantity = Math.floor(Number(item?.quantity))
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
      throw createError({ statusCode: 400, statusMessage: 'จำนวนสินค้าไม่ถูกต้อง' })
    }
    items.set(id, (items.get(id) || 0) + quantity)
  }
  if ([...items.values()].some((quantity) => quantity > 20)) throw createError({ statusCode: 400, statusMessage: 'สั่งซื้อสินค้าแต่ละรายการได้ไม่เกิน 20 ชิ้น' })

  const db = await getDatabase()
  if (!db && !demoDataAllowed()) throw createError({ statusCode: 503, statusMessage: 'ระบบสั่งซื้อยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง' })
  const settings = await getStoreSettings(db)
  const customerAccount = db ? await getCustomerSession(event) : null

  if (!db) {
    const state = getDemoState()
    const lines = [...items].map(([productId, quantity]) => {
      const product = state.products.find((entry) => entry.id === productId && entry.status === 'active')
      if (!product) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้าบางรายการในตะกร้า' })
      if (product.stock < quantity) throw createError({ statusCode: 409, statusMessage: `สินค้า ${product.name} คงเหลือไม่พอ` })
      return { product, quantity }
    })
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
    const shippingFee = calculateShippingFee(settings, shippingMethod, shippingZone, subtotal)
    const total = subtotal + shippingFee
    const paymentDetails = await buildPaymentDetails(paymentMethod, total, settings)
    let savedCustomer = state.customers.find((item) => item.phone === phone)
    if (!savedCustomer) {
      savedCustomer = { id: Math.max(0, ...state.customers.map((item) => item.id)) + 1, name, email, phone, address, ordersCount: 0, totalSpent: 0, createdAt: new Date().toISOString() }
      state.customers.unshift(savedCustomer)
    } else {
      savedCustomer.name = name
      savedCustomer.email = email
      savedCustomer.address = address
    }
    const orderNo = makeOrderNo()
    const order = {
      id: state.nextOrderId++, orderNo,
      customer: { id: savedCustomer.id, name, email, phone },
      status: 'pending', paymentStatus: 'unpaid', paymentMethod, shippingMethod, shippingZone,
      subtotal, shippingFee, total,
      shippingName: name, shippingPhone: phone, shippingAddress: address, note,
      createdAt: new Date().toISOString(),
      items: lines.map(({ product, quantity }) => ({ productId: product.id, sku: product.sku, productName: product.name, quantity, unitPrice: product.price, lineTotal: product.price * quantity })),
      shipment: null,
    }
    for (const line of lines) {
      line.product.stock -= line.quantity
      state.movements.unshift({ id: state.nextMovementId++, productId: line.product.id, sku: line.product.sku, productName: line.product.name, delta: -line.quantity, kind: 'order', reference: orderNo, note: 'ตัดสต็อกจากคำสั่งซื้อ', createdBy: 'ระบบ', createdAt: new Date().toISOString() })
    }
    state.orders.unshift(order)
    savedCustomer.ordersCount += 1
    return { orderNo, subtotal, total, shippingFee, paymentMethod, shippingMethod, paymentDetails, demo: true }
  }

  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const productIds = [...items.keys()]
    const placeholders = productIds.map(() => '?').join(',')
    const [productRows] = await connection.query<any[]>(
      `SELECT id, sku, name, price, stock FROM products WHERE id IN (${placeholders}) AND status = 'active' FOR UPDATE`, productIds,
    )
    if (productRows.length !== productIds.length) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้าบางรายการในตะกร้า' })
    const productMap = new Map(productRows.map((product) => [Number(product.id), product]))
    const lines = productIds.map((productId) => {
      const product = productMap.get(productId)!
      const quantity = items.get(productId)!
      if (Number(product.stock) < quantity) throw createError({ statusCode: 409, statusMessage: `สินค้า ${product.name} คงเหลือไม่พอ` })
      return { product, quantity, unitPrice: Number(product.price) }
    })
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
    const shippingFee = calculateShippingFee(settings, shippingMethod, shippingZone, subtotal)
    const total = subtotal + shippingFee
    const paymentDetails = await buildPaymentDetails(paymentMethod, total, settings)
    await connection.execute(
      `INSERT INTO customers (name, email, phone, address, orders_count) VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), address = VALUES(address), orders_count = orders_count + 1`,
      [name, email, phone, address],
    )
    const [customerRows] = await connection.query<any[]>('SELECT id FROM customers WHERE phone = ? LIMIT 1', [phone])
    const customerId = Number(customerRows[0].id)
    const orderNo = makeOrderNo()
    const [orderResult] = await connection.execute<any>(
      `INSERT INTO orders (order_no, customer_id, status, payment_status, payment_method, shipping_method, shipping_zone, subtotal, shipping_fee, total, shipping_name, shipping_phone, shipping_address, note)
       VALUES (?, ?, 'pending', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNo, customerId, paymentMethod, shippingMethod, shippingZone, subtotal, shippingFee, total, name, phone, address, note],
    )
    const orderId = Number(orderResult.insertId)
    for (const line of lines) {
      const lineTotal = line.unitPrice * line.quantity
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, sku, product_name, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, line.product.id, line.product.sku, line.product.name, line.quantity, line.unitPrice, lineTotal],
      )
      await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [line.quantity, line.product.id])
      await connection.execute('INSERT INTO stock_movements (product_id, delta, kind, reference, note) VALUES (?, ?, ?, ?, ?)', [line.product.id, -line.quantity, 'order', orderNo, 'ตัดสต็อกจากคำสั่งซื้อ'])
    }
    await connection.commit()
    if (customerAccount) {
      try {
        await db.execute('UPDATE customer_accounts SET phone = ?, address = ? WHERE id = ?', [phone, address, customerAccount.id])
      } catch (error) {
        console.error('Could not refresh customer delivery profile after order:', error)
      }
    }
    return { orderNo, subtotal, total, shippingFee, paymentMethod, shippingMethod, paymentDetails, demo: false }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
