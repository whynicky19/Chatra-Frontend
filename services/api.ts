import axios, { type AxiosInstance } from 'axios'
import { navigateTo, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'

let _api: AxiosInstance | null = null
let _loggingOut = false

export const resetLogoutFlag = () => { _loggingOut = false }

export const useApi = (): AxiosInstance => {
  if (_api) return _api

  const cfg = useRuntimeConfig()
  const auth = useAuthStore()

  _api = axios.create({ baseURL: cfg.public.apiBase })

  _api.interceptors.request.use(r => {
    if (auth.token) r.headers.Authorization = `Bearer ${auth.token}`
    return r
  })

  _api.interceptors.response.use(r => r, e => {
    if (e.response?.status === 401 && !_loggingOut) {
      _loggingOut = true
      auth.logout()
      navigateTo('/login')
    }
    return Promise.reject(e)
  })

  return _api
}
