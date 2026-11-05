<script setup lang="ts">
import type { CartProduct } from '~/composables/useCart'

const props = defineProps<{ product: CartProduct; badge?: string }>()
const cart = useCart()
const toast = useToast()

function addToCart() {
  if (!cart.add(props.product)) {
    toast.show('สินค้าหมดชั่วคราว', 'info')
    return
  }
  toast.show('เพิ่มสินค้าในตะกร้าแล้ว')
}
</script>

<template>
  <article class="product-card">
    <NuxtLink class="product-card-image" :to="`/products/${product.slug}`" :aria-label="`ดูสินค้า ${product.name}`">
      <ProductArtwork :image-key="product.imageKey" :image-url="product.imageUrl" compact />
      <span v-if="badge" class="product-tag">{{ badge }}</span>
      <span v-else-if="product.compareAtPrice && product.compareAtPrice > product.price" class="product-tag product-tag-sale">SALE</span>
    </NuxtLink>
    <div class="product-card-info">
      <div class="product-card-meta"><span>{{ product.category || 'กรอบรูป' }}</span><span class="product-card-sku">{{ product.sku }}</span></div>
      <NuxtLink class="product-card-name" :to="`/products/${product.slug}`">{{ product.name }}</NuxtLink>
      <p class="product-card-subtitle">{{ product.subtitle }}</p>
      <div class="product-card-bottom">
        <div class="product-prices"><strong>฿{{ formatBaht(product.price) }}</strong><del v-if="product.compareAtPrice && product.compareAtPrice > product.price">฿{{ formatBaht(product.compareAtPrice) }}</del></div>
        <button class="icon-add" :disabled="product.stock < 1" :aria-label="`เพิ่ม ${product.name} ลงตะกร้า`" @click="addToCart"><AppIcon name="plus" :size="18" /></button>
      </div>
    </div>
  </article>
</template>
