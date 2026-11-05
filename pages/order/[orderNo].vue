<script setup lang="ts">
const route = useRoute()
const orderNo = computed(() => String(route.params.orderNo || ''))
const isDemo = computed(() => route.query.demo === '1')
const orderInfo = ref<any>(null)
const toast = useToast()

onMounted(() => {
  try {
    const stored = sessionStorage.getItem('anchalee-last-order')
    const parsed = stored ? JSON.parse(stored) : null
    if (parsed?.orderNo === orderNo.value) orderInfo.value = parsed
  } catch { /* This page still confirms the order if storage is unavailable. */ }
})

const paymentLabel = computed(() => paymentMethodLabels[orderInfo.value?.paymentMethod] || 'วิธีชำระเงินที่เลือก')
const shippingLabel = computed(() => shippingMethodLabels[orderInfo.value?.shippingMethod] || 'วิธีจัดส่งที่เลือก')
async function copyValue(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.show(`คัดลอก${label}แล้ว`)
  } catch { toast.show(value, 'info') }
}
</script>

<template>
  <section class="order-success page-container">
    <div class="success-art"><div class="success-frame"><span class="success-sun"/><span class="success-hill-one"/><span class="success-hill-two"/><span class="success-flower">✳</span></div><span class="success-spark spark-a">✦</span><span class="success-spark spark-b">✧</span></div>
    <div class="success-copy">
      <span class="section-kicker">A NEW MEMORY, ON ITS WAY</span>
      <span class="success-check"><AppIcon name="check" :size="24"/></span>
      <h1>ขอบคุณที่เลือก<br><em>Anchalee Frame</em></h1>
      <p>คำสั่งซื้อของคุณได้รับการยืนยันแล้ว<br>เราจะเตรียมแพ็กให้อย่างดีที่สุด</p>
      <div class="order-number-card"><span>หมายเลขคำสั่งซื้อ</span><strong>{{ orderNo }}</strong><small>เก็บหมายเลขนี้ไว้เพื่อติดตามสถานะพัสดุ</small></div>

      <section v-if="orderInfo" class="order-payment-card">
        <div class="order-payment-heading"><span class="payment-icon"><AppIcon name="payment" :size="19"/></span><div><strong>{{ paymentLabel }}</strong><small>ยอดชำระ ฿{{ formatBaht(orderInfo.total) }}</small></div></div>
        <template v-if="orderInfo.paymentDetails?.type === 'promptpay_qr'">
          <p>สแกน QR ด้วยแอปธนาคารเพื่อชำระยอดตามคำสั่งซื้อ</p>
          <img class="promptpay-qr" :src="orderInfo.paymentDetails.qrDataUrl" alt="PromptPay QR สำหรับชำระเงิน">
          <div class="copy-detail-row"><span>PromptPay ID</span><strong>{{ orderInfo.paymentDetails.promptPayId }}</strong><button type="button" @click="copyValue(orderInfo.paymentDetails.promptPayId, 'PromptPay ID')"><AppIcon name="copy" :size="14"/> คัดลอก</button></div>
          <small class="payment-verification-note">หลังชำระแล้ว กรุณาส่งหลักฐานให้ร้านทาง LINE การยืนยันยอดชำระยังดำเนินการโดยเจ้าหน้าที่</small>
        </template>
        <template v-else-if="orderInfo.paymentDetails?.type === 'bank_transfer'">
          <p>โอนเงินเข้าบัญชีด้านล่าง แล้วแจ้งหลักฐานกับร้านเพื่อยืนยันยอด</p>
          <div class="bank-detail-list"><div><span>ธนาคาร</span><strong>{{ orderInfo.paymentDetails.bankName }}</strong></div><div><span>ชื่อบัญชี</span><strong>{{ orderInfo.paymentDetails.accountName }}</strong></div><div class="copy-detail-row"><span>เลขที่บัญชี</span><strong>{{ orderInfo.paymentDetails.accountNumber }}</strong><button type="button" @click="copyValue(orderInfo.paymentDetails.accountNumber, 'เลขที่บัญชี')"><AppIcon name="copy" :size="14"/> คัดลอก</button></div><div><span>ยอดที่ต้องโอน</span><strong>฿{{ formatBaht(orderInfo.total) }}</strong></div></div>
          <small class="payment-verification-note">ระบบยังไม่ตรวจสลิปหรือยืนยันยอดโดยอัตโนมัติ กรุณาส่งหลักฐานให้ร้านตรวจสอบ</small>
        </template>
        <template v-else-if="orderInfo.paymentDetails?.type === 'other'">
          <p class="other-payment-instructions">{{ orderInfo.paymentDetails.instructions }}</p>
          <a v-if="orderInfo.paymentDetails.url" class="button button-outline payment-external-link" :href="orderInfo.paymentDetails.url" target="_blank" rel="noopener noreferrer">เปิด {{ orderInfo.paymentDetails.name }} <AppIcon name="external" :size="15"/></a>
          <small class="payment-verification-note">การยืนยันการชำระเงินดำเนินการโดยร้านค้า กรุณาเก็บหลักฐานไว้</small>
        </template>
        <template v-else>
          <p>ชำระเงินกับเจ้าหน้าที่ขนส่งเมื่อได้รับสินค้า</p>
        </template>
        <div v-if="orderInfo.shippingMethod" class="order-shipping-method"><AppIcon name="truck" :size="16"/><span>จัดส่งโดย <strong>{{ shippingLabel }}</strong></span><span v-if="orderInfo.shippingFee === 0">· ฟรี</span><span v-else>· ฿{{ formatBaht(orderInfo.shippingFee) }}</span></div>
      </section>

      <div v-if="isDemo" class="demo-note">โหมดสาธิต: ข้อมูลคำสั่งซื้อถูกเก็บไว้ชั่วคราว ไม่ได้บันทึกลงฐานข้อมูลจริง</div>
      <div class="success-actions"><NuxtLink class="button button-primary" :to="`/track?orderNo=${encodeURIComponent(orderNo)}`">ติดตามคำสั่งซื้อ <AppIcon name="arrow-right" :size="17"/></NuxtLink><NuxtLink class="text-link" to="/shop">เลือกชมสินค้าเพิ่มเติม</NuxtLink></div>
      <div class="success-help"><AppIcon name="headphones" :size="16"/> ต้องการความช่วยเหลือ? <a href="tel:0860669103">โทร 086-066-9103</a></div>
    </div>
  </section>
</template>
