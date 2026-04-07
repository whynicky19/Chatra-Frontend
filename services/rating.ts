import { useApi } from './api'

export const useRatingSvc = () => {
  const api = useApi()

  return {
    myRating: async (classId?: number): Promise<{
      avg_score: number
      avg_percent: number
      graded_count: number
      total_score: number
      max_possible: number
    }> => {
      try {
        const params = classId ? `?class_id=${classId}` : ''
        const { data } = await api.get(`/assignments/student/my-rating${params}`)
        return data
      } catch {
        return { avg_score: 0, avg_percent: 0, graded_count: 0, total_score: 0, max_possible: 0 }
      }
    }
  }
}
