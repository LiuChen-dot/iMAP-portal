<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <!-- <transition name="fade-transform" mode="out-in"> -->
        <keep-alive :include="tagsViewStore.cachedViews">
          <component
            v-if="!route.meta.link"
            :is="Component"
            :key="route.path"
          />
        </keep-alive>
      <!-- </transition> -->
     
    </router-view>
    <!-- <iframe-toggle /> -->
    <Bottom v-if="!isHomePage && !isIntelligentQA && !isPageWithOwnBottom"></Bottom>
  </section>
</template>

<script setup>
import iframeToggle from "./IframeToggle/index";
import useTagsViewStore from "@/store/modules/tagsView";
import Bottom from "./Bottom/index.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const tagsViewStore = useTagsViewStore();
const route = useRoute();
const isHomePage = computed(() => route.path === "/" || route.path === "/KnowledgeQuery");
const isIntelligentQA = computed(() => route.path === "/IntelligentQ&A");
// 以下页面在自身模板内已渲染 Bottom（或使用与布局不同的底部样式），布局不再重复渲染
const isPageWithOwnBottom = computed(() =>
  ["/Search", "/protein", "/basic_information", "/go_terms", "/small_molecule", "/rna", "/Gene", "/disease", "/KnowledgeGraph", "/GenomeBrowser", "/Stastics", "/taskupload", "/taskdetails"].includes(route.path)
);
</script>

<style lang="scss" scoped>
.app-main {
  flex: 1;
  width: 100%;
  min-height: 0;
  position: relative;
  overflow-y: auto;
}

.fixed-header + .app-main {
  // padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    // padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 17px;
  }
}
</style>
