<template>
  <div class="auth-card anim-scale">
    <!-- Org type badge -->
    <div class="org-badge-row">
      <div :class="['org-badge', org.isSchool ? 'school' : 'university']">
        <svg v-if="org.isSchool" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        {{ org.isSchool ? (lang==='ru'?'Школа':lang==='kk'?'Мектеп':'School') : (lang==='ru'?'Университет':lang==='kk'?'Университет':'University') }}
      </div>
      <button class="org-switch-btn" @click="switchOrg">
        {{ lang==='ru'?'Сменить':'Change' }}
      </button>
    </div>

    <h2 class="auth-title">{{ t('login.welcome') }}</h2>
    <p class="auth-sub">{{ t('login.sub') }}</p>
    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel">Email</label>
        <input v-model="email" type="email" class="input" :class="{'input-err':errorMsg}" placeholder="you@example.com" required autocomplete="email" @input="errorMsg=''"/>
      </div>
      <div class="frow">
        <label class="flabel">{{ t('login.password') }}</label>
        <div style="position:relative">
          <input v-model="pw" :type="show?'text':'password'" class="input" :class="{'input-err':errorMsg}" placeholder="••••••••" required style="padding-right:42px" @input="errorMsg=''"/>
          <button type="button" @click="show=!show" class="pw-eye">
            <svg v-if="!show" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>
      <div v-if="errorMsg" class="login-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMsg }}
      </div>
      <button type="submit" class="btn btn-teal w-full btn-lg" :disabled="loading" style="margin-top:6px">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('login.submit') }}</span>
      </button>
    </form>
    <p class="auth-link-row">{{ t('login.no_account') }} <NuxtLink to="/register" class="auth-link">{{ t('login.register') }}</NuxtLink></p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore } from '~/stores/org.store'
definePageMeta({ layout: 'auth' })
const { login } = useAuth()
const { t, lang } = useI18n()
const org = useOrgStore()
const email = ref(''); const pw = ref(''); const show = ref(false); const loading = ref(false); const errorMsg = ref('')
const switchOrg = () => { org.clear(); if (import.meta.client) window.location.href = '/org' }
const sub = async () => {
  errorMsg.value = ''
  loading.value = true
  const ok = await login(email.value, pw.value)
  if (ok) await navigateTo('/')
  else errorMsg.value = t('login.error')
  loading.value = false
}
</script>
<style scoped>
.auth-card{background:#ffffff;border:1px solid rgba(0,177,201,0.2);border-radius:var(--r-2xl);padding:36px;width:100%;max-width:420px;margin:0 auto;box-shadow:0 8px 40px rgba(0,120,140,0.12),0 2px 8px rgba(0,120,140,0.08)}
.auth-title{font-size:22px;font-weight:800;margin-bottom:4px;color:#0d2d33}
.auth-sub{font-size:14px;color:#4a7a86;margin-bottom:26px}
.auth-form{display:flex;flex-direction:column}
.frow{margin-bottom:14px}
.flabel{font-size:12px;font-weight:600;color:#4a7a86;letter-spacing:.04em;display:block;margin-bottom:6px}
.input{background:#f5fafb!important;border-color:rgba(0,177,201,0.2)!important;color:#0d2d33!important}
.input:focus{border-color:rgba(0,177,201,0.5)!important;box-shadow:0 0 0 3px rgba(0,177,201,0.1)!important}
.input::placeholder{color:#7aabb5!important}
.pw-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#7aabb5;background:none;border:none;cursor:pointer;padding:4px;transition:color .15s}
.pw-eye:hover{color:#00B1C9}
.auth-link-row{text-align:center;font-size:13px;color:#4a7a86;margin-top:20px}
.auth-link{color:#00B1C9;font-weight:600;transition:color .15s}
.auth-link:hover{color:#009aaf}
.login-error{display:flex;align-items:center;gap:7px;padding:10px 14px;background:#fff1f1;border:1px solid #fca5a5;border-radius:var(--r-md);font-size:13px;font-weight:500;color:#dc2626;margin-bottom:6px}
.input-err{border-color:#fca5a5!important;background:#fff8f8!important}
.input-err:focus{border-color:#f87171!important;box-shadow:0 0 0 3px rgba(239,68,68,0.12)!important}
/* Org badge */
.org-badge-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.org-badge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.05em;padding:4px 10px;border-radius:100px}
.org-badge.university{background:rgba(0,177,201,.1);color:#007a8e;border:1px solid rgba(0,177,201,.25)}
.org-badge.school{background:rgba(245,158,11,.1);color:#b45309;border:1px solid rgba(245,158,11,.25)}
.org-switch-btn{font-size:11px;font-weight:600;color:#7aabb5;background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .15s}
.org-switch-btn:hover{color:#00B1C9}

@media (max-width:768px) {
  .auth-card { padding: 20px 14px 24px; border-radius: var(--r-xl); width: 100%; max-width: 100%; box-shadow: none; border: 1px solid rgba(0,177,201,0.15); }
  .auth-title { font-size: 20px; }
  .auth-sub { margin-bottom: 18px; }
  .frow { margin-bottom: 12px; }
  .input { font-size: 16px !important; }
  .btn-lg { min-height: 50px; font-size: 15px; }
  .pw-eye { min-width: 44px; min-height: 44px; right: 0; }
}
@media (max-width:480px) {
  .auth-card { padding: 20px 12px 24px; }
}
</style>
