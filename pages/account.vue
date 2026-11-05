<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const { data, pending, refresh } = await useFetch<any>('/api/customer/session', { server: false, retry: false })
const saving = ref(false)
const loggingOut = ref(false)
const errorMessage = ref('')
const form = reactive({ phone: '', address: '' })
const user = computed(() => data.value?.user || null)
const loginEnabled = computed(() => Boolean(data.value?.lineLoginEnabled))
watch(user, (account) => {
  if (!account) return
  form.phone = account.phone || ''
  form.address = account.address || ''
}, { immediate: true })

async function saveProfile() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/customer/profile', { method: 'PUT', body: { phone: form.phone, address: form.address } })
    await refresh()
    toast.show('บันทึกข้อมูลจัดส่งแล้ว')
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'บันทึกข้อมูลไม่สำเร็จ'
  } finally { saving.value = false }
}

async function logout() {
  loggingOut.value = true
  try {
    await $fetch('/api/customer/logout', { method: 'POST' })
    await refresh()
    form.phone = ''
    form.address = ''
    toast.show('ออกจากระบบแล้ว')
  } catch { toast.show('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่', 'error') }
  finally { loggingOut.value = false }
}
</script>

<template>
  <div class="account-page page-container">
    <div class="breadcrumbs"><NuxtLink to="/">หน้าแรก</NuxtLink><AppIcon name="chevron-right" :size="13"/><span>บัญชีของฉัน</span></div>
    <section class="account-card">
      <span class="section-kicker">YOUR FRAME, YOUR ACCOUNT</span>
      <div class="account-icon"><AppIcon name="user" :size="25"/></div>
      <template v-if="pending"><h1>กำลังตรวจสอบบัญชี</h1><p>กรุณารอสักครู่</p></template>
      <template v-else-if="user">
        <h1>สวัสดี, {{ user.displayName || 'ลูกค้าอัญชลี' }}</h1>
        <p>บันทึกเบอร์โทรและที่อยู่จัดส่งไว้ เพื่อสั่งซื้อครั้งถัดไปได้สะดวกขึ้น</p>
        <div class="account-profile-head"><span class="account-avatar"><img v-if="user.pictureUrl" :src="user.pictureUrl" alt="รูปโปรไฟล์ LINE"><AppIcon v-else name="user" :size="24"/></span><span><strong>{{ user.displayName }}</strong><small>เข้าสู่ระบบด้วย LINE</small></span></div>
        <form class="account-profile-form" @submit.prevent="saveProfile">
          <label class="field-label">เบอร์โทรศัพท์สำหรับจัดส่ง <span>*</span><input v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="40" placeholder="08x xxx xxxx"></label>
          <label class="field-label">ที่อยู่จัดส่ง <span>*</span><textarea v-model="form.address" autocomplete="street-address" rows="4" required maxlength="2000" placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"></textarea></label>
          <p v-if="errorMessage" class="form-error"><AppIcon name="alert" :size="16"/> {{ errorMessage }}</p>
          <button class="button button-primary account-save" type="submit" :disabled="saving"><AppIcon :name="saving ? 'loader' : 'save'" :size="16" :class="{ spinning: saving }"/> {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลจัดส่ง' }}</button>
        </form>
        <div class="account-actions"><NuxtLink class="text-link" to="/shop">เลือกชมสินค้า <AppIcon name="arrow-right" :size="15"/></NuxtLink><button class="account-logout" type="button" :disabled="loggingOut" @click="logout"><AppIcon name="logout" :size="15"/> {{ loggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}</button></div>
      </template>
      <template v-else>
        <h1>สั่งซื้อได้ง่ายขึ้น<br><em>ด้วยบัญชี LINE</em></h1>
        <p>เข้าสู่ระบบเพื่อบันทึกเบอร์โทรและที่อยู่จัดส่งไว้ในบัญชีของคุณ ข้อมูลนี้ใช้สำหรับเตรียมและส่งคำสั่งซื้อเท่านั้น</p>
        <a v-if="loginEnabled" class="button button-line-login" href="/api/customer/line/login"><AppIcon name="message-circle" :size="19"/> เข้าสู่ระบบด้วย LINE</a>
        <div v-else class="account-config-note"><AppIcon name="info" :size="17"/> LINE Login ยังไม่ได้เชื่อมต่อ ร้านยังรับคำสั่งซื้อแบบไม่ต้องสมัครสมาชิกได้ตามปกติ</div>
        <NuxtLink class="text-link account-continue" to="/shop">เลือกชมกรอบรูป <AppIcon name="arrow-right" :size="15"/></NuxtLink>
      </template>
      <p v-if="route.query.line === 'failed'" class="account-message account-message-error"><AppIcon name="alert" :size="16"/> เข้าสู่ระบบ LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
      <p v-else-if="route.query.line === 'success'" class="account-message account-message-success"><AppIcon name="check" :size="16"/> เข้าสู่ระบบสำเร็จ สามารถบันทึกข้อมูลจัดส่งได้เลย</p>
      <small class="account-privacy">เราไม่เก็บรหัสผ่าน LINE และไม่แชร์ข้อมูลบัญชีของคุณกับบุคคลอื่น</small>
    </section>
  </div>
</template>
