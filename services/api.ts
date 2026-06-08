import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'

let _api: AxiosInstance | null = null
let _baseURL: string | null = null
let _loggingOut = false
let _refreshing = false
let _refreshQueue: Array<(token: string) => void> = []

export const resetLogoutFlag = () => { _loggingOut = false }

const doLogout = () => {
  if (_loggingOut) return
  _loggingOut = true
  // Call store lazily — Pinia is guaranteed to be ready here (inside interceptor)
  try { useAuthStore().logout() } catch {}
  if (import.meta.client) window.location.href = '/login'
}

export const useApi = (): AxiosInstance => {
  // Always get fresh baseURL from runtimeConfig
  const cfg = useRuntimeConfig()
  const base = cfg.public.apiBase as string

  // Re-create if baseURL changed (e.g. env switch)
  if (_api && _baseURL === base) return _api

  _baseURL = base
  _api = axios.create({ baseURL: base })

  // ── Request interceptor ───────────────────────────────────────────────────
  // Get token lazily inside the interceptor — Pinia is always ready here
  _api.interceptors.request.use((r: InternalAxiosRequestConfig) => {
    try {
      const auth = useAuthStore()
      if (auth.token) r.headers.Authorization = `Bearer ${auth.token}`
    } catch {}
    return r
  })

  // ── Response interceptor ─────────────────────────────────────────────────
  _api.interceptors.response.use(
    r => r,
    async (e) => {
      const original = e.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (e.response?.status !== 401 || original._retry) {
        return Promise.reject(e)
      }

      if (original.url?.includes('/auth/refresh')) {
        doLogout()
        return Promise.reject(e)
      }

      original._retry = true

      if (_refreshing) {
        return new Promise((resolve) => {
          _refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(_api!.request(original))
          })
        })
      }

      let refreshToken: string | null = null
      try { refreshToken = useAuthStore().refreshToken } catch {}

      if (!refreshToken) {
        doLogout()
        return Promise.reject(e)
      }

      _refreshing = true
      try {
        const { data } = await axios.post(`${base}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        try {
          const auth = useAuthStore()
          auth.setToken(data.access_token)
          auth.setRefreshToken(data.refresh_token)
        } catch {}

        _refreshQueue.forEach(cb => cb(data.access_token))
        _refreshQueue = []

        original.headers.Authorization = `Bearer ${data.access_token}`
        return _api!.request(original)
      } catch {
        _refreshQueue = []
        doLogout()
        return Promise.reject(e)
      } finally {
        _refreshing = false
      }
    }
  )

  return _api
}
