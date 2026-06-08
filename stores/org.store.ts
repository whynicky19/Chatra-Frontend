import { defineStore } from 'pinia'

export type OrgType = 'university' | 'school'

export const useOrgStore = defineStore('org', {
  state: () => ({
    orgType: null as OrgType | null,
  }),

  getters: {
    isSelected: (s) => s.orgType !== null,
    isSchool: (s) => s.orgType === 'school',
    isUniversity: (s) => s.orgType === 'university',
    orgTypeString: (s): string => s.orgType ?? 'university',

    // Primary color per org
    primaryColor: (s) => s.orgType === 'school' ? '#F59E0B' : '#00B1C9',
    primaryDark:  (s) => s.orgType === 'school' ? '#D97706' : '#009AAF',
    primaryLight: (s) => s.orgType === 'school' ? 'rgba(245,158,11,.1)' : 'rgba(0,177,201,.1)',

    gradientColors: (s): [string, string] =>
      s.orgType === 'school'
        ? ['#B45309', '#F59E0B']
        : ['#006475', '#009AAF'],
  },

  actions: {
    select(type: OrgType) {
      this.orgType = type
      if (import.meta.client) {
        localStorage.setItem('org_type', type)
        applyOrgTheme(type)
      }
    },

    clear() {
      this.orgType = null
      if (import.meta.client) {
        localStorage.removeItem('org_type')
        applyOrgTheme('university')
      }
    },

    init() {
      if (!import.meta.client) return
      const saved = localStorage.getItem('org_type') as OrgType | null
      if (saved === 'school' || saved === 'university') {
        this.orgType = saved
        applyOrgTheme(saved)
      }
    },
  },
})

/** Inject CSS variables based on org type */
export function applyOrgTheme(type: OrgType) {
  const root = document.documentElement
  if (type === 'school') {
    root.style.setProperty('--teal', '#F59E0B')
    root.style.setProperty('--teal-h', '#D97706')
    root.style.setProperty('--teal-d', '#B45309')
    root.style.setProperty('--teal-l', 'rgba(245,158,11,.1)')
    root.style.setProperty('--teal-m', 'rgba(245,158,11,.2)')
    root.style.setProperty('--teal-glow', '0 0 30px rgba(245,158,11,.4),0 0 60px rgba(245,158,11,.15)')
    root.setAttribute('data-org', 'school')
  } else {
    root.style.removeProperty('--teal')
    root.style.removeProperty('--teal-h')
    root.style.removeProperty('--teal-d')
    root.style.removeProperty('--teal-l')
    root.style.removeProperty('--teal-m')
    root.style.removeProperty('--teal-glow')
    root.removeAttribute('data-org')
  }
}
