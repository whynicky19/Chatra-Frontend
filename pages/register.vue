<template>
  <div class="auth-card anim-scale">
    <h2 class="auth-title">Создать аккаунт</h2>
    <p class="auth-sub">Заполните данные для регистрации</p>
    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel">ФИО <span style="color:var(--red)">*</span></label>
        <input v-model="fullname" class="input" placeholder="Иванов Иван Иванович" maxlength="80"/>
        <div v-if="fullname && fullname.trim().split(' ').filter(Boolean).length < 2" class="nick-hint err">Введите фамилию и имя</div>
      </div>
      <div class="frow">
        <label class="flabel">Никнейм <span style="color:var(--red)">*</span></label>
        <input v-model="nick" class="input" placeholder="Ваш ник (например: ivan123)" @input="onNickInput" maxlength="32"/>
        <div v-if="nick" :class="['nick-hint', nickOk===true?'ok':nickOk===false?'err':'']">
          <span v-if="nickChecking">⏳ Проверка...</span>
          <span v-else-if="nick.length<3">Минимум 3 символа</span>
          <span v-else-if="nickOk===false">✕ Уже занят</span>
          <span v-else-if="nickOk===true">✓ Доступен</span>
        </div>
      </div>
      <div class="frow">
        <label class="flabel">Email</label>
        <input v-model="email" type="email" class="input" placeholder="you@example.com" @input="onEmailInput" @blur="emailTouched=true"/>
        <div v-if="emailTouched && email" :class="['nick-hint', emailOk?'ok':'err']">
          <span v-if="!emailOk">✕ Только gmail.com или icloud.com</span>
          <span v-else>✓ Email корректный</span>
        </div>
        <div v-if="emailTouched && !email" class="nick-hint err">Введите email</div>
      </div>
      <div class="frow">
        <label class="flabel">Пароль</label>
        <input v-model="pw" type="password" class="input" placeholder="Минимум 6 символов" required minlength="6"/>
        <div v-if="pw" class="str-row">
          <div class="str-bar"><div :style="{width:score+'%',background:scoreColor}" class="str-fill"></div></div>
          <span class="str-lbl">{{scoreLabel}}</span>
        </div>
      </div>
      <!-- Gesture verification step — shown before submit button becomes active -->
      <div class="frow" style="margin-top:4px">
        <div v-if="!gestureVerified" class="gesture-box">
          <GestureVerify @verified="gestureVerified=true"/>
        </div>
        <div v-else class="gesture-done">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Верификация пройдена ✌️
        </div>
      </div>

      <button type="submit" class="btn btn-teal w-full btn-lg" :disabled="loading||!canSubmit||!gestureVerified">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>Зарегистрироваться</span>
      </button>
    </form>
    <p class="auth-link-row">Уже есть аккаунт? <NuxtLink to="/login" style="color:var(--teal);font-weight:500">Войти</NuxtLink></p>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout: 'auth' })
const { register } = useAuth()
const toast = useToast()
const { t } = useI18n()

const nick = ref(''); const fullname = ref(''); const email = ref(''); const pw = ref(''); const role = ref('student'); const loading = ref(false)
const nickOk = ref<boolean|null>(null); const nickChecking = ref(false)
const emailTouched = ref(false)
const emailOk = computed(() => /^[^\s@]+@(gmail\.com|icloud\.com)$/.test(email.value.trim()))
const onEmailInput = () => { emailTouched.value = true }
// New: gesture verification state — user must pass ✌️ check before submitting
const gestureVerified = ref(false)
let nickTimer: any = null

const fullnameOk = computed(() => fullname.value.trim().split(' ').filter(Boolean).length >= 2)
const canSubmit = computed(() => fullnameOk.value && emailOk.value && pw.value.length>=6 && nick.value.length>=3 && nickOk.value!==false)

const pwScore = computed(() => {
  const p = pw.value; if (!p) return 0; let s = 0
  if (p.length>=6) s+=20; if (p.length>=10) s+=20
  if (/[A-Z]/.test(p)) s+=20; if (/[0-9]/.test(p)) s+=20; if (/[^A-Za-z0-9]/.test(p)) s+=20
  return s
})
const score = computed(() => pwScore.value)
const scoreColor = computed(() => score.value<=40?'var(--red)':score.value<=60?'var(--yellow)':'var(--green)')
const scoreLabel = computed(() => score.value<=40?'Слабый':score.value<=60?'Средний':'Надёжный')

const onNickInput = () => {
  nickOk.value = null; clearTimeout(nickTimer)
  const v = nick.value.trim()
  if (v.length < 3) return
  nickChecking.value = true
  nickTimer = setTimeout(() => {
    const reg = JSON.parse(localStorage.getItem('_nick_registry')||'{}')
    const taken = Object.values(reg).some((n: any) => n.toLowerCase()===v.toLowerCase())
    nickOk.value = !taken
    nickChecking.value = false
  }, 400)
}

const sub = async () => {
  if (!canSubmit.value) return
  loading.value = true
  const ok = await register(email.value, pw.value, role.value)
  if (ok) {
    // Save nick and fullname as pending — will be applied after login
    localStorage.setItem('_pending_nick', nick.value)
    localStorage.setItem('_pending_fullname', fullname.value.trim())
    await navigateTo('/login')
  }
  loading.value = false
}
</script>
<style scoped>
.auth-card{background:#ffffff;border:1px solid rgba(0,177,201,0.2);border-radius:var(--r-2xl);padding:32px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,120,140,0.12)}
.auth-title{font-size:20px;font-weight:700;letter-spacing:-.02em;margin-bottom:4px;color:#0d2d33}
.auth-sub{font-size:14px;color:#4a7a86;margin-bottom:24px}
.auth-form{display:flex;flex-direction:column;gap:0}
.nick-hint{font-size:12px;font-weight:500;margin-top:4px}
.nick-hint.ok{color:var(--green)}.nick-hint.err{color:var(--red)}
.str-row{display:flex;align-items:center;gap:10px;margin-top:6px}
.str-bar{flex:1;height:3px;background:var(--surface3);border-radius:3px;overflow:hidden;max-width:100px}
.str-fill{height:100%;border-radius:3px;transition:all .3s}
.str-lbl{font-size:11px;color:var(--text4)}
.role-grid{display:flex;gap:8px}
.role-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border:1px solid var(--border2);border-radius:var(--r-md);font-size:13px;font-weight:500;color:var(--text2);background:var(--surface);cursor:pointer;transition:all .15s}
.role-btn:hover{border-color:var(--teal);color:var(--teal)}
.role-btn.active{border-color:var(--teal);background:var(--teal-l);color:var(--teal)}
.auth-link-row{text-align:center;font-size:13px;color:var(--text3);margin-top:20px}
/* Gesture verification box */
.gesture-box{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px}
.gesture-done{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--green-l);border:1px solid var(--green);border-radius:var(--r-md);font-size:13px;font-weight:600;color:var(--green)}
</style>
