<template>
    <div>
<el-card class="box-card mar-t-10">
      <template #header>
        <div class="card-header">
          <span>资产趋势</span>
          <el-radio-group v-model="rangeTime" class="pull-right">
            <el-radio-button label="最近七天" />
            <el-radio-button label="最近30天" />
            <el-radio-button label="最近半年" />
            <el-radio-button label="最近一年" />
          </el-radio-group>
        </div>
      </template>
      <div
        class="rwqzt_stat w-100p h-300"
        ref="assetScore"
        style="width: 100%; height: 100%"
      ></div>
    </el-card>
    </div>
</template>
<script setup>
import * as echarts from "echarts";
import { onMounted } from "vue";
const rangeTime = ref('最近七天')
const assetScore = ref(null);
const assetScoreoption = {
  title: {
    text: '资产评分趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['应用', '质量', '安全']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '应用',
      type: 'line',
      stack: 'Total',
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: '质量',
      type: 'line',
      stack: 'Total',
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: '安全',
      type: 'line',
      stack: 'Total',
      data: [150, 232, 201, 154, 190, 330, 410]
    }
  ]
};
const assetScoreChartFun = () => {
  const assetScoreChart = echarts.init(assetScore.value);
  assetScoreChart.setOption(assetScoreoption);
};
onMounted(() => {
  
  assetScoreChartFun();
});
</script>
<style lang="scss" scoped>

</style>