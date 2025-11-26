<template>
    <div style="flex:1;overflow: hidden;" class="h-60 dis-flex mar-l-48" ref="menuBox">
      <div class="h-100p">
        <div class="dis-flex fts-16 h-100p" ref="menuListBox">
            <template v-for="(route, index) in sidebarRoutersList" :key="index">
                <div class="dis-flex h-100p pad-l-10 pad-r-10" :class="activeMenu==route.children[0].path?'active':''" >
                    <el-popover placement="bottom" width="auto" trigger="hover"
                        :disabled="!route.meta" 
                        :show-arrow="false" :offset="0" 
                        popper-class="custom-popover">
                        <template #reference>
                          <app-link :to="resolvePath(route.children[0],route.children[0].path, route.children[0].query)" v-if="!route.meta">
                              <p class="dis-flex align-c h-100p color1" :style="{width:$t(`Sidebar.${route.children[0].meta.title}`).length*(i18n=='zh'?23:12)+'px'}">
                                  <span class="mar-r-7">{{$t(`Sidebar.${route.children[0].meta.title}`)}}</span>
                              </p>
                          </app-link>
                          <p class="dis-flex align-c h-100p color1" :style="{width:$t(`Sidebar.${route.meta.title}`).length*(i18n=='zh'?23:12)+'px'}" v-else>
                              <span class="mar-r-7" >{{$t(`Sidebar.${route.meta.title}`)}}</span>
                              <el-icon class="fts-12"><ArrowDown /></el-icon>
                          </p>
                        </template>
                        <div class="menuBox" v-if="route.meta">
                            <div class="menuList1">
                                <div class="menuItem" v-for="(route1, index1) in route.children" :key="route1.path + index1">
                                    <app-link :to="resolvePath(route1,route1.path, route1.query)" >
                                        <div class="text-center menuTitle"  :class="activeMenu==route1.path?'active':''">{{$t(`Sidebar.${route1.meta.title}`)}}</div>
                                    </app-link>
                                </div>
                            </div>
                        </div>
                    </el-popover>
                </div>
            </template>
            <div class="dis-flex h-100p pad-l-10 pad-r-10" v-if="sidebarRoutersMoreList.length" >
              <el-popover placement="bottom" width="auto" trigger="click"
                  :show-arrow="false" :offset="0" 
                  popper-class="custom-popover">
                  <template #reference>
                    <p class="dis-flex align-c h-100p color1">
                        <el-icon class="fts-25"><More /></el-icon>
                    </p>
                  </template>
                  <div class="menuBox" >
                      <div class="menuList1">
                          <div class="menuItem" v-for="(route, index) in sidebarRoutersMoreList" :key="index" >
                              <div class="dis-flex h-100p"  :class="activeMenu==route.children[0].path?'active':''" >
                                  <el-popover placement="left" width="auto" trigger="hover"
                                      :disabled="!route.meta" 
                                      :show-arrow="false" :offset="20" 
                                      popper-class="custom-popover">
                                      <template #reference>
                                        <app-link :to="resolvePath(route.children[0],route.children[0].path, route.children[0].query)" v-if="!route.meta">
                                            <p class="dis-flex align-c h-100p color1" :style="{width:$t(`Sidebar.${route.children[0].meta.title}`).length*(i18n=='zh'?20:9)+'px'}">
                                                <span class="mar-r-7">{{$t(`Sidebar.${route.children[0].meta.title}`)}}</span>
                                            </p>
                                        </app-link>
                                        <p class="dis-flex align-c h-100p color1" :style="{width:$t(`Sidebar.${route.meta.title}`).length*(i18n=='zh'?20:9)+'px'}" v-else>
                                            <span class="mar-r-7" >{{$t(`Sidebar.${route.meta.title}`)}}</span>
                                            <el-icon class="fts-12"><ArrowRight /></el-icon>
                                        </p>
                                      </template>
                                      <div class="menuBox" v-if="route.meta">
                                          <div class="menuList1">
                                              <div class="menuItem" v-for="(route1, index1) in route.children" :key="route1.path + index1"  >
                                                  <app-link :to="resolvePath(route1,route1.path, route1.query)" >
                                                      <div class="text-center menuTitle" :class="activeMenu==route1.path?'active':''">{{$t(`Sidebar.${route1.meta.title}`)}}</div>
                                                  </app-link>
                                              </div>
                                          </div>
                                      </div>
                                  </el-popover>
                              </div>
                          </div>
                      </div>
                  </div>
              </el-popover>
            </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import usePermissionStore from '@/store/modules/permission'
import { computed, nextTick, onMounted} from 'vue'
import { isExternal } from '@/utils/validate'
import AppLink from '../Sidebar/Link'
import { getNormalPath } from '@/utils/ruoyi'
import { useLanguageStore } from '@/store/modules/language';


const languageStore = useLanguageStore()
const route = useRoute();

const activeMenu = ref(route.path);

const i18n = computed(() => languageStore.i18n)
watch(i18n, () => {
  console.log('中英文', i18n.value);
  settingWidth()
})

const permissionStore = usePermissionStore()

const sidebarRoutersList=ref([])
const sidebarRoutersMoreList=ref([])
const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(item=>!item.hidden));

function resolvePath(val,routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (routeQuery) {
    return { path: getNormalPath(routePath), query: routeQuery }
  }
  return getNormalPath(routePath)
}

watch(route, r => {
  const { meta, path } = route;
  if (meta.activeMenu) {
    activeMenu.value = meta.activeMenu;
  }
  activeMenu.value = path;
}, { immediate: true })

const menuBox = ref(null);
const menuListBox = ref(null);

onMounted(()=>{
  nextTick().then(()=>{
    settingWidth();
  })
  window.addEventListener('resize',settingWidth);
})

const settingWidth=()=>{
  const boxw=menuBox.value.offsetWidth;
  const x=Math.floor(boxw/(i18n.value=='zh'?120:180))
  sidebarRoutersList.value = sidebarRouters.value.slice(0,x<1?x:x-1);
  sidebarRoutersMoreList.value = sidebarRouters.value.slice(x<1?x:x-1);
}

  
</script>
<style lang="scss" scoped>
.custom-popover{
    transform: translate(0,60px) !important;
}
.menuList{
    display: flex;
    width: 90%;
    flex-wrap: wrap;
    margin:0 auto;
    padding: 20px 0;
    .menuItem{
        width: 18%;
        margin: 0 15px;
        padding: 10px 0;
        .menuTitle{
            font-size: 20px;
            padding-bottom:12px;
            font-weight: 600;
            color: #333;
        }
        .menuTitle_bor{
            border-bottom: 1px solid #eee;
        }
        .menuItem_list{
            padding: 15px 0;
        }
        .menutit{
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: 400;
            color: #666;
        }
        .menutit:hover{
            color: var(--el-theme-color);
        }
    }
}
.menuList1{
    .menuTitle{
        font-size: 16px;
        color: #333;
    }
    .menuTitle:hover{
        color: var(--el-theme-color);
    }
    .menuItem{
        line-height: 38px;
    }
}
.active{
  color: var(--el-theme-color) !important;
}
.color1:hover{
  color: var(--el-theme-color);
}
</style>
  