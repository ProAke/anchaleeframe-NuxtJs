<script setup lang="ts">
const { data: publicSettings } = await useFetch<{ settings: { supportEmail: string; supportPhone: string; lineUrl: string } }>('/api/store-settings')
const supportEmail = computed(() => publicSettings.value?.settings?.supportEmail?.trim() || '')
const supportPhone = computed(() => publicSettings.value?.settings?.supportPhone || '086-066-9103')
const supportPhoneLink = computed(() => supportPhone.value.replaceAll(' ', '').replaceAll('-', ''))
const lineUrl = computed(() => publicSettings.value?.settings?.lineUrl || 'https://lin.ee/USvuiWP')
</script>

<template>
  <footer class="store-footer">
    <div class="footer-main">
      <div class="footer-brand">
        <BrandLogo class="footer-brand-lockup" />
        <p>โรงงานผลิตและจำหน่ายกรอบรูปปลีก–ส่ง<br>รับทำกรอบรูปตามแบบและขนาดที่ต้องการ</p>
        <div class="footer-social"><a :href="lineUrl" target="_blank" rel="noopener" aria-label="ติดต่อผ่าน LINE"><AppIcon name="message-circle" :size="17" /></a><a :href="`tel:${supportPhoneLink}`" aria-label="โทรศัพท์"><AppIcon name="phone" :size="17" /></a><a v-if="supportEmail" :href="`mailto:${supportEmail}`" aria-label="อีเมล"><AppIcon name="mail" :size="17" /></a><NuxtLink to="/admin/login" aria-label="ระบบจัดการ"><AppIcon name="shield" :size="17" /></NuxtLink></div>
      </div>
      <div class="footer-column"><strong>สินค้า</strong><NuxtLink to="/shop">สินค้าทั้งหมด</NuxtLink><NuxtLink to="/shop?category=ready-frames">กรอบสำเร็จรูป</NuxtLink><NuxtLink to="/shop?category=wooden-frames">กรอบไม้แท้</NuxtLink><NuxtLink to="/shop?category=floating-frames">กรอบลอย</NuxtLink><NuxtLink to="/shop?category=decorative-art">ภาพและของแต่งบ้าน</NuxtLink></div>
      <div class="footer-column"><strong>บริการ</strong><NuxtLink to="/gallery">แกลเลอรีผลงาน</NuxtLink><NuxtLink to="/promotions">โปรโมชั่น</NuxtLink><NuxtLink to="/shipping">การจัดส่ง</NuxtLink><NuxtLink to="/stores">ร้านและสาขา</NuxtLink><NuxtLink to="/track">ติดตามพัสดุ</NuxtLink></div>
      <div class="footer-note"><span class="footer-note-icon"><AppIcon name="map-pin" :size="21" /></span><strong>สำนักงานใหญ่และโรงงาน</strong><p>578 ม.2 ถ.ประชาอุทิศแยก 2 (NP) ซ.แสงศิริ ต.บ้านคลองสวน อ.พระสมุทรเจดีย์ จ.สมุทรปราการ 10290</p><a href="https://www.google.com/maps/place/%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%9C%E0%B8%A5%E0%B8%B4%E0%B8%95%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B+(+%E0%B8%AD%E0%B8%B1%E0%B8%8D%E0%B8%8A%E0%B8%A5%E0%B8%B5%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B+)/@13.605403,100.4990889,20.65z" target="_blank" rel="noopener">เปิดแผนที่ <AppIcon name="arrow-up-right" :size="13" /></a></div>
    </div>
    <div class="footer-bottom"><span>© {{ new Date().getFullYear() }} บริษัท อัญชลีกรอบรูป จำกัด</span><span><a :href="`tel:${supportPhoneLink}`">{{ supportPhone }}</a> · LINE @acl2012</span></div>
  </footer>
</template>
