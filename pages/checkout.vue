<script setup lang="ts">
import type { CartLine } from '~/composables/useCart'

const cart = useCart()
const toast = useToast()
const submitting = ref(false)
const submitError = ref('')
const form = reactive({ name: '', email: '', phone: '', address: '', note: '', paymentMethod: 'cod' })
async function submitOrder() {
  submitError.value = ''
  if (!cart.lines.value.length) { submitError.value = 'กรุณาเพิ่มสินค้าลงตะกร้าก่อน'; return }
  submitting.value = true
  try {
    const result = await $fetch<{ orderNo: string; total: number; demo: boolean }>('/api/checkout', {
      method: 'POST',
      body: {
        customer: { name: form.name, email: form.email, phone: form.phone, address: form.address },
        note: form.note,
        paymentMethod: form.paymentMethod,
        items: cart.lines.value.map((line: CartLine) => ({ productId: line.product.id, quantity: line.quantity })),
      },
    })
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
    <div v-if="cart.lines.value.length" class="checkout-layout"><form class="checkout-form" @submit.prevent="submitOrder"><section class="checkout-section"><div class="checkout-section-title"><span>01</span><div><h2>ข้อมูลสำหรับจัดส่ง</h2><p>เราจะใช้ข้อมูลนี้เพื่อนำส่งคำสั่งซื้อถึงคุณ</p></div></div><div class="form-grid"><label class="field-label field-full">ชื่อผู้รับสินค้า <span>*</span><input v-model="form.name" autocomplete="name" required maxlength="160" placeholder="ชื่อและนามสกุล"></label><label class="field-label">เบอร์โทรศัพท์ <span>*</span><input v-model="form.phone" autocomplete="tel" inputmode="tel" required placeholder="08x xxx xxxx"></label><label class="field-label">อีเมล <small>ไม่บังคับ</small><input v-model="form.email" autocomplete="email" type="email" placeholder="you@example.com"></label><label class="field-label field-full">ที่อยู่จัดส่ง <span>*</span><textarea v-model="form.address" autocomplete="street-address" rows="3" required placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"></textarea></label><label class="field-label field-full">หมายเหตุถึงร้าน <small>ไม่บังคับ</small><textarea v-model="form.note" rows="2" placeholder="เช่น ฝากไว้ที่นิติบุคคล หรือรายละเอียดเพิ่มเติม"></textarea></label></div></section><section class="checkout-section"><div class="checkout-section-title"><span>02</span><div><h2>วิธีชำระเงิน</h2><p>เลือกวิธีที่สะดวกสำหรับคุณ</p></div></div><label class="payment-option" :class="{ selected: form.paymentMethod === 'cod' }"><input v-model="form.paymentMethod" type="radio" value="cod"><span class="payment-icon"><AppIcon name="package-check" :size="19"/></span><span class="payment-text"><strong>เก็บเงินปลายทาง</strong><small>ชำระเงินเมื่อได้รับสินค้า</small></span><AppIcon name="circle-check" :size="19" class="payment-selected-icon"/></label><label class="payment-option" :class="{ selected: form.paymentMethod === 'transfer' }"><input v-model="form.paymentMethod" type="radio" value="transfer"><span class="payment-icon"><AppIcon name="payment" :size="19"/></span><span class="payment-text"><strong>โอนเงินผ่านธนาคาร</strong><small>รายละเอียดบัญชีจะแสดงหลังยืนยันคำสั่งซื้อ</small></span><AppIcon name="circle-check" :size="19" class="payment-selected-icon"/></label><p class="payment-note"><AppIcon name="shield" :size="15"/> ข้อมูลส่วนตัวของคุณจะถูกเก็บรักษาอย่างปลอดภัย</p></section><p v-if="submitError" class="form-error"><AppIcon name="alert" :size="17"/> {{ submitError }}</p><button class="button button-primary checkout-submit" type="submit" :disabled="submitting"><AppIcon :name="submitting ? 'loader' : 'shield'" :size="17" :class="{ spinning: submitting }"/> {{ submitting ? 'กำลังยืนยันคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ' }} <AppIcon name="arrow-right" :size="17"/></button><p class="checkout-terms">เมื่อคลิกยืนยันคำสั่งซื้อ แสดงว่าคุณยอมรับเงื่อนไขการซื้อสินค้าและนโยบายความเป็นส่วนตัว</p></form>
      <aside class="cart-summary checkout-summary"><h2>คำสั่งซื้อของคุณ <span>{{ cart.count.value }} ชิ้น</span></h2><div class="checkout-product-list"><div v-for="line in cart.lines.value" :key="line.product.id" class="checkout-product"><div class="checkout-product-art"><ProductArtwork :image-key="line.product.imageKey" :image-url="line.product.imageUrl" compact/><span>{{ line.quantity }}</span></div><div><strong>{{ line.product.name }}</strong><small>{{ line.product.sku }}</small></div><b>฿{{ formatBaht(line.product.price * line.quantity) }}</b></div></div><div class="summary-row"><span>ยอดสินค้า</span><strong>฿{{ formatBaht(cart.subtotal.value) }}</strong></div><div class="summary-row"><span>ค่าจัดส่ง</span><strong>{{ cart.shippingFee.value ? `฿${formatBaht(cart.shippingFee.value)}` : 'ฟรี' }}</strong></div><div class="summary-total"><span>ยอดชำระทั้งหมด</span><strong>฿{{ formatBaht(cart.total.value) }}</strong></div><div class="checkout-summary-note"><AppIcon name="info" :size="17"/> ค่าจัดส่งอาจปรับตามขนาดสินค้าและพื้นที่ ร้านจะแจ้งยืนยันก่อนจัดส่ง</div></aside></div>
    <div v-else class="cart-empty"><span class="cart-empty-icon"><AppIcon name="bag" :size="34"/></span><h2>ยังไม่มีสินค้าในตะกร้า</h2><p>กลับไปเลือกกรอบรูปที่คุณชอบก่อนนะ</p><NuxtLink class="button button-primary" to="/shop">เลือกดูกรอบรูป <AppIcon name="arrow-right" :size="17"/></NuxtLink></div>
  </div>
</template>
