import { useAuthStore } from '~/stores/auth.store'
export default defineNuxtRouteMiddleware((to)=>{
  if(import.meta.server)return
  const auth=useAuthStore()
  const pub=['/login','/register']
  if(!auth.token&&!pub.includes(to.path))return navigateTo('/login')
  if(auth.token&&pub.includes(to.path))return navigateTo('/')
})