import { useAuthStore } from '~/stores/auth.store'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.loadFromStorage()

  // Apply saved theme (new system: 'dark' class)
  const theme = localStorage.getItem('theme')
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    // Migrate old lightMode key
    const oldLight = localStorage.getItem('lightMode')
    if (oldLight === '0') {
      document.documentElement.classList.remove('dark')
    }
  }
})
