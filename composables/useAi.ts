
import { ref } from 'vue'
import { useApi } from '~/services/api'
import { useToast } from '~/composables/useToast'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  text: string
  imagePreview?: string
  ts: Date
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const isImageFile = (file: File) => file.type.startsWith('image/')

export const useAi = () => {
  const msgs = ref<Msg[]>([])
  const loading = ref(false)
  const api = useApi()
  const toast = useToast()
  let n = 0

  const send = async (text: string, file?: File | null) => {
    const hasText = text.trim().length > 0
    const hasFile = !!file
    if ((!hasText && !hasFile) || loading.value) return

    let imageBase64: string | undefined
    let displayText = text.trim()

    if (hasFile) {
      if (isImageFile(file!)) {
        imageBase64 = await fileToBase64(file!)
        displayText = displayText || `[Изображение: ${file!.name}]`
      } else {
        displayText = displayText
          ? `${displayText}\n[Файл: ${file!.name}]`
          : `[Файл: ${file!.name}]`
      }
    }

    const um: Msg = {
      id: ++n,
      role: 'user',
      text: displayText,
      imagePreview: imageBase64,
      ts: new Date(),
    }
    msgs.value = [...msgs.value, um]
    loading.value = true

    try {
      const history = msgs.value
        .slice(0, -1)
        .map(m => ({ role: m.role, content: m.text }))

      let userContent: string | Array<Record<string, unknown>>

      if (imageBase64) {
        userContent = [
          {
            type: 'image_url',
            image_url: { url: imageBase64, detail: 'high' },
          },
          {
            type: 'text',
            text: text.trim() || 'Прочитай и опиши содержимое изображения. Если на нём рукописный текст — распознай и перепиши его дословно.',
          },
        ]
      } else {
        userContent = displayText
      }

      const { data } = await api.post('/ai/chat', {
        messages: [
          {
            role: 'system',
            content:
              'Ты AI-ассистент образовательной платформы. Отвечай на русском языке. ' +
              'Умеешь читать рукописный текст, распознавать формулы и таблицы на изображениях.',
          },
          ...history,
          { role: 'user', content: userContent },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      })

      msgs.value = [
        ...msgs.value,
        { id: ++n, role: 'assistant', text: data.content || '', ts: new Date() },
      ]
    } catch (e: any) {
      toast.err('AI: ' + (e?.response?.data?.detail || e.message || 'ошибка'))
      msgs.value = msgs.value.filter(m => m.id !== um.id)
    } finally {
      loading.value = false
    }
  }

  const clear = () => { msgs.value = [] }

  return { msgs, loading, send, clear }
}
