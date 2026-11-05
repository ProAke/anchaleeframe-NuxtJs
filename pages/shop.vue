<script setup lang="ts">
const route = useRoute()
const { data, pending, error, refresh } = await useFetch<{ products: any[]; categories: any[]; demo: boolean; setupRequired?: boolean }>('/api/products')
const search = ref('')
const selectedCategory = ref(String(route.query.category || 'all'))
const sortBy = ref('featured')
watch(() => route.query.category, (value) => { selectedCategory.value = String(value || 'all') })
const categories = computed(() => data.value?.categories || [])
const products = computed(() => {
  let result = [...(data.value?.products || [])]
  if (selectedCategory.value !== 'all') {
    const selected = categories.value.find((category: any) => category.slug === selectedCategory.value)
    result = result.filter((product: any) => product.categoryId === selected?.id || product.categorySlug === selectedCategory.value || product.category === selected?.name)
  }
  const value = search.value.trim().toLowerCase()
  if (value) result = result.filter((product: any) => `${product.name} ${product.subtitle} ${product.sku}`.toLowerCase().includes(value))
  if (sortBy.value === 'price-low') result.sort((a: any, b: any) => a.price - b.price)
  if (sortBy.value === 'price-high') result.sort((a: any, b: any) => b.price - a.price)
  if (sortBy.value === 'name') result.sort((a: any, b: any) => a.name.localeCompare(b.name, 'th'))
  return result
})
</script>

<template>
  <div class="shop-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>สินค้ากรอบรูป</span></div>
    <section class="shop-intro"><div><span class="section-kicker">ANCHALEE FRAME · CATALOG</span><h1>สินค้าและกรอบรูป<br><em>จากโรงงานอัญชลี</em></h1><p>เลือกชมกรอบสำเร็จรูป กรอบไม้แท้ กรอบลอย และภาพตกแต่ง<br class="desktop-only"> รายละเอียดและราคาอ้างอิงจากรายการสินค้าจริงของร้าน</p></div><div class="shop-intro-stamp"><span>กรอบรูป</span><strong>Made<br>with care</strong><span>โรงงานอัญชลี</span></div></section>
    <div class="shop-toolbar"><div class="shop-filters"><button class="filter-pill" :class="{ active: selectedCategory === 'all' }" @click="selectedCategory = 'all'">สินค้าทั้งหมด <span>{{ data?.products?.length || 0 }}</span></button><button v-for="category in categories" :key="category.slug" class="filter-pill" :class="{ active: selectedCategory === category.slug }" @click="selectedCategory = category.slug">{{ category.name }} <span>{{ category.count }}</span></button></div><div class="shop-controls"><label class="shop-search"><AppIcon name="search" :size="17"/><input v-model="search" type="search" placeholder="ค้นหาชื่อหรือรหัสสินค้า..." aria-label="ค้นหาสินค้า"></label><label class="sort-control"><span>เรียงตาม</span><select v-model="sortBy"><option value="featured">แนะนำ</option><option value="price-low">ราคา: ต่ำไปสูง</option><option value="price-high">ราคา: สูงไปต่ำ</option><option value="name">ชื่อสินค้า</option></select><AppIcon name="chevron-down" :size="14"/></label></div></div>
    <div v-if="pending" class="loading-products">กำลังโหลดสินค้า...</div>
    <div v-else-if="error" class="empty-state"><AppIcon name="alert" :size="28"/><strong>โหลดรายการสินค้าไม่สำเร็จ</strong><p>กรุณาลองใหม่อีกครั้ง</p><button class="button button-outline" @click="refresh()">ลองอีกครั้ง</button></div>
    <div v-else-if="data?.setupRequired" class="empty-state"><AppIcon name="database" :size="28"/><strong>ระบบสินค้ากำลังเตรียมพร้อม</strong><p>กรุณาติดต่อร้านเพื่อสอบถามข้อมูลสินค้าและการสั่งซื้อ</p><a class="button button-primary" href="tel:0860669103">โทร 086-066-9103</a></div>
    <div v-else-if="products.length" class="product-grid shop-product-grid"><ProductCard v-for="product in products" :key="product.id" :product="product"/></div>
    <div v-else class="empty-state"><AppIcon name="search" :size="28"/><strong>ยังไม่พบสินค้าที่ตรงกับการค้นหา</strong><p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p><button class="button button-outline" @click="search = ''; selectedCategory = 'all'">ล้างตัวกรอง</button></div>
    <section class="shipping-promo"><span class="promo-icon"><AppIcon name="message-circle" :size="22"/></span><div><strong>ต้องการกรอบขนาดพิเศษหรือสั่งซื้อจำนวนมาก?</strong><p>ติดต่อทีมงานเพื่อสอบถามราคา สต็อก และค่าจัดส่งก่อนยืนยันการสั่งซื้อ</p></div><a href="https://lin.ee/USvuiWP" target="_blank" rel="noopener" class="button button-dark">สอบถามทาง LINE <AppIcon name="arrow-up-right" :size="15" /></a></section>
  </div>
</template>
