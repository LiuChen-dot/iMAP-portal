<template>
  <div v-if="!item.hidden">
    <template
      v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild, onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item class="el-menu-item" :index="resolvePath(onlyOneChild, onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }">
          <!-- <svg-icon :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" /> -->
          <template #title>
            <div style="padding-left: 10px;" class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">{{
              $t(`Sidebar.${onlyOneChild.meta.title}`) }}</div>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item, item.path)" popper-append-to-body>
      <template v-if="item.meta" #title>
        <div style="padding-left: 10px;font-size: 16px;padding-top:5px;" :title="hasTitle(item.meta.title)">{{
          $t(`Sidebar.${item.meta.title}`) }}
        </div>
      </template>

      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child"
        :base-path="resolvePath(child, child.path)" class="nest-menu" />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { isExternal } from '@/utils/validate'
import AppLink from './Link'
import { getNormalPath } from '@/utils/ruoyi'

const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})
const onlyOneChild = ref({});

function hasOneShowingChild(children = [], parent) {
  if(parent.isTop) {
    return false
  }
  if (!children) {
    children = [];
  }
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = item
      return true
    }
  })

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return true
  }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
};

function resolvePath(val, routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    let query = JSON.parse(routeQuery);
    return { path: getNormalPath(props.basePath + '/' + routePath), query: query }
  }
  return getNormalPath(props.basePath + '/' + routePath)
}

function hasTitle(title) {
  if (title.length > 5) {
    return title;
  } else {
    return "";
  }
}
</script>
<style lang="scss" scoped>
::v-deep(.el-menu-item.is-active) {
  color: var(--el-theme-color) !important;
  border-bottom: 2px solid var(--el-theme-color);
  cursor: pointer;
}

:deep(.el-menu-item:not(.is-disabled):hover) {
  background-color: white !important;
  border-bottom: 2px solid var(--el-theme-color);
}

.el-menu-item {
  padding: 0 30px;
  font-size: 16px;
}
</style>
