<script setup lang="ts">
definePageMeta({ layout: 'blank' })
const { data: storeStatus } = await useFetch<{ demo: boolean }>('/api/store-settings')
const isDemo = computed(() => Boolean(storeStatus.value?.demo))
const email = ref('')
const password = ref('')
watch(isDemo, (demo) => {
  if (demo) {
    email.value = 'admin@anchaleeframe.com'
    password.value = 'Frame2026!'
  }
}, { immediate: true })
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)
const route = useRoute()

async function submit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await navigateTo(String(route.query.redirect || '/admin'))
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="admin-login-page"><div class="login-decoration login-decoration-one"/><div class="login-decoration login-decoration-two"/><NuxtLink to="/" class="login-back-store"><AppIcon name="arrow-left" :size="16"/> กลับหน้าเว็บไซต์</NuxtLink><section class="login-card"><BrandLogo to="/admin/login" class="login-brand-lockup"/><span class="login-kicker">STORE MANAGEMENT</span><h1>ยินดีต้อนรับ<br><em>กลับมาอีกครั้ง</em></h1><p class="login-description">เข้าสู่ระบบเพื่อจัดการสินค้า สต็อก และคำสั่งซื้อของร้าน</p><form class="login-form" @submit.prevent="submit"><label class="field-label">อีเมล<input v-model="email" type="email" autocomplete="username" placeholder="you@anchaleeframe.com" required></label><label class="field-label">รหัสผ่าน<span class="password-wrap"><input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="กรอกรหัสผ่าน" required><button type="button" aria-label="แสดงหรือซ่อนรหัสผ่าน" @click="showPassword = !showPassword"><AppIcon :name="showPassword ? 'eye' : 'eye'" :size="17"/></button></span></label><div v-if="errorMessage" class="form-error"><AppIcon name="alert" :size="16"/> {{ errorMessage }}</div><button class="button button-primary login-submit" type="submit" :disabled="loading"><AppIcon :name="loading ? 'loader' : 'shield'" :size="17" :class="{ spinning: loading }"/> {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }} <AppIcon name="arrow-right" :size="17"/></button></form><div v-if="isDemo" class="demo-login-note"><div><AppIcon name="sparkles" :size="16"/><strong>บัญชีสำหรับทดลองใช้งาน</strong></div><span>อีเมล: admin@anchaleeframe.com</span><span>รหัสผ่าน: Frame2026!</span><small>โหมดสาธิตเท่านั้น · ข้อมูลไม่ถาวร</small></div><div v-else class="login-secure-note"><AppIcon name="shield" :size="15"/> การเชื่อมต่อที่ปลอดภัยสำหรับผู้ดูแลระบบ</div></section><span class="login-footer">© {{ new Date().getFullYear() }} Anchalee Frame · Store Management</span></main>
</template>
