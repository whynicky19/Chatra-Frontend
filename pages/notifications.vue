<template>
  <div class="pg">
    <div class="pg-head">
      <h1 class="pg-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        Уведомления
      </h1>
      <button v-if="unreadCount > 0" class="btn btn-ghost btn-sm" @click="markAllRead">Прочитать все</button>
    </div>
    <div class="pg-body">
      <div v-if="loading" style="display:flex;justify-content:center;padding:40px"><div class="spinner"></div></div>
      <div v-else-if="!items.length" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div>Уведомлений нет</div>
      </div>
      <div v-else class="notif-list">
        <div
          v-for="item in sorted"
          :key="item.key"
          :class="['notif-card', { unread: !item.read }]"
          @click="markRead(item.key)"
        >
          <div class="notif-icon" :style="{ background: item.color + '18', border: '1px solid ' + item.color + '30' }">
            <svg v-if="item.type==='assignment'" width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="item.color" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><path d="M9 12h6M9 16h4"/></svg>
            <svg v-else-if="item.type==='deadline'" width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="item.color" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="item.color" stroke-width="2"><polyline points="22 11.08 12 2.18 2 11.08"/><path d="M22 11.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2v-7.92"/><polyline points="7 22 7 12 17 12 17 22"/></svg>
          </div>
          <div class="notif-body">
            <div class="notif-title">{{ item.title }}</div>
            <div class="notif-desc">{{ item.desc }}</div>
            <div class="notif-date">{{ fmtDate(item.date) }}</div>
          </div>
          <div v-if="!item.read" class="unread-dot" :style="{ background: item.color }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAssignmentsSvc } from '~/services/assignments'
import { usePostsSvc } from '~/services/posts'
definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const assignSvc = useAssignmentsSvc()
const postsSvc = usePostsSvc()

interface NotifItem {
  key: string
  type: 'assignment' | 'deadline' | 'grade'
  title: string
  desc: string
  date: string
  color: string
  read: boolean
}

const loading = ref(false)
const items = ref<NotifItem[]>([])

const seenKey = computed(() => `notif_seen_${auth.user?.id}`)
const readSet = ref<Set<string>>(new Set())

const loadSeen = () => {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(seenKey.value)
    readSet.value = new Set(raw ? JSON.parse(raw) : [])
  } catch { readSet.value = new Set() }
}
const saveSeen = () => {
  if (!import.meta.client) return
  localStorage.setItem(seenKey.value, JSON.stringify([...readSet.value]))
}

const markRead = (key: string) => {
  readSet.value.add(key)
  saveSeen()
  const it = items.value.find(i => i.key === key)
  if (it) it.read = true
}
const markAllRead = () => {
  items.value.forEach(i => { readSet.value.add(i.key); i.read = true })
  saveSeen()
}

const unreadCount = computed(() => items.value.filter(i => !i.read).length)

const sorted = computed(() => [...items.value].sort((a, b) => {
  if (a.read !== b.read) return a.read ? 1 : -1
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}))

const fmtDate = (iso: string) => {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

onMounted(async () => {
  loadSeen()
  loading.value = true
  try {
    const [allPosts, subs] = await Promise.all([
      postsSvc.list(),
      assignSvc.mySubmissions().catch(() => [] as any[]),
    ])

    // Classes are stored as posts with type==='class'; their post IDs are the class_ids used in assignments
    const classIds = allPosts
      .filter((p: any) => { try { return JSON.parse(p.body).type === 'class' } catch { return false } })
      .map((p: any) => p.id)

    const perClass = await Promise.all(
      classIds.map((id: number) => assignSvc.list(id).catch(() => [] as any[]))
    )
    const allAssignments: any[] = perClass.flat()

    const now = Date.now()
    const sevenDays = 7 * 24 * 3600 * 1000
    const collected: NotifItem[] = []

    // New assignments (last 7 days)
    for (const a of allAssignments) {
      const age = now - new Date(a.created_at).getTime()
      if (age > sevenDays) continue
      const key = `assignment-${a.id}`
      collected.push({
        key, type: 'assignment',
        title: 'Новое задание',
        desc: a.title,
        date: a.created_at,
        color: '#6366f1',
        read: readSet.value.has(key),
      })
    }

    // Upcoming deadlines (no submission, deadline within 48h)
    const submittedIds = new Set(subs.map((s: any) => s.assignment_id))
    const fortyEightH = 48 * 3600 * 1000
    for (const a of allAssignments) {
      if (!a.deadline || submittedIds.has(a.id)) continue
      const dl = new Date(a.deadline).getTime()
      if (dl < now || dl - now > fortyEightH) continue
      const key = `deadline-${a.id}`
      collected.push({
        key, type: 'deadline',
        title: 'Дедлайн близко',
        desc: `${a.title} — до ${new Date(a.deadline).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
        date: a.deadline,
        color: 'var(--red)',
        read: readSet.value.has(key),
      })
    }

    // Graded submissions
    for (const s of subs) {
      if (s.status !== 'graded') continue
      const a = allAssignments.find((x: any) => x.id === s.assignment_id)
      const key = `grade-${s.id}`
      collected.push({
        key, type: 'grade',
        title: 'Работа проверена',
        desc: a ? `${a.title} — оценка выставлена` : `Работа #${s.id} проверена`,
        date: s.grade?.graded_at || s.submitted_at,
        color: 'var(--teal)',
        read: readSet.value.has(key),
      })
    }

    items.value = collected
  } catch {}
  finally { loading.value = false }
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg);width:100%}
.pg-head{padding:24px 32px 0;display:flex;align-items:center;justify-content:space-between}
.pg-title{font-size:20px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.pg-body{padding:20px 32px 32px}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:16px;padding:80px 0;color:var(--text4);font-size:14px}
.notif-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:10px;width:100%}
.notif-card{display:flex;align-items:flex-start;gap:14px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);cursor:pointer;transition:all .15s;position:relative}
.notif-card:hover{background:var(--surface2);border-color:var(--border2)}
.notif-card.unread{border-left:3px solid;background:var(--surface)}
.notif-icon{width:42px;height:42px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-body{flex:1;min-width:0}
.notif-title{font-size:14px;font-weight:600;margin-bottom:3px;color:var(--text1)}
.notif-desc{font-size:13px;color:var(--text3);margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.notif-date{font-size:11px;color:var(--text4)}
.unread-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:5px}
@media(max-width:768px){
  .pg-head{padding:16px 14px 0}
  .pg-body{padding:14px 14px 24px}
  .notif-list{grid-template-columns:1fr}
}
</style>
