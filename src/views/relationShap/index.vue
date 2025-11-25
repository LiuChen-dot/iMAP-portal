<template>
  <div id="container" style="background-color:ghostwhite"></div>
</template>
<script setup>
import G6 from "@antv/g6";
import { DataDecision } from "@/api/relationShap";
const data = ref({});
const total = ref(0);
const loading = ref(false);
let graph = null;
/** 查询字典类型列表 */
function getDataList() {
  loading.value = true;
  DataDecision().then((response) => {
    data.value = response.data;
    total.value = response.total;
    loading.value = false;
    init();
    console.log(data.value, "=data.value");
    setTimeout(()=>{
        graph.updateLayout({
            type: 'grid',
        });
    },3000)
    setTimeout(()=>{
        graph.updateLayout({
            type: 'force',
        });
    },6000)
    
    setTimeout(()=>{
        graph.updateLayout({
            type: 'radial',
        });
    },9000)
    
    setTimeout(()=>{
        graph.updateLayout({
            type: 'concentric',
        });
    },12000)
    
  });
}
const init = () => {
  graph = new G6.Graph({
    container: "container", // String | HTMLElement，必须，在 Step 1 中创建的容器 id 或容器本身
    width: 1200, // Number，必须，图的宽度
    height: 600, // Number，必须，图的高度
    // linkCenter: true,
    layout: {
      type: 'circular',
    },
    animate: true,
    modes: {
        default: ['drag-canvas', 'drag-node', 'zoom-canvas'],
    },
  });
  graph.data(data.value); // 读取 Step 2 中的数据源到图上
  graph.render(); // 渲染图

  // 为图上的所有节点绑定点击监听
  graph.on("node:click", (evt) => {
    const item = evt.item; // 被操作的节点 item
    const target = evt.target; // 被操作的具体图形
    console.log(evt, "node:click====evt");
  });

  // 为画布绑定点击监听
  graph.on("click", (evt) => {
    console.log(evt, "click====evt");
  });
};

onMounted(() => {
  getDataList();
});
</script>
