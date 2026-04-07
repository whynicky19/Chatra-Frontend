
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AiWindow: typeof import("../../components/chat/AiWindow.vue")['default']
  ChatListItem: typeof import("../../components/chat/ChatListItem.vue")['default']
  ChatMessage: typeof import("../../components/chat/ChatMessage.vue")['default']
  ChatWindow: typeof import("../../components/chat/ChatWindow.vue")['default']
  AssignmentCard: typeof import("../../components/classes/AssignmentCard.vue")['default']
  AssignmentModal: typeof import("../../components/classes/AssignmentModal.vue")['default']
  ClassAiChat: typeof import("../../components/classes/ClassAiChat.vue")['default']
  ClassCard: typeof import("../../components/classes/ClassCard.vue")['default']
  CreateAssignmentModal: typeof import("../../components/classes/CreateAssignmentModal.vue")['default']
  CreateClassModal: typeof import("../../components/classes/CreateClassModal.vue")['default']
  CreatePostModal: typeof import("../../components/classes/CreatePostModal.vue")['default']
  PostCard: typeof import("../../components/classes/PostCard.vue")['default']
  ViewPostModal: typeof import("../../components/classes/ViewPostModal.vue")['default']
  AppSidebar: typeof import("../../components/layout/AppSidebar.vue")['default']
  GestureVerify: typeof import("../../components/ui/GestureVerify.vue")['default']
  ToastContainer: typeof import("../../components/ui/ToastContainer.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAiWindow: LazyComponent<typeof import("../../components/chat/AiWindow.vue")['default']>
  LazyChatListItem: LazyComponent<typeof import("../../components/chat/ChatListItem.vue")['default']>
  LazyChatMessage: LazyComponent<typeof import("../../components/chat/ChatMessage.vue")['default']>
  LazyChatWindow: LazyComponent<typeof import("../../components/chat/ChatWindow.vue")['default']>
  LazyAssignmentCard: LazyComponent<typeof import("../../components/classes/AssignmentCard.vue")['default']>
  LazyAssignmentModal: LazyComponent<typeof import("../../components/classes/AssignmentModal.vue")['default']>
  LazyClassAiChat: LazyComponent<typeof import("../../components/classes/ClassAiChat.vue")['default']>
  LazyClassCard: LazyComponent<typeof import("../../components/classes/ClassCard.vue")['default']>
  LazyCreateAssignmentModal: LazyComponent<typeof import("../../components/classes/CreateAssignmentModal.vue")['default']>
  LazyCreateClassModal: LazyComponent<typeof import("../../components/classes/CreateClassModal.vue")['default']>
  LazyCreatePostModal: LazyComponent<typeof import("../../components/classes/CreatePostModal.vue")['default']>
  LazyPostCard: LazyComponent<typeof import("../../components/classes/PostCard.vue")['default']>
  LazyViewPostModal: LazyComponent<typeof import("../../components/classes/ViewPostModal.vue")['default']>
  LazyAppSidebar: LazyComponent<typeof import("../../components/layout/AppSidebar.vue")['default']>
  LazyGestureVerify: LazyComponent<typeof import("../../components/ui/GestureVerify.vue")['default']>
  LazyToastContainer: LazyComponent<typeof import("../../components/ui/ToastContainer.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
