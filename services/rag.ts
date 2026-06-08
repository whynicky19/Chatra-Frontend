import { useApi } from './api'

export interface RagDocument {
  id: number
  filename: string
  class_id?: number
  created_at: string
  chunks_count?: number
}

export const useRagSvc = () => {
  const api = useApi()

  return {
    /** Upload a document for RAG ingestion */
    ingest: async (file: File): Promise<{ doc_id: number; chunks: number; filename: string }> => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/rag/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    },

    /** List ingested documents */
    list: async (): Promise<RagDocument[]> => {
      try {
        const { data } = await api.get('/rag/documents')
        return data
      } catch {
        return []
      }
    },

    /** Delete an ingested document */
    delete: async (docId: number): Promise<void> => {
      await api.delete(`/rag/documents/${docId}`)
    },

    /** Ask a RAG question */
    ask: async (question: string, classId?: number): Promise<{ answer: string; sources?: string[] }> => {
      const { data } = await api.post('/rag/ask', { question, class_id: classId })
      return data
    }
  }
}
