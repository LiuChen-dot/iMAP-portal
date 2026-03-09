<template>
  <div class="analysis-workflow">
    <aside class="workflow-nav" ref="navRef">
      <nav class="workflow-nav__list">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#section-${section.id}`"
          :class="['workflow-nav__item', { 'is-active': activeSectionId === section.id }]"
          @click.prevent="scrollToSection(section.id)"
        >
          {{ isZh ? section.titleZh : section.titleEn }}
        </a>
      </nav>
    </aside>
    <main class="workflow-main" ref="mainRef">
      <section
        v-for="section in sections"
        :key="section.id"
        :id="`section-${section.id}`"
        class="workflow-section"
        :ref="(el) => setSectionRef(el, section.id)"
      >
        <h2 class="workflow-section__title">{{ isZh ? section.titleZh : section.titleEn }}</h2>
        <div class="card-grid">
          <AnalysisCard
            v-for="card in section.cards"
            :key="card.key"
            :title="isZh ? card.titleZh : card.titleEn"
            :description="isZh ? card.descZh : card.descEn"
            :icon="card.scriptsId != null ? getIcon(card.scriptsId) : ''"
            :scripts-id="card.scriptsId"
            @click="onCardClick(card)"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/store/modules/language'
import AnalysisCard from './components/AnalysisCard.vue'
import { ANALYSIS_SECTIONS } from './analysisConfig.js'
import { getIcon } from './icons.js'

const router = useRouter()
const languageStore = useLanguageStore()
const isZh = computed(() => languageStore.i18n === 'zh')

const sections = ANALYSIS_SECTIONS
const activeSectionId = ref(sections[0]?.id || '')
const mainRef = ref(null)
const navRef = ref(null)
const sectionRefs = ref({})
let observer = null

function setSectionRef(el, id) {
  if (el) sectionRefs.value[id] = el
}

function scrollToSection(id) {
  activeSectionId.value = id
  const el = document.getElementById(`section-${id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onCardClick(card) {
  if (card.scriptsId != null) {
    sessionStorage.setItem('scriptsId', String(card.scriptsId))
    sessionStorage.setItem('scriptsName', card.titleZh)
    sessionStorage.setItem('scriptsNameEn', card.titleEn)
    router.push('/taskupload')
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    () => {
      const viewportMid = window.innerHeight / 2
      let bestId = ''
      let bestTop = Infinity
      sections.forEach((s) => {
        const el = sectionRefs.value[s.id]
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.top <= viewportMid && rect.bottom > 100) {
          if (rect.top < bestTop) {
            bestTop = rect.top
            bestId = s.id
          }
        }
      })
      if (bestId) activeSectionId.value = bestId
    },
    { root: null, rootMargin: '-100px 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] }
  )

  nextTick(() => {
    sections.forEach((s) => {
      const el = sectionRefs.value[s.id]
      if (el) observer.observe(el)
    })
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style lang="scss" scoped>
.analysis-workflow {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  min-height: 100%;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.workflow-nav {
  position: sticky;
  top: 24px;
  flex-shrink: 0;
  width: 200px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 12px 0;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__item {
    display: block;
    padding: 10px 16px;
    font-size: 17px;
    color: #555;
    text-decoration: none;
    transition: color 0.2s, background 0.2s;

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9, #ecf5ff);
    }

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 600;
      background: var(--el-color-primary-light-9, #ecf5ff);
      border-left: 3px solid var(--el-color-primary);
    }
  }
}

.workflow-main {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.workflow-section {
  margin-bottom: 40px;
  scroll-margin-top: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  &__title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    padding-left: 10px;
    border-left: 4px solid var(--el-theme-color, var(--el-color-primary));
    line-height: 1.4;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .analysis-workflow {
    flex-direction: column;
  }

  .workflow-nav {
    position: static;
    width: 100%;
  }

  .workflow-nav__list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .workflow-nav__item {
    padding: 8px 12px;
    border-radius: 4px;

    &.is-active {
      border-left: none;
      border-bottom: 2px solid var(--el-color-primary);
    }
  }

  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
