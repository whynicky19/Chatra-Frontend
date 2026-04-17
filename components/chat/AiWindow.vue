<template>
  <div class="ai">
    <div class="ai-head">
      <div class="ai-head-l">
        <div class="ai-av">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <div class="ai-head-title">ИИ Ассистент</div>
          <div class="ai-head-sub">
            <span class="ai-dot"></span>
            {{ loading ? 'Думает...' : 'Онлайн · читает рукописи' }}
          </div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" @click="ai.clear()">Очистить</button>
    </div>

    <!-- Quota bar for students -->
    <div v-if="ai.aiLimitReached.value" class="ai-quota-block exhausted">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Лимит запросов исчерпан ({{ ai.AI_LIMIT }}/{{ ai.AI_LIMIT }}). Обратитесь к администратору.
    </div>
    <div v-else-if="!ai.aiUnlimited.value && auth.user?.role === 'student'" class="ai-quota-block" :class="{ warn: ai.aiRemaining.value <= 2 }">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      Осталось запросов к ИИ: <strong>{{ ai.aiRemaining.value }} / {{ ai.AI_LIMIT }}</strong>
    </div>

    <div ref="area" class="ai-area">
      <div v-if="!msgs.length" class="ai-welcome anim-in">
        <div class="ai-welcome-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h3 class="ai-welcome-title">AI Ассистент</h3>
        <p class="ai-welcome-desc">Задайте вопрос или прикрепите фото с рукописью — прочитаю и отвечу</p>
        <div class="ai-chips stagger">
          <button v-for="t in tips" :key="t" class="ai-chip" @click="quick(t)">{{ t }}</button>
        </div>
      </div>

      <div v-else class="ai-msgs">
        <div v-for="m in msgs" :key="m.id" :class="['ai-msg', m.role]">
          <div :class="['ai-av-m', m.role === 'user' ? 'u' : 'b']">
            <svg v-if="m.role === 'assistant'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span v-else>{{ uInit }}</span>
          </div>
          <div class="ai-mc">
            <img v-if="m.imagePreview" :src="m.imagePreview" class="ai-img-prev" alt="uploaded"/>
            <div class="ai-bbl" v-html="fmt(m.text)"></div>
            <div class="ai-ts">{{ ts(m.ts) }}</div>
          </div>
        </div>
        <div v-if="loading" class="ai-msg assistant">
          <div class="ai-av-m b">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="ai-mc"><div class="typing"><span></span><span></span><span></span></div></div>
        </div>
      </div>
    </div>

    <!-- File preview -->
    <div v-if="pendingFile" class="ai-file-prev">
      <img v-if="pendingPreview" :src="pendingPreview" class="ai-fp-thumb" alt="preview"/>
      <span>{{ pendingFile.type.startsWith('image/') ? '🖼️' : '📎' }} {{ pendingFile.name }}</span>
      <span v-if="pendingFile.type.startsWith('image/')" class="ai-fp-badge">распознаю текст</span>
      <button class="ai-fp-rm" @click="clearFile">×</button>
    </div>

    <div class="ai-inp">
      <label class="ai-attach" title="Прикрепить изображение">
        <input ref="fileInp" type="file" accept="image/*,.pdf,.txt" style="display:none" @change="onFilePick"/>
        <div class="ai-attach-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
        </div>
      </label>
      <textarea
        ref="ta"
        v-model="txt"
        class="ai-field"
        :placeholder="ai.aiLimitReached.value ? 'Лимит запросов исчерпан...' : 'Написать сообщение...'"
        rows="1"
        :disabled="loading || ai.aiLimitReached.value"
        @keydown.enter.exact.prevent="send"
        @input="resize"
      ></textarea>
      <button :class="['send-btn', { active: (txt.trim() || pendingFile) && !ai.aiLimitReached.value }]" :disabled="(!txt.trim() && !pendingFile) || loading || ai.aiLimitReached.value" @click="send">
        <div v-if="loading" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAi } from '~/composables/useAi'

const auth = useAuthStore()
const ai = useAi()

const msgs = computed(() => ai.msgs.value)
const loading = computed(() => ai.loading.value)

const area = ref<HTMLElement | null>(null)
const ta = ref<HTMLTextAreaElement | null>(null)
const fileInp = ref<HTMLInputElement | null>(null)
const txt = ref('')
const pendingFile = ref<File | null>(null)
const pendingPreview = ref<string | null>(null)

const uInit = computed(() => (auth.nickname || auth.user?.email || '?')[0]?.toUpperCase())
const tips = ['📸 Фото задания — прочитаю', 'Объясни тему кратко', 'Помоги с домашним заданием', 'Составь план урока', 'Проверь мой текст']
const ts = (d: Date) => d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const fmt = (t: string) => t
  .replace(/```(\w+)?\n?([^`]*?)```/g, '<pre class="code-bl"><code>$2</code></pre>')
  .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\n/g, '<br>')

const scroll = () => nextTick(() => { if (area.value) area.value.scrollTop = area.value.scrollHeight })
const resize = () => { if (!ta.value) return; ta.value.style.height = 'auto'; ta.value.style.height = Math.min(ta.value.scrollHeight, 120) + 'px' }

const onFilePick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  pendingFile.value = f
  if (f.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => { pendingPreview.value = reader.result as string }
    reader.readAsDataURL(f)
  } else {
    pendingPreview.value = null
  }
  if (fileInp.value) fileInp.value.value = ''
}

const clearFile = () => { pendingFile.value = null; pendingPreview.value = null }

const send = async () => {
  if ((!txt.value.trim() && !pendingFile.value) || loading.value) return
  const message = txt.value
  const file = pendingFile.value
  txt.value = ''
  pendingFile.value = null
  pendingPreview.value = null
  if (ta.value) ta.value.style.height = 'auto'
  await ai.send(message, file)
  scroll()
}

const quick = async (t: string) => {
  txt.value = t.replace(/^[^\s]+\s/, '')
  await send()
}

watch(() => ai.msgs.value.length, () => scroll())
</script>

<style scoped>
.ai { display: flex; flex-direction: column; height: 100%; background: transparent }
.ai-head { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: var(--topbar); border-bottom: 1px solid var(--border); flex-shrink: 0; background: rgba(19,19,31,.8); backdrop-filter: blur(12px) }
.ai-head-l { display: flex; align-items: center; gap: 12px }
.ai-av { width: 38px; height: 38px; border-radius: var(--r-lg); background: linear-gradient(135deg, #009aaf, #4dd6e8); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 12px rgba(0,177,201,.4) }
.ai-head-title { font-size: 15px; font-weight: 700; color: var(--text1) }
.ai-head-sub { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text4); margin-top: 1px }
.ai-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--lime); flex-shrink: 0; box-shadow: 0 0 6px var(--lime) }
.ai-area { flex: 1; overflow-y: auto; padding: 24px; background: transparent }
.ai-welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100% - 40px); text-align: center; padding: 20px }
.ai-welcome-icon { width: 72px; height: 72px; border-radius: var(--r-2xl); background: linear-gradient(135deg, #009aaf, #4dd6e8); display: flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(0,177,201,.4); animation: float 3s ease-in-out infinite }
@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.ai-welcome-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; color: var(--text1) }
.ai-welcome-desc { font-size: 14px; color: var(--text4); margin-bottom: 28px; line-height: 1.6; max-width: 320px }
.ai-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center }
.ai-chip { padding: 9px 18px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 100px; font-size: 13px; font-weight: 600; color: var(--text2); cursor: pointer; transition: all .2s }
.ai-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-l); transform: translateY(-1px) }
.ai-msgs { display: flex; flex-direction: column; gap: 16px }
.ai-msg { display: flex; gap: 12px; animation: fadeIn .2s ease }
.ai-msg.user { flex-direction: row-reverse }
.ai-av-m { width: 32px; height: 32px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0 }
.ai-av-m.u { background: linear-gradient(135deg, #009aaf, #00B1C9); color: #fff }
.ai-av-m.b { background: linear-gradient(135deg, #1a1a2e, #22223a); color: var(--accent); border: 1px solid var(--border2) }
.ai-mc { max-width: 76%; display: flex; flex-direction: column }
.ai-msg.user .ai-mc { align-items: flex-end }
.ai-img-prev { max-width: 200px; max-height: 160px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(0,177,201,.2); margin-bottom: 4px }
.ai-bbl { padding: 12px 16px; border-radius: var(--r-xl); font-size: 14px; line-height: 1.6 }
.ai-msg.user .ai-bbl { background: linear-gradient(135deg, #009aaf, #00B1C9); color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(0,177,201,.3) }
.ai-msg.assistant .ai-bbl { background: var(--surface2); color: var(--text1); border: 1px solid var(--border); border-bottom-left-radius: 4px }
.ai-ts { font-size: 11px; color: var(--text4); margin-top: 4px; padding: 0 4px }
.typing { display: flex; gap: 5px; padding: 14px 16px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-xl); border-bottom-left-radius: 4px }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s infinite }
.typing span:nth-child(2) { animation-delay: .2s }
.typing span:nth-child(3) { animation-delay: .4s }

/* Quota bar */
.ai-quota-block { display: flex; align-items: center; gap: 7px; padding: 8px 18px; font-size: 12px; color: var(--teal); background: rgba(0,177,201,.07); border-bottom: 1px solid rgba(0,177,201,.12); flex-shrink: 0 }
.ai-quota-block.warn { color: #f59e0b; background: rgba(245,158,11,.07); border-bottom-color: rgba(245,158,11,.15) }
.ai-quota-block.exhausted { color: var(--red); background: var(--red-l); border-bottom-color: rgba(248,113,113,.2) }

/* File preview */
.ai-file-prev { display: flex; align-items: center; gap: 8px; padding: 8px 18px; background: rgba(0,177,201,.08); border-top: 1px solid rgba(0,177,201,.12); font-size: 13px; font-weight: 500; color: var(--teal); flex-shrink: 0 }
.ai-fp-thumb { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(0,177,201,.2) }
.ai-fp-badge { font-size: 11px; background: rgba(6,182,212,.12); color: #06b6d4; border: 1px solid rgba(6,182,212,.2); border-radius: 100px; padding: 2px 8px }
.ai-fp-rm { background: none; border: none; cursor: pointer; color: var(--text4); font-size: 18px; margin-left: auto; padding: 0; line-height: 1 }
.ai-fp-rm:hover { color: var(--red) }

/* Input */
.ai-inp { display: flex; align-items: flex-end; gap: 8px; padding: 14px 18px; background: rgba(19,19,31,.85); border-top: 1px solid var(--border); flex-shrink: 0; backdrop-filter: blur(12px) }
.ai-attach { cursor: pointer; flex-shrink: 0 }
.ai-attach-icon { width: 32px; height: 32px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text3); transition: all .15s }
.ai-attach-icon:hover { background: rgba(0,177,201,.12); border-color: rgba(0,177,201,.2); color: var(--teal) }
.ai-field { flex: 1; border: 1px solid var(--border2); border-radius: var(--r-xl); padding: 10px 16px; resize: none; font-size: 14px; line-height: 1.4; max-height: 120px; transition: all .2s; background: var(--surface2); color: var(--text1) }
.ai-field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,177,201,.15) }
.ai-field:disabled { opacity: .5 }
.ai-field::placeholder { color: var(--text4) }
.send-btn { width: 40px; height: 40px; border-radius: var(--r-lg); background: var(--surface3); color: var(--text4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; border: none; transition: all .2s }
.send-btn.active { background: linear-gradient(135deg, #009aaf, #00B1C9); color: #fff; box-shadow: 0 4px 12px rgba(0,177,201,.4) }
.send-btn.active:hover { transform: scale(1.05) }
.send-btn:disabled { opacity: .4; cursor: not-allowed }
:deep(.code-bl) { background: #0d0d1a; color: #99e6f0; border: 1px solid var(--border2); border-radius: var(--r-lg); padding: 14px; margin: 8px 0; overflow-x: auto; font-size: 13px; font-family: monospace; line-height: 1.5 }
:deep(.ic) { background: rgba(0,177,201,.15); color: #99e6f0; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: .9em }
</style>
