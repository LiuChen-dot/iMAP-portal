<template>
  <div :class="['app-container', listValue == 'taxonomy' ? 'ov-h' : '']" @scroll="handleScroll">
    <el-card :class="[listValue == 'taxonomy' ? 'cardCont' : '']" style="border: none;">
      <!-- 搜索框 -->
      <div class="mar-t-30" style="position: relative;z-index: 998;">
        <Search class="Search" />
      </div>
      <el-divider border-style="dashed" style="position: relative;z-index: 998;margin: 24px 0 15px;" />
      <div
        :style="`background-image: url('${bac}');background-size: cover;width: 99%;height: 500px;position: fixed;top:56px;z-index: 0;left: 0`">
      </div>
      <!-- 内容 -->
      <div class="list_Cont" style="position: relative;z-index: 998;">
        <div class="list_header">
          <el-breadcrumb>
            <el-breadcrumb-item>
              <div class="Searchtitle">Search Results for <span style="color: var(--el-theme-color);">{{ searchValue
                  }}</span></div>
            </el-breadcrumb-item>
          </el-breadcrumb>

        </div>
        <div class="list_box">
          <div class="list_left">
            <div class="tab" ref="tablist">
              <div v-for="(item, index) in typeList" :key="index" :class="['tabitem', index == typeind ? 'active' : '']"
                @click="typeClick(item, index)" :title="item.showName">
                <span class="sp">{{ item.showName == 'basic_information' ? 'Microbe' : item.showName }}</span><span
                  v-if="item.showName != 'taxonomy'">（{{ item.dataCount
                  }}）</span>
              </div>

            </div>
            <p class="contentTitle">{{ dataSize }} records from All databases.</p>
          </div>
          <template v-if="isMounted">
            <div class="list_rig" v-infinite-scroll="load" :infinite-scroll-immediate="false" v-loading='listLoading'>
              <div v-for="(item, index) in seachList" :key="index" class="content">
                <span class="message-style" @click="detailBtn(item)">
                  <div><img src="@/assets/images/search/icon.svg" /></div>
                  <div>{{ item.name }}</div>
                </span>
                <div class="content-style fts-14">
                  <p v-for="(val, key) in item.children" :key="key" v-show="val.lable != 'Id' && val.lable != 'id'">
                    <span class="lable" v-html="val.lable"></span>：<span class="labValue" v-html="val.labValue"></span>
                  </p>
                </div>
                <div class="contentbac">
                  <img src="@/assets/images/search/contentbac.png" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { nextTick, onMounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import Search from "./search.vue";
import { useRoute, useRouter } from 'vue-router'
import { searchByPage, getsearchAggregation } from '@/api/data.js'
import treeChart from '@/views/treeChart/treeChart/App'
import bac from '@/assets/images/search/bac.png'
const seachList = ref([])
const typeList = ref([])
const dataSize = ref(0)
const route = useRoute();
const router = useRouter();
const pageNum = ref(1)
const pageSize = ref(10)
const typeind = ref(-1)
const listValue = ref(route.query.type ? route.query.type : '')
const searchValue = ref(route.query.value ? route.query.value : (sessionStorage.getItem('SearchValue') ? sessionStorage.getItem('SearchValue') : ''));
const listLoading = ref(false)

const isMounted = ref(false)


//获取树形结构跳转查询参数
const dataTypeAndTaxonomySpecies = ref('')
const speciesTaxId = ref('')
if (sessionStorage.getItem('dataTypeAndTaxonomySpecies')) {
  dataTypeAndTaxonomySpecies.value = sessionStorage.getItem('dataTypeAndTaxonomySpecies') || ''
}
if (sessionStorage.getItem('speciesTaxId')) {
  speciesTaxId.value = sessionStorage.getItem('speciesTaxId') || ''
}

const getsearchAggregationFun = (type, searchtype) => {
  getsearchAggregation({
    "baseDataType": route.query.type,
    "keyword": searchValue.value,
    dataTypeAndTaxonomySpecies: dataTypeAndTaxonomySpecies.value,
    speciesTaxId: speciesTaxId.value
  }).then(res => {
    typeind.value = res.data.dataTypeAndDataSize.findIndex((item) => item.baseDataType == listValue.value)
    // typeList.value = [...[{
    //   baseDataType: "",
    //   dataCount: res.data.dataSize,
    //   lastUpdateDate: "",
    //   showName: "All"
    // }], ...res.data.dataTypeAndDataSize]
    typeList.value = res.data.dataTypeAndDataSize
    if (searchtype == 'list') {
      res.data.dataTypeAndDataSize.forEach((item) => {
        if (item.baseDataType == type) {
          dataSize.value = item.dataCount
        }
      })
    } else if (searchtype == 'search') {
      res.data.dataTypeAndDataSize.forEach((item) => {
        if (item.baseDataType == listValue.value) {
          dataSize.value = item.dataCount
        }
      })
    } else {
      dataSize.value = res.data.dataSize
    }
  })
}

const searchByPageFun = () => {
  listLoading.value = true
  searchByPage(pageNum.value, pageSize.value, {
    "baseDataType": listValue.value || null,
    "keyword": searchValue.value || null,
    dataTypeAndTaxonomySpecies: dataTypeAndTaxonomySpecies.value,
    speciesTaxId: speciesTaxId.value
  }).then(res => {

    var arr = []
    res.data.dataList.forEach(item => {
      var obj = {}
      obj.id = item.id
      obj.dataType = item.dataType
      if (item.dataType == 'gene') {
        obj.name = item.symbol
      }
      if (item.dataType == 'protein') {
        obj.name = item.entry_name
      }
      if (item.dataType == 'rna') {
        obj.name = item.RNA_name
      }
      if (item.dataType == 'Microbe') {
        obj.name = item.current_scientific_name
      }
      if (item.dataType == 'disease') {
        obj.id = item.disease_lishan_id
        obj.name = item.Disease_name
      }
      if (item.dataType == 'small_molecule') {
        obj.name = item.chebi_name
      }
      if (item.dataType == 'go_terms') {
        obj.name = item.GO_term_name
      }
      obj.children = []
      for (var key in item) {
        let value = item[key]
        key = key.split('_').join(' ')
        key = capitalizeFirstLetter(key)
        obj.children.push({
          lable: key,
          labValue: value
        })
      }
      arr.push(obj)
    })
    console.log(arr)
    if (res.data.dataList) {
      seachList.value = [...seachList.value, ...arr]
    }
    listLoading.value = false
  }).catch(() => {
    listLoading.value = false
  })
}


const capitalizeFirstLetter = (string) => {
  return string.replace(/\b[a-z]/g, function (match) {
    return match.toUpperCase();
  });
}
const load = () => {
  pageNum.value++
  searchByPageFun()
}

onMounted(() => {
  console.log(route.query);

  searchByPageFun()
  isMounted.value = true
  getsearchAggregationFun(route.query.type || '', route.query.type ? 'list' : '')
})

const typeClick = (val, ind) => {
  listValue.value = val.baseDataType
  typeind.value = ind
  dataSize.value = val.dataCount
  if (listValue.value != "taxonomy") {
    pageNum.value = 1
    seachList.value = []
    searchByPageFun()
  }
}

watch(() => route.query.value, (newQuery, oldQuery) => {
  // 当路由查询参数发生变化时，这里会被调用
  pageNum.value = 1
  seachList.value = []
  searchValue.value = newQuery
  searchByPageFun()
  getsearchAggregationFun('', 'search')
});
// 详情页
const detailBtn = (val) => {
  if (val.dataType == 'protein') {
    sessionStorage.setItem('protein_id', val.id)
    sessionStorage.setItem('zwType', val.dataType)
    window.open('/protein', '_blank')
  } else if (val.dataType == 'gene') {
    sessionStorage.setItem('zw1Type', val.dataType)
    sessionStorage.setItem('gene_id', val.id)
    window.open('/gene', '_blank')
  } else if (val.dataType == 'rna') {
    sessionStorage.setItem('zwType', val.dataType)
    sessionStorage.setItem('rna_id', val.id)
    window.open('/rna', '_blank')
  } else if (val.dataType == 'Microbe') {
    sessionStorage.setItem('basic_information_id', val.id)
    sessionStorage.setItem('zwType', val.dataType)
    window.open('/basic_information', '_blank')
  } else if (val.dataType == 'disease') {
    sessionStorage.setItem('disease_id', val.id)
    sessionStorage.setItem('zw1Type', val.dataType)
    window.open('/disease', '_blank')
  } else if (val.dataType == 'small_molecule') {
    sessionStorage.setItem('small_molecule_id', val.id)
    sessionStorage.setItem('zwType', val.dataType)
    window.open('/small_molecule', '_blank')
  } else if (val.dataType == 'go_terms') {
    sessionStorage.setItem('go_terms_id', val.id)
    sessionStorage.setItem('zwType', val.dataType)
    window.open('/go_terms', '_blank')
  }
};

const tablist = ref(null)
const handleScroll = (event) => {
  if (event.target.scrollTop > 250) {
    tablist.value.style.width = '100%'
    tablist.value.style.position = 'fixed'
    tablist.value.style.top = '50px'
    tablist.value.style.left = '0'
    tablist.value.style.padding = '30px 160px'
    tablist.value.style.boxShadow = '0px 1px 5px gainsboro'
    tablist.value.style.zIndex = '999'
    tablist.value.style.backgroundColor = 'white'
    const tabitemlist = document.getElementsByClassName('tabitem')
    for (let item of tabitemlist) {
      item.style.boxShadow = '0px 1px 5px gainsboro'
    }
  } else {
    tablist.value.style.position = 'static'
    tablist.value.style.width = '75%'
    tablist.value.style.boxShadow = 'none'
    tablist.value.style.padding = '0px'
    tablist.value.style.backgroundColor = ''
    const tabitemlist = document.getElementsByClassName('tabitem')
    for (let item of tabitemlist) {
      item.style.boxShadow = 'none'
    }
  }
}

onBeforeUnmount(() => {
  sessionStorage.removeItem('SearchValue')
})

// if (sessionStorage.getItem('SearchValue')) {
//   searchByPageFun()
// }
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
    color: #666;
    font-size: 16px;
  }

}

::v-deep(.el-card.is-always-shadow) {
  border-bottom-width: 0px;
}

::v-deep(.el-divider--horizontal) {
  margin-top: 0px;
}

.cardCont {
  overflow: hidden !important;
  height: 100% !important;

  ::v-deep(.el-card__body) {
    overflow: hidden !important;
    height: 100% !important;
    display: flex;
    flex-direction: column;

    .list_Cont {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}

.list_Cont {
  .list_header {
    display: flex;
    justify-content: center;
    padding-bottom: 15px;

    .Searchtitle {
      font-size: 24px;
      color: #333333;
      font-weight: 600;
    }
  }

  .list_box {

    .list_left {
      .tab {
        width: 75%;
        margin: 0 auto;
        box-sizing: border-box;
        font-size: 14px;
        line-height: 40px;
        display: flex;
        justify-content: center;
        gap: 15px;

        &>div {
          background-color: white;
        }

        .tabitem {
          display: flex;
          align-items: center;
          padding: 0 15px;
          cursor: pointer;

          .sp {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .tabitem:hover {
          color: var(--el-theme-color);
        }

        .active {
          background: var(--el-theme-color);
          color: white;
        }

        .active:hover {
          color: white;
        }
      }
    }

    .list_rig {
      margin: 0 auto;
      width: 70%;
      position: relative;
      z-index: 998;
      background-color: white;
    }
  }
}

.list_rigtaxonomy {
  margin: 0 auto;
  width: 80%;
  height: 300px;
}

.contentTitle {
  font-size: 24px;
  text-align: center;
  font-weight: 700;
  padding: 24px 0 15px;
}

.message-style {
  display: flex;
  align-items: center;
  color: var(--el-theme-color);
  cursor: pointer;
  position: relative;
  padding-bottom: 8px;

  span {
    max-width: 600px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 700;
    font-size: 16px;
  }

  &>div:first-child {
    position: absolute;
    top: -5px;
    left: -35px;

    img {
      width: 42px;
    }
  }
}

.content-style {
  line-height: 32px;
  display: flex;
  flex-wrap: wrap;

  p {
    display: flex;
    width: 30%;
    padding-right: 30px;
    font-size: 14px;

    .lable {
      color: #666;
      font-weight: 400;
    }

    .labValue {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      color: #333333;
      font-weight: 600;
    }
  }
}

.circle {
  margin-right: 8px;
  display: flex;
}

::v-deep(.el-input-group__prepend) {
  background: none;
  box-shadow: none;
}

.content {
  box-shadow: 0px 2px 5px gainsboro;
  border-top: 1px solid var(--el-theme-color);
  padding: 18px;
  padding-left: 44px;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;

  .contentbac {
    right: 0;
    bottom: -15px;
    position: absolute;
    width: 217px;
    height: 105px;

    img {
      width: 100%;
      height: 100%
    }
  }
}

::v-deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input .el-input__wrapper) {
  box-shadow: none;
  color: #000;
}

::v-deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
}

.circle0 img {
  content: url('../../assets/images/typeIcon0.png');
}

.circle1 img {
  content: url('../../assets/images/typeIcon1.png');
}

.circle2 img {
  content: url('../../assets/images/typeIcon2.png');
}

.circle3 img {
  content: url('../../assets/images/typeIcon3.png');
}

.circle4 img {
  content: url('../../assets/images/typeIcon4.png');
}

.circle5 img {
  content: url('../../assets/images/typeIcon5.png');
}

.circle6 img {
  content: url('../../assets/images/typeIcon6.png');
}

.circle7 img {
  content: url('../../assets/images/typeIcon7.png');
}
</style>
