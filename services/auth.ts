import { useApi } from './api'
export const useAuthSvc=()=>{
  const api=useApi()
  return{
    login:async(email:string,pw:string)=>{const f=new URLSearchParams();f.append('username',email);f.append('password',pw);const{data}=await api.post('/auth/login',f,{headers:{'Content-Type':'application/x-www-form-urlencoded'}});return data as{access_token:string}},
    register:async(email:string,pw:string,role:string)=>{const{data}=await api.post('/auth/register',{email,password:pw,role});return data},
    me:async()=>{const{data}=await api.get('/auth/me');return data},
  }
}