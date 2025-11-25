<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader, 'header-top': true }">
        <div class="headertitle fts-16">
          <el-image @click="router.push('/KnowledgeQuery')" :src="logo" />
        </div>
        <sidebar v-if="!sidebar.hide" />
        <div class="outlogintitle">
          <div style="padding-right: 20px;" v-if="nickName == '请先登录'">
            <el-button @click="router.push('/login')" size="small" type="primary">{{locale=='zh'?'登录':'Log in'}}</el-button>
            <!-- <el-button @click="router.push('/login?active=1')" size="small">{{locale=='zh'?'注册':'Sign up'}}</el-button> -->
          </div>
          <div v-else>
            <el-dropdown style="width:80px;cursor: pointer;padding-top: 2px;">
              <span>
                {{ nickName }}
                <el-icon class="el-icon--right" style="position: absolute;top: 2px;">
                  <arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="command(0)">
                    <div class="el-dropdownbut"><img src="@/assets/images/userinfo.svg">{{locale=='zh'?'个人信息':'My Profile'}}</div>
                  </el-dropdown-item>
                  <el-dropdown-item @click="command(1)">
                    <div class="el-dropdownbut"><img src="@/assets/images/loginout.svg">{{locale=='zh'?'退出登录':'Log out'}}</div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div style="cursor: pointer;" @click="switchvalue = !switchvalue; changei18n()">
            <img style="width: 22px;" v-show="!switchvalue" src="@/assets/images/layoutimg/zh.svg" />
            <img style="width: 22px;" v-show="switchvalue" src="@/assets/images/layoutimg/en.svg" />
          </div>
        </div>
        <!-- <navbar @setLayout="setLayout" /> -->
        <!-- <tags-view v-if="needTagsView" /> -->
      </div>
      <app-main />
      <!-- <settings ref="settingRef" /> -->
    </div>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar, Settings, TagsView } from './components'
import defaultSettings from '@/settings'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'
import router from '@/router'
import logo from '@/assets/logo/logo.png'
import {
  useI18n
} from 'vue-i18n'

import {
  getnickName,
} from '@/utils/auth'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useLanguageStore } from '@/store/modules/language';
const languageStore = useLanguageStore()

const { locale } = useI18n()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme);
const sideTheme = computed(() => settingsStore.sideTheme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView);
const fixedHeader = computed(() => settingsStore.fixedHeader);
const nickName = ref('')
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const { width, height } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

const switchvalue = ref(true)
const changei18n = () => {
  if (!localStorage.getItem('i18n') || localStorage.getItem('i18n') == 'en') {
    localStorage.setItem('i18n', 'zh')
  } else {
    localStorage.setItem('i18n', 'en')
  }
  locale.value = switchvalue.value ? 'en' : 'zh'
  languageStore.setLanguage(locale.value)

}
watch(() => useUserStore().nickName, (value) => {
  nickName.value = value
})
onMounted(() => {
  nickName.value = useUserStore().nickName || '请先登录'
  localStorage.getItem('i18n') == 'zh' ? switchvalue.value = false : switchvalue.value = true
  locale.value = switchvalue.value ? 'en' : 'zh'
  localStorage.setItem('i18n', locale.value)
  languageStore.setLanguage(locale.value)
})

watchEffect(() => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    useAppStore().closeSideBar({ withoutAnimation: false })
  }
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile')
    useAppStore().closeSideBar({ withoutAnimation: true })
  } else {
    useAppStore().toggleDevice('desktop')
  }
})

function handleClickOutside() {
  useAppStore().closeSideBar({ withoutAnimation: false })
}

const command = (e) => {
  e ? logout() : router.push('userInfo')
}

function logout() {
  ElMessageBox.confirm(locale.value=='zh'?'确定注销并退出系统吗？':'Are you sure you want to log out and exit the system?',
   locale.value=='zh'?'提示':'Hint', 
   {
    confirmButtonText: locale.value=='zh'?'确定':'OK',
    cancelButtonText: locale.value=='zh'?'取消':'Cancel',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/';
    })
  }).catch(() => { });
}

const settingRef = ref(null);
function setLayout() {
  settingRef.value.openSetting();
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/mixin.scss";
@import "@/assets/styles/variables.module.scss";

.headertitle {
  display: flex;
  align-items: center;
  margin-left: 50px;
  cursor: pointer;

  .el-image {
    height: 50px;
  }
}

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: var(--black);
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  padding: 0 80px;
  display: flex;
  box-shadow: 0px 0px 12px var(--boxshadow);
  // position: fixed;
  // top: 0;
  // right: 0;
  // z-index: 9;
  // width: calc(100% - #{$base-sidebar-width});
  // transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100%);
  padding: 0 50px;
  display: flex;
  box-shadow: 0px 0px 12px var(--boxshadow);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
  display: flex;
}

.outlogintitle {
  display: flex;
  align-items: center;
  margin-left: 30px;

  .el-switch {}

}

.el-dropdownbut {
  display: flex;
  align-items: center;

  img {
    width: 15px;
    margin-right: 5px;
  }
}
</style>