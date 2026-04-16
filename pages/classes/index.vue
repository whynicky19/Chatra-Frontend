<template>
  <div class="pg anim-in">
    <div class="pg-body">
      <div class="content-area">
        <!-- Header -->
        <div class="pg-head">
          <div class="pg-head-left">
            <h1 class="pg-title">{{ t('classes.catalog') }}</h1>
            <p class="pg-sub">{{ lang === 'ru' ? 'Исследуйте новые горизонты знаний с нашими интерактивными модулями.' : 'Explore new horizons of knowledge with our interactive modules.' }}</p>
          </div>
          <div class="pg-head-r">
            <button v-if="auth.isTeacher" class="btn btn-outline-teal" @click="showCreate=true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {{ t('classes.create') }}
            </button>
            <button class="btn btn-teal" @click="showJoin=true">
              {{ t('classes.join_code') }}
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div class="classes-grid">
          <template v-if="loading">
            <div v-for="n in 6" :key="n" class="class-card skeleton-card">
              <div class="skel-cover"></div>
              <div class="skel-body">
                <div class="skel-line skel-title"></div>
                <div class="skel-line skel-desc"></div>
                <div class="skel-line skel-desc short"></div>
                <div class="skel-line skel-meta"></div>
              </div>
            </div>
          </template>

          <div v-if="!loading && !visibleClasses.length" class="empty-state" style="grid-column:1/-1">
            <div class="es-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
            <div class="es-title">{{ auth.isTeacher ? t('classes.no_classes_teacher') : t('classes.no_classes') }}</div>
            <div class="es-sub">{{ auth.isTeacher ? t('classes.no_classes_sub_teacher') : t('classes.no_classes_sub_student') }}</div>
            <button class="btn btn-teal es-btn" @click="showJoin=true">{{ t('classes.join_code') }}</button>
          </div>

          <template v-if="!loading && visibleClasses.length">
            <!-- Class cards -->
            <div v-for="cls in visibleClasses" :key="cls.id" class="class-card" @click="goClass(cls.id)">
              <!-- Cover image -->
              <div class="card-cover" :style="cls.cover_image ? {} : {background: coverGrad(cls.id)}">
                <img v-if="cls.cover_image" :src="cls.cover_image" class="card-cover-img"/>
                <!-- Code chip for teachers -->
                <div v-if="auth.isTeacher || auth.isAdmin" class="card-code-chip" @click.stop="copyClassCode(cls.id)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  {{ codeFor(cls.id) }}
                </div>
              </div>

              <!-- Card body -->
              <div class="card-body">
                <div class="card-title-row">
                  <h3 class="card-name">{{ cls.title }}</h3>
                  <div class="card-subject-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  </div>
                </div>
                <p class="card-desc">{{ cls.description || (lang==='ru' ? 'Нажмите для просмотра' : 'Click to view') }}</p>
                <div class="card-meta">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ lectureCount(cls.id) }} {{ lang === 'ru' ? 'уроков' : 'lessons' }}
                </div>
                <div class="card-footer">
                  <div class="card-action-row">
                    <button v-if="!auth.isTeacher" class="card-action-btn" @click.stop="goClass(cls.id)">
                      {{ getActionLabel(cls) }} →
                    </button>
                    <button v-else class="card-action-btn" @click.stop="goClass(cls.id)">
                      {{ lang === 'ru' ? 'Открыть курс' : 'Open course' }} →
                    </button>
                    <div class="card-controls">
                      <button v-if="!auth.isTeacher" class="ctrl-btn" @click.stop="leaveClass(cls.id)" :title="t('classes.left')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      </button>
                      <button v-if="auth.isTeacher" class="ctrl-btn ctrl-del" @click.stop="confirmDelete(cls)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add new class card — STUDENTS ONLY -->
            <div v-if="!auth.isTeacher && !auth.isAdmin" class="class-card add-card" @click="showJoin=true">
              <div class="add-card-inner">
                <div class="add-plus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div class="add-title">{{ lang === 'ru' ? 'Добавить новый предмет в программу' : 'Add new subject to program' }}</div>
                <div class="add-sub">{{ lang === 'ru' ? 'Персонализируйте своё обучение' : 'Personalize your learning' }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- Upcoming deadlines -->
        <div v-if="upcomingAssignments.length" class="deadlines-section">
          <div class="deadlines-label">{{ t('classes.upcoming') }}</div>
          <div class="deadlines-list">
            <div v-for="a in upcomingAssignments" :key="a.id" class="deadline-item">
              <div class="deadline-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
              </div>
              <div class="deadline-info">
                <div class="deadline-title">{{ a.title }}</div>
                <div class="deadline-time">{{ fmtDeadline(a.deadline) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <CreateClassModal v-if="showCreate" @close="showCreate=false" @created="onCreated"/>

    <!-- Join by code modal -->
    <div v-if="showJoin" class="overlay" @click.self="showJoin=false">
      <div class="modal anim-scale join-modal">
        <div class="modal-head">
          <span class="modal-title">{{ t('classes.join_title') }}</span>
          <button class="btn btn-icon btn-ghost" @click="showJoin=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="join-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <p class="join-hint">{{ t('classes.join_hint') }}</p>
        <div class="frow">
          <div class="code-boxes">
            <input v-for="(_, i) in 6" :key="i" :ref="el => { if(el) codeRefs[i] = el as HTMLInputElement }" class="code-box" maxlength="1" :value="codeChars[i]" @input="onCodeInput($event, i)" @keydown="onCodeKey($event, i)" @paste="onCodePaste" inputmode="text" autocomplete="off" style="text-transform:uppercase"/>
          </div>
          <div v-if="joinError" class="join-err">{{joinError}}</div>
          <div v-if="foundClass" class="join-found">
            <div class="found-cover" :style="foundClass.cover_image ? `background-image:url(${foundClass.cover_image})` : `background:${coverGrad(foundClass.id)}`">
              <div class="found-overlay"></div>
              <span class="found-name">{{foundClass.title}}</span>
            </div>
            <div class="found-meta">{{foundClass.teacher || (lang==='ru'?'Преподаватель':'Teacher')}}</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="showJoin=false">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="joinCode.length<6||joining" @click="joinClass">
            <div v-if="joining" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('classes.join') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div v-if="deletingClass" class="overlay" @click.self="deletingClass=null">
      <div class="modal anim-scale" style="max-width:400px">
        <div class="modal-head">
          <span class="modal-title">{{ t('classes.delete_title') }}</span>
          <button class="btn btn-icon btn-ghost" @click="deletingClass=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="del-body">
          <div class="del-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div>
          <p class="del-text">{{ t('classes.delete_confirm') }} <strong>«{{deletingClass.title}}»</strong>? {{ t('classes.delete_warn') }}</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="deletingClass=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <div v-if="deleting" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(220,38,38,.3);border-top-color:#dc2626"></div>
            <span v-else>{{ t('classes.delete') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { usePostsSvc } from '~/services/posts'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })
const auth = useAuthStore(); const postsSvc = usePostsSvc(); const toast = useToast(); const router = useRouter()
const { t, lang } = useI18n()
const allPosts = ref<any[]>([]); const loading = ref(true); const showCreate = ref(false)
const showJoin = ref(false); const joining = ref(false); const joinError = ref('')
const deletingClass = ref<any>(null); const deleting = ref(false)

const codeChars = ref<string[]>(['','','','','',''])
const codeRefs = ref<HTMLInputElement[]>([])
const joinCode = computed(() => codeChars.value.join(''))

const onCodeInput = (e: Event, i: number) => {
  const val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g,'')
  codeChars.value[i] = val.slice(-1)
  if (val && i < 5) codeRefs.value[i+1]?.focus()
  joinError.value = ''
}
const onCodeKey = (e: KeyboardEvent, i: number) => {
  if (e.key === 'Backspace' && !codeChars.value[i] && i > 0) { codeChars.value[i-1] = ''; codeRefs.value[i-1]?.focus() }
  if (e.key === 'Enter' && joinCode.value.length === 6) joinClass()
}
const onCodePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6) || ''
  text.split('').forEach((c, i) => { if (i < 6) codeChars.value[i] = c })
  codeRefs.value[Math.min(text.length, 5)]?.focus()
}

const joinedKey = computed(() => `_joined_${auth.user?.id||0}`)
const joinedIds = ref<number[]>([])
const loadJoined = () => { try { joinedIds.value = JSON.parse(localStorage.getItem(joinedKey.value)||'[]') } catch { joinedIds.value=[] } }
const saveJoined = () => localStorage.setItem(joinedKey.value, JSON.stringify(joinedIds.value))

const covers = [
  'linear-gradient(135deg,#006475,#009aaf)',
  'linear-gradient(135deg,#0c4a6e,#0369a1)',
  'linear-gradient(135deg,#134e4a,#0d9488)',
  'linear-gradient(135deg,#312e81,#4338ca)',
  'linear-gradient(135deg,#1e3a5f,#2563eb)'
]
const coverGrad = (id: number) => covers[id % covers.length]

const allClasses = computed(() =>
  allPosts.value
    .filter(p => { try { const b=JSON.parse(p.body); return b.type==='class' } catch { return false } })
    .map(p => { try { const b=JSON.parse(p.body); return {...p,...b,title:p.title,cover_image:b.cover_image||null,description:b.description||''} } catch { return p } })
)
const visibleClasses = computed(() => auth.isAdmin ? allClasses.value : allClasses.value.filter(c => joinedIds.value.includes(c.id)))
const lectureCount = (classId: number) => allPosts.value.filter(p => p.title?.startsWith(`[LECTURE][${classId}]`)).length

const getActionLabel = (cls: any) => {
  const count = lectureCount(cls.id)
  if (count === 0) return lang.value === 'ru' ? 'Начать обучение' : 'Start learning'
  return lang.value === 'ru' ? 'Продолжить обучение' : 'Continue learning'
}

const codeFor = (id: number) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = ''; let n = id*1337+42
  for(let i=0;i<6;i++){code+=chars[n%chars.length];n=Math.floor(n/chars.length)+id*7}
  return code.slice(0,6)
}
const foundClass = computed(() => {
  if (joinCode.value.length < 6) return null
  return allClasses.value.find(c => codeFor(c.id) === joinCode.value.toUpperCase()) || null
})

const upcomingAssignments = computed(() => {
  const now = new Date()
  return allPosts.value
    .filter(p => { try { const b=JSON.parse(p.body); return b.type==='assignment' && b.deadline && new Date(b.deadline) > now } catch { return false } })
    .map(p => { try { const b=JSON.parse(p.body); return {...b, id:p.id, title:p.title} } catch { return null } })
    .filter(Boolean).slice(0, 3)
})
const fmtDeadline = (d: string) => {
  if (!d) return ''
  try {
    const diff = new Date(d).getTime() - Date.now()
    const hrs = Math.round(diff/3600000)
    if (hrs < 24) return `СРОК ЧЕРЕЗ ${hrs} ЧАС${hrs===1?'':'А'}`
    return `ЗАВТРА, ${new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`
  } catch { return d }
}

const joinClass = () => {
  joining.value = true; joinError.value = ''
  const found = foundClass.value
  setTimeout(() => {
    if (!found) { joinError.value = t('classes.not_found'); joining.value=false; return }
    if (!joinedIds.value.includes(found.id)) { joinedIds.value.push(found.id); saveJoined() }
    joining.value=false; showJoin.value=false; codeChars.value=['','','','','','']
    toast.ok(`${t('classes.joined')} ${found.title}`)
  }, 400)
}
const leaveClass = (id: number) => { joinedIds.value = joinedIds.value.filter(i => i !== id); saveJoined(); toast.ok(t('classes.left_ok')) }
const confirmDelete = (cls: any) => { deletingClass.value = cls }
const doDelete = async () => {
  if (!deletingClass.value) return
  deleting.value = true
  try { await postsSvc.remove(deletingClass.value.id); allPosts.value = allPosts.value.filter(p => p.id !== deletingClass.value.id); toast.ok(t('general.delete')); deletingClass.value = null }
  catch(e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { deleting.value = false }
}
const goClass = (id: number) => router.push(`/classes/${id}`)
const copyClassCode = (id: number) => {
  const code = codeFor(id)
  navigator.clipboard?.writeText(code).then(() => toast.ok(`Код скопирован: ${code}`)).catch(() => toast.ok(`Код: ${code}`))
}
const onCreated = async (cls: any) => { showCreate.value=false; await load(); if (cls?.id && !joinedIds.value.includes(cls.id)) { joinedIds.value.push(cls.id); saveJoined() } }
const load = async () => { loading.value=true; try { allPosts.value=await postsSvc.list() } catch { toast.err(t('general.error')) } finally { loading.value=false } }
watch(() => auth.user?.id, (id) => { if (id) loadJoined() }, { immediate: true })
onMounted(()=>{ load() })
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
.pg-body{flex:1;overflow-y:auto;width:100%}
.content-area{padding:32px 32px 80px;width:100%;box-sizing:border-box}

/* Header */
.pg-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px;gap:20px}
.pg-head-left{flex:1}
.pg-title{font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:var(--text1);margin-bottom:6px;letter-spacing:-.02em}
.pg-sub{font-size:14px;color:var(--text4);line-height:1.5;max-width:500px}
.pg-head-r{display:flex;gap:10px;align-items:center;flex-shrink:0}
.btn-outline-teal{display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--r-md);border:1.5px solid var(--teal);background:transparent;color:var(--teal);font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.btn-outline-teal:hover{background:var(--teal-l)}

/* Grid */
.classes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-bottom:32px;width:100%}

/* Class card — new design */
.class-card{background:var(--surface);border-radius:var(--r-xl);overflow:hidden;cursor:pointer;transition:all .2s;box-shadow:var(--sh-xs);border:1px solid var(--border)}
.class-card:hover{transform:translateY(-4px);box-shadow:var(--sh-md);border-color:rgba(0,177,201,.2)}

.card-cover{position:relative;height:200px;overflow:hidden;background:linear-gradient(135deg,#006475,#009aaf)}
.card-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.card-code-chip{position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;background:rgba(0,0,0,.5);color:rgba(255,255,255,.95);padding:4px 10px;border-radius:6px;letter-spacing:.1em;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.18);cursor:pointer;transition:all .15s}
.card-code-chip:hover{background:rgba(0,177,201,.6)}

.card-body{padding:18px 18px 16px}
.card-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px}
.card-name{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;color:var(--text1);line-height:1.25;flex:1}
.card-subject-icon{width:30px;height:30px;border-radius:var(--r-sm);background:var(--teal-l);border:1px solid rgba(0,177,201,.2);display:flex;align-items:center;justify-content:center;color:var(--teal);flex-shrink:0}
.card-desc{font-size:13px;color:var(--text4);line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-meta{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text4);margin-bottom:14px}
.card-footer{border-top:1px solid var(--border);padding-top:14px}
.card-action-row{display:flex;align-items:center;justify-content:space-between}
.card-action-btn{font-size:13px;font-weight:600;color:var(--teal);background:none;border:none;cursor:pointer;padding:0;transition:opacity .15s;font-family:inherit}
.card-action-btn:hover{opacity:.75}
.card-controls{display:flex;gap:6px}
.ctrl-btn{width:28px;height:28px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.ctrl-btn:hover{background:var(--surface3);color:var(--text2)}
.ctrl-del:hover{background:var(--red-l);border-color:rgba(220,38,38,.3);color:var(--red)}

/* Add card */
.add-card{background:var(--surface);border:2px dashed var(--border);cursor:pointer;transition:all .2s;min-height:310px;display:flex}
.add-card:hover{border-color:rgba(0,177,201,.4);background:var(--teal-l)}
.add-card-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;gap:12px;flex:1}
.add-plus{width:48px;height:48px;border-radius:50%;border:2px dashed rgba(0,177,201,.4);color:var(--text4);display:flex;align-items:center;justify-content:center;background:var(--surface2)}
.add-card:hover .add-plus{border-color:var(--teal);color:var(--teal)}
.add-title{font-size:15px;font-weight:700;color:var(--text2);line-height:1.3}
.add-sub{font-size:13px;color:var(--text4);max-width:160px;line-height:1.5}

/* Deadlines */
.deadlines-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:20px 22px}
.deadlines-label{font-size:11px;font-weight:800;color:var(--text4);letter-spacing:.1em;margin-bottom:14px}
.deadlines-list{display:flex;flex-direction:column;gap:12px}
.deadline-item{display:flex;align-items:center;gap:12px}
.deadline-icon{width:34px;height:34px;border-radius:var(--r-sm);background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text4);flex-shrink:0}
.deadline-info{flex:1}
.deadline-title{font-size:13px;font-weight:600;color:var(--text1)}
.deadline-time{font-size:11px;font-weight:700;color:var(--teal);letter-spacing:.05em;margin-top:2px}

/* Empty state */
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;gap:12px;text-align:center}
.es-icon-wrap{width:72px;height:72px;border-radius:20px;background:var(--teal-l);border:1px solid rgba(0,177,201,.2);display:flex;align-items:center;justify-content:center;color:var(--teal);margin-bottom:8px}
.es-title{font-family:'Outfit',sans-serif;font-size:20px;font-weight:700;color:var(--text2)}
.es-sub{font-size:14px;color:var(--text4);max-width:300px;line-height:1.6}
.es-btn{margin-top:8px}

/* Join modal */
.join-modal{max-width:400px;width:100%}
.join-icon-wrap{width:50px;height:50px;border-radius:14px;background:var(--teal-l);border:1px solid rgba(0,177,201,.2);display:flex;align-items:center;justify-content:center;color:var(--teal);margin:0 auto 12px}
.join-hint{font-size:13px;color:var(--text3);text-align:center;margin-bottom:20px;line-height:1.6}
.code-boxes{display:flex;gap:8px;justify-content:center;margin-bottom:12px}
.code-box{width:44px;height:52px;border:2px solid var(--border);border-radius:var(--r-md);background:var(--surface2);color:var(--text1);font-size:22px;font-weight:800;text-align:center;font-family:'Outfit',monospace;letter-spacing:.05em;transition:all .15s;outline:none}
.code-box:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(0,177,201,.15);background:rgba(0,177,201,.05)}
.join-err{font-size:12px;color:var(--red);text-align:center;font-weight:500;margin-top:4px}
.join-found{margin-top:12px;border-radius:var(--r-lg);overflow:hidden;border:1px solid rgba(0,177,201,.25)}
.found-cover{position:relative;height:60px;background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:10px 14px}
.found-overlay{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.6),transparent)}
.found-name{position:relative;z-index:1;font-size:14px;font-weight:700;color:#fff}
.found-meta{padding:8px 14px;font-size:12px;color:var(--text4);background:var(--surface2)}

/* Delete modal */
.del-body{display:flex;align-items:flex-start;gap:14px;padding:4px 0 18px}
.del-icon{width:44px;height:44px;border-radius:var(--r-md);background:var(--red-l);border:1px solid rgba(220,38,38,.2);display:flex;align-items:center;justify-content:center;color:var(--red);flex-shrink:0}
.del-text{font-size:14px;color:var(--text2);line-height:1.7}
/* Skeleton loader */
@keyframes skel-shine{0%{background-position:-200px 0}100%{background-position:calc(200px + 100%) 0}}
.skeleton-card{pointer-events:none;cursor:default}
.skeleton-card:hover{transform:none!important;box-shadow:var(--sh-xs)!important;border-color:var(--border)!important}
.skel-cover{height:200px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:400px 100%;animation:skel-shine 1.4s ease infinite}
.skel-body{padding:18px 18px 16px;display:flex;flex-direction:column;gap:10px}
.skel-line{border-radius:6px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:400px 100%;animation:skel-shine 1.4s ease infinite}
.skel-title{height:18px;width:70%}
.skel-desc{height:12px;width:90%}
.skel-desc.short{width:55%}
.skel-meta{height:11px;width:40%;margin-top:4px}

@media (max-width:768px) {
  .content-area { padding: 16px 12px 80px; }
  .pg-head { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
  .pg-head-left { width: 100%; }
  .pg-head-r { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 8px; }
  .pg-title { font-size: 22px; }
  .pg-sub { font-size: 13px; }
  .btn-outline-teal { min-height: 44px; padding: 10px 16px; }
  .classes-grid { grid-template-columns: 1fr; gap: 14px; }
  .card-cover { height: 160px; }
  .skel-cover { height: 160px; }
  .add-card { min-height: 120px; }
  .add-card-inner { padding: 24px 16px; }
  .ctrl-btn { width: 44px; height: 44px; border-radius: var(--r-md); }
  .card-action-btn { font-size: 14px; min-height: 44px; padding: 0 4px; }
  .code-box { width: 40px; height: 48px; font-size: 18px; }
  .code-boxes { gap: 6px; }
  .join-modal { max-width: 100%; }
  .deadlines-section { padding: 16px; }
}
@media (max-width:480px) {
  .content-area { padding: 12px 10px 80px; }
  .code-box { width: 36px; height: 44px; font-size: 16px; }
  .code-boxes { gap: 4px; }
}
</style>
