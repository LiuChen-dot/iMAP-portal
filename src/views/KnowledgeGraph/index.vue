<template>
  <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
    <div style="height: 100%;background-color: #F6F6F6;margin-top: -15px;" class="list_Cont">
      <div class="list_box">
        <div class="list_left">
          <div class="tab" ref="tablist">
            <div class="list_left_top">
              <div class="w-100p dis-flex align-c">
                <span class="fts-12">{{ i18n=='zh'?'查询类型':'QueryType' }}：</span>
                <el-select v-model="queryType"  class="fl-1" 
                  @change="queryTypeChange">
                  <!-- @change="(queryType=='2'||queryType=='3')&&(fromType!='1'&&fromType!='2')?fromType='1':'';(queryType=='2'||queryType=='3')&&(toType!='5'&&toType!='6')?toType='5':''"> -->
                  <el-option label="Adjacent" value="1"></el-option>
                  <el-option label="keyword-to-category" value="2"></el-option>
                  <el-option label="keyword-to-keyword" value="3"></el-option>
                </el-select>
              </div>
              <div class="w-100p dis-flex align-c">
                <span class="fts-12">{{ i18n=='zh'?'头实体':'From' }}：</span>
                <el-select v-model="fromType"  class="fl-1" @change="queryTypeChange">
                  <el-option :label="item.name" :value="item.id" v-for="item in fromTypeList" :key="item.id"></el-option>
                </el-select>
              </div>
              <div class="w-100p dis-flex align-c">
                <span class="fts-12">{{ i18n=='zh'?'关键字':'Keyword' }}：</span>
                <el-autocomplete v-model="SearchValue" @select="selectAutocomplete" :fetch-suggestions="querySearch"
                  clearable  class="fl-1">
                  <template v-slot="{ item }">
                    <div v-html="item.search_content"></div>
                  </template>
                </el-autocomplete>
              </div>
              <div class="w-100p dis-flex align-c">
                <span class="fts-12">{{ i18n=='zh'?'尾实体':'To' }}：</span>
                <el-select v-model="toType"  class="fl-1">
                  <el-option :label="item.name" :value="item.id" v-for="item in toTypeList" :key="item.id"></el-option>
                </el-select>
              </div>
              <div class="w-100p dis-flex align-c">
                <span class="fts-12">{{ i18n=='zh'?'关键字':'Keyword' }}：</span>
                <el-autocomplete v-model="SearchValue1" @select="selectAutocomplete1"  :fetch-suggestions="querySearch1"
                  clearable  class="fl-1">
                  <template v-slot="{ item }">
                    <div v-html="item.search_content"></div>
                  </template>
                </el-autocomplete>
              </div>
              <div class="w-100p dis-flex align-c">
                <span class="fts-12">{{ i18n=='zh'?'返回结果数量':'limit' }}：</span>
                <el-input type="number" v-model="limit" class="fl-1"></el-input>
              </div>
              <div class="w-100p dis-flex align-c">
                <el-button type="primary" @click="SearchFun">{{ i18n=='zh'?'查询':'Query' }}</el-button>
              </div>
              <!-- <div class="w-100p dis-flex align-c">
                <el-autocomplete v-model="SearchValue" @select="selectAutocomplete" :fetch-suggestions="querySearch"
                  :disabled="!SelectValue" clearable placeholder="请输入关键词">
                  <template v-slot="{ item }">
                    <div v-html="item.search_content"></div>
                  </template>
                </el-autocomplete>
              </div> -->
              <!-- <el-input v-model="SearchValue" size="small"></el-input>
              <el-button @click="Search" size="small">搜索</el-button> -->
            </div>
            <div class="list_left_floor">
              <div v-for="item in colorList" :key="item.name">
                <div :style="`color: ${item.color};`">{{ item.name }}：</div>
                <div :style="`width: 50px;height: 20px;background-color: ${item.color};`"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="list_rig">
          <!-- <childpage  :GraphList="GraphList"></childpage> -->
          <neo4j ref="neo4jref" :GraphList="GraphList" :loading="loading"></neo4j>
          <!-- * Rfam图表元素 * -->
          <!-- <div id="svgContainer"></div>
          <div style="position: absolute;padding: 10px 20px;background-color: #04A983;font-size: 12px;color: white;"
            v-show="text" id="dialogbox">{{ text }}</div> -->
          <!-- * Rfam图表元素 * -->
        </div>
      </div>
    </div>

    <Bottom style="position: relative;"></Bottom>
  </div>

</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { searchByPage, getsearchAggregation, platformAggregation } from '@/api/data.js'
import { getGraph, findGraph, getSummary,searchGraph } from '@/api/KnowledgeGraph.js'
import childpage from './childpage.vue'
import neo4j from './neo4j.vue'
import { ElMessage } from 'element-plus';
import Bottom from "@/layout/components/Bottom/index.vue"
import { useLanguageStore } from '@/store/modules/language';




const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
const neo4jref = ref()
const loading = ref(false)
const typeList = ref([])
const queryType = ref('1')
const fromType = ref('1')
const fromKey = ref('')
const toType = ref('0')
const toKey = ref('')
const limit=ref(10)
const fromTypeList=ref([])
const toTypeList=ref([])

const colorList = ref([
  {
    name: 'Gene',
    color: '#F79767'
  },
  {
    name: 'Protein',
    color: '#6ac6ff'
  },
  {
    name: 'Microbe',
    color: '#8DCD93'
  },
  {
    name: 'RNA',
    color: '#ECB5C9'
  },
  {
    name: 'Disease',
    color: '#C990C0'
  },
  {
    name: 'Small Molecule',
    color: '#D8C8AE'
  },
  {
    name: 'GO',
    color: '#9B59B6'
  }
])

const GraphList = ref([])
const SearchGraph = () => {
  getGraph({ id: querySearchId.value, type: SelectValue.value }).then(res => {
    res.data.edges ? '' : res.data.edges = []
    res.data.nodes ? '' : res.data.nodes = []
    GraphList.value = res.data
    loading.value = false
  })
}

const SelectValue = ref('')

const SearchValue1 = ref('')
const SearchValue = ref('')

const querySearch = (queryString, cb) => {
  findGraph({ name: queryString, type: fromType.value }).then(res => {
    cb(res.data)
  })
}
const querySearch1 = (queryString, cb) => {
  findGraph({ name: queryString, type: toType.value }).then(res => {
    cb(res.data)
  })
}
const querySearchId = ref('')
const selectAutocomplete = (e) => {
  SearchValue.value = e.search_content.replace(/<[^>]*>/g, '')
  fromKey.value = e.id
}
const selectAutocomplete1 = (e) => {
  SearchValue1.value = e.search_content.replace(/<[^>]*>/g, '')
  toKey.value = e.id
}


const typeClick = (val, ind) => {
  SearchValue.value = val.baseDataType
}

const SearchFun=()=>{
  loading.value = true
  searchGraph({
    queryType:queryType.value,
    fromType:fromType.value,
    fromKey:fromKey.value,
    toType:toType.value,
    toKey:toKey.value,
    limit:limit.value
  }).then(res=>{
    res.data.edges ? '' : res.data.edges = []
    res.data.nodes ? '' : res.data.nodes = []
    GraphList.value = res.data
    loading.value = false
  })
}

const queryTypeChange=()=>{
  if(queryType.value=='1'){
    fromTypeList.value=[{id:'1',name:'Gene'},{id:'2',name:'Protein'},{id:'3',name:'Microbe'},{id:'4',name:'RNA'},{id:'5',name:'Disease'},{id:'6',name:'Small molecule'},{id:'7',name:'GO term'}]
    var ind1=fromTypeList.value.findIndex(item => item.id == fromType.value)
    if(ind1==-1){
      fromType.value=fromTypeList.value[0].id
    }
    if(fromType.value=='1'){
      toTypeList.value=[{id:'0',name:'All'},{id:'2',name:'Protein'},{id:'3',name:'Microbe'},{id:'4',name:'RNA'}]
    }
    if(fromType.value=='2'){
      toTypeList.value=[{id:'0',name:'All'},{id:'1',name:'Gene'},{id:'3',name:'Microbe'},{id:'7',name:'GO term'}]
    }
    if(fromType.value=='3'){
      toTypeList.value=[{id:'0',name:'All'},{id:'1',name:'Gene'},{id:'4',name:'RNA'},{id:'5',name:'Disease'},{id:'6',name:'Small molecule'}]
    }
    if(fromType.value=='4'){
      toTypeList.value=[{id:'0',name:'All'},{id:'1',name:'Gene'},{id:'3',name:'Microbe'}]
    }
    if(fromType.value=='5'||fromType.value=='6'){
      toTypeList.value=[{id:'0',name:'All'},{id:'3',name:'Microbe'}]
    }
    if(fromType.value=='7'){
      toTypeList.value=[{id:'2',name:'Protein'}]
    }
  }
  if(queryType.value=='2'){
    fromTypeList.value=[{id:'1',name:'Gene'},{id:'2',name:'Protein'},{id:'3',name:'Microbe'},{id:'4',name:'RNA'},{id:'7',name:'GO term'}]
    var ind1=fromTypeList.value.findIndex(item => item.id == fromType.value)
    if(ind1==-1){
      fromType.value=fromTypeList.value[0].id
    }
    if(fromType.value=='1'||fromType.value=='2'||fromType.value=='4'){
      toTypeList.value=[{id:'5',name:'Disease'},{id:'6',name:'Small molecule'}]
    }
    if(fromType.value=='3'){
      toTypeList.value=[{id:'0',name:'All'},{id:'1',name:'Gene'},{id:'2',name:'Protein'},{id:'4',name:'RNA'},{id:'5',name:'Disease'},{id:'6',name:'Small molecule'},{id:'7',name:'GO term'}]
    }
    if(fromType.value=='7'){
      toTypeList.value=[{id:'3',name:'Microbe'}]
    }
  }
  if(queryType.value=='3'){
    fromTypeList.value=[{id:'1',name:'Gene'},{id:'2',name:'Protein'},{id:'3',name:'Microbe'},{id:'4',name:'RNA'}]
    var ind1=fromTypeList.value.findIndex(item => item.id == fromType.value)
    if(ind1==-1){
      fromType.value=fromTypeList.value[0].id
    }
    if(fromType.value=='1'||fromType.value=='2'||fromType.value=='4'){
      toTypeList.value=[{id:'5',name:'Disease'},{id:'6',name:'Small molecule'}]
    }
    if(fromType.value=='3'){
      toTypeList.value=[{id:'0',name:'All'},{id:'1',name:'Gene'},{id:'2',name:'Protein'},{id:'4',name:'RNA'},{id:'5',name:'Disease'},{id:'6',name:'Small molecule'}]
    }
  }
  var ind1=toTypeList.value.findIndex(item => item.id == toType.value)
  if(ind1==-1){
    toType.value=toTypeList.value[0].id
  }
  var ind=toTypeList.value.findIndex(item => item.id == toType.value)
  if(ind==-1){
    toType.value=toTypeList.value[0].id
  }
}


// * Rfam图表提示词方法 *
// const text = ref('')
// const getTitle = (textcont, fill, type) => {
//   let title = ''
//   let tspan = textcont
//   //text
//   if (type == 'text') {
//     if (tspan == 'R') {
//       tspan = 'G or A';
//     } else if (tspan == 'Y') {
//       tspan = 'C or U';
//     }
//     if (fill == '#d90000') {
//       title = tspan + " present >97%";
//     } else if (fill == '#000000') {
//       if (tspan != "5") {
//         title = tspan + " present 90-97%";
//       }
//     } else if (fill == '#807b88') {
//       title = tspan + " present 75-90%";
//     } else if (fill == '#ffffff') {
//       title = tspan + " present 50-75%";
//     }
//   }
//   //path
//   if (type == 'path') {
//     if (fill == '#31a354') {
//       title = "Significant basepair";
//       // significant_basepairs += 1;
//     } else if (fill == '#d90000') {
//       title = "Nucleotide present 97%";
//     } else if (fill == '#000000') {
//       title = "Nucleotide present 90%";
//     } else if (fill == '#807b88') {
//       title = "Nucleotide present 75%";
//     } else if (fill == '#ffffff') {
//       title = "Nucleotide present 50%";
//     }
//   }
//   return title
// }

onMounted(() => {
  queryTypeChange()
  // platformAggregation().then(res => {
  //   typeList.value = res.data.dataTypeAndDataSize
  // })
  // * Rfam图表生成方法 *
  // nextTick(() => {
  //   fetch('/svg/family/RF03116/image/rscape')
  //     .then(svgText => {
  //       svgText.text().then(res => {
  //         document.getElementById('svgContainer').innerHTML = res
  //         const svg = document.getElementById('svgContainer').querySelector('svg')
  //         // const tspanList = svg.querySelectorAll('tspan')
  //         // console.log(tspanList[10].innerHTML,'kkkkkkkk');

  //         // const textElement = svg.querySelector('text');  // 获取 <text> 标签
  //         // const textContent = textElement.textContent;  // 获取文本内容
  //         const pathList = svg.querySelectorAll('path')
  //         pathList.forEach(item => {
  //           const dialogbox = document.getElementById('dialogbox')
  //           item.addEventListener('mouseover', () => {
  //             dialogbox.style.top = `${item.getBoundingClientRect().top - 50}px`
  //             dialogbox.style.left = `${item.getBoundingClientRect().left + 30}px`
  //             text.value = getTitle('', item.attributes.fill.nodeValue,'path')
  //           })
  //           item.addEventListener('mouseout', () => {
  //             text.value = ''
  //           })
  //         })
  //         const textList = svg.querySelectorAll('text')
  //         textList.forEach(item => {
  //           const tspan = item.querySelector('tspan')
  //           // console.log(getTitle(tspan.innerHTML, tspan.attributes.fill.nodeValue), 'kkkkk');
  //           const dialogbox = document.getElementById('dialogbox')
  //           item.addEventListener('mouseover', () => {
  //             dialogbox.style.top = `${item.getBoundingClientRect().top - 50}px`
  //             dialogbox.style.left = `${item.getBoundingClientRect().left + 30}px`
  //             text.value = getTitle(tspan.innerHTML, tspan.attributes.fill.nodeValue,'text')
  //           })
  //           item.addEventListener('mouseout', () => {
  //             text.value = ''
  //           })
  //         })
  //       })
  //     })
  //     .catch(error => {
  //       console.error('加载SVG失败:', error);
  //     });

  // })
})

</script>

<style lang="scss" scoped>
:deep(.el-input__wrapper) {
  background-color: #F9F9F9;
}

:deep(.el-select__wrapper) {

  background-color: #F9F9F9;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #F9F9F9;

}

.list_box {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 35px 20px 20px;
  height: 100%;

  .list_left {
    width: 320px;
    height: 100%;
    background-color: white;

    .list_left_top {
      display: flex;
      flex-direction: column;
      font-size: 15px;
      padding: 24px 20px 0;
      gap: 10px;

      // &>div:first-child {
      //   flex: 1;


      //   .el-select {
      //     width: 100%;
      //   }
      // }

      // &>div:last-child {
      //   flex: 2;

      //   :deep(.el-autocomplete) {
      //     width: 100%;
      //   }
      // }


    }

    .tab {
      box-sizing: border-box;
      font-size: 14px;
      overflow: hidden;
      overflow-y: auto;

      .tabitem {
        display: flex;
        align-items: center;
        padding: 0 15px;
        cursor: pointer;

        .sp {
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .active {
        background: var(--inneractive);
        color: var(--el-theme-color);
      }
    }

    .list_left_floor {
      padding: 27px 20px 0;
      font-weight: bold;
      font-size: 15px;


      &>div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;

      }
    }
  }

  .list_rig {
    flex: 1;
    height: 100%;
  }

  .drawerbox {
    position: fixed;
    box-shadow: 0 1px 10px 1px gainsboro;
    width: 150px;
    min-height: 200px;
    padding: 5px 10px;
    border: 1px solid ghostwhite;
    z-index: 999;
    background-color: white;

    &>div:first-child {
      text-align: end;
      cursor: pointer;
    }

    &>div:nth-child(2) {
      font-size: 15px;
    }

    &>div:last-child {
      font-size: 45px;
      color: white;
      position: absolute;
      top: 0;
      left: -28px;
    }
  }
}
</style>