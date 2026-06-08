import { setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore } from '~/stores/org.store'

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  // Explicitly set the active Pinia before calling any stores
  const pinia = nuxtApp.$pinia as any
  if (pinia) setActivePinia(pinia)

  const auth = useAuthStore()
  auth.loadFromStorage()

  // Apply saved dark/light theme
  try {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch {}

  // Apply org type theme (university = teal, school = amber)
  const org = useOrgStore()
  org.init()
})
