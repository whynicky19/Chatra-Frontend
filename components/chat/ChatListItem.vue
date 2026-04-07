<template>
  <div :class="['cli',{active}]" @click="$emit('click')">
    <div class="cli-av-wrap">
      <img v-if="chatAvatar" :src="chatAvatar" class="cli-av-img"/>
      <div v-else :class="['cli-av-init', gradFor(chat.id)]">{{chat.name[0]?.toUpperCase()||'#'}}</div>
    </div>
    <div style="flex:1;min-width:0">
      <div class="truncate cli-name">{{chat.name}}</div>
      <div class="cli-sub truncate">{{lastMsg || 'Нет сообщений'}}</div>
    </div>
    <div v-if="unreadCount" class="cli-badge">{{unreadCount > 99 ? '99+' : unreadCount}}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useChatsStore } from '~/stores/chats.store'
import { useAuthStore } from '~/stores/auth.store'
import type { Chat } from '~/stores/chats.store'
const props = defineProps<{chat:Chat;active:boolean}>()
defineEmits<{click:[]}>()
const chatsStore = useChatsStore()
const auth = useAuthStore()
const grads=['g0','g1','g2','g3','g4','g5']
const gradFor=(id:number)=>grads[id%grads.length]
const avatarReg=()=>{try{return JSON.parse(localStorage.getItem('_avatar_registry')||'{}')}catch{return{}}}
const chatAvatar=computed(()=>{
  const users=chatsStore.chatUsers[props.chat.id]||[]
  const other=users.find((u:any)=>u.id!==auth.user?.id)
  if(!other) return ''
  const reg=avatarReg()
  if(other.id===auth.user?.id&&auth.avatar) return auth.avatar
  return reg[other.id]||''
})
const lastMsg=computed(()=>{
  const msgs=chatsStore.messages[props.chat.id]
  if(!msgs?.length) return ''
  const m=msgs[msgs.length-1]
  if(m?.content?.startsWith('🖼️')) return '📷 Фото'
  if(m?.content?.startsWith('📎')) return '📎 Файл'
  return m?.content?.slice(0,40)||''
})
const unreadCount=computed(()=>chatsStore.unread[props.chat.id]||0)
</script>
<style scoped>
.cli{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;transition:all .15s;border-radius:var(--r-lg);margin:2px 6px}
.cli:hover{background:var(--surface2)}
.cli.active{background:rgba(0,177,201,.1);border:1px solid rgba(0,177,201,.14)}
.cli-av-wrap{flex-shrink:0}
.cli-av-img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--border)}
.cli-av-init{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0}
.cli-name{font-size:14px;font-weight:600;color:var(--text1)}
.cli.active .cli-name{color:var(--teal)}
.cli-sub{font-size:12px;color:var(--text4);margin-top:2px}
.cli-badge{background:linear-gradient(135deg,#00B1C9,#009aaf);color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:100px;flex-shrink:0;min-width:20px;text-align:center}
.g0{background:linear-gradient(135deg,#00B1C9,#007a8e)}
.g1{background:linear-gradient(135deg,#a855f7,#009aaf)}
.g2{background:linear-gradient(135deg,#6366f1,#4f46e5)}
.g3{background:linear-gradient(135deg,#ec4899,#be185d)}
.g4{background:linear-gradient(135deg,#00B1C9,#c026d3)}
.g5{background:linear-gradient(135deg,#06b6d4,#6366f1)}
</style>