<template>
  <div class="analysis-card" @click="handleClick">
    <div class="analysis-card__icon">
      <img v-if="icon" :src="icon" :alt="title" />
      <span v-else class="analysis-card__icon-placeholder">{{ title.charAt(0) }}</span>
    </div>
    <div class="analysis-card__body">
      <h3 class="analysis-card__title">{{ title }}</h3>
      <p v-if="description" class="analysis-card__desc">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  scriptsId: { type: [Number, String], default: null },
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', { scriptsId: props.scriptsId, title: props.title })
}
</script>

<style lang="scss" scoped>
.analysis-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: var(--el-color-primary-light-5, #b3d8ff);
  }

  &__icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f7fa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__icon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-color-primary, #409eff);
    background: var(--el-color-primary-light-9, #ecf5ff);
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0 0 6px 0;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
  }

  &__desc {
    margin: 0;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
