<template>
  <div class="app-container">
    <div style="position: relative;">
      <el-carousel style="" height="657px" arrow="always">
        <el-carousel-item v-for="(item, index) in banner" :key="index">
          <div class="w-100p h-100p">
            <img :src="item" alt="" class="w-100p h-100p">
          </div>
        </el-carousel-item>
      </el-carousel>
      <div style="position: absolute;z-index: 10;left: 50%;transform: translateX(-50%);top: 280px;">
        <Search />
      </div>
    </div>
    <div class="page_cont">
      <div class="statistics">
        <div class="statistics_list">
          <div class="statistics_Item" v-for="(item, index) in typeList" :key="index">
            <div :class="['statistics_box']" :title="item.showName">
              <div class="statistics_icon">
                <img style="width: 80px; height: 80px;" :class="[item.baseDataType]"/>
              </div>
              <div :style="item.dataCount != 0 || item.showName == 'taxonomy' ? '' : 'cursor: not-allowed;'"
                class="statistics_cont" @click="godetail(item)" >
                <p class="fts-22 text-w-700">{{ item.showName }}</p>
                <p class="fts-14 pad-t-8 pad-b-5" v-if="item.showName != 'taxonomy'">{{ item.dataCount == 0 ? '-' : item.dataCount }}</p>
                <p class="fts-14" v-if="item.showName != 'taxonomy'">{{ item.lastUpdateDate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Search from './Search/search.vue'
import { ref } from "vue";
import { formatDate } from '@/utils/index'
import { getsearchAggregation, platformAggregation } from '@/api/data.js'
import { useRoute, useRouter } from 'vue-router'
const routers = useRouter()

import banner1 from '../assets/images/banner1.jpg'
import banner2 from '../assets/images/banner2.jpg'
import banner3 from '../assets/images/banner3.jpg'


const banner = [banner1, banner2, banner3]

const searchValue = ref('')
const typeList = ref([])
const getsearchAggregationFun = () => {
  platformAggregation().then(res => {
    typeList.value = res.data.dataTypeAndDataSize
  })
  typeList.value = []

}
getsearchAggregationFun()
const godetail = (item) => {
  if (item.dataCount != 0 || item.showName == 'taxonomy') {
    //   if (item.showName == 'taxonomy') {
    //     routers.push({ path: '/treeChart' })
    //   } else {
    routers.push({ path: '/Search', query: { type: item.baseDataType } })
    //   }
  }
}
</script>

<style lang="scss" scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 500px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}

::v-deep(.el-carousel__arrow--left) {
  left: 13%;
}

::v-deep(.el-carousel__arrow--right) {
  right: 13%;
}

.statistics {
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  padding-top: 40px;

  .statistics_list {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    max-width: 1360px;
    margin: 0 auto;

    .statistics_Item {
      display: flex;
      width: 33.3%;
      min-width: 350px;
      align-items: center;
      justify-content: center;

      .statistics_box {
        width: 280px;
        height: 111px;
        display: flex;
        background: #F0F1F3;
        align-items: center;
        margin-bottom: 40px;
        box-shadow: 0 0.125rem 0.25rem 0.125rem rgba(22, 29, 57, 0.2);
        cursor: pointer;

        .statistics_icon {
          width: 80px;
          height: 80px;
          margin: 0 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .statistics_cont {
          display: flex;
          flex-direction: column;
          font-size: 20px;

          p {
            line-height: 21px;
            width: 160px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .statistics_box:hover {
        transform: scale(1.1);
        transition-duration: 0.3s;
        color: var(--el-theme-color);
      }

      .statistics_box img.Gene {
        content: url('../assets/images/Gene.png');
      }

      .statistics_box img.Protein {
        content: url('../assets/images/Protein.png');
      }

      .statistics_box img.taxonomy {
        content: url('../assets/images/taxonomy.png');
      }

      .statistics_box img.RNA {
        content: url('../assets/images/RNA.png');
      }

      .statistics_box img.small_molecule {
        content: url('../assets/images/small_molecule.png');
      }

      .statistics_box img.disease {
        content: url('../assets/images/disease.png');
      }

      .statistics_box img.basic_information {
        content: url('../assets/images/basic_information.png');
      }
    }
  }
}
</style>