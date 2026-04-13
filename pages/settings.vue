<template>
  <div class="pg anim-in">
    <div class="pg-head">
      <h1 class="pg-title">{{ t('settings.title') }}</h1>
      <p class="pg-sub">{{ lang === 'ru' ? 'Управляйте аккаунтом и настройками' : lang === 'kk' ? 'Аккаунтыңызды және параметрлерді басқарыңыз' : 'Manage your account and preferences' }}</p>
    </div>

    <div class="pg-body">
      <!-- Profile Details -->
      <div class="scard">
        <div class="scard-head">
          <div>
            <h2 class="scard-title">{{ t('settings.profile_details') }}</h2>
            <p class="scard-sub">{{ t('settings.profile_sub') }}</p>
          </div>
          <button class="btn btn-teal btn-lg" @click="saveProfile">{{ t('settings.save') }}</button>
        </div>
        <div class="profile-form">
          <label class="avatar-upload-area" title="Upload photo">
            <input type="file" accept="image/*" style="display:none" @change="onAvatarPick"/>
            <img v-if="auth.avatar" :src="auth.avatar" class="prof-av"/>
            <div v-else class="prof-av-init">{{ uInit }}</div>
            <div class="av-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
          </label>
          <div class="fields-grid">
            <div class="field-group">
              <label class="field-label">{{ t('settings.full_name') }}</label>
              <input v-model="fullnameInput" class="input field-input" placeholder="Иванов Иван Иванович" maxlength="80"/>
              <div v-if="fullnameInput && fullnameInput.trim().split(' ').filter(Boolean).length < 2" class="nick-hint err">Введите фамилию и имя</div>
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('settings.email') }}</label>
              <input :value="auth.user?.email" class="input field-input" readonly style="opacity:.7;cursor:default"/>
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('settings.role') }}</label>
              <div class="input field-input field-locked">
                {{ roleLabel }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;opacity:.4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
            </div>
            <div v-if="auth.isAdmin" class="field-group">
              <label class="field-label">{{ t('settings.institution') }}</label>
              <input value="Chatra Academy" class="input field-input" readonly style="opacity:.7;cursor:default"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferences row (no appearance) -->
      <div class="scard">
        <div class="scard-head-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <h3 class="scard-h3">{{ t('settings.preferences') }}</h3>
        </div>
        <div class="pref-list">
          <div class="pref-row">
            <div class="pref-info">
              <div class="pref-title">{{ t('settings.email_notif') }}</div>
              <div class="pref-sub">{{ t('settings.email_notif_sub') }}</div>
            </div>
            <label class="toggle"><input type="checkbox" v-model="emailNotif"/><span class="tog-t"></span></label>
          </div>
          <div class="pref-row">
            <div class="pref-info">
              <div class="pref-title">{{ t('settings.ai_insights') }}</div>
              <div class="pref-sub">{{ t('settings.ai_insights_sub') }}</div>
            </div>
            <label class="toggle"><input type="checkbox" v-model="aiInsights"/><span class="tog-t"></span></label>
          </div>
          <div class="pref-row">
            <div class="pref-info">
              <div class="pref-title">{{ t('settings.desktop_popups') }}</div>
              <div class="pref-sub">{{ t('settings.desktop_popups_sub') }}</div>
            </div>
            <label class="toggle"><input type="checkbox" v-model="desktopPopups"/><span class="tog-t"></span></label>
          </div>
        </div>
      </div>

      <!-- Deactivate -->
      <div class="scard deactivate-card">
        <div class="deactivate-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div class="deactivate-info">
          <div class="deactivate-title">{{ t('settings.deactivate') }}</div>
          <div class="deactivate-sub">{{ t('settings.deactivate_sub') }}</div>
        </div>
        <button class="deactivate-btn">{{ t('settings.start_process') }}</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAuthSvc } from '~/services/auth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })
const auth = useAuthStore(); const authSvc = useAuthSvc(); const toast = useToast(); const { t, lang } = useI18n()
const fullnameInput = ref(''); const nickOk = ref<boolean|null>(null); const nickChecking = ref(false)
const emailNotif = ref(true); const aiInsights = ref(true); const desktopPopups = ref(false)
const isDark = ref(false); const followSystem = ref(false)

const uInit = computed(() => (auth.fullname || auth.nickname || auth.user?.email || '?')[0]?.toUpperCase())
const roleLabel = computed(() => {
  const role = auth.user?.role
  if (role === 'admin') return t('settings.admin')
  if (role === 'teacher') return lang.value === 'ru' ? 'Преподаватель' : 'Teacher'
  return t('settings.student')
})

const saveProfile = async () => {
  const fn = fullnameInput.value.trim()
  if (fn) {
    auth.setFullname(fn)
    try { await authSvc.updateMe(fn) } catch {}
  }
  toast.ok(t('settings.nick_saved'))
}
const onAvatarPick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  const r = new FileReader()
  r.onload = () => { auth.setAvatar(r.result as string); toast.ok(t('settings.avatar_updated')) }
  r.readAsDataURL(f)
}
const setTheme = (dark: boolean) => {
  isDark.value = dark
  if (dark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
  else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
}
onMounted(() => {
  const theme = localStorage.getItem('theme')
  isDark.value = theme === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
  fullnameInput.value = auth.fullname || auth.nickname || ''
  emailNotif.value = localStorage.getItem('emailNotif') !== '0'
  aiInsights.value = localStorage.getItem('aiInsights') !== '0'
  desktopPopups.value = localStorage.getItem('desktopPopups') === '1'
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg);display:flex;flex-direction:column}
.pg-head{padding:28px 32px 0;flex-shrink:0}
.pg-title{font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:var(--text1);margin-bottom:4px}
.pg-sub{font-size:14px;color:var(--text4)}
.pg-body{padding:20px 32px 40px;display:flex;flex-direction:column;gap:20px}
.scard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:24px}
.scard-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px}
.scard-head-sm{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.scard-title{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:var(--text1);margin-bottom:4px}
.scard-sub{font-size:13px;color:var(--text4)}
.scard-h3{font-size:16px;font-weight:700;color:var(--text1)}
.profile-form{display:flex;gap:28px;align-items:flex-start}
.avatar-upload-area{position:relative;display:block;cursor:pointer;width:90px;height:90px;flex-shrink:0}
.prof-av{width:90px;height:90px;border-radius:var(--r-md);object-fit:cover;border:2px solid var(--border)}
.prof-av-init{width:90px;height:90px;border-radius:var(--r-md);background:linear-gradient(135deg,#00B1C9,#007a8e);color:#fff;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800}
.av-overlay{position:absolute;inset:0;background:rgba(0,0,0,.4);border-radius:var(--r-md);opacity:0;display:flex;align-items:center;justify-content:center;transition:opacity .2s}
.avatar-upload-area:hover .av-overlay{opacity:1}
.fields-grid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field-group{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:10px;font-weight:700;color:var(--text4);letter-spacing:.1em}
.field-input{background:var(--surface2)!important;border-color:var(--border)!important}
.field-locked{display:flex;align-items:center;color:var(--text2)}
.nick-hint{font-size:11px;font-weight:500}.nick-hint.ok{color:var(--green)}.nick-hint.err{color:var(--red)}
.two-col-row{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.pref-list{display:flex;flex-direction:column}
.pref-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border)}
.pref-row:last-child{border-bottom:none;padding-bottom:0}
.pref-title{font-size:14px;font-weight:600;color:var(--text1);margin-bottom:2px}
.pref-sub{font-size:12px;color:var(--text4)}
.theme-btns{display:flex;gap:12px;margin-bottom:16px}
.theme-choice{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 12px;border-radius:var(--r-lg);border:2px solid var(--border);background:var(--surface2);cursor:pointer;transition:all .18s;font-size:13px;font-weight:600;color:var(--text2)}
.theme-choice:hover{border-color:var(--border2);color:var(--text1)}
.theme-choice.sel{border-color:var(--teal);background:var(--teal-l);color:var(--teal)}
.theme-icon{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}
.light-icon{background:#f0f4f5;color:#0d2d33;border:1px solid var(--border)}
.dark-icon{background:#111b1e;color:#e8f4f6;border:1px solid rgba(0,177,201,.2)}
.follow-sys{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--border)}
.follow-info{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text3)}
.deactivate-card{display:flex;align-items:center;gap:16px;padding:18px 24px}
.deactivate-icon{width:40px;height:40px;border-radius:var(--r-md);background:var(--red-l);border:1px solid rgba(220,38,38,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.deactivate-info{flex:1}
.deactivate-title{font-size:15px;font-weight:600;color:var(--text1)}
.deactivate-sub{font-size:13px;color:var(--text4);margin-top:2px}
.deactivate-btn{color:var(--red);font-size:14px;font-weight:600;background:none;border:none;cursor:pointer;flex-shrink:0}
.deactivate-btn:hover{opacity:.7}
@media (max-width:768px){
  .pg-body{padding:12px 12px 24px;gap:14px}
  .scard{padding:16px}
  .scard-head{flex-direction:column;gap:12px;margin-bottom:16px}
  .scard-head .btn-lg{width:100%}
  .profile-form{flex-direction:column;align-items:center;gap:16px}
  .fields-grid{grid-template-columns:1fr;gap:12px}
}
</style>
