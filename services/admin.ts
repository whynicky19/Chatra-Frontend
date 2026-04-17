import { useApi } from './api'

export const useAdminSvc = () => {
  const api = useApi()
  return {
    users: async () => {
      const { data } = await api.get('/admin/users')
      return data as any[]
    },

    create: async (p: { email: string; password: string; role: string }) => {
      const { data } = await api.post('/admin/users', p)
      return data
    },

    // role is sent as query param matching backend: PUT /admin/users/{id}/role?new_role=...\
    role: async (id: number, r: string) => {
      await api.put(`/admin/users/${id}/role`, null, { params: { new_role: r } })
    },

    block: async (id: number) => {
      await api.put(`/admin/users/${id}/block`)
    },

    unblock: async (id: number) => {
      await api.put(`/admin/users/${id}/unblock`)
    },

    del: async (id: number) => {
      await api.delete(`/admin/users/${id}`)
    },

    setAiUnlimited: async (id: number, unlimited: boolean) => {
      await api.put(`/admin/users/${id}/ai_unlimited`, { unlimited })
    },

    aiUsage: async (params?: { class_id?: number; page?: number; page_size?: number }) => {
      const { data } = await api.get('/admin/ai-usage', { params })
      return data as { total: number; page: number; page_size: number; items: any[] }
    },

    aiUsageSummary: async () => {
      const { data } = await api.get('/admin/ai-usage/summary')
      return data as any[]
    },
  }
}
