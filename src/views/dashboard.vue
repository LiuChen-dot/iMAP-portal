<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据资产概览</span>
          <el-button class="pull-right" text>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="默认数据统计日期维昨日统计结果"
              placement="top-start"
            >
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>

            数据说明
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="4" :offset="i > 0 ? 1 : 0" v-for="(item, i) in dataList">
          <div class="dashboard-item pad-10">
            <div class="item-top dis-flex line">
              <div
                class="item-image w-70 h-70 text-center dis-flex align-c just-c-c"
              >
                <el-icon size="40" color="#fff"><Postcard /></el-icon>
              </div>
              <div class="item-name mar-l-10 dis-flex just-c-c">
                <span class="text-gray fts-14">
                  {{ item.title }}
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="默认数据统计日期维昨日统计结果"
                    placement="top-start"
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </span>
                <span class="text-black fts-24 mar-t-5"
                  >{{ item.value }}<span class="fts-14">{{item.unit}}</span></span
                >
              </div>
            </div>
            <div
              class="item-bottom dis-flex fts-14 just-c-sa mar-t-10 pad-t-10"
            >
              <span class=""
                >{{ item.description }}<span class="mar-l-10">{{item.addNum}}{{item.unit}}</span></span
              >
              <span class="">
                增长率
                <span v-if="item.percent > 0"
                  ><el-icon color="#F56C6C"><CaretTop /></el-icon
                ></span>
                <span v-else
                  ><el-icon color="#E6A23C"><CaretBottom /></el-icon
                ></span>
                <span>{{ item.percent }}%</span>
              </span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted } from "vue";
const dataList = ref([]);

onMounted(() => {
  
  
  // getAllocation().then(res=>{
  //   rwqztData.value = res.data
  //   rwqztStatChartFun();
  // })
});
</script>
<style lang="scss" scoped>
.dashboard-item {
  .item-image {
    border-radius: 50%;
    background: #409eff;
    flex: none;
  }
  .item-name {
    flex-direction: column;
  }
  .item-bottom {
    border-top: 1px solid #eee;
  }
}
</style>
