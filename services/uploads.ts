import { useApi } from './api'
export const useUploadSvc=()=>{
  const api=useApi()
  return{upload:async(file:File)=>{const f=new FormData();f.append('file',file);const{data}=await api.post('/upload/',f,{headers:{'Content-Type':'multipart/form-data'}});return data as{file_url:string}}}
}