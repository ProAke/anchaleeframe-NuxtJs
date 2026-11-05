<script setup lang="ts">
const route = useRoute()
const orderNo = computed(() => String(route.params.orderNo || ''))
const isDemo = computed(() => route.query.demo === '1')
</script>

<template>
  <section class="order-success page-container"><div class="success-art"><div class="success-frame"><span class="success-sun"/><span class="success-hill-one"/><span class="success-hill-two"/><span class="success-flower">✳</span></div><span class="success-spark spark-a">✦</span><span class="success-spark spark-b">✧</span></div><div class="success-copy"><span class="section-kicker">A NEW MEMORY, ON ITS WAY</span><span class="success-check"><AppIcon name="check" :size="24"/></span><h1>ขอบคุณที่เลือก<br><em>Anchalee Frame</em></h1><p>คำสั่งซื้อของคุณได้รับการยืนยันแล้ว<br>เราจะเตรียมแพ็กให้อย่างดีที่สุด</p><div class="order-number-card"><span>หมายเลขคำสั่งซื้อ</span><strong>{{ orderNo }}</strong><small>เก็บหมายเลขนี้ไว้เพื่อติดตามสถานะพัสดุ</small></div><div v-if="isDemo" class="demo-note">โหมดสาธิต: ข้อมูลคำสั่งซื้อถูกเก็บไว้ชั่วคราว ไม่ได้บันทึกลงฐานข้อมูลจริง</div><div class="success-actions"><NuxtLink class="button button-primary" :to="`/track?orderNo=${encodeURIComponent(orderNo)}`">ติดตามคำสั่งซื้อ <AppIcon name="arrow-right" :size="17"/></NuxtLink><NuxtLink class="text-link" to="/shop">เลือกชมสินค้าเพิ่มเติม</NuxtLink></div><div class="success-help"><AppIcon name="headphones" :size="16"/> ต้องการความช่วยเหลือ? <a href="tel:0860669103">โทร 086-066-9103</a></div></div></section>
</template>
