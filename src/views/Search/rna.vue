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
            <div style="margin-top: 20px;">
              <div style="display: flex;align-items: center;justify-content: space-between;">
                <h1 class="text-w-600 fts-40 pad-b-30"
                  style="font-family: 'Source Sans Pro', sans-serif;color:var(--el-theme-color);position: relative;z-index: 998;">
                  {{ protein_name }}</h1>
              </div>
              <div class="content" v-loading='listLoading'>
                <ul class="lis1 pad-15" style="position: relative;z-index: 998;">
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
                      <!-- <span :id="item.dename" ></span> -->
                      <ul v-if="item.childList && item.childList.length">
                        <li v-for="(val, ind) in item.childList" :key="ind" v-show="!val.show">
                          <template v-if="val.dataType == '10'">
                            <p class="p_box" v-if="val.childList && val.childList.length">
                              <span class="lable3 text-w-600 pad-l-15">{{ capitalizeFirstLetter(val.childList[0].showName) }}</span>
                              <b class="b"></b>
                              <el-button type="primary" size="small" @click="godetail(val.childList[1],val.childList[0])">{{ val.childList[0].fieldValue }}</el-button>
                            </p>
                          </template>
                          <template v-else>
                            <p class="p_box">
                              <span class="lable3 text-w-600 pad-l-15">{{ capitalizeFirstLetter(val.showName) }}</span>
                              <b v-if="val.dataType != '0'" class="b"></b>
                              <span :style="val.url ? 'color: blue;cursor: pointer;' : ''" @click="gobasic(val)"
                                class="span_value" v-if="val.dataType != '0'"
                                v-html="val.fieldValue ? getLink(val) : ''"></span>
                            </p>
                          </template>
                        </li>
                      </ul>
                    </li>
                  </template>
                </ul>
              </div>
            </div>

          </el-col>
        </el-row>
    </el-card>
    <el-dialog :title="i18n=='zh'?'文本':'Text'" v-model="dialogVisible" width="80%" modal-class="dialogBox"  class="max-h-80p" >
      <div class="fl-1 dis-flex flex-d ov-h">
        <div class="fl-1 ov-h ov-y-a">
          {{ dialogContent }}
        </div>
        <div class="dis-flex just-c-fe mar-t-10">
          <el-button type="primary" size="small" @click="downloadText()">{{i18n=='zh'?'下载':'Download'}}</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import Search from "./search.vue";
import { nextTick, reactive, ref } from "vue";
import listItem from './listItem.vue'
import { getrnaData,getsmallMoleculeData } from '@/api/data.js'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/store/modules/language';
import bac from '@/assets/images/search/bac.png'

const router = useRouter();
const route = useRoute();
const listLoading = ref(false)
const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)

const proteinData = ref([])
const lis_ind = ref(0)
const protein_name = ref('')

const dialogVisible = ref(false)
const dialogContent = ref('')
const contentName = ref('')

const proteinleftTitle = ref([])

const getrnaDataFun = async () => {
  listLoading.value = true
  if (sessionStorage.getItem('zw1Type') == 'rna') {
    var res=await getrnaData(sessionStorage.getItem('rna_id'))
    protein_name.value = res.data.find(val => val.showName == 'RNA name' || val.showName == 'RNA_name').fieldValue
    res.data.forEach(item => {
      item.dename = item.showName
      item.showName = item.showName.split('_').join(' ')
      item.showNameNew = item.showName.split('_').join(' ')
      if (item.childList && item.childList.length) {
        item.childList.forEach(val => {
          if(val.dataType=='10'){
            var flag=true
            if(val.childList && val.childList.length){
              flag=val.childList.findIndex(s=>!s.fieldValue)>-1?true:false
            }else{
              flag=true
            }
            val.show = flag
          }else{
            val.dename = val.showName
            val.showName = val.showName.split('_').join(' ')
            if (val.childList && val.childList.length) {
              val.show = val.childList.findIndex(s => s.fieldValue) > -1 ? false : true;
              val.childList.forEach(val => {
                val.show = val.fieldValue ? false : true
              })
            } else {
              val.show = val.fieldValue ? false : true
            }
          }
          item.show = item.childList.findIndex(val => !val.show) > -1 ? false : true;
        })
      } else {
        item.show = item.fieldValue ? false : true
        // getSvg(item)
      }
    })
    proteinleftTitle.value = res.data
    proteinData.value = res.data
    listLoading.value = false
  } else if (sessionStorage.getItem('zw1Type') == 'small_molecule') {
    getsmallMoleculeData(sessionStorage.getItem('small_molecule_id')).then(res => {
      protein_name.value = res.data.find(val => val.showName == 'Main Name' || val.showName == 'Main_Name').fieldValue
      res.data.forEach(item => {
        item.showName = item.showName.split('_').join(' ')
      item.showNameNew = item.showName.split('_').join(' ')
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
      proteinleftTitle.value = res.data
      proteinData.value = res.data
      listLoading.value = false
    }).catch(() => {
      listLoading.value = false
    })
  }
}
getrnaDataFun()

const godetail = (item,val) => {
  dialogVisible.value = true
  dialogContent.value = item.fieldValue
  contentName.value = val.fieldValue
}

const downloadText = () => {
  // 创建一个 Blob 对象，指定类型为 text/plain
  const blob = new Blob([dialogContent.value], { type: "text/plain;charset=utf-8"});

  // 创建一个下载链接
  const link = document.createElement("a");

  // 使用 URL.createObjectURL 创建一个指向 Blob 的 URL
  link.href = URL.createObjectURL(blob);

  // 设置下载文件的名称
  link.download = contentName.value?contentName.value+'.txt':'download.txt';

  // 触发点击事件以下载文件
  document.body.appendChild(link);
  link.click();

  // 下载完成后移除链接并释放 URL 对象
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
const getSvg = async (item) => {
  const response = await fetch('/src/assets/images/RF00003.xml');
  const text = await response.text(); // 获取 XML 文件的文本内容
  console.log(text)
  nextTick(() => {
    if(document.getElementById(item.dename)){
      document.getElementById(item.dename).innerHTML = text
    }
  })
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
const listClick = (ind) => {
  lis_ind.value = ind
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