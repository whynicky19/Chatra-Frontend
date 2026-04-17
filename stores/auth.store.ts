import { defineStore } from 'pinia'

interface User { id: number; email: string; is_active: boolean; role: string; ai_unlimited?: boolean }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
    nickname: '' as string,
    fullname: '' as string,
    avatar: '' as string,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    isAdmin: (s) => s.user?.role === 'admin',
    isTeacher: (s) => s.user?.role === 'teacher' || s.user?.role === 'admin',
  },

  actions: {
    setToken(t: string) {
      this.token = t
      if (import.meta.client) localStorage.setItem('_tk', t)
    },

    setUser(u: User) {
      this.user = u
      if (import.meta.client) {
        const n = localStorage.getItem(`_nick_${u.id}`)
        this.nickname = n || ''
        const fn = localStorage.getItem(`_fullname_${u.id}`)
        this.fullname = fn || ''
        const a = localStorage.getItem(`_avatar_${u.id}`)
        this.avatar = a || ''
        if (n) {
          const reg = JSON.parse(localStorage.getItem('_nick_registry') || '{}')
          reg[u.id] = n
          localStorage.setItem('_nick_registry', JSON.stringify(reg))
        }
        if (fn) {
          const reg = JSON.parse(localStorage.getItem('_fullname_registry') || '{}')
          reg[u.id] = fn
          localStorage.setItem('_fullname_registry', JSON.stringify(reg))
        }
        if (a) {
          const reg = JSON.parse(localStorage.getItem('_avatar_registry') || '{}')
          reg[u.id] = a
          localStorage.setItem('_avatar_registry', JSON.stringify(reg))
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.nickname = ''
      this.fullname = ''
      this.avatar = ''
      if (import.meta.client) localStorage.removeItem('_tk')
    },

    loadFromStorage() {
      if (import.meta.client) {
        const t = localStorage.getItem('_tk')
        if (t) this.token = t
      }
    },

    setFullname(fn: string) {
      this.fullname = fn
      if (import.meta.client && this.user) {
        localStorage.setItem(`_fullname_${this.user.id}`, fn)
        const reg = JSON.parse(localStorage.getItem('_fullname_registry') || '{}')
        reg[this.user.id] = fn
        localStorage.setItem('_fullname_registry', JSON.stringify(reg))
      }
    },

    setNickname(n: string) {
      this.nickname = n
      if (import.meta.client && this.user) {
        localStorage.setItem(`_nick_${this.user.id}`, n)
        const reg = JSON.parse(localStorage.getItem('_nick_registry') || '{}')
        reg[this.user.id] = n
        localStorage.setItem('_nick_registry', JSON.stringify(reg))
      }
    },

    setAvatar(a: string) {
      this.avatar = a
      if (import.meta.client && this.user) {
        localStorage.setItem(`_avatar_${this.user.id}`, a)
        const reg = JSON.parse(localStorage.getItem('_avatar_registry') || '{}')
        reg[this.user.id] = a
        localStorage.setItem('_avatar_registry', JSON.stringify(reg))
      }
    },
  },
})