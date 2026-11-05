<script setup lang="ts">
const { toast } = useToast()
</script>

<template>
  <Transition name="toast-pop"><div v-if="toast" class="toast-message" :class="`toast-${toast.tone}`"><span class="toast-check"><AppIcon :name="toast.tone === 'error' ? 'alert' : 'circle-check'" :size="17" /></span><span>{{ toast.message }}</span></div></Transition>
</template>
