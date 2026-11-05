<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)
const { data: session, pending } = await useFetch<{ user: { id: number | string; name: string; email: string; role: string }; demo: boolean }>('/api/admin/session', { server: false, retry: false })
watchEffect(() => {
  if (!pending.value && !session.value) router.replace('/admin/login')
})
const titles: Record<string, { title: string; eyebrow: string }> = {
  '/admin': { title: 'ภาพรวมร้านค้า', eyebrow: 'DASHBOARD' },
  '/admin/products': { title: 'สินค้า', eyebrow: 'PRODUCT CATALOG' },
  '/admin/stock': { title: 'คลังสินค้า', eyebrow: 'INVENTORY' },
  '/admin/orders': { title: 'คำสั่งซื้อ', eyebrow: 'ORDERS & PAYMENTS' },
  '/admin/shipments': { title: 'การจัดส่ง', eyebrow: 'FULFILMENT' },
  '/admin/customers': { title: 'ลูกค้า', eyebrow: 'CUSTOMERS' },
  '/admin/reports': { title: 'รายงาน', eyebrow: 'BUSINESS INSIGHTS' },
  '/admin/settings': { title: 'ตั้งค่า', eyebrow: 'STORE SETTINGS' },
}
const pageTitle = computed(() => titles[route.path] || { title: 'จัดการร้านค้า', eyebrow: 'ANCHalee ADMIN' })
</script>

<template>
  <div v-if="pending || !session" class="admin-auth-loading"><span class="auth-loading-mark"><span/><span/><span/></span><span>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</span></div>
  <div v-else class="admin-app-shell">
    <AdminSidebar :open="sidebarOpen" :user="session.user" @close="sidebarOpen = false" />
    <div class="admin-main-column">
      <header class="admin-topbar"><button class="admin-mobile-menu" aria-label="เปิดเมนู" @click="sidebarOpen = true"><AppIcon name="menu" :size="21"/></button><div class="admin-topbar-heading"><span>{{ pageTitle.eyebrow }}</span><strong>{{ pageTitle.title }}</strong></div><div class="admin-topbar-spacer"/><div class="admin-live-status"><span class="online-dot"/> ร้านค้าออนไลน์</div><NuxtLink class="admin-topbar-store" to="/" target="_blank"><AppIcon name="external" :size="16"/> ดูหน้าเว็บไซต์</NuxtLink><span class="topbar-divider"/><div class="admin-profile"><span class="sidebar-user-avatar">{{ session.user.name.slice(0, 1) }}</span><span><strong>{{ session.user.name }}</strong><small>{{ session.user.role === 'admin' ? 'ผู้ดูแลระบบ' : session.user.role }}</small></span><AppIcon name="chevron-down" :size="14"/></div></header>
      <main class="admin-content"><div v-if="session.demo" class="demo-mode-banner"><span><AppIcon name="sparkles" :size="16"/><strong>โหมดสาธิต</strong></span><span>ข้อมูลตัวอย่างจะถูกรีเซ็ตเมื่อเซิร์ฟเวอร์เริ่มใหม่ — ตั้งค่า MariaDB เพื่อบันทึกข้อมูลจริง</span></div><slot /></main>
    </div>
    <ToastRegion />
  </div>
</template>
