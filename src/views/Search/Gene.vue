<template>
  <div style="height: 100%;overflow: scroll;overflow-x: hidden;" ref="appcontainer" >
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
          <el-col :span="24">
            <div style="display: flex;align-items: center;justify-content: space-between;">
              <h1 class="text-w-600 fts-40 pad-b-30"
                style="font-family: 'Source Sans Pro', sans-serif;color:var(--el-theme-color);position: relative;z-index: 998;">
                {{ protein_name }}</h1>
              <div @click="openCytoscape" v-if="zwType == 'gene'"
                style="background-color: #A8D159;color: white;padding:5px 12px;border-radius: 8px;cursor: pointer;position: relative;z-index: 998;">
                Genome Browser</div>
            </div>
            <div ref="xqcontent" class="content" v-loading='listLoading'>
              <listItem :items="proteinData" ref="listbox"></listItem>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-row v-show="floorLoading" class="floorLoadingbox">
      <el-col :span="5"> </el-col>
      <el-col :span="19">
        <div class="floorLoading">
          加载中...
        </div>
      </el-col>
    </el-row>
    <Bottom v-if="!listLoading" style="position: relative;"></Bottom>
  </div>
</template>

<script setup>
import Search from "./search.vue";
import { ref } from "vue";
import listItem from './listItem.vue'
import { getgeneData, getdiseaseData } from '@/api/data.js'
import bac from '@/assets/images/search/bac.png'
import Bottom from "@/layout/components/Bottom/index.vue"
import { useRouter } from 'vue-router'


const router = useRouter();
const appcontainer = ref(null)
const listbox = ref(null)
const listLoading = ref(false)
const xqcontent = ref(null)

const proteinData = ref([])
const protein_name = ref('')
const zwType = sessionStorage.getItem('zw1Type')
const floorLoading = ref(false)
const getproteinDataFun = () => {
  listLoading.value = true
  if (sessionStorage.getItem('zw1Type') == 'gene') {
    getgeneData(sessionStorage.getItem('gene_id')).then(res => {
      datafz(res.data)
      filterdata(res.data, 0)
      res.data.forEach(item => {
        if (item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5') {
          if (item.childList && item.childList.length) {
            item.show = filterdataShow(item.childList) ? true : false
          }
        }
      })
      protein_name.value = getName(res.data, 'symbol')
      proteinData.value = res.data
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } else if (sessionStorage.getItem('zw1Type') == 'disease') {
    getdiseaseData(sessionStorage.getItem('disease_id')).then(res => {
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
      protein_name.value = getName(res.data, 'Disease_Name')
      proteinData.value = res.data
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  } 

}
getproteinDataFun()
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


const openCytoscape = () => {
  proteinData.value.forEach(item => {
    
    
    if(item.dataType=='0'){
      if(item.childList&&item.childList.length){
        item.childList.forEach(val=>{
          if (val.showName == 'gene_biocyc_id') {
            if(val.fieldValue){
              //  const findidtext = val.fieldValue.indexOf('ECOCYC:')
              //  let searchid = ''
              //  const slicetext = val.fieldValue.slice(findidtext + 7, val.fieldValue.length)
              //  if (slicetext.indexOf(';') != -1) {
              //    searchid = slicetext.slice(0, slicetext.indexOf(';')).replace(/[\s;]+/g, '');
              //  } else {
              //    searchid = slicetext.replace(/[\s;]+/g, '')
              //  }
              sessionStorage.setItem('gene_searchId', val.fieldValue)
            }else{
              sessionStorage.setItem('gene_searchId', '')
            }
            // router.push({ path: '/cytoscape' })
          }
          if (val.showName == 'replicon') {
            if(val.fieldValue){
              sessionStorage.setItem('gene_replicon', val.fieldValue)
            }else{
              sessionStorage.setItem('gene_replicon', '')
            }
          }
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

.list {
  list-style: none;
  line-height: 20px;
  font-size: 12px;
  font-weight: 600;

  li {
    line-height: 25px;
    padding-left: 20px;
    cursor: pointer;
    position: relative;
  }

  .li_after {
    position: relative;
    color: var(--el-theme-color);
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

.no_click {
  color: #ccc;
}

.listLeft {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  width: 100%;
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