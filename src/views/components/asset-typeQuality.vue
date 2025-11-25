<template>
  <div>
    <el-card class="box-card mar-t-10">
      <template #header>
        <div class="card-header">
          <span>资产类型质量</span>
          <el-button class="pull-right" text>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="基于昨日统计结果"
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
          <div class="sjlm_stat w-100p h-300" ref="sjlmStat"></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script setup>
import * as echarts from "echarts";
import { onMounted } from "vue";
import { getDataAssets, getAllocation } from "@/api/assets";
const rwqztStat = ref(null);
const rwqztData = ref([]);
const rwqztStatoption = {
  title: {
    text: "评分维度",
  },
  series: [
    {
      type: "gauge",
      startAngle: 200,
      endAngle: -20,
      
      radius: "80%",
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 16,
          color: [
            [0.25, "#FF6E76"],
            [0.5, "#FDDD60"],
            [0.75, "#58D9F9"],
            [1, "#7CFFB2"],
          ],
        },
      },
      pointer: {
        icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
        length: "12%",
        width: 20,
        offsetCenter: [0, "-60%"],
        itemStyle: {
          color: "#f00",
        },
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: "auto",
          width: 2,
        },
      },
      splitLine: {
        length: 20,
        lineStyle: {
          color: "auto",
          width: 5,
        },
      },
      axisLabel: {
        color: "#464646",
        fontSize: 14,
        distance: -40,
        rotate: "tangential",
      },
      title: {
        offsetCenter: [0, 0],
        fontSize: 12,
        color: "#464646",
      },
      detail: {
        fontSize: 16,
        offsetCenter: [0, "-15%"],
        valueAnimation: true,
        formatter: function (value) {
          return Math.round(value) + "";
        },
        color: "#f00",
      },
      data: [
        {
          value: 87,
          name: "结构化质量评分",
        },
      ],
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
    text: "各维度质量评分",
  },

  radar: {
    // shape: 'circle',
    indicator: [
      { name: "合规性", max: 6500 },
      { name: "一致性", max: 16000 },
      { name: "有效性", max: 30000 },
      { name: "完整性", max: 38000 },
      { name: "准确性", max: 52000 },
      { name: "唯一性", max: 52000 },
    ],
  },
  series: [
    {
      name: "业务表",
      type: "radar",
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000],
          name: "业务表",
        },
      ],
    },
  ],
};
const bjqsStatChartFun = () => {
  const bjqsStatChart = echarts.init(bjqsStat.value);
  bjqsStatChart.setOption(bjqsStatoption);
};

const sjlmStat = ref(null);
const sjlmStatoption = {
  xAxis: {
    // data:[0,400,800,1200,1600]
  },
  yAxis: {
    // data:[0,300,600,900,1200]
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['Evaporation', 'Precipitation', 'Temperature']
  },
  series: [
    {
      symbolSize: 40,
      name:'faf',
      data: [
        [788, 677]
      ],
      type: 'scatter'
    },
    {
      symbolSize: 20,
      data: [
        [875, 755],
      ],
      type: 'scatter'
    },
    {
      symbolSize: 20,
      data: [
        [175, 255],
      ],
      type: 'scatter'
    },
    {
      symbolSize: 20,
      data: [
        [275, 255],
      ],
      type: 'scatter'
    }
  ]
};
const sjlmStatChartFun = () => {
  const sjlmStatChart = echarts.init(sjlmStat.value);
  sjlmStatChart.setOption(sjlmStatoption);
};
onMounted(() => {
  bjqsStatChartFun();
  rwqztStatChartFun();
  sjlmStatChartFun();
  //   getAllocation().then((res) => {
  //     rwqztData.value = res.data;
  //     rwqztStatChartFun();
  //   });
});
</script>
<style lang="scss" scoped></style>
