export default defineNuxtPlugin(() => {
  if (!import.meta.client) return


  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  )

  const observe = () => {
    document.querySelectorAll('.reveal').forEach((el) => {
      if (!el.classList.contains('revealed')) observer.observe(el)
    })
  }

  const router = useRouter()
  router.afterEach(() => {
    setTimeout(observe, 80)
  })
  setTimeout(observe, 100)
})