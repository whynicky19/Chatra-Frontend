<template>
  <div class="org-shell">
    <canvas ref="canvasEl" class="org-canvas"></canvas>

    <div class="org-content">
      <!-- Logo -->
      <div class="org-brand">
        <img src="/logo.png" class="org-logo" alt="Chatra" />
        <span class="org-brand-name">Chatra</span>
      </div>

      <!-- Lang switcher -->
      <div class="lang-row">
        <button v-for="l in langs" :key="l.code"
          :class="['lang-btn', { active: lang === l.code }]"
          @click="setLang(l.code as any)">
          {{ l.label }}
        </button>
      </div>

      <!-- Card -->
      <div class="org-card anim-scale">
        <h1 class="org-title">{{ lang === 'ru' ? 'Добро пожаловать' : lang === 'kk' ? 'Қош келдіңіз' : 'Welcome' }}</h1>
        <p class="org-sub">{{ lang === 'ru' ? 'Выберите тип вашей организации' : lang === 'kk' ? 'Ұйым түрін таңдаңыз' : 'Select your organization type' }}</p>

        <div class="org-options">
          <!-- University -->
          <button class="org-option university" @click="select('university')">
            <div class="org-option-icon university-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div class="org-option-body">
              <div class="org-option-title">{{ lang === 'ru' ? 'Университет' : lang === 'kk' ? 'Университет' : 'University' }}</div>
              <div class="org-option-sub">{{ lang === 'ru' ? 'Высшее образование' : lang === 'kk' ? 'Жоғары білім' : 'Higher education' }}</div>
            </div>
            <svg class="org-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <!-- School -->
          <button class="org-option school" @click="select('school')">
            <div class="org-option-icon school-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
              </svg>
            </div>
            <div class="org-option-body">
              <div class="org-option-title">{{ lang === 'ru' ? 'Школа' : lang === 'kk' ? 'Мектеп' : 'School' }}</div>
              <div class="org-option-sub">{{ lang === 'ru' ? 'Среднее образование' : lang === 'kk' ? 'Орта білім' : 'Secondary education' }}</div>
            </div>
            <svg class="org-arrow school-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useOrgStore } from '~/stores/org.store'
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: false })

const org = useOrgStore()
const { lang, setLang } = useI18n()

const langs = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kk', label: 'KZ' },
]

const select = (type: 'university' | 'school') => {
  org.select(type)
  if (import.meta.client) window.location.href = '/login'
}

// ── Particle canvas background (same style as auth layout) ────────────────────
const canvasEl = ref<HTMLCanvasElement | null>(null)
let animId = 0

onMounted(() => {
  const c = canvasEl.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)

  interface P { x: number; y: number; vx: number; vy: number; r: number; a: number }
  const pts: P[] = Array.from({ length: 60 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    r: 1 + Math.random() * 2,
    a: .2 + Math.random() * .5,
  }))

  const draw = () => {
    c.width = window.innerWidth; c.height = window.innerHeight
    ctx.clearRect(0, 0, c.width, c.height)
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > c.width) p.vx *= -1
      if (p.y < 0 || p.y > c.height) p.vy *= -1
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,177,201,${p.a})`
      ctx.fill()
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x
        const dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(pts[j].x, pts[j].y)
          ctx.strokeStyle = `rgba(0,177,201,${(1 - d / 100) * .15})`
          ctx.lineWidth = .8
          ctx.stroke()
        }
      }
    }
    animId = requestAnimationFrame(draw)
  }
  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<style scoped>
.org-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E293B, #0F172A);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.org-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.org-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  width: 100%;
  max-width: 480px;
}

/* Brand */
.org-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.org-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}
.org-brand-name {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -.04em;
}

/* Lang row */
.lang-row {
  display: flex;
  gap: 4px;
  margin-bottom: 28px;
  background: rgba(255,255,255,.08);
  border-radius: 100px;
  padding: 3px;
}
.lang-btn {
  padding: 5px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .05em;
  cursor: pointer;
  transition: all .15s;
  background: none;
  border: none;
  color: rgba(255,255,255,.5);
  font-family: inherit;
}
.lang-btn:hover { color: rgba(255,255,255,.8); }
.lang-btn.active { background: rgba(255,255,255,.15); color: #fff; }

/* Card */
.org-card {
  width: 100%;
  background: rgba(255,255,255,.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 28px;
  padding: 36px 32px;
}
.org-title {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  text-align: center;
  margin-bottom: 8px;
}
.org-sub {
  font-size: 14px;
  color: rgba(255,255,255,.55);
  text-align: center;
  margin-bottom: 32px;
}

/* Options */
.org-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.org-option {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  border-radius: 20px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all .22s;
  text-align: left;
  font-family: inherit;
  background: rgba(255,255,255,.06);
}
.university {
  border-color: rgba(0,177,201,.3);
}
.university:hover {
  background: rgba(0,177,201,.1);
  border-color: rgba(0,177,201,.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,177,201,.2);
}
.school {
  border-color: rgba(245,158,11,.3);
}
.school:hover {
  background: rgba(245,158,11,.1);
  border-color: rgba(245,158,11,.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(245,158,11,.2);
}

.org-option-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.university-icon {
  background: linear-gradient(135deg, #006475, #009AAF);
  box-shadow: 0 4px 16px rgba(0,177,201,.35);
}
.school-icon {
  background: linear-gradient(135deg, #B45309, #F59E0B);
  box-shadow: 0 4px 16px rgba(245,158,11,.35);
}

.org-option-body {
  flex: 1;
  min-width: 0;
}
.org-option-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
}
.org-option-sub {
  font-size: 13px;
  color: rgba(255,255,255,.5);
}
.org-arrow {
  color: rgba(0,177,201,.6);
  flex-shrink: 0;
}
.school-arrow {
  color: rgba(245,158,11,.6);
}

.anim-scale {
  animation: scaleIn .4s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1)  translateY(0); }
}

@media (max-width: 480px) {
  .org-card { padding: 24px 18px; border-radius: 24px; }
  .org-title { font-size: 22px; }
  .org-option { padding: 16px 16px; gap: 14px; }
  .org-option-icon { width: 46px; height: 46px; border-radius: 13px; }
}
</style>
