import { useApi } from './api'
export const usePostsSvc=()=>{
  const api=useApi()
  return{
    list:async()=>{const{data}=await api.get('/posts/');return data as any[]},
    create:async(title:string,body:string)=>{const{data}=await api.post('/posts/create',{title,body});return data},
    update:async(id:number,title:string,body:string)=>{const{data}=await api.put(`/posts/${id}`,{title,body});return data},
    remove:async(id:number)=>{const{data}=await api.delete(`/posts/${id}`);return data},
  }
}
