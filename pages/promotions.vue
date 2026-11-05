<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/products')
const deals = computed(() => (data.value?.products || []).filter((product: any) => (product.compareAtPrice && product.compareAtPrice > product.price) || product.sku.startsWith('AF22-01')))
</script>

<template>
  <div class="info-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>โปรโมชั่น</span></div>
    <section class="info-hero promo-hero"><div><span class="section-kicker">ANCHALEE FRAME · SPECIAL PRICE</span><h1>โปรโมชั่น<br><em>จากรายการสินค้าจริง</em></h1><p>สินค้าที่มีราคาพิเศษและรายการโปรโมชั่นอ้างอิงจากเว็บไซต์อัญชลีกรอบรูป</p></div><span class="promo-hero-mark"><AppIcon name="sparkles" :size="28"/><strong>ราคาพิเศษ</strong></span></section>
    <div class="info-section-heading"><div><span class="section-kicker">ราคาพิเศษประจำรายการ</span><h2>เลือกชมสินค้าโปรโมชั่น</h2></div><NuxtLink class="text-link" to="/shop">ดูสินค้าทั้งหมด <AppIcon name="arrow-right" :size="15"/></NuxtLink></div>
    <div v-if="pending" class="loading-products">กำลังโหลดโปรโมชั่น...</div>
    <div v-else-if="error" class="empty-state"><AppIcon name="alert" :size="26"/><strong>โหลดรายการสินค้าไม่สำเร็จ</strong><button class="button button-outline" @click="refresh()">ลองอีกครั้ง</button></div>
    <div v-else-if="deals.length" class="product-grid shop-product-grid"><ProductCard v-for="product in deals" :key="product.id" :product="product" badge="โปรโมชั่น"/></div>
    <div v-else class="empty-state"><AppIcon name="tag" :size="26"/><strong>ขณะนี้ไม่มีรายการโปรโมชั่น</strong><p>เลือกชมสินค้าทั้งหมด หรือสอบถามข้อเสนอพิเศษกับทีมงาน</p><NuxtLink class="button button-outline" to="/shop">เลือกชมสินค้า</NuxtLink></div>
    <div class="shipping-estimate-note promo-note"><AppIcon name="info" :size="16"/><span>ราคาต่อชิ้นและราคาแบบยกชุดอาจต่างกัน กรุณาตรวจสอบราคา สต็อก และค่าจัดส่งกับร้านก่อนยืนยันคำสั่งซื้อ</span></div>
  </div>
</template>
