<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { data, pending, error, refresh } = await useFetch<any>('/api/admin/settings', { server: false, retry: false })
const toast = useToast()
const saving = ref(false)
const formError = ref('')
const form = reactive({
  storeName: '', supportEmail: '', supportPhone: '', announcementText: '', lineUrl: '',
  promptPayEnabled: false, promptPayId: '',
  bankTransferEnabled: false, bankName: '', bankAccountName: '', bankAccountNumber: '',
  otherPaymentEnabled: false, otherPaymentName: '', otherPaymentInstructions: '', otherPaymentUrl: '',
  companyTruckEnabled: true, companyTruckFee: 150, companyTruckFreeThreshold: 10000,
  privateCarrierEnabled: true, privateCarrierFee: 120,
})
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
            <div class="settings-section-heading"><span class="settings-section-icon settings-shipping-icon"><AppIcon name="truck" :size="19"/></span><div><h2>การจัดส่งและชำระเงิน</h2><p>กำหนดช่องทางที่ลูกค้าเห็นในหน้า checkout</p></div></div>
            <form class="admin-form settings-form" @submit.prevent="saveSettings">
              <div class="settings-subsection"><strong>ตัวเลือกการจัดส่ง</strong><small>ราคาเป็นค่าประมาณ ลูกค้าจะเห็นหมายเหตุให้ร้านยืนยันยอดจริง</small></div>
              <div class="settings-config-grid">
                <label class="settings-toggle"><input v-model="form.companyTruckEnabled" type="checkbox"><span><strong>เปิดรถขนส่งของร้าน</strong><small>เลือกจัดส่งโดยรถบริษัทได้ใน checkout</small></span></label>
                <label class="field-label">ค่ารถบริษัท (บาท)<input v-model.number="form.companyTruckFee" type="number" min="0" max="100000" step="1"></label>
                <label class="field-label">ยอดส่งฟรีในกรุงเทพฯ/ปริมณฑล (บาท)<input v-model.number="form.companyTruckFreeThreshold" type="number" min="0" max="100000" step="1"><small>ตั้ง 0 เพื่อไม่ใช้เกณฑ์ส่งฟรี</small></label>
                <label class="settings-toggle"><input v-model="form.privateCarrierEnabled" type="checkbox"><span><strong>เปิดบริษัทขนส่งเอกชน</strong><small>ใช้ขนส่งพัสดุสำหรับพื้นที่ต่าง ๆ</small></span></label>
                <label class="field-label">ค่าขนส่งเอกชนโดยประมาณ (บาท)<input v-model.number="form.privateCarrierFee" type="number" min="0" max="100000" step="1"></label>
              </div>

              <div class="settings-subsection"><strong>PromptPay QR</strong><small>QR จะระบุยอดคำสั่งซื้อ และแสดงหลังยืนยัน checkout</small></div>
              <div class="settings-config-grid">
                <label class="settings-toggle settings-config-wide"><input v-model="form.promptPayEnabled" type="checkbox"><span><strong>เปิดรับชำระผ่าน PromptPay</strong><small>ระบบจะสร้าง QR แบบระบุยอดโดยอัตโนมัติ</small></span></label>
                <label class="field-label settings-config-wide">PromptPay ID<input v-model="form.promptPayId" inputmode="numeric" maxlength="32" placeholder="เบอร์มือถือ 10 หลัก, เลขประจำตัว/ภาษี 13 หลัก หรือ e-Wallet 15 หลัก"><small>ใส่เฉพาะ ID ของร้าน ไม่ต้องใส่รหัสลับหรือ PIN</small></label>
              </div>

              <div class="settings-subsection"><strong>โอนเงินผ่านธนาคาร</strong><small>ข้อมูลบัญชีด้านล่างจะแสดงให้ลูกค้าทราบหลังสั่งซื้อ</small></div>
              <div class="settings-config-grid">
                <label class="settings-toggle settings-config-wide"><input v-model="form.bankTransferEnabled" type="checkbox"><span><strong>เปิดรับโอนเงิน</strong><small>สถานะชำระเงินยังต้องให้เจ้าหน้าที่ตรวจสอบ</small></span></label>
                <label class="field-label">ชื่อธนาคาร<input v-model="form.bankName" maxlength="120" placeholder="ธนาคาร"></label>
                <label class="field-label">ชื่อบัญชี<input v-model="form.bankAccountName" maxlength="160" placeholder="ชื่อบัญชีผู้รับเงิน"></label>
                <label class="field-label settings-config-wide">เลขที่บัญชี<input v-model="form.bankAccountNumber" maxlength="80" inputmode="numeric" placeholder="เลขที่บัญชีสำหรับรับโอน"></label>
              </div>

              <div class="settings-subsection"><strong>ช่องทางอื่น</strong><small>เช่น e-wallet หรือบริการชำระเงินที่ร้านจัดการเอง</small></div>
              <div class="settings-config-grid">
                <label class="settings-toggle settings-config-wide"><input v-model="form.otherPaymentEnabled" type="checkbox"><span><strong>เปิดช่องทางชำระเงินอื่น</strong><small>ระบุชื่อช่องทางและขั้นตอนให้ลูกค้าทำตาม</small></span></label>
                <label class="field-label">ชื่อช่องทาง<input v-model="form.otherPaymentName" maxlength="100" placeholder="เช่น e-Wallet"></label>
                <label class="field-label">ลิงก์ชำระเงิน (ไม่บังคับ)<input v-model="form.otherPaymentUrl" type="url" maxlength="500" placeholder="https://..."></label>
                <label class="field-label settings-config-wide">คำแนะนำการชำระ<textarea v-model="form.otherPaymentInstructions" rows="3" maxlength="1000" placeholder="แจ้งขั้นตอนการชำระเงินและวิธีส่งหลักฐาน"></textarea></label>
              </div>
              <p class="settings-rule-hint"><AppIcon name="shield" :size="15"/> PromptPay ID และบัญชีธนาคารจะถูกแสดงแก่ลูกค้าโดยตั้งใจ แต่ไม่เก็บข้อมูลลับในหน้าตั้งค่านี้ การยืนยันยอดยังเป็นแบบเจ้าหน้าที่จนกว่าจะเชื่อมต่อ gateway/webhook จริง</p>
              <p v-if="formError" class="form-error"><AppIcon name="alert" :size="16"/> {{ formError }}</p>
              <div class="settings-save-row"><span><AppIcon name="shield" :size="15"/> ค่าชำระเงินและจัดส่ง{{ data?.demo ? ' ชั่วคราวในโหมดสาธิต' : ' บันทึกในฐานข้อมูล' }}</span><button class="button button-primary" type="submit" :disabled="saving"><AppIcon :name="saving ? 'loader' : 'save'" :size="16" :class="{ spinning: saving }"/> {{ saving ? 'กำลังบันทึก...' : 'บันทึกช่องทาง' }}</button></div>
            </form>
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
