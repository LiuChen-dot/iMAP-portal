<template>
  <div style="flex:1;overflow: hidden;margin-left: 80px;">
    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <el-menu style="overflow: hidden;position: relative;" :default-active="activeMenu" mode="horizontal">
        <sidebar-item v-for="(route, index) in sidebarRouters" :key="route.path + index" :item="route"
          :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import SidebarItem from './SidebarItem'
import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import useUserStore from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import router from '@/router'

const userStore = useUserStore()
const route = useRoute();
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters);
const showLogo = computed(() => settingsStore.sidebarLogo);
const sideTheme = computed(() => settingsStore.sideTheme);
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
})


</script>
<style lang="scss" scoped>

::v-deep(.el-input__wrapper) {
  box-shadow: none;
}
:deep(.el-menu-item){
  height: 100%;
}
</style>
