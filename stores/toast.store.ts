import { defineStore } from 'pinia'
interface Toast{id:number;msg:string;type:'ok'|'err'|'info'}
let c=0
export const useToastStore = defineStore('toast',{
  state:()=>({items:[] as Toast[]}),
  actions:{
    add(msg:string,type:Toast['type']='info',dur=3500){const id=++c;this.items.push({id,msg,type});setTimeout(()=>{this.items=this.items.filter(t=>t.id!==id)},dur)},
    ok(m:string){this.add(m,'ok')},err(m:string){this.add(m,'err',5000)},info(m:string){this.add(m,'info')},
  },
})