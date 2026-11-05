<script setup lang="ts">
const props = withDefaults(defineProps<{ to?: string; compact?: boolean; light?: boolean }>(), { to: '/', compact: false, light: false })
const imageFailed = ref(false)
const logoUrl = 'https://www.anchaleeframe.com/upload/setting/full/img/20221012084610-1885204472.png'
</script>

<template>
  <NuxtLink :to="props.to" class="official-brand" :class="{ 'official-brand-compact': props.compact, 'official-brand-light': props.light }" :aria-label="props.to === '/admin' ? 'อัญชลีกรอบรูป ระบบจัดการ' : 'อัญชลีกรอบรูป — หน้าแรก'">
    <img v-if="!imageFailed" :src="logoUrl" alt="อัญชลีกรอบรูป" loading="eager" decoding="async" @error="imageFailed = true">
    <span v-else class="official-brand-fallback"><span class="brand-mark"><span/><span/><span/></span><span class="brand-fallback-text"><strong>อัญชลีกรอบรูป</strong><small>ANCHALEE FRAME</small></span></span>
  </NuxtLink>
</template>
