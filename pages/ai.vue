<template>
  <div class="ai-page anim-in">
    <div class="ai-chat-panel">
      <canvas ref="canvas" class="neural-bg"></canvas>

      <!-- Header -->
      <div class="chat-head">
        <div class="chat-head-l">
          <div class="ai-logo-wrap">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="7" stroke="url(#nh1)" stroke-width="2.5" fill="none"/>
              <circle cx="8" cy="8" r="3" fill="url(#nh2)" opacity="0.8"/>
              <circle cx="32" cy="8" r="3" fill="url(#nh2)" opacity="0.8"/>
              <circle cx="8" cy="32" r="3" fill="url(#nh2)" opacity="0.8"/>
              <circle cx="32" cy="32" r="3" fill="url(#nh2)" opacity="0.8"/>
              <line x1="8" y1="8" x2="14" y2="14" stroke="url(#nh1)" stroke-width="1.5" opacity="0.6"/>
              <line x1="32" y1="8" x2="26" y2="14" stroke="url(#nh1)" stroke-width="1.5" opacity="0.6"/>
              <line x1="8" y1="32" x2="14" y2="26" stroke="url(#nh1)" stroke-width="1.5" opacity="0.6"/>
              <line x1="32" y1="32" x2="26" y2="26" stroke="url(#nh1)" stroke-width="1.5" opacity="0.6"/>
              <defs>
                <linearGradient id="nh1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4dd6e8"/><stop offset="1" stop-color="#06b6d4"/>
                </linearGradient>
                <linearGradient id="nh2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#99e6f0"/><stop offset="1" stop-color="#67e8f9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div class="chat-title">AI <span style="color:var(--teal)">Ассистент</span></div>
            <div class="chat-sub">Спросите что угодно</div>
          </div>
        </div>
        <div class="online-pill">● Онлайн</div>
      </div>

      <!-- Messages area -->
      <div ref="area" class="chat-area">
        <div v-if="!msgs.length" class="chat-empty-state">
          <div class="ai-empty-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="8" stroke="url(#ee1)" stroke-width="2" fill="none"/>
              <circle cx="7" cy="7" r="3.5" fill="url(#ee2)" opacity="0.9"/>
              <circle cx="33" cy="7" r="3.5" fill="url(#ee2)" opacity="0.9"/>
              <circle cx="7" cy="33" r="3.5" fill="url(#ee2)" opacity="0.9"/>
              <circle cx="33" cy="33" r="3.5" fill="url(#ee2)" opacity="0.9"/>
              <circle cx="20" cy="4" r="2.5" fill="url(#ee2)" opacity="0.7"/>
              <circle cx="36" cy="20" r="2.5" fill="url(#ee2)" opacity="0.7"/>
              <circle cx="20" cy="36" r="2.5" fill="url(#ee2)" opacity="0.7"/>
              <circle cx="4" cy="20" r="2.5" fill="url(#ee2)" opacity="0.7"/>
              <line x1="7" y1="7" x2="13" y2="13" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="33" y1="7" x2="27" y2="13" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="7" y1="33" x2="13" y2="27" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="33" y1="33" x2="27" y2="27" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="20" y1="4" x2="20" y2="12" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="36" y1="20" x2="28" y2="20" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="20" y1="36" x2="20" y2="28" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <line x1="4" y1="20" x2="12" y2="20" stroke="url(#ee1)" stroke-width="1.2" opacity="0.5"/>
              <defs>
                <linearGradient id="ee1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4dd6e8"/><stop offset="1" stop-color="#06b6d4"/>
                </linearGradient>
                <linearGradient id="ee2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#99e6f0"/><stop offset="1" stop-color="#67e8f9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p class="empty-hint">Ваш личный ИИ</p>
          <div class="empty-chips">
            <button v-for="t in tips" :key="t" class="e-chip" @click="quick(t)">{{t}}</button>
          </div>
        </div>

        <div v-else class="chat-msgs">
          <div v-for="m in msgs" :key="m.id" :class="['chat-msg', m.role]">
            <div v-if="m.role==='assistant'" class="msg-avatar">
              <div class="ai-av-icon">
                <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="8" stroke="url(#am1)" stroke-width="3" fill="none"/>
                  <circle cx="8" cy="8" r="3" fill="url(#am1)"/>
                  <circle cx="32" cy="8" r="3" fill="url(#am1)"/>
                  <circle cx="8" cy="32" r="3" fill="url(#am1)"/>
                  <circle cx="32" cy="32" r="3" fill="url(#am1)"/>
                  <defs><linearGradient id="am1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#4dd6e8"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
                </svg>
              </div>
              <span class="msg-sender">AI</span>
            </div>
            <!-- Image preview if user sent image -->
            <img v-if="m.imagePreview" :src="m.imagePreview" class="msg-img-preview" alt="uploaded"/>
            <div :class="['msg-bubble', m.role]" v-html="fmt(m.text)"></div>
          </div>

          <!-- Typing indicator -->
          <div v-if="loading" class="chat-msg assistant">
            <div class="msg-avatar">
              <div class="ai-av-icon">
                <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="8" stroke="url(#at1)" stroke-width="3" fill="none"/>
                  <circle cx="8" cy="8" r="3" fill="url(#at1)"/>
                  <circle cx="32" cy="8" r="3" fill="url(#at1)"/>
                  <circle cx="8" cy="32" r="3" fill="url(#at1)"/>
                  <circle cx="32" cy="32" r="3" fill="url(#at1)"/>
                  <defs><linearGradient id="at1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#4dd6e8"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
                </svg>
              </div>
              <span class="msg-sender">AI</span>
            </div>
            <div class="msg-bubble assistant">
              <div class="typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- File preview bar -->
      <div v-if="pendingFile" class="file-prev">
        <div class="fp-info">
          <img v-if="pendingPreview" :src="pendingPreview" class="fp-thumb" alt="preview"/>
          <span>{{pendingFile.type.startsWith('image/') ? '🖼️' : '📎'}} {{pendingFile.name}}</span>
          <span v-if="pendingFile.type.startsWith('image/')" class="fp-badge">ИИ прочитает текст</span>
        </div>
        <button class="fp-rm" @click="clearFile">×</button>
      </div>

      <!-- Input -->
      <div class="chat-inp">
        <label class="attach-lbl" title="Прикрепить изображение / файл">
          <input ref="fileInput" type="file" accept="image/*,.pdf,.doc,.docx,.txt" style="display:none" @change="onFilePick"/>
          <div class="attach-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </div>
        </label>
        <input
          ref="inp"
          v-model="txt"
          class="chat-field"
          placeholder="Написать сообщение или спросить кое что..."
          :disabled="loading"
          @keydown.enter="send"
        />
        <button
          :class="['send-btn', {active: txt.trim() || pendingFile}]"
          :disabled="(!txt.trim() && !pendingFile) || loading"
          @click="send"
        >
          <div v-if="loading" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useAi } from '~/composables/useAi'
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })

const ai = useAi()
const { t, lang } = useI18n()
const msgs = computed(() => ai.msgs.value)
const loading = computed(() => ai.loading.value)

const area = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const inp = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const txt = ref('')
const pendingFile = ref<File | null>(null)
const pendingPreview = ref<string | null>(null)

const tips = [
  'Давай пообщаемся',
  'Объясни тему кратко',
  'Помоги с кодом',
  'Составь план урока',
  'Проверь мой текст',
]

const fmt = (t: string) => t
  .replace(/```(\w+)?\n?([^`]*?)```/gs, '<pre class="code-bl"><code>$2</code></pre>')
  .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\n/g, '<br>')

const scroll = () => nextTick(() => {
  if (area.value) area.value.scrollTop = area.value.scrollHeight
})

const onFilePick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  pendingFile.value = f
  if (f.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => { pendingPreview.value = reader.result as string }
    reader.readAsDataURL(f)
  } else {
    pendingPreview.value = null
  }
  // Reset input so same file can be picked again
  if (fileInput.value) fileInput.value.value = ''
}

const clearFile = () => {
  pendingFile.value = null
  pendingPreview.value = null
}

const send = async () => {
  if ((!txt.value.trim() && !pendingFile.value) || loading.value) return
  const message = txt.value
  const file = pendingFile.value
  txt.value = ''
  pendingFile.value = null
  pendingPreview.value = null
  await ai.send(message, file)
  scroll()
}

const quick = async (t: string) => {
  // Strip emoji prefix for chip tips
  txt.value = t.replace(/^[^\s]+\s/, '')
  await send()
}

watch(() => ai.msgs.value.length, () => scroll())

// ── Neural Network Animation ──────────────────────────────────────────────────
let animId: number

interface Node {
  x: number; y: number; vx: number; vy: number
  r: number; pulse: number; phase: number
}

onMounted(() => {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const resize = () => {
    c.width = c.offsetWidth
    c.height = c.offsetHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Create nodes — represents neurons / knowledge nodes
  const NODE_COUNT = 38
  const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: 1.5 + Math.random() * 3,
    pulse: Math.random() * Math.PI * 2,
    phase: Math.random() * Math.PI * 2,
  }))

  const CONNECTION_DIST = 130
  let t = 0

  const draw = () => {
    c.width = c.offsetWidth
    c.height = c.offsetHeight
    ctx.clearRect(0, 0, c.width, c.height)

    // Subtle radial glow
    const glow = ctx.createRadialGradient(
      c.width * 0.5, c.height * 0.45, 0,
      c.width * 0.5, c.height * 0.45, c.width * 0.55
    )
    glow.addColorStop(0, 'rgba(0,177,201,0.05)')
    glow.addColorStop(0.6, 'rgba(6,182,212,0.025)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, c.width, c.height)

    // Move nodes
    for (const n of nodes) {
      n.x += n.vx
      n.y += n.vy
      n.pulse += 0.025
      if (n.x < 0 || n.x > c.width) n.vx *= -1
      if (n.y < 0 || n.y > c.height) n.vy *= -1
    }

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > CONNECTION_DIST) continue

        const alpha = (1 - dist / CONNECTION_DIST) * 0.35
        // Pulse signal along connection
        const signalPos = (Math.sin(t * 0.018 + a.phase) * 0.5 + 0.5)
        const sx = a.x + (b.x - a.x) * signalPos
        const sy = a.y + (b.y - a.y) * signalPos

        // Connection line
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        grad.addColorStop(0, `rgba(0,177,201,${alpha})`)
        grad.addColorStop(0.5, `rgba(6,182,212,${alpha * 1.3})`)
        grad.addColorStop(1, `rgba(0,177,201,${alpha})`)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Travelling signal dot
        const sa = alpha * 2.5
        ctx.beginPath()
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196,181,253,${sa})`
        ctx.shadowBlur = 8
        ctx.shadowColor = 'rgba(0,177,201,0.8)'
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Draw nodes (neurons)
    for (const n of nodes) {
      const pulse = Math.sin(n.pulse) * 0.5 + 0.5
      const r = n.r * (0.85 + pulse * 0.3)
      const a = 0.4 + pulse * 0.5

      // Outer glow
      const nodeGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.5)
      nodeGrad.addColorStop(0, `rgba(167,139,250,${a * 0.5})`)
      nodeGrad.addColorStop(1, 'rgba(167,139,250,0)')
      ctx.beginPath()
      ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = nodeGrad
      ctx.fill()

      // Core dot
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(196,181,253,${a})`
      ctx.shadowBlur = 10 + pulse * 8
      ctx.shadowColor = `rgba(0,177,201,${a})`
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Floating knowledge glyphs (ΣΔΩ ∫ ∞ π)
    const glyphs = ['Σ', 'Δ', '∫', '∞', 'π', 'Ω', '√', '∂']
    for (let i = 0; i < glyphs.length; i++) {
      const x = c.width * (0.08 + i * 0.12 + Math.sin(t * 0.005 + i * 0.9) * 0.04)
      const y = c.height * (0.15 + Math.sin(t * 0.007 + i * 1.3) * 0.1 + (i % 2) * 0.55)
      const a = 0.04 + Math.sin(t * 0.008 + i) * 0.025
      ctx.font = `${13 + Math.sin(t * 0.01 + i) * 2}px serif`
      ctx.fillStyle = `rgba(167,139,250,${a})`
      ctx.fillText(glyphs[i], x, y)
    }

    t++
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
.ai-page { display: flex; height: 100%; overflow: hidden }
.ai-chat-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); position: relative; overflow: hidden }
.neural-bg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0 }

/* Header */
.chat-head { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: var(--topbar); border-bottom: 1px solid var(--border); background: var(--surface); backdrop-filter: blur(12px); position: relative; z-index: 2; flex-shrink: 0 }
.chat-head-l { display: flex; align-items: center; gap: 14px }
.ai-logo-wrap { width: 44px; height: 44px; border-radius: 14px; background: radial-gradient(circle at 30% 30%, rgba(0,177,201,.25), rgba(6,182,212,.08)); border: 1px solid rgba(0,177,201,.25); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0,177,201,.25), inset 0 1px 0 rgba(255,255,255,.06); flex-shrink: 0 }
.chat-title { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: var(--text1) }
.chat-sub { font-size: 12px; color: var(--text4); margin-top: 1px }
.online-pill { font-size: 12px; font-weight: 600; color: var(--green); background: var(--green-l); padding: 5px 14px; border-radius: 100px; border: 1px solid rgba(74,222,128,.2) }

/* Messages */
.chat-area { flex: 1; overflow-y: auto; padding: 28px; position: relative; z-index: 1 }

/* Empty state */
.chat-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px }
.ai-empty-logo { width: 80px; height: 80px; border-radius: 24px; background: radial-gradient(circle at 30% 30%, rgba(0,177,201,.2), rgba(6,182,212,.06)); border: 1px solid rgba(0,177,201,.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 40px rgba(0,177,201,.2); animation: float 3s ease-in-out infinite }
@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.empty-hint { font-size: 14px; color: var(--text3); font-weight: 500 }
.empty-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 520px }
.e-chip { padding: 10px 20px; background: rgba(0,177,201,.07); backdrop-filter: blur(8px); border: 1px solid rgba(0,177,201,.15); border-radius: 100px; font-size: 13px; font-weight: 500; color: var(--text2); cursor: pointer; transition: all .2s }
.e-chip:hover { background: rgba(0,177,201,.15); border-color: rgba(0,177,201,.3); color: var(--teal); transform: translateY(-2px) }

/* Chat messages */
.chat-msgs { display: flex; flex-direction: column; gap: 20px }
.chat-msg { display: flex; flex-direction: column; gap: 8px; max-width: 72% }
.chat-msg.user { align-self: flex-end; align-items: flex-end }
.chat-msg.assistant { align-self: flex-start }
.msg-avatar { display: flex; align-items: center; gap: 8px }
.ai-av-icon { width: 26px; height: 26px; border-radius: 8px; background: radial-gradient(circle at 30% 30%, rgba(0,177,201,.3), rgba(6,182,212,.1)); border: 1px solid rgba(0,177,201,.2); display: flex; align-items: center; justify-content: center }
.msg-sender { font-size: 12px; font-weight: 700; color: var(--teal) }

/* Image preview in message */
.msg-img-preview { max-width: 240px; max-height: 200px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(0,177,201,.2); box-shadow: 0 4px 16px rgba(0,0,0,.3) }

.msg-bubble { padding: 13px 18px; border-radius: var(--r-lg); font-size: 14px; line-height: 1.6 }
.msg-bubble.user { background: linear-gradient(135deg, #00B1C9, #009aaf); color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 4px 20px rgba(0,177,201,.3) }
.msg-bubble.assistant { background: var(--surface); border: 1px solid var(--border); color: var(--text1); border-bottom-left-radius: 4px }

/* Typing */
.typing { display: flex; gap: 5px; padding: 4px 0 }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse 1.2s infinite }
.typing span:nth-child(2) { animation-delay: .2s }
.typing span:nth-child(3) { animation-delay: .4s }

/* File preview bar */
.file-prev { display: flex; align-items: center; justify-content: space-between; padding: 8px 24px; background: rgba(0,177,201,.08); border-top: 1px solid rgba(0,177,201,.12); font-size: 13px; font-weight: 500; color: var(--teal); position: relative; z-index: 2; flex-shrink: 0 }
.fp-info { display: flex; align-items: center; gap: 10px }
.fp-thumb { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(0,177,201,.2) }
.fp-badge { font-size: 11px; font-weight: 600; background: rgba(6,182,212,.12); color: #06b6d4; border: 1px solid rgba(6,182,212,.2); border-radius: 100px; padding: 2px 8px }
.fp-rm { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 20px; padding: 0; line-height: 1; transition: color .15s }
.fp-rm:hover { color: var(--red) }

/* Input */
.chat-inp { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: var(--surface); backdrop-filter: blur(12px); border-top: 1px solid var(--border); position: relative; z-index: 2; flex-shrink: 0 }
.attach-lbl { cursor: pointer; flex-shrink: 0 }
.attach-icon { width: 36px; height: 36px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text3); transition: all .15s }
.attach-icon:hover { background: rgba(0,177,201,.12); border-color: rgba(0,177,201,.2); color: var(--teal) }
.chat-field { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 11px 18px; font-size: 14px; color: var(--text1); transition: all .2s; font-family: 'Outfit', sans-serif }
.chat-field:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(0,177,201,.1) }
.chat-field::placeholder { color: var(--text4) }
.chat-field:disabled { opacity: .5 }
.send-btn { width: 40px; height: 40px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); color: var(--text4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all .2s }
.send-btn.active { background: linear-gradient(135deg, #00B1C9, #009aaf); border-color: transparent; color: #fff; box-shadow: 0 4px 16px rgba(0,177,201,.4) }
.send-btn.active:hover { box-shadow: 0 6px 24px rgba(0,177,201,.6); transform: translateY(-1px) }
.send-btn:disabled { opacity: .4; cursor: not-allowed; transform: none }

/* Code blocks */
:deep(.code-bl) { background: #0a0a16; color: #99e6f0; border-radius: var(--r-md); padding: 14px; margin: 8px 0; overflow-x: auto; font-size: 13px; font-family: monospace; line-height: 1.6; border: 1px solid var(--border) }
:deep(.ic) { background: rgba(0,177,201,.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: .9em; color: var(--teal) }

@media (max-width:768px) {
  .ai-page { overflow-x: hidden; }
  .chat-head { padding: 0 14px; height: 54px; }
  .chat-title { font-size: 16px; }
  .chat-sub { display: none; }
  .online-pill { font-size: 11px; padding: 4px 10px; }
  .chat-area { padding: 14px 12px; }
  .chat-msg { max-width: 90%; }
  .msg-bubble { padding: 10px 14px; font-size: 13px; }
  .chat-inp { padding: 10px 12px; gap: 6px; }
  .chat-field { font-size: 16px; padding: 10px 14px; }
  .send-btn { width: 44px; height: 44px; }
  .attach-icon { width: 44px; height: 44px; }
  .empty-chips { gap: 8px; padding: 0 8px; }
  .e-chip { font-size: 12px; padding: 8px 14px; }
  .ai-empty-logo { width: 64px; height: 64px; }
  :deep(.code-bl) { font-size: 12px; overflow-x: auto; }
}
@media (max-width:480px) {
  .chat-head { padding: 0 10px; }
  .ai-logo-wrap { width: 36px; height: 36px; border-radius: 10px; }
  .chat-area { padding: 10px 10px; }
  .empty-chips { flex-direction: column; align-items: stretch; }
  .e-chip { text-align: center; }
}
</style>
