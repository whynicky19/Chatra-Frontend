<template>
  <div class="auth-shell">
    <canvas ref="canvasEl" class="auth-canvas"></canvas>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="auth-content">
      <div class="auth-brand">
        <img src="/logo.png" class="auth-logo-img" alt="Chatra"/>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const canvasEl = ref<HTMLCanvasElement | null>(null)
let animId = 0

onMounted(() => {
  const c = canvasEl.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
  resize(); window.addEventListener('resize', resize)
  const W = () => c.width, H = () => c.height
  const labels = ['Math','Physics','AI','History','Chemistry','Biology','Code','English','∫dx','σ','E=mc²','DNA','Python','Newton','π','f(x)','Σ','∞']
  const colors = [
    {c:'#00B1C9',g:'rgba(0,177,201,0.6)'},{c:'#009aaf',g:'rgba(0,154,175,0.6)'},
    {c:'#4dd6e8',g:'rgba(77,214,232,0.5)'},{c:'#06b6d4',g:'rgba(6,182,212,0.5)'},
    {c:'#67e8f9',g:'rgba(103,232,249,0.45)'},{c:'#22d3ee',g:'rgba(34,211,238,0.5)'},
    {c:'#0e7490',g:'rgba(14,116,144,0.4)'},{c:'#34d399',g:'rgba(52,211,153,0.4)'},
  ]
  interface Node { x:number;y:number;vx:number;vy:number;r:number;pulsePhase:number;pulseSpeed:number;color:string;glow:string;label:string;type:'hub'|'mid'|'small';trail:{x:number;y:number}[];trailMax:number;twinklePhase:number;twinkleSpeed:number }
  const makeNode = (): Node => {
    const col = colors[Math.floor(Math.random()*colors.length)]
    const type = Math.random()<0.08?'hub':Math.random()<0.3?'mid':'small'
    const spd = type==='hub'?0.15:type==='mid'?0.28:0.45
    return { x:Math.random()*W(), y:Math.random()*H(), vx:(Math.random()-0.5)*spd, vy:(Math.random()-0.5)*spd,
      r:type==='hub'?7+Math.random()*5:type==='mid'?4+Math.random()*3:2+Math.random()*2,
      pulsePhase:Math.random()*Math.PI*2, pulseSpeed:0.018+Math.random()*0.025,
      color:col.c, glow:col.g, label:labels[Math.floor(Math.random()*labels.length)], type,
      trail:[], trailMax:type==='hub'?18:type==='mid'?10:5,
      twinklePhase:Math.random()*Math.PI*2, twinkleSpeed:0.03+Math.random()*0.05 }
  }
  const nodes: Node[] = Array.from({length:100}, makeNode)

  interface Signal { from:number;to:number;progress:number;speed:number;color:string;size:number }
  const signals: Signal[] = []; let signalTimer = 0
  interface Burst { x:number;y:number;r:number;maxR:number;alpha:number;color:string }
  const bursts: Burst[] = []
  interface Star { x:number;y:number;r:number;phase:number;speed:number }
  const stars: Star[] = Array.from({length:70}, ()=>({x:Math.random()*1920,y:Math.random()*1080,r:0.3+Math.random()*1.2,phase:Math.random()*Math.PI*2,speed:0.008+Math.random()*0.018}))

  const spawnSignal = () => {
    const from = Math.floor(Math.random()*nodes.length), cands: number[] = []
    for (let i=0;i<nodes.length;i++) { if(i===from) continue; const dx=nodes[i].x-nodes[from].x,dy=nodes[i].y-nodes[from].y; if(Math.sqrt(dx*dx+dy*dy)<210) cands.push(i) }
    if (cands.length) { const to=cands[Math.floor(Math.random()*cands.length)]; signals.push({from,to,progress:0,speed:0.006+Math.random()*0.01,color:nodes[from].color,size:1.5+Math.random()*2}) }
  }
  const spawnBurst = (x:number,y:number,color:string) => bursts.push({x,y,r:0,maxR:20+Math.random()*30,alpha:0.7,color})

  const CONNECT = 170; let t=0
  const frame = () => {
    animId = requestAnimationFrame(frame); t++
    // White background
    ctx.fillStyle='rgba(248,252,253,0.92)'; ctx.fillRect(0,0,W(),H())
    // No stars on white background — skip
    const bp=Math.sin(t*0.008)*0.15+0.85
    for (const b of [{x:W()*0.15,y:H()*0.25,r:W()*0.38*bp,c:'rgba(0,177,201,0.06)'},{x:W()*0.82,y:H()*0.62,r:W()*0.32*bp,c:'rgba(6,182,212,0.05)'},{x:W()*0.5,y:H()*0.85,r:W()*0.28*bp,c:'rgba(0,177,201,0.05)'},{x:W()*0.7,y:H()*0.15,r:W()*0.2*bp,c:'rgba(0,154,175,0.04)'}]) {
      const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r); g.addColorStop(0,b.c); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,W(),H())
    }
    for (const n of nodes) {
      n.trail.push({x:n.x,y:n.y}); if(n.trail.length>n.trailMax) n.trail.shift()
      n.x+=n.vx; n.y+=n.vy
      if(n.x<0) n.vx=Math.abs(n.vx); if(n.x>W()) n.vx=-Math.abs(n.vx)
      if(n.y<0) n.vy=Math.abs(n.vy); if(n.y>H()) n.vy=-Math.abs(n.vy)
      n.pulsePhase+=n.pulseSpeed; n.twinklePhase+=n.twinkleSpeed
    }
    for (const n of nodes) {
      if(n.trail.length<2) continue; ctx.save()
      for(let i=1;i<n.trail.length;i++){const p=i/n.trail.length;ctx.globalAlpha=p*0.18*(n.type==='hub'?1:n.type==='mid'?0.7:0.4);ctx.strokeStyle=n.color;ctx.lineWidth=p*(n.type==='hub'?2:1);ctx.beginPath();ctx.moveTo(n.trail[i-1].x,n.trail[i-1].y);ctx.lineTo(n.trail[i].x,n.trail[i].y);ctx.stroke()}
      ctx.restore()
    }
    for (let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){const dx=nodes[j].x-nodes[i].x,dy=nodes[j].y-nodes[i].y,d=Math.sqrt(dx*dx+dy*dy);if(d>CONNECT)continue;ctx.save();ctx.globalAlpha=(1-d/CONNECT)*0.25;const g=ctx.createLinearGradient(nodes[i].x,nodes[i].y,nodes[j].x,nodes[j].y);g.addColorStop(0,nodes[i].color);g.addColorStop(1,nodes[j].color);ctx.strokeStyle=g;ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();ctx.restore()}
    for (let s=signals.length-1;s>=0;s--){const sig=signals[s];sig.progress+=sig.speed;if(sig.progress>=1){spawnBurst(nodes[sig.to].x,nodes[sig.to].y,sig.color);signals.splice(s,1);continue}const a=nodes[sig.from],b=nodes[sig.to],sx=a.x+(b.x-a.x)*sig.progress,sy=a.y+(b.y-a.y)*sig.progress,e=Math.sin(sig.progress*Math.PI),tl=0.06,tx=a.x+(b.x-a.x)*Math.max(0,sig.progress-tl),ty=a.y+(b.y-a.y)*Math.max(0,sig.progress-tl);ctx.save();const tg=ctx.createLinearGradient(tx,ty,sx,sy);tg.addColorStop(0,'transparent');tg.addColorStop(1,sig.color);ctx.globalAlpha=e*0.7;ctx.strokeStyle=tg;ctx.lineWidth=sig.size*0.6;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(sx,sy);ctx.stroke();ctx.globalAlpha=e*0.95;ctx.shadowColor=sig.color;ctx.shadowBlur=14;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,sy,sig.size,0,Math.PI*2);ctx.fill();ctx.restore()}
    signalTimer++; if(signalTimer%14===0) spawnSignal()
    for(let b=bursts.length-1;b>=0;b--){const bu=bursts[b];bu.r+=1.4;bu.alpha-=0.05;if(bu.alpha<=0){bursts.splice(b,1);continue}ctx.save();ctx.globalAlpha=bu.alpha*0.6;ctx.strokeStyle=bu.color;ctx.lineWidth=1.2;ctx.shadowColor=bu.color;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(bu.x,bu.y,bu.r,0,Math.PI*2);ctx.stroke();ctx.restore()}
    for (const n of nodes) {
      const pulse=Math.sin(n.pulsePhase)*0.4+0.7,twinkle=Math.sin(n.twinklePhase)*0.3+0.85,r=n.r*pulse
      ctx.save()
      if(n.type==='hub'){ctx.shadowColor=n.glow;ctx.shadowBlur=35;ctx.globalAlpha=0.25*twinkle;const og=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4);og.addColorStop(0,n.color);og.addColorStop(1,'transparent');ctx.fillStyle=og;ctx.beginPath();ctx.arc(n.x,n.y,r*4,0,Math.PI*2);ctx.fill()}
      ctx.shadowColor=n.glow;ctx.shadowBlur=n.type==='hub'?22:n.type==='mid'?14:7;ctx.globalAlpha=0.65*pulse*twinkle
      const gr=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*2.5);gr.addColorStop(0,n.color);gr.addColorStop(0.5,n.glow);gr.addColorStop(1,'transparent');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(n.x,n.y,r*2.5,0,Math.PI*2);ctx.fill()
      ctx.globalAlpha=0.92*pulse*twinkle;ctx.shadowBlur=8
      if(n.type!=='small'){const co=ctx.createRadialGradient(n.x-r*0.3,n.y-r*0.3,0,n.x,n.y,r);co.addColorStop(0,'#fff');co.addColorStop(0.4,n.color);co.addColorStop(1,n.color);ctx.fillStyle=co}else ctx.fillStyle=n.color
      ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.fill()
      ctx.restore()
      if(n.type!=='small'){ctx.save();ctx.globalAlpha=(Math.sin(n.pulsePhase*0.3+1)*0.5+0.5)*0.6;ctx.fillStyle=n.color;ctx.font=`${n.type==='hub'?11:9}px 'Outfit',sans-serif`;ctx.textAlign='center';ctx.shadowColor=n.glow;ctx.shadowBlur=10;ctx.fillText(n.label,n.x,n.y-r-7);ctx.restore()}
    }
  }
  frame()
  return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize) }
})
onUnmounted(() => cancelAnimationFrame(animId))
</script>

<style scoped>
.auth-shell { position:relative;width:100%;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:#f0f8fa }
.auth-canvas { position:absolute;inset:0;width:100%;height:100%;display:block }
.orb { position:absolute;border-radius:50%;border:1px solid transparent;pointer-events:none;animation:orbit-spin linear infinite }
.orb-1 { width:500px;height:500px;top:50%;left:50%;transform:translate(-50%,-50%);border-color:rgba(0,177,201,0.12);animation-duration:60s;box-shadow:0 0 60px rgba(0,177,201,0.06) inset }
.orb-2 { width:800px;height:800px;top:50%;left:50%;transform:translate(-50%,-50%);border-color:rgba(6,182,212,0.08);animation-duration:90s;animation-direction:reverse }
.orb-3 { width:1100px;height:1100px;top:50%;left:50%;transform:translate(-50%,-50%);border-color:rgba(0,177,201,0.05);animation-duration:130s }
@keyframes orbit-spin { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
.auth-content { position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:28px;padding:24px 20px;width:100%;max-width:440px;overflow-y:auto;max-height:100vh;animation:content-enter 0.7s cubic-bezier(0.16,1,0.3,1) both }
@keyframes content-enter { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.auth-brand { display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:brand-enter 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both }
@keyframes brand-enter { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
.auth-logo-img { width:180px;height:auto;object-fit:contain }

@media (max-width:768px) {
  .auth-content { padding: 16px; gap: 16px; max-width: 100%; }
  .auth-logo-img { width: 130px; }
  .orb-1 { width: 300px; height: 300px; }
  .orb-2 { width: 500px; height: 500px; }
  .orb-3 { width: 700px; height: 700px; }
}
@media (max-width:480px) {
  .auth-content { padding: 12px; }
}
</style>
