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
          <el-col :span="5">
            <ul class="list ov-h" ref="listtype">
              <li v-show="item.dataType == '0' || (item.dataType == '2'|| item.dataType == '6'|| item.dataType == '5')"
                :class="[lis_ind == index ? 'li_after' : '', !item.show && item.childList ? '' : 'no_click', 'w-100p', 'ov-h']"
                v-for="(item, index) in proteinleftTitle" :key="index" @click='listClick(index, item)'>
                <span class="listLeft">{{ capitalizeFirstLetter(item.showNameNew) }}</span>
                <div
                  :style="`${index == 0 || index == proteinleftTitle.length - 1 ? 'border-radius: 2px' : ''};${index == proteinleftTitle.length - 1 ? 'height:75%' : ''}`"
                  class="leftline"></div>
                <div class="showleftline" v-show="lis_ind == index"></div>
              </li>
            </ul>
          </el-col>
          <el-col :span="19">
            <div style="display: flex;align-items: center;justify-content: space-between;">
              <h1 class="text-w-600 fts-20 pad-b-10"
                style="font-family: 'Source Sans Pro', sans-serif;color:var(--el-theme-color);" v-html="protein_name">
              </h1>
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
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import listItem from './listItem.vue'
import { getproteinData, getBasicInformationData,getGoData,getsmallMoleculeData,getrnaData } from '@/api/data.js'
import { useRoute, useRouter } from 'vue-router'
import { dataType } from "element-plus/es/components/table-v2/src/common";
import { connect } from "echarts";
import bac from '@/assets/images/search/bac.png'
import Bottom from "@/layout/components/Bottom/index.vue"


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
const protein_name = ref('')
const floorLoading = ref(false)
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
const listClick = (ind, e) => {
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
      appcontainer.value.scrollTop = listbox.value.$el.children[ind].offsetTop
    }
  }, 0);
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

  if (event.target.scrollTop > 150) {
    listtype.value.style.width = '19%'
    listtype.value.style.position = 'fixed'
    listtype.value.style.top = '80px'
  } else {
    listtype.value.style.width = '100%'
    listtype.value.style.position = 'static'
  }
  if (isScrollingFromClick.value) {
    isScrollingFromClick.value = false;
    return;
  }
  var ind = [...listbox.value.$el.children].findIndex(val => val.offsetTop > event.target.scrollTop - val.offsetHeight + 300)
  lis_ind.value = ind

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