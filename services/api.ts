import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { navigateTo, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'

let _api: AxiosInstance | null = null
let _loggingOut = false
let _refreshing = false
let _refreshQueue: Array<(token: string) => void> = []

export const resetLogoutFlag = () => { _loggingOut = false }

const doLogout = (auth: ReturnType<typeof useAuthStore>) => {
  if (_loggingOut) return
  _loggingOut = true
  auth.logout()
  navigateTo('/login')
}

export const useApi = (): AxiosInstance => {
  if (_api) return _api

  const cfg = useRuntimeConfig()
  const auth = useAuthStore()

  _api = axios.create({ baseURL: cfg.public.apiBase })

  _api.interceptors.request.use(r => {
    if (auth.token) r.headers.Authorization = `Bearer ${auth.token}`
    return r
  })

  _api.interceptors.response.use(r => r, async e => {
    const original = e.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (e.response?.status !== 401 || original._retry) {
      return Promise.reject(e)
    }

    // Don't retry the refresh endpoint itself
    if (original.url?.includes('/auth/refresh')) {
      doLogout(auth)
      return Promise.reject(e)
    }

    original._retry = true

    if (_refreshing) {
      // Queue request until refresh completes
      return new Promise((resolve, reject) => {
        _refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(_api!.request(original))
        })
      })
    }

    if (!auth.refreshToken) {
      doLogout(auth)
      return Promise.reject(e)
    }

    _refreshing = true
    try {
      const { data } = await axios.post(
        `${cfg.public.apiBase}/auth/refresh`,
        { refresh_token: auth.refreshToken },
      )
      auth.setToken(data.access_token)
      auth.setRefreshToken(data.refresh_token)

      _refreshQueue.forEach(cb => cb(data.access_token))
      _refreshQueue = []

      original.headers.Authorization = `Bearer ${data.access_token}`
      return _api!.request(original)
    } catch {
      _refreshQueue = []
      doLogout(auth)
      return Promise.reject(e)
    } finally {
      _refreshing = false
    }
  })

  return _api
}
