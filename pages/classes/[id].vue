<template>
  <div class="cd-page">

    <!-- Loading -->
    <div v-if="loading" class="full-load">
      <div class="spin-ring"></div>
    </div>

    <template v-else>
      <!-- ══ Topbar — simplified ══ -->
      <div class="cd-topbar">
        <div class="cd-topbar-left">
          <div class="topbar-breadcrumb">
            <NuxtLink to="/" class="bc-link">{{ t('nav.classes') }}</NuxtLink>
            <span class="bc-sep">›</span>
            <span class="bc-cur">{{ classMeta.subject || classTitle }}</span>
          </div>
        </div>
        <div class="cd-topbar-right">
          <div class="topbar-user-av">
            <img v-if="auth.avatar" :src="auth.avatar" class="tav-img"/>
            <div v-else class="tav-init">{{ uInit }}</div>
          </div>
        </div>
      </div>

      <!-- ══ Main layout ══ -->
      <div class="cd-layout">
        <!-- Left content -->
        <div class="cd-main">
          <!-- Page header with cover image -->
          <div class="page-header" :style="heroStyle">
            <div class="page-header-overlay" v-if="classMeta.cover_image"></div>
            <div class="page-header-top">
              <NuxtLink to="/" class="back-link" :class="{'back-link-dark': classMeta.cover_image}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                {{ t('nav.classes') }}
              </NuxtLink>
              <span class="header-sep" :class="{'sep-dark': classMeta.cover_image}">›</span>
              <span class="header-subject" :class="{'subject-dark': classMeta.cover_image}">{{ (classMeta.subject || '').toUpperCase() }}</span>
            </div>
            <div class="page-header-body">
              <h1 class="page-title" :class="{'title-dark': classMeta.cover_image}">{{ classTitle }}</h1>
              <p class="page-sub" :class="{'sub-dark': classMeta.cover_image}">{{ classMeta.description || classMeta.period || '' }}</p>
            </div>
            <!-- Code chip — always visible, teachers can copy for students -->
            <div class="class-code-row">
              <div class="class-code-chip" @click="copyCode" :title="lang==='ru'?'Нажмите чтобы скопировать код':'Click to copy code'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                {{ lang==='ru' ? 'Код класса:' : 'Class code:' }}
                <strong>{{ classCode }}</strong>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"/><rect x="8" y="8" width="12" height="12" rx="2"/></svg>
              </div>
            </div>

          </div>

          <!-- Tabs -->
          <div class="tabs-wrap">
            <div class="tabs-bar">
              <button :class="['tab-btn', { active: tab === 'lectures' }]" @click="tab = 'lectures'">
                {{ t('class.lectures') }}
                <span v-if="lectures.length" class="tab-num">{{ lectures.length }}</span>
              </button>
              <button :class="['tab-btn', { active: tab === 'materials' }]" @click="tab = 'materials'">
                {{ t('class.materials') }}
                <span v-if="materials.length" class="tab-num">{{ materials.length }}</span>
              </button>
              <button :class="['tab-btn', { active: tab === 'assignments' }]" @click="tab = 'assignments'; loadAssignments()">
                {{ t('class.assignments') }}
                <span v-if="assignments.length" class="tab-num">{{ assignments.length }}</span>
              </button>
              <button :class="['tab-btn tab-ai', { active: tab === 'ai' }]" @click="tab = 'ai'; loadAssignments()">
                ✨ {{ t('class.ai_chat') }}
              </button>
              <div class="tabs-actions tabs-actions-desktop" v-if="isTeacher">
                <button class="btn btn-white btn-sm" @click="showCreateAssignment = true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  {{ t('class.assignment_btn') }}
                </button>
                <button class="btn btn-teal btn-sm" @click="showCreate = true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  {{ t('class.add') }}
                </button>
              </div>
            </div>
            <!-- Teacher actions — separate row on mobile -->
            <div class="tabs-actions-mobile" v-if="isTeacher">
              <button class="btn btn-white btn-sm" @click="showCreateAssignment = true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {{ t('class.assignment_btn') }}
              </button>
              <button class="btn btn-teal btn-sm" @click="showCreate = true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {{ t('class.add') }}
              </button>
            </div>
          </div>

          <!-- Tab content -->
          <div class="tab-content" :class="{ 'ai-mode': tab === 'ai' }">

            <!-- LECTURES -->
            <template v-if="tab === 'lectures'">
              <div class="content-header">
                <h2 class="content-heading">{{ t('class.lectures') }}</h2>
              </div>
              <div v-if="!lectures.length" class="empty-state-card">
                <div class="es-glyph">📖</div>
                <div class="es-h">{{ t('class.no_lectures') }}</div>
                <div class="es-p">{{ isTeacher ? t('class.no_lectures_teacher') : t('class.no_lectures_student') }}</div>
              </div>
              <div v-else class="items-list">
                <div v-for="p in lectures" :key="p.id" class="item-row" @click="viewPost(p, 'lecture')">
                  <div class="item-icon-col">
                    <div class="item-icon lec-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                    </div>
                  </div>
                  <div class="item-body">
                    <div class="item-title">{{ cleanTitle(p.title) }}</div>
                    <div class="item-desc">{{ getPreview(p) }}</div>
                    <div class="item-meta">
                      <span class="meta-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {{ fmtDate(p.created_at) }}
                      </span>
                      <span v-if="countFiles(p)" class="meta-files">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                        {{ countFiles(p) }} {{ pluralFile(countFiles(p)) }}
                      </span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button v-if="isTeacher" class="item-edit" @click.stop="openEditPost(p, 'lecture')" title="Редактировать">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button v-if="isTeacher" class="item-del" @click.stop="deletePost(p.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                    <div class="item-open-btn">{{ lang==='ru'?'Открыть':'Open' }} →</div>
                  </div>
                </div>
              </div>
            </template>

            <!-- MATERIALS -->
            <template v-if="tab === 'materials'">
              <div class="content-header">
                <h2 class="content-heading">{{ t('class.materials') }}</h2>
              </div>
              <div v-if="!materials.length" class="empty-state-card">
                <div class="es-glyph">📦</div>
                <div class="es-h">{{ t('class.no_materials') }}</div>
                <div class="es-p">{{ isTeacher ? t('class.no_materials_teacher') : t('class.no_lectures_student') }}</div>
              </div>
              <div v-else class="items-list">
                <div v-for="p in materials" :key="p.id" class="item-row" @click="viewPost(p, 'material')">
                  <div class="item-icon-col">
                    <div class="item-icon mat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                  </div>
                  <div class="item-body">
                    <div class="item-title">{{ cleanTitle(p.title) }}</div>
                    <div class="item-desc">{{ getPreview(p) }}</div>
                    <div class="item-meta">
                      <span class="meta-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {{ fmtDate(p.created_at) }}
                      </span>
                      <span v-if="countFiles(p)" class="meta-files">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                        {{ countFiles(p) }} {{ pluralFile(countFiles(p)) }}
                      </span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button v-if="isTeacher" class="item-edit" @click.stop="openEditPost(p, 'material')" title="Редактировать">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button v-if="isTeacher" class="item-del" @click.stop="deletePost(p.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                    <div class="item-open-btn">{{ lang==='ru'?'Открыть':'Open' }} →</div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ASSIGNMENTS -->
            <template v-if="tab === 'assignments'">
              <div v-if="loadingAssignments" class="tab-load"><div class="spin-ring"></div></div>
              <template v-else>
                <div class="content-header">
                  <h2 class="content-heading">{{ lang==='ru'?'Лабораторные работы':'Lab Work' }}</h2>
                  <div class="sort-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    {{ t('class.sort_deadline') }}
                  </div>
                </div>
                <div v-if="!assignments.length" class="empty-state-card">
                  <div class="es-glyph">📋</div>
                  <div class="es-h">{{ t('class.no_assignments') }}</div>
                  <div class="es-p">{{ isTeacher ? t('class.no_assignments_teacher') : t('class.no_assignments_student') }}</div>
                </div>
                <div v-else class="items-list">
                  <div v-for="a in assignments" :key="a.id" class="item-row assignment-item" @click="openAssignment(a)">
                    <div class="item-icon-col">
                      <div :class="['item-icon', 'asgn-icon', getStatusIconClass(a)]">
                        <svg v-if="isLate(a)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/><circle cx="12" cy="12" r="10"/></svg>
                        <svg v-else-if="isInProgress(a)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </div>
                    </div>
                    <div class="item-body">
                      <div class="item-row-top">
                        <div class="item-title">{{ a.title }}</div>
                        <div :class="['status-badge', getStatusClass(a)]">{{ getStatusLabel(a) }}</div>
                      </div>
                      <div class="item-desc">{{ a.description }}</div>
                      <div class="item-meta">
                        <span class="meta-date">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {{ fmtDate(a.deadline) }}
                        </span>
                        <span class="meta-pts">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {{ a.max_score }} {{ t('class.pts') }}
                        </span>
                      </div>
                    </div>
                    <div class="item-actions">
                      <button v-if="isTeacher" class="item-edit" @click.stop="openEditAssignment(a)" title="Редактировать">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button v-if="isTeacher" class="item-del" @click.stop="deleteAssignment(a)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                      <button v-if="!isTeacher && isLate(a)" class="btn-late" @click.stop="openAssignment(a)">{{ t('class.submit_late') }}</button>
                      <span v-else-if="!isTeacher && isInProgress(a)" class="btn-continue-link" @click.stop="openAssignment(a)">{{ t('class.continue') }}</span>
                      <span v-else-if="!isTeacher" class="item-preview-link" @click.stop="openAssignment(a)">{{ t('class.preview') }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <!-- AI CHAT -->
            <template v-if="tab === 'ai'">
              <ClassAiChat :class-name="classTitle" :class-posts="classPosts" :is-teacher="isTeacher" :class-id="classId" :assignments="assignments" />
            </template>

          </div>
        </div>

        <!-- Right sidebar -->
        <div class="cd-sidebar" v-if="tab !== 'ai'">
          <!-- Score card — STUDENTS ONLY -->
          <div class="sidebar-card score-card" v-if="!isTeacher">
            <div class="score-label">{{ t('class.your_rating') }}</div>
            <div class="score-num">
              <span class="score-big">{{ avgScoreDisplay }}</span>
              <span class="score-total">/ 100 <span class="score-pts">{{ t('class.pts') }}</span></span>
            </div>
            <div v-if="ratingData.graded_count === 0" class="score-no-grades">
              {{ lang === 'ru' ? 'Нет оценённых заданий' : lang === 'kk' ? 'Бағаланған тапсырмалар жоқ' : 'No graded assignments yet' }}
            </div>
            <template v-else>
              <div class="score-progress-row">
                <div class="sp-label">{{ t('class.progress') }}</div>
                <div class="sp-value">{{ progressPercent }}%</div>
              </div>
              <div class="progress-bar"><div class="pb-fill" :style="{width: progressPercent+'%'}"></div></div>
              <div class="score-progress-row" style="margin-top:10px">
                <div class="sp-label">{{ t('class.performance') }}</div>
                <div class="sp-value">{{ performancePercent }}%</div>
              </div>
              <div class="progress-bar"><div class="pb-fill perf-fill" :style="{width: performancePercent+'%'}"></div></div>
              <div class="score-count">{{ ratingData.graded_count }} {{ lang === 'ru' ? 'задан(ий) оценено' : lang === 'kk' ? 'тапсырма бағаланды' : 'graded' }}</div>
            </template>
          </div>

          <!-- Next deadline -->
          <div class="sidebar-card" v-if="nextDeadline">
            <div class="next-deadline-label">{{ t('class.next_deadline') }}</div>
            <div class="next-deadline-row">
              <div class="deadline-date-box">
                <div class="ddb-month">{{ fmtMonth(nextDeadline.deadline) }}</div>
                <div class="ddb-day">{{ fmtDay(nextDeadline.deadline) }}</div>
              </div>
              <div class="deadline-info">
                <div class="deadline-title">{{ nextDeadline.title }}</div>
                <div class="deadline-remaining">{{ fmtRemaining(nextDeadline.deadline) }}</div>
              </div>
            </div>
            <button class="add-calendar-btn">{{ t('class.add_calendar') }}</button>
          </div>

          <!-- AI learning guide -->
          <div class="sidebar-card">
            <div class="ai-guide-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              {{ t('class.ai_guide') }}
            </div>
            <div class="ai-guide-body">
              <p>{{ aiGuideText }}</p>
              <button class="ai-guide-link" @click="tab='ai'">{{ lang==='ru'?'Помочь нагнать →':'Get help →' }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <CreatePostModal v-if="showCreate" :class-id="classId" @close="showCreate = false" @created="onPostCreated" />
    <CreateAssignmentModal v-if="showCreateAssignment" :class-id="classId" @close="showCreateAssignment = false" @created="onAssignmentCreated" />
    <AssignmentModal v-if="activeAssignment" :assignment="activeAssignment" :is-teacher="isTeacher" @close="activeAssignment = null" @submitted="onSubmitted" />

    <!-- Edit Post Modal -->
    <div v-if="editingPost" class="overlay" @click.self="editingPost=null">
      <div class="modal anim-scale" style="max-width:520px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ lang==='ru' ? (editingPost.type==='lecture'?'Редактировать лекцию':'Редактировать материал') : (editingPost.type==='lecture'?'Edit Lecture':'Edit Material') }}</span>
          <button class="btn btn-icon btn-ghost" @click="editingPost=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0 8px">
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ЗАГОЛОВОК':'TITLE' }}</label>
            <input v-model="editPostForm.title" class="field-input" :placeholder="lang==='ru'?'Заголовок...':'Title...'"/>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'СОДЕРЖИМОЕ':'CONTENT' }}</label>
            <textarea v-model="editPostForm.content" class="field-textarea" rows="8" :placeholder="lang==='ru'?'Текст, ссылки на файлы...':'Text, file links...'"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="editingPost=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="editPostSaving" @click="saveEditPost">
            <div v-if="editPostSaving" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('general.save') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Assignment Modal -->
    <div v-if="editingAssignment" class="overlay" @click.self="editingAssignment=null">
      <div class="modal anim-scale" style="max-width:520px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ lang==='ru'?'Редактировать задание':'Edit Assignment' }}</span>
          <button class="btn btn-icon btn-ghost" @click="editingAssignment=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0 8px;max-height:70vh;overflow-y:auto">
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'НАЗВАНИЕ':'TITLE' }}</label>
            <input v-model="editAsgForm.title" class="field-input" :placeholder="lang==='ru'?'Название задания...':'Assignment title...'"/>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ОПИСАНИЕ':'DESCRIPTION' }}</label>
            <textarea v-model="editAsgForm.description" class="field-textarea" rows="3" :placeholder="lang==='ru'?'Описание...':'Description...'"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="edit-field">
              <label class="field-label">{{ lang==='ru'?'МАКС. БАЛЛ':'MAX SCORE' }}</label>
              <input v-model.number="editAsgForm.max_score" type="number" class="field-input" min="1" max="1000"/>
            </div>
            <div class="edit-field">
              <label class="field-label">{{ lang==='ru'?'ДЕДЛАЙН':'DEADLINE' }}</label>
              <input v-model="editAsgForm.deadline" type="datetime-local" class="field-input"/>
            </div>
          </div>
          <!-- Criteria -->
          <div class="edit-field">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <label class="field-label">{{ lang==='ru'?'КРИТЕРИИ ОЦЕНИВАНИЯ':'GRADING CRITERIA' }}</label>
              <button class="btn-add-criterion" @click="addCriterion">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {{ lang==='ru'?'Добавить':'Add' }}
              </button>
            </div>
            <div class="criteria-edit-list">
              <div v-for="(c, i) in editAsgForm.criteria" :key="i" class="criterion-edit-row">
                <div class="criterion-edit-top">
                  <input v-model="c.name" class="field-input criterion-name-inp" :placeholder="lang==='ru'?'Название критерия...':'Criterion name...'"/>
                  <input v-model.number="c.weight" type="number" class="field-input criterion-weight-inp" min="1" :placeholder="lang==='ru'?'Вес':'Weight'"/>
                  <button class="criterion-del-btn" @click="removeCriterion(i)" :disabled="editAsgForm.criteria.length <= 1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <input v-model="c.description" class="field-input" :placeholder="lang==='ru'?'Описание критерия (необязательно)...':'Criterion description (optional)...'"/>
              </div>
            </div>
            <div class="criteria-total">
              {{ lang==='ru'?'Сумма весов:':'Total weight:' }}
              <strong :style="{color: editAsgForm.criteria.reduce((s,c)=>s+Number(c.weight),0) === editAsgForm.max_score ? 'var(--teal)' : 'var(--yellow)'}">
                {{ editAsgForm.criteria.reduce((s,c)=>s+Number(c.weight),0) }}
              </strong>
              / {{ editAsgForm.max_score }}
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="editingAssignment=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="editAsgSaving" @click="saveEditAssignment">
            <div v-if="editAsgSaving" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('general.save') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Post viewer -->
    <div v-if="viewingPost" class="post-overlay" @click.self="viewingPost = null">
      <div class="post-sheet anim-scale">
        <div class="sheet-head">
          <div class="sheet-badge" :class="viewingPost.type">
            <svg v-if="viewingPost.type === 'lecture'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
            {{ viewingPost.type === 'lecture' ? t('class.lecture_badge') : t('class.material_badge') }}
          </div>
          <button class="btn btn-icon btn-ghost" @click="viewingPost = null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <h2 class="sheet-title">{{ cleanTitle(viewingPost.title) }}</h2>
        <div class="sheet-date">{{ fmtDate(viewingPost.created_at) }}</div>
        <div class="sheet-body" v-html="renderBody(getFullBody(viewingPost))"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
import { useAssignmentsSvc } from '~/services/assignments'
import { useRatingSvc } from '~/services/rating'
import { useAuthStore } from '~/stores/auth.store'
import { useI18n } from '~/composables/useI18n'
import type { Assignment, Submission } from '~/services/assignments'

definePageMeta({ layout: 'default' })

const route = useRoute()
const postsSvc = usePostsSvc()
const assignmentsSvc = useAssignmentsSvc()
const ratingSvc = useRatingSvc()
const toast = useToast()
const auth = useAuthStore()
const { t, lang } = useI18n()

const classId = computed(() => Number(route.params.id))
const isTeacher = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'admin')
const uInit = computed(() => (auth.nickname || auth.user?.email || '?')[0]?.toUpperCase())

const loading = ref(true)
const tab = ref<'lectures' | 'materials' | 'assignments' | 'ai'>('lectures')
const showCreate = ref(false)
const showCreateAssignment = ref(false)
const viewingPost = ref<any>(null)
const activeAssignment = ref<Assignment | null>(null)
const allPosts = ref<any[]>([])
const assignments = ref<Assignment[]>([])
const mySubmissions = ref<Submission[]>([])

// Edit post state
const editingPost = ref<any>(null)
const editPostForm = ref({ title: '', content: '' })
const editPostSaving = ref(false)

// Edit assignment state
const editingAssignment = ref<any>(null)
const editAsgForm = ref<{ title: string; description: string; max_score: number; deadline: string; criteria: Array<{name:string;weight:number;description:string}> }>({ title: '', description: '', max_score: 100, deadline: '', criteria: [] })
const editAsgSaving = ref(false)
const loadingAssignments = ref(false)

// Real rating from backend
const ratingData = ref({ avg_score: 0, avg_percent: 0, graded_count: 0, total_score: 0, max_possible: 0 })
const loadingRating = ref(false)
const assignmentsLoaded = ref(false)

const classPost = computed(() =>
  allPosts.value.find(p => {
    if (p.id !== classId.value) return false
    try { const b = JSON.parse(p.body); return b.type === 'class' } catch { return false }
  }) ?? null
)
const classMeta = computed(() => { if (!classPost.value) return {}; try { return JSON.parse(classPost.value.body) } catch { return {} } })
const classTitle = computed(() => classPost.value?.title || `Класс #${classId.value}`)

// Cover image style for page header
const heroStyle = computed(() => {
  const img = classMeta.value.cover_image
  if (img) return { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
})
const classPosts = computed(() => allPosts.value.filter(p => p.title?.includes(`[${classId.value}]`)))
const lectures = computed(() => classPosts.value.filter(p => p.title?.startsWith('[LECTURE]')))
const materials = computed(() => classPosts.value.filter(p => p.title?.startsWith('[HW]')))

// Sidebar computed — driven by real API rating data
const avgScore = computed(() => ratingData.value.avg_score || null)
const avgScoreDisplay = computed(() => Math.round(ratingData.value.avg_score || 0))
const maxPossibleScore = computed(() => assignments.value.reduce((s, a) => s + (a.max_score || 0), 0) || 100)
const progressPercent = computed(() => {
  if (!assignments.value.length) return 0
  const done = mySubmissions.value.filter(s => s.status === 'submitted' || s.status === 'graded').length
  return Math.round((done / assignments.value.length) * 100)
})
const performancePercent = computed(() => Math.round(ratingData.value.avg_percent || 0))
const nextDeadline = computed(() => {
  const now = new Date()
  return assignments.value
    .filter(a => a.deadline && new Date(a.deadline) > now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0] || null
})
const aiGuideText = computed(() => {
  const late = assignments.value.filter(a => a.deadline && new Date(a.deadline) < new Date() && !mySubmissionsMap.value[a.id])
  if (late.length && lang.value === 'ru') return `На основании просроченного статуса Лабы ${late[0]?.title}, вам может потребоваться повторение темы. Сгенерировать краткий обзор основных правил?`
  if (late.length) return `Based on the overdue status of ${late[0]?.title}, you may need to review the topic. Generate a brief overview?`
  return lang.value === 'ru' ? 'ИИ-ассистент поможет с учебными материалами и заданиями.' : 'AI assistant will help with study materials and assignments.'
})

const fmtMonth = (d: string) => { try { return new Date(d).toLocaleString(lang.value === 'ru' ? 'ru-RU' : 'en-US', {month:'short'}).toUpperCase() } catch { return '' } }
const fmtDay = (d: string) => { try { return new Date(d).getDate().toString() } catch { return '' } }
const fmtRemaining = (d: string) => {
  try {
    const diff = new Date(d).getTime() - Date.now()
    if (diff < 0) return lang.value === 'ru' ? 'Просрочено' : 'Overdue'
    const days = Math.floor(diff / 86400000)
    const hrs = Math.floor((diff % 86400000) / 3600000)
    if (lang.value === 'ru') return `Осталось: ${days} дн. ${hrs} ч.`
    return `Remaining: ${days} days, ${hrs} hours`
  } catch { return '' }
}

// Assignment status helpers
const mySubmissionsMap = computed(() => {
  const m: Record<number, Submission> = {}
  mySubmissions.value.forEach(s => { m[s.assignment_id] = s })
  return m
})
const isLate = (a: Assignment) => a.deadline && new Date(a.deadline) < new Date() && !mySubmissionsMap.value[a.id]
const isInProgress = (a: Assignment) => mySubmissionsMap.value[a.id]?.status === 'submitted'
const getStatusIconClass = (a: Assignment) => {
  if (isLate(a)) return 'icon-late'
  if (isInProgress(a)) return 'icon-progress'
  return 'icon-default'
}
const getStatusClass = (a: Assignment) => {
  const sub = mySubmissionsMap.value[a.id]
  if (sub?.status === 'graded') return 'status-done'
  if (sub?.status === 'submitted') return 'status-progress'
  if (isLate(a)) return 'status-late'
  return 'status-new'
}
const getStatusLabel = (a: Assignment) => {
  const sub = mySubmissionsMap.value[a.id]
  if (sub?.status === 'graded') return lang.value === 'ru' ? 'ОЦЕНЕНО' : 'GRADED'
  if (sub?.status === 'submitted') return lang.value === 'ru' ? 'В ПРОЦЕССЕ' : 'IN PROGRESS'
  if (isLate(a)) return lang.value === 'ru' ? 'ПРОСРОЧЕНО' : 'OVERDUE'
  return lang.value === 'ru' ? 'НЕ НАЧАТО' : 'NOT STARTED'
}
const pendingCount = computed(() => assignments.value.filter(a => !mySubmissionsMap.value[a.id] && a.is_active).length)
const doneCount = computed(() => mySubmissions.value.filter(s => s.status === 'submitted' || s.status === 'graded').length)
const lateCount = computed(() => mySubmissions.value.filter(s => s.status === 'late').length + assignments.value.filter(a => !mySubmissionsMap.value[a.id] && a.deadline && new Date(a.deadline) < new Date()).length)

const cleanTitle = (t: string) => t.replace(/^\[(LECTURE|HW)\]\[\d+\]\s*/, '').trim()
const fmtDate = (d: string) => { if (!d) return ''; try { return new Date(d).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
const getFullBody = (p: any): string => { try { const b = JSON.parse(p.body); return b.content || b.description || p.body || '' } catch { return p.body || '' } }
const getPreview = (p: any): string => { const body = getFullBody(p); const clean = body.replace(/(https?:\/\/[^\s]+)/g, '').replace(/\s+/g, ' ').trim(); return clean.length > 100 ? clean.slice(0, 100) + '…' : clean || (lang.value==='ru'?'Нет описания':'No description') }
const FILE_EXT = /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp|md)(\?[^\s]*)?/i
const countFiles = (p: any): number => { const body = p.body || ''; const m = body.match(new RegExp(`https?://[^\\s\\n"'<>]+${FILE_EXT.source}`, 'gi')); return m?.length || 0 }
const pluralFile = (n: number) => lang.value === 'ru' ? (n === 1 ? 'файл' : n < 5 ? 'файла' : 'файлов') : 'file' + (n !== 1 ? 's' : '')
const getFileIcon = (url: string) => { const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''; if (e === 'pdf') return '📄'; if (['doc','docx','txt','md'].includes(e)) return '📝'; if (['xls','xlsx'].includes(e)) return '📊'; if (['ppt','pptx'].includes(e)) return '📋'; if (['png','jpg','jpeg','gif','webp'].includes(e)) return '🖼️'; return '📎' }
const getFileName = (url: string) => { try { return decodeURIComponent(new URL(url).pathname.split('/').pop() || url) } catch { return url.slice(-50) } }
const renderBody = (text: string): string => {
  if (!text) return ''
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g
  return escaped.replace(urlRegex, (url) => {
    if (FILE_EXT.test(url)) { const icon = getFileIcon(url); const name = getFileName(url); return `<a href="${url}" target="_blank" rel="noopener" class="file-attachment">${icon} <span>${name}</span></a>` }
    return `<a href="${url}" target="_blank" rel="noopener" class="link-inline">${url}</a>`
  }).replace(/\n/g,'<br>')
}

const classCode = computed(() => { const id = classId.value; const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = ''; let n = id*1337+42; for (let i=0;i<6;i++){code+=chars[n%chars.length];n=Math.floor(n/chars.length)+id*7}; return code.slice(0,6) })
const copyCode = () => { navigator.clipboard?.writeText(classCode.value).then(() => toast.ok(t('class.code_copied') + ' ' + classCode.value)).catch(() => toast.ok(t('class.code') + ' ' + classCode.value)) }

const viewPost = (p: any, type: string) => { viewingPost.value = { ...p, type } }
const onPostCreated = (p: any) => { allPosts.value.unshift(p) }
const deletePost = async (id: number) => {
  if (!confirm(lang.value==='ru'?'Удалить эту запись? Действие необратимо.':'Delete this record? Action is irreversible.')) return
  try { await postsSvc.remove(id); allPosts.value = allPosts.value.filter(p => p.id !== id); toast.ok(t('class.delete_post')) } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
}

const openEditPost = (p: any, type: string) => {
  editingPost.value = { ...p, type }
  let content = ''
  try { const b = JSON.parse(p.body); content = b.content || b.description || '' } catch { content = p.body || '' }
  const rawTitle = p.title || ''
  const cleanedTitle = rawTitle.replace(/^\[(LECTURE|HW)\]\[\d+\]\s*/, '').trim()
  editPostForm.value = { title: cleanedTitle, content }
}

const saveEditPost = async () => {
  if (!editingPost.value) return
  editPostSaving.value = true
  try {
    const p = editingPost.value
    let body: any = {}
    try { body = JSON.parse(p.body) } catch {}
    body.content = editPostForm.value.content
    const prefix = p.type === 'lecture' ? `[LECTURE][${classId.value}] ` : `[HW][${classId.value}] `
    const newTitle = prefix + editPostForm.value.title
    await postsSvc.update(p.id, newTitle, JSON.stringify(body))
    const idx = allPosts.value.findIndex(x => x.id === p.id)
    if (idx !== -1) allPosts.value[idx] = { ...allPosts.value[idx], title: newTitle, body: JSON.stringify(body) }
    toast.ok(lang.value === 'ru' ? 'Сохранено' : 'Saved')
    editingPost.value = null
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { editPostSaving.value = false }
}

const openEditAssignment = (a: any) => {
  editingAssignment.value = a
  const dl = a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : ''
  let criteria: Array<{name:string;weight:number;description:string}> = []
  try { criteria = JSON.parse(a.criteria || '[]') } catch {}
  if (!criteria.length) criteria = [{ name: '', weight: 10, description: '' }]
  editAsgForm.value = { title: a.title || '', description: a.description || '', max_score: a.max_score || 100, deadline: dl, criteria }
}

const addCriterion = () => { editAsgForm.value.criteria.push({ name: '', weight: 10, description: '' }) }
const removeCriterion = (i: number) => { if (editAsgForm.value.criteria.length > 1) editAsgForm.value.criteria.splice(i, 1) }

const saveEditAssignment = async () => {
  if (!editingAssignment.value) return
  editAsgSaving.value = true
  try {
    const updated = await assignmentsSvc.update(editingAssignment.value.id, {
      title: editAsgForm.value.title,
      description: editAsgForm.value.description,
      max_score: editAsgForm.value.max_score,
      deadline: editAsgForm.value.deadline ? new Date(editAsgForm.value.deadline).toISOString() : undefined,
      criteria: editAsgForm.value.criteria,
    })
    const idx = assignments.value.findIndex(x => x.id === editingAssignment.value.id)
    if (idx !== -1) assignments.value[idx] = { ...assignments.value[idx], ...updated }
    toast.ok(lang.value === 'ru' ? 'Задание обновлено' : 'Assignment updated')
    editingAssignment.value = null
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { editAsgSaving.value = false }
}
const loadAssignments = async () => {
  if (assignmentsLoaded.value || loadingAssignments.value) return
  loadingAssignments.value = true
  try {
    assignments.value = await assignmentsSvc.list(classId.value)
    if (!isTeacher.value) {
      mySubmissions.value = await assignmentsSvc.mySubmissions()
      // Load real rating from API
      loadRating()
    }
    assignmentsLoaded.value = true
  }
  catch { toast.err(t('general.error')) } finally { loadingAssignments.value = false }
}

const loadRating = async () => {
  if (isTeacher.value) return
  loadingRating.value = true
  try {
    ratingData.value = await ratingSvc.myRating(classId.value)
  } catch {} finally { loadingRating.value = false }
}

const deleteAssignment = async (a: Assignment) => {
  if (!confirm(`${lang.value==='ru'?'Удалить задание':'Delete assignment'} «${a.title}»?`)) return
  try { await assignmentsSvc.delete(a.id); assignments.value = assignments.value.filter(x => x.id !== a.id); toast.ok(t('class.delete_assignment')) } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
}
const openAssignment = (a: Assignment) => { activeAssignment.value = a }
const onAssignmentCreated = (a: Assignment) => { assignments.value.unshift(a); showCreateAssignment.value = false }
const onSubmitted = (sub: Submission) => {
  const idx = mySubmissions.value.findIndex(s => s.assignment_id === sub.assignment_id)
  if (idx !== -1) mySubmissions.value[idx] = sub; else mySubmissions.value.push(sub)
  // Refresh rating after submission
  loadRating()
}

onMounted(async () => {
  loading.value = true
  try { const posts = await postsSvc.list(); allPosts.value = posts } catch { toast.err(t('general.error')) } finally { loading.value = false }
})
</script>

<style scoped>
.cd-page{height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
/* Loading */
.full-load{flex:1;display:flex;align-items:center;justify-content:center}
.spin-ring{width:30px;height:30px;border:3px solid var(--border2);border-top-color:var(--teal);border-radius:50%;animation:spin .7s linear infinite}
.tab-load{display:flex;justify-content:center;padding:60px}
@keyframes spin{to{transform:rotate(360deg)}}

/* Topbar */
.cd-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0}
.cd-topbar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.topbar-logo{display:flex;align-items:center}.topbar-logo-img{width:80px;height:auto;object-fit:contain}.topbar-logo-icon{width:30px;height:30px;border-radius:7px;background:rgba(0,177,201,.08);border:1px solid rgba(0,177,201,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.topbar-brand{font-family:'Outfit',sans-serif;font-size:13px;font-weight:800;color:var(--teal);letter-spacing:.1em;flex-shrink:0}
.topbar-search{display:flex;align-items:center;gap:7px;padding:6px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:100px;font-size:12px;color:var(--text4);cursor:pointer;flex-shrink:0}
.topbar-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text4);overflow:hidden}
.bc-link{color:var(--text4);transition:color .15s}.bc-link:hover{color:var(--teal)}
.bc-sep{color:var(--text4);font-size:10px}
.bc-cur{color:var(--teal);font-weight:600;letter-spacing:.04em;font-size:11px}
.cd-topbar-nav{display:flex;align-items:center;gap:0;flex-shrink:0}
.topbar-tab{padding:0 18px;height:52px;font-size:13px;font-weight:500;color:var(--text4);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap}
.topbar-tab:hover{color:var(--text1)}
.topbar-tab.active{color:var(--teal);border-bottom-color:var(--teal);font-weight:600}
.cd-topbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:16px}
.icon-btn2{width:32px;height:32px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.icon-btn2:hover{border-color:var(--border2);color:var(--teal)}
.tav-img{width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,177,201,.25)}
.tav-init{width:32px;height:32px;border-radius:50%;background:var(--teal);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}

/* Layout */
.cd-layout{display:flex;flex:1;overflow:hidden;gap:0}
.cd-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.cd-sidebar{width:300px;flex-shrink:0;border-left:1px solid var(--border);padding:20px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:var(--surface)}

/* Page header */
.page-header{padding:20px 24px 16px;flex-shrink:0;position:relative;overflow:hidden;border-radius:0}
.page-header-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.55) 100%);z-index:0}
.page-header .page-header-top,.page-header .page-header-body,.page-header .class-code-row{position:relative;z-index:1}
.back-link-dark{color:rgba(255,255,255,.8)!important}.back-link-dark:hover{color:#fff!important}
.sep-dark{color:rgba(255,255,255,.5)!important}
.subject-dark{color:rgba(255,255,255,.7)!important}
.title-dark{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.4)}
.sub-dark{color:rgba(255,255,255,.7)!important}
.page-header-top{display:flex;align-items:center;gap:6px;margin-bottom:10px}
.back-link{font-size:12px;color:var(--text4);text-decoration:none;transition:color .15s}.back-link:hover{color:var(--teal)}
.header-sep{font-size:10px;color:var(--text4)}
.header-subject{font-size:11px;font-weight:700;color:var(--teal);letter-spacing:.08em}
.page-header-body{margin-bottom:14px}
.page-title{font-family:'Outfit',sans-serif;font-size:26px;font-weight:900;color:var(--text1);margin-bottom:6px;letter-spacing:-.02em}
.page-sub{font-size:13px;color:var(--text4);line-height:1.5;max-width:500px}
.page-header-actions{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.class-code-row{margin-bottom:12px}
.class-code-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:var(--teal-l);border:1px solid rgba(0,177,201,.25);border-radius:var(--r-md);font-size:13px;color:var(--teal);cursor:pointer;transition:all .15s;font-weight:500}
.class-code-chip strong{font-weight:800;letter-spacing:.12em;font-size:14px}
.class-code-chip:hover{background:var(--teal-m);border-color:rgba(0,177,201,.4)}

/* Tabs */
.tabs-wrap{flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--border)}
.tabs-actions-mobile{display:none}
.tabs-bar{display:flex;align-items:center;padding:0 24px;gap:0}
.tab-btn{display:flex;align-items:center;gap:8px;padding:14px 18px;font-size:13px;font-weight:500;color:var(--text4);background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}
.tab-btn:hover{color:var(--text1)}
.tab-btn.active{color:var(--teal);border-bottom-color:var(--teal);font-weight:600}
.tab-ai.active{color:var(--teal)}
.tab-num{font-size:11px;font-weight:700;background:var(--teal-l);color:var(--teal);padding:2px 8px;border-radius:100px}
.tabs-actions{margin-left:auto;display:flex;gap:8px;align-items:center}

/* Tab content */
.tab-content{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.tab-content.ai-mode{padding:0;overflow:hidden}

/* Content header */
.content-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.content-heading{font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:var(--text1)}
.sort-chip{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.05em;cursor:pointer}
.sort-chip:hover{color:var(--teal)}

/* Items list */
.items-list{display:flex;flex-direction:column;gap:12px}
.item-row{display:flex;align-items:center;gap:16px;padding:20px 22px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);cursor:pointer;transition:all .18s}
.item-row:hover{border-color:rgba(0,177,201,.3);box-shadow:var(--sh-sm);transform:translateY(-1px)}
.item-icon-col{flex-shrink:0}
.item-icon{width:46px;height:46px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center}
.lec-icon{background:rgba(0,177,201,.1);color:var(--teal);border:1px solid rgba(0,177,201,.2)}
.mat-icon{background:rgba(251,191,36,.08);color:var(--yellow);border:1px solid rgba(251,191,36,.16)}
.asgn-icon{background:rgba(0,177,201,.08);color:var(--teal);border:1px solid rgba(0,177,201,.15)}
.icon-late{background:rgba(220,38,38,.08)!important;color:var(--red)!important;border-color:rgba(220,38,38,.18)!important}
.icon-progress{background:rgba(0,177,201,.1)!important;color:var(--teal)!important;border-color:rgba(0,177,201,.2)!important}
.icon-default{background:var(--surface3)!important;color:var(--text4)!important;border-color:var(--border)!important}
.item-body{flex:1;min-width:0}
.item-row-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;gap:10px}
.item-title{font-size:15px;font-weight:700;color:var(--text1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.item-desc{font-size:13px;color:var(--text3);margin-bottom:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.4}
.item-meta{display:flex;align-items:center;gap:14px}
.meta-date,.meta-pts,.meta-files{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text4)}
.meta-date{font-weight:500}
.meta-pts{color:var(--teal);font-weight:600}

/* Status badges — match screenshot exactly */
.status-badge{flex-shrink:0;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;letter-spacing:.05em;white-space:nowrap}
.status-progress{background:rgba(0,177,201,.1);color:var(--teal);border:1px solid rgba(0,177,201,.2)}
.status-late{background:rgba(220,38,38,.1);color:var(--red);border:1px solid rgba(220,38,38,.2)}
.status-new{background:var(--surface2);color:var(--text4);border:1px solid var(--border)}
.status-done{background:rgba(22,163,74,.1);color:var(--green);border:1px solid rgba(22,163,74,.2)}

/* Item actions */
.item-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.item-del{width:32px;height:32px;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;opacity:0}
.item-row:hover .item-del{opacity:1}
.item-del:hover{background:var(--red-l);border-color:rgba(220,38,38,.2);color:var(--red)}
.item-edit{width:32px;height:32px;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;opacity:0}
.item-row:hover .item-edit{opacity:1}
.item-edit:hover{background:var(--teal-l);border-color:rgba(0,177,201,.2);color:var(--teal)}
/* Edit form fields */
.edit-field{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.07em}
.field-input{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;transition:border-color .15s;outline:none}
.field-input:focus{border-color:var(--teal);background:rgba(0,177,201,.04)}
.field-textarea{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;resize:vertical;transition:border-color .15s;outline:none}
.field-textarea:focus{border-color:var(--teal);background:rgba(0,177,201,.04)}
/* Criteria editing */
.btn-add-criterion{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--teal);background:var(--teal-l);border:1px solid rgba(0,177,201,.2);border-radius:var(--r-sm);padding:5px 12px;cursor:pointer;font-family:inherit;transition:all .15s}
.btn-add-criterion:hover{background:var(--teal-m)}
.criteria-edit-list{display:flex;flex-direction:column;gap:10px}
.criterion-edit-row{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md)}
.criterion-edit-top{display:flex;gap:8px;align-items:center}
.criterion-name-inp{flex:1}
.criterion-weight-inp{width:80px;flex-shrink:0;text-align:center}
.criterion-del-btn{width:30px;height:38px;flex-shrink:0;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.criterion-del-btn:hover:not(:disabled){background:var(--red-l);border-color:rgba(220,38,38,.2);color:var(--red)}
.criterion-del-btn:disabled{opacity:.3;cursor:not-allowed}
.criteria-total{font-size:12px;color:var(--text4);text-align:right;padding-top:4px}
.item-open-btn{font-size:12px;font-weight:600;color:var(--teal);white-space:nowrap;cursor:pointer}
.item-preview-link{font-size:13px;font-weight:500;color:var(--text4);white-space:nowrap;cursor:pointer}
.item-preview-link:hover{color:var(--teal)}
.btn-continue-link{font-size:13px;font-weight:600;color:var(--teal);white-space:nowrap;cursor:pointer}
.btn-continue-link:hover{opacity:.8}
.btn-late{padding:7px 16px;border-radius:var(--r-md);background:var(--red);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;letter-spacing:.04em;transition:opacity .15s}
.btn-late:hover{opacity:.85}

/* Empty state */
.empty-state-card{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;background:var(--surface);border:2px dashed var(--border2);border-radius:var(--r-2xl);gap:8px;text-align:center}
.es-glyph{font-size:40px;opacity:.25;margin-bottom:4px}
.es-h{font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;color:var(--text3)}
.es-p{font-size:13px;color:var(--text4);max-width:260px;line-height:1.5}

/* Sidebar cards */
.sidebar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:18px}
.score-card{background:linear-gradient(135deg,#007a8e,#00B1C9);border:none;color:#fff}
.score-no-grades{font-size:12px;opacity:.7;margin-top:8px;font-style:italic}
.score-count{font-size:11px;opacity:.65;margin-top:8px}
.score-label{font-size:10px;font-weight:700;letter-spacing:.1em;opacity:.7;margin-bottom:8px}
.score-num{display:flex;align-items:baseline;gap:6px;margin-bottom:16px}
.score-big{font-family:'Outfit',sans-serif;font-size:52px;font-weight:900;line-height:1}
.score-total{font-size:16px;font-weight:600;opacity:.8}
.score-pts{font-size:11px}
.score-progress-row{display:flex;justify-content:space-between;margin-bottom:6px}
.sp-label{font-size:10px;font-weight:700;letter-spacing:.06em;opacity:.7}
.sp-value{font-size:11px;font-weight:700}
.progress-bar{height:5px;background:rgba(255,255,255,.2);border-radius:100px;overflow:hidden;margin-bottom:4px}
.pb-fill{height:100%;background:#fff;border-radius:100px;transition:width .5s ease}
.perf-fill{background:rgba(255,255,255,.8)}

/* Next deadline */
.next-deadline-label{font-size:10px;font-weight:700;color:var(--teal);letter-spacing:.1em;margin-bottom:12px}
.next-deadline-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.deadline-date-box{width:48px;height:52px;border-radius:var(--r-md);background:var(--teal-l);border:1px solid rgba(0,177,201,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.ddb-month{font-size:10px;font-weight:700;color:var(--teal);letter-spacing:.06em}
.ddb-day{font-family:'Outfit',sans-serif;font-size:22px;font-weight:900;color:var(--text1);line-height:1}
.deadline-title{font-size:13px;font-weight:700;color:var(--text1);margin-bottom:3px}
.deadline-remaining{font-size:11px;color:var(--text4)}
.add-calendar-btn{font-size:11px;font-weight:700;color:var(--teal);letter-spacing:.06em;background:none;border:none;cursor:pointer;padding:0;transition:opacity .15s}
.add-calendar-btn:hover{opacity:.7}

/* AI guide */
.ai-guide-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--text3);margin-bottom:10px}
.ai-guide-body p{font-size:12px;color:var(--text4);line-height:1.6;margin-bottom:10px}
.ai-guide-link{font-size:12px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:0;transition:opacity .15s}
.ai-guide-link:hover{opacity:.7}

/* Post viewer */
.post-overlay{position:fixed;inset:0;background:rgba(0,30,36,.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:24px;backdrop-filter:blur(4px)}
.post-sheet{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-2xl);padding:30px;width:100%;max-width:640px;max-height:88vh;overflow-y:auto;box-shadow:var(--sh-lg)}
.sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.sheet-badge{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:5px 14px;border-radius:100px}
.sheet-badge.lecture{background:var(--teal-l);color:var(--teal);border:1px solid rgba(0,177,201,.2)}
.sheet-badge.material{background:rgba(251,191,36,.08);color:var(--yellow);border:1px solid rgba(251,191,36,.18)}
.sheet-title{font-family:'Outfit',sans-serif;font-size:24px;font-weight:900;color:var(--text1);letter-spacing:-.025em;margin-bottom:6px}
.sheet-date{font-size:12px;color:var(--text4);margin-bottom:22px}
.sheet-body{font-size:14px;color:var(--text2);line-height:1.8;white-space:pre-wrap}
:deep(.file-attachment){display:inline-flex;align-items:center;gap:9px;padding:11px 16px;margin:6px 4px;background:var(--teal-l);border:1px solid rgba(0,177,201,.2);border-radius:var(--r-lg);color:var(--teal);font-size:13px;font-weight:600;text-decoration:none;transition:all .18s}
:deep(.file-attachment:hover){background:var(--teal-m);transform:translateY(-1px)}
:deep(.file-attachment span){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px}
:deep(.link-inline){color:var(--teal);text-decoration:underline;text-underline-offset:3px;word-break:break-all}
.anim-scale{animation:scaleIn .2s ease both}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}

@media (max-width:768px){
  .cd-page { overflow-x: hidden; max-width: 100vw; }
  .cd-topbar{
    padding:0 12px;
  }
  .topbar-breadcrumb{max-width:160px;overflow:hidden}
  .cd-sidebar{display:none}
  .cd-layout{flex-direction:column;overflow-x:hidden}
  .cd-main{overflow-x:hidden;max-width:100%}
  .tabs-wrap{
    overflow:hidden;
  }
  .tabs-bar{padding:0;overflow-x:hidden;flex-wrap:nowrap}
  .tab-btn{flex:1;justify-content:center;padding:12px 4px;font-size:11px;white-space:nowrap;min-width:0}
  .tab-num{display:none}
  .tabs-actions-desktop{display:none}
  .tabs-actions-mobile{display:flex;gap:8px;padding:8px 12px;border-top:1px solid var(--border)}
  .tabs-actions-mobile .btn{flex:1;justify-content:center;min-height:40px;font-size:12px}
  .tab-content{padding:10px 12px 80px;overflow-x:hidden}
  .page-header{padding:14px 12px 12px}
  .page-title{font-size:20px}
  .page-sub{font-size:12px}
  .class-code-chip{font-size:12px}
  .item-row{padding:14px 14px;gap:12px}
  .item-icon{width:38px;height:38px}
  .item-title{font-size:14px}
  .item-desc{font-size:12px}
  .item-actions{gap:4px}
  .item-del,.item-edit{opacity:1;width:36px;height:36px}
  .post-sheet{padding:18px 14px 24px;border-radius:var(--r-2xl) var(--r-2xl) 0 0;max-height:92dvh}
  .post-overlay{padding:0;align-items:flex-end}
  .sheet-title{font-size:20px}
  .field-input,.field-textarea{font-size:16px}
}
@media (max-width:480px){
  .tab-btn{font-size:10px;padding:10px 2px}
  .tab-content{padding:8px 10px 80px}
  .item-row{padding:12px 10px;gap:10px}
  .page-title{font-size:18px}
}

</style>
