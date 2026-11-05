export interface DemoProduct {
  id: number
  sku: string
  slug: string
  name: string
  subtitle: string
  description: string
  categoryId: number
  category: string
  price: number
  compareAtPrice: number | null
  stock: number
  lowStock: number
  status: 'active' | 'draft' | 'archived'
  imageKey: string
  imageUrl: string
  createdAt: string
}

export interface DemoOrderItem {
  productId: number
  sku: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface DemoOrder {
  id: number
  orderNo: string
  customer: { id: number; name: string; email: string; phone: string }
  status: string
  paymentStatus: string
  paymentMethod: string
  shippingMethod?: string
  shippingZone?: string
  subtotal: number
  shippingFee: number
  total: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  note: string
  createdAt: string
  items: DemoOrderItem[]
  shipment?: DemoShipment | null
}

export interface DemoShipment {
  id: number
  orderId: number
  orderNo: string
  customerName: string
  customerPhone: string
  carrier: string
  trackingNo: string
  status: string
  shippedAt: string
  deliveredAt: string | null
  note: string
}

export interface DemoMovement {
  id: number
  productId: number
  sku: string
  productName: string
  delta: number
  kind: string
  reference: string
  note: string
  createdBy: string
  createdAt: string
}

export interface DemoState {
  categories: Array<{ id: number; slug: string; name: string; count?: number }>
  products: DemoProduct[]
  orders: DemoOrder[]
  shipments: DemoShipment[]
  movements: DemoMovement[]
  customers: Array<{ id: number; name: string; email: string; phone: string; address: string; ordersCount: number; totalSpent: number; createdAt: string }>
  nextOrderId: number
  nextShipmentId: number
  nextProductId: number
  nextMovementId: number
}

const globalState = globalThis as typeof globalThis & { __anchaleeFrameDemo?: DemoState }
const isoDaysAgo = (days: number, hour = 11) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 20, 0, 0)
  return date.toISOString()
}

function makeSeed(): DemoState {
  const categories = [
    { id: 1, slug: 'ready-frames', name: 'กรอบสำเร็จรูป' },
    { id: 2, slug: 'wooden-frames', name: 'กรอบไม้แท้' },
    { id: 3, slug: 'floating-frames', name: 'กรอบลอย' },
    { id: 4, slug: 'decorative-art', name: 'ภาพและของแต่งบ้าน' },
    { id: 5, slug: 'accessories', name: 'อุปกรณ์เสริม' },
  ]
  const imageBase = 'https://www.anchaleeframe.com/upload/product/img/'
  const productSeeds = [
    ['AF18-158', 'กรอบสำเร็จรูป 5x7 นิ้ว', 'af18-158-frame-5x7', 'ราคาเหมา 1 โหล / 12 กรอบ เพียง 469 บาท', 'กรอบสำเร็จรูปขนาด 5x7 นิ้ว สินค้าขายดี ราคาพิเศษ 39 บาทต่อกรอบ หรือเลือกซื้อยกโหล 12 กรอบในราคา 469 บาท', 1, 'กรอบสำเร็จรูป', 39, 50, 120, 15, 'oak', `${imageBase}20250618095626-844671679.png`, 'active'],
    ['AF18-157', 'กรอบสำเร็จรูป 5x7 นิ้ว รุ่นคลาสสิก', 'af18-157-classic-5x7', 'ดีลพิเศษ ซื้อยกโหลคุ้มกว่า', 'กรอบรูปสำเร็จรูป 5x7 นิ้ว ใช้ได้ทั้งแนวตั้งและแนวนอน เหมาะสำหรับภาพถ่ายและของขวัญ', 1, 'กรอบสำเร็จรูป', 39, 50, 65, 12, 'walnut', `${imageBase}20250618095235-540063187.png`, 'active'],
    ['AF06-05-14', 'กรอบรูป 5x7 นิ้ว พร้อมกระจก', 'af06-05-14-frame-glass-5x7', 'มีขาตั้งและหูแขวน ใช้งานได้สองแนว', 'กรอบรูป 5x7 นิ้ว พร้อมกระจก ขาตั้ง และหูแขวน ใส่ได้ทั้งแนวตั้งและแนวนอน', 1, 'กรอบสำเร็จรูป', 42, 45, 6, 10, 'white', `${imageBase}20191119113337-2028741307.jpg`, 'active'],
    ['AF07-04', 'กรอบพร้อมเม้าท์บอร์ด ใส่ภาพ A4', 'af07-04-mountboard-a4', 'ขนาดกรอบ 18x24 นิ้ว สีขาว', 'กรอบสำเร็จรูปพร้อมเม้าท์บอร์ด ขนาดกรอบ 18x24 นิ้ว สำหรับใส่ภาพ A4 สีขาว', 1, 'กรอบสำเร็จรูป', 555, 590, 18, 4, 'white', `${imageBase}20250505015503-81132115.jpg`, 'active'],
    ['AF06-02-45', 'กรอบ A4 สีทองวาว (1 โหล)', 'af06-02-45-gold-a4-dozen', 'กรอบ PVC หนา 1 นิ้ว พร้อมกระจกใส', 'กรอบสำเร็จรูปขนาด A4 สีทองวาว หนา 1 นิ้ว ขนาดบรรจุ 12 กรอบต่อชุด', 1, 'กรอบสำเร็จรูป', 660, null, 12, 3, 'walnut', `${imageBase}20231026042833-1825560887.jpg`, 'active'],
    ['AF16-02-35', 'ภาพม้า 8 เซียน พร้อมกรอบ', 'af16-02-35-eight-horses', 'ภาพตกแต่งบ้าน ขนาด 16x20 นิ้ว', 'ภาพม้า 8 เซียน ขนาด 16x20 นิ้ว กรอบสีน้ำตาล ภาพโฟโต้เคลือบฟิล์มเย็น ไม่ใส่กระจก', 4, 'ภาพและของแต่งบ้าน', 599, 790, 7, 3, 'kit', `${imageBase}20210111013645-727337253.png`, 'active'],
    ['AF22-01-02', 'กรอบแต่งบ้าน AF22-01-02', 'af22-01-02-home-frame', 'รายการโปรโมชั่น · สอบถามจำนวนคงเหลือ', 'กรอบแต่งบ้านจากรายการโปรโมชั่นอัญชลีกรอบรูป ราคาอ้างอิง 100 บาท กรุณาติดต่อร้านเพื่อยืนยันสต็อกและค่าจัดส่ง', 1, 'กรอบสำเร็จรูป', 100, null, 30, 5, 'oak', `${imageBase}20200409121330-1140136874.jpg`, 'active'],
    ['AF19-144', 'กรอบสำเร็จรูป 6x8 นิ้ว', 'af19-144-frame-6x8', 'ขายปลีก 45 บาท · 1 โหล 540 บาท', 'กรอบสำเร็จรูปขนาด 6x8 นิ้ว ซื้อเป็นโหล 12 กรอบในราคา 540 บาท', 1, 'กรอบสำเร็จรูป', 45, null, 30, 5, 'walnut', `${imageBase}20250618100041-92387619.png`, 'active'],
    ['AF07-05', 'กรอบสำเร็จรูปไม้แท้ 4x6 / 5x7 / 6x8', 'af07-05-solid-wood-frame', 'เลือกขนาดได้ · สอบถามราคาก่อนสั่งซื้อ', 'กรอบสำเร็จรูปไม้แท้ มีขนาด 4x6, 5x7 และ 6x8 นิ้ว กรุณาติดต่อร้านเพื่อยืนยันราคาและจำนวนคงเหลือ', 2, 'กรอบไม้แท้', 0, null, 0, 0, 'oak', `${imageBase}20250618094101-1161531135.png`, 'draft'],
    ['AF14-01', 'กรอบลอยสไตล์โมเดิร์น', 'af14-01-modern-floating-frame', 'ผลิตตามแบบ · ติดต่อสอบถามขนาดและราคา', 'กรอบลอยดีไซน์โมเดิร์น เหมาะสำหรับงานตกแต่งบ้านและภาพขนาดพิเศษ ติดต่อร้านเพื่อประเมินราคาและระยะเวลาผลิต', 3, 'กรอบลอย', 0, null, 0, 0, 'acrylic', `${imageBase}20250618030544-1456553882.jpg`, 'draft'],
  ] as const
  const products: DemoProduct[] = productSeeds.map((seed, index) => ({
    id: index + 1,
    sku: seed[0], name: seed[1], slug: seed[2], subtitle: seed[3], description: seed[4],
    categoryId: seed[5], category: seed[6], price: seed[7], compareAtPrice: seed[8],
    stock: seed[9], lowStock: seed[10], imageKey: seed[11], imageUrl: seed[12],
    status: seed[13], createdAt: isoDaysAgo(45 + index),
  }))
  const customerSeeds = [
    { id: 1, name: 'คุณแพรวา น.', email: 'praewa@email.com', phone: '0812345678', address: '89/12 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110' },
    { id: 2, name: 'คุณธนกร ว.', email: 'thanakorn@email.com', phone: '0898765432', address: '45/6 ถนนนิมมานเหมินท์ อำเภอเมือง เชียงใหม่ 50200' },
    { id: 3, name: 'คุณอรทัย พ.', email: 'orathai@email.com', phone: '0864567890', address: '18/3 ถนนศรีนครินทร์ เขตสวนหลวง กรุงเทพฯ 10250' },
    { id: 4, name: 'คุณวรินทร์ จ.', email: 'warin@email.com', phone: '0921122334', address: '210/4 ถนนมิตรภาพ อำเภอเมือง ขอนแก่น 40000' },
  ]
  const orders: DemoOrder[] = [
    { id: 1, orderNo: 'AF-261104-001', customer: customerSeeds[0]!, status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'cod', subtotal: 468, shippingFee: 80, total: 548, shippingName: customerSeeds[0]!.name, shippingPhone: customerSeeds[0]!.phone, shippingAddress: customerSeeds[0]!.address, note: 'รบกวนห่อกันกระแทกเป็นพิเศษ', createdAt: isoDaysAgo(0, 9), items: [{ productId: 1, sku: 'AF18-158', productName: 'กรอบสำเร็จรูป 5x7 นิ้ว', quantity: 12, unitPrice: 39, lineTotal: 468 }], shipment: null },
    { id: 2, orderNo: 'AF-261103-002', customer: customerSeeds[1]!, status: 'processing', paymentStatus: 'paid', paymentMethod: 'transfer', subtotal: 84, shippingFee: 80, total: 164, shippingName: customerSeeds[1]!.name, shippingPhone: customerSeeds[1]!.phone, shippingAddress: customerSeeds[1]!.address, note: '', createdAt: isoDaysAgo(1, 15), items: [{ productId: 3, sku: 'AF06-05-14', productName: 'กรอบรูป 5x7 นิ้ว พร้อมกระจก', quantity: 2, unitPrice: 42, lineTotal: 84 }], shipment: null },
    { id: 3, orderNo: 'AF-261102-003', customer: customerSeeds[2]!, status: 'shipped', paymentStatus: 'paid', paymentMethod: 'transfer', subtotal: 555, shippingFee: 80, total: 635, shippingName: customerSeeds[2]!.name, shippingPhone: customerSeeds[2]!.phone, shippingAddress: customerSeeds[2]!.address, note: '', createdAt: isoDaysAgo(2, 13), items: [{ productId: 4, sku: 'AF07-04', productName: 'กรอบพร้อมเม้าท์บอร์ด ใส่ภาพ A4', quantity: 1, unitPrice: 555, lineTotal: 555 }], shipment: null },
    { id: 4, orderNo: 'AF-261101-004', customer: customerSeeds[3]!, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'cod', subtotal: 660, shippingFee: 80, total: 740, shippingName: customerSeeds[3]!.name, shippingPhone: customerSeeds[3]!.phone, shippingAddress: customerSeeds[3]!.address, note: '', createdAt: isoDaysAgo(3, 10), items: [{ productId: 5, sku: 'AF06-02-45', productName: 'กรอบ A4 สีทองวาว (1 โหล)', quantity: 1, unitPrice: 660, lineTotal: 660 }], shipment: null },
    { id: 5, orderNo: 'AF-261031-005', customer: customerSeeds[0]!, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'transfer', subtotal: 599, shippingFee: 80, total: 679, shippingName: customerSeeds[0]!.name, shippingPhone: customerSeeds[0]!.phone, shippingAddress: customerSeeds[0]!.address, note: '', createdAt: isoDaysAgo(4, 17), items: [{ productId: 6, sku: 'AF16-02-35', productName: 'ภาพม้า 8 เซียน พร้อมกรอบ', quantity: 1, unitPrice: 599, lineTotal: 599 }], shipment: null },
  ]
  const shipments: DemoShipment[] = [
    { id: 1, orderId: 3, orderNo: orders[2]!.orderNo, customerName: customerSeeds[2]!.name, customerPhone: customerSeeds[2]!.phone, carrier: 'Kerry Express', trackingNo: 'KEX412890345TH', status: 'in_transit', shippedAt: isoDaysAgo(1, 16), deliveredAt: null, note: '' },
    { id: 2, orderId: 4, orderNo: orders[3]!.orderNo, customerName: customerSeeds[3]!.name, customerPhone: customerSeeds[3]!.phone, carrier: 'ไปรษณีย์ไทย', trackingNo: 'TH1234567890', status: 'delivered', shippedAt: isoDaysAgo(2, 10), deliveredAt: isoDaysAgo(1, 14), note: '' },
    { id: 3, orderId: 5, orderNo: orders[4]!.orderNo, customerName: customerSeeds[0]!.name, customerPhone: customerSeeds[0]!.phone, carrier: 'Flash Express', trackingNo: 'THF9988776655', status: 'delivered', shippedAt: isoDaysAgo(3, 9), deliveredAt: isoDaysAgo(2, 13), note: '' },
  ]
  orders.forEach((order) => { order.shipment = shipments.find((shipment) => shipment.orderId === order.id) ?? null })
  return {
    categories,
    products,
    orders,
    shipments,
    movements: [
      { id: 1, productId: 1, sku: 'AF18-158', productName: products[0]!.name, delta: 24, kind: 'received', reference: 'PO-2026-108', note: 'รับสินค้าเข้าคลัง', createdBy: 'ผู้ดูแลระบบ', createdAt: isoDaysAgo(2, 9) },
      { id: 2, productId: 4, sku: 'AF07-04', productName: products[3]!.name, delta: -1, kind: 'order', reference: 'AF-261102-003', note: 'ตัดสต็อกตามคำสั่งซื้อ', createdBy: 'ระบบ', createdAt: isoDaysAgo(2, 13) },
      { id: 3, productId: 3, sku: 'AF06-05-14', productName: products[2]!.name, delta: 4, kind: 'adjustment', reference: 'ADJ-004', note: 'ตรวจนับสต็อกประจำสัปดาห์', createdBy: 'ผู้ดูแลระบบ', createdAt: isoDaysAgo(4, 11) },
    ],
    customers: customerSeeds.map((customer) => {
      const customerOrders = orders.filter((order) => order.customer.phone === customer.phone)
      return { ...customer, ordersCount: customerOrders.length, totalSpent: customerOrders.reduce((total, order) => total + (order.paymentStatus === 'paid' ? order.total : 0), 0), createdAt: isoDaysAgo(50) }
    }),
    nextOrderId: 6,
    nextShipmentId: 4,
    nextProductId: 11,
    nextMovementId: 4,
  }
}

export function getDemoState(): DemoState {
  if (!globalState.__anchaleeFrameDemo) globalState.__anchaleeFrameDemo = makeSeed()
  return globalState.__anchaleeFrameDemo
}

export function resetDemoState() {
  globalState.__anchaleeFrameDemo = makeSeed()
  return globalState.__anchaleeFrameDemo
}
