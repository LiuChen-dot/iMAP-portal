<template>
  <div style="width: 100%;height: 100%;background-color: white;position: relative;">
    <div ref="neo4j" id="neo4jd3" style="width: 100%;height: 100%;"></div>
    <div v-show="loading || !isshow"
      style="width: 100%;height: 100%;position: absolute;top: 0;background-color: white;">
      <div v-show="loading">
        <el-empty>
          <template #description>
            <div class="dis-flex align-c text-666">
              {{i18n=='zh'?'加载中':'loading'}}
              <el-icon class="animationIcon">
                <Loading />
              </el-icon>
            </div>
          </template>
        </el-empty>
      </div>
      <div v-show="!isshow && !loading">
        <el-empty :description="$t(`common.nodata`)" />
      </div>
    </div>
    <div v-show="isShowNodeMenuPanel"
      :style="{ left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }"
      style="z-index: 999;padding:10px;padding-right: 30px;background-color: #ffffff;border:#eeeeee solid 1px;box-shadow: 0px 0px 8px #cccccc;position: absolute;border-radius: 10px;font-size: 15px;">
      <div @click="isShowNodeMenuPanel = false" style="position: absolute;right: 10px;font-size: 20px;"><el-icon>
          <CloseBold />
        </el-icon></div>
      <div v-for="item in showDatakeys" :key="item">
        <div v-if="showData[item]" style="padding: 5px 0;">
          <span class="showitem">{{ item }}:</span>
          {{
            showData[item]
          }}
        </div>
      </div>
      <div class="pad-t-10"><el-button @click="detailBtn" type="primary" size="small">{{i18n=='zh'?'查看更多':'more'}}</el-button></div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import neo4jData2 from './neo4jData'
import { getSummary } from '@/api/KnowledgeGraph.js'
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
const props = defineProps(['GraphList', 'loading'])
const isshow = ref(false)
const isShowNodeMenuPanel = ref(false);
const nodeMenuPanelPosition = ref({ x: 0, y: 0 });
const showData = ref(null)
const showDatakeys = ref([])
const showitem = ref(null)
const neo4j = ref()
const neo4jData = reactive({
  results: [
    {
      data: [
        {
          graph: {
            nodes: [],
            relationships: [],
          },
        },
      ],
    },
  ],
  errors: [],
})

function init() {
  new Neo4jd3("#neo4jd3", {
    minCollision: 60,
    neo4jData: neo4jData,
    onNodeDragStart: (node, event) => {
      isShowNodeMenuPanel.value = false
    }
  });
}

const detailBtn = () => {
  if (showitem.value.type == 'Protein') {
    sessionStorage.setItem('protein_id', showitem.value.id)
    sessionStorage.setItem('zwType', showitem.value.type)
    window.open('/protein', '_blank')
  } else if (showitem.value.type == 'Gene') {
    sessionStorage.setItem('gene_id', showitem.value.id)
    sessionStorage.setItem('zw1Type', showitem.value.type)
    window.open('/gene', '_blank')
  } else if (showitem.value.type == 'RNA') {
    sessionStorage.setItem('rna_id', showitem.value.id)
    sessionStorage.setItem('zwType', showitem.value.type)
    window.open('/rna', '_blank')
  } else if (showitem.value.type == 'basic_information') {
    sessionStorage.setItem('basic_information_id', showitem.value.id)
    sessionStorage.setItem('zwType', showitem.value.type)
    window.open('/basic_information', '_blank')
  } else if (showitem.value.type == 'disease') {
    sessionStorage.setItem('disease_id', showitem.value.id)
    sessionStorage.setItem('zwType', showitem.value.type)
    window.open('/disease', '_blank')
  } else if (showitem.value.type == 'small_molecule') {
    sessionStorage.setItem('small_molecule_id', showitem.value.id)
    sessionStorage.setItem('zw1Type', showitem.value.type)
    window.open('/small_molecule', '_blank')
  }else if (showitem.value.type == 'go_terms') {
    sessionStorage.setItem('go_terms_id', showitem.value.id)
    sessionStorage.setItem('zwType', showitem.value.type)
    window.open('/go_terms', '_blank')
  }
};

const showDialog = (event, nodeitem = {}) => {
  event.preventDefault()
  isShowNodeMenuPanel.value = true;
  showData.value = null
  showDatakeys.value = []
  getSummary({ id: nodeitem.properties.nodeId, type: nodeitem.properties.type }).then(res => {
    showDatakeys.value = Object.keys(res.data)
    showData.value = res.data
    showitem.value = res.data
    if (showDatakeys.value.length != 0) {
      isShowNodeMenuPanel.value = true;
    } else {
      isShowNodeMenuPanel.value = false;
    }
  })
  const _base_position = neo4j.value.getBoundingClientRect();
  nodeMenuPanelPosition.value.x = event.clientX - _base_position.x;
  nodeMenuPanelPosition.value.y = event.clientY - _base_position.y;

}

watch(() => props.GraphList, (item) => {
  isShowNodeMenuPanel.value = false
  neo4jData.results[0].data[0].graph.nodes = []
  neo4jData.results[0].data[0].graph.relationships = []
  item.nodes.forEach(item => {
    neo4jData.results[0].data[0].graph.nodes.push(
      {
        id: item.id,
        labels: [item.properties.name],
        color: item.properties.color,
        properties: {
          type: item.properties.type,
          nodeId: item.properties.nodeId,
        },
      },
    )
  })
  item.edges.forEach(item => {
    neo4jData.results[0].data[0].graph.relationships.push(
      {
        id: item.type,
        type: item.type,
        startNode: item.source,
        endNode: item.target,
        properties: {
          from: item.type,
        },
      },
    )
  })
  if (neo4jData.results[0].data[0].graph.nodes.length > 0) {
    isshow.value = true
  } else {
    isshow.value = false
  }
  init()
  const circle = document.querySelectorAll('circle')
  circle.forEach(item => {
    item.style.stroke = ''
    if (item.className.baseVal == 'outline') {

      const match = item.querySelector('title').innerHTML.match(/id&gt;\:\s*([a-zA-Z0-9_]+)(?=\,)/);
      if (match) {
        const extractedId = match[1];
        neo4jData.results[0].data[0].graph.nodes.forEach(nodeitem => {
          if (extractedId == nodeitem.id) {
            item.style.fill = nodeitem.color
            var text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            let textValue = ''
            if (nodeitem.labels[0].length > 6) {
              textValue = `${nodeitem.labels[0].slice(0, 6)}...`
            } else {
              textValue = nodeitem.labels[0]
            }
            text.textContent = textValue;
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', 'black');
            item.parentNode.appendChild(text);
            text.addEventListener('contextmenu', (event) => { showDialog(event, nodeitem) })
            item.addEventListener('contextmenu', (event) => { showDialog(event, nodeitem) })
          }
        })
      }
    }
  })

})


onMounted(() => {
  // init()
})
</script>
<style lang="scss" scoped>
:deep(.node .outline) {
  stroke: none;
}

:deep(.neo4jd3-info) {
  display: none;
}

.animationIcon {
  font-size: 18px;
  animation: rotateAnimation 1s linear infinite;
}

@keyframes rotateAnimation {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>