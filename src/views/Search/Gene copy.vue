<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索框 -->
      <div class="mar-t-30" style="position: relative;z-index: 998;">
        <Search class="Search" />
      </div>
      <el-divider border-style="dashed"  class="mar-t-20" style="position: relative;z-index: 998;" />
      <div
        :style="`background-image: url('${bac}');background-size: cover;width: 99%;height: 500px;position: fixed;top:56px;z-index: 0;left: 0`">
      </div>
      <!-- 内容 -->
      <div style="margin-top: 20px;">
        <div style="display: flex;align-items: center;justify-content: space-between;">
          <h1 class="text-w-600 fts-40 pad-b-30"
            style="font-family: 'Source Sans Pro', sans-serif;color:var(--el-theme-color);position: relative;z-index: 998;">
            {{ protein_name }}</h1>
          <div @click="openCytoscape" v-if="zwType == 'gene'"
            style="background-color: #A8D159;color: white;padding:5px 12px;border-radius: 8px;cursor: pointer;position: relative;z-index: 998;">
            Genome Browser</div>
        </div>
        <div class="content" v-loading='listLoading' ref="xqcontent">
          <ul class="lis1 pad-15">
            <template v-for="(item, index) in proteinData" :key="index">
              <li v-show="!item.show">
                <p class="p_box">
                  <span
                    :class="[item.dataType != '0' ? 'lable3' : '', item.dataType == '0' ? 'text-w-800 fts-20' : 'text-w-600']">{{
                      capitalizeFirstLetter(item.showName) }}</span>
                  <b v-if="item.dataType != '0'" class="b"></b>
                  <span class="span_value" v-if="item.dataType != '0'"
                    v-html="item.fieldValue ? getLink(item) : ''"></span>
                </p>
                <ul v-if="item.childList && item.childList.length">
                  <li v-for="(val, ind) in item.childList" :key="ind" v-show="!val.show">
                    <p class="p_box">
                      <span class="lable3 text-w-600 pad-l-15">{{ capitalizeFirstLetter(val.showName) }}</span>
                      <b v-if="val.dataType != '0'&&item.dataType != '2'&&item.dataType != '6'" class="b"></b>
                      <span :style="val.url ? 'color: blue;cursor: pointer;' : ''" @click="gobasic(val)"
                        class="span_value" v-if="val.dataType != '0'&&item.dataType != '2'&&item.dataType != '6'"
                        v-html="val.fieldValue ? getLink(val) : ''"></span>
                    </p>
                    <div v-if="(val.dataType == '2' || val.dataType == '6')  && val.childList" class="pad-10" >
                        <div v-for="(str,indz) in val.tableList.slice((val.page - 1) * val.pageSize, (val.page - 1) * val.pageSize + val.pageSize)" style="border:1px dashed #ccc;padding:10px;padding-top:0;border-radius:10px;">
                            <div class="fts-12" style="color:var(--el-theme-color);padding:10px 0">{{str.name}}</div>
                            <el-table border class="table"
                                :data="str.data.slice((str.page - 1) * str.pageSize, (str.page - 1) * str.pageSize + str.pageSize)"
                                :scrollbar-always-on='str.tableWidth > str.contentWidth ? true : false'>
                                <el-table-column v-for="(obj, ind) in val.childList" :key="ind" :prop="val.showName"
                                    :width="str.tableWidth > str.contentWidth ? (obj.showNameNew.length * 7 + 24) : 'auto'">
                                    <template #header>
                                        <div>{{ obj.showNameNew }}</div>
                                    </template>
                                    <template #default="scope">
                                        <p class="ellipsis-multiline" style="cursor: pointer">
                                            <el-tooltip class="box-item" effect="light"
                                                :content="scope.row[obj.showName] ? scope.row[obj.showName] : ''"
                                                placement="top">
                                                <span>{{ scope.row[obj.showName] ? getTableLink(obj,scope.row) : '' }}</span>
                                            </el-tooltip>
                                        </p>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="mar-t-10 dis-flex just-c-fe" v-if="str.data.length>5">
                                <el-pagination class="pagination" size="small"  v-model:current-page="str.page"
                                    v-model:page-size="str.pageSize"
                                    :page-sizes="[5, 10, 20, 30, 50, str.data.length < 100 ? 100 : str.data.length]"
                                    layout="total, sizes, prev, pager, next, jumper" :total="str.data.length">
                                </el-pagination>
                            </div>
                        </div>
                        <div class="mar-t-10 dis-flex just-c-c" v-if="item.tableList.length>3">
                            <el-pagination class="pagination" size="small"  v-model:current-page="item.page"
                                v-model:page-size="item.pageSize"
                                :page-sizes="[5, 10, 20, 30, 50, item.tableList.length < 100 ? 100 : item.tableList.length]"
                                layout="total, sizes, prev, pager, next, jumper" :total="item.tableList.length">
                            </el-pagination>
                        </div>
                    </div>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import Search from "./search.vue";
import { reactive, ref } from "vue";
import listItem from './listItem.vue'
import { getgeneData, getdiseaseData, getsmallMoleculeData } from '@/api/data.js'
import { useRoute, useRouter } from 'vue-router'
import bac from '@/assets/images/search/bac.png'
const route = useRoute();
const router = useRouter();
const listLoading = ref(false)
const xqcontent = ref(null)

const proteinData = ref([])
const lis_ind = ref(0)
const protein_name = ref('')
const zwType = sessionStorage.getItem('zw1Type')
const getgeneDataFun = () => {
  listLoading.value = true
  if (sessionStorage.getItem('zw1Type') == 'gene') {
    getgeneData(sessionStorage.getItem('gene_id')).then(res => {
      protein_name.value = res.data.find(val => val.showName == 'symbol').fieldValue
      res.data.forEach(item => {
        item.showName = item.showName.split('_').join(' ')
        if (item.childList && item.childList.length) {
          item.show = item.childList.findIndex(val => val.fieldValue) > -1 ? false : true;
          item.childList.forEach(val => {
            val.showName = val.showName.split('_').join(' ')
            val.childList.forEach(str => {
              str.showNameNew = str.showNameNew.split('_').join(' ')
            })
            if (val.dataType == '2' || val.dataType == '6' ) {
              if (val.tableList && val.tableList.length) {
                var show = false
                val.tableList.forEach(s => {
                  s.page = 1
                  s.pageSize = 5
                  s.contentWidth = xqcontent.value.offsetWidth
                  s.tableWidth = 0
                  // console.log('s.data',s.data)
                  s.data.forEach(z => {
                    val.childList.forEach(v => {
                      // s.show = true
                      if (z[v.showName]) {
                        show = true
                      }
                    })
                  })
                })
                val.page = 1
                val.pageSize = 3
                if (show) {
                  val.show = false
                } else {
                  val.show = true
                }
              } else {
                val.show = true
              }

            }else{
              if (val.childList && val.childList.length) {
                val.show = val.childList.findIndex(s => s.fieldValue) > -1 ? false : true;
                val.childList.forEach(val => {
                  val.show = val.fieldValue ? false : true
                })
              } else {
                val.show = val.fieldValue ? false : true
              }
            }
          })
        } else {
          item.show = item.fieldValue ? false : true
        }
      })
      proteinData.value = res.data
      console.log(proteinData.value)
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } else if (sessionStorage.getItem('zw1Type') == 'disease') {
    getdiseaseData(sessionStorage.getItem('disease_id')).then(res => {
      protein_name.value = res.data.find(val => val.showName == 'Disease_Name' || val.showName == 'Disease Name').fieldValue
      res.data.forEach(item => {
        item.showName = item.showName.split('_').join(' ')
        if (item.childList && item.childList.length) {
          item.show = item.childList.findIndex(val => val.fieldValue) > -1 ? false : true;
          item.childList.forEach(val => {
            val.showName = val.showName.split('_').join(' ')
            if (val.childList && val.childList.length) {
              val.show = val.childList.findIndex(s => s.fieldValue) > -1 ? false : true;
              val.childList.forEach(val => {
                val.show = val.fieldValue ? false : true
              })
            } else {
              val.show = val.fieldValue ? false : true
            }
          })
        } else {
          item.show = item.fieldValue ? false : true
        }
      })
      proteinData.value = res.data
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } 

}

const getLink=(item)=>{
  if(item.urlType=='2'){
    var b=[]
    if(item.url){
      b=item.url.split(',').map(val=>val.split('|'))
    }
    var str = item.fieldValue.split(';').map(val => {
      var ind = b.findIndex(s=>s[0].trim() == val.split(':')[0].trim())
      if(ind != -1){
        var link=b[ind][1].replace(`{${b[ind][0]}}`,val.split(':')[1].trim())
        return `<a href="${link}" class="interlinkage" target="_blank">${val}</a>`;
      }else{
        return val;
      }
    }).join(';');
    return str;
  }else{
    return item.fieldValue
  }
}

const capitalizeFirstLetter = (string) => {
  return string.replace(/\b[a-z]/g, function (match) {
    return match.toUpperCase();
  });
}
getgeneDataFun()
const listClick = (ind) => {
  lis_ind.value = ind
}
const getTableLink=(item,row)=>{
    if(item.urlType=='2'){
        var b=[]
        if(item.url){
            b=item.url.split(',').map(val=>val.split('|'))
        }
        var str = row[item.showName].split(';').map(val => {
            var ind = b.findIndex(s=>s[0].trim() == val.split(':')[0].trim())
            if(ind != -1){
            var link=b[ind][1].replace(`{${b[ind][0]}}`,val.split(':')[1].trim())
                return `<a href="${link}" class="interlinkage" target="_blank">${val}</a>`;
            }else{
                return val;
            }
        }).join(';');
        return str;
    }else if(item.urlType=='3'){
        var link=item.url + row[item.showName]
        return `<a href="${link}" class="interlinkage" target="_blank">${row[item.showName]}</a>`;
    }else{
        return row[item.showName]
    }
}
const openCytoscape = () => {
  proteinData.value.forEach(item => {
    if (item.showName == 'dblinks') {
      if(item.fieldValue){
        const findidtext = item.fieldValue.indexOf('ECOCYC:')
        let searchid = ''
        const slicetext = item.fieldValue.slice(findidtext + 7, item.fieldValue.length)
        if (slicetext.indexOf(';') != -1) {
          searchid = slicetext.slice(0, slicetext.indexOf(';')).replace(/[\s;]+/g, '');
        } else {
          searchid = slicetext.replace(/[\s;]+/g, '')
        }
        sessionStorage.setItem('gene_searchId', searchid)
      }else{
        sessionStorage.setItem('gene_searchId', '')
      }
      // router.push({ path: '/cytoscape' })
    }
    if (item.showName == 'replicon') {
      if(item.fieldValue){
        sessionStorage.setItem('gene_replicon', item.fieldValue)
      }else{
        sessionStorage.setItem('gene_replicon', '')
      }
    }
    if(item.dataType=='0'){
      if(item.childList&&item.childList.length){
        item.childList.forEach(val=>{
          if(val.showName=='substrains tax id'){
            if(val.fieldValue){
              sessionStorage.setItem('gene_SubstrainsTaxId', val.fieldValue)
            }else{
              sessionStorage.setItem('gene_SubstrainsTaxId', '')
            }
          }
        })
      }
    }
  })
  router.push({ path: '/cytoscape' })
}

const gobasic = (e) => {
  if (e.url) {
    sessionStorage.setItem('basic_information_id', e.url)
        sessionStorage.setItem('zwType', 'Microbe')
    window.open('/basic_information', '_blank')
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
  // padding: 60px 80px;
  // background-color: #ecf1f7;
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

.lis1 {
  box-shadow: 0 .125rem .25rem .125rem rgba(22, 29, 57, .2);
  background-color: #fbfeff;
  border-radius: .2rem;
  margin-bottom: 15px;
  position: relative;
  z-index: 998;
}

.p_box {
  display: flex;
  padding: 5px 0;
}

.lable3 {
  width: 150px;
  text-align: right;
  word-wrap: break-word;
}

.b {
  width: 1px;
  background: #00a6d5;
  margin: 0 10px;
}

li {
  list-style: none;
  line-height: 25px;
  font-size: 15px;
}

.p_span {
  font-weight: 600;
}

.span_value {
  flex: 1;
  overflow: auto;
}

/* 自定义整个滚动条 */
.span_value::-webkit-scrollbar {
  height: 5px;
  /* 设置滚动条的宽度 */
  background-color: #f9f9f9;
  /* 滚动条的背景色 */
}

/* 自定义滚动条轨道 */
.span_value::-webkit-scrollbar-track {
  background: #e1e1e1;
  /* 轨道的背景色 */
  border-radius: 5px;
  /* 轨道的圆角 */
}

/* 自定义滚动条的滑块（thumb） */
.span_value::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  /* 滑块的背景色 */
  border-radius: 5px;
  /* 滑块的圆角 */
}

/* 当滑块悬停或活动时的样式 */
.span_value::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
  /* 悬停或活动状态下滑块的背景色 */
}
</style>