<script setup lang="ts">
const cart = useCart()
const route = useRoute()
const { data: publicSettings } = await useFetch<any>('/api/store-settings', { key: 'af-store-settings', server: false, retry: false })
const { data: customerSession } = await useFetch<any>('/api/customer/session', { server: false, retry: false })
const menuOpen = ref(false)
watch(() => route.path, () => { menuOpen.value = false })
</script>

<template>
  <div class="announcement-bar">
    <span>{{ publicSettings?.settings?.announcementText || 'กรอบสำเร็จรูป · รับทำกรอบตามขนาด · จัดส่งทั่วประเทศ' }}</span>
    <NuxtLink to="/shipping">บริการจัดส่ง <AppIcon name="arrow-right" :size="13" /></NuxtLink>
  </div>
  <header class="store-header">
    <BrandLogo class="store-brand" />
    <nav class="store-nav" :class="{ 'store-nav-open': menuOpen }" aria-label="เมนูหลัก">
      <NuxtLink to="/shop">สินค้าทั้งหมด</NuxtLink>
      <NuxtLink to="/gallery">แกลเลอรี</NuxtLink>
      <NuxtLink to="/promotions">โปรโมชั่น</NuxtLink>
      <NuxtLink to="/shipping">บริการส่งพิเศษ</NuxtLink>
      <NuxtLink to="/stores">ร้านและสาขา</NuxtLink>
      <NuxtLink to="/service">บริการลูกค้า</NuxtLink>
      <NuxtLink v-if="publicSettings?.capabilities?.lineLoginEnabled" to="/account">บัญชีของฉัน</NuxtLink>
    </nav>
    <div class="store-header-actions">
      <NuxtLink v-if="publicSettings?.capabilities?.lineLoginEnabled" to="/account" class="header-account" aria-label="บัญชีของฉัน"><AppIcon :name="customerSession?.user ? 'user' : 'message-circle'" :size="18" /></NuxtLink>
      <NuxtLink to="/track" class="header-track" aria-label="ติดตามคำสั่งซื้อ"><AppIcon name="package-check" :size="18" /><span>ติดตามสินค้า</span></NuxtLink>
      <NuxtLink to="/cart" class="header-cart" aria-label="ตะกร้าสินค้า"><AppIcon name="bag" :size="20" /><span>ตะกร้า</span><b v-if="cart.count.value" class="cart-count">{{ cart.count.value > 9 ? '9+' : cart.count.value }}</b></NuxtLink>
      <button class="mobile-menu-btn" aria-label="เปิดเมนู" @click="menuOpen = !menuOpen"><AppIcon :name="menuOpen ? 'close' : 'menu'" :size="21" /></button>
    </div>
  </header>
</template>
