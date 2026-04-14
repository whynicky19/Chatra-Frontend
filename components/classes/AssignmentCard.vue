<template>
  <div class="asgn-card" @click="$emit('open', assignment)">
    <!-- Left color accent -->
    <div class="asgn-accent" :class="accentClass"></div>

    <div class="asgn-ico-wrap" :class="icoClass">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    </div>

    <div class="asgn-main">
      <div class="asgn-title">{{ assignment.title }}</div>
      <div v-if="cleanDesc(assignment.description)" class="asgn-desc">{{ truncate(cleanDesc(assignment.description), 90) }}</div>
      <div class="asgn-meta">
        <span v-if="deadline" :class="['meta-due', isOverdue ? 'overdue' : isDueSoon ? 'soon' : '']">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ isOverdue ? 'Просрочено' : 'Через ' + daysLeft }}
        </span>
        <span class="meta-score">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          {{ assignment.max_score }} баллов
        </span>
        <span v-if="submissionCount !== null" class="meta-files">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
          {{ submissionCount }} {{ submissionCount === 1 ? 'файл' : 'файлов' }}
        </span>
      </div>
    </div>

    <div class="asgn-status-wrap">
      <!-- Student status badge -->
      <template v-if="!isTeacher">
        <div v-if="mySubmission?.status === 'graded' && mySubmission.grade" class="status-pill graded">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ mySubmission.grade.score }}/{{ assignment.max_score }}
        </div>
        <div v-else-if="mySubmission?.status === 'grading'" class="status-pill grading">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Проверяется
        </div>
        <div v-else-if="mySubmission?.status === 'submitted'" class="status-pill submitted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Выполнено
        </div>
        <div v-else-if="mySubmission?.status === 'late'" class="status-pill late">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Просрочено
        </div>
        <div v-else-if="isOverdue" class="status-pill late">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Просрочено
        </div>
        <div v-else class="status-pill pending">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          В ожидании
        </div>
      </template>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="asgn-arrow"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Assignment, Submission } from '~/services/assignments'

const props = defineProps<{
  assignment: Assignment
  mySubmission?: Submission | null
  isTeacher?: boolean
  submissionCount?: number | null
}>()

defineEmits(['open'])

const parseUtc = (d: string) => new Date(d.endsWith('Z') || d.includes('+') ? d : d + 'Z')
const parsedDeadline = computed(() => props.assignment.deadline ? parseUtc(props.assignment.deadline) : null)
const isOverdue = computed(() => parsedDeadline.value ? parsedDeadline.value < new Date() : false)
const isDueSoon = computed(() => {
  if (!parsedDeadline.value || isOverdue.value) return false
  return parsedDeadline.value.getTime() - new Date().getTime() < 1000 * 60 * 60 * 48
})

const daysLeft = computed(() => {
  if (!parsedDeadline.value) return ''
  const diff = parsedDeadline.value.getTime() - new Date().getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'сегодня'
  if (days === 1) return '1 дн.'
  return days + ' дн.'
})

const deadline = computed(() => !!parsedDeadline.value)

const accentClass = computed(() => {
  if (!props.mySubmission || !props.isTeacher === false) {
    if (props.mySubmission?.status === 'graded') return 'accent-green'
    if (props.mySubmission?.status === 'grading') return 'accent-purple'
    if (props.mySubmission?.status === 'submitted') return 'accent-green'
    if (isOverdue.value) return 'accent-red'
  }
  return 'accent-blue'
})

const icoClass = computed(() => {
  if (props.mySubmission?.status === 'graded') return 'ico-green'
  if (isOverdue.value) return 'ico-red'
  return 'ico-blue'
})

const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n) + '…' : s
const cleanDesc = (s?: string) => (s || '').replace(/(https?:\/\/[^\s]+)/g, '').replace(/\s+/g, ' ').trim()
</script>

<style scoped>
.asgn-card { display: flex; align-items: center; gap: 16px; padding: 18px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); cursor: pointer; transition: all .18s; position: relative; overflow: hidden; }
.asgn-card:hover { background: var(--surface2); border-color: var(--border2); transform: translateY(-1px); box-shadow: var(--sh-sm); }

.asgn-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
.accent-blue { background: var(--teal); }
.accent-green { background: var(--green); }
.accent-red { background: var(--red); }
.accent-purple { background: #4dd6e8; }

.asgn-ico-wrap { width: 44px; height: 44px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ico-blue { background: rgba(0,177,201,.12); color: var(--teal); border: 1px solid rgba(0,177,201,.18); }
.ico-green { background: rgba(74,222,128,.1); color: var(--green); border: 1px solid rgba(74,222,128,.15); }
.ico-red { background: var(--red-l); color: var(--red); border: 1px solid rgba(248,113,113,.15); }

.asgn-main { flex: 1; min-width: 0; }
.asgn-title { font-size: 14px; font-weight: 700; color: var(--text1); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.asgn-desc { font-size: 12px; color: var(--text3); margin-bottom: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.asgn-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.meta-due, .meta-score, .meta-files { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text4); font-weight: 500; }
.meta-due { color: var(--text3); }
.meta-due.overdue { color: var(--red); }
.meta-due.soon { color: var(--yellow); }
.meta-score { color: var(--teal); font-weight: 600; }

.asgn-status-wrap { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.asgn-arrow { color: var(--text4); }

.status-pill { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.status-pill.submitted { background: rgba(74,222,128,.1); color: var(--green); border: 1px solid rgba(74,222,128,.2); }
.status-pill.graded { background: rgba(74,222,128,.1); color: var(--green); border: 1px solid rgba(74,222,128,.2); }
.status-pill.grading { background: rgba(0,177,201,.1); color: var(--teal); border: 1px solid rgba(0,177,201,.2); }
.status-pill.late { background: var(--red-l); color: var(--red); border: 1px solid rgba(248,113,113,.2); }
.status-pill.pending { background: var(--surface2); color: var(--text3); border: 1px solid var(--border); }
</style>
