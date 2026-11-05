<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string; subtitle?: string; wide?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
function close() { emit('update:modelValue', false) }
</script>

<template>
  <Teleport to="body"><Transition name="modal-fade"><div v-if="modelValue" class="modal-backdrop" @click.self="close"><section class="admin-modal" :class="{ 'admin-modal-wide': wide }" role="dialog" aria-modal="true" :aria-label="title"><header class="modal-heading"><div><span class="section-kicker">ANCHalee FRAME ADMIN</span><h2>{{ title }}</h2><p v-if="subtitle">{{ subtitle }}</p></div><button class="modal-close" aria-label="ปิดหน้าต่าง" @click="close"><AppIcon name="close" :size="19"/></button></header><div class="modal-body"><slot /></div></section></div></Transition></Teleport>
</template>
