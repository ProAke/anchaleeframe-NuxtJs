<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { data, pending, error, refresh } = await useFetch<any>('/api/admin/settings', { server: false, retry: false })
const toast = useToast()
const saving = ref(false)
const formError = ref('')
const form = reactive({ storeName: '', supportEmail: '', supportPhone: '', announcementText: '', lineUrl: '' })
watch(() => data.value?.settings, (settings) => { if (settings) Object.assign(form, settings) }, { immediate: true })
async function saveSettings() {
  saving.value = true
  formError.value = ''
  try {
    const result = await $fetch<any>('/api/admin/settings', { method: 'PUT', body: { ...form } })
    Object.assign(form, result.settings)
    await refresh()
    toast.show('บันทึกการตั้งค่าร้านค้าแล้ว')
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || 'บันทึกการตั้งค่าไม่สำเร็จ'
  } finally { saving.value = false }
}
</script>

<template>
  <div class="admin-page-wrap">
    <div class="admin-page-heading"><div><span class="section-kicker">YOUR STORE, YOUR WAY</span><h1>ตั้งค่าร้านค้า</h1><p>จัดการข้อมูลติดต่อและข้อความที่ลูกค้าเห็นบนเว็บไซต์</p></div><NuxtLink class="button button-outline" to="/" target="_blank"><AppIcon name="external" :size="16"/> ดูหน้าร้าน</NuxtLink></div>
    <div v-if="pending" class="admin-loading-card"><span class="loading-spinner"/> กำลังโหลดการตั้งค่า...</div>
    <div v-else-if="error" class="admin-error-card"><AppIcon name="alert" :size="20"/> โหลดการตั้งค่าไม่สำเร็จ <button class="button button-outline" @click="refresh()">ลองอีกครั้ง</button></div>
    <template v-else>
      <div class="settings-layout">
        <div class="settings-main-column">
          <section class="admin-panel settings-panel">
            <div class="settings-section-heading"><span class="settings-section-icon settings-brand-icon"><AppIcon name="store" :size="19"/></span><div><h2>ข้อมูลร้านค้า</h2><p>ข้อมูลติดต่อและประกาศที่แสดงบนหน้าร้าน</p></div></div>
            <form class="admin-form settings-form" @submit.prevent="saveSettings">
              <div class="form-grid">
                <label class="field-label field-full">ชื่อร้านค้า <span>*</span><input v-model="form.storeName" required maxlength="120" placeholder="อัญชลีกรอบรูป"></label>
                <label class="field-label">อีเมลสำหรับลูกค้า <small>ไม่บังคับ</small><input v-model="form.supportEmail" type="email" maxlength="190" placeholder="เว้นว่างหากไม่มีอีเมลกลาง"></label>
                <label class="field-label">เบอร์ติดต่อ<input v-model="form.supportPhone" maxlength="40" placeholder="086-066-9103"></label>
                <label class="field-label field-full">ข้อความประกาศหน้าร้าน <small>สูงสุด 180 ตัวอักษร</small><input v-model="form.announcementText" maxlength="180" placeholder="กรอบสำเร็จรูป · รับทำกรอบตามขนาด · จัดส่งทั่วประเทศ"></label>
                <label class="field-label field-full">ลิงก์ LINE สำหรับติดต่อ<input v-model="form.lineUrl" type="url" maxlength="240" placeholder="https://lin.ee/..."><small>ลิงก์ HTTPS จะเปิดในหน้าต่างใหม่</small></label>
              </div>
              <p v-if="formError" class="form-error"><AppIcon name="alert" :size="16"/> {{ formError }}</p>
              <div class="settings-save-row"><span><AppIcon name="shield" :size="15"/> บันทึกลง{{ data?.demo ? 'เซิร์ฟเวอร์สาธิตชั่วคราว' : 'ฐานข้อมูล MariaDB' }}</span><button class="button button-primary" type="submit" :disabled="saving"><AppIcon :name="saving ? 'loader' : 'save'" :size="16" :class="{ spinning: saving }"/> {{ saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}</button></div>
            </form>
          </section>
          <section class="admin-panel settings-panel">
            <div class="settings-section-heading"><span class="settings-section-icon settings-shipping-icon"><AppIcon name="truck" :size="19"/></span><div><h2>การจัดส่งและชำระเงิน</h2><p>แนวทางที่อ้างอิงจากเว็บไซต์อัญชลีกรอบรูป</p></div></div>
            <div class="settings-rules">
              <div><span><AppIcon name="gift" :size="16"/> เงื่อนไขจัดส่งฟรีที่เว็บไซต์เดิมระบุ</span><strong>ครบ ฿10,000 · กรุงเทพฯ/ปริมณฑล</strong></div>
              <div><span><AppIcon name="map-pin" :size="16"/> ต่างจังหวัดและกรอบขนาดใหญ่</span><strong>ยืนยันค่าขนส่งตามพื้นที่/ขนาด</strong></div>
              <div><span><AppIcon name="receipt" :size="16"/> ยอดที่แสดงใน checkout</span><strong>ค่าจัดส่งประเมิน ฿80</strong></div>
              <div><span><AppIcon name="payment" :size="16"/> วิธีชำระเงินในระบบ</span><strong>ปลายทาง · โอนเงิน (ต้องตั้งค่าบัญชี)</strong></div>
              <div><span><AppIcon name="truck" :size="16"/> เลขติดตามพัสดุ</span><strong>บันทึกโดยทีมงานในเมนูการจัดส่ง</strong></div>
            </div>
            <p class="settings-rule-hint"><AppIcon name="alert" :size="15"/> ค่าจัดส่งใน checkout เป็นยอดประมาณการ ยังไม่ตรวจสิทธิ์ส่งฟรีตามจังหวัดอัตโนมัติ ทีมงานควรยืนยันยอดจริงกับลูกค้าก่อนจัดส่ง และตั้งค่าบัญชีรับโอน/ขนส่งก่อนเปิดระบบจริง</p>
          </section>
        </div>
        <aside class="settings-side-column">
          <section class="admin-panel store-preview-card"><span class="section-kicker">LIVE STORE PREVIEW</span><div class="store-preview-logo"><BrandLogo compact/><strong>{{ form.storeName || 'อัญชลีกรอบรูป' }}</strong></div><div class="store-preview-announcement"><AppIcon name="sparkles" :size="15"/>{{ form.announcementText || 'ข้อความประกาศร้านค้า' }}</div><div class="store-preview-contact"><span v-if="form.supportEmail"><AppIcon name="mail" :size="14"/> {{ form.supportEmail }}</span><span><AppIcon name="phone" :size="14"/> {{ form.supportPhone || 'เบอร์ติดต่อ' }}</span><span><AppIcon name="message-circle" :size="14"/> LINE @acl2012</span></div><NuxtLink to="/" target="_blank" class="text-link">เปิดหน้าร้าน <AppIcon name="arrow-up-right" :size="14"/></NuxtLink></section>
          <section class="admin-panel settings-status-card"><span class="section-kicker">SYSTEM STATUS</span><div class="system-status-row"><span class="system-status-icon"><AppIcon name="database" :size="16"/></span><span><strong>ฐานข้อมูล</strong><small>{{ data?.demo ? 'โหมดสาธิต — ไม่ถาวร' : 'MariaDB · เชื่อมต่อแล้ว' }}</small></span><i class="system-status-dot" :class="{ 'system-status-demo': data?.demo }"/></div><div class="system-status-row"><span class="system-status-icon"><AppIcon name="shield" :size="16"/></span><span><strong>บัญชีผู้ดูแล</strong><small>เข้าสู่ระบบแบบ session cookie</small></span><i class="system-status-dot"/></div><div class="system-status-row"><span class="system-status-icon"><AppIcon name="boxes" :size="16"/></span><span><strong>ระบบสต็อก</strong><small>บันทึกการตัด/เพิ่มสต็อกและเลขพัสดุ</small></span><i class="system-status-dot"/></div></section>
          <section class="settings-help-card"><span class="settings-help-icon"><AppIcon name="headphones" :size="20"/></span><div><strong>ก่อนเปิดร้านจริง</strong><p>ตรวจสอบสต็อก ราคา ค่าขนส่ง บัญชีรับชำระ และข้อมูลติดต่อในระบบ</p><NuxtLink to="/admin/products">ตรวจสอบสินค้า <AppIcon name="arrow-right" :size="13"/></NuxtLink></div></section>
        </aside>
      </div>
    </template>
  </div>
</template>
