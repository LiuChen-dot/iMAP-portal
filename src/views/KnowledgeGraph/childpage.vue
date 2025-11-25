<template>
    <div style="width: 100%;height: 100%;">
        <div ref="myPage" style="height: 100%;" @click="isShowNodeMenuPanel = false">
            <RelationGraph ref="graphRef" :options="graphOptions">
                <template #node="{ node }">
                    <div>
                        <div style="height: 80px;display: flex;align-items: center;"
                            @contextmenu.prevent.stop="showNodeMenus(node, $event)">
                            <div class="c-my-rg-node"> {{ node.data.properties }}</div>
                        </div>

                    </div>
                </template>
            </RelationGraph>
        </div>
        <div v-show="isShowNodeMenuPanel"
            :style="{ left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }"
            style="z-index: 999;padding:10px;background-color: #ffffff;border:#eeeeee solid 1px;box-shadow: 0px 0px 8px #cccccc;position: absolute;border-radius: 10px;font-size: 15px;">
            <div v-for="item in showDatakeys" :key="item" style="padding: 5px 0;">
                <span class="showitem">{{ item }}:</span>
                {{
                    showData[item] || (i18n=='zh'?'无数据':'No data')
                }}
            </div>
            <div class="pad-t-10"><el-button @click="detailBtn" type="primary">{{i18n=='zh'?'查看更多':'more'}}</el-button></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import RelationGraph, { RGJsonData, RGNode, RGLine, RGLink, RGUserEvent, RelationGraphComponent } from 'relation-graph-vue3';
import { ElNotification } from "element-plus";
import { getGraph, findGraph, getSummary } from '@/api/KnowledgeGraph.js'
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)

const props = defineProps(['GraphList'])

const graphRef = ref<RelationGraphComponent>();
const isShowNodeMenuPanel = ref(false);
const currentNode = ref();
const myPage = ref();
const nodeMenuPanelPosition = ref({ x: 0, y: 0 });
const graphOptions = {
    allowSwitchLineShape: true,
    allowSwitchJunctionPoint: true,
    defaultJunctionPoint: 'border',
};

watch(() => props.GraphList, (item) => {
    let nodes = []
    let lines = []
    item.nodes.forEach(item => {
        nodes.push({
            id: item.id,
            text: item.properties.name,
            color: item.properties.color,
            data: {
                id: item.id,
                properties: item.properties.name,
                type: item.properties.type
            }
        })
    })
    item.edges.forEach(item => {
        lines.push({
            from: item.source,
            to: item.target,
            text: item.type,
            color: '#3885E4',
        })
    })

    const __graph_json_data = {
        rootId: 'a',
        nodes,
        lines
    }

    const graphInstance = graphRef.value!.getInstance();
    graphInstance.setJsonData(__graph_json_data).then(() => {
        graphInstance.moveToCenter();
        graphInstance.zoomToFit();
    });
})


const showData = ref(null)
const showDatakeys = ref([])
const showNodeMenus = (nodeObject: RGNode, $event: MouseEvent) => {
    isShowNodeMenuPanel.value = false;
    showData.value = null
    showDatakeys.value = []
    getSummary({ id: nodeObject.data.id, type: nodeObject.data.type }).then(res => {
        console.log(res, 'sadasd');
        showDatakeys.value = Object.keys(res.data)
        showData.value = res.data
        if (showDatakeys.value.length != 0) {
            console.log(showDatakeys.value, 'kkkkkkkkkkk');

            isShowNodeMenuPanel.value = true;
        } else {
            isShowNodeMenuPanel.value = false;

        }
    })

    currentNode.value = nodeObject;
    const _base_position = myPage.value.getBoundingClientRect();
    nodeMenuPanelPosition.value.x = $event.clientX - _base_position.x;
    nodeMenuPanelPosition.value.y = $event.clientY - _base_position.y;

};

const doAction = (actionName: string) => {
    ElNotification({
        title: 'Tip',
        message: 'Performed action ' + actionName + ' on node: ' + currentNode.value.text,
        type: 'success'
    });
    isShowNodeMenuPanel.value = false;
};

const detailBtn = () => {
    if (showData.value.type == 'protein') {
        sessionStorage.setItem('protein_id', showData.value.id)
        sessionStorage.setItem('zwType', showData.value.type)
        window.open('/protein', '_blank')
    } else if (showData.value.type == 'gene') {
        sessionStorage.setItem('zw1Type', showData.value.type)
        sessionStorage.setItem('gene_id', showData.value.id)
        window.open('/gene', '_blank')
    } else if (showData.value.type == 'rna') {
        sessionStorage.setItem('rna_id', showData.value.id)
        window.open('/rna', '_blank')
    } else if (showData.value.type == 'basic_information') {
        sessionStorage.setItem('basic_information_id', showData.value.id)
        sessionStorage.setItem('zwType', showData.value.type)
        window.open('/basic_information', '_blank')
    } else if (showData.value.type == 'disease') {
        sessionStorage.setItem('disease_id', showData.value.id)
        sessionStorage.setItem('zw1Type', showData.value.type)
        window.open('/disease', '_blank')
    } else if (showData.value.type == 'small_molecule') {
        sessionStorage.setItem('small_molecule_id', showData.value.id)
        sessionStorage.setItem('zw1Type', showData.value.type)
        window.open('/small_molecule', '_blank')
    }
};
</script>


<style lang="scss" scoped>
.c-my-rg-node {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.c-node-menu-item {
    line-height: 30px;
    padding-left: 10px;
    cursor: pointer;
    color: #444444;
    font-size: 14px;
    border-top: #efefef solid 1px;
}

.c-node-menu-item:hover {
    background-color: rgba(66, 187, 66, 0.2);
}

.showitem {
    display: inline-block;
    width: 120px;
    text-align: start;
    font-weight: bold;
}
</style>