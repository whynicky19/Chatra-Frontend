<template>
  <div class="pc" @click="$emit('view')" role="button" tabindex="0" @keyup.enter="$emit('view')">
    <div class="pc-left">
      <div :class="['pc-icon',type==='lecture'?'lec':'hw']">
        <svg v-if="type==='lecture'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
    </div>
    <div class="pc-body">
      <div class="pc-type-label">{{type==='lecture'?'Лекция':'Домашнее задание'}}</div>
      <div class="pc-title">{{postTitle}}</div>
      <div class="pc-preview">{{bodyPreview}}</div>
      <div class="pc-meta">
        <span>{{date}}</span>
        <span v-if="hasFiles" class="files-hint">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          Есть вложения
        </span>
        <span v-if="type==='hw'" class="due-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Сдача
        </span>
      </div>
    </div>
    <div class="pc-arrow">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{post:{id:number;title:string;body:string;user_id:number};type:'lecture'|'hw'}>()
defineEmits<{view:[]}>()
const postTitle = computed(() => props.post.title.replace(/^\[(LECTURE|HW)\]\[\d+\] /, ''))
const bodyPreview = computed(() => props.post.body?.replace(/\n\n📎.*$/s,'').replace(/📎.*$/,'').trim().slice(0,120)||'')
const hasFiles = computed(() => props.post.body?.includes('📎'))
const date = computed(() => new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'short'}))
</script>
<style scoped>
.pc{display:flex;align-items:flex-start;gap:12px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);transition:all .15s;cursor:pointer;user-select:none}
.pc:hover{box-shadow:var(--sh-md);border-color:var(--blue);transform:translateY(-1px)}
.pc:active{transform:scale(.99)}
.pc-left{flex-shrink:0;padding-top:2px}
.pc-icon{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}
.lec{background:var(--blue-l);color:var(--blue)}
.hw{background:var(--green-l);color:var(--green)}
.pc-body{flex:1;min-width:0}
.pc-type-label{font-size:11px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--text4);margin-bottom:3px}
.pc-title{font-size:15px;font-weight:600;color:var(--text1);margin-bottom:4px}
.pc-preview{font-size:13px;color:var(--text3);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.pc-meta{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:12px;color:var(--text4);flex-wrap:wrap}
.due-badge{display:flex;align-items:center;gap:3px;color:var(--yellow,#d97706)}
.files-hint{display:flex;align-items:center;gap:3px;color:var(--blue)}
.pc-arrow{flex-shrink:0;color:var(--text4);padding-top:2px;transition:transform .15s}
.pc:hover .pc-arrow{color:var(--blue);transform:translateX(2px)}
</style>
