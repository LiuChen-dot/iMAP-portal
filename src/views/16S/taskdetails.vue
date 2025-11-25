<template>
    <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
        <div class="body">
            <div>
                <div @click="router.go(-1)" style="padding:50px 100px 20px;">
                    <el-button type="primary">返回上一级</el-button>
                </div>
                <!-- <div @click="downloadtask">任务详情</div> -->
                <!-- <a :href="`/task-api/atlas/task/download?taskId=${taskId}`">下载</a> -->
            </div>
            <div>
                <div class="left" :style="`font-size: ${drawer ? '15px' : '20px'};`">
                    <div v-if="detailsdata.imageList && detailsdata.imageList.length > 0">
                        <div v-for="(item, index) in detailsdata.imageList" :key="index">
                            <img :src="`data:image/png;base64,${item.base64}`" alt="Base64 Image">
                            <div>{{ item.title }}</div>
                        </div>
                    </div>
                    <div style="display: flex;justify-content: center;" v-else>
                        <el-empty :description="$t(`common.nodata`)"></el-empty>
                    </div>
                </div>
                <!-- <div @click="drawerhandleClose" class="right" :style="`flex: ${drawer ? '1' : '0'};`"
                    v-if="detailsdata.logList && detailsdata.logList.length > 0">
                    <el-drawer size="50%" :modal="false" v-model="drawer" title="操作日志" direction="rtl">
                        <el-table :data="detailsdata.logList" style="width: 100%;color: #04A983;" height="500" border>
                            <el-table-column align="center" prop="processName" label="操作记录" />
                            <el-table-column align="center" prop="createTime" label="操作时间" />
                        </el-table>
                    </el-drawer>
                </div>
                <div v-show="!drawer" style="position: absolute;top: 100px;right: 0;">
                    <div>
                        <el-button type="primary" @click="drawer = true">查看日志</el-button>
                    </div>
                    <div style="margin-top: 20px;">
                        <el-button type="primary" @click="downloadtask">下载日志</el-button>
                    </div>
                </div> -->
            </div>
        </div>
        <Bottom style="position: relative;"></Bottom>

    </div>
</template>

<script setup>
import { getInfo, getDownload } from "@/api/16S";
import { onMounted, reactive, ref } from "vue";
import { getToken } from '@/utils/auth'
import router from '@/router';
import Bottom from "@/layout/components/Bottom/index.vue"

const detailsdata = ref([])
const drawer = ref(false)
const drawerhandleClose = () => {
    drawer.value = false
}
const taskId = ref(sessionStorage.getItem('taskId'))

const downloadtask = () => {
    // const headers = new Headers({
    //     'Authorization': 'Bearer '+getToken(),
    //     'Content-Disposition': 'attachment'
    // });
    // fetch(`${import.meta.env.VITE_APP_BASE_API}/atlas/task/download?taskId=${taskId.value}`,{method: 'get',headers:headers,responseType: 'blob',})
    // .then(response => console.log('response',response)) // 解析响应的JSON
    // .then(data => console.log('data',data)) // 处理解析后的数据
    // .catch(error => console.error('Error:', error)); // 错误处理
    getDownload({ taskId: taskId.value }).then(res => {
        console.log(res);
        var blob = new Blob([res])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'result_base_1.zip'
        link.click()
    }).catch(err => {
        console.log(err);
    })

}
onMounted(() => {
    getInfo({
        taskId: sessionStorage.getItem('taskId')
    }).then(res => {
        detailsdata.value = res.data
    })
})
</script>

<style lang="scss" scoped>
:deep(.el-drawer__title) {
    font-weight: bold;
    color: #04A983;
}

.body {
    padding: 0 100px;
    min-height: 100vh;
    background-color: #EEF0F8;
    position: relative;
    &>div:first-child{
        padding: 30px 0;
    }
    &>div:last-child {
        display: flex;

        .left {
            flex: 1;
            padding: 30px 0;
            &>div {
                text-align: center;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));

                &>div {
                    padding: 20px 0;

                    &>div:last-child {
                        padding: 20px 0;
                        font-weight: bold;
                    }

                    img {
                        width: 80%;
                    }
                }
            }
        }

        .right {
            transition: 0.5s;
            margin-left: 100px;
        }
    }
}
</style>
