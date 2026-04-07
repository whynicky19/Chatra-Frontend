import { useApi } from './api'

export const useUsersSvc = () => {
  const api = useApi()

  const getAll = async (): Promise<any[]> => {
    try {
      const { data } = await api.get('/users/')
      return data as any[]
    } catch {
      try {
        const { data } = await api.get('/admin/users')
        return data as any[]
      } catch { return [] }
    }
  }

  return {
    all: getAll,
    findByEmail: async (email: string) => {
      const all = await getAll()
      return all.find((u: any) => u.email === email) || null
    }
  }
}
