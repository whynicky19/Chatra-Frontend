<template>
  <div class="auth-shell">
    <canvas ref="canvasEl" class="auth-canvas"></canvas>
    <div class="auth-content">
      <div class="auth-brand">
        <img src="/logo.png" class="auth-logo-img" alt="Chatra"/>
      </div>
      <div class="lang-switcher">
        <button v-for="l in langs" :key="l.code" @click="setLang(l.code)" :class="['lang-btn', { active: lang === l.code }]">
          {{ l.label }}
        </button>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { lang, setLang } = useI18n()
const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]

const canvasEl = ref<HTMLCanvasElement | null>(null)
let animId = 0
let mouseX = -9999
let mouseY = -9999
let W = 0
let H = 0

function onMouse(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  const c = canvasEl.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const doResize = () => {
    W = c.width = window.innerWidth
    H = c.height = window.innerHeight
  }
  doResize()
  window.addEventListener('resize', doResize)
  window.addEventListener('mousemove', onMouse)

  interface Dot {
    x: number; y: number
    ox: number; oy: number
    vx: number; vy: number
    r: number; pulse: number
    hue: number; speed: number
  }

  interface Pulse {
    ax: number; ay: number
    bx: number; by: number
    t: number; speed: number
    hue: number
  }

  const COUNT = 90
  const dots: Dot[] = Array.from({ length: COUNT }, () => {
    const x = Math.random() * W
    const y = Math.random() * H
    const sp = 0.25 + Math.random() * 0.5
    return {
      x, y, ox: x, oy: y,
      vx: (Math.random() - 0.5) * sp,
      vy: (Math.random() - 0.5) * sp,
      r: 2.2 + Math.random() * 3.2,
      pulse: Math.random() * Math.PI * 2,
      hue: 182 + Math.random() * 28,
      speed: sp,
    }
  })

  const pulses: Pulse[] = []
  let pulseTimer = 0

  function spawnPulse() {
    const i = Math.floor(Math.random() * dots.length)
    const a = dots[i]
    const candidates: number[] = []
    for (let j = 0; j < dots.length; j++) {
      if (j === i) continue
      const dx = dots[j].x - a.x
      const dy = dots[j].y - a.y
      if (Math.sqrt(dx * dx + dy * dy) < 150) candidates.push(j)
    }
    if (!candidates.length) return
    const b = dots[candidates[Math.floor(Math.random() * candidates.length)]]
    pulses.push({
      ax: a.x, ay: a.y,
      bx: b.x, by: b.y,
      t: 0, speed: 0.012 + Math.random() * 0.018,
      hue: a.hue,
    })
  }

  const labels = ['∑', 'Δ', '∫', '∞', 'π', 'Ω', '√', '∂', 'AI', 'σ', 'λ', 'φ']
  const floaters = Array.from({ length: labels.length }, (_, i) => ({
    label: labels[i],
    x: 0.06 + (i / labels.length) * 0.9,
    yBase: 0.1 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    size: 13 + Math.random() * 8,
  }))

  const CONNECT = 150
  let t = 0

  const draw = () => {
    animId = requestAnimationFrame(draw)
    t++

    ctx.fillStyle = '#dff0f4'
    ctx.fillRect(0, 0, W, H)

    // радиальные свечения
    const glows = [
      { x: W * 0.15, y: H * 0.2,  r: W * 0.45, a: 0.18 + Math.sin(t * 0.007) * 0.04 },
      { x: W * 0.85, y: H * 0.75, r: W * 0.42, a: 0.14 + Math.sin(t * 0.009 + 1) * 0.03 },
      { x: W * 0.5,  y: H * 0.5,  r: W * 0.35, a: 0.10 + Math.sin(t * 0.006 + 2) * 0.02 },
      { x: W * 0.7,  y: H * 0.1,  r: W * 0.25, a: 0.08 },
    ]
    for (const g of glows) {
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r)
      grad.addColorStop(0, `rgba(0,177,201,${g.a.toFixed(3)})`)
      grad.addColorStop(0.5, `rgba(0,177,201,${(g.a * 0.3).toFixed(3)})`)
      grad.addColorStop(1, 'rgba(0,177,201,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }

    // плавающие кольца
    for (let i = 0; i < 5; i++) {
      const rx = W * (0.15 + i * 0.185) + Math.sin(t * 0.006 + i * 1.2) * 35
      const ry = H * (0.2 + Math.sin(t * 0.008 + i * 0.9) * 0.15)
      const rr = 50 + i * 42 + Math.sin(t * 0.01 + i) * 12
      const ra = 0.12 + Math.sin(t * 0.012 + i) * 0.05
      ctx.save()
      ctx.globalAlpha = ra
      ctx.strokeStyle = `hsl(${190 + i * 5},80%,45%)`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(rx, ry, rr, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = ra * 0.4
      ctx.beginPath()
      ctx.arc(rx, ry, rr * 1.3, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // физика частиц
    for (const d of dots) {
      d.pulse += 0.026
      const dx = mouseX - d.x
      const dy = mouseY - d.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      if (dist < 240) {
        const force = ((240 - dist) / 240) * 0.14
        d.vx += (dx / dist) * force
        d.vy += (dy / dist) * force
      }
      d.vx += (d.ox - d.x) * 0.018
      d.vy += (d.oy - d.y) * 0.018
      d.vx *= 0.83
      d.vy *= 0.83
      d.x += d.vx
      d.y += d.vy
    }

    // линии соединений
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j]
        const ddx = a.x - b.x, ddy = a.y - b.y
        const dd = Math.sqrt(ddx * ddx + ddy * ddy)
        if (dd > CONNECT) continue
        const alpha = (1 - dd / CONNECT) * 0.65
        ctx.save()
        ctx.globalAlpha = alpha
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        g.addColorStop(0, `hsl(${a.hue},85%,45%)`)
        g.addColorStop(1, `hsl(${b.hue},85%,45%)`)
        ctx.strokeStyle = g
        ctx.lineWidth = 1.0
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        ctx.restore()
      }
    }

    // бегущие импульсы
    pulseTimer++
    if (pulseTimer % 18 === 0) spawnPulse()
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]
      p.t += p.speed
      if (p.t >= 1) { pulses.splice(i, 1); continue }
      const px = p.ax + (p.bx - p.ax) * p.t
      const py = p.ay + (p.by - p.ay) * p.t
      const ease = Math.sin(p.t * Math.PI)
      ctx.save()
      ctx.globalAlpha = ease * 0.95
      ctx.shadowColor = `hsl(${p.hue},90%,55%)`
      ctx.shadowBlur = 14
      ctx.fillStyle = `hsl(${p.hue},95%,70%)`
      ctx.beginPath()
      ctx.arc(px, py, 3 + ease * 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // точки-частицы
    for (const d of dots) {
      const p = Math.sin(d.pulse) * 0.3 + 0.7
      const distToMouse = Math.sqrt((mouseX - d.x) ** 2 + (mouseY - d.y) ** 2)
      const glow = Math.max(0, 1 - distToMouse / 240)
      if (glow > 0.1) {
        ctx.save()
        ctx.globalAlpha = glow * 0.35
        const og = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5)
        og.addColorStop(0, `hsl(${d.hue},90%,55%)`)
        og.addColorStop(1, `hsla(${d.hue},90%,55%,0)`)
        ctx.fillStyle = og
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r * 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      ctx.save()
      ctx.globalAlpha = p * 0.95
      ctx.shadowColor = `hsl(${d.hue},95%,50%)`
      ctx.shadowBlur = 10 + glow * 28
      ctx.fillStyle = `hsl(${d.hue},92%,46%)`
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r * p + glow * 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.4 * p
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(d.x - d.r * 0.25, d.y - d.r * 0.25, d.r * 0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // плавающие символы
    for (const fl of floaters) {
      const fx = fl.x * W
      const fy = fl.yBase * H + Math.sin(t * 0.007 + fl.phase) * 22
      const fa = 0.12 + Math.sin(t * 0.009 + fl.phase) * 0.06
      ctx.save()
      ctx.globalAlpha = fa
      ctx.fillStyle = '#006e8a'
      ctx.font = `500 ${fl.size}px 'Outfit', serif`
      ctx.textAlign = 'center'
      ctx.fillText(fl.label, fx, fy)
      ctx.restore()
    }

  }

  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouse)
    window.removeEventListener('resize', doResize)
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  })
})
</script>

<style scoped>
.auth-shell {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
  height: 100vh; height: 100dvh;
  overscroll-behavior: none;
  cursor: default;
}
.auth-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  display: block;
}
.auth-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 24px 20px;
  width: 100%; max-width: 440px;
  overflow-y: auto; overflow-x: hidden;
  max-height: 100dvh;
  scrollbar-width: none;
  cursor: default;
  animation: content-enter 0.65s cubic-bezier(0.16,1,0.3,1) both;
}
.auth-content::-webkit-scrollbar { display: none; }
@keyframes content-enter {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.auth-brand {
  flex-shrink: 0;
  animation: brand-drop 0.55s cubic-bezier(0.16,1,0.3,1) 0.1s both;
}
@keyframes brand-drop {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.auth-logo-img { width: 160px; height: auto; object-fit: contain; display: block; }
.lang-switcher {
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.88); backdrop-filter: blur(14px);
  border: 1px solid rgba(0,177,201,0.25); border-radius: 30px;
  padding: 4px; flex-shrink: 0;
  box-shadow: 0 2px 14px rgba(0,177,201,0.15);
  animation: fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.18s both;
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lang-btn {
  padding: 5px 14px; border-radius: 24px; font-size: 12px; font-weight: 700;
  letter-spacing: .06em; cursor: pointer; transition: all .18s;
  background: none; border: none; color: #4a7a86;
}
.lang-btn:hover { color: #00B1C9; }
.lang-btn.active {
  background: #00B1C9; color: #fff;
  box-shadow: 0 2px 8px rgba(0,177,201,0.4);
}
@media (max-width:768px) {
  .auth-shell { cursor: default; }
  .auth-content { padding: 14px 12px; gap: 14px; max-width: 100%; }
  .auth-logo-img { width: 110px; }
  .lang-btn { padding: 5px 12px; font-size: 11px; }
}
@media (max-width:480px) {
  .auth-content { padding: 10px; gap: 10px; }
  .auth-logo-img { width: 90px; }
}
</style>