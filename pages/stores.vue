<script setup lang="ts">
const mapUrl = 'https://www.google.com/maps/place/%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%9C%E0%B8%A5%E0%B8%B4%E0%B8%95%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B+(+%E0%B8%AD%E0%B8%B1%E0%B8%8D%E0%B8%8A%E0%B8%A5%E0%B8%B5%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B+)/@13.605403,100.4990889,20.65z'
const branches = ['ไทวัสดุ บางบัวทอง (บางใหญ่)', 'ไทวัสดุ ปทุมธานี (แยกบางคูวัด)', 'ไทวัสดุ บางนา (ใกล้เมกาบางนา)', 'เซ็นทรัลเวสต์เกต (บางใหญ่)', 'แม็คโคร บางบอน']
</script>

<template>
  <div class="info-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>ร้านและสาขา</span></div>
    <section class="info-hero"><div><span class="section-kicker">ANCHALEE FRAME · FIND US</span><h1>โรงงานและร้านอัญชลี<br><em>ติดต่อก่อนเข้ารับสินค้า</em></h1><p>สอบถามสต็อก เวลาทำการ และการรับสินค้าหน้าร้านกับทีมงานก่อนเดินทาง</p></div><span class="info-hero-icon"><AppIcon name="map-pin" :size="34"/></span></section>
    <section class="head-office-card"><div class="head-office-icon"><AppIcon name="store" :size="26"/></div><div class="head-office-copy"><span class="section-kicker">HEAD OFFICE · FACTORY</span><h2>บริษัท อัญชลีกรอบรูป จำกัด (สำนักงานใหญ่)</h2><p>578 หมู่ 2 ถนนประชาอุทิศแยก 2 (NP) ซอยแสงศิริ<br>ตำบลบ้านคลองสวน อำเภอพระสมุทรเจดีย์ จังหวัดสมุทรปราการ 10290</p><div class="phone-links"><a href="tel:0958028886">095-802-8886</a><a href="tel:0860669103">086-066-9103</a><a href="tel:0814889162">081-488-9162</a></div><span class="branch-line">LINE ID: @acl2012</span></div><div class="head-office-actions"><a class="button button-primary" :href="mapUrl" target="_blank" rel="noopener"><AppIcon name="map-pin" :size="16"/> เปิด Google Maps <AppIcon name="arrow-up-right" :size="14"/></a><a class="button button-outline" href="tel:0860669103"><AppIcon name="phone" :size="16"/> โทรสอบถาม</a></div></section>
    <div class="info-section-heading"><div><span class="section-kicker">RETAIL PARTNERS</span><h2>จุดจำหน่ายที่ระบุบนเว็บไซต์เดิม</h2><p>ตำแหน่ง เวลาเปิดบริการ และสต็อกของแต่ละสาขาอาจต่างกัน</p></div></div>
    <div class="branch-grid"><article v-for="(branch, index) in branches" :key="branch" class="branch-card"><span class="branch-number">0{{ index + 1 }}</span><span class="info-card-icon"><AppIcon name="map-pin" :size="18"/></span><h3>{{ branch }}</h3><p>โปรดสอบถามสาขาและสต็อกสินค้าก่อนเข้ารับ</p><a href="tel:0860669103">โทรสำนักงานใหญ่เพื่อยืนยัน <AppIcon name="arrow-right" :size="13"/></a></article></div>
    <div class="shipping-estimate-note"><AppIcon name="info" :size="16"/><span>รายชื่อสาขาอ้างอิงจากหน้า “ร้านและสาขา” ของเว็บไซต์อัญชลีกรอบรูป รายละเอียดอาจมีการเปลี่ยนแปลง กรุณาโทรสอบถามก่อนเดินทาง</span></div>
  </div>
</template>
