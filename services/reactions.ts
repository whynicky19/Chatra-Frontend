import { useApi } from './api'

export const useReactionsSvc = () => {
  const api = useApi()
  return {
    add: async (msgId: number, emoji: string) => {
      // Fixed: was /reactions/reactions/{id} (double prefix)
      const { data } = await api.post(`/reactions/${msgId}`, null, { params: { emoji } })
      return data
    },
    remove: async (msgId: number) => {
      const { data } = await api.delete(`/reactions/${msgId}`)
      return data
    },
    get: async (msgId: number) => {
      const { data } = await api.get(`/reactions/${msgId}`)
      return data as any[]
    },
  }
}
