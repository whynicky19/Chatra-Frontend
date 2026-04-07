
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


export const AiWindow: typeof import("../components/chat/AiWindow.vue")['default']
export const ChatListItem: typeof import("../components/chat/ChatListItem.vue")['default']
export const ChatMessage: typeof import("../components/chat/ChatMessage.vue")['default']
export const ChatWindow: typeof import("../components/chat/ChatWindow.vue")['default']
export const AssignmentCard: typeof import("../components/classes/AssignmentCard.vue")['default']
export const AssignmentModal: typeof import("../components/classes/AssignmentModal.vue")['default']
export const ClassAiChat: typeof import("../components/classes/ClassAiChat.vue")['default']
export const ClassCard: typeof import("../components/classes/ClassCard.vue")['default']
export const CreateAssignmentModal: typeof import("../components/classes/CreateAssignmentModal.vue")['default']
export const CreateClassModal: typeof import("../components/classes/CreateClassModal.vue")['default']
export const CreatePostModal: typeof import("../components/classes/CreatePostModal.vue")['default']
export const PostCard: typeof import("../components/classes/PostCard.vue")['default']
export const ViewPostModal: typeof import("../components/classes/ViewPostModal.vue")['default']
export const AppSidebar: typeof import("../components/layout/AppSidebar.vue")['default']
export const GestureVerify: typeof import("../components/ui/GestureVerify.vue")['default']
export const ToastContainer: typeof import("../components/ui/ToastContainer.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAiWindow: LazyComponent<typeof import("../components/chat/AiWindow.vue")['default']>
export const LazyChatListItem: LazyComponent<typeof import("../components/chat/ChatListItem.vue")['default']>
export const LazyChatMessage: LazyComponent<typeof import("../components/chat/ChatMessage.vue")['default']>
export const LazyChatWindow: LazyComponent<typeof import("../components/chat/ChatWindow.vue")['default']>
export const LazyAssignmentCard: LazyComponent<typeof import("../components/classes/AssignmentCard.vue")['default']>
export const LazyAssignmentModal: LazyComponent<typeof import("../components/classes/AssignmentModal.vue")['default']>
export const LazyClassAiChat: LazyComponent<typeof import("../components/classes/ClassAiChat.vue")['default']>
export const LazyClassCard: LazyComponent<typeof import("../components/classes/ClassCard.vue")['default']>
export const LazyCreateAssignmentModal: LazyComponent<typeof import("../components/classes/CreateAssignmentModal.vue")['default']>
export const LazyCreateClassModal: LazyComponent<typeof import("../components/classes/CreateClassModal.vue")['default']>
export const LazyCreatePostModal: LazyComponent<typeof import("../components/classes/CreatePostModal.vue")['default']>
export const LazyPostCard: LazyComponent<typeof import("../components/classes/PostCard.vue")['default']>
export const LazyViewPostModal: LazyComponent<typeof import("../components/classes/ViewPostModal.vue")['default']>
export const LazyAppSidebar: LazyComponent<typeof import("../components/layout/AppSidebar.vue")['default']>
export const LazyGestureVerify: LazyComponent<typeof import("../components/ui/GestureVerify.vue")['default']>
export const LazyToastContainer: LazyComponent<typeof import("../components/ui/ToastContainer.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
