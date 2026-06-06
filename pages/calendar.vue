<template>
  <div class="pg">
    <div class="pg-head">
      <h1 class="pg-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Дедлайны
      </h1>
    </div>
    <div class="pg-body">
      <div v-if="loading" style="display:flex;justify-content:center;padding:40px"><div class="spinner"></div></div>
      <template v-else>
        <div class="cal-layout">
        <div class="cal-left">
        <!-- Mini calendar -->
        <div class="cal-wrap">
          <div class="cal-header">
            <button class="btn btn-icon btn-ghost btn-sm" @click="prevMonth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span class="cal-month-label">{{ monthLabel }}</span>
            <button class="btn btn-icon btn-ghost btn-sm" @click="nextMonth">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div class="cal-grid">
            <div v-for="d in ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']" :key="d" class="cal-dow">{{ d }}</div>
            <div
              v-for="cell in calCells"
              :key="cell.key"
              :class="['cal-cell', {
                'other-month': !cell.inMonth,
                'today': cell.isToday,
                'selected': selectedDateStr === cell.dateStr,
                'has-dead': cell.dots.length > 0,
              }]"
              @click="cell.inMonth && selectDay(cell.dateStr)"
            >
              <span class="cal-num">{{ cell.day }}</span>
              <span v-if="cell.dots.length === 1" class="dot-single" :style="{ background: cell.dots[0] }"></span>
              <span v-else-if="cell.dots.length > 1" class="dot-multi"></span>
            </div>
          </div>
        </div>

        <!-- 7-day strip -->
        <div class="strip-label">Ближайшие 7 дней</div>
        <div class="strip-scroll">
          <div
            v-for="s in strip"
            :key="s.dateStr"
            :class="['strip-day', { 'strip-sel': selectedDateStr === s.dateStr, 'strip-today': s.isToday }]"
            @click="selectDay(s.dateStr)"
          >
            <div class="strip-dow">{{ s.dow }}</div>
            <div class="strip-num">{{ s.num }}</div>
            <div v-if="s.count > 0" class="strip-badge">{{ s.count }}</div>
          </div>
        </div>

        </div><!-- /cal-left -->

        <!-- Day detail — right column -->
        <div class="cal-right">
          <div class="day-detail">
            <div class="detail-label">{{ selectedDateLabel || 'Выберите день' }}</div>
            <div v-if="!selectedDateStr || !dayItems.length" class="detail-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Нет заданий с дедлайном</span>
            </div>
            <div v-for="item in dayItems" :key="item.id" class="detail-card" @click="goToAssignment(item)">
              <div class="detail-check" :class="{ done: item.submitted }">
                <svg v-if="item.submitted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="detail-info">
                <div class="detail-class">{{ item.class_name }}</div>
                <div class="detail-title">{{ item.title }}</div>
                <div class="detail-time" :style="{ color: item.submitted ? 'var(--teal)' : new Date(item.deadline).getTime() - Date.now() < 86400000 ? 'var(--red)' : 'var(--text3)' }">
                  {{ item.submitted ? '✓ Сдано' : ('до ' + item.time) }}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
        </div><!-- /cal-layout -->
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAssignmentsSvc } from '~/services/assignments'
import { usePostsSvc } from '~/services/posts'
definePageMeta({ layout: 'default' })

const router = useRouter()
const assignSvc = useAssignmentsSvc()
const postsSvc = usePostsSvc()
const loading = ref(false)

interface DlItem {
  id: number
  class_id: number
  class_name: string
  title: string
  deadline: string
  submitted: boolean
}
const dlItems = ref<DlItem[]>([])

const today = new Date()
today.setHours(0, 0, 0, 0)
const todayStr = toDateStr(today)

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const selectedDateStr = ref(todayStr)

const prevMonth = () => { if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- } else viewMonth.value-- }
const nextMonth = () => { if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ } else viewMonth.value++ }

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
)

const dotsArr = computed(() => {
  const m: Record<string, string[]> = {}
  for (const d of dlItems.value) {
    if (!d.deadline) continue
    const ds = d.deadline.slice(0, 10)
    if (new Date(ds) < today) continue
    if (!m[ds]) m[ds] = []
    m[ds].push(d.submitted ? 'var(--teal)' : 'var(--red)')
  }
  return m
})

interface CalCell { key: string; day: number; dateStr: string; inMonth: boolean; isToday: boolean; dots: string[] }
const calCells = computed((): CalCell[] => {
  const cells: CalCell[] = []
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const last = new Date(viewYear.value, viewMonth.value + 1, 0)
  let startDow = first.getDay()
  startDow = startDow === 0 ? 6 : startDow - 1

  for (let i = 0; i < startDow; i++) {
    const d = new Date(first); d.setDate(d.getDate() - (startDow - i))
    const ds = toDateStr(d)
    cells.push({ key: `p${i}`, day: d.getDate(), dateStr: ds, inMonth: false, isToday: ds === todayStr, dots: dotsArr.value[ds] || [] })
  }
  for (let i = 1; i <= last.getDate(); i++) {
    const d = new Date(viewYear.value, viewMonth.value, i)
    const ds = toDateStr(d)
    cells.push({ key: ds, day: i, dateStr: ds, inMonth: true, isToday: ds === todayStr, dots: dotsArr.value[ds] || [] })
  }
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(last); d.setDate(d.getDate() + i)
    const ds = toDateStr(d)
    cells.push({ key: `n${i}`, day: d.getDate(), dateStr: ds, inMonth: false, isToday: ds === todayStr, dots: dotsArr.value[ds] || [] })
  }
  return cells
})

const strip = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i)
    const ds = toDateStr(d)
    const count = dlItems.value.filter(x => x.deadline?.slice(0, 10) === ds).length
    return {
      dateStr: ds,
      dow: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      num: d.getDate(),
      isToday: i === 0,
      count,
    }
  })
)

const selectDay = (ds: string) => { selectedDateStr.value = ds }

const dayItems = computed(() =>
  dlItems.value
    .filter(d => d.deadline?.slice(0, 10) === selectedDateStr.value)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .map(d => ({
      ...d,
      time: new Date(d.deadline).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }))
)

const selectedDateLabel = computed(() => {
  if (!selectedDateStr.value) return ''
  return new Date(selectedDateStr.value).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
})

const goToAssignment = (item: DlItem) => {
  router.push(`/classes/${item.class_id}?tab=assignments`)
}

onMounted(async () => {
  loading.value = true
  try {
    const [allPosts, subs] = await Promise.all([
      postsSvc.list(),
      assignSvc.mySubmissions().catch(() => [] as any[]),
    ])

    // Classes are stored as posts with type==='class'; their post IDs are the class_ids used in assignments
    const classPosts = allPosts.filter((p: any) => {
      try { return JSON.parse(p.body).type === 'class' } catch { return false }
    })
    const classIds = classPosts.map((p: any) => p.id)
    const classMap = new Map<number, string>(classPosts.map((p: any) => [p.id, p.title || `Класс #${p.id}`]))

    const perClass = await Promise.all(
      classIds.map((id: number) => assignSvc.list(id).catch(() => [] as any[]))
    )
    const allAssignments: any[] = perClass.flat()

    const submittedIds = new Set(subs.map((s: any) => s.assignment_id))

    dlItems.value = allAssignments
      .filter((a: any) => !!a.deadline)
      .map((a: any) => ({
        id: a.id,
        class_id: a.class_id,
        class_name: classMap.get(a.class_id) ?? `Класс #${a.class_id}`,
        title: a.title,
        deadline: a.deadline,
        submitted: submittedIds.has(a.id),
      }))
  } catch {}
  finally { loading.value = false }
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg);width:100%}
.pg-head{padding:24px 32px 0;display:flex;align-items:center}
.pg-title{font-size:20px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.pg-body{padding:20px 32px 32px}

/* Two-column layout on desktop */
.cal-layout{display:grid;grid-template-columns:minmax(320px,480px) 1fr;gap:24px;align-items:start}
.cal-left{}
.cal-right{}

/* Calendar */
.cal-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px;margin-bottom:20px}
.cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.cal-month-label{font-size:15px;font-weight:700;color:var(--text1);text-transform:capitalize}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal-dow{text-align:center;font-size:11px;font-weight:700;color:var(--text4);padding:6px 0;text-transform:uppercase;letter-spacing:.04em}
.cal-cell{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;border-radius:var(--r-sm);cursor:pointer;transition:background .12s;min-height:46px;justify-content:center}
.cal-cell:hover{background:var(--surface2)}
.cal-cell.other-month .cal-num{color:var(--text4);opacity:.35}
.cal-cell.other-month{cursor:default}
.cal-cell.other-month:hover{background:transparent}
.cal-cell.today .cal-num{background:var(--teal);color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:700}
.cal-cell.selected:not(.today) .cal-num{background:rgba(0,177,201,.15);border:1.5px solid var(--teal);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:var(--teal)}
.cal-num{font-size:13px;font-weight:500;color:var(--text1)}
.dot-single{display:block;width:6px;height:6px;border-radius:50%}
.dot-multi{display:block;width:10px;height:6px;border-radius:3px;background:var(--red)}

/* 7-day strip */
.strip-label{font-size:11px;font-weight:800;color:var(--text4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px}
.strip-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:20px;-webkit-overflow-scrolling:touch}
.strip-day{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);cursor:pointer;transition:all .15s;flex-shrink:0;min-width:60px}
.strip-day:hover{border-color:var(--border2);background:var(--surface2)}
.strip-day.strip-today{border-color:rgba(0,177,201,.4);background:rgba(0,177,201,.06)}
.strip-day.strip-sel{border-color:var(--teal);background:rgba(0,177,201,.12)}
.strip-dow{font-size:10px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:.05em}
.strip-num{font-size:16px;font-weight:700;color:var(--text1)}
.strip-badge{background:var(--teal);color:#fff;font-size:10px;font-weight:800;padding:1px 7px;border-radius:100px}

/* Day detail — right column */
.day-detail{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px;position:sticky;top:0}
.detail-label{font-size:15px;font-weight:700;color:var(--text1);margin-bottom:16px;text-transform:capitalize}
.detail-empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 0;color:var(--text4);font-size:13px}
.detail-card{display:flex;align-items:center;gap:12px;padding:12px 8px;border-bottom:1px solid var(--border);cursor:pointer;border-radius:var(--r-md);transition:background .12s;margin:0 -8px}
.detail-card:last-child{border-bottom:none}
.detail-card:hover{background:var(--surface2)}
.detail-check{width:24px;height:24px;border-radius:50%;border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--text4)}
.detail-check.done{background:rgba(0,177,201,.12);border-color:var(--teal);color:var(--teal)}
.detail-info{flex:1;min-width:0}
.detail-class{font-size:10px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.detail-title{font-size:13px;font-weight:600;color:var(--text1);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.detail-time{font-size:11px;font-weight:700}

@media(max-width:1024px){
  .cal-layout{grid-template-columns:1fr}
  .day-detail{position:static}
}
@media(max-width:768px){
  .pg-head{padding:16px 14px 0}
  .pg-body{padding:14px 14px 24px}
}
</style>
