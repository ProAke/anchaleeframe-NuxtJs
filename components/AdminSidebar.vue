<script setup lang="ts">
const props = defineProps<{ open: boolean; user?: { name?: string; email?: string } }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const nav = [
  { href: '/admin', label: 'ภาพรวมร้านค้า', icon: 'dashboard' },
  { href: '/admin/products', label: 'สินค้า', icon: 'package' },
  { href: '/admin/stock', label: 'คลังสินค้า', icon: 'boxes' },
  { href: '/admin/orders', label: 'คำสั่งซื้อ', icon: 'bag', badge: 'orders' },
  { href: '/admin/shipments', label: 'การจัดส่ง', icon: 'truck' },
  { href: '/admin/customers', label: 'ลูกค้า', icon: 'users' },
  { href: '/admin/reports', label: 'รายงาน', icon: 'chart' },
  { href: '/admin/settings', label: 'ตั้งค่า', icon: 'settings' },
]
const isActive = (href: string) => href === '/admin' ? route.path === href : route.path === href || route.path.startsWith(`${href}/`)
</script>

<template>
  <div class="admin-sidebar-scrim" :class="{ visible: open }" @click="emit('close')" />
  <aside class="admin-sidebar" :class="{ 'admin-sidebar-open': open }">
    <div class="admin-sidebar-brand"><BrandLogo to="/admin" compact class="admin-brand-logo"/><button class="sidebar-close" aria-label="ปิดเมนู" @click="emit('close')"><AppIcon name="close" :size="20"/></button></div>
    <div class="sidebar-workspace"><span class="workspace-avatar">A</span><span><strong>Anchalee Frame</strong><small>ร้านค้าออนไลน์</small></span><AppIcon name="chevron-down" :size="15"/></div>
    <span class="sidebar-section-label">WORKSPACE</span>
    <nav class="admin-nav" aria-label="เมนูระบบจัดการ"><NuxtLink v-for="item in nav" :key="item.href" :to="item.href" class="admin-nav-link" :class="{ active: isActive(item.href) }" @click="emit('close')"><span class="nav-icon"><AppIcon :name="item.icon" :size="18"/></span><span>{{ item.label }}</span><span v-if="item.badge === 'orders'" class="nav-count">{{ 0 }}</span><AppIcon v-if="isActive(item.href)" class="nav-active-arrow" name="chevron-right" :size="14"/></NuxtLink></nav>
    <div class="sidebar-bottom-spacer"/>
    <div class="sidebar-support"><span class="support-graphic"><AppIcon name="headphones" :size="21"/></span><strong>ต้องการความช่วยเหลือ?</strong><small>เราพร้อมช่วยจัดการร้าน</small><a href="https://lin.ee/USvuiWP" target="_blank" rel="noopener">ติดต่อผ่าน LINE <AppIcon name="arrow-right" :size="13"/></a></div>
    <div class="sidebar-user"><span class="sidebar-user-avatar">{{ (user?.name || 'A').slice(0, 1) }}</span><span class="sidebar-user-info"><strong>{{ user?.name || 'ผู้ดูแลระบบ' }}</strong><small>{{ user?.email || 'admin@anchaleeframe.com' }}</small></span><span class="online-dot" title="ออนไลน์"/></div>
  </aside>
</template>
