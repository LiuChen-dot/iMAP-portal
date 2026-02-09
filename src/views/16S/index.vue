<template>
  <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
    <div class="box">
      <div class="navigatebox">
        <div v-for="(item, index) in tabList" :key="index" @click="handleClick(item)"
          :class="activeName == item.dictValue ? 'active' : ''">
          {{ i18n == 'zh' ? item.dictLabel : item.remark }}
        </div>
        <div @click="exportReport()">{{ i18n == 'zh' ? '导出测序报告' : 'Export Test Report' }}</div>
      </div>
      <div class="content">
        <div class="list" v-if="contentList.length">
          <div v-for="(item, index) in contentList" :key="index" @click="go16sdetails(item)" class="contentItem">
            <div>
              <img :src="iconList[`icon${item.scriptsId}`]">
            </div>
            <div @click="go16sdetails(item)">
              <div>{{ i18n == 'zh' ? item.scriptsName : item.scriptsNameEn }}</div>
              <div>{{ item.text || '' }}</div>
            </div>
          </div>
        </div>
        <div class="overview" v-else>
          <div class="overview-inner">
            <!-- 整体介绍 -->
            <section class="overview-section">
              <h2 class="overview-title">{{ $t('sixteensHome.ztjs') }}</h2>
              <p class="overview-desc">{{ $t('sixteensHome.ztjstext') }}</p>
              <p class="overview-desc">{{ $t('sixteensHome.ztjstext2') }}</p>
            </section>
            <!-- 产品介绍 -->
            <section class="overview-section">
              <h2 class="overview-title">{{ $t('sixteensHome.cpjs') }}</h2>
              <p class="overview-desc">{{ $t('sixteensHome.cpjstext') }}</p>
            </section>
            <!-- 一站式解决方案 -->
            <section class="overview-section">
              <h2 class="overview-title">{{ $t('sixteensHome.yzsjjfa') }}</h2>
              <p class="overview-desc">{{ $t('sixteensHome.yzsjjfatext') }}</p>
            </section>
            <!-- 两列小标题区块 -->
            <div class="overview-grid">
              <section class="overview-section overview-card">
                <h3 class="overview-subtitle">{{ $t('sixteensHome.sxdz') }}</h3>
                <p class="overview-desc">{{ $t('sixteensHome.sxdztext') }}</p>
              </section>
              <section class="overview-section overview-card">
                <h3 class="overview-subtitle">{{ $t('sixteensHome.zlxl') }}</h3>
                <p class="overview-desc">{{ $t('sixteensHome.zlxltext') }}</p>
              </section>
            </div>
            <!-- 作图插件 -->
            <section class="overview-section">
              <h2 class="overview-title">{{ $t('sixteensHome.ztcj') }}</h2>
              <p class="overview-desc">{{ $t('sixteensHome.ztcjtext') }}</p>
              <p class="overview-desc">{{ $t('sixteensHome.ztcjtext2') }}</p>
            </section>
            <!-- 产品优势 -->
            <section class="overview-section overview-advantage">
              <h2 class="overview-title">{{ $t('sixteensHome.cpys') }}</h2>
              <p class="overview-desc overview-intro">{{ $t('sixteensHome.cpystext') }}</p>
              <ul class="overview-list">
                <li>{{ $t('sixteensHome.cpystext1') }}</li>
                <li>{{ $t('sixteensHome.cpystext2') }}</li>
                <li>{{ $t('sixteensHome.cpystext3') }}</li>
                <li>{{ $t('sixteensHome.cpystext4') }}</li>
                <li>{{ $t('sixteensHome.cpystext5') }}</li>
                <li>{{ $t('sixteensHome.cpystext6') }}</li>
              </ul>
            </section>
            <!-- 分析流程 -->
            <section class="overview-section overview-flow">
              <h2 class="overview-title">{{ $t('sixteensHome.fxlc') }}</h2>
              <div class="overview-image-wrap">
                <img src="../../assets/images/16s/fxlczh.png" alt="" v-if="i18n=='zh'">
                <img src="../../assets/images/16s/fxlcen.png" alt="" v-else>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <Bottom style="position: relative;"></Bottom>
  </div>
</template>

<script setup>
import { listData, list } from "@/api/16S";
import { computed, onMounted, reactive, ref, watch } from 'vue';
import router from '@/router'
import Bottom from "@/layout/components/Bottom/index.vue"
import { ElMessage } from "element-plus";
import { getToken } from '@/utils/auth'
import { useLanguageStore } from '@/store/modules/language';
const languageStore = useLanguageStore()
import img1 from '@/assets/images/16s/1.png'
import img2 from '@/assets/images/16s/2.png'
import img3 from '@/assets/images/16s/3.png'
import img4 from '@/assets/images/16s/4.png'
import img5 from '@/assets/images/16s/5.png'
import img6 from '@/assets/images/16s/6.png'
import img7 from '@/assets/images/16s/7.png'
import img8 from '@/assets/images/16s/8.png'
import img9 from '@/assets/images/16s/9.png'
import img10 from '@/assets/images/16s/10.png'
import img11 from '@/assets/images/16s/11.png'
import img12 from '@/assets/images/16s/12.png'
import img13 from '@/assets/images/16s/13.png'
import img14 from '@/assets/images/16s/14.png'
import img15 from '@/assets/images/16s/15.png'
import img16 from '@/assets/images/16s/16.png'
import img17 from '@/assets/images/16s/17.png'
import img18 from '@/assets/images/16s/18.png'
import img19 from '@/assets/images/16s/19.png'
import img20 from '@/assets/images/16s/20.png'
import img21 from '@/assets/images/16s/21.png'
import img22 from '@/assets/images/16s/22.png'
import img23 from '@/assets/images/16s/23.jpg'
import img24 from '@/assets/images/16s/24.png'
import img25 from '@/assets/images/16s/default.png'
import img26 from '@/assets/images/16s/26.png'

const iconList = {
  icon1: img1,
  icon2: img2,
  icon3: img3,
  icon4: img4,
  icon5: img5,
  icon6: img6,
  icon7: img7,
  icon8: img8,
  icon9: img9,
  icon10: img10,
  icon11: img11,
  icon12: img12,
  icon13: img13,
  icon14: img14,
  icon15: img15,
  icon16: img16,
  icon17: img17,
  icon18: img18,
  icon19: img19,
  icon20: img20,
  icon21: img21,
  icon22: img22,
  icon23: img23,
  icon24: img24,
  icon25: img25,
  icon26: img26,
}
const i18n = computed(() => languageStore.i18n)
watch(i18n, () => {
  console.log('中英文', i18n.value);
})
const activeName = ref(0)
const scriptsName = ref('')
const tabList = ref([

])

const contentList = ref([
])
const handleClick = (val) => {
  activeName.value = val.dictValue
  sessionStorage.setItem('16sactiveName', `${activeName.value}`)
  scriptsName.value = i18n.value == 'zh' ? val.dictLabel : val.remark
  sessionStorage.setItem('scriptsName', val.dictLabel)
  sessionStorage.setItem('scriptsNameEn', val.remark)
  getlist(val.dictValue)
}

const go16sdetails = (item) => {
  localStorage.setItem('16simgurl', item.iconBase64 ? item.iconBase64 : '')
  sessionStorage.setItem('scriptsId', item.scriptsId)
  router.push('/taskupload')
}

const getlist = (type) => {
  list({ type }).then(res => {
    contentList.value = res.rows
  })
}
const exportReport = async () => {
      try {
        // 发起请求
        const response = await fetch(import.meta.env.VITE_APP_BASE_API + "/atlas/taskAttachment/export", {
            method: "GET",
            headers: {
                // 根据后端要求设置请求头
                "Content-Type": "application/json",
                Authorization: "Bearer "+getToken(),
            },
        });
        console.log(response);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        // 获取文件流数据
        const blob = await response.blob();
        console.log(blob);
        if(blob.size==0){
            ElMessage.error(i18n.value == 'zh' ? '文件无内容': 'File content is empty')
            return;
        }
        // 获取文件名（从响应头中获取，如果没有则使用默认值）
        const fileName = '测序报告.pdf';
        // 创建下载链接
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName; // 设置下载文件名
        a.click(); // 触发下载
        a.remove(); // 清理元素
        URL.revokeObjectURL(downloadUrl); // 释放对象URL
    } catch (error) {
        console.error("Error downloading file:", error);
    }
  // taskAttachmentexport().then(res=>{

  // })
}
onMounted(() => {
  listData({ dictType: 'atlas_script_type' }).then(res => {
    tabList.value = res.rows
    if (sessionStorage.getItem('16sactiveName') || '') {
      activeName.value = sessionStorage.getItem('16sactiveName')
    } else {
      activeName.value = res.rows[0].dictValue
      sessionStorage.setItem('16sactiveName', `${activeName.value}`)
    }
    var obj=tabList.value.find(item => item.dictValue == activeName.value)
    scriptsName.value = i18n.value == 'zh'?obj.dictLabel:obj.remark
    sessionStorage.setItem('scriptsName', obj.dictLabel)
    sessionStorage.setItem('scriptsNameEn', obj.remark)
    getlist(activeName.value)
  });
})
</script>

<style lang="scss" scoped>
li{
  list-style: none;
}
:deep(.el-tabs__item) {
  font-size: 20px;
}

:deep(.el-tabs__header) {
  display: flex;
  justify-content: center;
}

.box {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 32px;
  background-color: #F7F7F7;
  display: flex;
  gap: 20px;
  min-height: 100%;

  .navigatebox {
    flex-shrink: 0;
    text-align: center;
    font-size: 14px;

    &>div {
      background-color: white;
      margin-bottom: 10px;
      border-radius: 4px;
      width: 200px;
      padding: 11px 0;
      color: var(--el-theme-color);
      cursor: pointer;
    }

    .active {
      background-color: var(--el-theme-color);
      color: white;
    }
  }

  .content {
    flex: 1;
    min-width: 0;
    background-color: white;
    min-height: 100%;
    .list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-self: flex-start;
      padding: 32px;
      gap: 20px;

      .contentItem {
        display: flex;
        align-items: center;
        padding: 40px 24px;
        background-color: #F7F7F7;
        border-radius: 4px;
        cursor: pointer;

        &>div:first-child {
          margin-right: 12px;

          img {
            width: 68px;
            height: 68px;
            border-radius: 50%;
          }
        }

        &>div:last-child {

          &>div:first-child {
            font-size: 16px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          &>div:last-child {
            font-size: 15px;
            color: gray;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
          }
        }
      }
    }

    .overview {
      padding: 28px 32px 40px;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .overview-inner {
      width: 100%;
      max-width: min(1200px, 100%);
      margin: 0 auto;
    }

    .overview-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .overview-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 14px 0;
      padding-left: 10px;
      border-left: 4px solid var(--el-theme-color);
      line-height: 1.4;
    }

    .overview-subtitle {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }

    .overview-desc {
      font-size: 15px;
      color: #555;
      line-height: 1.75;
      margin: 0 0 12px 0;
      text-align: justify;

      &:last-of-type {
        margin-bottom: 0;
      }
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .overview-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 0;
    }

    .overview-advantage .overview-intro {
      margin-bottom: 16px;
    }

    .overview-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        position: relative;
        font-size: 15px;
        color: #555;
        line-height: 1.75;
        padding-left: 20px;
        margin-bottom: 10px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--el-theme-color);
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .overview-flow .overview-title {
      margin-bottom: 16px;
    }

    .overview-image-wrap {
      border-radius: 8px;
      overflow: hidden;
      background: #f8f9fa;

      img {
        display: block;
        width: 100%;
        height: auto;
      }
    }

    @media (max-width: 768px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }
    }
  }


  .tabsbox {
    padding: 20px 70px;

    .topSearch {
      display: flex;
      align-items: center;

      &>div:first-child {
        flex: 1;
        display: flex;
        align-items: center;
        border: 1px solid gray;
        border-radius: 30px;
        padding: 3px 10px;
        box-shadow: 1px 3px 5px gainsboro;
        background-color: white;

        :deep(.el-input__wrapper) {
          box-shadow: none
        }

        .el-button {
          background-color: white;
          border-radius: 0;
          border-left: 1px solid gray;
        }
      }

      &>div:last-child {
        flex: 3;
        font-size: 13px;
        color: gray;
        font-weight: 1000;
        display: flex;
        align-items: center;
        margin: 0 30px;

        &>div:first-child {
          flex: 1;
        }

        &>div:last-child {
          flex: 8;

          span {
            display: inline-block;
            padding: 0 10px;
          }
        }
      }
    }


  }
}
</style>