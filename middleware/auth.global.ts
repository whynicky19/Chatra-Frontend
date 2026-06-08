import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore } from '~/stores/org.store'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  const org  = useOrgStore()

  // Initialise org from localStorage (idempotent)
  if (!org.isSelected) org.init()

  const pub = ['/login', '/register', '/org']
  const isPublic = pub.includes(to.path)

  // Already on /org — don't redirect again
  if (to.path === '/org') return

  // Must choose org before doing anything else
  if (!org.isSelected && !isPublic) {
    return navigateTo('/org', { replace: true })
  }

  // Already on login/register — don't redirect again
  if (to.path === '/login' || to.path === '/register') return

  // Unauthenticated → login
  if (!auth.token && !isPublic) {
    return navigateTo('/login', { replace: true })
  }

  // Authenticated → redirect away from auth pages
  if (auth.token && isPublic) {
    return navigateTo('/', { replace: true })
  }
})
