<script setup lang="ts">
const { data, pending, error } = await useFetch<{ products: any[]; categories: any[]; demo: boolean }>('/api/products')
const projects = computed(() => data.value?.products || [])
const slideImage = 'https://www.anchaleeframe.com/upload/slide/full/20201112111432-591406826.png'
</script>

<template>
  <div class="info-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>แกลเลอรี</span></div>
    <section class="gallery-hero"><div><span class="section-kicker">ANCHALEE FRAME · GALLERY</span><h1>แรงบันดาลใจ<br><em>จากงานกรอบรูป</em></h1><p>ชมตัวอย่างสินค้า กรอบหลายรูปแบบ และงานตกแต่งจากอัญชลีกรอบรูป</p><NuxtLink class="button button-primary" to="/shop">เลือกชมสินค้า <AppIcon name="arrow-right" :size="16"/></NuxtLink></div><img :src="slideImage" alt="ผลงานและคอลเลกชันจากอัญชลีกรอบรูป" loading="lazy" decoding="async"></section>
    <div class="info-section-heading"><div><span class="section-kicker">PRODUCT & FRAME IDEAS</span><h2>ตัวอย่างสินค้าในแคตตาล็อก</h2></div><NuxtLink class="text-link" to="/service">สอบถามงานสั่งทำ <AppIcon name="arrow-right" :size="15"/></NuxtLink></div>
    <div v-if="pending" class="loading-products">กำลังโหลดรูปภาพสินค้า...</div>
    <div v-else-if="error" class="empty-state"><AppIcon name="alert" :size="26"/><strong>โหลดแกลเลอรีไม่สำเร็จ</strong></div>
    <div v-else-if="projects.length" class="product-grid shop-product-grid"><ProductCard v-for="product in projects" :key="product.id" :product="product"/></div>
    <div v-else class="empty-state"><AppIcon name="image" :size="26"/><strong>กำลังเตรียมแกลเลอรี</strong><p>ติดต่อร้านเพื่อชมตัวอย่างงานและสอบถามงานสั่งทำ</p><NuxtLink class="button button-outline" to="/service">ติดต่อทีมงาน</NuxtLink></div>
  </div>
</template>
