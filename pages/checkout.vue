<script setup lang="ts">
import type { CartLine } from '~/composables/useCart'

const cart = useCart()
const toast = useToast()
const submitting = ref(false)
const submitError = ref('')
const { data: storeData } = await useFetch<any>('/api/store-settings', { key: 'af-store-settings', server: false, retry: false })
const { data: customerSession } = await useFetch<any>('/api/customer/session', { server: false, retry: false })
const form = reactive({
  name: '', email: '', phone: '', address: '', note: '',
  paymentMethod: 'cod', shippingMethod: 'private_carrier', deliveryZone: 'bangkok_metro',
})
const settings = computed(() => storeData.value?.settings || {
  promptPayEnabled: false, bankTransferEnabled: false, otherPaymentEnabled: false,
  companyTruckEnabled: true, companyTruckFee: 150, companyTruckFreeThreshold: 10000,
  privateCarrierEnabled: true, privateCarrierFee: 120,
})
const paymentOptions = computed(() => [
  { value: 'cod', title: 'เก็บเงินปลายทาง', description: 'ชำระเงินเมื่อได้รับสินค้า', icon: 'package-check' },
  ...(storeData.value?.capabilities?.promptPayEnabled ? [{ value: 'promptpay_qr', title: 'PromptPay QR', description: 'สแกนจ่ายผ่านแอปธนาคาร ยอดชำระจะแสดงใน QR', icon: 'payment' }] : []),
  ...(storeData.value?.capabilities?.bankTransferEnabled ? [{ value: 'bank_transfer', title: 'โอนเงินผ่านธนาคาร', description: 'ดูชื่อบัญชีและเลขที่บัญชีหลังยืนยันคำสั่งซื้อ', icon: 'payment' }] : []),
  ...(storeData.value?.capabilities?.otherPaymentEnabled ? [{ value: 'other', title: settings.value.otherPaymentName, description: 'รายละเอียดการชำระจะแสดงหลังยืนยันคำสั่งซื้อ', icon: 'payment' }] : []),
])
const shippingOptions = computed(() => [
  ...(settings.value.companyTruckEnabled ? [{ value: 'company_truck', title: 'รถขนส่งของอัญชลี', description: 'เหมาะกับกรอบชิ้นใหญ่ ทีมงานยืนยันวันและพื้นที่จัดส่ง', icon: 'truck' }] : []),
  ...(settings.value.privateCarrierEnabled ? [{ value: 'private_carrier', title: 'บริษัทขนส่งเอกชน', description: 'จัดส่งตามพื้นที่ พร้อมเลขติดตามพัสดุ', icon: 'package-check' }] : []),
])
const shippingFee = computed(() => {
  if (form.shippingMethod === 'company_truck') {
    if (form.deliveryZone === 'bangkok_metro' && Number(settings.value.companyTruckFreeThreshold) > 0 && cart.subtotal.value >= Number(settings.value.companyTruckFreeThreshold)) return 0
    return Number(settings.value.companyTruckFee) || 0
  }
  return Number(settings.value.privateCarrierFee) || 0
})
const checkoutTotal = computed(() => cart.subtotal.value + shippingFee.value)
const customerUser = computed(() => customerSession.value?.user || null)

watch(shippingOptions, (options) => {
  if (options.length && !options.some((option) => option.value === form.shippingMethod)) form.shippingMethod = options[0]!.value
}, { immediate: true })
watch(paymentOptions, (options) => {
  if (options.length && !options.some((option) => option.value === form.paymentMethod)) form.paymentMethod = options[0]!.value
}, { immediate: true })
watch(customerUser, (user) => {
  if (!user) return
  if (!form.name) form.name = user.displayName || ''
  if (!form.email) form.email = user.email || ''
  if (!form.phone) form.phone = user.phone || ''
  if (!form.address) form.address = user.address || ''
}, { immediate: true })

async function submitOrder() {
  submitError.value = ''
  if (!cart.lines.value.length) { submitError.value = 'กรุณาเพิ่มสินค้าลงตะกร้าก่อน'; return }
  submitting.value = true
  try {
    const result = await $fetch<{
      orderNo: string
      subtotal: number
      total: number
      shippingFee: number
      paymentMethod: string
      shippingMethod: string
      paymentDetails: Record<string, any>
      demo: boolean
    }>('/api/checkout', {
      method: 'POST',
      body: {
        customer: { name: form.name, email: form.email, phone: form.phone, address: form.address },
        note: form.note,
        paymentMethod: form.paymentMethod,
        shippingMethod: form.shippingMethod,
        shippingZone: form.deliveryZone,
        items: cart.lines.value.map((line: CartLine) => ({ productId: line.product.id, quantity: line.quantity })),
      },
    })
    try {
      sessionStorage.setItem('anchalee-last-order', JSON.stringify({
        orderNo: result.orderNo,
        subtotal: result.subtotal,
        total: result.total,
        shippingFee: result.shippingFee,
        paymentMethod: result.paymentMethod,
        shippingMethod: result.shippingMethod,
        paymentDetails: result.paymentDetails,
      }))
    } catch { /* Order confirmation remains available if browser storage is disabled. */ }
    cart.clear()
    await navigateTo({ path: `/order/${encodeURIComponent(result.orderNo)}`, query: { demo: result.demo ? '1' : undefined } })
  } catch (error: any) {
    submitError.value = error?.data?.statusMessage || 'สั่งซื้อไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง'
    toast.show(submitError.value, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="checkout-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><NuxtLink to="/cart">ตะกร้าสินค้า</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>ชำระเงิน</span></div>
    <div class="page-title-row"><div><span class="section-kicker">ALMOST HOME</span><h1>สั่งซื้อให้เรียบร้อย</h1></div><div class="checkout-steps"><span class="done">01 <i>ตะกร้า</i></span><b/><span class="active">02 <i>จัดส่ง</i></span><b/><span>03 <i>สำเร็จ</i></span></div></div>
    <div v-if="cart.lines.value.length" class="checkout-layout">
      <form class="checkout-form" @submit.prevent="submitOrder">
        <section class="checkout-section">
          <div class="checkout-section-title"><span>01</span><div><h2>ข้อมูลสำหรับจัดส่ง</h2><p>เราจะใช้ข้อมูลนี้เพื่อนำส่งคำสั่งซื้อถึงคุณ</p></div></div>
          <div v-if="customerUser" class="checkout-account-note"><span class="checkout-avatar"><img v-if="customerUser.pictureUrl" :src="customerUser.pictureUrl" alt=""><AppIcon v-else name="user" :size="16"/></span><span>เข้าสู่ระบบแล้ว: <strong>{{ customerUser.displayName }}</strong></span><NuxtLink to="/account">แก้ไขข้อมูลที่อยู่</NuxtLink></div>
          <div v-else-if="storeData?.capabilities?.lineLoginEnabled" class="checkout-account-note"><AppIcon name="user" :size="17"/><span>ซื้อได้โดยไม่ต้องสมัครสมาชิก หรือ</span><a href="/api/customer/line/login">เข้าสู่ระบบด้วย LINE</a></div>
          <div class="form-grid">
            <label class="field-label field-full">ชื่อผู้รับสินค้า <span>*</span><input v-model="form.name" autocomplete="name" required maxlength="160" placeholder="ชื่อและนามสกุล"></label>
            <label class="field-label">เบอร์โทรศัพท์ <span>*</span><input v-model="form.phone" autocomplete="tel" inputmode="tel" required maxlength="40" placeholder="08x xxx xxxx"></label>
            <label class="field-label">อีเมล <small>ไม่บังคับ</small><input v-model="form.email" autocomplete="email" type="email" maxlength="190" placeholder="you@example.com"></label>
            <label class="field-label field-full">ที่อยู่จัดส่ง <span>*</span><textarea v-model="form.address" autocomplete="street-address" rows="3" required maxlength="2000" placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"></textarea></label>
            <label class="field-label field-full">หมายเหตุถึงร้าน <small>ไม่บังคับ</small><textarea v-model="form.note" rows="2" maxlength="1000" placeholder="เช่น ฝากไว้ที่นิติบุคคล หรือรายละเอียดเพิ่มเติม"></textarea></label>
          </div>
        </section>

        <section class="checkout-section">
          <div class="checkout-section-title"><span>02</span><div><h2>เลือกวิธีจัดส่ง</h2><p>ค่าจัดส่งเป็นยอดประเมิน ร้านจะแจ้งยืนยันก่อนจัดส่ง</p></div></div>
          <label v-for="option in shippingOptions" :key="option.value" class="payment-option shipping-option" :class="{ selected: form.shippingMethod === option.value }">
            <input v-model="form.shippingMethod" type="radio" name="shippingMethod" :value="option.value" required>
            <span class="payment-icon"><AppIcon :name="option.icon" :size="19"/></span>
            <span class="payment-text"><strong>{{ option.title }}</strong><small>{{ option.description }}</small></span>
            <b class="shipping-choice-fee">{{ option.value === 'company_truck' && form.deliveryZone === 'bangkok_metro' && Number(settings.companyTruckFreeThreshold) > 0 && cart.subtotal.value >= Number(settings.companyTruckFreeThreshold) ? 'ฟรี' : `฿${formatBaht(option.value === 'company_truck' ? Number(settings.companyTruckFee) : Number(settings.privateCarrierFee))}` }}</b>
            <AppIcon name="circle-check" :size="19" class="payment-selected-icon"/>
          </label>
          <label v-if="form.shippingMethod === 'company_truck'" class="field-label checkout-zone">พื้นที่จัดส่ง <span>*</span>
            <select v-model="form.deliveryZone" required>
              <option value="bangkok_metro">กรุงเทพฯ และปริมณฑล</option>
              <option value="other">พื้นที่อื่นในประเทศไทย</option>
            </select>
          </label>
          <p v-if="form.shippingMethod === 'company_truck'" class="payment-note"><AppIcon name="info" :size="15"/> รถบริษัทให้บริการตามรอบและพื้นที่ ยอดครบ ฿{{ formatBaht(Number(settings.companyTruckFreeThreshold)) }} จัดส่งฟรีเฉพาะกรุงเทพฯ/ปริมณฑล</p>
        </section>

        <section class="checkout-section">
          <div class="checkout-section-title"><span>03</span><div><h2>เลือกวิธีชำระเงิน</h2><p>เลือกช่องทางที่สะดวก รายละเอียดจะแสดงหลังยืนยันคำสั่งซื้อ</p></div></div>
          <label v-for="option in paymentOptions" :key="option.value" class="payment-option" :class="{ selected: form.paymentMethod === option.value }">
            <input v-model="form.paymentMethod" type="radio" name="paymentMethod" :value="option.value" required>
            <span class="payment-icon"><AppIcon :name="option.icon" :size="19"/></span>
            <span class="payment-text"><strong>{{ option.title }}</strong><small>{{ option.description }}</small></span>
            <AppIcon name="circle-check" :size="19" class="payment-selected-icon"/>
          </label>
          <p class="payment-note"><AppIcon name="shield" :size="15"/> PromptPay และโอนเงินจะขึ้นสถานะรอตรวจสอบ ร้านยืนยันการชำระเงินด้วยเจ้าหน้าที่</p>
        </section>

        <p v-if="submitError" class="form-error"><AppIcon name="alert" :size="17"/> {{ submitError }}</p>
        <button class="button button-primary checkout-submit" type="submit" :disabled="submitting || !shippingOptions.length || !paymentOptions.length"><AppIcon :name="submitting ? 'loader' : 'shield'" :size="17" :class="{ spinning: submitting }"/> {{ submitting ? 'กำลังยืนยันคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ' }} <AppIcon name="arrow-right" :size="17"/></button>
        <p class="checkout-terms">เมื่อคลิกยืนยันคำสั่งซื้อ แสดงว่าคุณยอมรับเงื่อนไขการซื้อสินค้าและนโยบายความเป็นส่วนตัว</p>
      </form>

      <aside class="cart-summary checkout-summary">
        <h2>คำสั่งซื้อของคุณ <span>{{ cart.count.value }} ชิ้น</span></h2>
        <div class="checkout-product-list"><div v-for="line in cart.lines.value" :key="line.product.id" class="checkout-product"><div class="checkout-product-art"><ProductArtwork :image-key="line.product.imageKey" :image-url="line.product.imageUrl" compact/><span>{{ line.quantity }}</span></div><div><strong>{{ line.product.name }}</strong><small>{{ line.product.sku }}</small></div><b>฿{{ formatBaht(line.product.price * line.quantity) }}</b></div></div>
        <div class="summary-row"><span>ยอดสินค้า</span><strong>฿{{ formatBaht(cart.subtotal.value) }}</strong></div>
        <div class="summary-row"><span>{{ form.shippingMethod === 'company_truck' ? 'รถขนส่งของร้าน' : 'ขนส่งเอกชน' }}</span><strong>{{ shippingFee ? `฿${formatBaht(shippingFee)}` : 'ฟรี' }}</strong></div>
        <div class="summary-total"><span>ยอดชำระทั้งหมด</span><strong>฿{{ formatBaht(checkoutTotal) }}</strong></div>
        <div class="checkout-summary-note"><AppIcon name="info" :size="17"/> ค่าขนส่งเป็นยอดประมาณการ อาจปรับตามพื้นที่และขนาดสินค้า ร้านจะแจ้งยืนยันก่อนจัดส่ง</div>
      </aside>
    </div>
    <div v-else class="cart-empty"><span class="cart-empty-icon"><AppIcon name="bag" :size="34"/></span><h2>ยังไม่มีสินค้าในตะกร้า</h2><p>กลับไปเลือกกรอบรูปที่คุณชอบก่อนนะ</p><NuxtLink class="button button-primary" to="/shop">เลือกดูกรอบรูป <AppIcon name="arrow-right" :size="17"/></NuxtLink></div>
  </div>
</template>
