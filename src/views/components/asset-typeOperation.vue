<template>
    <div>
<el-card class="box-card mar-t-10">
      <template #header>
        <div class="card-header">
          <span>数据资产类型运营</span>
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
        <el-col :span="8">
          <div
            class="rwqzt_stat w-100p h-300"
            ref="rwqztStat"
            style="width: 100%; height: 100%"
          ></div>
        </el-col>
        <el-col :span="8">
          <div class="bjqs_stat w-100p h-300" ref="bjqsStat"></div>
        </el-col>
        <el-col :span="8">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="type" label="资产类型" width="180" />
            <el-table-column
              prop="value"
              label="存在低于70分资产数"
              width="220"
            />
            <el-table-column label="操作">
              <template #default>
                <el-button link type="primary">详 情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>
    </div>
</template>
<script setup>
import * as echarts from "echarts";
import { onMounted } from "vue";
import {getDataAssets,getAllocation}from '@/api/assets'
const rwqztStat = ref(null);
const rwqztData = ref([]);
const rwqztStatoption = {
  title: {
    text: "资产分布",
    left: "left",
  },
  legend: {
    right: "5%",
    top: "center",
    orient: "vertical",
    formatter: function (name, value) {
      return name;
    },
  },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      center: ["35%", "50%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
      },
      emphasis: {
        disabled: false,
        scale: false,
        label: {
          show: false,
        },
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
  ],
};
const rwqztStatChartFun = () => {
  var total = 0;
  rwqztData.value.forEach((item) => {
    total = total + item.num;
  });
  var arr = rwqztData.value.map((item) => {
    var num = Math.floor((item.num / total) * 100) + "%";
    return {
      value: item.num,
      name: item.name + "  " + item.num + "台   " + num,
    };
  });
  rwqztStatoption.series[0].data = arr;
  const rwqztStatChart = echarts.init(rwqztStat.value);
  rwqztStatChart.setOption(rwqztStatoption);
};

const bjqsStat = ref(null);
const bjqsStatoption = {
  title: {
    text: "资产多维评分",
  },
  legend: {
    data: ["业务表", "标签", "指标"],
    right: "5%",
    top: "center",
    orient: "vertical",
  },
  radar: {
    // shape: 'circle',
    indicator: [
      { name: "质量", max: 6500 },
      { name: "实效", max: 16000 },
      { name: "落标", max: 30000 },
      { name: "安全", max: 38000 },
      { name: "应用", max: 52000 },
    ],
  },
  series: [
    {
      name: "业务表 vs 标签 vs 指标",
      type: "radar",
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000],
          name: "业务表",
        },
        {
          value: [5000, 14000, 28000, 26000, 42000],
          name: "标签",
        },
        {
          value: [2000, 5000, 22000, 16000, 22000],
          name: "指标",
        },
      ],
    },
  ],
};
const bjqsStatChartFun = () => {
  const bjqsStatChart = echarts.init(bjqsStat.value);
  bjqsStatChart.setOption(bjqsStatoption);
};
const tableData = [
  {
    value: "123",
    type: "指标",
  },
  {
    value: "41",
    type: "标签",
  },
  {
    value: "1",
    type: "业务表",
  },
  {
    value: "123",
    type: "数仓表",
  },
  {
    value: "123",
    type: "报表",
  },
  {
    value: "123",
    type: "API",
  },
  {
    value: "123",
    type: "标准",
  },
];
onMounted(() => {
  
  bjqsStatChartFun();
  getAllocation().then(res=>{
    rwqztData.value = res.data
    rwqztStatChartFun();
  })
});
</script>
<style lang="scss" scoped>

</style>