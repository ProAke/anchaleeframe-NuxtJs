<script setup lang="ts">
const route = useRoute()
const orderNo = ref(String(route.query.orderNo || ''))
const phone = ref('')
const loading = ref(false)
const errorMessage = ref('')
const result = ref<any>(null)

async function findOrder() {
  errorMessage.value = ''
  result.value = null
  loading.value = true
  try {
    const response = await $fetch<{ order: any }>('/api/track', { query: { orderNo: orderNo.value.trim(), phone: phone.value.trim() } })
    result.value = response.order
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบข้อมูลอีกครั้ง'
  } finally {
    loading.value = false
  }
}

const statusLabel = computed(() => ({ pending: 'รับคำสั่งซื้อแล้ว', processing: 'กำลังเตรียมสินค้า', shipped: 'กำลังจัดส่ง', delivered: 'จัดส่งสำเร็จ', cancelled: 'คำสั่งซื้อถูกยกเลิก' } as Record<string, string>)[result.value?.status] || 'รออัปเดต')
const progressIndex = computed(() => ({ pending: 0, processing: 1, shipped: 2, delivered: 3 } as Record<string, number>)[result.value?.status] ?? 0)
</script>

<template>
  <div class="track-page page-container"><div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>ติดตามคำสั่งซื้อ</span></div><section class="track-hero"><span class="section-kicker">HERE'S WHERE YOUR ORDER IS</span><div class="track-hero-icon"><AppIcon name="package-check" :size="26"/></div><h1>ติดตามเรื่องราว<br><em>ที่กำลังเดินทาง</em></h1><p>กรอกหมายเลขคำสั่งซื้อและเบอร์โทรที่ใช้สั่งซื้อ<br>เพื่อตรวจสอบสถานะล่าสุด</p></section><form class="track-search-card" @submit.prevent="findOrder"><label class="field-label">หมายเลขคำสั่งซื้อ<input v-model="orderNo" required placeholder="เช่น AF-261104-001"></label><label class="field-label">เบอร์โทรศัพท์ที่ใช้สั่งซื้อ<input v-model="phone" required inputmode="tel" placeholder="08x xxx xxxx"></label><button class="button button-primary" type="submit" :disabled="loading"><AppIcon :name="loading ? 'loader' : 'search'" :size="17" :class="{ spinning: loading }"/> {{ loading ? 'กำลังค้นหา...' : 'ตรวจสอบสถานะ' }}</button><p v-if="errorMessage" class="track-error"><AppIcon name="alert" :size="16"/> {{ errorMessage }}</p></form><section v-if="result" class="track-result"><div class="track-result-head"><div><span class="section-kicker">ORDER STATUS</span><h2>{{ result.orderNo }}</h2></div><span class="status-pill" :class="`status-${result.status}`">{{ statusLabel }}</span></div><div class="track-timeline"><div v-for="(step, index) in ['รับคำสั่งซื้อแล้ว', 'กำลังเตรียมสินค้า', 'กำลังจัดส่ง', 'ได้รับสินค้าแล้ว']" :key="step" class="timeline-step" :class="{ complete: index < progressIndex, current: index === progressIndex && result.status !== 'cancelled', cancelled: result.status === 'cancelled' && index === 0 }"><span class="timeline-dot"><AppIcon :name="index < progressIndex ? 'check' : ['receipt', 'boxes', 'truck', 'circle-check'][index]" :size="16"/></span><div><strong>{{ step }}</strong><small v-if="index === 0">{{ formatDate(result.createdAt, true) }}</small><small v-else-if="index === 2 && result.shipment">{{ result.shipment.carrier }} · {{ result.shipment.trackingNo }}</small><small v-else-if="index === 3 && result.shipment?.deliveredAt">{{ formatDate(result.shipment.deliveredAt, true) }}</small><small v-else>{{ index <= progressIndex ? 'อัปเดตสถานะแล้ว' : 'รอดำเนินการ' }}</small></div></div></div><div v-if="result.shipment" class="tracking-number-card"><div class="tracking-carrier"><span class="carrier-icon"><AppIcon name="truck" :size="19"/></span><span><strong>{{ result.shipment.carrier }}</strong><small>หมายเลขพัสดุ</small></span></div><span class="tracking-code">{{ result.shipment.trackingNo }}</span></div><div class="track-order-items"><strong>รายการสินค้า</strong><div v-for="item in result.items" :key="item.sku" class="track-item-row"><span>{{ item.productName }} <small>× {{ item.quantity }}</small></span><span>฿{{ formatBaht(item.lineTotal) }}</span></div><div class="track-item-total"><span>ยอดชำระ</span><strong>฿{{ formatBaht(result.total) }}</strong></div></div><div class="track-delivery-note"><AppIcon name="pin" :size="16"/> กำลังจัดส่งไปยัง {{ result.shippingName || 'ผู้รับสินค้า' }}</div></section><div class="track-help"><span><AppIcon name="headphones" :size="19"/></span><div><strong>มีคำถามเกี่ยวกับคำสั่งซื้อ?</strong><p>เรายินดีช่วยเหลือคุณ ติดต่อทีมงานของเราได้ทุกวัน</p></div><a href="tel:0860669103">โทร 086-066-9103 <AppIcon name="arrow-right" :size="15"/></a></div></div>
</template>
