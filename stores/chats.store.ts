import { defineStore } from 'pinia'

export interface Chat { id: number; name: string }
export interface Msg {
  id: number
  content: string
  chat_id: number
  user_id: number
  created_at: string | null
  is_read: boolean | null
  file_url: string | null   // fixed typo: was fike_url
}
export interface ChatUser { id: number; email: string; role: string; is_active: boolean }

export const useChatsStore = defineStore('chats', {
  state: () => ({
    chats: [] as Chat[],
    active: null as Chat | null,
    messages: {} as Record<number, Msg[]>,
    chatUsers: {} as Record<number, ChatUser[]>,
    loadingChats: false,
    loadingMsgs: false,
    ws: {} as Record<number, WebSocket>,
    unread: {} as Record<number, number>,
    lastSeen: {} as Record<number, number>,
  }),

  getters: {
    activeMsgs: (s): Msg[] => s.active ? (s.messages[s.active.id] || []) : [],
    activeUsers: (s): ChatUser[] => s.active ? (s.chatUsers[s.active.id] || []) : [],
    totalUnread: (s) => Object.values(s.unread).reduce((a, b) => a + b, 0),
  },

  actions: {
    setChats(c: Chat[]) { this.chats = c },
    addChat(c: Chat) { if (!this.chats.find(x => x.id === c.id)) this.chats.unshift(c) },

    setActive(c: Chat | null) {
      this.active = c
      if (c) {
        this.unread[c.id] = 0
        this.lastSeen[c.id] = (this.messages[c.id] || []).at(-1)?.id || 0
      }
    },

    setMsgs(id: number, m: Msg[]) { this.messages[id] = m },

    addMsg(id: number, m: Msg, myId: number) {
      if (!this.messages[id]) this.messages[id] = []
      if (!this.messages[id].find(x => x.id === m.id)) {
        this.messages[id].push(m)
        if (this.active?.id !== id && m.user_id !== myId) {
          this.unread[id] = (this.unread[id] || 0) + 1
        }
      }
    },

    markRead(id: number) {
      this.unread[id] = 0
      this.lastSeen[id] = (this.messages[id] || []).at(-1)?.id || 0
    },

    removeMsg(cid: number, mid: number) {
      if (this.messages[cid]) this.messages[cid] = this.messages[cid].filter(m => m.id !== mid)
    },

    setChatUsers(id: number, u: ChatUser[]) { this.chatUsers[id] = u },

    /**
     * Connect to chat WebSocket.
     * Token is passed as query param so the backend can authenticate.
     */
    connectWs(chatId: number, wsBase: string, onMsg: () => void, token?: string) {
      if (this.ws[chatId]) return
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
      const ws = new WebSocket(`${wsBase}/ws/${chatId}${tokenParam}`)
      ws.onmessage = () => onMsg()
      ws.onclose = () => { delete this.ws[chatId] }
      ws.onerror = () => { delete this.ws[chatId] }
      this.ws[chatId] = ws
    },

    sendWs(chatId: number, d: object) {
      const w = this.ws[chatId]
      if (w && w.readyState === WebSocket.OPEN) w.send(JSON.stringify(d))
    },

    disconnectAll() {
      Object.values(this.ws).forEach(w => { try { w.close() } catch {} })
      this.ws = {}
    },
  },
})
