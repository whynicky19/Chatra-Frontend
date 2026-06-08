<template>
  <div class="auth-card anim-scale">
    <!-- Org type badge -->
    <div class="org-badge-row">
      <div :class="['org-badge', org.isSchool ? 'school' : 'university']">
        <svg v-if="org.isSchool" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        {{ org.isSchool ? (lang==='ru'?'Школа':lang==='kk'?'Мектеп':'School') : (lang==='ru'?'Университет':lang==='kk'?'Университет':'University') }}
      </div>
      <button class="org-switch-btn" @click="switchOrg">{{ lang==='ru'?'Сменить':'Change' }}</button>
    </div>

    <h2 class="auth-title">{{ t('register.title') }}</h2>
    <p class="auth-sub">{{ t('register.sub') }}</p>
    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel">{{ t('register.fullname') }} <span style="color:var(--red)">*</span></label>
        <input v-model="fullname" class="input" :placeholder="t('register.fullname_placeholder')" maxlength="80"/>
        <div v-if="fullname && fullname.trim().split(' ').filter(Boolean).length < 2" class="nick-hint err">{{ t('register.fullname_err') }}</div>
      </div>

      <div class="frow">
        <label class="flabel">Email</label>
        <input v-model="email" type="email" class="input" placeholder="you@example.com" @input="onEmailInput" @blur="emailTouched=true"/>
        <div v-if="emailTouched && email" :class="['nick-hint', emailOk?'ok':'err']">
          <span v-if="!emailOk">{{ t('register.email_invalid') }}</span>
          <span v-else>{{ t('register.email_ok') }}</span>
        </div>
        <div v-if="emailTouched && !email" class="nick-hint err">{{ t('register.email_required') }}</div>
      </div>

      <!-- ГРУППА -->
      <div class="frow" style="position:relative">
        <label class="flabel">Группа <span style="color:var(--red)">*</span></label>
        <input
          v-model="groupQuery"
          class="input"
          placeholder="Например: ИСУ-21"
          autocomplete="off"
          @input="onGroupInput"
          @blur="onGroupBlur"
          @focus="showDropdown = true"
        />
        <!-- Выпадающий список -->
        <div v-if="showDropdown && groupSuggestions.length" class="group-dropdown">
          <div
            v-for="g in groupSuggestions"
            :key="g"
            class="group-item"
            @mousedown.prevent="selectGroup(g)"
          >
            {{ g }}
          </div>
        </div>
        <div v-if="groupTouched && !group" class="nick-hint err">Выбери группу из списка</div>
        <div v-if="group" class="nick-hint ok">✓ {{ group }}</div>
      </div>

      <div class="frow">
        <label class="flabel">{{ t('login.password') }}</label>
        <input v-model="pw" type="password" class="input" :placeholder="t('register.pw_placeholder')" required minlength="6"/>
        <div v-if="pw" class="str-row">
          <div class="str-bar"><div :style="{width:score+'%',background:scoreColor}" class="str-fill"></div></div>
          <span class="str-lbl">{{scoreLabel}}</span>
        </div>
      </div>

      <button type="submit" class="btn btn-teal w-full btn-lg" :disabled="loading||!canSubmit">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('register.submit') }}</span>
      </button>
    </form>
    <p class="auth-link-row">{{ t('register.has_account') }} <NuxtLink to="/login" style="color:var(--teal);font-weight:500">{{ t('register.login_link') }}</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useApi } from '~/services/api'
import { useOrgStore } from '~/stores/org.store'
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const toast = useToast()
const { t, lang } = useI18n()
const api = useApi()
const org = useOrgStore()

const switchOrg = () => { org.clear(); if (import.meta.client) window.location.href = '/org' }

const nick = ref(''); const fullname = ref(''); const email = ref(''); const pw = ref('')
const role = ref('student'); const loading = ref(false)
const emailTouched = ref(false)

// группа
const group = ref('')
const groupQuery = ref('')
const groupSuggestions = ref<string[]>([])
const showDropdown = ref(false)
const groupTouched = ref(false)

// ← заменили на запрос к бэкенду
const onGroupInput = async () => {
  groupTouched.value = true
  group.value = ''
  const q = groupQuery.value.trim()
  if (!q) { groupSuggestions.value = []; showDropdown.value = false; return }
  try {
    const { data } = await api.get(`/auth/groups/search?q=${encodeURIComponent(q)}`)
    groupSuggestions.value = data
    showDropdown.value = groupSuggestions.value.length > 0
  } catch {
    groupSuggestions.value = []
  }
}

const selectGroup = (g: string) => {
  group.value = g
  groupQuery.value = g
  showDropdown.value = false
}

const onGroupBlur = () => {
  setTimeout(() => { showDropdown.value = false }, 150)
  groupTouched.value = true
}

const emailOk = computed(() => /^[^\s@]+@(gmail\.com|icloud\.com)$/.test(email.value.trim()))
const onEmailInput = () => { emailTouched.value = true }
const fullnameOk = computed(() => fullname.value.trim().split(' ').filter(Boolean).length >= 2)
const canSubmit = computed(() => fullnameOk.value && emailOk.value && pw.value.length >= 6 && !!group.value)

const pwScore = computed(() => {
  const p = pw.value; if (!p) return 0; let s = 0
  if (p.length>=6) s+=20; if (p.length>=10) s+=20
  if (/[A-Z]/.test(p)) s+=20; if (/[0-9]/.test(p)) s+=20; if (/[^A-Za-z0-9]/.test(p)) s+=20
  return s
})
const score = computed(() => pwScore.value)
const scoreColor = computed(() => score.value<=40?'var(--red)':score.value<=60?'var(--yellow)':'var(--green)')
const scoreLabel = computed(() => score.value<=40?t('register.pw_weak'):score.value<=60?t('register.pw_medium'):t('register.pw_strong'))

const sub = async () => {
  if (!canSubmit.value) return
  loading.value = true
  const ok = await register(email.value, pw.value, role.value, fullname.value.trim(), group.value)
  if (ok) {
    localStorage.setItem('_pending_fullname', fullname.value.trim())
    await navigateTo('/login')
  }
  loading.value = false
}
</script>

<style scoped>
.auth-card{background:#ffffff;border:1px solid rgba(0,177,201,0.2);border-radius:var(--r-2xl);padding:32px;width:100%;max-width:420px;margin:0 auto;box-shadow:0 8px 40px rgba(0,120,140,0.12)}
.auth-title{font-size:20px;font-weight:700;letter-spacing:-.02em;margin-bottom:4px;color:#0d2d33}
.auth-sub{font-size:14px;color:#4a7a86;margin-bottom:24px}
.auth-form{display:flex;flex-direction:column;gap:0}
.nick-hint{font-size:12px;font-weight:500;margin-top:4px}
.nick-hint.ok{color:var(--green)}.nick-hint.err{color:var(--red)}
.str-row{display:flex;align-items:center;gap:10px;margin-top:6px}
.str-bar{flex:1;height:3px;background:#e8eef0;border-radius:3px;overflow:hidden;max-width:100px}
.str-fill{height:100%;border-radius:3px;transition:all .3s}
.str-lbl{font-size:11px;color:#7aabb5}
.auth-link-row{text-align:center;font-size:13px;color:#4a7a86;margin-top:20px}
.input{background:#f5fafb!important;border-color:rgba(0,177,201,0.2)!important;color:#0d2d33!important}
.input:focus{border-color:rgba(0,177,201,0.5)!important;box-shadow:0 0 0 3px rgba(0,177,201,0.1)!important}
.input::placeholder{color:#7aabb5!important}

/* Выпадающий список групп */
.group-dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid rgba(0,177,201,0.3);border-radius:var(--r-md);box-shadow:0 4px 20px rgba(0,0,0,0.1);z-index:100;max-height:200px;overflow-y:auto;margin-top:2px}
.group-item{padding:10px 14px;font-size:14px;color:#0d2d33;cursor:pointer;transition:background .15s}
.group-item:hover{background:#e6f9fb;color:#00B1C9}
/* Org badge */
.org-badge-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.org-badge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.05em;padding:4px 10px;border-radius:100px}
.org-badge.university{background:rgba(0,177,201,.1);color:#007a8e;border:1px solid rgba(0,177,201,.25)}
.org-badge.school{background:rgba(245,158,11,.1);color:#b45309;border:1px solid rgba(245,158,11,.25)}
.org-switch-btn{font-size:11px;font-weight:600;color:#7aabb5;background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .15s}
.org-switch-btn:hover{color:#00B1C9}

@media (max-width:768px) {
  .auth-card { padding: 20px 14px 24px; border-radius: var(--r-xl); max-width: 100%; width: 100%; box-shadow: none; border: 1px solid rgba(0,177,201,0.15); }
  .auth-title { font-size: 18px; }
  .auth-sub { margin-bottom: 16px; font-size: 13px; }
  .input { font-size: 16px !important; }
  .btn-lg { min-height: 50px; font-size: 15px; }
  .frow { margin-bottom: 12px; }
  .group-item { min-height: 44px; display: flex; align-items: center; }
}
@media (max-width:480px) {
  .auth-card { padding: 16px 12px 20px; }
}
</style>