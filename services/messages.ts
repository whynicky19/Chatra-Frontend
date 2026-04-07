import { useApi } from './api'

export const useMsgsSvc = () => {
  const api = useApi()
  return {
    list: async (chatId: number) => {
      try {
        const { data } = await api.get(`/messages/chat/${chatId}`)
        return (data as any[]).map(m => ({
          ...m,
          is_read: m.is_read ?? false,
          file_url: m.file_url ?? null,   // fixed: was fike_url
        }))
      } catch { return [] }
    },

    send: async (chatId: number, content: string) => {
      const { data } = await api.post(`/messages/chat/${chatId}`, { content })
      return data
    },

    del: async (id: number) => {
      await api.delete(`/messages/${id}`)
    },
  }
}
