<script setup lang="ts">
import type { CartProduct } from '~/composables/useCart'

const route = useRoute()
const { data } = await useFetch('/api/products', { query: { slug: computed(() => String(route.params.slug || '')) } })
const product = computed(() => data.value?.products?.[0] as CartProduct | undefined)
if (!product.value) throw createError({ statusCode: 404, statusMessage: 'ไม่พบสินค้านี้' })
const cart = useCart()
const toast = useToast()
const quantity = ref(1)
const added = ref(false)
function addToCart() {
  if (!product.value) return
  if (cart.add(product.value, quantity.value)) {
    added.value = true
    toast.show('เพิ่มสินค้าในตะกร้าแล้ว')
    setTimeout(() => { added.value = false }, 1700)
  } else toast.show('สินค้าหมดชั่วคราว', 'info')
}
</script>

<template>
  <div v-if="product" class="product-detail page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><NuxtLink to="/shop">สินค้า</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>{{ product.name }}</span></div>
    <div class="product-detail-grid">
      <div class="product-detail-art"><ProductArtwork :image-key="product.imageKey" :image-url="product.imageUrl"/><span class="detail-art-tag">DESIGNED WITH INTENTION · {{ product.sku }}</span></div>
      <section class="product-detail-copy"><div class="product-detail-topline"><span class="section-kicker">{{ product.category || 'THE FRAME COLLECTION' }}</span><span class="detail-rating">SKU {{ product.sku }}</span></div><h1>{{ product.name }}</h1><p class="product-detail-subtitle">{{ product.subtitle }}</p><div class="detail-price-row"><strong>฿{{ formatBaht(product.price) }}</strong><del v-if="product.compareAtPrice && product.compareAtPrice > product.price">฿{{ formatBaht(product.compareAtPrice) }}</del><span v-if="product.compareAtPrice && product.compareAtPrice > product.price" class="detail-save">ประหยัด ฿{{ formatBaht(product.compareAtPrice - product.price) }}</span></div><div class="detail-divider"/><p class="detail-description">{{ product.description }}</p><div class="detail-points"><div><span class="detail-point-icon"><AppIcon name="frame" :size="17"/></span><span><strong>โรงงานผลิตกรอบรูป</strong><small>มีสินค้าและงานกรอบหลากหลายประเภท</small></span></div><div><span class="detail-point-icon"><AppIcon name="package-check" :size="17"/></span><span><strong>แพ็กอย่างปลอดภัย</strong><small>จัดส่งด้วยความใส่ใจทุกชิ้น</small></span></div></div><div class="detail-availability"><span class="availability-dot" :class="{ 'out-of-stock': product.stock < 1 }"/><span>{{ product.stock > 0 ? `พร้อมส่ง · เหลือ ${product.stock} ชิ้น` : 'สินค้าหมดชั่วคราว' }}</span><span class="detail-sku">SKU {{ product.sku }}</span></div><div class="detail-buy-row"><div class="quantity-picker"><button aria-label="ลดจำนวน" :disabled="quantity <= 1" @click="quantity--"><AppIcon name="minus" :size="15"/></button><span>{{ quantity }}</span><button aria-label="เพิ่มจำนวน" :disabled="quantity >= Math.min(product.stock, 20)" @click="quantity++"><AppIcon name="plus" :size="15"/></button></div><button class="button button-primary add-cart-button" :disabled="product.stock < 1" @click="addToCart"><AppIcon :name="added ? 'check' : 'bag'" :size="17"/> {{ added ? 'เพิ่มในตะกร้าแล้ว' : 'ใส่ตะกร้า' }} <span>฿{{ formatBaht(product.price * quantity) }}</span></button></div><div class="detail-shipping"><AppIcon name="truck" :size="17"/><span>ค่าจัดส่งอาจเปลี่ยนตามขนาดสินค้าและพื้นที่จัดส่ง <NuxtLink to="/shipping">ดูรายละเอียด</NuxtLink></span><AppIcon name="chevron-right" :size="15"/></div><div class="detail-material"><span>รหัสสินค้า</span><strong>{{ product.sku }}</strong><span>หมวดหมู่</span><strong>{{ product.category || 'กรอบรูป' }}</strong></div></section>
    </div>
    <section class="detail-aftercare"><span class="section-kicker">A FEW THINGS TO KNOW</span><h2>เรื่องเล็ก ๆ ที่ทำให้<br>คุณใช้กรอบได้ <em>สบายใจ</em></h2><div class="aftercare-cards"><div><AppIcon name="ruler" :size="22"/><strong>เลือกขนาดที่พอดี</strong><p>วัดขนาดภาพก่อนสั่งซื้อ เพื่อให้กรอบที่คุณเลือกพอดีกับภาพถ่ายชิ้นโปรด</p></div><div><AppIcon name="sparkles" :size="22"/><strong>ดูแลรักษาง่าย</strong><p>ใช้ผ้านุ่มเช็ดฝุ่นเบา ๆ หลีกเลี่ยงน้ำยาเคมี เพื่อให้กรอบสวยไปอีกนาน</p></div><div><AppIcon name="heart" :size="22"/><strong>แพ็กด้วยความใส่ใจ</strong><p>ทุกชิ้นห่อป้องกันอย่างดี พร้อมส่งตรงถึงบ้านคุณอย่างปลอดภัย</p></div></div></section>
  </div>
</template>
