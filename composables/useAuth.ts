import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore, applyOrgTheme } from '~/stores/org.store'
import { useToast } from '~/composables/useToast'
import { useAuthSvc } from '~/services/auth'
import { resetLogoutFlag } from '~/services/api'

export const useAuth = () => {
  const auth = useAuthStore()
  const org  = useOrgStore()
  const svc  = useAuthSvc()
  const toast = useToast()

  const login = async (email: string, pw: string) => {
    try {
      resetLogoutFlag()
      const orgType = org.orgTypeString
      const t = await svc.login(email, pw, orgType)
      auth.setToken(t.access_token)
      if (t.refresh_token) auth.setRefreshToken(t.refresh_token)
      const u = await svc.me()
      auth.setUser(u)

      if (import.meta.client) {
        applyOrgTheme(orgType as any)

        if (u.full_name) {
          auth.setFullname(u.full_name)
          localStorage.removeItem('_pending_fullname')
        } else {
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

  const register = async (
    email: string,
    pw: string,
    role = 'student',
    full_name?: string,
    group?: string
  ) => {
    try {
      const orgType = org.orgTypeString
      await svc.register(email, pw, role, full_name, group, orgType)
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
    } catch {
      auth.logout()
    }
  }

  const logout = () => {
    auth.logout()
    if (import.meta.client) {
      window.location.href = '/org'
    }
  }

  return { login, register, fetchMe, logout }
}
