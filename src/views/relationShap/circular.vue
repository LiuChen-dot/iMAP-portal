<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>基本弧线图</span>
          </div>
          <div id="baseContainer" style="background-color: ghostwhite"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>环形弧线图</span>
          </div>
          <div id="circleContainer" style="background-color: ghostwhite"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import G6 from "@antv/g6";
import { DataCircular } from "@/api/relationShap";
const data = {};
const total = ref(0);
const loading = ref(false);
const colors = [
  "rgb(91, 143, 249)",
  "rgb(90, 216, 166)",
  "rgb(93, 112, 146)",
  "rgb(246, 189, 22)",
  "rgb(232, 104, 74)",
  "rgb(109, 200, 236)",
  "rgb(146, 112, 202)",
  "rgb(255, 157, 77)",
  "rgb(38, 154, 153)",
  "rgb(227, 137, 163)",
];
let graph = null;
/** 查询字典类型列表 */
function getDataList() {
  loading.value = true;
  DataCircular().then((response) => {
    data.value = response.data;
    total.value = response.total;
    loading.value = false;
    initBase();
    initCircle();
  });
}
function scaleNodeProp(nodes, propName, refPropName, dataRange, outRange) {
  const outLength = outRange[1] - outRange[0];
  const dataLength = dataRange[1] - dataRange[0];
  nodes.forEach(function (n) {
    n[propName] =
      ((n[refPropName] - dataRange[0]) * outLength) / dataLength + outRange[0];
  });
}
const initBase = () => {
    const width = baseContainer.scrollWidth;
    const height = baseContainer.scrollHeight || 500;
    const origin = [width / 2, height / 2];
    const radius = width < height ? width / 3 : height / 3;
    const edges = data.value.edges;
    const nodes = data.value.nodes;
    const nodeMap = new Map();
    const clusterMap = new Map();
    let clusterId = 0;
    const n = nodes.length;
    const angleSep = (Math.PI * 2) / n;
    nodes.forEach(function (node, i) {
      const angle = i * angleSep;
      node.x = radius * Math.cos(angle) + origin[0];
      node.y = radius * Math.sin(angle) + origin[1];
      node.angle = angle;
      nodeMap.set(node.id, node);
      // cluster
      if (node.cluster && clusterMap.get(node.cluster) === undefined) {
        clusterMap.set(node.cluster, clusterId);
        clusterId++;
      }
      const id = clusterMap.get(node.cluster);
      if (node.style) {
        node.style.fill = colors[id % colors.length];
      } else {
        node.style = {
          fill: colors[id % colors.length],
        };
      }
      // label
      node.label = node.name;
      node.labelCfg = {
        position: "center",
        style: {
          rotate: angle,
          rotateCenter: "lefttop",
          textAlign: "start",
        },
      };
    });
    edges.forEach((edge) => {
      edge.type = "quadratic";
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      edge.controlPoints = [
        {
          x: origin[0],
          y: origin[1],
        },
      ];
      edge.color = source.style.fill;
      edge.sourceName = source.name;
      edge.targetName = target.name;
    });

    // map the value to node size
    let maxValue = -9999,
      minValue = 9999;
    nodes.forEach(function (n) {
      if (maxValue < n.value) maxValue = n.value;
      if (minValue > n.value) minValue = n.value;
    });
    const sizeRange = [3, 30];
    const sizeDataRange = [minValue, maxValue];
    scaleNodeProp(nodes, "size", "value", sizeDataRange, sizeRange);
  graph = new G6.Graph({
    container: "baseContainer", // String | HTMLElement，必须，在 Step 1 中创建的容器 id 或容器本身
    width: 1200, // Number，必须，图的宽度
    height: 600, // Number，必须，图的高度
    linkCenter: true,
    modes: {
      default: [
        {
          type: "edge-tooltip",
          formatText: function formatText(model) {
            const text =
              "source: " +
              model.sourceName +
              "<br/> target: " +
              model.targetName;
            return text;
          },
        },
      ],
    },
    defaultNode: {
      style: {
        opacity: 0.8,
        lineWidth: 1,
        stroke: "#999",
      },
    },
    defaultEdge: {
      size: 1,
      color: "#e2e2e2",
      style: {
        opacity: 0.6,
        lineAppendWidth: 3,
      },
    },
  });
  graph.data(data.value); // 读取 Step 2 中的数据源到图上
  graph.render(); // 渲染图
  graph.on("edge:mouseenter", function (e) {
    const edge = e.item;
    graph.setItemState(edge, "hover", true);
  });
  graph.on("edge:mouseleave", function (e) {
    const edge = e.item;
    graph.setItemState(edge, "hover", false);
  });
};
const initCircle = () => {
    const width = circleContainer.scrollWidth;
    const height = circleContainer.scrollHeight || 500;
    const edges = data.value.edges;
    const nodes = data.value.nodes;
    const nodeMap = new Map();
    const clusterMap = new Map();
    let clusterId = 0;
    const n = nodes.length;
    const horiPadding = 10;
    const begin = [horiPadding, height * 0.7];
    const end = [width - horiPadding, height * 0.7];
    const xLength = end[0] - begin[0];
    const yLength = end[1] - begin[1];
    const xSep = xLength / n;
    const ySep = yLength / n;
    nodes.forEach(function (node, i) {
      node.x = begin[0] + i * xSep;
      node.y = begin[1] + i * ySep;
      nodeMap.set(node.id, node);
      // cluster
      if (node.cluster && clusterMap.get(node.cluster) === undefined) {
        clusterMap.set(node.cluster, clusterId);
        clusterId++;
      }
      const id = clusterMap.get(node.cluster);
      if (node.style) {
        node.style.fill = colors[id % colors.length];
      } else {
        node.style = {
          fill: colors[id % colors.length],
        };
      }
      // label
      node.label = node.name;
      node.labelCfg = {
        position: 'bottom',
        offset: 5,
        style: {
          rotate: Math.PI / 2,
          textAlign: 'start',
        },
      };
    });
    edges.forEach((edge) => {
      edge.type = 'arc';
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      const endsSepStep = (target.x - source.x) / xSep;
      const sign = endsSepStep < 0 ? -1 : 1;
      const curveOffset = sign * 10 * Math.ceil(Math.abs(endsSepStep));
      edge.curveOffset = curveOffset;
      edge.color = source.style.fill;
      edge.sourceName = source.name;
      edge.targetName = target.name;
    });

    // map the value to node size
    let maxValue = -9999,
      minValue = 9999;
    nodes.forEach(function (n) {
      if (maxValue < n.value) maxValue = n.value;
      if (minValue > n.value) minValue = n.value;
    });
    const sizeRange = [3, 25];
    const sizeDataRange = [minValue, maxValue];
    scaleNodeProp(nodes, "size", "value", sizeDataRange, sizeRange);
  graph = new G6.Graph({
    container: "circleContainer", // String | HTMLElement，必须，在 Step 1 中创建的容器 id 或容器本身
    width: 1200, // Number，必须，图的宽度
    height: 600, // Number，必须，图的高度
    linkCenter: true,
    modes: {
      default: [
        {
          type: "edge-tooltip",
          formatText: function formatText(model) {
            const text =
              "source: " +
              model.sourceName +
              "<br/> target: " +
              model.targetName;
            return text;
          },
        },
      ],
    },
    defaultNode: {
      style: {
        opacity: 0.8,
        lineWidth: 1,
        stroke: "#999",
      },
    },
    defaultEdge: {
      size: 1,
      color: "#e2e2e2",
      style: {
        opacity: 0.6,
        lineAppendWidth: 3,
      },
    },
  });
  graph.data(data.value); // 读取 Step 2 中的数据源到图上
  graph.render(); // 渲染图
  graph.on("edge:mouseenter", function (e) {
    const edge = e.item;
    graph.setItemState(edge, "hover", true);
  });
  graph.on("edge:mouseleave", function (e) {
    const edge = e.item;
    graph.setItemState(edge, "hover", false);
  });
};
onMounted(() => {
  getDataList();
});
</script>
