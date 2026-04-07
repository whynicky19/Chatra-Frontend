<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal anim-scale" style="max-width:580px">
      <div class="modal-head">
        <div>
          <div :class="['vp-badge',post.type==='lecture'?'lec':'hw']">{{post.type==='lecture'?'📖 Лекция':'📝 Домашнее задание'}}</div>
          <div class="modal-title" style="margin-top:8px">{{postTitle}}</div>
        </div>
        <button class="btn btn-icon btn-ghost" @click="$emit('close')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>

      <div class="vp-body">{{postBody}}</div>

      <!-- Все прикреплённые файлы -->
      <div v-if="attachedFiles.length" class="vp-files">
        <div class="vp-files-label">Прикреплённые файлы</div>
        <a
          v-for="f in attachedFiles"
          :key="f.url"
          :href="f.url"
          target="_blank"
          download
          class="vp-file-row"
        >
          <span style="font-size:18px;flex-shrink:0">{{f.icon}}</span>
          <span class="truncate" style="font-size:13px;font-weight:500;flex:1">{{f.name}}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
      </div>

      <!-- Фотографии -->
      <div v-if="images.length" class="vp-images">
        <div class="vp-files-label">Фотографии</div>
        <div class="images-grid">
          <a v-for="img in images" :key="img.url" :href="img.url" target="_blank" class="img-thumb">
            <img :src="img.url" :alt="img.name"/>
          </a>
        </div>
      </div>

      <!-- Сдача ДЗ -->
      <div v-if="post.type==='hw'" class="vp-submit">
        <div style="font-size:14px;font-weight:600;margin-bottom:10px">Сдать работу</div>
        <div class="submit-area">
          <label class="btn btn-white btn-sm" style="cursor:pointer">
            <input type="file" multiple style="display:none" @change="onSubFiles"/>
            📎 {{subFiles.length?`${subFiles.length} файл(ов) выбрано`:'Выбрать файлы'}}
          </label>
          <div v-if="subFiles.length" class="sub-files-list">
            <span v-for="f in subFiles" :key="f.name" class="sub-file-chip">{{f.name}}</span>
          </div>
          <textarea v-model="subText" class="input" rows="2" placeholder="Комментарий к работе..." style="resize:none"></textarea>
          <button class="btn btn-blue btn-sm" :disabled="(!subFiles.length&&!subText.trim())||submitting" @click="submitWork">
            <div v-if="submitting" class="spinner" style="width:12px;height:12px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>Отправить</span>
          </button>
        </div>
        <div v-if="submitted" class="submitted-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Работа сдана!
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '~/composables/useToast'
import { useUploadSvc } from '~/services/uploads'
import { usePostsSvc } from '~/services/posts'

const props = defineProps<{ post: { id: number; title: string; body: string; type: 'lecture'|'hw' } }>()
const emit = defineEmits<{ close: [] }>()
const uploadSvc = useUploadSvc()
const postsSvc = usePostsSvc()
const toast = useToast()

const subFiles = ref<File[]>([])
const subText = ref('')
const submitting = ref(false)
const submitted = ref(false)

const postTitle = computed(() => props.post.title.replace(/^\[(LECTURE|HW)\]\[\d+\] /, ''))

// Тело без прикреплений
const postBody = computed(() => {
  const body = props.post.body || ''
  const idx = body.indexOf('\n\n📎')
  return idx > -1 ? body.slice(0, idx).trim() : body.trim()
})

// Парсим все прикреплённые файлы из body
const imageExts = ['jpg','jpeg','png','gif','webp','bmp','svg']
const allAttachments = computed(() => {
  const matches = [...(props.post.body || '').matchAll(/📎 \[([^\]]+)\]\(([^)]+)\)/g)]
  return matches.map(m => ({
    name: m[1],
    url: m[2],
    ext: m[1].split('.').pop()?.toLowerCase() || '',
  }))
})
const images = computed(() => allAttachments.value.filter(f => imageExts.includes(f.ext)).map(f => ({...f, icon:'🖼️'})))
const attachedFiles = computed(() => allAttachments.value.filter(f => !imageExts.includes(f.ext)).map(f => {
  const icons: Record<string,string> = {pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📋',pptx:'📋',zip:'🗜️',txt:'📃'}
  return {...f, icon: icons[f.ext] || '📎'}
}))

const onSubFiles = (e: Event) => {
  subFiles.value = Array.from((e.target as HTMLInputElement).files || [])
}

const submitWork = async () => {
  submitting.value = true
  try {
    let comment = subText.value.trim()
    const uploads: string[] = []
    for (const f of subFiles.value) {
      const { file_url } = await uploadSvc.upload(f)
      uploads.push(`📎 [${f.name}](${file_url})`)
    }
    if (uploads.length) comment += '\n' + uploads.join('\n')
    await postsSvc.create(`[SUBMIT][${props.post.id}] Сдача работы`, comment || 'Работа сдана')
    submitted.value = true
    toast.ok('Работа сдана!')
  } catch {
    toast.err('Ошибка при сдаче')
  } finally {
    submitting.value = false
  }
}
</script>
<style scoped>
.vp-badge{display:inline-flex;padding:3px 10px;border-radius:var(--r-sm);font-size:12px;font-weight:600}
.lec{background:var(--blue-l);color:var(--blue)}
.hw{background:var(--green-l);color:var(--green)}
.vp-body{font-size:14px;line-height:1.7;color:var(--text2);white-space:pre-wrap;margin:16px 0;padding:14px;background:var(--bg);border-radius:var(--r-md);max-height:260px;overflow-y:auto}
.vp-files{margin-bottom:14px}
.vp-files-label{font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.03em;margin-bottom:8px}
.vp-file-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);text-decoration:none;color:var(--text1);transition:background .15s;margin-bottom:4px}
.vp-file-row:hover{background:var(--blue-l);color:var(--blue)}
.vp-images{margin-bottom:14px}
.images-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.img-thumb{display:block;border-radius:var(--r-sm);overflow:hidden;border:1px solid var(--border);aspect-ratio:1;background:var(--surface2)}
.img-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .15s}
.img-thumb:hover img{transform:scale(1.05)}
.vp-submit{border-top:1px solid var(--border);padding-top:16px}
.submit-area{display:flex;flex-direction:column;gap:8px}
.sub-files-list{display:flex;flex-wrap:wrap;gap:4px}
.sub-file-chip{font-size:12px;padding:2px 8px;background:var(--blue-l);color:var(--blue);border-radius:100px;font-weight:500}
.submitted-badge{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--green);margin-top:12px;padding:10px;background:var(--green-l);border-radius:var(--r-md)}
</style>
