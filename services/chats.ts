import { useApi } from './api'

export const useChatsSvc = () => {
  const api = useApi()
  return {
    list: async () => { const { data } = await api.get('/chats/'); return data as any[] },
    create: async (name: string) => { const { data } = await api.post('/chats/', { name }); return data },
    users: async (id: number) => { const { data } = await api.get(`/chats/${id}/users`); return data as any[] },
    addUser: async (chatId: number, userId: number) => {
      const { data } = await api.post(`/chats/${chatId}/users/${userId}`)
      return data
    },
    removeUser: async (chatId: number, userId: number) => {
      const { data } = await api.delete(`/chats/${chatId}/users/${userId}`)
      return data
    },
  }
}
