<template>
  <aside :class="['sb', { collapsed: isCollapsed }]">
    <!-- Logo — click to toggle sidebar -->
    <div class="sb-logo" @click="toggleSidebar">
      <!-- Expanded: new logo icon + Chatra text -->
      <template v-if="!isCollapsed">
        <img src="/logo-icon.png" class="logo-img-new" alt="Chatra"/>
        <span class="logo-name">Chatra</span>
      </template>
      <!-- Collapsed: old small logo -->
      <template v-else>
        <img src="/logo.png" class="logo-img-collapsed" alt="Chatra"/>
      </template>
    </div>

    <!-- Language switcher -->
    <div class="lang-switch" v-if="!isCollapsed">
      <button :class="['lang-btn', { active: lang === 'ru' }]" @click.stop="setLang('ru')">RU</button>
      <button :class="['lang-btn', { active: lang === 'en' }]" @click.stop="setLang('en')">EN</button>
      <button :class="['lang-btn', { active: lang === 'kk' }]" @click.stop="setLang('kk')">KZ</button>
    </div>

    <nav class="sb-nav">
      <NuxtLink to="/" class="sb-item" :class="{active:route.path==='/'||route.path.startsWith('/classes')}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('nav.classes') }}</span>
      </NuxtLink>

      <NuxtLink to="/chats" class="sb-item" :class="{active:route.path==='/chats'||route.path.startsWith('/chats')}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span v-if="totalUnread>0" class="notif-dot">{{totalUnread>9?'9+':totalUnread}}</span>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('nav.chats') }}</span>
        <span v-if="!isCollapsed && !isMobile && totalUnread>0" class="notif-pill">{{totalUnread>99?'99+':totalUnread}}</span>
      </NuxtLink>

      <NuxtLink v-if="auth.isAdmin" to="/admin" class="sb-item" :class="{active:route.path==='/admin'}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('nav.participants') }}</span>
      </NuxtLink>

      <NuxtLink to="/ai" class="sb-item" :class="{active:route.path==='/ai'}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('nav.ai') }}</span>
      </NuxtLink>

      <NuxtLink to="/settings" class="sb-item" :class="{active:route.path==='/settings'}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('nav.settings') }}</span>
      </NuxtLink>
    </nav>

    <!-- Nudge: нет ФИО -->
    <div v-if="!isCollapsed && !isMobile && !auth.fullname" class="fio-nudge" @click="$router.push('/settings')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Укажите ваше ФИО в настройках</span>
    </div>

    <div class="sb-bottom">
      <a href="https://t.me/whynicky" target="_blank" class="sb-item help-item" :title="t('chats.help_center')">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('chats.help_center') }}</span>
      </a>
      <div class="sb-item logout-item" @click="doLogout" :title="t('nav.logout')">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed && !isMobile">{{ t('nav.logout') }}</span>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useChatsStore } from '~/stores/chats.store'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
const auth = useAuthStore(); const chatsStore = useChatsStore(); const { logout } = useAuth(); const route = useRoute()
const { t, lang, setLang } = useI18n()
const totalUnread = computed(() => chatsStore.totalUnread)
const doLogout = () => { chatsStore.disconnectAll(); logout() }

const isCollapsed = ref(false)
const isMobile = ref(false)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  if (import.meta.client) localStorage.setItem('_sidebar_collapsed', isCollapsed.value ? '1' : '0')
}
onMounted(() => {
  if (import.meta.client) {
    isCollapsed.value = localStorage.getItem('_sidebar_collapsed') === '1'
    const check = () => { isMobile.value = window.innerWidth <= 768 }
    check()
    window.addEventListener('resize', check)
  }
})
</script>
<style scoped>
.sb{width:220px;height:100%;display:flex;flex-direction:column;background:var(--surface);border-right:1px solid var(--border);flex-shrink:0;overflow:hidden;transition:width .25s cubic-bezier(.4,0,.2,1);position:relative}
.sb.collapsed{width:56px}
.sb-logo{display:flex;align-items:center;gap:8px;padding:14px 12px 8px;cursor:pointer;flex-shrink:0;overflow:hidden;min-height:52px}
.logo-img-new{width:34px;height:34px;object-fit:contain;flex-shrink:0}
.logo-img-collapsed{width:30px;height:30px;object-fit:contain;flex-shrink:0;margin:0 auto}
.logo-name{font-size:16px;font-weight:800;color:var(--teal);letter-spacing:.04em;flex:1;overflow:hidden;white-space:nowrap}
.lang-switch{display:flex;align-items:center;gap:4px;padding:4px 14px 10px;flex-shrink:0}
.lang-btn{padding:4px 12px;border-radius:var(--r-sm);font-size:12px;font-weight:700;color:var(--text4);background:transparent;border:1px solid transparent;cursor:pointer;transition:all .15s;letter-spacing:.05em}
.lang-btn.active{background:var(--teal-l);border-color:var(--border2);color:var(--teal)}
.lang-btn:hover:not(.active){background:var(--glass2);color:var(--text2)}
.sb-nav{flex:1;padding:4px 6px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;overflow-x:hidden}
.sb-item{display:flex;align-items:center;gap:10px;padding:10px 10px;border-radius:var(--r-md);font-size:14px;font-weight:500;color:var(--text3);transition:all .15s;cursor:pointer;text-decoration:none;position:relative;white-space:nowrap}
.sb-item:hover{background:var(--surface2);color:var(--text1)}
.sb-item.active{background:var(--teal-l);color:var(--teal)}
.sb-item.active .item-icon svg{stroke:var(--teal)}
.collapsed .sb-item{justify-content:center;padding:10px 6px}
.collapsed .sb-logo{justify-content:center;padding:14px 6px 8px}
.item-icon{position:relative;flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:inherit}
.item-label{flex:1;overflow:hidden;text-overflow:ellipsis}
.notif-dot{position:absolute;top:-5px;right:-5px;width:14px;height:14px;border-radius:50%;background:var(--teal);color:#fff;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid var(--surface)}
.notif-pill{background:var(--teal);color:#fff;font-size:10px;font-weight:800;padding:1px 7px;border-radius:100px;flex-shrink:0}
.sb-bottom{padding:8px 6px 14px;border-top:1px solid var(--border);flex-shrink:0;display:flex;flex-direction:column;gap:2px}
.help-item{color:var(--text4)}
.logout-item{color:var(--text4)}
.logout-item:hover{background:var(--red-l)!important;color:var(--red)!important}
.fio-nudge{display:flex;align-items:center;gap:8px;margin:0 6px 8px;padding:10px 12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:var(--r-md);font-size:12px;font-weight:600;color:#b45309;cursor:pointer;transition:background .15s;}
.fio-nudge:hover{background:rgba(245,158,11,.18);}

@media (max-width:768px){
  .sb{
    position:fixed!important;
    bottom:0;left:0;right:0;top:auto!important;
    width:100%!important;
    height:60px;
    flex-direction:row;
    border-right:none;
    border-top:1px solid rgba(255,255,255,0.6);
    z-index:200;
    overflow:visible;
    background:rgba(240,248,250,0.72);
    backdrop-filter:blur(28px) saturate(200%);
    -webkit-backdrop-filter:blur(28px) saturate(200%);
    box-shadow:0 -8px 32px rgba(0,177,201,0.07),0 -1px 0 rgba(0,177,201,0.06),inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .sb.collapsed{width:100%!important}
  .sb-logo{display:none}
  .lang-switch{display:none}
  .fio-nudge{display:none}
  .sb-nav{
    flex-direction:row;
    flex:1;
    padding:0;
    gap:0;
    overflow:visible;
    align-items:stretch;
    justify-content:space-around;
  }
  .sb-item{
    flex-direction:column;
    padding:6px 4px 4px;
    gap:2px;
    border-radius:0;
    justify-content:center;
    align-items:center;
    flex:1;
    min-width:44px;
    min-height:44px;
    white-space:nowrap;
  }
  .sb-item .item-label{display:none}
  .sb-item.active{background:transparent;border-left:none}
  .sb-item.active .item-icon{color:var(--teal)}
  .sb-item.active .item-icon svg{stroke:var(--teal)}
  .item-icon{width:24px;height:24px}
  .notif-pill{display:none}
  .sb-bottom{
    flex-direction:row;
    border-top:none;
    padding:0;
    gap:0;
  }
  .sb-bottom .sb-item{flex:1}
  .help-item{display:none}
  .collapsed .sb-item{justify-content:center;padding:6px 4px 4px}
  .collapsed .sb-logo{display:none}
}
@media (max-width:480px){
  .sb{height:56px}
  .sb-item{min-width:40px}
  .item-icon{width:22px;height:22px}
}

/* Dark mode liquid glass nav */
:global(html.dark) .sb {
  background: rgba(8,14,16,0.72) !important;
  border-top: 1px solid rgba(0,177,201,0.18) !important;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,177,201,0.1) !important;
}
</style>
