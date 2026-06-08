import { useApi } from './api'

export const useAuthSvc = () => {
  const api = useApi()

  return {
    login: async (email: string, pw: string, orgType = 'university') => {
      const f = new URLSearchParams()
      f.append('username', email)
      f.append('password', pw)
      const { data } = await api.post(
        `/auth/login?org_type=${encodeURIComponent(orgType)}`,
        f,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      return data as { access_token: string; refresh_token: string }
    },

    register: async (
      email: string,
      pw: string,
      role: string,
      full_name?: string,
      group?: string,
      orgType = 'university'
    ) => {
      const { data } = await api.post('/auth/register', {
        email,
        password: pw,
        role,
        full_name,
        group,
        org_type: orgType,
      })
      return data
    },

    me: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },

    updateMe: async (full_name: string, group?: string) => {
      const { data } = await api.patch('/auth/me', { full_name, group })
      return data
    },
  }
}
