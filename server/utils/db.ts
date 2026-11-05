import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise'
import bcrypt from 'bcryptjs'

let pool: Pool | null = null
let schemaReady: Promise<void> | null = null

export function databaseConfigured() {
  return Boolean(useRuntimeConfig().databaseName)
}

export function demoDataAllowed() {
  return !databaseConfigured() && process.env.NODE_ENV !== 'production'
}

export async function getDatabase(): Promise<Pool | null> {
  const config = useRuntimeConfig()
  if (!config.databaseName) return null

  if (!pool) {
    pool = mysql.createPool({
      host: String(config.databaseHost),
      port: Number(config.databasePort || 3306),
      database: String(config.databaseName),
      user: String(config.databaseUser),
      password: String(config.databasePassword),
      waitForConnections: true,
      connectionLimit: 8,
      queueLimit: 0,
      charset: 'utf8mb4',
      decimalNumbers: true,
      timezone: 'Z',
    })
  }

  if (!schemaReady) {
    schemaReady = initializeSchema(pool).catch((error) => {
      schemaReady = null
      throw error
    })
  }
  await schemaReady
  return pool
}

async function initializeSchema(db: Pool) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS categories (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(80) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS products (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      sku VARCHAR(40) NOT NULL UNIQUE,
      slug VARCHAR(180) NOT NULL UNIQUE,
      name VARCHAR(180) NOT NULL,
      subtitle VARCHAR(240) NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      category_id INT UNSIGNED NULL,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      compare_at_price DECIMAL(12,2) NULL,
      stock INT NOT NULL DEFAULT 0,
      low_stock INT NOT NULL DEFAULT 5,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      image_key VARCHAR(40) NOT NULL DEFAULT 'oak',
      image_url VARCHAR(800) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_products_category (category_id),
      INDEX idx_products_status (status),
      CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS customers (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(190) NOT NULL DEFAULT '',
      phone VARCHAR(40) NOT NULL,
      address TEXT NOT NULL,
      orders_count INT UNSIGNED NOT NULL DEFAULT 0,
      total_spent DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_customers_phone (phone),
      INDEX idx_customers_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS orders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(32) NOT NULL UNIQUE,
      customer_id BIGINT UNSIGNED NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'pending',
      payment_status VARCHAR(24) NOT NULL DEFAULT 'unpaid',
      payment_method VARCHAR(24) NOT NULL DEFAULT 'cod',
      shipping_method VARCHAR(32) NOT NULL DEFAULT 'private_carrier',
      shipping_zone VARCHAR(32) NOT NULL DEFAULT 'other',
      subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
      shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      shipping_name VARCHAR(160) NOT NULL,
      shipping_phone VARCHAR(40) NOT NULL,
      shipping_address TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orders_status (status),
      INDEX idx_orders_created (created_at),
      INDEX idx_orders_customer (customer_id),
      CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT UNSIGNED NOT NULL,
      product_id BIGINT UNSIGNED NULL,
      sku VARCHAR(40) NOT NULL,
      product_name VARCHAR(180) NOT NULL,
      quantity INT UNSIGNED NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      line_total DECIMAL(12,2) NOT NULL,
      INDEX idx_order_items_order (order_id),
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS shipments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT UNSIGNED NOT NULL,
      carrier VARCHAR(80) NOT NULL,
      tracking_no VARCHAR(100) NOT NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'in_transit',
      shipped_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      delivered_at DATETIME NULL,
      note VARCHAR(400) NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_shipment_order (order_id),
      INDEX idx_shipment_tracking (tracking_no),
      CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS stock_movements (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      product_id BIGINT UNSIGNED NOT NULL,
      delta INT NOT NULL,
      kind VARCHAR(24) NOT NULL,
      reference VARCHAR(80) NOT NULL DEFAULT '',
      note VARCHAR(400) NOT NULL DEFAULT '',
      created_by VARCHAR(160) NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_stock_product_created (product_id, created_at),
      CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS store_settings (
      setting_key VARCHAR(80) NOT NULL PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS customer_accounts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      line_user_id VARCHAR(80) NOT NULL UNIQUE,
      display_name VARCHAR(160) NOT NULL DEFAULT '',
      email VARCHAR(190) NOT NULL DEFAULT '',
      picture_url VARCHAR(800) NOT NULL DEFAULT '',
      phone VARCHAR(40) NOT NULL DEFAULT '',
      address TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS customer_sessions (
      token_hash CHAR(64) NOT NULL PRIMARY KEY,
      customer_id BIGINT UNSIGNED NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_customer_sessions_expiry (expires_at),
      CONSTRAINT fk_customer_session_account FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      name VARCHAR(160) NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      role VARCHAR(24) NOT NULL DEFAULT 'admin',
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash CHAR(64) NOT NULL PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_sessions_expiry (expires_at),
      CONSTRAINT fk_admin_session_user FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ]

  for (const statement of statements) await db.query(statement)
  await db.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(800) NULL AFTER image_key')
  await db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(32) NOT NULL DEFAULT 'private_carrier' AFTER payment_method")
  await db.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zone VARCHAR(32) NOT NULL DEFAULT 'other' AFTER shipping_method")
  await db.query("UPDATE orders SET payment_method = 'bank_transfer' WHERE payment_method = 'transfer'")

  const categories = [
    ['ready-frames', 'กรอบสำเร็จรูป', 1],
    ['wooden-frames', 'กรอบไม้แท้', 2],
    ['floating-frames', 'กรอบลอย', 3],
    ['decorative-art', 'ภาพและของแต่งบ้าน', 4],
    ['accessories', 'อุปกรณ์เสริม', 5],
  ] as const
  for (const [slug, name, order] of categories) {
    await db.query('INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order)', [slug, name, order])
  }

  const [categoryRows] = await db.query<(RowDataPacket & { id: number; slug: string })[]>('SELECT id, slug FROM categories')
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]))
  const imageBase = 'https://www.anchaleeframe.com/upload/product/img/'
  const products = [
    ['AF18-158', 'กรอบสำเร็จรูป 5x7 นิ้ว', 'af18-158-frame-5x7', 'ราคาเหมา 1 โหล / 12 กรอบ เพียง 469 บาท', 'กรอบสำเร็จรูปขนาด 5x7 นิ้ว ราคาพิเศษ 39 บาทต่อกรอบ หรือเลือกซื้อยกโหล 12 กรอบในราคา 469 บาท', 'ready-frames', 39, 50, 120, 15, 'oak', `${imageBase}20250618095626-844671679.png`, 'active'],
    ['AF18-157', 'กรอบสำเร็จรูป 5x7 นิ้ว รุ่นคลาสสิก', 'af18-157-classic-5x7', 'ดีลพิเศษ ซื้อยกโหลคุ้มกว่า', 'กรอบรูปสำเร็จรูป 5x7 นิ้ว ใช้ได้ทั้งแนวตั้งและแนวนอน เหมาะสำหรับภาพถ่ายและของขวัญ', 'ready-frames', 39, 50, 65, 12, 'walnut', `${imageBase}20250618095235-540063187.png`, 'active'],
    ['AF06-05-14', 'กรอบรูป 5x7 นิ้ว พร้อมกระจก', 'af06-05-14-frame-glass-5x7', 'มีขาตั้งและหูแขวน ใช้งานได้สองแนว', 'กรอบรูปขนาด 5x7 นิ้ว พร้อมกระจก ขาตั้ง และหูแขวน ใส่ได้ทั้งแนวตั้งและแนวนอน', 'ready-frames', 42, 45, 6, 10, 'white', `${imageBase}20191119113337-2028741307.jpg`, 'active'],
    ['AF07-04', 'กรอบพร้อมเม้าท์บอร์ด ใส่ภาพ A4', 'af07-04-mountboard-a4', 'ขนาดกรอบ 18x24 นิ้ว สีขาว', 'กรอบสำเร็จรูปพร้อมเม้าท์บอร์ด ขนาดกรอบ 18x24 นิ้ว สำหรับใส่ภาพ A4 สีขาว', 'ready-frames', 555, 590, 18, 4, 'white', `${imageBase}20250505015503-81132115.jpg`, 'active'],
    ['AF06-02-45', 'กรอบ A4 สีทองวาว (1 โหล)', 'af06-02-45-gold-a4-dozen', 'กรอบ PVC หนา 1 นิ้ว พร้อมกระจกใส', 'กรอบสำเร็จรูปขนาด A4 สีทองวาว หนา 1 นิ้ว ขนาดบรรจุ 12 กรอบต่อชุด', 'ready-frames', 660, null, 12, 3, 'walnut', `${imageBase}20231026042833-1825560887.jpg`, 'active'],
    ['AF16-02-35', 'ภาพม้า 8 เซียน พร้อมกรอบ', 'af16-02-35-eight-horses', 'ภาพตกแต่งบ้าน ขนาด 16x20 นิ้ว', 'ภาพม้า 8 เซียน ขนาด 16x20 นิ้ว กรอบสีน้ำตาล ภาพโฟโต้เคลือบฟิล์มเย็น ไม่ใส่กระจก', 'decorative-art', 599, 790, 7, 3, 'kit', `${imageBase}20210111013645-727337253.png`, 'active'],
    ['AF22-01-02', 'กรอบแต่งบ้าน AF22-01-02', 'af22-01-02-home-frame', 'รายการโปรโมชั่น · สอบถามจำนวนคงเหลือ', 'กรอบแต่งบ้านจากรายการโปรโมชั่นอัญชลีกรอบรูป ราคาอ้างอิง 100 บาท กรุณาติดต่อร้านเพื่อยืนยันสต็อกและค่าจัดส่ง', 'ready-frames', 100, null, 30, 5, 'oak', `${imageBase}20200409121330-1140136874.jpg`, 'active'],
    ['AF19-144', 'กรอบสำเร็จรูป 6x8 นิ้ว', 'af19-144-frame-6x8', 'ขายปลีก 45 บาท · 1 โหล 540 บาท', 'กรอบสำเร็จรูปขนาด 6x8 นิ้ว ซื้อเป็นโหล 12 กรอบในราคา 540 บาท', 'ready-frames', 45, null, 30, 5, 'walnut', `${imageBase}20250618100041-92387619.png`, 'active'],
    ['AF07-05', 'กรอบสำเร็จรูปไม้แท้ 4x6 / 5x7 / 6x8', 'af07-05-solid-wood-frame', 'เลือกขนาดได้ · สอบถามราคาก่อนสั่งซื้อ', 'กรอบสำเร็จรูปไม้แท้ มีขนาด 4x6, 5x7 และ 6x8 นิ้ว กรุณาติดต่อร้านเพื่อยืนยันราคาและจำนวนคงเหลือ', 'wooden-frames', 0, null, 0, 0, 'oak', `${imageBase}20250618094101-1161531135.png`, 'draft'],
    ['AF14-01', 'กรอบลอยสไตล์โมเดิร์น', 'af14-01-modern-floating-frame', 'ผลิตตามแบบ · ติดต่อสอบถามขนาดและราคา', 'กรอบลอยดีไซน์โมเดิร์น เหมาะสำหรับงานตกแต่งบ้านและภาพขนาดพิเศษ ติดต่อร้านเพื่อประเมินราคาและระยะเวลาผลิต', 'floating-frames', 0, null, 0, 0, 'acrylic', `${imageBase}20250618030544-1456553882.jpg`, 'draft'],
  ] as const
  await db.query("UPDATE products SET status = 'archived' WHERE sku IN ('AF-101', 'AF-102', 'AF-103', 'AF-201', 'AF-202', 'AF-301')")
  for (const [sku, name, slug, subtitle, description, category, price, compareAt, stock, lowStock, imageKey, imageUrl, status] of products) {
    await db.query(
      `INSERT IGNORE INTO products
        (sku, name, slug, subtitle, description, category_id, price, compare_at_price, stock, low_stock, image_key, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, slug, subtitle, description, categoryIds.get(category) ?? null, price, compareAt, stock, lowStock, imageKey, imageUrl, status],
    )
  }

  const config = useRuntimeConfig()
  if (config.adminPassword && config.adminEmail) {
    const [admins] = await db.query<(RowDataPacket & { id: number })[]>('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [config.adminEmail])
    if (!admins.length) {
      const hash = await bcrypt.hash(String(config.adminPassword), 12)
      await db.query('INSERT INTO admin_users (email, name, password_hash, role) VALUES (?, ?, ?, ?)', [
        config.adminEmail,
        'ผู้ดูแลระบบ',
        hash,
        'admin',
      ])
    }
  }
}
