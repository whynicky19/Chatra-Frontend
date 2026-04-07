<template>
  <div class="cc" @click="$emit('open')">
    <div class="cc-cover" :style="coverBg">
      <img v-if="coverImage" :src="coverImage" class="cc-cover-img"/>
      <div class="cc-cover-overlay"></div>
      <div class="cc-title-over">{{cls.title}}</div>
      <div v-if="hwCount>0" class="cc-due-badge">{{hwCount}} due</div>
    </div>
    <div class="cc-body">
      <div class="cc-desc">{{classDesc || 'Нажмите для просмотра материалов'}}</div>
      <div class="cc-footer">
        <div class="cc-teacher">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {{teacherName}}
        </div>
        <button class="cc-view-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          View
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{cls:{id:number;title:string;body:string;user_id:number};hwCount?:number}>()
defineEmits<{open:[]}>()

const gradients = [
  'linear-gradient(135deg,#1a0533,#3d0f75)',
  'linear-gradient(135deg,#0a1628,#1a3a5c)',
  'linear-gradient(135deg,#1a0a2e,#4a1060)',
  'linear-gradient(135deg,#0d1f0d,#1a4a1a)',
  'linear-gradient(135deg,#1a0a0a,#4a1a1a)',
]

const parsed = computed(() => { try { return JSON.parse(props.cls.body) } catch { return {} } })
const coverImage = computed(() => parsed.value.cover_image || null)
const classDesc = computed(() => parsed.value.description || '')
const coverBg = computed(() => coverImage.value ? {} : { background: gradients[props.cls.id % gradients.length] })
const teacherName = computed(() => {
  if (parsed.value.teacher) return parsed.value.teacher
  try { const reg = JSON.parse(localStorage.getItem('_nick_registry')||'{}'); return reg[props.cls.user_id] || 'Преподаватель' } catch { return 'Преподаватель' }
})
const hwCount = computed(() => props.hwCount || 0)
</script>
<style scoped>
.cc { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; }
.cc:hover { border-color: rgba(124,58,237,.5); box-shadow: 0 8px 32px rgba(0,0,0,.4), 0 0 20px rgba(124,58,237,.2); transform: translateY(-3px); }
.cc-cover { position: relative; height: 160px; display: flex; align-items: flex-end; padding: 14px; overflow: hidden; }
.cc-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.cc-cover-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 35%, rgba(0,0,0,.78)); z-index: 1; }
.cc-title-over { position: relative; z-index: 2; font-size: 22px; font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.6); letter-spacing: -.01em; }
.cc-due-badge { position: absolute; top: 12px; right: 12px; background: #a3e635; color: #0a0a0f; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 100px; z-index: 2; }
.cc-body { padding: 16px; }
.cc-desc { font-size: 13px; color: var(--text3); line-height: 1.5; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.cc-footer { display: flex; align-items: center; justify-content: space-between; }
.cc-teacher { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text4); }
.cc-view-btn { display: flex; align-items: center; gap: 5px; padding: 6px 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); font-size: 12px; font-weight: 500; color: var(--text2); cursor: pointer; transition: all .15s; }
.cc-view-btn:hover { background: rgba(124,58,237,.2); border-color: rgba(124,58,237,.4); color: #4dd6e8; }
</style>
