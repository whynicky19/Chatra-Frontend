import { useApi } from './api'

export interface Criterion {
  name: string
  weight: number
  description?: string
}

export interface Assignment {
  id: number
  class_id: number
  title: string
  description?: string
  criteria: string // JSON string
  max_score: number
  deadline?: string
  created_at: string
  is_active: boolean
  created_by: number
  reference_solution_url?: string
  variants?: Variant[]
}

export interface Variant {
  id: number
  assignment_id: number
  variant_number: number
  title?: string
  reference_solution_url: string
  created_at: string
}

export interface SubmissionCreate {
  text_content?: string
  file_url?: string
  file_urls?: string[]
  variant_number?: number
}

export interface Submission {
  id: number
  assignment_id: number
  student_id: number
  student_name?: string   // returned by backend if supported
  student_email?: string  // returned by backend if supported
  file_url?: string
  file_urls?: string   // JSON string of URL list
  text_content?: string
  variant_number?: number
  submitted_at: string
  status: 'submitted' | 'grading' | 'graded' | 'late'
  grade?: Grade
}

export interface Grade {
  id: number
  submission_id: number
  score: number
  feedback?: string
  criteria_scores?: string // JSON string
  graded_at: string
  graded_by: 'ai' | 'teacher'
}

export const useAssignmentsSvc = () => {
  const api = useApi()

  return {
    list: async (classId?: number): Promise<Assignment[]> => {
      const params = classId !== undefined ? `?class_id=${classId}` : ''
      const { data } = await api.get(`/assignments/${params}`)
      return data
    },

    get: async (id: number): Promise<Assignment> => {
      const { data } = await api.get(`/assignments/${id}`)
      return data
    },

    create: async (body: {
      class_id: number
      title: string
      description?: string
      criteria: Criterion[]
      max_score: number
      deadline?: string
      reference_solution_url?: string
    }): Promise<Assignment> => {
      const { data } = await api.post('/assignments/', body)
      return data
    },

    update: async (id: number, body: Partial<{
      title: string
      description: string
      criteria: Criterion[]
      max_score: number
      deadline: string
      is_active: boolean
      reference_solution_url: string
    }>): Promise<Assignment> => {
      const { data } = await api.put(`/assignments/${id}`, body)
      return data
    },

    delete: async (id: number): Promise<void> => {
      await api.delete(`/assignments/${id}`)
    },

    listVariants: async (assignmentId: number): Promise<Variant[]> => {
      const { data } = await api.get(`/assignments/${assignmentId}/variants`)
      return data
    },

    addVariant: async (assignmentId: number, body: {
      variant_number: number
      title?: string
      reference_solution_url: string
    }): Promise<Variant> => {
      const { data } = await api.post(`/assignments/${assignmentId}/variants`, body)
      return data
    },

    deleteVariant: async (assignmentId: number, variantId: number): Promise<void> => {
      await api.delete(`/assignments/${assignmentId}/variants/${variantId}`)
    },

    submit: async (assignmentId: number, body: SubmissionCreate): Promise<Submission> => {
      const { data } = await api.post(`/assignments/${assignmentId}/submit`, body)
      return data
    },

    // Fixed path: /assignments/student/my-submissions (avoids route conflict with /{id})
    mySubmissions: async (): Promise<Submission[]> => {
      const { data } = await api.get('/assignments/student/my-submissions')
      return data
    },

    getSubmissions: async (assignmentId: number): Promise<Submission[]> => {
      const { data } = await api.get(`/assignments/${assignmentId}/submissions`)
      return data
    },

    getSubmission: async (subId: number): Promise<Submission> => {
      const { data } = await api.get(`/submissions/${subId}`)
      return data
    },

    retractSubmission: async (subId: number): Promise<void> => {
      await api.delete(`/submissions/${subId}`)
    },

    aiGrade: async (subId: number): Promise<Grade> => {
      const { data } = await api.post(`/submissions/${subId}/ai-grade`)
      return data
    },

    saveGrade: async (subId: number, body: {
      score: number
      feedback?: string
      criteria_scores?: any[]
      graded_by: string
    }): Promise<Grade> => {
      const { data } = await api.post(`/submissions/${subId}/grade`, body)
      return data
    },

    getGrade: async (subId: number): Promise<Grade> => {
      const { data } = await api.get(`/submissions/${subId}/grade`)
      return data
    },
  }
}
