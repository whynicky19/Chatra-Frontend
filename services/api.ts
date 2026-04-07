import axios from 'axios'
import { navigateTo, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'
export const useApi=()=>{
  const cfg=useRuntimeConfig();const auth=useAuthStore()
  const ax=axios.create({baseURL:cfg.public.apiBase})
  ax.interceptors.request.use(r=>{if(auth.token)r.headers.Authorization=`Bearer ${auth.token}`;return r})
  ax.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){auth.logout();navigateTo('/login')};return Promise.reject(e)})
  return ax
}