<script setup lang="ts">
const props = withDefaults(defineProps<{ imageKey?: string; imageUrl?: string; compact?: boolean }>(), { imageKey: 'oak', imageUrl: '', compact: false })
const imageFailed = ref(false)
watch(() => props.imageUrl, () => { imageFailed.value = false })
const palette = computed(() => {
  const colors: Record<string, { backdrop: string; mat: string; art: string; accent: string; frame: string }> = {
    oak: { backdrop: '#e7e3d9', mat: '#f5f1e8', art: '#a5aa8f', accent: '#cf8e68', frame: '#a8784c' },
    walnut: { backdrop: '#dedbd3', mat: '#f2eadb', art: '#d7a770', accent: '#47675c', frame: '#674b39' },
    white: { backdrop: '#e9e5dc', mat: '#fbf8f0', art: '#c5a78e', accent: '#6c7d6d', frame: '#f5f2eb' },
    acrylic: { backdrop: '#dce6e2', mat: '#f9faf5', art: '#aac8ba', accent: '#df9e77', frame: '#d4ddd9' },
    desk: { backdrop: '#e6e0d7', mat: '#fbf5e9', art: '#9aa9a0', accent: '#ca8e6c', frame: '#d6e4de' },
    kit: { backdrop: '#e5e2d9', mat: '#f5f2e9', art: '#b2aa95', accent: '#887b67', frame: '#a68b69' },
  }
  return colors[props.imageKey || 'oak'] || colors.oak!
})
</script>

<template>
  <div class="product-art" :class="[`art-${imageKey || 'oak'}`, { 'product-art-compact': compact }]" :style="{ '--art-backdrop': palette.backdrop, '--art-mat': palette.mat, '--art-color': palette.art, '--art-accent': palette.accent, '--art-frame': palette.frame }">
    <span class="art-grain grain-one" />
    <span class="art-grain grain-two" />
    <img v-if="imageUrl && !imageFailed" class="actual-product-image" :src="imageUrl" :alt="`ภาพสินค้า ${imageKey || 'กรอบภาพ'}`" loading="lazy" decoding="async" @error="imageFailed = true">
    <div v-else class="art-frame-wrap">
      <svg viewBox="0 0 340 420" role="img" :aria-label="`ตัวอย่างสินค้า ${imageKey || 'กรอบภาพ'}`">
        <defs>
          <linearGradient id="frame-shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".3"/><stop offset=".48" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#3e3023" stop-opacity=".16"/></linearGradient>
          <filter id="frame-shadow" x="-30%" y="-20%" width="170%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#41392e" flood-opacity=".2"/></filter>
        </defs>
        <ellipse cx="170" cy="371" rx="107" ry="17" fill="#706657" opacity=".11" />
        <g filter="url(#frame-shadow)">
          <rect x="73" y="38" width="194" height="300" rx="3" :fill="palette.frame" />
          <rect x="82" y="47" width="176" height="282" rx="1" fill="url(#frame-shade)" />
          <rect x="89" y="54" width="162" height="268" :fill="palette.mat" />
          <g v-if="imageKey === 'walnut'">
            <circle cx="203" cy="105" r="25" :fill="palette.accent" opacity=".9" />
            <path d="M110 225c18-48 52-70 85-63 29 7 39 39 55 67v68H90v-33c8-11 12-24 20-39Z" :fill="palette.art" />
            <path d="M115 256c25-27 46-24 66-5 20 20 32 18 64-12v72H90v-37l25-18Z" :fill="palette.accent" opacity=".78" />
            <path d="M120 72c2 45 32 64 58 64s48-19 50-64" fill="none" stroke="#b8aa91" stroke-width="2" opacity=".5" />
          </g>
          <g v-else-if="imageKey === 'white'">
            <path d="M106 231c11-42 35-65 67-65 31 0 53 24 62 65v68H106v-68Z" :fill="palette.art" />
            <path d="M130 190c0-23 19-41 42-41s42 18 42 41v24h-84v-24Z" :fill="palette.accent" />
            <path d="M125 299V217M218 299v-82" stroke="#f6f1e7" stroke-width="3" opacity=".8" />
            <circle cx="177" cy="103" r="24" :fill="palette.accent" opacity=".5" />
          </g>
          <g v-else-if="imageKey === 'acrylic'">
            <path d="M116 111c22-28 50-34 75-18 19 12 25 32 22 56-3 29-18 42-42 47-28 6-54-10-64-31-9-19-6-39 9-54Z" :fill="palette.art" />
            <path d="M113 242c16-35 40-52 67-49 32 4 46 25 55 58v49H105v-36l8-22Z" :fill="palette.accent" opacity=".85" />
            <path d="M136 129c13-15 31-22 50-16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45" />
          </g>
          <g v-else-if="imageKey === 'desk'">
            <path d="M116 109h107v115H116z" fill="#d7c7b0" />
            <path d="M129 122h81v89h-81z" :fill="palette.mat" />
            <circle cx="170" cy="163" r="24" :fill="palette.accent" />
            <path d="M129 203c22-29 42-32 81-5v13h-81z" :fill="palette.art" />
            <rect x="111" y="232" width="119" height="16" rx="8" :fill="palette.frame" opacity=".75" />
            <path d="m129 248 23 74h35l24-74" fill="#d0c5b5" />
          </g>
          <g v-else-if="imageKey === 'kit'">
            <rect x="118" y="110" width="103" height="113" rx="20" fill="#ede8dd" />
            <path d="M145 146a24 24 0 1 1 48 0v48h-48v-48Z" :fill="palette.accent" />
            <path d="M169 126v-24m-25 98h50m-42 13v19m34-19v19" fill="none" stroke="#fff9ee" stroke-width="5" stroke-linecap="round" />
            <path d="m130 255 37 47 36-47" fill="none" :stroke="palette.art" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="167" cy="307" r="7" :fill="palette.accent" />
          </g>
          <g v-else>
            <circle cx="197" cy="111" r="25" :fill="palette.accent" opacity=".9" />
            <path d="M111 234c14-42 38-67 69-68 31-1 53 22 65 67v68H104v-39l7-28Z" :fill="palette.art" />
            <path d="M107 260c24-17 46-16 67 4 22 20 40 21 71-6v45H104v-27l3-16Z" :fill="palette.accent" opacity=".78" />
            <path d="M130 86c19 11 35 11 52 0" fill="none" stroke="#d1c2a7" stroke-width="2" />
          </g>
          <rect x="89" y="54" width="162" height="268" rx="1" fill="none" :stroke="imageKey === 'acrylic' || imageKey === 'desk' ? '#ffffff' : '#897254'" stroke-opacity=".2" stroke-width="2" />
          <rect x="73" y="38" width="194" height="300" rx="3" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1" />
        </g>
      </svg>
    </div>
    <span v-if="!compact" class="art-size-note">MADE FOR YOUR MOMENTS</span>
  </div>
</template>
