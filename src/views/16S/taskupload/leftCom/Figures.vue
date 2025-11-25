<template>
    <div class="box">
        <div class="mar-t-10" style="height: 650px;overflow: auto;text-align: center;">
            <div v-if="imageList.length">
                <div v-for="(item, index) in imageList" :key="index">
                    <div class="fts-18 pad-t-20 pad-b-20" style="font-weight: bold;">{{ item.title }}</div>
                    <img style="width: 60%;" :src="`data:image/png;base64,${item.base64}`" alt="Base64 Image" v-if="item.type=='png'">
                    <table v-if="item.type=='tsv'">
                        <thead>
                            <tr>
                                <th v-for="(header, index) in getTsv(item.base64)[0]" :key="index" class="table-cell">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIndex) in getTsv(item.base64).slice(1)" :key="rowIndex" v-show="row.findIndex(cell => cell !== '')!=-1">
                                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="table-cell" >{{ cell }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div  v-if="item.type=='pdf'">
                        <vue-pdf-embed ref="pdfBox" :source="getPdf(item.base64)" class="vue-pdf-embed" />
                    </div>
                </div>
            </div>
            <div v-else>
                <el-empty :description="$t(`common.nodata`)" />
            </div>
            <div class="dis-flex just-c-c mar-t-30">
                <div class="w-50p dis-flex flex-d align-fs">
                    <div v-for="(item,index) in simpleLogArr" :key="index" class="fts-14 mar-b-10">{{ formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss') }}：{{ item.processName }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { formatDate } from '@/utils/index'
import VuePdfEmbed from "vue-pdf-embed";

const props = defineProps(['imageList','simpleLogArr'])
const simpleLogArr=ref([])
watch(() => props.simpleLogArr, (newValue) => {
    simpleLogArr.value=JSON.parse(newValue)
})

const getTsv= (base64) => {
    if (!base64) {
        return [];
    }
    const decodedData = atob(base64);
    if(decodedData.length === 0) {
        return [];
    }
    var decryptedData = decodedData.split('\n').map((row) => row.split('\t')); // 替换制表符为四个空格
    console.log(decryptedData, 'decryptedData');
    return decryptedData
}

const getPdf = (base64) => {
    if (!base64) {
        return '';
    }
    // 将 Base64 数据转换为 Blob 对象
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // 创建一个可下载的 URL
    console.log(URL.createObjectURL(blob));
    // if(decodedData.length === 0) {
    //     return '';
    // }
    return URL.createObjectURL(blob)
}

onMounted(()=>{
    simpleLogArr.value=JSON.parse(props.simpleLogArr)
})

</script>

<style lang="scss" scoped>
.box {
    &>div:first-child {
        font-size: 14px;
        gap: 20px;
      
    }
}
table {
  width: 100%;
  border-collapse: collapse;
}
.table-cell {
  width: 100px; /* 设置固定宽度 */
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center; /* 居中对齐 */
}
</style>