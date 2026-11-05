export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  runtimeConfig: {
    databaseHost: process.env.NUXT_DATABASE_HOST || '127.0.0.1',
    databasePort: process.env.NUXT_DATABASE_PORT || '3306',
    databaseName: process.env.NUXT_DATABASE_NAME || '',
    databaseUser: process.env.NUXT_DATABASE_USER || '',
    databasePassword: process.env.NUXT_DATABASE_PASSWORD || '',
    adminEmail: process.env.NUXT_ADMIN_EMAIL || 'admin@anchaleeframe.com',
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || '',
    lineLoginChannelId: process.env.NUXT_LINE_LOGIN_CHANNEL_ID || '',
    lineLoginChannelSecret: process.env.NUXT_LINE_LOGIN_CHANNEL_SECRET || '',
    lineLoginRedirectUri: process.env.NUXT_LINE_LOGIN_REDIRECT_URI || '',
    public: {
      siteName: 'อัญชลีกรอบรูป',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'th' },
      title: 'อัญชลีกรอบรูป — โรงงานผลิตและจำหน่ายกรอบรูป',
      meta: [
        { name: 'description', content: 'โรงงานผลิตและจำหน่ายกรอบรูปปลีก–ส่ง กรอบสำเร็จรูป กรอบไม้ กรอบลอย และบริการรับทำกรอบตามขนาดจากอัญชลีกรอบรูป' },
        { name: 'theme-color', content: '#f8f7f3' },
      ],
    },
  },
})
