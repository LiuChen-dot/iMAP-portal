<template>
    <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
        <div style="height: 100%">
            <el-empty :description="i18n=='zh'?'开发中...':'in development...'" />
        </div>
        <Bottom style="position: relative;"></Bottom>
    </div>
</template>

<script setup>
import Bottom from "@/layout/components/Bottom/index.vue"
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
</script>

<style></style>