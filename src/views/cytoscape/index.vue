<template>
    <div class="genome-browser-wrap">
        <!-- 顶部工具栏：全屏 / 新标签打开 -->
        <div class="genbro-toolbar">
            <span class="genbro-toolbar-label">{{ i18n === 'zh' ? '基因组浏览器' : 'Genome Browser' }}</span>
            <div class="genbro-toolbar-actions">
                <el-button size="small" @click="toggleFullscreen" type="primary" link>
                    <el-icon><FullScreen /></el-icon>
                    <span>{{ isFullscreen ? (i18n === 'zh' ? '退出全屏' : 'Exit Fullscreen') : (i18n === 'zh' ? '全屏' : 'Fullscreen') }}</span>
                </el-button>
                <el-button size="small" @click="openInNewTab" type="primary" link>
                    {{ i18n === 'zh' ? '在新标签页打开' : 'Open in New Tab' }}
                </el-button>
            </div>
        </div>
        <!-- 主内容区，用于全屏 -->
        <div ref="fullscreenRef" class="genbro-main" :class="{ 'genbro-main-fullscreen': isFullscreen }">
            <!-- 加载态：未就绪时显示 -->
            <div v-show="!genbroReady" class="genbro-loading">
                <el-icon class="genbro-loading-icon" :size="48"><Loading /></el-icon>
                <p class="genbro-loading-text">{{ i18n === 'zh' ? '正在加载基因组浏览器…' : 'Loading Genome Browser…' }}</p>
                <p class="genbro-loading-hint">{{ i18n === 'zh' ? '首次加载需拉取脚本与数据，请稍候' : 'First load may take a moment' }}</p>
            </div>
            <iframe
                id="iframeViewer"
                class="genbro-iframe"
                :class="{ 'genbro-iframe-ready': genbroReady }"
                :src="iframeUrl"
            />
        </div>
    </div>
</template>

<script setup>

import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { Loading, FullScreen } from '@element-plus/icons-vue';
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore();
const i18n = computed(() => languageStore.i18n);

const iframeUrl = ref('/genbro/genbro.html');
/** 是否已就绪（用于隐藏加载态、显示 iframe） */
const genbroReady = ref(false);
/** 全屏容器 */
const fullscreenRef = ref(null);
/** 是否处于全屏 */
const isFullscreen = ref(false);

/** 是否已执行过 genBro 初始化，避免重复调用 */
let genBroInitialized = false;

async function runGenBro() {
    if (genBroInitialized || typeof window.GB === 'undefined') return;
    genBroInitialized = true;

    const orgid = 'ECOLI';
    let gene = '';
    let TaxId = '';
    let repliconId = 'COLI-K12';
    if (location.pathname !== '/GenomeBrowser') {
        gene = sessionStorage.getItem('gene_searchId') || '';
        TaxId = sessionStorage.getItem('gene_SubstrainsTaxId') || '';
        repliconId = sessionStorage.getItem('gene_replicon') || 'COLI-K12';
    }
    // 本地开发用 /gb-api 走 Vite 代理，避免 CORS；生产直连后端
    const isDev = import.meta.env.DEV || /^localhost$/i.test(window.location.hostname);
    const gb = {
        divId: "gbBrowser",
        hasControls: true,
        hasBaseline: true,
        dataBaseUrl: isDev ? '' : 'https://www.imicap.com:8443',
        useGbApiPath: isDev,
        replicon: [
            { orgid, chromosome: repliconId, centerGene: gene, TaxId }
        ],
    };
    await window.GB.Load(gb);
    updateCmpTitle();
}

function updateCmpTitle() {
    if (!window.GB?.gb?.replicon?.[0]) return;
    const potGeneNameStr = window.GB.gb.replicon[0].gene0
        ? ' ' + window.GB.gb.replicon[0].gene0.name
        : '';
    window.top.document.title = 'Genome Browser: ' + window.GB.gb.replicon[0].orgname + potGeneNameStr;
}

function onMessage(event) {
    if (event.data !== 'Genbro Ready') return;
    // 先显示 iframe，genbro 内部会自己显示加载态，避免长时间只看到转圈
    genbroReady.value = true;
    runGenBro();
}

/** 全屏切换 */
function toggleFullscreen() {
    if (!fullscreenRef.value) return;
    if (!document.fullscreenElement) {
        fullscreenRef.value.requestFullscreen?.();
        isFullscreen.value = true;
    } else {
        document.exitFullscreen?.();
        isFullscreen.value = false;
    }
}

/** 监听全屏变化（如用户按 Esc） */
function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
}

/** 在新标签页打开当前基因组浏览器 */
function openInNewTab() {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
}

onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
    // 必须先注册监听，再等 iframe 加载；否则 iframe 里发的 "Genbro Ready" 可能早于监听注册，导致永远不初始化
    window.addEventListener('message', onMessage, false);

    const iframe = document.getElementById('iframeViewer');
    if (!iframe) return;
    iframe.onload = function () {
        // 兜底：若消息已先发出（先于我们监听），这里检查 GB 是否已挂到 parent，是则补跑一次
        if (!genBroInitialized && window.GB) {
            runGenBro();
        }
    };
});

onBeforeUnmount(() => {
    window.removeEventListener('message', onMessage, false);
    document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<style scoped>
/* 使用视口高度，避免依赖父级导致中间区域高度为 0，图表无法滚动/缩放 */
.genome-browser-wrap {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 56px);
    min-height: 360px;
    overflow: hidden;
}
.genbro-toolbar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
}
.genbro-toolbar-label {
    font-weight: 600;
    color: var(--el-text-color-primary);
}
.genbro-toolbar-actions {
    display: flex;
    gap: 8px;
}
.genbro-main {
    flex: 1;
    min-height: 0;
    position: relative;
    height: 0;
    background: var(--el-bg-color);
}
/* 全屏时避免黑底，保证背景为浅色 */
.genbro-main-fullscreen,
.genbro-main:fullscreen {
    background: #fff;
}
.genbro-main:-webkit-full-screen {
    background: #fff;
}
.genbro-main:-moz-full-screen {
    background: #fff;
}
.genbro-main:-ms-fullscreen {
    background: #fff;
}
.genbro-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--el-bg-color-page);
    z-index: 10;
}
.genbro-loading-icon {
    color: var(--el-theme-color);
    margin-bottom: 12px;
    animation: genbro-spin 0.8s linear infinite;
}
@keyframes genbro-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.genbro-loading-text {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-regular);
}
.genbro-loading-hint {
    margin: 6px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}
.genbro-iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
    opacity: 0;
    transition: opacity 0.25s ease;
}
.genbro-iframe-ready {
    opacity: 1;
}
</style>