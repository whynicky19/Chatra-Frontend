<template>
  <div class="class-ai">

    <!-- ── Header ── -->
    <div class="ai-header">
      <div class="ai-header-l">
        <div class="ai-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <div class="ai-name">ИИ-ассистент</div>
          <div class="ai-status-row">
            <span class="status-dot" :class="{ thinking: loading }"></span>
            <span class="status-txt">{{ loading ? 'Думает...' : 'Онлайн' }}</span>
            <span v-if="loadingFileCount > 0" class="status-badge loading-badge">
              <div class="spin-xs"></div>
              Читаю файлы ({{ loadingFileCount }})...
            </span>
            <span v-else-if="readyCount > 0" class="status-badge ready-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ readyCount }} файлов прочитано
            </span>
          </div>
        </div>
      </div>
      <div class="ai-header-r">
        <button class="hdr-btn" :class="{ 'hdr-btn-active': showSidebar }" @click="showSidebar = !showSidebar" title="Файлы и работы">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
          <span v-if="classFiles.length || pendingSubs.length" class="hdr-badge">{{ classFiles.length + pendingSubs.length }}</span>
        </button>
        <button class="hdr-btn" @click="clearAll" title="Очистить чат">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    </div>

    <div class="ai-body">

      <!-- ── Sidebar ── -->
      <div v-if="showSidebar" class="ai-sidebar">
        <!-- Files -->
        <div class="sb-section">
          <div class="sb-section-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
            Файлы класса ({{ classFiles.length }})
          </div>
          <div v-if="!classFiles.length" class="sb-empty">Нет прикреплённых файлов</div>
          <div v-else class="sb-file-list">
            <div v-for="f in classFiles" :key="f.url" class="sb-file" :class="{ 'sb-file-ok': !!fileTexts[f.url], 'sb-file-loading': loadingSet.has(f.url) }">
              <span class="sb-emoji">{{ emoji(f.url) }}</span>
              <div class="sb-file-info">
                <div class="sb-file-name">{{ f.name }}</div>
                <div class="sb-file-section">{{ f.section }}</div>
              </div>
              <div class="sb-file-icon">
                <svg v-if="fileTexts[f.url]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else-if="loadingSet.has(f.url)" class="spin-xs"></div>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending submissions for teacher -->
        <div v-if="isTeacher && pendingSubs.length" class="sb-section">
          <div class="sb-section-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Работы на проверку ({{ pendingSubs.length }})
          </div>
          <div class="sb-sub-list">
            <div v-for="s in pendingSubs" :key="s.id" class="sb-sub">
              <div class="sb-sub-info">
                <span class="sb-sub-name">{{ getStudentName(s.student_id) }}</span>
                <div class="sb-sub-tags">
                  <span v-if="s.text_content" class="sub-chip">✍️ текст</span>
                  <span v-if="s.file_url" class="sub-chip">{{ emoji(s.file_url) }} файл</span>
                </div>
              </div>
              <button class="grade-btn" :disabled="gradingId === s.id" @click="gradeOne(s)">
                <div v-if="gradingId === s.id" class="spin-xs white"></div>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {{ gradingId === s.id ? '...' : 'Проверить' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Messages ── -->
      <div ref="msgsEl" class="ai-msgs">
        <div v-if="!msgs.length" class="welcome">
          <div class="welcome-orb">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="welcome-title">Готов помочь!</div>
          <div class="welcome-desc">
            <template v-if="readyCount > 0">Прочитал {{ readyCount }} файлов — спрашивайте по материалам</template>
            <template v-else-if="classFiles.length">Загружаю материалы класса...</template>
            <template v-else>Задайте вопрос по теме курса</template>
          </div>
          <div class="quick-grid">
            <button v-for="q in quickItems" :key="q.t" class="quick-btn" @click="pushSend(q.p)">
              <span class="quick-icon">{{ q.i }}</span>
              {{ q.t }}
            </button>
          </div>
        </div>

        <template v-else>
          <div v-for="m in msgs" :key="m.id" :class="['msg-row', m.role]">
            <div v-if="m.role === 'assistant'" class="msg-av ai-av">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div class="msg-bubble" v-html="fmt(m.text)"></div>
            <div v-if="m.role === 'user'" class="msg-av user-av">{{ userInit }}</div>
          </div>
          <div v-if="loading" class="msg-row assistant">
            <div class="msg-av ai-av">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div class="msg-bubble typing-bbl"><span></span><span></span><span></span></div>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Quota bar (students only) ── -->
    <div v-if="aiLimitReached" class="quota-bar exhausted">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Лимит запросов исчерпан ({{ AI_LIMIT }}/{{ AI_LIMIT }}). Обратитесь к администратору.
    </div>
    <div v-else-if="isStudent" class="quota-bar" :class="{ warn: aiRemaining <= 2 }">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      Осталось запросов к ИИ: <strong>{{ aiRemaining }} / {{ AI_LIMIT }}</strong>
    </div>

    <!-- ── Input ── -->
    <div class="ai-input-bar">
      <textarea ref="inputEl" v-model="inputTxt" class="ai-textarea"
        :placeholder="aiLimitReached ? 'Лимит запросов исчерпан...' : 'Спросите про материалы, попросите объяснить тему...'"
        rows="1" :disabled="aiLimitReached" @keydown.enter.exact.prevent="send" @input="autoResize">
      </textarea>
      <button class="send-btn" :disabled="!inputTxt.trim() || loading || aiLimitReached" @click="send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAssignmentsSvc } from '~/services/assignments'
import { useUsersSvc } from '~/services/users'
import { useToast } from '~/composables/useToast'
import { useApi } from '~/services/api'
import { useAi, incrementAiCount, AI_LIMIT } from '~/composables/useAi'
import type { Submission } from '~/services/assignments'

// ── Props ────────────────────────────────────────────────────────────────────
const props = defineProps<{
  className?: string
  classPosts?: any[]
  classId?: number
  isTeacher?: boolean
  assignmentId?: number
  assignments?: any[]   // Assignment objects with description containing file URLs
}>()

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_CHARS = 14000  // max chars per file in context

// ── Dependencies ──────────────────────────────────────────────────────────────
const auth = useAuthStore()
const svc = useAssignmentsSvc()
const usersSvc = useUsersSvc()
const toast = useToast()
const api = useApi()
const aiQuota = useAi()
const aiLimitReached = computed(() => aiQuota.aiLimitReached.value)
const aiRemaining = computed(() => aiQuota.aiRemaining.value)
const isStudent = computed(() => auth.user?.role === 'student' && !auth.user?.ai_unlimited)

const studentMap = ref<Record<number, string>>({})

// ── State ─────────────────────────────────────────────────────────────────────
interface Msg { id: number; role: 'user' | 'assistant'; text: string }
interface ClassFile { name: string; url: string; section: string }

const msgs = ref<Msg[]>([])
const loading = ref(false)
const inputTxt = ref('')
const showSidebar = ref(false)
const msgsEl = ref<HTMLElement>()
const inputEl = ref<HTMLTextAreaElement>()
const fileTexts = ref<Record<string, string>>({})
const loadingSet = ref<Set<string>>(new Set())
const pendingSubs = ref<Submission[]>([])
const gradingId = ref<number | null>(null)
let nextId = 0

// ── Session persistence ────────────────────────────────────────────────────────
const storageKey = computed(() => `ai_chat_class_${props.classId ?? 'x'}`)

const persist = () => {
  try { sessionStorage.setItem(storageKey.value, JSON.stringify(msgs.value.slice(-60))) } catch {}
}
const restore = () => {
  try {
    const s = sessionStorage.getItem(storageKey.value)
    if (!s) return
    const arr = JSON.parse(s)
    if (Array.isArray(arr) && arr.length) {
      msgs.value = arr
      nextId = Math.max(...arr.map((m: Msg) => m.id), 0)
    }
  } catch {}
}

// ── Computed ──────────────────────────────────────────────────────────────────
const userInit = computed(() => (auth.nickname || auth.user?.email || 'U').charAt(0).toUpperCase())
const loadingFileCount = computed(() => loadingSet.value.size)
const readyCount = computed(() => Object.keys(fileTexts.value).length)

// Extract all file URLs from class posts AND assignments
const classFiles = computed((): ClassFile[] => {
  const result: ClassFile[] = []
  const FILE_RE = /\.(pdf|doc|docx|txt|md|csv|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp)(\?[^\s]*)?$/i
  const URL_RE = /(https?:\/\/[^\s\n"'<>]+)/g

  const addFromText = (text: string, section: string) => {
    for (const m of [...text.matchAll(URL_RE)]) {
      const url = m[1].replace(/[.,;:!?)\]>]+$/, '')
      if (FILE_RE.test(url) && !result.find(f => f.url === url)) {
        const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] || url)
        result.push({ name, url, section })
      }
    }
  }

  // From class posts (lectures + materials)
  for (const post of (props.classPosts || [])) {
    const isLecture = post.title?.startsWith('[LECTURE]')
    addFromText(post.body || '', isLecture ? 'Лекция' : 'Материал')
  }

  // From assignment descriptions (teacher-attached task files)
  for (const a of (props.assignments || [])) {
    if (a.description) addFromText(a.description, `Задание: ${a.title}`)
  }

  return result
})

const quickItems = [
  { i: '📖', t: 'Объясни материал', p: 'Подробно объясни основные темы и содержание материалов этого класса. Опирайся на прикреплённые файлы.' },
  { i: '🔑', t: 'Ключевые понятия', p: 'Выдели и объясни все ключевые понятия и термины из материалов класса.' },
  { i: '📝', t: 'Помощь с заданием', p: 'Объясни требования к заданию. Что важно учесть? На что обратить внимание?' },
  { i: '❓', t: 'Частые ошибки', p: 'Какие типичные ошибки допускают по данной теме и как их избежать?' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const getStudentName = (id: number) => studentMap.value[id] || `Студент #${id}`

const emoji = (url: string) => {
  const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  if (e === 'pdf') return '📄'
  if (['doc', 'docx'].includes(e)) return '📝'
  if (['txt', 'md', 'csv'].includes(e)) return '📃'
  if (['xls', 'xlsx'].includes(e)) return '📊'
  if (['ppt', 'pptx'].includes(e)) return '📋'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(e)) return '🖼️'
  return '📎'
}

const fmt = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gs, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')

const scrollBottom = () => nextTick(() => {
  if (msgsEl.value) msgsEl.value.scrollTop = msgsEl.value.scrollHeight
})

const autoResize = () => {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 140) + 'px'
}

// ── PDF extraction (via pdf.js CDN) ───────────────────────────────────────────
let pdfJsLoaded = false
const ensurePdfJs = async (): Promise<boolean> => {
  if (pdfJsLoaded) return true
  if ((window as any).pdfjsLib) { pdfJsLoaded = true; return true }
  return new Promise(resolve => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    s.onload = () => {
      ;(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      pdfJsLoaded = true
      resolve(true)
    }
    s.onerror = () => resolve(false)
    document.head.appendChild(s)
  })
}

const readPdf = async (buf: ArrayBuffer): Promise<string> => {
  try {
    const ok = await ensurePdfJs()
    if (!ok) return ''
    const pdf = await (window as any).pdfjsLib.getDocument({ data: buf }).promise
    const pages: string[] = []
    for (let i = 1; i <= Math.min(pdf.numPages, 40); i++) {
      const page = await pdf.getPage(i)
      const tc = await page.getTextContent()
      pages.push(tc.items.map((x: any) => x.str).join(' '))
    }
    return pages.join('\n\n').slice(0, MAX_CHARS)
  } catch (e) {
    console.warn('PDF read error:', e)
    return ''
  }
}

// ── DOCX extraction (parse XML from zip) ──────────────────────────────────────
const readDocx = async (buf: ArrayBuffer): Promise<string> => {
  try {
    // DOCX is a ZIP — find word/document.xml
    // We use a manual ZIP parser approach via DataView
    const bytes = new Uint8Array(buf)
    const decoder = new TextDecoder('utf-8', { fatal: false })

    // Find PK local file header signatures and extract document.xml
    const sig = [0x50, 0x4B, 0x03, 0x04]
    let i = 0
    const texts: string[] = []

    while (i < bytes.length - 30) {
      // Find PK\x03\x04
      if (bytes[i] === sig[0] && bytes[i+1] === sig[1] && bytes[i+2] === sig[2] && bytes[i+3] === sig[3]) {
        const fnLen = bytes[i+26] | (bytes[i+27] << 8)
        const extLen = bytes[i+28] | (bytes[i+29] << 8)
        const fnStart = i + 30
        const fnEnd = fnStart + fnLen
        const dataStart = fnEnd + extLen
        const compSize = bytes[i+18] | (bytes[i+19] << 8) | (bytes[i+20] << 16) | (bytes[i+21] << 24)
        const fn = decoder.decode(bytes.slice(fnStart, fnEnd))

        if (fn.endsWith('.xml') && (fn.includes('word/') || fn.includes('ppt/') || fn.includes('xl/'))) {
          const compressed = bytes.slice(dataStart, dataStart + compSize)
          try {
            const ds = new DecompressionStream('deflate-raw')
            const writer = ds.writable.getWriter()
            writer.write(compressed)
            writer.close()
            const reader = ds.readable.getReader()
            const chunks: Uint8Array[] = []
            let done = false
            while (!done) {
              const res = await reader.read()
              done = res.done
              if (res.value) chunks.push(res.value)
            }
            const total = chunks.reduce((a, c) => a + c.length, 0)
            const merged = new Uint8Array(total)
            let offset = 0
            for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length }
            const xml = decoder.decode(merged)
            // Extract text from XML tags
            const t1 = [...xml.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g)].map(m => m[1]).join(' ')
            const t2 = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join(' ')
            const t3 = [...xml.matchAll(/<t[^>]*>([^<]+)<\/t>/g)].map(m => m[1]).join(' ')
            const combined = (t1 || t2 || t3).trim()
            if (combined) texts.push(combined)
          } catch {}
        }
        i = dataStart + compSize
      } else {
        i++
      }
    }

    return texts.join('\n').replace(/\s+/g, ' ').slice(0, MAX_CHARS)
  } catch { return '' }
}

// ── Universal file reader ──────────────────────────────────────────────────────
const readFile = async (f: ClassFile): Promise<string> => {
  try {
    const resp = await fetch(f.url, { mode: 'cors' })
    if (!resp.ok) return `[Файл недоступен: ${f.name}]`

    const ext = f.url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''

    if (ext === 'pdf') {
      const buf = await resp.arrayBuffer()
      const text = await readPdf(buf)
      return text || `[PDF не содержит текста: ${f.name}]`
    }

    if (['doc', 'docx', 'pptx', 'xlsx'].includes(ext)) {
      const buf = await resp.arrayBuffer()
      const text = await readDocx(buf)
      return text || `[Файл Office: ${f.name} — не удалось извлечь текст]`
    }

    if (['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm'].includes(ext)) {
      const text = await resp.text()
      return text.slice(0, MAX_CHARS)
    }

    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return `[Изображение: ${f.name}]`
    }

    // Try as text for anything else
    try {
      const text = await resp.text()
      if (text.length > 0 && text.length < MAX_CHARS * 2) return text.slice(0, MAX_CHARS)
    } catch {}

    return `[Файл: ${f.name}]`
  } catch (e) {
    return `[Ошибка чтения ${f.name}: ${(e as Error).message}]`
  }
}

// ── Load all files ─────────────────────────────────────────────────────────────
const loadAllFiles = async () => {
  const files = classFiles.value
  for (const f of files) {
    if (fileTexts.value[f.url] || loadingSet.value.has(f.url)) continue

    const newSet = new Set(loadingSet.value)
    newSet.add(f.url)
    loadingSet.value = newSet

    // Run in background — don't await all at once to avoid blocking
    readFile(f).then(text => {
      if (text.trim()) {
        fileTexts.value = { ...fileTexts.value, [f.url]: text }
      }
    }).finally(() => {
      const s = new Set(loadingSet.value)
      s.delete(f.url)
      loadingSet.value = s
    })
  }
}

// ── Build system prompt ────────────────────────────────────────────────────────
const buildSystem = (): string => {
  const className = props.className || 'этого класса'
  let sys = `Ты — опытный ИИ-ассистент и педагог класса "${className}". Помогаешь студентам понять материалы, объясняешь темы доступно, помогаешь решать задания и проверяешь работы. Отвечай на русском языке. Будь точным, дружелюбным и педагогически грамотным.`

  // Add assignments context (titles, descriptions, criteria)
  if (props.assignments && props.assignments.length > 0) {
    sys += `\n\n${'='.repeat(60)}\nЗАДАНИЯ КЛАССА:\n${'='.repeat(60)}`
    for (const a of props.assignments) {
      sys += `\n\n[Задание: ${a.title}]`
      if (a.description) {
        // Strip URLs from description for readability
        const cleanDesc = a.description.replace(/(https?:\/\/[^\s]+)/g, '[файл]').trim()
        if (cleanDesc) sys += `\nОписание: ${cleanDesc}`
      }
      try {
        const criteria = JSON.parse(a.criteria)
        if (criteria.length > 0) {
          sys += `\nКритерии оценивания: ${criteria.map((c: any) => `${c.name} (${c.weight} баллов)`).join(', ')}`
        }
      } catch {}
      if (a.max_score) sys += `\nМакс. балл: ${a.max_score}`
      if (a.deadline) sys += `\nДедлайн: ${new Date(a.deadline).toLocaleDateString('ru-RU')}`
    }
    sys += `\n\n${'='.repeat(60)}`
  }

  // Add file contents
  const loaded = Object.entries(fileTexts.value)
  if (loaded.length > 0) {
    sys += `\n\n${'='.repeat(60)}\nМАТЕРИАЛЫ КЛАССА (содержимое прочитанных файлов):\n${'='.repeat(60)}`
    for (const [url, text] of loaded) {
      const name = decodeURIComponent(url.split('/').pop()?.split('?')[0] || url)
      const section = classFiles.value.find(f => f.url === url)?.section || ''
      sys += `\n\n[${section}: ${name}]\n${'-'.repeat(40)}\n${text.slice(0, MAX_CHARS)}`
    }
    sys += `\n\n${'='.repeat(60)}\nКОНЕЦ МАТЕРИАЛОВ`
    sys += `\n\nИНСТРУКЦИИ:\n- Отвечай на вопросы, опираясь на содержимое файлов\n- Цитируй конкретные части при объяснении\n- Помогай решать задания, объясняй метод решения\n- При объяснении используй примеры и понятный язык`
  } else if (classFiles.value.length > 0) {
    sys += `\n\nФайлы класса ещё загружаются (${classFiles.value.map(f => f.name).join(', ')}). Отвечай по теме класса в целом.`
  }

  return sys
}

// ── Grade submission ───────────────────────────────────────────────────────────
const gradeOne = async (sub: Submission) => {
  gradingId.value = sub.id
  try {
    const grade = await svc.aiGrade(sub.id)
    const txt = [
      `✅ **Работа студента ${getStudentName(sub.student_id)} проверена ИИ**`,
      ``,
      `🏅 **Оценка: ${grade.score} баллов**`,
      grade.feedback ? `\n💬 **Фидбек:** ${grade.feedback}` : '',
    ].join('\n')
    msgs.value.push({ id: ++nextId, role: 'assistant', text: txt })
    pendingSubs.value = pendingSubs.value.filter(s => s.id !== sub.id)
    scrollBottom()
    persist()
    toast.ok(`Оценка выставлена: ${grade.score} баллов`)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Ошибка проверки работы')
  } finally { gradingId.value = null }
}

// ── Load pending submissions ───────────────────────────────────────────────────
const loadPending = async () => {
  if (!props.isTeacher || !props.assignmentId) return
  try {
    const [subs, users] = await Promise.all([
      svc.getSubmissions(props.assignmentId),
      usersSvc.all()
    ])
    pendingSubs.value = subs.filter(s => s.status === 'submitted' || s.status === 'late')
    const fnReg: Record<number, string> = JSON.parse(localStorage.getItem('_fullname_registry') || '{}')
    const map: Record<number, string> = {}
    for (const u of users) {
      map[u.id] = fnReg[u.id] || u.full_name || u.fullname || u.name || u.email || `Студент #${u.id}`
    }
    studentMap.value = map
  } catch {}
}

// ── Send ──────────────────────────────────────────────────────────────────────
const pushSend = (text: string) => { inputTxt.value = text; send() }

const send = async () => {
  const text = inputTxt.value.trim()
  if (!text || loading.value) return

  if (aiLimitReached.value) {
    toast.err(`Лимит ИИ исчерпан (${AI_LIMIT} запросов). Обратитесь к администратору.`)
    return
  }

  inputTxt.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'

  msgs.value.push({ id: ++nextId, role: 'user', text })
  scrollBottom()
  persist()
  loading.value = true

  try {
    // Use last 20 messages for context
    const history = msgs.value.slice(-20).map(m => ({ role: m.role, content: m.text }))
    const systemPrompt = buildSystem()

    const { data } = await api.post('/ai/chat', {
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      max_tokens: 2500,
      temperature: 0.55,
    })

    const reply = data.content || '...'
    msgs.value.push({ id: ++nextId, role: 'assistant', text: reply })
    scrollBottom()
    persist()
    if (auth.user?.role === 'student' && !auth.user.ai_unlimited) {
      incrementAiCount(auth.user.id)
    }
  } catch (e: any) {
    toast.err('ИИ: ' + (e?.response?.data?.detail || e.message || 'ошибка соединения'))
  } finally {
    loading.value = false
  }
}

const clearAll = () => {
  msgs.value = []
  try { sessionStorage.removeItem(storageKey.value) } catch {}
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
watch(() => props.classPosts?.length, () => { loadAllFiles() })
watch(() => props.assignments?.length, () => { loadAllFiles() })
watch(msgs, scrollBottom)

onMounted(() => {
  restore()
  nextTick(scrollBottom)
  loadAllFiles()
  loadPending()
})
</script>

<style scoped>
.class-ai { display: flex; flex-direction: column; height: 100%; background: var(--bg); overflow: hidden; }

/* Header */
.ai-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 20px; background: var(--surface); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.ai-header-l { display: flex; align-items: center; gap: 12px; }
.ai-avatar { width: 38px; height: 38px; background: linear-gradient(135deg,#00B1C9,#009aaf); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(0,177,201,.2); }
.ai-name { font-size: 14px; font-weight: 700; color: var(--text1); }
.ai-status-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text4); margin-top: 3px; flex-wrap: wrap; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px rgba(74,222,128,.5); flex-shrink: 0; }
.status-dot.thinking { background: #fbbf24; animation: blink .7s ease-in-out infinite; }
.status-txt { font-size: 12px; color: var(--text4); }
.status-badge { display: flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.loading-badge { background: rgba(251,191,36,.1); color: #fbbf24; border: 1px solid rgba(251,191,36,.2); }
.ready-badge { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:.2} }

.ai-header-r { display: flex; gap: 6px; }
.hdr-btn { position: relative; width: 34px; height: 34px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); color: var(--text3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.hdr-btn:hover, .hdr-btn-active { background: rgba(0,177,201,.1); border-color: rgba(0,177,201,.25); color: var(--teal); }
.hdr-badge { position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; background: var(--teal); border-radius: 8px; font-size: 10px; font-weight: 700; color: #fff; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface); padding: 0 3px; }

/* Body */
.ai-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

/* Sidebar */
.ai-sidebar { width: 265px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 18px; }
.sb-section { display: flex; flex-direction: column; gap: 8px; }
.sb-section-title { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text4); }
.sb-empty { font-size: 12px; color: var(--text4); padding: 4px 0; }
.sb-file-list { display: flex; flex-direction: column; gap: 5px; }
.sb-file { display: flex; align-items: center; gap: 8px; padding: 7px 9px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); transition: all .15s; }
.sb-file-ok { border-color: rgba(74,222,128,.25); background: rgba(74,222,128,.04); }
.sb-file-loading { opacity: .65; }
.sb-emoji { font-size: 15px; flex-shrink: 0; }
.sb-file-info { flex: 1; min-width: 0; }
.sb-file-name { font-size: 12px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-file-section { font-size: 11px; color: var(--text4); }
.sb-file-icon { flex-shrink: 0; width: 16px; display: flex; justify-content: center; }
.sb-sub-list { display: flex; flex-direction: column; gap: 6px; }
.sb-sub { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); }
.sb-sub-name { font-size: 12px; font-weight: 600; color: var(--text1); }
.sb-sub-tags { display: flex; gap: 4px; margin-top: 3px; }
.sub-chip { font-size: 11px; color: var(--text4); background: var(--surface3); padding: 1px 7px; border-radius: 100px; }
.grade-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; background: var(--teal); color: #fff; border: none; border-radius: var(--r-md); font-size: 11px; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit; white-space: nowrap; flex-shrink: 0; }
.grade-btn:disabled { opacity: .5; cursor: not-allowed; }
.grade-btn:not(:disabled):hover { background: #009aaf; }

/* Messages */
.ai-msgs { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }

/* Welcome */
.welcome { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; margin: auto; max-width: 440px; padding: 20px; }
.welcome-orb { width: 72px; height: 72px; background: rgba(0,177,201,.1); border: 2px solid rgba(0,177,201,.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--teal); }
.welcome-title { font-family: 'Outfit',sans-serif; font-size: 21px; font-weight: 900; color: var(--text1); }
.welcome-desc { font-size: 13px; color: var(--text4); line-height: 1.5; }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; margin-top: 8px; }
.quick-btn { display: flex; align-items: center; gap: 9px; padding: 12px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); font-size: 12px; color: var(--text2); cursor: pointer; text-align: left; transition: all .17s; font-family: inherit; }
.quick-btn:hover { background: rgba(0,177,201,.07); border-color: rgba(0,177,201,.25); color: var(--teal); transform: translateY(-1px); }
.quick-icon { font-size: 17px; flex-shrink: 0; }

/* Bubbles */
.msg-row { display: flex; align-items: flex-end; gap: 10px; }
.msg-row.user { flex-direction: row-reverse; }
.msg-av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.ai-av { background: linear-gradient(135deg,#00B1C9,#009aaf); color: #fff; }
.user-av { background: var(--surface3); color: var(--text2); border: 1px solid var(--border2); }
.msg-bubble { max-width: 82%; padding: 11px 15px; border-radius: 18px; font-size: 13.5px; line-height: 1.65; word-break: break-word; }
.msg-row.assistant .msg-bubble { background: var(--surface); border: 1px solid var(--border); color: var(--text1); border-bottom-left-radius: 4px; }
.msg-row.user .msg-bubble { background: linear-gradient(135deg,#00B1C9,#009aaf); color: #fff; border-bottom-right-radius: 4px; }
:deep(.msg-bubble code) { background: rgba(255,255,255,.12); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
:deep(.msg-bubble strong) { font-weight: 700; }
:deep(.msg-bubble em) { font-style: italic; opacity: .9; }

/* Typing indicator */
.typing-bbl { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
.typing-bbl span { width: 6px; height: 6px; border-radius: 50%; background: var(--text4); animation: bounce .8s ease infinite; }
.typing-bbl span:nth-child(2) { animation-delay: .14s; }
.typing-bbl span:nth-child(3) { animation-delay: .28s; }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }

/* Quota bar */
.quota-bar { display: flex; align-items: center; gap: 7px; padding: 7px 18px; font-size: 12px; color: var(--teal); background: rgba(0,177,201,.07); border-top: 1px solid rgba(0,177,201,.12); flex-shrink: 0; }
.quota-bar.warn { color: #b45309; background: rgba(245,158,11,.07); border-top-color: rgba(245,158,11,.15); }
.quota-bar.exhausted { color: var(--red); background: var(--red-l); border-top-color: rgba(248,113,113,.2); }

/* Input bar */
.ai-input-bar { display: flex; align-items: flex-end; gap: 10px; padding: 12px 18px; background: var(--surface); border-top: 1px solid var(--border); flex-shrink: 0; }
.ai-textarea { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 11px 15px; color: var(--text1); font-size: 13.5px; resize: none; line-height: 1.5; max-height: 140px; transition: border-color .15s; font-family: inherit; }
.ai-textarea:focus { border-color: rgba(0,177,201,.45); outline: none; }
.send-btn { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg,#00B1C9,#009aaf); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .18s; flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,177,201,.4); }
.send-btn:disabled { opacity: .35; cursor: not-allowed; box-shadow: none; }
.send-btn:not(:disabled):hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,177,201,.6); }

/* Spinners */
.spin-xs { width: 12px; height: 12px; border: 2px solid var(--border2); border-top-color: var(--teal); border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
.spin-xs.white { border-color: rgba(255,255,255,.3); border-top-color: #fff; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
