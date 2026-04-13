import { useApi } from './api'

export const useClassesSvc = () => {
  const api = useApi()

  return {
    list: async (): Promise<any[]> => {
      const { data } = await api.get('/classes/')
      return data as any[]
    },
    listAll: async (): Promise<any[]> => {
      // Returns all classes (for join-by-code search)
      const { data } = await api.get('/classes/all')
      return data as any[]
    },
    get: async (id: number): Promise<any> => {
      const { data } = await api.get(`/classes/${id}`)
      return data
    },
    join: async (classId: number): Promise<void> => {
      await api.post(`/classes/${classId}/join`, {})
    },
    leave: async (classId: number): Promise<void> => {
      await api.delete(`/classes/${classId}/leave`)
    },
    create: async (name: string, description?: string): Promise<any> => {
      const { data } = await api.post('/classes/', { name, description })
      return data
    },
    delete: async (classId: number): Promise<void> => {
      await api.delete(`/classes/${classId}`)
    },
  }
}
