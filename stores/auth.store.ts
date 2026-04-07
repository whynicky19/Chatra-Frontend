import { defineStore } from 'pinia'
interface User{id:number;email:string;is_active:boolean;role:string}

export const useAuthStore = defineStore('auth',{
  state:()=>({
    token:null as string|null,
    user:null as User|null,
    nickname:'' as string,
    fullname:'' as string,
    avatar:'' as string,
    sidebarCollapsed:true as boolean,
    darkMode:false as boolean,
  }),
  getters:{isAuthenticated:(s)=>!!s.token&&!!s.user,isAdmin:(s)=>s.user?.role==='admin',isTeacher:(s)=>s.user?.role==='teacher'||s.user?.role==='admin'},
  actions:{
    setToken(t:string){this.token=t;if(import.meta.client)localStorage.setItem('_tk',t)},

    setUser(u:User){
      this.user=u
      // Load per-user data after we know the user ID
      if(import.meta.client){
        const n=localStorage.getItem(`_nick_${u.id}`)
        this.nickname=n||''
        const fn=localStorage.getItem(`_fullname_${u.id}`)
        this.fullname=fn||''
        const a=localStorage.getItem(`_avatar_${u.id}`)
        this.avatar=a||''
        // Also keep _nick_registry and _avatar_registry in sync for other components
        if(n){
          const reg=JSON.parse(localStorage.getItem('_nick_registry')||'{}')
          reg[u.id]=n
          localStorage.setItem('_nick_registry',JSON.stringify(reg))
        }
        if(fn){
          const reg=JSON.parse(localStorage.getItem('_fullname_registry')||'{}')
          reg[u.id]=fn
          localStorage.setItem('_fullname_registry',JSON.stringify(reg))
        }
        if(a){
          const reg=JSON.parse(localStorage.getItem('_avatar_registry')||'{}')
          reg[u.id]=a
          localStorage.setItem('_avatar_registry',JSON.stringify(reg))
        }
      }
    },

    logout(){
      // Clear in-memory user data but keep global prefs (theme, sidebar)
      this.token=null
      this.user=null
      this.nickname=''
      this.fullname=''
      this.avatar=''
      if(import.meta.client)localStorage.removeItem('_tk')
    },

    loadFromStorage(){
      if(import.meta.client){
        const t=localStorage.getItem('_tk');if(t)this.token=t
        const s=localStorage.getItem('_sidebar');this.sidebarCollapsed=s==='1'
        const d=localStorage.getItem('lightMode');this.darkMode=d!=='1'
        // NOTE: avatar and nick are loaded in setUser() after we have user ID
      }
    },

    setFullname(fn:string){
      this.fullname=fn
      if(import.meta.client&&this.user){
        localStorage.setItem(`_fullname_${this.user.id}`,fn)
        const reg=JSON.parse(localStorage.getItem('_fullname_registry')||'{}')
        reg[this.user.id]=fn
        localStorage.setItem('_fullname_registry',JSON.stringify(reg))
      }
    },

    setNickname(n:string){
      this.nickname=n
      if(import.meta.client&&this.user){
        // Per-user key
        localStorage.setItem(`_nick_${this.user.id}`,n)
        // Keep registry in sync for other components
        const reg=JSON.parse(localStorage.getItem('_nick_registry')||'{}')
        reg[this.user.id]=n
        localStorage.setItem('_nick_registry',JSON.stringify(reg))
      }
    },

    setAvatar(a:string){
      this.avatar=a
      if(import.meta.client&&this.user){
        // Per-user key
        localStorage.setItem(`_avatar_${this.user.id}`,a)
        // Keep registry in sync for other components
        const reg=JSON.parse(localStorage.getItem('_avatar_registry')||'{}')
        reg[this.user.id]=a
        localStorage.setItem('_avatar_registry',JSON.stringify(reg))
      }
    },

    toggleSidebar(){this.sidebarCollapsed=!this.sidebarCollapsed;if(import.meta.client)localStorage.setItem('_sidebar',this.sidebarCollapsed?'1':'0')},
    setDarkMode(v:boolean){this.darkMode=v;if(import.meta.client)localStorage.setItem('darkMode',v?'1':'0')},
  },
})
