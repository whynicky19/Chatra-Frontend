<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal anim-scale" style="max-width:480px;width:100%">
      <div class="modal-head">
        <span class="modal-title">Создать класс</span>
        <button class="btn btn-icon btn-ghost" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Cover image upload -->
      <div class="frow">
        <label class="flabel">Обложка класса</label>
        <div class="cover-upload" @click="fileInput?.click()" :style="coverPreview ? `background-image:url(${coverPreview})` : ''">
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onImagePick"/>
          <div v-if="!coverPreview" class="cover-placeholder">
            <div class="cover-ph-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <span>Нажмите для загрузки фото</span>
            <span class="cover-ph-hint">JPG, PNG — будет обложкой карточки</span>
          </div>
          <button v-else class="cover-remove" @click.stop="coverPreview=null;coverBase64=null">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="frow"><label class="flabel">Название класса *</label><input v-model="title" class="input" placeholder="Например: Математика 10А" autofocus/></div>
      <div class="frow"><label class="flabel">Описание</label><input v-model="description" class="input" placeholder="Краткое описание курса"/></div>
      <div class="frow"><label class="flabel">Период</label><input v-model="period" class="input" placeholder="Например: 2024-2025"/></div>
      <div class="frow"><label class="flabel">Учитель / Преподаватель</label><input v-model="teacher" class="input" placeholder="Ваше имя"/></div>

      <!-- Общие критерии оценивания -->
      <div class="frow">
        <div class="criteria-header">
          <label class="flabel">Общие критерии оценивания</label>
          <button class="btn-add-crit" type="button" @click="addCriterion">+ Добавить</button>
        </div>
        <div class="criteria-hint">ИИ будет использовать их для всех заданий без собственных критериев</div>
        <div class="criteria-list">
          <div v-for="(c, i) in defaultCriteria" :key="i" class="crit-row">
            <span class="crit-num">{{ i + 1 }}</span>
            <input v-model="c.name" class="input input-sm" placeholder="Название критерия" />
            <input v-model.number="c.weight" type="number" class="input input-sm weight-inp" min="1" placeholder="Баллы" />
            <button class="crit-rm" type="button" @click="defaultCriteria.splice(i,1)">×</button>
          </div>
          <div v-if="!defaultCriteria.length" class="no-crit">Критерии не заданы — ИИ оценит по умолчанию</div>
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn btn-white" @click="$emit('close')">Отмена</button>
        <button class="btn btn-blue" :disabled="!title.trim()||loading" @click="submit">
          <div v-if="loading" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <span v-else>Создать класс</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
const emit = defineEmits<{close:[]; created:[p:any]}>()
const postsSvc = usePostsSvc(); const toast = useToast()
const title = ref(''); const period = ref(''); const teacher = ref(''); const description = ref(''); const loading = ref(false)
const coverPreview = ref<string|null>(null); const coverBase64 = ref<string|null>(null)
const fileInput = ref<HTMLInputElement|null>(null)
const defaultCriteria = ref<{name: string; weight: number}[]>([])

const addCriterion = () => defaultCriteria.value.push({ name: '', weight: 10 })

const onImagePick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    coverPreview.value = result; coverBase64.value = result
  }
  reader.readAsDataURL(f)
}

const submit = async () => {
  loading.value = true
  try {
    const body = JSON.stringify({
      type: 'class', period: period.value, teacher: teacher.value,
      description: description.value, members: 1, color: '',
      cover_image: coverBase64.value || '',
      default_criteria: defaultCriteria.value.filter(c => c.name.trim() && c.weight > 0)
    })
    const p = await postsSvc.create(title.value, body)
    toast.ok('Класс создан'); emit('created', p)
  } catch(e: any) { toast.err(e?.response?.data?.detail || 'Ошибка') }
  finally { loading.value = false }
}
</script>
<style scoped>
.cover-upload {
  width: 100%; height: 130px; border: 2px dashed var(--border2); border-radius: var(--r-lg);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  background-size: cover; background-position: center; background-repeat: no-repeat;
  position: relative; overflow: hidden; transition: all .2s;
}
.cover-upload:hover { border-color: var(--teal); background-color: rgba(0,177,201,.05); }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text4); pointer-events: none; }
.cover-ph-icon { width: 44px; height: 44px; border-radius: var(--r-md); background: rgba(0,177,201,.1); border: 1px solid rgba(0,177,201,.2); display: flex; align-items: center; justify-content: center; color: var(--teal); }
.cover-placeholder span { font-size: 13px; font-weight: 500; color: var(--text3); }
.cover-ph-hint { font-size: 11px; color: var(--text4); }
.cover-remove { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.75); border: 1px solid rgba(255,255,255,.2); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.cover-remove:hover { background: rgba(248,113,113,.8); }
.criteria-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.criteria-hint { font-size: 11px; color: var(--text4); margin-bottom: 8px; line-height: 1.5; }
.criteria-list { display: flex; flex-direction: column; gap: 6px; }
.crit-row { display: grid; grid-template-columns: 22px 1fr 72px 24px; gap: 6px; align-items: center; }
.crit-num { font-size: 11px; font-weight: 700; color: var(--text4); text-align: center; }
.input-sm { padding: 7px 9px; font-size: 13px; }
.weight-inp { text-align: center; }
.crit-rm { width: 22px; height: 22px; border-radius: 50%; background: transparent; border: none; color: var(--text4); cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all .15s; }
.crit-rm:hover { background: var(--red-l, rgba(248,113,113,.12)); color: #f87171; }
.no-crit { font-size: 12px; color: var(--text4); padding: 8px 0; }
.btn-add-crit { font-size: 12px; font-weight: 600; color: var(--purple, #00B1C9); background: rgba(0,177,201,.08); border: 1px solid rgba(0,177,201,.2); border-radius: 6px; padding: 4px 10px; cursor: pointer; transition: all .15s; }
.btn-add-crit:hover { background: rgba(0,177,201,.15); }

@media (max-width:768px) {
  .cover-upload { height: 110px; }
  .crit-row { grid-template-columns: 20px 1fr 64px 22px; gap: 4px; }
  .input-sm { font-size: 16px; }
  .btn-add-crit { min-height: 44px; padding: 6px 14px; }
}
@media (max-width:480px) {
  .crit-row { grid-template-columns: 18px 1fr 56px 20px; gap: 3px; }
}
</style>
