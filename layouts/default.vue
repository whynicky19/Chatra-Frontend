<template>
  <div class="shell">
    <AppSidebar />
    <main class="shell-main"><slot /></main>
    <ToastContainer />
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAuthStore } from '~/stores/auth.store'
import { useChat } from '~/composables/useChat'
import { useChatsStore } from '~/stores/chats.store'
import { useChatsSvc } from '~/services/chats'

const { fetchMe } = useAuth()
const auth = useAuthStore()
const chatsStore = useChatsStore()
const chatsSvc = useChatsSvc()
const { connectWs, loadMsgs, startChatPoller } = useChat()

onMounted(async () => {
  if (auth.token && !auth.user) await fetchMe()

  if (auth.token) {
    try {
      const chats = await chatsSvc.list()
      chatsStore.setChats(chats)
      chats.forEach((c: any) => connectWs(c.id))
      // Lazy: load only first 5 chats for preview, rest load on demand
      const preview = chats.slice(0, 5)
      await Promise.all(preview.map((c: any) => loadMsgs(c.id)))
    } catch {}

    startChatPoller()
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    // Clean up poll interval
    if ((window as any).__chatPollInterval) {
      clearInterval((window as any).__chatPollInterval)
      delete (window as any).__chatPollInterval
    }
    // Disconnect all WebSockets to prevent leaks
    chatsStore.disconnectAll()
  }
})
</script>
<style scoped>
.shell{display:flex;height:100vh;overflow:hidden;background:var(--bg)}
.shell-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
@media (max-width:768px){
  .shell{flex-direction:column;overflow:hidden;width:100%;max-width:100vw}
  .shell-main{overflow:hidden;width:100%;max-width:100vw;overflow-x:hidden;padding-bottom:calc(60px + env(safe-area-inset-bottom, 0px));box-sizing:border-box}
}
@media (max-width:480px){
  .shell-main{padding-bottom:calc(56px + env(safe-area-inset-bottom, 0px))}
}
</style>