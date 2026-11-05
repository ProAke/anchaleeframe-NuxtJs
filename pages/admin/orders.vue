<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const route = useRoute()
const { data, pending, error, refresh } = await useFetch<any>('/api/admin/orders', { server: false, retry: false })
const toast = useToast()
const search = ref(String(route.query.q || ''))
const statusFilter = ref(String(route.query.status || 'all'))
const selectedOrderId = ref<number | null>(null)
const saving = ref(false)
const shipmentModal = ref(false)
const shipmentError = ref('')
const shipmentForm = reactive({ carrier: 'Kerry Express', trackingNo: '', note: '' })
const statusTabs = [{ id: 'all', label: 'ทั้งหมด' }, { id: 'pending', label: 'รอจัดการ' }, { id: 'processing', label: 'กำลังเตรียม' }, { id: 'shipped', label: 'กำลังจัดส่ง' }, { id: 'delivered', label: 'สำเร็จ' }, { id: 'cancelled', label: 'ยกเลิก' }]
const orders = computed(() => {
  let items = [...(data.value?.orders || [])]
  if (statusFilter.value !== 'all') items = items.filter((order: any) => order.status === statusFilter.value)
  const term = search.value.trim().toLowerCase()
  if (term) items = items.filter((order: any) => `${order.orderNo} ${order.customer?.name || order.shippingName} ${order.customer?.phone || order.shippingPhone}`.toLowerCase().includes(term))
  return items
})
const selectedOrder = computed(() => data.value?.orders?.find((order: any) => order.id === selectedOrderId.value) || null)
const countByStatus = (status: string) => status === 'all' ? (data.value?.orders?.length || 0) : (data.value?.orders || []).filter((order: any) => order.status === status).length
const totalPaid = computed(() => (data.value?.orders || []).filter((order: any) => order.paymentStatus === 'paid').reduce((sum: number, order: any) => sum + Number(order.total), 0))
const customerName = (order: any) => order.customer?.name || order.shippingName || 'ลูกค้า'
const itemCount = (order: any) => order.items?.reduce((sum: number, item: any) => sum + Number(item.quantity), 0) || order.itemCount || 0
async function updateStatus(status: string) {
  if (!selectedOrder.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrder.value.id}`, { method: 'PATCH', body: { status } })
    await refresh()
    toast.show(`อัปเดตเป็น${orderStatusLabels[status] || status}แล้ว`)
  } catch (err: any) { toast.show(err?.data?.statusMessage || 'อัปเดตสถานะไม่สำเร็จ', 'error') }
  finally { saving.value = false }
}
async function markPaid() {
  if (!selectedOrder.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrder.value.id}`, { method: 'PATCH', body: { paymentStatus: selectedOrder.value.paymentStatus === 'paid' ? 'unpaid' : 'paid' } })
    await refresh(); toast.show('อัปเดตสถานะการชำระเงินแล้ว')
  } catch (err: any) { toast.show(err?.data?.statusMessage || 'อัปเดตไม่สำเร็จ', 'error') }
  finally { saving.value = false }
}
function openShipment() { shipmentError.value = ''; shipmentForm.carrier = 'Kerry Express'; shipmentForm.trackingNo = ''; shipmentForm.note = ''; shipmentModal.value = true }
async function saveShipment() {
  if (!selectedOrder.value) return
  saving.value = true; shipmentError.value = ''
  try {
    await $fetch('/api/admin/shipments', { method: 'POST', body: { orderId: selectedOrder.value.id, ...shipmentForm } })
    shipmentModal.value = false
    await refresh()
    toast.show('บันทึกเลขพัสดุและเปลี่ยนสถานะเป็นจัดส่งแล้ว')
  } catch (err: any) { shipmentError.value = err?.data?.statusMessage || 'บันทึกการจัดส่งไม่สำเร็จ' }
  finally { saving.value = false }
}
async function markDelivered() {
  if (!selectedOrder.value?.shipment) return
  saving.value = true
  try { await $fetch(`/api/admin/shipments/${selectedOrder.value.shipment.id}`, { method: 'PATCH', body: { status: 'delivered' } }); await refresh(); toast.show('ทำเครื่องหมายว่าจัดส่งสำเร็จแล้ว') }
  catch (err: any) { toast.show(err?.data?.statusMessage || 'อัปเดตสถานะไม่สำเร็จ', 'error') }
  finally { saving.value = false }
}
async function copyOrderNo(value: string) { try { await navigator.clipboard.writeText(value); toast.show('คัดลอกเลขคำสั่งซื้อแล้ว') } catch { toast.show(value, 'info') } }
</script>

<template>
  <div class="admin-page-wrap"><div class="admin-page-heading"><div><span class="section-kicker">ORDERS & CUSTOMER CARE</span><h1>คำสั่งซื้อ <span class="heading-count">{{ data?.orders?.length || 0 }}</span></h1><p>ติดตามคำสั่งซื้อ อัปเดตการชำระเงิน และเตรียมจัดส่งสินค้า</p></div><div class="orders-total-chip"><span>ยอดรับชำระแล้ว</span><strong>฿{{ formatBaht(totalPaid) }}</strong></div></div>
    <section class="stat-grid compact-stat-grid order-mini-stats"><article class="mini-stat-card"><span class="mini-stat-icon mini-purple"><AppIcon name="receipt" :size="17"/></span><span><small>คำสั่งซื้อทั้งหมด</small><strong>{{ data?.orders?.length || 0 }} <i>รายการ</i></strong></span></article><article class="mini-stat-card"><span class="mini-stat-icon mini-peach"><AppIcon name="clock" :size="17"/></span><span><small>รอจัดการ</small><strong>{{ countByStatus('pending') }} <i>รายการ</i></strong></span><NuxtLink class="mini-stat-end mini-stat-link" to="/admin/orders?status=pending"><AppIcon name="arrow-up-right" :size="15"/></NuxtLink></article><article class="mini-stat-card"><span class="mini-stat-icon mini-blue"><AppIcon name="truck" :size="17"/></span><span><small>กำลังจัดส่ง</small><strong>{{ countByStatus('shipped') }} <i>รายการ</i></strong></span></article></section>
    <section class="admin-panel orders-panel"><div class="order-toolbar"><div class="stock-filters order-tabs"><button v-for="tab in statusTabs" :key="tab.id" class="filter-tab" :class="{ active: statusFilter === tab.id }" @click="statusFilter = tab.id">{{ tab.label }}<span>{{ countByStatus(tab.id) }}</span></button></div><label class="admin-search"><AppIcon name="search" :size="17"/><input v-model="search" placeholder="ค้นหาเลขออเดอร์ / ลูกค้า..." type="search"/></label></div><div v-if="pending" class="admin-loading-card"><span class="loading-spinner"/> กำลังโหลดคำสั่งซื้อ...</div><div v-else-if="error" class="admin-error-card"><AppIcon name="alert" :size="20"/> โหลดคำสั่งซื้อไม่สำเร็จ <button class="button button-outline" @click="refresh()">ลองอีกครั้ง</button></div><div v-else-if="orders.length" class="table-scroll"><table class="admin-table orders-table"><thead><tr><th>คำสั่งซื้อ</th><th>ลูกค้า</th><th>รายการ</th><th>วันที่สั่งซื้อ</th><th>ยอดรวม</th><th>การชำระ</th><th>สถานะ</th><th/></tr></thead><tbody><tr v-for="order in orders" :key="order.id" class="clickable-row" @click="selectedOrderId = order.id"><td><strong class="table-order-no">{{ order.orderNo }}</strong><small class="table-subtext">{{ order.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนเงิน' }}</small></td><td><div class="table-customer"><span class="customer-avatar-small">{{ customerName(order).slice(-1) }}</span><span>{{ customerName(order) }}<small>{{ order.customer?.phone || order.shippingPhone }}</small></span></div></td><td>{{ itemCount(order) }} ชิ้น</td><td>{{ formatDate(order.createdAt) }}</td><td><strong>฿{{ formatBaht(order.total) }}</strong></td><td><span class="payment-status" :class="`payment-${order.paymentStatus}`"><i/>{{ paymentStatusLabels[order.paymentStatus] || order.paymentStatus }}</span></td><td><span class="status-pill" :class="`status-${order.status}`">{{ orderStatusLabels[order.status] || order.status }}</span></td><td><button class="table-action-button" title="ดูรายละเอียด" @click.stop="selectedOrderId = order.id"><AppIcon name="chevron-right" :size="17"/></button></td></tr></tbody></table></div><div v-else class="panel-empty"><AppIcon name="receipt" :size="26"/><span>ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</span><button class="text-link" @click="statusFilter = 'all'; search = ''">แสดงทั้งหมด</button></div><div class="table-footer"><span>แสดง {{ orders.length }} จาก {{ data?.orders?.length || 0 }} รายการ</span><span><AppIcon name="shield" :size="14"/> ข้อมูลคำสั่งซื้อจัดเก็บอย่างปลอดภัย</span></div></section>
    <AdminModal :model-value="!!selectedOrder" :title="selectedOrder ? `คำสั่งซื้อ ${selectedOrder.orderNo}` : 'รายละเอียดคำสั่งซื้อ'" subtitle="ดูข้อมูลลูกค้า รายการสินค้า และการจัดส่ง" wide @update:model-value="(value) => { if (!value) selectedOrderId = null }"><template v-if="selectedOrder"><div class="order-detail-top"><div><span class="section-kicker">ORDER PLACED {{ formatDate(selectedOrder.createdAt, true) }}</span><div class="order-detail-status"><span class="status-pill" :class="`status-${selectedOrder.status}`">{{ orderStatusLabels[selectedOrder.status] }}</span><span class="payment-status" :class="`payment-${selectedOrder.paymentStatus}`"><i/>{{ paymentStatusLabels[selectedOrder.paymentStatus] }}</span></div></div><button class="button button-small button-outline" @click="copyOrderNo(selectedOrder.orderNo)"><AppIcon name="copy" :size="14"/> คัดลอกเลขออเดอร์</button></div><div class="order-detail-grid"><section class="order-detail-section"><h3><AppIcon name="bag" :size="16"/> รายการสินค้า</h3><div v-for="item in selectedOrder.items" :key="item.sku" class="order-detail-item"><div class="order-item-thumbnail"><AppIcon name="package" :size="19"/></div><span><strong>{{ item.productName }}</strong><small>{{ item.sku }} · {{ item.quantity }} ชิ้น</small></span><b>฿{{ formatBaht(item.lineTotal) }}</b></div><div class="order-detail-totals"><span>ยอดสินค้า</span><span>฿{{ formatBaht(selectedOrder.subtotal) }}</span><span>ค่าจัดส่ง</span><span>฿{{ formatBaht(selectedOrder.shippingFee) }}</span><strong>ยอดรวม</strong><strong>฿{{ formatBaht(selectedOrder.total) }}</strong></div></section><section class="order-detail-section"><h3><AppIcon name="user" :size="16"/> ข้อมูลผู้รับ</h3><div class="order-customer-card"><strong>{{ selectedOrder.shippingName || selectedOrder.customer?.name }}</strong><span><AppIcon name="phone" :size="14"/> {{ selectedOrder.shippingPhone || selectedOrder.customer?.phone }}</span><span><AppIcon name="mail" :size="14"/> {{ selectedOrder.customer?.email || 'ไม่ได้ระบุอีเมล' }}</span><span><AppIcon name="pin" :size="14"/> {{ selectedOrder.shippingAddress || '—' }}</span></div><div v-if="selectedOrder.note" class="order-customer-note"><strong>หมายเหตุจากลูกค้า</strong><p>{{ selectedOrder.note }}</p></div><div v-if="selectedOrder.shipment" class="order-shipment-summary"><span><AppIcon name="truck" :size="16"/> {{ selectedOrder.shipment.carrier }}</span><strong>{{ selectedOrder.shipment.trackingNo }}</strong><small>{{ shipmentStatusLabels[selectedOrder.shipment.status] || selectedOrder.shipment.status }}</small></div></section></div><div class="order-detail-actions"><button v-if="selectedOrder.paymentStatus !== 'paid' && selectedOrder.status !== 'cancelled'" class="button button-outline" :disabled="saving" @click="markPaid"><AppIcon name="payment" :size="16"/> ทำเครื่องหมายชำระแล้ว</button><button v-if="selectedOrder.status === 'pending'" class="button button-primary" :disabled="saving" @click="updateStatus('processing')"><AppIcon name="boxes" :size="16"/> เริ่มเตรียมสินค้า</button><button v-if="selectedOrder.status === 'processing' && !selectedOrder.shipment" class="button button-primary" @click="openShipment"><AppIcon name="truck" :size="16"/> บันทึกเลขพัสดุ</button><button v-if="selectedOrder.status === 'shipped' && selectedOrder.shipment?.status !== 'delivered'" class="button button-primary" :disabled="saving" @click="markDelivered"><AppIcon name="package-check" :size="16"/> ทำเครื่องหมายส่งสำเร็จ</button><button v-if="['pending','processing'].includes(selectedOrder.status)" class="button button-danger-ghost" :disabled="saving" @click="updateStatus('cancelled')"><AppIcon name="close" :size="16"/> ยกเลิกออเดอร์</button></div></template></AdminModal>
    <AdminModal v-model="shipmentModal" title="บันทึกข้อมูลจัดส่ง" subtitle="เพิ่มขนส่งและเลขพัสดุเพื่อติดตามคำสั่งซื้อ"><form class="admin-form" @submit.prevent="saveShipment"><div class="shipment-order-summary"><AppIcon name="receipt" :size="18"/><span><small>กำลังจัดส่งออเดอร์</small><strong>{{ selectedOrder?.orderNo }}</strong></span></div><label class="field-label">บริษัทขนส่ง <span>*</span><select v-model="shipmentForm.carrier"><option>Kerry Express</option><option>ไปรษณีย์ไทย</option><option>Flash Express</option><option>J&T Express</option><option>ขนส่งอื่น ๆ</option></select></label><label class="field-label">เลขพัสดุ / Tracking number <span>*</span><input v-model="shipmentForm.trackingNo" required maxlength="100" placeholder="กรอกเลขพัสดุ"></label><label class="field-label">หมายเหตุ<textarea v-model="shipmentForm.note" rows="2" maxlength="400" placeholder="เช่น รับพัสดุโดยผู้ดูแลอาคาร"></textarea></label><p v-if="shipmentError" class="form-error"><AppIcon name="alert" :size="16"/> {{ shipmentError }}</p><div class="modal-actions"><button type="button" class="button button-outline" @click="shipmentModal = false">ยกเลิก</button><button class="button button-primary" type="submit" :disabled="saving"><AppIcon :name="saving ? 'loader' : 'truck'" :size="16" :class="{ spinning: saving }"/> {{ saving ? 'กำลังบันทึก...' : 'บันทึกการจัดส่ง' }}</button></div></form></AdminModal>
  </div>
</template>
