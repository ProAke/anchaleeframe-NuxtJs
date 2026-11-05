<script setup lang="ts">
const { data } = await useFetch<{ products: any[]; categories: any[]; demo: boolean; setupRequired?: boolean }>('/api/products')
const products = computed(() => data.value?.products || [])
const featured = computed(() => products.value.slice(0, 4))
const featuredFrame = 'https://www.anchaleeframe.com/upload/product/img/20250618095626-844671679.png'
const mountboardFrame = 'https://www.anchaleeframe.com/upload/product/img/20250505015503-81132115.jpg'
const goldFrame = 'https://www.anchaleeframe.com/upload/product/img/20231026042833-1825560887.jpg'
</script>

<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-line" /> โรงงานผลิตกรอบรูป · อัญชลีกรอบรูป</div>
        <h1>กรอบรูปที่ใช่<br>ให้ทุกภาพ <em>มีความหมาย</em></h1>
        <p class="hero-description">เลือกกรอบสำเร็จรูป สั่งทำตามขนาด หรือค้นหาภาพตกแต่งบ้าน<br class="desktop-only"> ครบจบเรื่องกรอบรูปและงานภาพได้ที่อัญชลี</p>
        <div class="hero-actions"><NuxtLink class="button button-primary button-large" to="/shop">เลือกชมสินค้าทั้งหมด <AppIcon name="arrow-right" :size="17" /></NuxtLink><NuxtLink class="text-link" to="/shop?category=wooden-frames"><span class="play-dot"><AppIcon name="frame" :size="14" /></span> กรอบไม้แท้</NuxtLink></div>
        <div class="hero-note"><span class="hero-note-icon"><AppIcon name="ruler" :size="17" /></span><span><strong>รับทำกรอบตามขนาดและแบบที่ต้องการ</strong><small>ทักสอบถามทีมงานเพื่อรับคำแนะนำและประเมินราคา</small></span></div>
      </div>
      <div class="hero-artwork" aria-label="ตัวอย่างกรอบรูปและสินค้าจากอัญชลีกรอบรูป">
        <div class="hero-sun" />
        <div class="hero-art-label"><span>ANCHALEE FRAME · COLLECTION</span><span class="hero-label-line" /></div>
        <div class="hero-frame hero-frame-back"><ProductArtwork image-key="walnut" :image-url="goldFrame" compact /></div>
        <div class="hero-frame hero-frame-main"><ProductArtwork image-key="white" :image-url="mountboardFrame" /></div>
        <div class="hero-frame hero-frame-small"><ProductArtwork image-key="oak" :image-url="featuredFrame" compact /></div>
        <span class="hero-stamp"><span>โรงงาน</span><strong>ผลิต</strong><span>กรอบรูป</span></span>
        <span class="hero-art-caption">กรอบสำเร็จรูป · สั่งทำ · ส่งทั่วไทย</span>
        <div class="hero-vertical-note">FRAME · ART · HOME</div>
      </div>
      <div class="hero-bottomline"><span>บริษัท อัญชลีกรอบรูป จำกัด</span><span>เลือกชมคอลเลกชัน <AppIcon name="arrow-down-right" :size="15" /></span><span>สินค้า · 2026</span></div>
    </section>

    <section class="home-trust-row">
      <div><span class="trust-icon"><AppIcon name="frame" :size="20" /></span><span><strong>กรอบรูปหลากหลายแบบ</strong><small>กรอบสำเร็จรูปและงานสั่งทำ</small></span></div>
      <div><span class="trust-icon"><AppIcon name="ruler" :size="20" /></span><span><strong>เลือกขนาดได้</strong><small>ตั้งแต่ 4x6 นิ้ว ถึงงานขนาดใหญ่</small></span></div>
      <div><span class="trust-icon"><AppIcon name="package-check" :size="20" /></span><span><strong>จัดส่งทั่วประเทศ</strong><small>แพ็กสินค้าอย่างระมัดระวัง</small></span></div>
      <div class="trust-customer"><span class="trust-icon"><AppIcon name="store" :size="20" /></span><span><strong>โรงงานและหน้าร้าน</strong><small>ตรวจสอบสาขาก่อนเข้ารับสินค้า</small></span></div>
    </section>

    <section class="home-category-section page-container">
      <div class="section-heading"><div><span class="section-kicker">เลือกชมตามประเภทสินค้า</span><h2>เลือกกรอบและงานภาพที่คุณกำลังหา</h2><p>จากกรอบขนาดมาตรฐาน ไปจนถึงงานตกแต่งที่สั่งทำได้</p></div><NuxtLink class="text-link" to="/shop">ดูสินค้าทั้งหมด <AppIcon name="arrow-right" :size="16" /></NuxtLink></div>
      <div class="category-grid">
        <NuxtLink to="/shop?category=ready-frames" class="category-card category-wood"><div class="category-art category-art-wood"><div class="category-real-frame"><ProductArtwork image-key="oak" :image-url="featuredFrame" compact /></div><span class="category-sun"/></div><div class="category-info"><div><span>กรอบขนาดมาตรฐาน · พร้อมใช้งาน</span><h3>กรอบสำเร็จรูป</h3></div><span class="category-arrow"><AppIcon name="arrow-up-right" :size="17" /></span></div></NuxtLink>
        <NuxtLink to="/shop?category=wooden-frames" class="category-card category-clear"><div class="category-art category-art-clear"><div class="category-real-frame category-real-frame-tall"><ProductArtwork image-key="oak" :image-url="'https://www.anchaleeframe.com/upload/product/img/20250618094101-1161531135.png'" compact /></div></div><div class="category-info"><div><span>งานไม้แท้ · รับทำตามขนาด</span><h3>กรอบไม้แท้</h3></div><span class="category-arrow"><AppIcon name="arrow-up-right" :size="17" /></span></div></NuxtLink>
        <NuxtLink to="/shop?category=floating-frames" class="category-card category-tools"><div class="category-art category-art-tools"><div class="category-real-frame category-real-frame-wide"><ProductArtwork image-key="acrylic" :image-url="'https://www.anchaleeframe.com/upload/product/img/20250618030544-1456553882.jpg'" compact /></div><span class="tool-spark">✳</span></div><div class="category-info"><div><span>ดีไซน์โมเดิร์น · สั่งผลิตได้</span><h3>กรอบลอย</h3></div><span class="category-arrow"><AppIcon name="arrow-up-right" :size="17" /></span></div></NuxtLink>
      </div>
    </section>

    <section class="featured-section">
      <div class="page-container">
        <div class="section-heading featured-heading"><div><span class="section-kicker">สินค้าแนะนำจากหน้าร้าน</span><h2>สินค้าจริงจากอัญชลีกรอบรูป</h2><p>ราคาและรหัสสินค้าอ้างอิงจากรายการสินค้าบนเว็บไซต์เดิม</p></div><NuxtLink class="text-link" to="/shop">เลือกชมทั้งหมด <AppIcon name="arrow-right" :size="16" /></NuxtLink></div>
        <div v-if="featured.length" class="product-grid"><ProductCard v-for="product in featured" :key="product.id" :product="product" :badge="product.id === featured[0]?.id ? 'สินค้าแนะนำ' : undefined" /></div>
        <div v-else-if="data?.setupRequired" class="loading-products">ระบบสินค้าจะพร้อมใช้งานหลังเชื่อมต่อ MariaDB</div>
        <div v-else class="loading-products">กำลังจัดเตรียมสินค้าให้คุณ...</div>
      </div>
    </section>

    <section id="our-story" class="home-story page-container">
      <div class="story-art story-real-art"><div class="story-product-image"><ProductArtwork image-key="white" :image-url="mountboardFrame" /></div><span class="story-petal petal-one"/><span class="story-petal petal-two"/><span class="story-number">ANCHALEE · MADE IN THAILAND</span></div>
      <div class="story-copy"><span class="section-kicker">โรงงานผลิตกรอบรูป อัญชลี</span><h2>มีภาพที่ชอบ<br>เราช่วยหา <em>กรอบที่พอดี</em></h2><p>อัญชลีกรอบรูปจำหน่ายกรอบรูปสำเร็จรูป กรอบไม้ กรอบลอย ภาพตกแต่ง และอุปกรณ์กรอบรูป พร้อมบริการรับผลิตกรอบตามขนาด เลือกสินค้าออนไลน์หรือสอบถามทีมงานเมื่อมีความต้องการเฉพาะ</p><NuxtLink class="text-link" to="/shop">เลือกชมสินค้าและโปรโมชั่น <AppIcon name="arrow-right" :size="16" /></NuxtLink><div class="story-signature">สอบถามงานสั่งทำ <a href="tel:0860669103">086-066-9103</a></div></div>
    </section>

    <section class="newsletter-section"><div class="newsletter-inner"><div class="newsletter-mark"><AppIcon name="sparkles" :size="22" /></div><div><span class="section-kicker">ANCHALEE FRAME · CUSTOMER CARE</span><h2>มีคำถามเรื่องกรอบรูป?</h2><p>สอบถามขนาด ราคา หรือบริการจัดส่งกับทีมงานโดยตรง</p></div><div class="newsletter-form customer-service-cta"><a class="button button-dark" href="tel:0860669103"><AppIcon name="phone" :size="16"/> โทร 086-066-9103</a><a class="button button-outline" href="https://lin.ee/USvuiWP" target="_blank" rel="noopener">ติดต่อผ่าน LINE <AppIcon name="arrow-up-right" :size="15"/></a></div></div></section>

    <div class="home-footer-note"><span>ANCHALEE FRAME · FACTORY & ONLINE STORE</span><span>กรอบรูป · ภาพตกแต่ง · งานสั่งทำ</span></div>
  </div>
</template>
