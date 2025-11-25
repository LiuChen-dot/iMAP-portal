<template>
  <div id="app1">
      <TreeChart :json="data" :class="{ landscape: 1 }" @click-node="clickNode" @click-open="clickOpen" />
      <!-- <div >
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import TreeChart from "./TreeChart.vue";
import { gettaxonomyData, getidtaxonomyData } from '@/api/data.js'
import router from '@/router'
const data = ref([])

const clickNode = (node) => {
  if (node.needClickToSelList) {
    sessionStorage.setItem('dataTypeAndTaxonomySpecies', node.dataTypeAndTaxonomySpecies || '')
    sessionStorage.setItem('speciesTaxId', node.speciesTaxId || '')
    router.go(0)
  }
}
const clickOpen = (node) => {
  getidtaxonomyData(node.id).then(res => {
    node.childList = res.data
  })
}


onMounted(() => {

  gettaxonomyData().then(res => {
    data.value = res.data
  })
})
</script>

<style scoped>
#app1 {
  font-size: 16px; 
  font-weight: bold;
  overflow: auto;
  height: calc(100vh - 190px);
  padding: 30px;
}
/* #app::-webkit-scrollbar {
    display: none; 
} */

#app1 .avat {
  border-radius: 2em;
  border-width: 2px;
}

#app1 .name {
  font-weight: 700;
}

#app1 .rootNode .name {
  color: red;
}

.foot {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #333;
  padding: 24px;
  overflow: hidden;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.foot a {
  color: #fff;
  margin: 0 .5em
}
</style>
