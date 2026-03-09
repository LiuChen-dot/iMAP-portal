<template>
  <div style="height: 100%;overflow: scroll;overflow-x: hidden;" ref="appcontainer" @scroll="handleScroll">
    <div style="min-height: 100%;" class="pad-r-30 pad-l-30">
      <!-- 搜索框 -->
      <div class="mar-t-30" style="position: relative;z-index: 998;">
        <Search class="Search" />
      </div>
      <el-divider border-style="dashed" class="mar-t-20" style="position: relative;z-index: 998;" />
      <div
        :style="`background-image: url('${bac}');background-size: cover;width: 99%;height: 500px;position: fixed;top:56px;z-index: -1;left: 0;`">
      </div>
      <!-- 内容 -->
      <div style="margin-top: 20px;">
        <el-row :gutter="20">
          <el-col :span="sidebarCollapsed ? 1 : 5">
            <div class="sidebar-wrapper" :class="{ 'is-fixed': isSidebarFixed }" ref="listtype">
              <el-button
                v-if="sidebarCollapsed && !listLoading"
                class="sidebar-toggle-btn collapsed"
                type="primary"
                circle
                @click="sidebarCollapsed = false; resetSidebarWidth()"
                title="展开导航栏"
              >
                <el-icon><Expand /></el-icon>
              </el-button>
              <template v-else>
                <el-button
                  v-if="!listLoading"
                  class="sidebar-toggle-btn expanded"
                  type="default"
                  circle
                  size="small"
                  @click="sidebarCollapsed = true"
                  title="收起导航栏"
                >
                  <el-icon><Fold /></el-icon>
                </el-button>
                <h3 class="list-title">CONTENTS</h3>
                <div
                  ref="listScrollWrapRef"
                  class="list-scroll-wrap"
                  @scroll="onNavListScroll"
                >
                  <ul class="list">
                    <li v-show="item.dataType == '0' || (item.dataType == '2'|| item.dataType == '6'|| item.dataType == '5')"
                      :class="[isFirstLevelActive(index) ? 'li_after' : '', !item.show && item.childList ? '' : 'no_click', 'w-100p', 'list-item-level1']"
                      v-for="(item, index) in proteinleftTitle" :key="index" @click='listClick(index, item)'>
                      <span class="listLeft">
                        <span class="list-number">{{ index + 1 }}</span> {{ capitalizeFirstLetter(item.showNameNew) }}
                      </span>
                      <!-- 仅在有二级标题时显示箭头：收起为下箭头，展开为上箭头 -->
                      <el-icon
                        v-if="getSecondLevelNavItems(item).length"
                        :class="['list-chevron', 'list-chevron-sub']"
                        @click.stop="toggleSecondLevel(index)"
                        :title="secondLevelExpanded[index] ? '收起二级目录' : '展开二级目录'"
                      >
                        <ArrowUp v-if="secondLevelExpanded[index]" />
                        <ArrowDown v-else />
                      </el-icon>
                      <div
                        :style="`${index == 0 || index == proteinleftTitle.length - 1 ? 'border-radius: 2px' : ''};${index == proteinleftTitle.length - 1 ? 'height:75%' : ''}`"
                        class="leftline"></div>
                      <div class="showleftline" v-show="isFirstLevelActive(index) && lis_sub_ind == null"></div>
                      <!-- 二级标题：默认折叠，点击展开后显示 -->
                      <ul v-if="getSecondLevelNavItems(item).length && secondLevelExpanded[index]" class="list list-level2" @click.stop>
                        <li
                          v-for="(sub, subIndex) in getSecondLevelNavItems(item)"
                          :key="subIndex"
                          :class="['list-item-level2', isSecondLevelActive(index, subIndex) ? 'li_after' : '']"
                          @click="listClick(index, item, subIndex)">
                          <span class="listLeft">
                            {{ capitalizeFirstLetter(sub.showNameNew) }}
                          </span>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div v-show="showMoreMarker" class="nav-more-marker">
                  <span class="nav-more-marker-text">↓ More</span>
                </div>
              </template>
            </div>
          </el-col>
          <el-col :span="sidebarCollapsed ? 23 : 19">
            <div style="display: flex;align-items: center;justify-content: space-between;">
              <h1 class="text-w-600 fts-20 pad-b-10"
                style="font-family: 'Source Sans Pro', sans-serif;color:var(--el-theme-color);" v-html="protein_name">
              </h1>
            </div>
            <div ref="xqcontent" class="content" v-loading='listLoading'>
              <DetailContent :items="proteinData" ref="listbox"></DetailContent>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-row v-show="floorLoading" class="floorLoadingbox">
      <el-col :span="sidebarCollapsed ? 1 : 5"> </el-col>
      <el-col :span="sidebarCollapsed ? 23 : 19">
        <div class="floorLoading">
          加载中...
        </div>
      </el-col>
    </el-row>
    <Bottom v-if="!listLoading" style="position: relative;"></Bottom>
  </div>
</template>

<script setup>
import Search from "./SearchBar.vue";
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import DetailContent from './DetailContent.vue'
import { getproteinData, getBasicInformationData,getGoData,getsmallMoleculeData,getrnaData } from '@/api/data.js'
import { useRoute, useRouter } from 'vue-router'
import { dataType } from "element-plus/es/components/table-v2/src/common";
import { connect } from "echarts";
import bac from '@/assets/images/search/bac.png'
import Bottom from "@/layout/components/Bottom/index.vue"
import { Fold, Expand, ArrowDown, ArrowUp } from '@element-plus/icons-vue'


const router = useRouter();
const route = useRoute();
const listtype = ref(null)
const appcontainer = ref(null)
const listbox = ref(null)
const listLoading = ref(false)
const xqcontent = ref(null)

const proteinData = ref([])
const firstload = ref([])
const secondload = ref([])
const thirdload = ref([])
const fourthload = ref([])
const totalNum = ref(0)
const proteinleftTitle = ref([])
const lis_ind = ref(0)
const lis_sub_ind = ref(null) // 当前高亮的二级标题在 getSecondLevelNavItems 中的下标，null 表示只高亮一级
const protein_name = ref('')
const floorLoading = ref(false)
const sidebarCollapsed = ref(false)
const isSidebarFixed = ref(false)
const listScrollWrapRef = ref(null)
const showMoreMarker = ref(false)
// 哪些一级项展开了二级目录（key 为一级 index）
const secondLevelExpanded = ref({})

// 导航列表「还有更多」标记：仅在有滚动条且未滚到底时显示
function checkScrollable() {
  nextTick(() => {
    const el = listScrollWrapRef.value
    if (!el) return
    const { scrollHeight, clientHeight, scrollTop } = el
    const hasOverflow = scrollHeight > clientHeight
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 8
    showMoreMarker.value = hasOverflow && !isNearBottom
  })
}

function onNavListScroll() {
  checkScrollable()
}

// 展开侧边栏时重置宽度，避免文本被截断
const resetSidebarWidth = () => {
  nextTick(() => {
    if (listtype.value && appcontainer.value) {
      const scrollTop = appcontainer.value.scrollTop
      if (scrollTop > 150) {
        isSidebarFixed.value = true
        listtype.value.style.width = '19%'
        listtype.value.style.position = 'fixed'
        listtype.value.style.top = '80px'
      } else {
        isSidebarFixed.value = false
        listtype.value.style.width = '100%'
        listtype.value.style.position = 'static'
      }
    }
  })
}
const getproteinDataFun = () => {
  listLoading.value = true
  if (sessionStorage.getItem('zwType') == 'protein') {
    getproteinData(sessionStorage.getItem('protein_id')).then(res => {
      datafz(res.data)
      filterdata(res.data, 0)
      res.data.forEach(item => {
        if (item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5') {
          if (item.childList && item.childList.length) {
            item.show = filterdataShow(item.childList) ? true : false
          }
        }
      })
      console.log(res.data)
      protein_name.value = getName(res.data, 'entry_name')
      const datalist = [...res.data]
      totalNum.value = res.data.length
      const shownum = res.data.filter(item => !item.show)
      let firstNum = 0
      if ((shownum.length - 1) <= 4) {
        firstNum = shownum.length - 1
        firstload.value = shownum
        proteinleftTitle.value = shownum
      } else {
        firstNum = parseInt((res.data.length - 1) / 4)
        firstload.value = datalist.splice(0, firstNum)
        secondload.value = datalist.splice(0, firstNum)
        thirdload.value = datalist.splice(0, firstNum)
        fourthload.value = datalist
        proteinleftTitle.value = res.data
      }
      proteinData.value = [...firstload.value]
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } else if (sessionStorage.getItem('zwType') == 'go_terms') {
    getGoData(sessionStorage.getItem('go_terms_id')).then(res => {
      datafz(res.data)
      filterdata(res.data, 0)
      res.data.forEach(item => {
        if (item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5' && item.dataType != '7' && item.dataType != '9'&& item.dataType != '10') {
          if (item.childList && item.childList.length) {
            item.show = filterdataShow(item.childList) ? true : false
          }
        }
      })
      console.log(res.data)
      protein_name.value = getName(res.data, 'GO Term Name')
      const datalist = [...res.data]
      totalNum.value = res.data.length
      const shownum = res.data.filter(item => !item.show)
      let firstNum = 0
      if ((shownum.length - 1) <= 4) {
        firstNum = shownum.length - 1
        firstload.value = shownum
        proteinleftTitle.value = shownum
      } else {
        firstNum = parseInt((res.data.length - 1) / 4)
        firstload.value = datalist.splice(0, firstNum)
        secondload.value = datalist.splice(0, firstNum)
        thirdload.value = datalist.splice(0, firstNum)
        fourthload.value = datalist
        proteinleftTitle.value = res.data
      }
      proteinData.value = [...firstload.value]
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } else if (sessionStorage.getItem('zwType') == 'small_molecule') {
    getsmallMoleculeData(sessionStorage.getItem('small_molecule_id')).then(res => {
      datafz(res.data)
      filterdata(res.data, 0)
      res.data.forEach(item => {
        if (item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5' && item.dataType != '7' && item.dataType != '9') {
          if (item.childList && item.childList.length) {
            item.show = filterdataShow(item.childList) ? true : false
          }
        }
      })
      console.log(res.data)
      protein_name.value = getName(res.data, 'chebi_name')
      const datalist = [...res.data]
      totalNum.value = res.data.length
      const shownum = res.data.filter(item => !item.show)
      let firstNum = 0
      if ((shownum.length - 1) <= 4) {
        firstNum = shownum.length - 1
        firstload.value = shownum
        proteinleftTitle.value = shownum
      } else {
        firstNum = parseInt((res.data.length - 1) / 4)
        firstload.value = datalist.splice(0, firstNum)
        secondload.value = datalist.splice(0, firstNum)
        thirdload.value = datalist.splice(0, firstNum)
        fourthload.value = datalist
        proteinleftTitle.value = res.data
      }
      proteinData.value = [...firstload.value]
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } else if (sessionStorage.getItem('zwType') == 'rna') {
    getrnaData(sessionStorage.getItem('rna_id')).then(res => {
      datafz(res.data)
      filterdata(res.data, 0)
      res.data.forEach(item => {
        if (item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5' && item.dataType != '7' && item.dataType != '9' ) {
          if (item.childList && item.childList.length) {
            item.show = filterdataShow(item.childList) ? true : false
          }
        }
      })
      console.log(res.data)
      protein_name.value = getName(res.data, 'RNA_name')
      const datalist = [...res.data]
      totalNum.value = res.data.length
      const shownum = res.data.filter(item => !item.show)
      let firstNum = 0
      if ((shownum.length - 1) <= 4) {
        firstNum = shownum.length - 1
        firstload.value = shownum
        proteinleftTitle.value = shownum
      } else {
        firstNum = parseInt((res.data.length - 1) / 4)
        firstload.value = datalist.splice(0, firstNum)
        secondload.value = datalist.splice(0, firstNum)
        thirdload.value = datalist.splice(0, firstNum)
        fourthload.value = datalist
        proteinleftTitle.value = res.data
      }
      proteinData.value = [...firstload.value]
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } else {
    getBasicInformationData(sessionStorage.getItem('basic_information_id')).then(res => {

      // ======== 🔥 Disease/Small Molecule 按 confidence_score 排序 ========
      res.data.forEach(block => {
        block.childList?.forEach(child => {
          child.tableList?.forEach(table => {
            if (Array.isArray(table.data)) {
              table.data.sort(
                (a, b) =>
                  Number(b.confidence_score) - Number(a.confidence_score)
              )
            }
          })
        })
      })

      datafz(res.data)
      filterdata(res.data, 0)
      res.data.forEach((item, index) => {
        if (item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5') {
          if (item.childList && item.childList.length) {
            item.show = filterdataShow(item.childList) ? true : false
          }
        }
      })
      console.log(res.data)
      protein_name.value = getName(res.data, 'current_scientific_name')
      const datalist = [...res.data]
      totalNum.value = res.data.length
      const shownum = res.data.filter(item => !item.show)
      let firstNum = 0
      if ((shownum.length - 1) <= 4) {
        firstNum = shownum.length - 1
        firstload.value = shownum
        proteinleftTitle.value = shownum
      } else {
        firstNum = parseInt((res.data.length - 1) / 4)
        firstload.value = datalist.splice(0, firstNum)
        secondload.value = datalist.splice(0, firstNum)
        thirdload.value = datalist.splice(0, firstNum)
        fourthload.value = datalist
        proteinleftTitle.value = res.data
      }
      proteinData.value = [...firstload.value]
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  }

}

getproteinDataFun()

// 导航列表内容或加载状态变化时，重新检测是否显示「还有更多」标记
watch([proteinleftTitle, listLoading], () => nextTick(checkScrollable), { deep: true })

// 侧栏固定状态变化时，列表区域尺寸可能变化，需重新检测
watch(isSidebarFixed, () => nextTick(checkScrollable))

onMounted(() => {
  nextTick(checkScrollable)
})

const getName = (data, a) => {
  for (var i = 0; i < data.length; i++) {
    if (data[i].showName == a) {
      return data[i].fieldValue
    }
    if (data[i].childList && data[i].childList.length) {
      return getName(data[i].childList, a)
    }
  }
}
const datafz = (data) => {
  for (var i = 0; i < data.length; i++) {
    if (data[i].dataType == '2' || data[i].dataType == '6' ) {
      if (data[i].tableList && data[i].tableList.length) {
        var show = false
        data[i].tableList.forEach(s => {
          s.page = 1
          s.pageSize = 5
          s.contentWidth = xqcontent.value.offsetWidth
          s.tableWidth = 0
          // console.log('s.data',s.data)
          s.data.forEach(z => {
            data[i].childList.forEach(v => {
              // s.show = true
              if (z[v.showName]) {
                show = true
              }
            })
          })
        })
        data[i].page = 1
        data[i].pageSize = 3
        if (show) {
          data[i].show = false
        } else {
          data[i].show = true
        }
      } else {
        data[i].show = true
      }

    }else if (data[i].dataType == '7' ) {
      if (data[i].tableList && data[i].tableList.length) {
        var show = false
        data[i].tableList.forEach(s => {
          data[i].childList.forEach(v => {
            if (s[v.showName]) {
              show = true
            }
          })
        })
        data[i].page = 1
        data[i].pageSize = 5
        data[i].contentWidth = xqcontent.value.offsetWidth
        data[i].tableWidth = 0
        if (show) {
          data[i].show = false
        } else {
          data[i].show = true
        }
      } else {
        data[i].show = true
      }

    } else if (data[i].dataType == '9') {
      if (data[i].tableList && data[i].tableList.length && data[i].tableList[0].nodes) {
        data[i].show = false
      } else {
        data[i].show = true
      }
    }else if(data[i].dataType=='10'){
      var flag=true
      if(data[i].childList && data[i].childList.length){
        flag=data[i].childList.findIndex(s=>!s.fieldValue)>-1?true:false
      }else{
        flag=true
      }
      data[i].show = flag
    }else if(data[i].dataType=='11'){
      var flag=true
      if(data[i].childList && data[i].childList.length){
        flag=data[i].childList[0].fieldValue?false:true
      }else{
        flag=true
      }
      data[i].show = flag
    }else if (data[i].dataType == '4') {
      data[i].launch = true
      if (data[i].tableList && data[i].tableList.length) {
        data[i].show = false
      } else {
        data[i].show = true
      }
    } else if (data[i].dataType == '5') {
      if (data[i].filedList && data[i].filedList.length) {
        data[i].show = false
      } else {
        data[i].show = true
      }
    } else {
      if (data[i].fieldValue) {
        data[i].show = false
      } else {
        data[i].show = true
      }
    }
    data[i].showNameNew = data[i].showName.split('_').join(' ')

    if (data[i].dataType != '4'&&data[i].dataType != '9'&&data[i].dataType != '10'&&data[i].dataType != '11' && data[i].childList && data[i].childList.length) {
      data[i].childList.forEach(s => {
        data[i].tableWidth = data[i].tableWidth + s.showName.length * 7 + 24
      })
      datafz(data[i].childList)
    }
  }
}
const filterdata = (data, a) => {
  a++
  data.forEach(item => {
    item.ind = a
    if (item.dataType == '2'||item.dataType == '6') {
    } else if (item.dataType == '7') {
    } else if (item.dataType == '4') {
    } else if (item.dataType == '9') {
    } else if (item.dataType == '10') {
    } else if (item.dataType == '11') {
    } else if (item.dataType == '5') {
    } else {
      if (item.showName == 'biophysicochemical_properties') {
        console.log('item.', item)
      }
      if (item.childList && item.childList.length) {
        if (item.childList.findIndex(val => (val.dataType == '2'||val.dataType == '6') && val.childList) > -1) {
          var ins = item.childList.findIndex(val => !val.show)
          if (ins > -1) {
            item.show = false
          } else {
            item.show = true
          }
        } else if (item.childList.findIndex(val => val.dataType == '4') > -1) {
          if (item.childList.findIndex(val => !val.show) > -1) {
            item.show = false
          } else {
            item.show = true
          }
        } else {
          if (item.childList.findIndex(val => val.dataType != '1') > -1) {
            item.show = filterdataShow(item.childList)
          } else {
            item.show = item.childList.findIndex(val => val.fieldValue) > -1 ? false : true;
          }
        }
        if (item.dataType != '4'&&item.dataType != '9'&&item.dataType != '10'&&item.dataType != '11') {
          filterdata(item.childList, a)
        }
      } else {
        item.last = true
      }
    }
  })
}
const capitalizeFirstLetter = (string) => {
  return string.replace(/\b[a-z]/g, function (match) {
    return match.toUpperCase();
  });
}

// 取一级项下在导航中展示的二级标题（ind===2，且 dataType 与一级导航展示规则一致）
function getSecondLevelNavItems(item) {
  if (!item || !item.childList || !item.childList.length) return []
  return item.childList.filter(
    (child) =>
      child.ind === 2 &&
      (child.dataType === '0' || child.dataType === '2' || child.dataType === '6' || child.dataType === '5')
  )
}

// 切换一级项下二级目录的展开/收起
function toggleSecondLevel(index) {
  secondLevelExpanded.value = {
    ...secondLevelExpanded.value,
    [index]: !secondLevelExpanded.value[index]
  }
}

// 一级是否高亮（当前所在块属于该一级）
function isFirstLevelActive(index) {
  return lis_ind.value === index
}

// 二级是否高亮
function isSecondLevelActive(parentIndex, subIndex) {
  return lis_ind.value === parentIndex && lis_sub_ind.value === subIndex
}

// 根据 data-nav-key 解析为导航高亮状态：key 可能为 "0" 或 "0-1"
function keyToNavHighlight(key) {
  if (!key) return { firstIndex: 0, subIndex: null }
  const parts = key.split('-').map(Number)
  const firstIndex = parts[0]
  if (parts.length === 1) return { firstIndex, subIndex: null }
  const childListIndex = parts[1]
  const parent = proteinleftTitle.value[firstIndex]
  if (!parent || !parent.childList || childListIndex >= parent.childList.length)
    return { firstIndex, subIndex: null }
  const navItems = getSecondLevelNavItems(parent)
  const child = parent.childList[childListIndex]
  const subIndex = navItems.indexOf(child)
  return { firstIndex, subIndex: subIndex >= 0 ? subIndex : null }
}
const filterdataShow = (data) => {
  var res = true
  for (var i = 0; i < data.length; i++) {
    if (!data[i].show) {
      res = false
      break;
    }
    if (data[i].dataType != '4' && data[i].childList && data[i].childList.length) {
      res = filterdataShow(data[i].childList)
    }
  }
  return res
}
const isScrollingFromClick = ref(false)

let secondloadisload = false
let thirdloadisload = false
let fourthloadisload = false
const listClick = (ind, e, subInd) => {
  if (e.show) {
    return;
  }
  floorLoading.value = true;
  setTimeout(() => {
    if (!e.show && e.childList) {
      const secondloadQuery = secondload.value.findIndex(item => item.showName == e.showName)
      const thirdloadQuery = thirdload.value.findIndex(item => item.showName == e.showName)
      const fourthloadQuery = fourthload.value.findIndex(item => item.showName == e.showName)
      if (fourthloadQuery != -1 && !fourthloadisload) {

        secondloadisload ? '' : proteinData.value.push(...secondload.value)
        thirdloadisload ? '' : proteinData.value.push(...thirdload.value)
        fourthloadisload ? '' : proteinData.value.push(...fourthload.value)
        secondloadisload = true
        thirdloadisload = true
        fourthloadisload = true
        let timer = setInterval(() => {
          if (listbox.value.$el.children.length == totalNum.value) {
            appcontainer.value.scrollTop = listbox.value.$el.children[ind].offsetTop
            floorLoading.value = false
            clearInterval(timer)
          }
        }, 200)
      } else if (thirdloadQuery != -1 && !thirdloadisload) {
        secondloadisload ? '' : proteinData.value.push(...secondload.value)
        thirdloadisload ? '' : proteinData.value.push(...thirdload.value)
        secondloadisload = true
        thirdloadisload = true

        let timer = setInterval(() => {
          if (listbox.value.$el.children.length == firstload.value.length + secondload.value.length + thirdload.value.length) {
            appcontainer.value.scrollTop = listbox.value.$el.children[ind].offsetTop
            floorLoading.value = false
            clearInterval(timer)
          }
        }, 200)
      } else if (secondloadQuery != -1 && !secondloadisload) {
        secondloadisload ? '' : proteinData.value.push(...secondload.value)
        secondloadisload = true

        let timer = setInterval(() => {
          if (listbox.value.$el.children.length == firstload.value.length + secondload.value.length) {
            appcontainer.value.scrollTop = listbox.value.$el.children[ind].offsetTop
            floorLoading.value = false
            clearInterval(timer)
          }
        }, 200)
      } else {
        floorLoading.value = false
      }

      isScrollingFromClick.value = true;
      lis_ind.value = ind
      lis_sub_ind.value = subInd ?? null
      if (subInd != null) {
        secondLevelExpanded.value = { ...secondLevelExpanded.value, [ind]: true }
      }
      // 点击二级标题时滚动到该二级块，否则滚动到一级块（统一用视口坐标计算，避免 offsetTop 导致主内容乱滚）
      const scrollTargetEl = getScrollTargetElement(ind, e, subInd)
      if (scrollTargetEl) {
        scrollToElement(appcontainer.value, scrollTargetEl, 100)
      } else {
        const firstEl = listbox.value?.$el?.children?.[ind]
        if (firstEl) scrollToElement(appcontainer.value, firstEl, 100)
      }
      scrollNavToIndex(ind, lis_sub_ind.value)
    }
  }, 0);
}

// 根据一级索引、一级项、二级在导航中的下标，得到要滚动到的 DOM 元素（二级块或一级块）
function getScrollTargetElement(firstIndex, firstItem, subIndex) {
  if (subIndex == null || !firstItem?.childList) {
    return listbox.value?.$el?.children?.[firstIndex] ?? null
  }
  const navItems = getSecondLevelNavItems(firstItem)
  const subItem = navItems[subIndex]
  if (!subItem) return listbox.value?.$el?.children?.[firstIndex] ?? null
  const childListIndex = firstItem.childList.indexOf(subItem)
  if (childListIndex < 0) return listbox.value?.$el?.children?.[firstIndex] ?? null
  const key = `${firstIndex}-${childListIndex}`
  const el = appcontainer.value?.querySelector?.(`[data-nav-key="${key}"]`)
  return el || listbox.value?.$el?.children?.[firstIndex] || null
}

// 将滚动容器滚动到使目标元素出现在视口内（距顶部约 offsetFromTop）
function scrollToElement(container, element, offsetFromTop = 100) {
  if (!container || !element) return
  const elRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const delta = elRect.top - containerRect.top
  container.scrollTop += delta - offsetFromTop
}

// 将左侧导航列表滚动到指定索引项（及二级项），仅滚动左侧导航容器，避免带动主内容区
function scrollNavToIndex(ind, subInd) {
  if (ind < 0 || !listScrollWrapRef.value) return
  nextTick(() => {
    const wrap = listScrollWrapRef.value
    const listEl = wrap.querySelector('.list')
    const firstLi = listEl?.children[ind]
    if (!firstLi) return
    const target = subInd != null ? firstLi.querySelectorAll('.list-item-level2')[subInd] : null
    const el = target || firstLi
    const wrapRect = wrap.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const delta = elRect.top - wrapRect.top
    const padding = 24
    const newScrollTop = wrap.scrollTop + delta - padding
    wrap.scrollTop = Math.max(0, Math.min(newScrollTop, wrap.scrollHeight - wrap.clientHeight))
  })
}


const handleScroll = (event) => {
  if (event.target.scrollTop > 100 && !secondloadisload) {
    proteinData.value.push(...secondload.value)
    secondloadisload = true
  } else if (event.target.scrollTop > 300 && !thirdloadisload) {
    proteinData.value.push(...thirdload.value)
    thirdloadisload = true
  } else if (event.target.scrollTop > 500 && !fourthloadisload) {
    proteinData.value.push(...fourthload.value)
    fourthloadisload = true
  }

  if (listtype.value) {
    if (event.target.scrollTop > 150) {
      isSidebarFixed.value = true
      listtype.value.style.width = sidebarCollapsed.value ? '40px' : '19%'
      listtype.value.style.position = 'fixed'
      listtype.value.style.top = '80px'
    } else {
      isSidebarFixed.value = false
      listtype.value.style.width = '100%'
      listtype.value.style.position = 'static'
    }
  }
  if (isScrollingFromClick.value) {
    isScrollingFromClick.value = false;
    return;
  }
  // 根据右侧带 data-nav-key 的块与视口位置，高亮对应的一级或二级导航
  const container = event.target
  const containerRect = container.getBoundingClientRect()
  const threshold = containerRect.top + 180
  const anchors = container.querySelectorAll('[data-nav-key]')
  let currentEl = null
  for (const el of anchors) {
    if (el.getBoundingClientRect().top <= threshold) currentEl = el
  }
  if (currentEl) {
    const key = currentEl.getAttribute('data-nav-key')
    const { firstIndex, subIndex } = keyToNavHighlight(key)
    lis_ind.value = firstIndex
    // 仅当用户已手动展开该一级的二级目录时，才高亮二级标题；否则只高亮一级
    const useSubHighlight = subIndex != null && secondLevelExpanded.value[firstIndex]
    lis_sub_ind.value = useSubHighlight ? subIndex : null
    scrollNavToIndex(firstIndex, useSubHighlight ? subIndex : null)
  } else {
    const ind = [...listbox.value.$el.children].findIndex(val => val.offsetTop > event.target.scrollTop - val.offsetHeight + 300)
    lis_ind.value = ind >= 0 ? ind : 0
    lis_sub_ind.value = null
    scrollNavToIndex(lis_ind.value, null)
  }
}


</script>

<style lang="scss" scoped>
.Search {
  :deep(.el-input) {
    width: 510px;
    height: 46px;
  }


  :deep(.searchTitle) {
    display: none;
  }

  :deep(.keyCont) {
    &>div {
      color: black;
    }
  }


  :deep(.keyWords) {
    width: 575px;
    display: flex;
    align-items: flex-start;
    color: #666666;
    font-size: 16px;
  }

}

.border-left {
  padding-left: 80px;
  border-left: 1px solid #cdcdcd;
}

.content {
  width: 100%;
}

.border-top {
  margin: 0 50px;
  border-top: 1px solid #000;
}

::v-deep(.el-input-group__prepend) {
  background: none;
  box-shadow: none;
}

::v-deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input .el-input__wrapper) {
  box-shadow: none;
  color: #000;
}

.sidebar-wrapper {
  position: relative;
}

.sidebar-wrapper.is-fixed {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sidebar-wrapper.is-fixed .list-title {
  flex-shrink: 0;
}

.sidebar-toggle-btn {
  &.collapsed {
    margin: 10px 0;
    width: 36px;
    height: 36px;
  }

  &.expanded {
    margin-bottom: 12px;
    vertical-align: top;
  }
}

.list-title {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 20px;
  letter-spacing: 0.5px;
}

/* 导航列表可滚动区域；固定时占满剩余高度 */
.list-scroll-wrap {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;
}

.sidebar-wrapper.is-fixed .list-scroll-wrap {
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 180px);
}

/* 出现滚动条时底部「还有更多」标记（放在滚动容器外，避免参与 scrollHeight 导致常驻显示） */
.nav-more-marker {
  flex-shrink: 0;
  left: 0;
  right: 6px;
  padding: 6px 12px 10px;
  background: linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 60%, transparent 100%);
  text-align: center;
  pointer-events: none;
  z-index: 1;
}

.nav-more-marker-text {
  font-size: 11px;
  color: var(--el-theme-color);
  font-weight: 500;
}

.list-scroll-wrap::-webkit-scrollbar {
  width: 6px;
}

.list-scroll-wrap::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.list-scroll-wrap::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.list-scroll-wrap::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.list {
  font-family: 'Source Sans Pro', sans-serif;
  list-style: none;
  line-height: 28px;
  font-size: 16px;
  font-weight: 400;
  padding-top: 4px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  li {
    line-height: 28px;
    padding: 6px 20px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;

    &::after {
      content: '';
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 0;
      height: 1px;
      background: #f0f0f0;
    }

    &:last-child::after {
      display: none;
    }
  }

  .list-number {
    margin-right: 4px;
    flex-shrink: 0;
  }

  .list-chevron {
    flex-shrink: 0;
    font-size: 11px;
    color: #bbb;
    margin-top: 4px;
  }

  .list-chevron-sub {
    cursor: pointer;
    &:hover {
      color: var(--el-theme-color);
    }
  }

  .li_after {
    position: relative;
    color: var(--el-theme-color);
    background: #f0f9eb; /* 选中项浅色背景，与主题色协调 */
    background: color-mix(in srgb, var(--el-theme-color) 10%, transparent);
  }

  .leftline {
    width: 3px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 999;
    background-color: #E7E8EE;

  }


  .showleftline {
    width: 3px;
    height: 25px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 999;
    background-color: var(--el-theme-color);
    border-radius: 2px;

  }
}

/* 一级项作为容器时保留底部边框 */
.list-item-level1 {
  flex-wrap: wrap;
}

/* 二级标题列表 */
.list-level2 {
  width: 100%;
  padding: 2px 0 4px 0;
  margin: 0;
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid #e8e8e8;
  list-style: none;
}

.list-item-level2 {
  padding: 2px 0 2px 0;
  line-height: 22px;
  font-size: 13px;
  color: #666;
  cursor: pointer;

  &:hover {
    color: var(--el-theme-color);
  }

  &::after {
    display: none;
  }
}

.no_click {
  color: #ccc;
}

.listLeft {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.floorLoadingbox {
  width: 100%;
  position: fixed;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
  font-size: 15px;
  padding-left: 20px;
  padding-right: 35px;
  font-weight: bold;
  color: var(--el-theme-color);

  .floorLoading {
    padding: 5px 0;
    text-align: center;
    background-color: white;
    box-shadow: 0px -5px 10px 0px gainsboro;
  }
}
</style>



<!-- 
const filterdata = (data, a) => {
  a++
  data.forEach(item => {
    item.ind = a
    if(item.dataType=='2'){
      if(item.tableList && item.tableList.length){
        var show=false
        item.tableList.forEach(s=>{
          item.childList.forEach(v=>{
            s.show=true
            if(s[v.showName]){
              show=true
            }
          })
        })
        if(show){
          item.show = false
        }else{
          item.show = true
        }
      }else{
        item.show = true
      }
    }else{
      if (item.childList && item.childList.length) {
        if(item.childList.findIndex(val => val.dataType=='2'&&val.childList)> -1 ){
          var ins=item.childList.findIndex(val=>!val.show&&val.dataType!='2')
          if(ins>-1){
            item.show = false
          }else{
            item.show = true
          }
        }else{
          item.show = item.childList.findIndex(val => val.fieldValue) > -1 ? false : true;
        }
        filterdata(item.childList, a)
      } else {
        item.last = true
      }
        
    }
  })
} -->