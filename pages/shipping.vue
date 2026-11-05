<script setup lang="ts">
const mapUrl = 'https://www.google.com/maps/place/%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%9C%E0%B8%A5%E0%B8%B4%E0%B8%95%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B+(+%E0%B8%AD%E0%B8%B1%E0%B8%8D%E0%B8%8A%E0%B8%A5%E0%B8%B5%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B+)/@13.605403,100.4990889,20.65z'
</script>

<template>
  <div class="info-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>บริการจัดส่ง</span></div>
    <section class="info-hero"><div><span class="section-kicker">ANCHALEE FRAME · DELIVERY</span><h1>จัดส่งและรับสินค้า<br><em>สอบถามได้ตามงานจริง</em></h1><p>กรอบรูปมีหลายขนาดและน้ำหนัก ค่าขนส่งและวิธีจัดส่งจึงอาจเปลี่ยนตามสินค้าและพื้นที่</p></div><span class="info-hero-icon"><AppIcon name="truck" :size="34"/></span></section>
    <div class="info-card-grid shipping-steps">
      <article class="info-card"><span class="info-card-icon"><AppIcon name="shopping-bag" :size="20"/></span><span class="section-kicker">01 · ORDER</span><h2>ส่งคำสั่งซื้อ</h2><p>เพิ่มสินค้าลงตะกร้าและระบุข้อมูลผู้รับ ทีมงานจะตรวจสอบรายการและสต็อกอีกครั้ง</p></article>
      <article class="info-card"><span class="info-card-icon"><AppIcon name="message-circle" :size="20"/></span><span class="section-kicker">02 · CONFIRM</span><h2>ยืนยันค่าจัดส่ง</h2><p>ค่าจัดส่งในหน้าสั่งซื้อเป็นยอดประเมิน ทีมงานยืนยันค่าใช้จ่ายตามขนาดสินค้าและปลายทางก่อนจัดส่ง</p></article>
      <article class="info-card"><span class="info-card-icon"><AppIcon name="package-check" :size="20"/></span><span class="section-kicker">03 · TRACK</span><h2>รับเลขพัสดุ</h2><p>เมื่อบันทึกการจัดส่งแล้ว สามารถตรวจสอบสถานะและเลขติดตามได้ที่หน้าติดตามพัสดุ</p><NuxtLink class="text-link" to="/track">ติดตามคำสั่งซื้อ <AppIcon name="arrow-right" :size="14"/></NuxtLink></article>
    </div>
    <section class="policy-card"><div class="policy-heading"><span class="info-card-icon"><AppIcon name="info" :size="20"/></span><div><span class="section-kicker">PUBLISHED DELIVERY TERMS</span><h2>เงื่อนไขจากเว็บไซต์อัญชลีกรอบรูป</h2></div></div><ul><li>เว็บไซต์เดิมระบุบริการจัดส่งฟรีสำหรับยอดสั่งซื้อครบ ฿10,000 ในกรุงเทพฯ และปริมณฑล</li><li>ปลายทางต่างจังหวัดมีบริการขนส่ง โดยค่าจัดส่งขึ้นอยู่กับพื้นที่และขนาดสินค้า</li><li>โปรดติดต่อร้านเพื่อยืนยันเงื่อนไขปัจจุบัน โดยเฉพาะสินค้ากรอบขนาดใหญ่หรือสั่งซื้อจำนวนมาก</li><li>หากพัสดุเสียหายระหว่างขนส่ง กรุณาถ่ายภาพสินค้าและบรรจุภัณฑ์ไว้ แล้วติดต่อร้านทันทีเพื่อประสานงาน</li></ul><p class="policy-disclaimer">เงื่อนไขที่แสดงนี้อ้างอิงข้อมูลที่เผยแพร่บนเว็บไซต์เดิม ณ เวลาจัดทำหน้าเว็บ และอาจเปลี่ยนแปลงได้ ค่าที่แสดงในตะกร้าเป็นเพียงยอดประเมิน ยังไม่ใช่ใบเสนอราคาขนส่ง</p></section>
    <section class="contact-strip"><div><span class="section-kicker">NEED A DELIVERY QUOTE?</span><strong>สอบถามพื้นที่และค่าจัดส่งกับทีมงาน</strong></div><div><a class="button button-primary" href="tel:0860669103"><AppIcon name="phone" :size="16"/> 086-066-9103</a><a class="button button-outline" href="https://lin.ee/USvuiWP" target="_blank" rel="noopener">LINE @acl2012 <AppIcon name="arrow-up-right" :size="14"/></a></div></section>
    <p class="info-address"><AppIcon name="map-pin" :size="16"/> สำนักงานใหญ่: 578 ม.2 ถ.ประชาอุทิศแยก 2 ซ.แสงศิริ ต.บ้านคลองสวน อ.พระสมุทรเจดีย์ จ.สมุทรปราการ 10290 · <a :href="mapUrl" target="_blank" rel="noopener">เปิดแผนที่</a></p>
  </div>
</template>
