<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { data, pending, error, refresh } = await useFetch<any>('/api/admin/products', { server: false, retry: false })
const toast = useToast()
const modalOpen = ref(false)
const saving = ref(false)
const search = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const editingId = ref<number | null>(null)
const formError = ref('')
const form = reactive({ sku: '', name: '', subtitle: '', description: '', categoryId: 1, price: 0, compareAtPrice: null as number | null, stock: 0, lowStock: 5, status: 'active', imageKey: 'oak', imageUrl: '' })
const products = computed(() => {
  let rows = [...(data.value?.products || [])]
  if (categoryFilter.value !== 'all') rows = rows.filter((item: any) => String(item.categoryId) === categoryFilter.value)
  if (statusFilter.value !== 'all') rows = rows.filter((item: any) => item.status === statusFilter.value)
  const keyword = search.value.trim().toLowerCase()
  if (keyword) rows = rows.filter((item: any) => `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(keyword))
  return rows
})
const activeCount = computed(() => (data.value?.products || []).filter((product: any) => product.status === 'active').length)
const lowCount = computed(() => (data.value?.products || []).filter((product: any) => product.status === 'active' && product.stock <= product.lowStock).length)

function resetForm() { Object.assign(form, { sku: '', name: '', subtitle: '', description: '', categoryId: data.value?.categories?.[0]?.id || 1, price: 0, compareAtPrice: null, stock: 0, lowStock: 5, status: 'active', imageKey: 'oak', imageUrl: '' }) }
function openCreate() { editingId.value = null; formError.value = ''; resetForm(); modalOpen.value = true }
function openEdit(product: any) { editingId.value = product.id; formError.value = ''; Object.assign(form, { sku: product.sku, name: product.name, subtitle: product.subtitle || '', description: product.description || '', categoryId: Number(product.categoryId || 1), price: Number(product.price), compareAtPrice: product.compareAtPrice || null, stock: Number(product.stock), lowStock: Number(product.lowStock || 5), status: product.status, imageKey: product.imageKey || 'oak', imageUrl: product.imageUrl || '' }); modalOpen.value = true }
async function saveProduct() {
  saving.value = true
  formError.value = ''
  try {
    const method = editingId.value ? 'PATCH' : 'POST'
    const url = editingId.value ? `/api/admin/products/${editingId.value}` : '/api/admin/products'
    await $fetch(url, { method, body: { ...form } })
    modalOpen.value = false
    await refresh()
    toast.show(editingId.value ? 'บันทึกการแก้ไขสินค้าแล้ว' : 'เพิ่มสินค้าใหม่แล้ว')
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || 'บันทึกข้อมูลไม่สำเร็จ'
  } finally { saving.value = false }
}
async function toggleArchive(product: any) {
  const next = product.status === 'archived' ? 'active' : 'archived'
  if (next === 'archived' && !confirm(`ซ่อนสินค้า “${product.name}” จากหน้าร้านหรือไม่?`)) return
  try {
    await $fetch(`/api/admin/products/${product.id}`, { method: 'PATCH', body: { status: next } })
    await refresh()
    toast.show(next === 'archived' ? 'ซ่อนสินค้าจากหน้าร้านแล้ว' : 'เผยแพร่สินค้าบนหน้าร้านแล้ว')
  } catch { toast.show('เปลี่ยนสถานะสินค้าไม่สำเร็จ', 'error') }
}
</script>

<template>
  <div class="admin-page-wrap"><div class="admin-page-heading"><div><span class="section-kicker">YOUR PRODUCT LIBRARY</span><h1>จัดการสินค้า <span class="heading-count">{{ data?.products?.length || 0 }}</span></h1><p>เพิ่มรายละเอียด ปรับราคา และควบคุมการแสดงสินค้าหน้าร้าน</p></div><button class="button button-primary" @click="openCreate"><AppIcon name="plus" :size="17"/> เพิ่มสินค้า</button></div>
    <section class="stat-grid compact-stat-grid"><article class="mini-stat-card"><span class="mini-stat-icon mini-purple"><AppIcon name="package" :size="17"/></span><span><small>สินค้าทั้งหมด</small><strong>{{ data?.products?.length || 0 }} <i>รายการ</i></strong></span><span class="mini-stat-end"><AppIcon name="arrow-up-right" :size="15"/></span></article><article class="mini-stat-card"><span class="mini-stat-icon mini-green"><AppIcon name="store" :size="17"/></span><span><small>แสดงบนหน้าร้าน</small><strong>{{ activeCount }} <i>รายการ</i></strong></span><span class="mini-stat-end"><AppIcon name="badge-check" :size="15"/></span></article><article class="mini-stat-card"><span class="mini-stat-icon mini-peach"><AppIcon name="alert" :size="17"/></span><span><small>สต็อกถึงจุดแจ้งเตือน</small><strong>{{ lowCount }} <i>รายการ</i></strong></span><NuxtLink class="mini-stat-end mini-stat-link" to="/admin/stock"><AppIcon name="arrow-up-right" :size="15"/></NuxtLink></article></section>
    <section class="admin-panel products-panel"><div class="product-tools"><label class="admin-search"><AppIcon name="search" :size="17"/><input v-model="search" placeholder="ค้นหาชื่อสินค้า หรือ SKU..." type="search"/></label><div class="product-tool-filters"><label class="admin-select-wrap"><AppIcon name="filter" :size="15"/><select v-model="categoryFilter"><option value="all">ทุกหมวดหมู่</option><option v-for="category in data?.categories || []" :key="category.id" :value="String(category.id)">{{ category.name }}</option></select><AppIcon name="chevron-down" :size="14"/></label><label class="admin-select-wrap"><select v-model="statusFilter"><option value="all">ทุกสถานะ</option><option value="active">แสดงบนร้าน</option><option value="draft">ฉบับร่าง</option><option value="archived">ซ่อนแล้ว</option></select><AppIcon name="chevron-down" :size="14"/></label></div></div><div v-if="pending" class="admin-loading-card"><span class="loading-spinner"/> กำลังโหลดสินค้า...</div><div v-else-if="error" class="admin-error-card"><AppIcon name="alert" :size="20"/> โหลดข้อมูลสินค้าไม่สำเร็จ <button class="button button-outline" @click="refresh()">ลองอีกครั้ง</button></div><div v-else-if="products.length" class="table-scroll"><table class="admin-table products-table"><thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคาขาย</th><th>คงเหลือ</th><th>สถานะ</th><th><span class="sr-only">จัดการ</span></th></tr></thead><tbody><tr v-for="product in products" :key="product.id"><td><div class="product-table-cell"><div class="table-product-art"><ProductArtwork :image-key="product.imageKey" :image-url="product.imageUrl" compact/></div><div><strong>{{ product.name }}</strong><small>{{ product.sku }} · {{ product.subtitle }}</small></div></div></td><td><span class="category-chip">{{ product.category }}</span></td><td><strong>฿{{ formatBaht(product.price) }}</strong><small v-if="product.compareAtPrice" class="table-subtext">ราคาเดิม ฿{{ formatBaht(product.compareAtPrice) }}</small></td><td><span class="stock-cell" :class="{ 'stock-cell-low': product.stock <= product.lowStock, 'stock-cell-zero': product.stock === 0 }"><i/>{{ product.stock }} ชิ้น</span></td><td><span class="status-pill" :class="product.status === 'active' ? 'status-delivered' : product.status === 'draft' ? 'status-pending' : 'status-cancelled'">{{ product.status === 'active' ? 'แสดงบนร้าน' : product.status === 'draft' ? 'ฉบับร่าง' : 'ซ่อนแล้ว' }}</span></td><td><div class="row-actions"><button class="table-action-button" title="แก้ไขสินค้า" @click="openEdit(product)"><AppIcon name="edit" :size="16"/></button><button class="table-action-button" :title="product.status === 'archived' ? 'เผยแพร่สินค้า' : 'ซ่อนสินค้า'" @click="toggleArchive(product)"><AppIcon :name="product.status === 'archived' ? 'eye' : 'more'" :size="17"/></button></div></td></tr></tbody></table></div><div v-else class="panel-empty"><AppIcon name="package" :size="24"/><span>ไม่พบสินค้าที่ตรงกับตัวกรอง</span><button class="text-link" @click="search = ''; categoryFilter = 'all'; statusFilter = 'all'">ล้างตัวกรอง</button></div><div class="table-footer"><span>แสดง {{ products.length }} จาก {{ data?.products?.length || 0 }} รายการ</span><span><AppIcon name="shield" :size="14"/> สต็อกปรับได้ในเมนูคลังสินค้า</span></div></section>
    <AdminModal v-model="modalOpen" :title="editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'" subtitle="รายละเอียดสินค้าจะปรากฏบนหน้าร้านของคุณ" wide><form class="admin-form" @submit.prevent="saveProduct"><div class="form-grid"><label class="field-label">SKU <span>*</span><input v-model="form.sku" required maxlength="40" placeholder="AF-401"></label><label class="field-label">หมวดหมู่ <span>*</span><select v-model.number="form.categoryId" required><option v-for="category in data?.categories || []" :key="category.id" :value="category.id">{{ category.name }}</option></select></label><label class="field-label field-full">ชื่อสินค้า <span>*</span><input v-model="form.name" required maxlength="180" placeholder="เช่น กรอบไม้โอ๊คมินิมอล"></label><label class="field-label field-full">คำโปรยสั้น ๆ<input v-model="form.subtitle" maxlength="240" placeholder="ข้อความสั้นที่อธิบายจุดเด่นของสินค้า"></label><label class="field-label">ราคาขาย (บาท) <span>*</span><input v-model.number="form.price" type="number" min="0" step="1" required></label><label class="field-label">ราคาเปรียบเทียบ <small>ไม่บังคับ</small><input v-model.number="form.compareAtPrice" type="number" min="0" step="1" placeholder="เช่น 990"></label><label v-if="!editingId" class="field-label">สต็อกตั้งต้น <span>*</span><input v-model.number="form.stock" type="number" min="0" required></label><label class="field-label">แจ้งเตือนเมื่อเหลือ<input v-model.number="form.lowStock" type="number" min="0"></label><label class="field-label">ภาพสินค้า<select v-model="form.imageKey"><option value="oak">กรอบไม้โอ๊ค</option><option value="walnut">ไม้สีวอลนัท</option><option value="white">ไม้สีขาว</option><option value="acrylic">อะคริลิกใส</option><option value="desk">กรอบตั้งโต๊ะ</option><option value="kit">อุปกรณ์เสริม</option></select></label><label class="field-label">สถานะ<select v-model="form.status"><option value="active">แสดงบนหน้าร้าน</option><option value="draft">ฉบับร่าง</option><option value="archived">ซ่อนสินค้า</option></select></label><label class="field-label field-full">URL ภาพสินค้าจริง<input v-model="form.imageUrl" type="url" maxlength="800" placeholder="https://www.anchaleeframe.com/upload/product/img/..."><small>ใช้ลิงก์ภาพ HTTPS; เว้นว่างเพื่อใช้ภาพตัวอย่าง</small></label><label class="field-label field-full">รายละเอียดสินค้า<textarea v-model="form.description" rows="3" maxlength="2000" placeholder="รายละเอียด วัสดุ และจุดเด่นของสินค้า"></textarea></label></div><p v-if="editingId" class="modal-stock-note"><AppIcon name="boxes" :size="15"/> แก้ไขจำนวนคงเหลือได้จากเมนูคลังสินค้า เพื่อให้มีประวัติการปรับสต็อกครบถ้วน</p><p v-if="formError" class="form-error"><AppIcon name="alert" :size="16"/> {{ formError }}</p><div class="modal-actions"><button type="button" class="button button-outline" @click="modalOpen = false">ยกเลิก</button><button type="submit" class="button button-primary" :disabled="saving"><AppIcon :name="saving ? 'loader' : 'save'" :size="16" :class="{ spinning: saving }"/> {{ saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า' }}</button></div></form></AdminModal>
  </div>
</template>
