import { navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useToast } from '~/composables/useToast'
import { useAuthSvc } from '~/services/auth'
import { resetLogoutFlag } from '~/services/api'

export const useAuth = () => {
  const auth = useAuthStore()
  const svc = useAuthSvc()
  const toast = useToast()

  const login = async (email: string, pw: string) => {
    try {
      resetLogoutFlag()
      const t = await svc.login(email, pw)
      auth.setToken(t.access_token)
      const u = await svc.me()
      auth.setUser(u) // loads per-user avatar + nick inside setUser

      // Sync full_name from server if present
      if (import.meta.client) {
        if (u.full_name) {
          auth.setFullname(u.full_name)
          localStorage.removeItem('_pending_fullname')
        } else {
          // fallback: apply pending full_name saved during registration
          const pendingFn = localStorage.getItem('_pending_fullname')
          if (pendingFn) {
            auth.setFullname(pendingFn)
            localStorage.removeItem('_pending_fullname')
          }
        }
        const pending = localStorage.getItem('_pending_nick')
        if (pending) {
          auth.setNickname(pending)
          localStorage.removeItem('_pending_nick')
        }
      }
      return true
    } catch (e: any) {
      toast.err(e?.response?.data?.detail || 'Неверный email или пароль')
      return false
    }
  }

  const register = async (email: string, pw: string, role = 'employee', full_name?: string) => {
    try {
      await svc.register(email, pw, role, full_name)
      toast.ok('Аккаунт создан')
      return true
    } catch (e: any) {
      toast.err(e?.response?.data?.detail || 'Ошибка регистрации')
      return false
    }
  }

  const fetchMe = async () => {
    if (!auth.token) return
    try {
      const u = await svc.me()
      auth.setUser(u)
    } catch { auth.logout() }
  }

  const logout = () => { auth.logout(); navigateTo('/login') }

  return { login, register, fetchMe, logout }
}
