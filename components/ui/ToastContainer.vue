<template>
  <Teleport to="body">
    <div class="tc">
      <TransitionGroup name="t">
        <div v-for="t in store.items" :key="t.id" :class="['toast','t-'+t.type]">
          <div class="t-dot"></div>
          <span>{{t.msg}}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { useToastStore } from '~/stores/toast.store'
const store=useToastStore()
</script>
<style scoped>
.tc{position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{padding:12px 16px;border-radius:var(--r-lg);font-size:14px;font-weight:500;box-shadow:var(--sh-lg);display:flex;align-items:center;gap:10px;min-width:240px;max-width:360px;pointer-events:auto;background:var(--surface);border:1px solid var(--border)}
.t-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.t-ok .t-dot{background:var(--green)}.t-ok{border-left:3px solid var(--green)}
.t-err .t-dot{background:var(--red)}.t-err{border-left:3px solid var(--red)}
.t-info .t-dot{background:var(--blue)}.t-info{border-left:3px solid var(--blue)}
.t-enter-active{transition:all .25s ease}.t-leave-active{transition:all .2s ease}
.t-enter-from{opacity:0;transform:translateX(20px)}.t-leave-to{opacity:0;transform:translateX(20px)}
</style>