import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useChatsStore } from '~/stores/chats.store'
import { useToast } from '~/composables/useToast'
import { useMsgsSvc } from '~/services/messages'
import { useChatsSvc } from '~/services/chats'

export const useChat = () => {
  const store = useChatsStore()
  const auth = useAuthStore()
  const cfg = useRuntimeConfig()
  const msgSvc = useMsgsSvc()
  const chatSvc = useChatsSvc()
  const toast = useToast()

  const loadMsgs = async (id: number) => {
    store.loadingMsgs = true
    try {
      const m = await msgSvc.list(id)
      store.setMsgs(id, m)
    } catch {} finally { store.loadingMsgs = false }
  }

  const loadUsers = async (id: number) => {
    try {
      const u = await chatSvc.users(id)
      store.setChatUsers(id, u)
    } catch {}
  }

  const startChatPoller = () => {
    if (!import.meta.client) return
    const poll = async () => {
      if (!auth.token) {
        if ((window as any).__chatPollInterval) {
          clearInterval((window as any).__chatPollInterval)
          delete (window as any).__chatPollInterval
        }
        return
      }
      try {
        const chats = await chatSvc.list()
        chats.forEach((c: any) => {
          if (!store.chats.find(x => x.id === c.id)) {
            store.addChat(c)
            connectWs(c.id)
          }
        })
      } catch {}
    }
    poll()
    // Only register one interval across hot-reloads
    if (!(window as any).__chatPollInterval) {
      ;(window as any).__chatPollInterval = setInterval(poll, 3000)
    }
  }

  const connectWs = (id: number) => {
    // Pass JWT token so backend can authenticate the WS connection
    store.connectWs(id, cfg.public.wsBase, async () => {
      await loadMsgs(id)
      if (store.active?.id !== id) {
        store.unread[id] = (store.unread[id] || 0) + 1
        if (import.meta.client && localStorage.getItem('soundNotif') === '1') {
          try {
            const ctx = new AudioContext()
            const o = ctx.createOscillator()
            const g = ctx.createGain()
            o.connect(g); g.connect(ctx.destination)
            o.frequency.value = 880; g.gain.value = 0.07
            o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
            o.stop(ctx.currentTime + 0.25)
          } catch {}
        }
      }
    }, auth.token || undefined)
  }

  const sendMsg = async (chatId: number, content: string) => {
    if (!content.trim()) return false
    try {
      // Show message instantly (optimistic)
      const tempId = -Date.now()
      const tempMsg = {
        id: tempId,
        content: content.trim(),
        chat_id: chatId,
        user_id: auth.user?.id ?? 0,
        created_at: new Date().toISOString(),
        is_read: false,
        file_url: null,
      }
      store.addMsg(chatId, tempMsg, auth.user?.id ?? 0)

      // Send to backend — server returns full message object
      const saved = await msgSvc.send(chatId, content.trim())

      // Remove temp, add real message
      store.removeMsg(chatId, tempId)
      if (saved?.id) {
        store.addMsg(chatId, {
          id: saved.id,
          content: saved.content ?? content.trim(),
          chat_id: chatId,
          user_id: auth.user?.id ?? 0,
          created_at: saved.created_at ?? new Date().toISOString(),
          is_read: false,
          file_url: saved.file_url ?? null,
        }, auth.user?.id ?? 0)
      } else {
        // Fallback: reload from server
        await loadMsgs(chatId)
      }

      store.sendWs(chatId, { type: 'new_message', chat_id: chatId, user_id: auth.user?.id })
      return true
    } catch (e: any) {
      toast.err(e?.response?.data?.detail || 'Не удалось отправить')
      return false
    }
  }

  const delMsg = async (chatId: number, msgId: number) => {
    try {
      await msgSvc.del(msgId)
      store.removeMsg(chatId, msgId)
    } catch { toast.err('Ошибка удаления') }
  }

  return { loadMsgs, loadUsers, connectWs, sendMsg, delMsg, startChatPoller }
}
