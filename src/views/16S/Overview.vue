<template>
  <div class="overview">
    <div class="overview-inner">
      <section class="overview-section">
        <h2 class="overview-title">{{ $t('sixteensHome.ztjs') }}</h2>
        <p class="overview-desc">{{ $t('sixteensHome.ztjstext') }}</p>
        <p class="overview-desc">{{ $t('sixteensHome.ztjstext2') }}</p>
      </section>
      <section class="overview-section">
        <h2 class="overview-title">{{ $t('sixteensHome.cpjs') }}</h2>
        <p class="overview-desc">{{ $t('sixteensHome.cpjstext') }}</p>
      </section>
      <section class="overview-section">
        <h2 class="overview-title">{{ $t('sixteensHome.yzsjjfa') }}</h2>
        <p class="overview-desc">{{ $t('sixteensHome.yzsjjfatext') }}</p>
      </section>
      <div class="overview-grid">
        <section class="overview-section overview-card">
          <h3 class="overview-subtitle">{{ $t('sixteensHome.sxdz') }}</h3>
          <p class="overview-desc">{{ $t('sixteensHome.sxdztext') }}</p>
        </section>
        <section class="overview-section overview-card">
          <h3 class="overview-subtitle">{{ $t('sixteensHome.zlxl') }}</h3>
          <p class="overview-desc">{{ $t('sixteensHome.zlxltext') }}</p>
        </section>
      </div>
      <section class="overview-section">
        <h2 class="overview-title">{{ $t('sixteensHome.ztcj') }}</h2>
        <p class="overview-desc">{{ $t('sixteensHome.ztcjtext') }}</p>
        <p class="overview-desc">{{ $t('sixteensHome.ztcjtext2') }}</p>
      </section>
      <section class="overview-section overview-advantage">
        <h2 class="overview-title">{{ $t('sixteensHome.cpys') }}</h2>
        <p class="overview-desc overview-intro">{{ $t('sixteensHome.cpystext') }}</p>
        <ul class="overview-list">
          <li>{{ $t('sixteensHome.cpystext1') }}</li>
          <li>{{ $t('sixteensHome.cpystext2') }}</li>
          <li>{{ $t('sixteensHome.cpystext3') }}</li>
          <li>{{ $t('sixteensHome.cpystext4') }}</li>
          <li>{{ $t('sixteensHome.cpystext5') }}</li>
          <li>{{ $t('sixteensHome.cpystext6') }}</li>
        </ul>
      </section>
      <section class="overview-section overview-flow">
        <h2 class="overview-title">{{ $t('sixteensHome.fxlc') }}</h2>
        <div class="overview-image-wrap">
          <img src="@/assets/images/16s/fxlczh.png" alt="" v-if="i18n === 'zh'">
          <img src="@/assets/images/16s/fxlcen.png" alt="" v-else>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/store/modules/language'

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
</script>

<style lang="scss" scoped>
.overview {
  padding: 28px 32px 40px;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.overview-inner {
  width: 100%;
  max-width: min(1200px, 100%);
  margin: 0 auto;
}

.overview-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.overview-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 14px 0;
  padding-left: 10px;
  border-left: 4px solid var(--el-theme-color);
  line-height: 1.4;
}

.overview-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.overview-desc {
  font-size: 15px;
  color: #555;
  line-height: 1.75;
  margin: 0 0 12px 0;
  text-align: justify;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.overview-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 0;
}

.overview-advantage .overview-intro {
  margin-bottom: 16px;
}

.overview-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    font-size: 15px;
    color: #555;
    line-height: 1.75;
    padding-left: 20px;
    margin-bottom: 10px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--el-theme-color);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.overview-flow .overview-title {
  margin-bottom: 16px;
}

.overview-image-wrap {
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
