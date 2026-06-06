<template>
  <div class="pg">
    <div class="pg-head">
      <div>
        <h1 class="pg-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Админ-панель
        </h1>
      </div>
    </div>
    <div class="pg-body">
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <div class="stat-val">{{users.length}}</div>
          <div class="stat-lbl">Пользователей</div>
        </div>
        <div class="stat-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <div class="stat-val">{{chatsCount}}</div>
          <div class="stat-lbl">Чатов</div>
        </div>
        <div class="stat-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <div class="stat-val">{{classesCount}}</div>
          <div class="stat-lbl">Классов</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" style="margin-bottom:20px">
        <button :class="['tab-btn',{active:tab==='users'}]" @click="tab='users'">Пользователи</button>
        <button :class="['tab-btn',{active:tab==='actions'}]" @click="tab='actions'">Действия</button>
        <button :class="['tab-btn',{active:tab==='classes'}]" @click="switchToClasses">Классы</button>
        <button :class="['tab-btn','tab-ai-btn',{active:tab==='ai-usage'}]" @click="switchToAiUsage">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Запросы к ИИ
        </button>
      </div>

      <!-- Users tab -->
      <div v-if="tab==='users'">
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
          <div class="search-wrap" style="flex:1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text4)"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input v-model="sq" class="search-inp" placeholder="Поиск пользователей..."/>
          </div>
          <button class="btn btn-blue btn-sm" @click="showCreate=true">+ Создать</button>
        </div>
        <div v-if="loadingU" style="display:flex;justify-content:center;padding:24px"><div class="spinner"></div></div>
        <div v-else class="users-table">
          <table>
            <thead><tr><th>Имя</th><th>Email</th><th>Роль</th><th>ИИ доступ</th><th>Дата регистрации</th><th></th></tr></thead>
            <tbody>
              <tr v-for="u in fUsers" :key="u.id">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div :class="['av','av-sm',colorFor(u.id)]">{{(u.full_name || u.email)[0].toUpperCase()}}</div>
                    <span style="font-size:13px;font-weight:500">{{u.full_name || u.email.split('@')[0]}}</span>
                  </div>
                </td>
                <td style="font-size:13px;color:var(--text3)">{{u.email}}</td>
                <td>
                  <span :class="['badge',u.role==='admin'?'badge-blue':'badge-gray']">{{u.role}}</span>
                </td>
                <td>
                  <div v-if="u.role==='student'" style="display:flex;align-items:center;gap:6px">
                    <span :class="['ai-quota-badge', u.ai_unlimited ? 'unlimited' : 'limited']">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      {{ u.ai_unlimited ? 'Безлимит' : '5 запросов' }}
                    </span>
                    <button
                      :class="['btn btn-sm', u.ai_unlimited ? 'btn-ghost' : 'btn-blue']"
                      :disabled="togglingAi[u.id]"
                      style="font-size:11px;padding:3px 8px"
                      @click="toggleAiUnlimited(u)"
                    >
                      <div v-if="togglingAi[u.id]" class="spinner" style="width:10px;height:10px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
                      <span v-else>{{ u.ai_unlimited ? 'Ограничить' : 'Разрешить' }}</span>
                    </button>
                  </div>
                  <span v-else style="font-size:12px;color:var(--text4)">—</span>
                </td>
                <td style="font-size:12px;color:var(--text4)">{{today}}</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <select :value="u.role" class="role-sel" :disabled="u.id===auth.user?.id" @change="setRole(u.id,($event.target as HTMLSelectElement).value)">
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                    <button v-if="u.is_active" class="btn btn-icon btn-ghost btn-sm" :disabled="u.id===auth.user?.id" @click="doBlock(u.id)" title="Заблокировать">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    </button>
                    <button v-else class="btn btn-icon btn-ghost btn-sm" @click="doUnblock(u.id)" title="Разблокировать">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="btn btn-icon btn-danger btn-sm" :disabled="u.id===auth.user?.id" @click="doDel(u.id)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!fUsers.length"><td colspan="6" style="text-align:center;padding:24px;color:var(--text4);font-size:13px">Пользователи не найдены</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions tab -->
      <div v-else-if="tab==='actions'">
        <div class="action-cards">
          <div class="action-card">
            <div class="action-icon" style="background:var(--blue-l)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <div class="action-title">Создать пользователя</div>
              <div class="action-desc">Добавить нового участника</div>
            </div>
            <button class="btn btn-blue btn-sm" @click="showCreate=true">Создать</button>
          </div>
        </div>
      </div>

      <!-- AI Usage tab -->
      <div v-else-if="tab==='ai-usage'">
        <!-- Summary cards per class -->
        <div v-if="aiSummary.length" class="ai-summary-row">
          <div
            v-for="s in aiSummary"
            :key="s.class_id ?? 'general'"
            :class="['ai-sum-card', { active: aiFilterClass === s.class_id }]"
            @click="setClassFilter(s.class_id)"
          >
            <div class="ai-sum-top">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span class="ai-sum-label">{{ s.class_id ? 'Класс #' + s.class_id : 'Общий чат' }}</span>
            </div>
            <div class="ai-sum-tokens">{{ s.total_tokens.toLocaleString() }}</div>
            <div class="ai-sum-meta">токенов · {{ s.request_count }} запросов</div>
          </div>
        </div>

        <!-- Controls bar -->
        <div class="ai-controls">
          <div class="ai-filter-row">
            <div class="search-wrap" style="flex:1;max-width:260px">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text4)"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <select v-model="aiFilterClass" class="search-inp" style="cursor:pointer" @change="loadAiUsage(1)">
                <option :value="null">Все классы</option>
                <option v-for="s in aiSummary" :key="s.class_id ?? 'g'" :value="s.class_id">
                  {{ s.class_id ? 'Класс #' + s.class_id : 'Общий чат' }}
                </option>
              </select>
            </div>
            <div class="ai-total-badge" v-if="aiTotal > 0">
              Итого: {{ aiTotalTokens.toLocaleString() }} токенов
            </div>
            <button class="btn btn-ghost btn-sm" @click="loadAiUsage(aiPage)" :disabled="aiLoading">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="aiLoading?'spin':''"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              Обновить
            </button>
          </div>
        </div>

        <!-- Table -->
        <div v-if="aiLoading" style="display:flex;justify-content:center;padding:32px"><div class="spinner"></div></div>
        <div v-else class="users-table ai-table">
          <table>
            <thead>
              <tr>
                <th style="width:50px">#</th>
                <th>Дата</th>
                <th>Класс</th>
                <th>Тип</th>
                <th>Пользователь</th>
                <th style="text-align:right">Входящие</th>
                <th style="text-align:right">Исходящие</th>
                <th style="text-align:right">Всего токенов</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in aiLogs" :key="item.id">
                <td style="color:var(--text4);font-size:11px">{{ (aiPage - 1) * aiPageSize + idx + 1 }}</td>
                <td style="font-size:12px;color:var(--text3);white-space:nowrap">{{ fmtDate(item.created_at) }}</td>
                <td>
                  <span v-if="item.class_id" class="ai-class-chip">Класс #{{ item.class_id }}</span>
                  <span v-else class="ai-class-chip ai-class-general">Общий</span>
                </td>
                <td>
                  <span :class="['ai-type-chip', item.endpoint === 'ai-grade' ? 'ai-type-grade' : 'ai-type-chat']">
                    {{ item.endpoint === 'ai-grade' ? '📋 Проверка' : '💬 Чат' }}
                  </span>
                </td>
                <td style="font-size:12px;color:var(--text3)">{{ getUserEmail(item.user_id) }}</td>
                <td style="text-align:right;font-size:12px;font-variant-numeric:tabular-nums">{{ item.prompt_tokens.toLocaleString() }}</td>
                <td style="text-align:right;font-size:12px;font-variant-numeric:tabular-nums">{{ item.completion_tokens.toLocaleString() }}</td>
                <td style="text-align:right">
                  <span class="token-badge">{{ item.total_tokens.toLocaleString() }}</span>
                </td>
              </tr>
              <tr v-if="!aiLogs.length">
                <td colspan="8" style="text-align:center;padding:32px;color:var(--text4);font-size:13px">
                  <div style="font-size:28px;margin-bottom:8px">🤖</div>
                  Запросов к ИИ пока нет
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="aiTotal > aiPageSize" class="ai-pagination">
          <button class="btn btn-ghost btn-sm" :disabled="aiPage <= 1" @click="loadAiUsage(aiPage - 1)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            Назад
          </button>
          <span style="font-size:13px;color:var(--text3)">
            Стр. {{ aiPage }} / {{ Math.ceil(aiTotal / aiPageSize) }} · {{ aiTotal }} записей
          </span>
          <button class="btn btn-ghost btn-sm" :disabled="aiPage >= Math.ceil(aiTotal / aiPageSize)" @click="loadAiUsage(aiPage + 1)">
            Вперёд
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <!-- Classes tab -->
      <div v-else-if="tab==='classes'">
        <div v-if="loadingCl" style="display:flex;justify-content:center;padding:24px"><div class="spinner"></div></div>
        <div v-else class="cl-grid">
          <div v-for="cl in classes" :key="cl.id" class="cl-card" @click="openClass(cl)">
            <div class="cl-cover" :style="cl.cover_image ? `background-image:url(${cl.cover_image})` : `background:${coverGrad(cl.id)}`">
            </div>
            <div class="cl-body">
              <div class="cl-name">{{ cl.name }}</div>
              <div class="cl-sub">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {{ cl.teacher || creatorName(cl.created_by) }}
                <template v-if="cl.group"> · {{ cl.group }}</template>
              </div>
            </div>
          </div>
          <div v-if="!classes.length" style="padding:24px;color:var(--text4);font-size:13px">Классов нет</div>
        </div>
      </div>
    </div>

    <!-- Class detail modal -->
    <div v-if="showMembers" class="overlay" @click.self="showMembers=false">
      <div class="modal anim-scale cl-detail-modal">
        <!-- Cover header -->
        <div class="cl-modal-cover" :style="selectedClass?.cover_image ? `background-image:url(${selectedClass.cover_image})` : `background:${coverGrad(selectedClass?.id||0)}`">
          <button class="btn btn-icon cl-modal-close" @click="showMembers=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div class="cl-modal-title">{{ selectedClass?.name }}</div>
          <div v-if="selectedClass?.group" class="cl-modal-group">{{ selectedClass.group }}</div>
        </div>

        <div class="cl-modal-body">
          <!-- Creator -->
          <div class="cl-section">
            <div class="cl-section-label">Создатель</div>
            <div v-if="classCreator" class="member-row">
              <div :class="['av','av-sm',colorFor(classCreator.id)]">{{ (classCreator.full_name||classCreator.email||'?')[0].toUpperCase() }}</div>
              <div class="member-info">
                <div class="member-name">{{ classCreator.full_name || classCreator.email.split('@')[0] }}</div>
                <div class="member-email">{{ classCreator.email }}</div>
              </div>
              <span :class="['badge', classCreator.role==='admin'?'badge-blue':'badge-gray']">{{ classCreator.role }}</span>
            </div>
            <div v-else style="font-size:13px;color:var(--text4);padding:8px 0">Неизвестно</div>
          </div>

          <!-- Members -->
          <div class="cl-section">
            <div class="cl-section-label">
              Участники
              <span v-if="!loadingMembers" class="cl-count-badge">{{ membersList.length }}</span>
            </div>
            <div v-if="loadingMembers" style="display:flex;justify-content:center;padding:20px"><div class="spinner"></div></div>
            <div v-else-if="!membersList.length" class="cl-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span>Участников нет</span>
            </div>
            <div v-else class="members-list">
              <div v-for="m in membersList" :key="m.id" class="member-row">
                <div :class="['av','av-sm',colorFor(m.id)]">{{ (m.full_name||m.email||'?')[0].toUpperCase() }}</div>
                <div class="member-info">
                  <div class="member-name">{{ m.full_name || m.email.split('@')[0] }}</div>
                  <div class="member-email">{{ m.email }}{{ m.group ? ' · ' + m.group : '' }}</div>
                </div>
                <span class="badge badge-gray" style="font-size:10px">{{ m.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create user modal -->
    <div v-if="showCreate" class="overlay" @click.self="showCreate=false">
      <div class="modal anim-scale">
        <div class="modal-head"><span class="modal-title">Создать пользователя</span><button class="btn btn-icon btn-ghost" @click="showCreate=false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
        <div class="frow"><label class="flabel">Email</label><input v-model="nu.e" type="email" class="input" placeholder="user@company.com"/></div>
        <div class="frow"><label class="flabel">Пароль</label><input v-model="nu.p" type="password" class="input" placeholder="Минимум 6 символов"/></div>
        <div class="frow"><label class="flabel">Роль</label><select v-model="nu.r" class="input"><option value="student">Студент</option><option value="teacher">Учитель</option><option value="admin">Администратор</option></select></div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="showCreate=false">Отмена</button>
          <button class="btn btn-blue" :disabled="!nu.e||!nu.p||crU" @click="createU">
            <div v-if="crU" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div><span v-else>Создать</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useToast } from '~/composables/useToast'
import { useAdminSvc } from '~/services/admin'
import { useClassesSvc } from '~/services/classes'
import { useAssignmentsSvc } from '~/services/assignments'
import { useChatsSvc } from '~/services/chats'
import { usePostsSvc } from '~/services/posts'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })
const auth = useAuthStore(); const toast = useToast(); const adminSvc = useAdminSvc()
const { t, lang } = useI18n()
const chatsSvc = useChatsSvc(); const postsSvc = usePostsSvc(); const classesSvc = useClassesSvc(); const assignSvc = useAssignmentsSvc()
const tab = ref('users'); const users = ref<any[]>([]); const loadingU = ref(false); const sq = ref(''); const showCreate = ref(false); const crU = ref(false)
const togglingAi = ref<Record<number, boolean>>({})
const nu = ref({ e: '', p: '', r: 'student' }); const chatsCount = ref(0); const classesCount = ref(0)
const today = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
const avColors = ['bg-b0', 'bg-b1', 'bg-b2', 'bg-b3', 'bg-b4', 'bg-b5']
const colorFor = (id: number) => avColors[id % avColors.length]
const fUsers = computed(() => users.value.filter(u => {
  const q = sq.value.toLowerCase()
  return u.email.toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)
}))

// ── AI Usage ──────────────────────────────────────────────────────────────────
const aiLogs = ref<any[]>([]); const aiSummary = ref<any[]>([]); const aiTotal = ref(0)
const aiPage = ref(1); const aiPageSize = 50; const aiLoading = ref(false)
const aiFilterClass = ref<number | null>(null)
const aiTotalTokens = computed(() => aiSummary.value.filter((s: any) => aiFilterClass.value === null || s.class_id === aiFilterClass.value).reduce((sum: number, s: any) => sum + (s.total_tokens || 0), 0))
const userMap = computed(() => { const m: Record<number, string> = {}; for (const u of users.value) m[u.id] = u.full_name || u.email; return m })
const getUserEmail = (uid: number | null) => uid ? (userMap.value[uid] || '#' + uid) : '—'
const fmtDate = (iso: string) => { if (!iso) return '—'; try { const d = new Date(iso); return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) } catch { return iso } }
const loadAiUsage = async (page = 1) => { aiLoading.value = true; aiPage.value = page; try { const params: any = { page, page_size: aiPageSize }; if (aiFilterClass.value !== null) params.class_id = aiFilterClass.value; const res = await adminSvc.aiUsage(params); aiLogs.value = res.items; aiTotal.value = res.total } catch { toast.err('Ошибка загрузки данных ИИ') } finally { aiLoading.value = false } }
const loadAiSummary = async () => { try { aiSummary.value = await adminSvc.aiUsageSummary() } catch {} }
const setClassFilter = (classId: number | null) => { aiFilterClass.value = aiFilterClass.value === classId ? null : classId; loadAiUsage(1) }
const switchToAiUsage = () => { tab.value = 'ai-usage'; if (!aiLogs.value.length && !aiLoading.value) loadAiUsage(1) }

// ── Classes ───────────────────────────────────────────────────────────────────
const clCovers = ['linear-gradient(135deg,#006475,#009aaf)','linear-gradient(135deg,#0c4a6e,#0369a1)','linear-gradient(135deg,#134e4a,#0d9488)','linear-gradient(135deg,#312e81,#4338ca)','linear-gradient(135deg,#1e3a5f,#2563eb)']
const coverGrad = (id: number) => clCovers[id % clCovers.length]

const classes = ref<any[]>([]); const loadingCl = ref(false)
const showMembers = ref(false); const membersList = ref<any[]>([]); const loadingMembers = ref(false)
const selectedClass = ref<any>(null)
const classCreator = computed(() => selectedClass.value?.created_by ? users.value.find(u => u.id === selectedClass.value.created_by) ?? null : null)
const creatorName = (id: number) => { const u = users.value.find(u => u.id === id); return u ? (u.full_name || u.email) : id ? '#' + id : '—' }

const loadClassesFromPosts = async () => {
  const allPosts = await postsSvc.list()
  const classPosts = allPosts.filter((p: any) => {
    try { return JSON.parse(p.body).type === 'class' } catch { return false }
  })
  return classPosts.map((p: any) => {
    let body: any = {}
    try { body = JSON.parse(p.body) } catch {}
    return {
      id: p.id,
      name: p.title,
      // body.created_by is stored by CreateClassModal; fall back to any post-level field
      created_by: body.created_by ?? p.author_id ?? p.user_id ?? p.created_by ?? null,
      cover_image: body.cover_image || null,
      description: body.description || '',
      teacher: body.teacher || '',
      group: body.group || '',
    }
  })
}

const openClass = async (cl: any) => {
  selectedClass.value = cl
  showMembers.value = true
  membersList.value = []; loadingMembers.value = true
  try {
    const memberIds = new Set<number>()

    // 1. Users who called the join API
    const joinMembers: any[] = await classesSvc.members(cl.id).catch(() => [])
    joinMembers.forEach(m => memberIds.add(m.id))

    // 2. Users who submitted work in this class (tracked in assignment system)
    const assignments: any[] = await assignSvc.list(cl.id).catch(() => [])
    const subLists = await Promise.all(
      assignments.map(a => assignSvc.getSubmissions(a.id).catch(() => []))
    )
    subLists.flat().forEach((s: any) => { if (s.student_id) memberIds.add(s.student_id) })

    // 3. The creator (if tracked)
    if (cl.created_by) memberIds.add(cl.created_by)

    // Resolve to full user objects from the admin users list
    membersList.value = users.value.filter(u => memberIds.has(u.id))
  } catch {}
  finally { loadingMembers.value = false }
}
const switchToClasses = async () => {
  tab.value = 'classes'
  if (classes.value.length || loadingCl.value) return
  loadingCl.value = true
  try { classes.value = await loadClassesFromPosts(); classesCount.value = classes.value.length } catch { toast.err('Ошибка загрузки классов') }
  finally { loadingCl.value = false }
}

// ── User actions ──────────────────────────────────────────────────────────────
const toggleAiUnlimited = async (u: any) => {
  togglingAi.value = { ...togglingAi.value, [u.id]: true }
  const newVal = !u.ai_unlimited
  try {
    await adminSvc.setAiUnlimited(u.id, newVal)
    u.ai_unlimited = newVal
    toast.ok(newVal ? 'ИИ доступ открыт' : 'ИИ доступ ограничен')
  } catch { toast.err('Ошибка обновления ИИ доступа') }
  finally { togglingAi.value = { ...togglingAi.value, [u.id]: false } }
}

const setRole = async (id: number, r: string) => { try { await adminSvc.role(id, r); const u = users.value.find(u => u.id === id); if (u) u.role = r; toast.ok('Роль обновлена') } catch { toast.err('Ошибка') } }
const doBlock = async (id: number) => { try { await adminSvc.block(id); const u = users.value.find(u => u.id === id); if (u) u.is_active = false; toast.ok('Заблокирован') } catch { toast.err('Ошибка') } }
const doUnblock = async (id: number) => { try { await adminSvc.unblock(id); const u = users.value.find(u => u.id === id); if (u) u.is_active = true; toast.ok('Разблокирован') } catch { toast.err('Ошибка') } }
const doDel = async (id: number) => { try { await adminSvc.del(id); users.value = users.value.filter(u => u.id !== id); toast.ok('Удалён') } catch { toast.err('Ошибка') } }
const createU = async () => { crU.value = true; try { const u = await adminSvc.create({ email: nu.value.e, password: nu.value.p, role: nu.value.r }); users.value.unshift(u); showCreate.value = false; nu.value = { e: '', p: '', r: 'student' }; toast.ok('Создан') } catch (e: any) { toast.err(e?.response?.data?.detail || 'Ошибка') } finally { crU.value = false } }
onMounted(async () => {
  if (!auth.isAdmin) return
  loadingU.value = true
  try { users.value = await adminSvc.users() } catch {} finally { loadingU.value = false }
  try { const c = await chatsSvc.list(); chatsCount.value = c.length } catch {}
  try { classes.value = await loadClassesFromPosts(); classesCount.value = classes.value.length } catch {}
  loadAiSummary()
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg)}
.pg-head{padding:24px 32px 0;display:flex;align-items:center}
.pg-title{font-size:20px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.pg-body{padding:20px 32px 32px}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;display:flex;align-items:center;gap:12px;box-shadow:var(--sh-xs)}
.stat-val{font-size:22px;font-weight:700}
.stat-lbl{font-size:12px;color:var(--text3)}
.search-wrap{display:flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-md);padding:8px 10px}
.search-inp{flex:1;border:none;background:none;font-size:13px;color:var(--text1)}
.search-inp::placeholder{color:var(--text4)}
.users-table{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.users-table table{width:100%;border-collapse:collapse}
.users-table th{padding:10px 14px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text4);background:var(--surface2);border-bottom:1px solid var(--border)}
.users-table td{padding:10px 14px;border-bottom:1px solid var(--border);font-size:13px}
.users-table tr:last-child td{border-bottom:none}
.users-table tr:hover td{background:var(--surface2)}
.role-sel{border:1px solid var(--border2);border-radius:var(--r-sm);padding:3px 8px;font-size:12px;cursor:pointer;background:var(--surface);color:var(--text1)}
.action-cards{display:flex;flex-direction:column;gap:10px}
.action-card{display:flex;align-items:center;gap:14px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--sh-xs)}
.action-icon{width:40px;height:40px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.action-title{font-size:14px;font-weight:600;margin-bottom:2px}
.action-desc{font-size:12px;color:var(--text3)}
.action-card .btn{margin-left:auto}
.bg-b0{background:#2563eb}.bg-b1{background:#009aaf}.bg-b2{background:#059669}.bg-b3{background:#d97706}.bg-b4{background:#dc2626}.bg-b5{background:#0891b2}
/* AI quota badge */
.ai-quota-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:100px}
.ai-quota-badge.unlimited{background:rgba(52,211,153,.1);color:#10b981;border:1px solid rgba(52,211,153,.25)}
.ai-quota-badge.limited{background:var(--surface2);color:var(--text4);border:1px solid var(--border)}

/* AI Usage */
.tab-ai-btn{display:flex;align-items:center;gap:6px}
.ai-summary-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.ai-sum-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 18px;cursor:pointer;transition:all .18s;min-width:140px}
.ai-sum-card:hover{border-color:rgba(0,177,201,.4);background:rgba(0,177,201,.04)}
.ai-sum-card.active{border-color:rgba(0,177,201,.55);background:rgba(0,177,201,.08)}
.ai-sum-top{display:flex;align-items:center;gap:6px;color:var(--text3);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.ai-sum-tokens{font-size:22px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums}
.ai-sum-meta{font-size:11px;color:var(--text4);margin-top:2px}
.ai-controls{margin-bottom:12px}
.ai-filter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ai-total-badge{font-size:13px;font-weight:600;color:var(--teal);background:rgba(0,177,201,.1);border:1px solid rgba(0,177,201,.2);border-radius:var(--r-md);padding:5px 12px}
.ai-class-chip{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:rgba(0,177,201,.1);color:var(--teal);border:1px solid rgba(0,177,201,.2)}
.ai-class-general{background:rgba(99,102,241,.08);color:#6366f1;border-color:rgba(99,102,241,.2)}
.ai-type-chip{display:inline-block;font-size:11px;padding:2px 8px;border-radius:20px;background:var(--surface2);color:var(--text3);border:1px solid var(--border)}
.ai-type-grade{background:rgba(52,211,153,.08);color:#10b981;border-color:rgba(52,211,153,.2)}
.ai-type-chat{background:rgba(59,130,246,.08);color:#3b82f6;border-color:rgba(59,130,246,.2)}
.token-badge{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:var(--r-sm);background:var(--surface2);color:var(--text1);font-variant-numeric:tabular-nums}
.ai-pagination{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px}
/* Classes grid */
.cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.cl-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;cursor:pointer;transition:all .2s;box-shadow:var(--sh-xs)}
.cl-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md);border-color:rgba(0,177,201,.25)}
.cl-cover{height:130px;background-size:cover;background-position:center;background-repeat:no-repeat}
.cl-body{padding:14px 16px 16px}
.cl-name{font-size:14px;font-weight:700;color:var(--text1);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl-sub{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* Class detail modal */
.cl-detail-modal{max-width:460px;width:100%;padding:0;overflow:hidden}
.cl-modal-cover{height:160px;background-size:cover;background-position:center;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:16px 20px}
.cl-modal-close{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.2);color:#fff;backdrop-filter:blur(4px)}
.cl-modal-close:hover{background:rgba(0,0,0,.65)}
.cl-modal-title{font-size:20px;font-weight:800;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5);margin:0}
.cl-modal-group{font-size:12px;color:rgba(255,255,255,.8);margin-top:3px;font-weight:600}
.cl-modal-body{padding:0 20px 20px}
.cl-section{margin-top:20px}
.cl-section-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--text4);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.cl-count-badge{background:var(--teal);color:#fff;font-size:10px;font-weight:800;padding:1px 7px;border-radius:100px}
.cl-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 0;color:var(--text4);font-size:13px}

/* Members */
.members-list{display:flex;flex-direction:column;max-height:280px;overflow-y:auto}
.member-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.member-row:last-child{border-bottom:none}
.member-info{flex:1;min-width:0}
.member-name{font-size:13px;font-weight:500;color:var(--text1)}
.member-email{font-size:12px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin .7s linear infinite}

@media (max-width:768px) {
  .pg-head { padding: 16px 14px 0; }
  .pg-body { padding: 14px 14px 24px; }
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
  .stat-card { padding: 12px 8px; flex-direction: column; align-items: flex-start; gap: 6px; }
  .stat-val { font-size: 18px; }
  .stat-lbl { font-size: 11px; }
  .users-table { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .users-table table { min-width: 500px; }
  .pg-title { font-size: 17px; }
  .ai-summary-row { gap: 8px; }
  .ai-sum-card { min-width: 110px; padding: 10px 12px; }
  .ai-filter-row { flex-wrap: wrap; gap: 8px; }
  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: nowrap; }
}
@media (max-width:480px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .stat-card { padding: 10px 6px; }
  .stat-val { font-size: 16px; }
}
</style>