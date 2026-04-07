<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal anim-scale">
      <div class="modal-head">
        <div class="modal-head-l">
          <div class="modal-ico" :class="type === 'lecture' ? 'ico-lec' : 'ico-mat'">
            <svg v-if="type === 'lecture'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <div class="modal-title">{{ type === 'lecture' ? 'Добавить лекцию' : 'Добавить материал' }}</div>
            <div class="modal-sub">{{ type === 'lecture' ? 'Учебный материал для класса' : 'Файлы и ресурсы для студентов' }}</div>
          </div>
        </div>
        <button class="btn btn-icon btn-ghost" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Type switch -->
      <div class="type-switch">
        <button :class="['type-btn', { active: type === 'lecture' }]" @click="type = 'lecture'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          Лекция
        </button>
        <button :class="['type-btn', { active: type === 'hw' }]" @click="type = 'hw'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Материал
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label class="field-label">{{ type === 'lecture' ? 'Тема лекции' : 'Название материала' }} *</label>
          <input v-model="title" class="inp" :placeholder="type === 'lecture' ? 'Например: Введение в тему...' : 'Название книги, ресурса...'" autofocus />
        </div>
        <div class="field">
          <label class="field-label">{{ type === 'lecture' ? 'Содержание лекции' : 'Описание' }}</label>
          <textarea v-model="body" class="inp inp-ta" rows="4" :placeholder="type === 'lecture' ? 'Текст лекции, ссылки на видео...' : 'Краткое описание материала...'"></textarea>
        </div>

        <!-- File upload -->
        <div class="field">
          <label class="field-label">Прикрепить файлы</label>
          <div class="file-drop" :class="{ dragging: drag }" @dragover.prevent="drag=true" @dragleave="drag=false" @drop.prevent="onDrop" @click="fi?.click()">
            <input type="file" style="display:none" ref="fi" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx" @change="onPick" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="drop-icon"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="drop-text">Перетащите или <strong>нажмите для выбора</strong></span>
            <span class="drop-hint">PDF, DOCX, PPT, изображения и другие</span>
          </div>

          <div v-if="selFiles.length" class="files-list">
            <div v-for="(f, i) in selFiles" :key="i" class="file-item">
              <span class="file-emoji">{{ fileIcon(f) }}</span>
              <span class="file-name">{{ f.name }}</span>
              <span class="file-size">{{ fileSize(f) }}</span>
              <button class="file-rm" @click.stop="removeFile(i)">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Upload progress -->
        <div v-if="uploading" class="upload-progress">
          <div class="upload-bar-wrap">
            <div class="upload-bar" :style="{ width: uploadPct + '%' }"></div>
          </div>
          <span class="upload-text">Загрузка {{ uploadCurrent }}/{{ selFiles.length }}...</span>
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn btn-ghost" @click="$emit('close')">Отмена</button>
        <button class="btn btn-purple" :disabled="!title.trim() || loading" @click="submit">
          <div v-if="loading" class="spinner"></div>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          {{ type === 'lecture' ? 'Опубликовать лекцию' : 'Добавить материал' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
import { useUploadSvc } from '~/services/uploads'

const props = defineProps<{ classId: number }>()
const emit = defineEmits<{ close: []; created: [p: any] }>()

const postsSvc = usePostsSvc()
const uploadSvc = useUploadSvc()
const toast = useToast()

const type = ref<'lecture' | 'hw'>('lecture')
const title = ref('')
const body = ref('')
const loading = ref(false)
const selFiles = ref<File[]>([])
const drag = ref(false)
const fi = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadCurrent = ref(0)
const uploadPct = ref(0)

const fileIcon = (f: File) => {
  if (f.type.startsWith('image/')) return '🖼️'
  const ext = f.name.split('.').pop()?.toLowerCase() || ''
  return ({ pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📋', pptx: '📋', zip: '🗜️', txt: '📃' })[ext] || '📎'
}
const fileSize = (f: File) => f.size < 1024 * 1024 ? (f.size / 1024).toFixed(0) + ' KB' : (f.size / 1024 / 1024).toFixed(1) + ' MB'

const onPick = (e: Event) => {
  selFiles.value = [...selFiles.value, ...Array.from((e.target as HTMLInputElement).files || [])]
}
const onDrop = (e: DragEvent) => {
  drag.value = false
  selFiles.value = [...selFiles.value, ...Array.from(e.dataTransfer?.files || [])]
}
const removeFile = (i: number) => { selFiles.value = selFiles.value.filter((_, idx) => idx !== i) }

const submit = async () => {
  loading.value = true
  uploading.value = selFiles.value.length > 0
  uploadCurrent.value = 0
  uploadPct.value = 0
  try {
    let finalBody = body.value
    const urls: string[] = []
    for (let i = 0; i < selFiles.value.length; i++) {
      uploadCurrent.value = i + 1
      uploadPct.value = Math.round(((i + 1) / selFiles.value.length) * 100)
      const { file_url } = await uploadSvc.upload(selFiles.value[i])
      urls.push(`${file_url}`)
    }
    if (urls.length > 0) finalBody += '\n\n' + urls.join('\n')

    const p = await postsSvc.create(
      `[${type.value.toUpperCase()}][${props.classId}] ${title.value}`,
      finalBody
    )
    toast.ok(type.value === 'lecture' ? 'Лекция опубликована' : 'Материал добавлен')
    emit('created', p)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Ошибка')
  } finally {
    loading.value = false
    uploading.value = false
  }
}
</script>

<style scoped>
.modal { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--r-2xl); width: 100%; max-width: 560px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: var(--sh-lg); overflow: hidden; }

.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.modal-head-l { display: flex; align-items: center; gap: 12px; }
.modal-ico { width: 38px; height: 38px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; }
.ico-lec { background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
.ico-mat { background: rgba(251,191,36,.1); color: #fbbf24; border: 1px solid rgba(251,191,36,.2); }
.modal-title { font-family: 'Outfit',sans-serif; font-size: 16px; font-weight: 800; color: var(--text1); }
.modal-sub { font-size: 12px; color: var(--text4); margin-top: 2px; }

.type-switch { display: flex; gap: 6px; padding: 12px 24px; background: var(--surface2); border-bottom: 1px solid var(--border); }
.type-btn { display: flex; align-items: center; gap: 7px; padding: 8px 18px; border-radius: var(--r-lg); font-size: 13px; font-weight: 600; color: var(--text3); background: transparent; border: 1px solid transparent; cursor: pointer; transition: all .15s; }
.type-btn:hover { color: var(--text1); background: var(--surface3); }
.type-btn.active { background: var(--surface3); color: var(--text1); border-color: var(--border2); }

.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
.modal-foot { padding: 14px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

.field { display: flex; flex-direction: column; gap: 7px; }
.field-label { font-size: 11px; font-weight: 700; color: var(--text4); text-transform: uppercase; letter-spacing: .06em; }
.inp { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 10px 13px; color: var(--text1); font-size: 13px; width: 100%; transition: border-color .15s; }
.inp:focus { border-color: rgba(0,177,201,.4); }
.inp-ta { resize: vertical; min-height: 90px; line-height: 1.6; }

.file-drop { border: 2px dashed var(--border2); border-radius: var(--r-lg); padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all .18s; }
.file-drop:hover, .file-drop.dragging { border-color: rgba(0,177,201,.45); background: rgba(0,177,201,.04); }
.drop-icon { color: var(--text4); }
.drop-text { font-size: 13px; color: var(--text3); }
.drop-text strong { color: var(--teal); }
.drop-hint { font-size: 11px; color: var(--text4); }

.files-list { display: flex; flex-direction: column; gap: 4px; }
.file-item { display: flex; align-items: center; gap: 8px; padding: 7px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); }
.file-emoji { font-size: 15px; flex-shrink: 0; }
.file-name { font-size: 13px; font-weight: 500; color: var(--text1); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-size { font-size: 11px; color: var(--text4); white-space: nowrap; }
.file-rm { width: 20px; height: 20px; border-radius: 50%; background: var(--surface3); color: var(--text4); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.file-rm:hover { background: var(--red-l); color: var(--red); }

.upload-progress { display: flex; flex-direction: column; gap: 5px; }
.upload-bar-wrap { height: 3px; background: var(--border); border-radius: 3px; overflow: hidden; }
.upload-bar { height: 100%; background: var(--teal); border-radius: 3px; transition: width .3s; }
.upload-text { font-size: 12px; color: var(--teal); }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
