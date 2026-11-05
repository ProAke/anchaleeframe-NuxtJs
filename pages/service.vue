<script setup lang="ts">
const services = [
  { icon: 'frame', title: 'กรอบรูปสั่งทำ', text: 'รับทำกรอบรูปตามแบบและขนาดที่ต้องการ ทั้งกรอบไม้ กรอบหลุยส์ และกรอบตกแต่ง' },
  { icon: 'heart', title: 'กรอบแต่งงานและกรอบลอย', text: 'งานกรอบสำหรับภาพแต่งงาน ภาพของขวัญ กรอบลอย และงานเรซิ่น' },
  { icon: 'image', title: 'งานภาพและงานพิมพ์', text: 'บริการงานภาพ พิมพ์ภาพลงผ้าใบแคนวาส และงานโฟโต้ตามความต้องการ' },
  { icon: 'refresh', title: 'งานภาพเก่าและงานติดตั้ง', text: 'สอบถามบริการปรับปรุงภาพเดิม และงานติดตั้งกรอบรูปสำหรับโครงการ' },
  { icon: 'graduation-cap', title: 'กรอบประกาศและงานองค์กร', text: 'กรอบประกาศนียบัตร งานสถาบันการศึกษา โรงแรม และโครงการต่าง ๆ' },
  { icon: 'boxes', title: 'จำหน่ายปลีก–ส่ง', text: 'กรอบสำเร็จรูป อุปกรณ์กรอบรูป ภาพตกแต่ง และสินค้าหลากหลายขนาด' },
]
</script>

<template>
  <div class="info-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>บริการลูกค้า</span></div>
    <section class="info-hero"><div><span class="section-kicker">ANCHALEE FRAME · SERVICES</span><h1>เรื่องกรอบรูป<br><em>ปรึกษาอัญชลีได้</em></h1><p>โรงงานผลิตและจำหน่ายกรอบรูปปลีก–ส่ง พร้อมบริการกรอบสั่งทำและงานภาพ</p></div><span class="info-hero-icon"><AppIcon name="headphones" :size="34"/></span></section>
    <div class="info-section-heading"><div><span class="section-kicker">WHAT WE DO</span><h2>บริการของอัญชลีกรอบรูป</h2><p>แจ้งขนาด ภาพตัวอย่าง และจำนวนที่ต้องการ เพื่อให้ทีมงานช่วยประเมินงาน</p></div></div>
    <div class="service-grid"><article v-for="(service, index) in services" :key="service.title" class="info-card service-card"><span class="service-index">0{{ index + 1 }}</span><span class="info-card-icon"><AppIcon :name="service.icon" :size="20"/></span><h2>{{ service.title }}</h2><p>{{ service.text }}</p></article></div>
    <section class="contact-strip"><div><span class="section-kicker">TALK TO THE FRAME TEAM</span><strong>มีขนาดหรือแบบในใจแล้ว?</strong><small>ส่งรูปและรายละเอียดให้ทีมงานเพื่อสอบถามราคาและระยะเวลาดำเนินการ</small></div><div><a class="button button-primary" href="tel:0860669103"><AppIcon name="phone" :size="16"/> 086-066-9103</a><a class="button button-outline" href="https://lin.ee/USvuiWP" target="_blank" rel="noopener">ติดต่อผ่าน LINE <AppIcon name="arrow-up-right" :size="14"/></a></div></section>
  </div>
</template>
