export default defineNuxtConfig({
  ssr: false, // SPA mode — fixes "Not authenticated" on page refresh (token only in localStorage)
  devtools: { enabled: false },
  compatibilityDate: '2024-04-03',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || 'ws://localhost:8000',
    },
  },
  app: {
    head: {
      title: 'Chatra',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo.png' },
      ],
      script: [
        {
          // Inline script runs before paint — eliminates dark mode flash
          innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.remove('dark');else if(window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark');}catch(e){}})();`,
          type: 'text/javascript',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  typescript: { strict: false, typeCheck: false },
})