<template>
  <div class="gv-wrap">
    <div class="gv-header">
      <div class="gv-icon">✌️</div>
      <h3 class="gv-title">Верификация жестом</h3>
      <p class="gv-desc">Покажите жест «два пальца вверх» в камеру для подтверждения</p>
    </div>

    <!-- Step 1: camera permission -->
    <div v-if="step==='idle'" class="gv-step">
      <button class="btn btn-blue w-full" @click="startCamera">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        Включить камеру
      </button>
    </div>

    <!-- Camera error -->
    <div v-if="cameraError" class="gv-error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{cameraError}}
    </div>

    <!-- Video + canvas overlay -->
    <div v-if="step!=='idle'&&step!=='verified'" class="gv-video-wrap">
      <video ref="videoEl" class="gv-video" autoplay muted playsinline></video>
      <!-- Canvas draws landmark dots over the video -->
      <canvas ref="canvasEl" class="gv-canvas"></canvas>

      <!-- Status overlay -->
      <div :class="['gv-status', statusClass]">
        <span class="gv-status-dot"></span>
        {{statusText}}
      </div>

      <!-- Calibration progress ring -->
      <svg v-if="step==='calibrating'" class="gv-ring" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="6"/>
        <circle
          cx="40" cy="40" r="34"
          fill="none"
          stroke="#22c55e"
          stroke-width="6"
          stroke-linecap="round"
          stroke-dasharray="213.6"
          :stroke-dashoffset="213.6 - (213.6 * calibProgress / 100)"
          transform="rotate(-90 40 40)"
          style="transition:stroke-dashoffset .1s"
        />
        <text x="40" y="46" text-anchor="middle" fill="white" font-size="16" font-weight="700">{{Math.round(calibProgress)}}%</text>
      </svg>
    </div>

    <!-- Verified state -->
    <div v-if="step==='verified'" class="gv-verified">
      <div class="gv-check">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style="font-size:15px;font-weight:600;color:var(--green)">Верификация пройдена!</div>
      <div style="font-size:13px;color:var(--text3);margin-top:4px">Жест распознан успешно</div>
    </div>

    <!-- Instructions -->
    <div v-if="step==='detecting'||step==='calibrating'" class="gv-instructions">
      <div class="inst-item" :class="{done: gestureDetected}">
        <span class="inst-dot" :class="{active: gestureDetected}"></span>
        Покажите ✌️ (указательный и средний пальцы вверх)
      </div>
      <div class="inst-item" :class="{done: step==='calibrating'||step==='verified'}">
        <span class="inst-dot" :class="{active: step==='calibrating'}"></span>
        Удержите жест 2.5 секунды для калибровки
      </div>
      <div class="inst-item" :class="{done: step==='verified'}">
        <span class="inst-dot" :class="{active: step==='verified'}"></span>
        Жест подтверждён ✓
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// Emits verified event when gesture is confirmed
const emit = defineEmits<{ verified: [] }>()

// ─── REFS ───────────────────────────────────────────────────────────────────
const videoEl = ref<HTMLVideoElement|null>(null)
const canvasEl = ref<HTMLCanvasElement|null>(null)
const step = ref<'idle'|'detecting'|'calibrating'|'verified'>('idle')
const cameraError = ref('')
const gestureDetected = ref(false)
const calibProgress = ref(0)

// ─── ML CALIBRATION STORAGE ─────────────────────────────────────────────────
/**
 * TRAINING STEP (simple ML approximation):
 * While user holds the gesture for 2.5s, we collect ~25 frames of 21 landmarks each.
 * Each frame is a 42-number vector [x0,y0, x1,y1, ... x20,y20].
 * We then compute the centroid (mean vector) of all collected frames.
 * This centroid becomes our "trained model" for this session.
 *
 * During verification, incoming frames are compared to the centroid
 * using Euclidean distance. If distance < threshold → gesture confirmed.
 * This mimics a simple nearest-centroid classifier.
 */
const calibFrames: number[][] = []      // collected landmark vectors
let trainedCentroid: number[] | null = null  // mean vector after calibration

// ─── MEDIAPIPE HANDS ────────────────────────────────────────────────────────
let hands: any = null
let camera: any = null
let animFrame: number | null = null
let calibStart: number | null = null
const CALIB_DURATION = 2500  // ms to hold gesture

// MediaPipe landmark indices
const WRIST = 0
const INDEX_MCP = 5;  const INDEX_PIP = 6;  const INDEX_TIP = 8
const MIDDLE_MCP = 9; const MIDDLE_PIP = 10; const MIDDLE_TIP = 12
const RING_MCP = 13;  const RING_TIP = 16
const PINKY_MCP = 17; const PINKY_TIP = 20

/**
 * GESTURE DETECTION LOGIC:
 * We check y-coordinates of finger tips vs their MCP knuckles.
 * Since canvas y increases downward, a finger pointing UP means tip.y < mcp.y.
 * ✌️ gesture = index up + middle up + ring down + pinky down.
 * We add a margin of 0.04 normalized units to avoid jitter triggering false positives.
 */
const isVictoryGesture = (lm: any[]): boolean => {
  const up = (tip: number, mcp: number) => lm[tip].y < lm[mcp].y - 0.04
  const down = (tip: number, mcp: number) => lm[tip].y > lm[mcp].y + 0.02
  return up(INDEX_TIP, INDEX_MCP) &&
         up(MIDDLE_TIP, MIDDLE_MCP) &&
         down(RING_TIP, RING_MCP) &&
         down(PINKY_TIP, PINKY_MCP)
}

/** Flatten 21 landmarks into a 42-number vector [x0,y0,...x20,y20] */
const landmarksToVector = (lm: any[]): number[] =>
  lm.flatMap((p: any) => [p.x, p.y])

/** Euclidean distance between two same-length vectors */
const vecDistance = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0))

/** Compute mean vector from an array of vectors (centroid) */
const computeCentroid = (vectors: number[][]): number[] => {
  const len = vectors[0].length
  const sum = new Array(len).fill(0)
  vectors.forEach(v => v.forEach((val, i) => { sum[i] += val }))
  return sum.map(s => s / vectors.length)
}

// ─── DRAW LANDMARKS ─────────────────────────────────────────────────────────
const drawLandmarks = (lm: any[], w: number, h: number, ctx: CanvasRenderingContext2D) => {
  // Draw dots for each of 21 hand points
  lm.forEach((p: any, i: number) => {
    ctx.beginPath()
    ctx.arc(p.x * w, p.y * h, i === 0 ? 5 : 3, 0, Math.PI * 2)
    ctx.fillStyle = gestureDetected.value ? '#22c55e' : '#3b82f6'
    ctx.fill()
  })
  // Draw connections between key joints
  const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]]
  ctx.strokeStyle = gestureDetected.value ? 'rgba(34,197,94,.6)' : 'rgba(59,130,246,.5)'
  ctx.lineWidth = 1.5
  connections.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(lm[a].x * w, lm[a].y * h)
    ctx.lineTo(lm[b].x * w, lm[b].y * h)
    ctx.stroke()
  })
}

// ─── MAIN DETECTION CALLBACK ────────────────────────────────────────────────
const onResults = (results: any) => {
  if (!canvasEl.value || !videoEl.value) return
  const canvas = canvasEl.value
  const ctx = canvas.getContext('2d')!
  const w = canvas.width = videoEl.value.videoWidth || 320
  const h = canvas.height = videoEl.value.videoHeight || 240

  ctx.clearRect(0, 0, w, h)

  if (!results.multiHandLandmarks?.length) {
    gestureDetected.value = false
    calibStart = null
    calibProgress.value = 0
    if (step.value === 'calibrating') step.value = 'detecting'
    return
  }

  const lm = results.multiHandLandmarks[0]
  drawLandmarks(lm, w, h, ctx)

  const isGesture = isVictoryGesture(lm)
  gestureDetected.value = isGesture

  if (!isGesture) {
    calibStart = null
    calibProgress.value = 0
    if (step.value === 'calibrating') step.value = 'detecting'
    return
  }

  // ── CALIBRATION PHASE ──
  // User is holding the gesture — start collecting frames
  if (!calibStart) calibStart = Date.now()
  const elapsed = Date.now() - calibStart
  calibProgress.value = Math.min((elapsed / CALIB_DURATION) * 100, 100)

  // Collect this frame's landmark vector for training
  calibFrames.push(landmarksToVector(lm))

  if (elapsed < CALIB_DURATION) {
    step.value = 'calibrating'
    return
  }

  // ── TRAINING COMPLETE: compute centroid ──
  if (!trainedCentroid && calibFrames.length > 5) {
    trainedCentroid = computeCentroid(calibFrames)
  }

  // ── VERIFICATION: compare current frame to trained centroid ──
  if (trainedCentroid) {
    const currentVec = landmarksToVector(lm)
    const dist = vecDistance(currentVec, trainedCentroid)
    /**
     * VERIFICATION THRESHOLD:
     * Distance < 0.5 means the current pose is close enough to the trained centroid.
     * This threshold was tuned empirically for normalized [0..1] landmark coordinates.
     * Lower = stricter match. Higher = more lenient.
     */
    if (dist < 0.5) {
      step.value = 'verified'
      stopCamera()
      emit('verified')
    }
  }
}

// ─── CAMERA SETUP ───────────────────────────────────────────────────────────
const startCamera = async () => {
  cameraError.value = ''
  try {
    // Dynamically load MediaPipe Hands from CDN (no npm install needed)
    if (!window.Hands) {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
    }

    step.value = 'detecting'

    // Initialize MediaPipe Hands
    hands = new window.Hands({
      locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    })
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    })
    hands.onResults(onResults)

    // Start webcam via MediaPipe Camera helper
    await hands.initialize()

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()

      // Use Camera utility to send frames to MediaPipe
      camera = new window.Camera(videoEl.value, {
        onFrame: async () => { if (hands && videoEl.value) await hands.send({ image: videoEl.value }) },
        width: 640, height: 480,
      })
      camera.start()
    }
  } catch (e: any) {
    cameraError.value = e?.message?.includes('Permission')
      ? 'Нет доступа к камере. Разрешите доступ в браузере.'
      : `Ошибка камеры: ${e?.message || 'неизвестная ошибка'}`
    step.value = 'idle'
  }
}

const stopCamera = () => {
  camera?.stop()
  if (videoEl.value?.srcObject) {
    (videoEl.value.srcObject as MediaStream).getTracks().forEach(t => t.stop())
  }
  if (animFrame) cancelAnimationFrame(animFrame)
}

const loadScript = (src: string): Promise<void> =>
  new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return }
    const s = document.createElement('script')
    s.src = src; s.crossOrigin = 'anonymous'
    s.onload = () => res()
    s.onerror = () => rej(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })

// Extend window type for dynamically loaded MediaPipe
declare global {
  interface Window { Hands: any; Camera: any }
}

// ─── STATUS DISPLAY ─────────────────────────────────────────────────────────
const statusText = computed(() => {
  if (step.value === 'detecting') return gestureDetected.value ? 'Жест обнаружен! Удержите...' : 'Покажите ✌️'
  if (step.value === 'calibrating') return 'Калибровка...'
  return ''
})
const statusClass = computed(() => ({
  'status-idle': !gestureDetected.value,
  'status-detected': gestureDetected.value && step.value !== 'calibrating',
  'status-calibrating': step.value === 'calibrating',
}))

onUnmounted(() => stopCamera())
</script>

<style scoped>
.gv-wrap{display:flex;flex-direction:column;gap:14px}
.gv-header{text-align:center}
.gv-icon{font-size:32px;margin-bottom:6px}
.gv-title{font-size:15px;font-weight:700;color:var(--text1);margin-bottom:4px}
.gv-desc{font-size:12px;color:var(--text3);line-height:1.5}
.gv-video-wrap{position:relative;border-radius:var(--r-lg);overflow:hidden;background:#000;aspect-ratio:4/3;max-height:220px}
.gv-video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.gv-canvas{position:absolute;inset:0;width:100%;height:100%;transform:scaleX(-1);pointer-events:none}
.gv-status{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:600;white-space:nowrap;backdrop-filter:blur(8px)}
.status-idle{background:rgba(0,0,0,.5);color:#fff}
.status-detected{background:rgba(59,130,246,.85);color:#fff}
.status-calibrating{background:rgba(34,197,94,.85);color:#fff}
.gv-status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex-shrink:0;animation:pulse 1s infinite}
.gv-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;pointer-events:none}
.gv-verified{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;background:var(--green-l);border-radius:var(--r-lg);border:1px solid var(--green)}
.gv-check{width:56px;height:56px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center}
.gv-error{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--red-l);border:1px solid var(--red);border-radius:var(--r-md);font-size:13px;color:var(--red)}
.gv-instructions{display:flex;flex-direction:column;gap:8px}
.inst-item{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);transition:color .2s}
.inst-item.done{color:var(--green);font-weight:500}
.inst-dot{width:8px;height:8px;border-radius:50%;background:var(--border2);flex-shrink:0;transition:background .2s}
.inst-dot.active{background:var(--blue)}
.inst-item.done .inst-dot{background:var(--green)}
</style>
