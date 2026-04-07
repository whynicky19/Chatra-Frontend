import { useToastStore } from '~/stores/toast.store'
export const useToast=()=>{const s=useToastStore();return{ok:(m:string)=>s.ok(m),err:(m:string)=>s.err(m),info:(m:string)=>s.info(m)}}