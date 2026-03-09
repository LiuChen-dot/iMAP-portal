<template>
  <div class="sixteen-s-page">
    <div class="box">
      <div class="navigatebox">
        <div
          :class="['nav-item', { active: isOverview }]"
          @click="$router.push('/16S/overview')"
        >
          {{ i18n === 'zh' ? '项目概况' : 'Project Overview' }}
        </div>
        <div
          :class="['nav-item', { active: isAnalysis }]"
          @click="$router.push('/16S/analysis')"
        >
          {{ i18n === 'zh' ? '分析流程' : 'Analysis Workflow' }}
        </div>
        <div class="nav-item nav-item--export" @click="exportReport">
          {{ i18n === 'zh' ? '导出测序报告' : 'Export Test Report' }}
        </div>
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const isOverview = computed(() => route.path === '/16S/overview' || route.path === '/16S')
const isAnalysis = computed(() => route.path === '/16S/analysis')
import { getToken } from '@/utils/auth'
import { useLanguageStore } from '@/store/modules/language'

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)

const exportReport = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_APP_BASE_API + '/atlas/taskAttachment/export', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + getToken(),
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    const blob = await response.blob()
    if (blob.size === 0) {
      ElMessage.error(i18n.value === 'zh' ? '文件无内容' : 'File content is empty')
      return
    }
    const fileName = '测序报告.pdf'
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    a.click()
    a.remove()
    URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
  }
}
</script>

<style lang="scss" scoped>
.sixteen-s-page {
  min-height: 100%;
  background-color: #f7f7f7;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.box {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 32px;
  background-color: #f7f7f7;
  display: flex;
  gap: 20px;
  min-height: 100%;

  .navigatebox {
    position: sticky;
    top: 24px;
    align-self: flex-start;
    flex-shrink: 0;
    text-align: center;
    font-size: 14px;
    background-color: #f7f7f7;
    z-index: 1;

    .nav-item {
      background-color: white;
      margin-bottom: 10px;
      border-radius: 4px;
      width: 200px;
      padding: 11px 0;
      color: var(--el-theme-color);
      cursor: pointer;

      &.active {
        background-color: var(--el-theme-color);
        color: white;
      }

      &--export {
        margin-top: 8px;
      }
    }
  }

  .content {
    flex: 1;
    min-width: 0;
    background-color: white;
    min-height: 100%;
  }
}
</style>
