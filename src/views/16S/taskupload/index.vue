<template>
    <div style="height: 100%;overflow: auto;overflow-x: hidden;background-color: #EEF0F8;">
        <div class="pad-t-20 pad-l-20 pad-r-20 pad-b-20">
            <el-card>
                <div class="dis-flex align-c just-c-sb">
                    <div class="text-w-bold dis-flex align-c">
                        <div @click="router.go(-1)" style="cursor: pointer;color: var(--el-color-primary);">{{
                            i18n=='zh'?scriptsName:scriptsNameEn }}</div>
                        <span class="mar-l-5 mar-r-5">/</span>
                        <div>{{ i18n=='zh'?scriptsIDName:scriptsIDNameEn }}</div>
                        <span class="mar-l-5 mar-r-5">/</span>
                        <div class="mar-t-3">{{ taskId }}</div>
                    </div>
                    <div class="dis-flex align-c toprightbox">
                        <el-button link type="primary" @click="getlistByScriptId" size="small">{{ $t('file.fileModel') }}</el-button>
                        <div v-for="(item, index) in countList" :key="index">
                            <el-popover placement="bottom" :title="i18n=='zh'?item.statusName:item.statusNameEn" :width="300" trigger="hover">
                                <template #reference>
                                    <div style="cursor: pointer;font-size: 15px;" class="dis-flex align-c">
                                        <img src="../../../assets/images/16s/icon/dengdai.png" alt="" v-if="item.status == 1" class="w-15 mar-r-5">
                                        <img src="../../../assets/images/16s/icon/paiduizhong.png" alt="" v-if="item.status == 2" class="w-15 mar-r-5">
                                        <img src="../../../assets/images/16s/icon/wancheng.png" alt="" v-if="item.status == 3" class="w-15 mar-r-5">
                                        <img src="../../../assets/images/16s/icon/shibai.png" alt="" v-if="item.status == 4" class="w-15 mar-r-5">
                                        {{ item.count }}
                                    </div>
                                </template>
                                <template #default>
                                    <div style="width: 100%;max-height: 300px;overflow: auto;">
                                        <div v-if="item.taskNameList?.length">
                                            <div v-for="(statusitem, index) in item.taskNameList" :key="index"
                                                class="dis-flex just-c-sb align-c pad-b-15 pad-l-10 pad-r-10">
                                                <div>{{ statusitem }}</div>
                                                <el-button @click="getInfo(statusitem)" size="small"
                                                    type="primary">{{i18n=='zh'?'查看':'View'}}</el-button>
                                            </div>
                                        </div>
                                        <div v-else class="text-center">{{$t(`common.nodata`)}}</div>
                                    </div>
                                </template>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </el-card>
            <div class="contentbox" style="flex: 1;">
                <el-card>
                    <div class="leftbox">
                        <div>
                            <el-tabs v-model="lefttoptabsActive" class="tabs" @tab-click="changelefttoptabsActive">
                                <el-tab-pane v-for="item in lefttoptabs" :key="item.name"
                                    :label="$t(`sixteensAnalyse.${item.label}`)" :name="item.name">
                                    <component :is="item.com" :imageList="imageList" :simpleLogArr="JSON.stringify(simpleLogArr)"></component>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                        <div>
                            <el-button @click="download" icon="Download" ></el-button>
                        </div>
                    </div>
                </el-card>
                <el-card>
                    <div class="rightbox">
                        <div>
                            <el-tabs v-model="righttoptabsActive" class="tabs" @tab-click="changerighttoptabsActive">
                                <el-tab-pane v-for="item in righttoptabs" :key="item.name"
                                    :label="$t(`sixteensAnalyse.${item.label}`)" :name="item.name">
                                    <component :is="item.com" @changeimageList="changeimageList" @setInterFun="setInter" @setfromButFun="setfromBut"
                                        :explainData="explainData" :taskId="taskId" :i18n="i18n" :fromBut="fromBut"></component>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
        <Bottom style="position: relative;"></Bottom>
        <el-dialog v-model="dowDig" width="60%" :title="$t('file.fileModel')">
            <div class="h-500 dis-flex flex-d">
                <el-table :data="tableList" height="100%" :empty-text="$t('file.zw')" style="width: 100%">
                    <el-table-column prop="taskName" :label="$t('file.rwmc')" />
                    <el-table-column prop="attachmentName" :label="$t('file.fileName')" />
                    <el-table-column prop="createTime" :label="$t('file.czsj')">
                        <template #default="scope">
                            {{ formatDate(scope.row.createTime, 'yyyy-MM-dd hh:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('file.cz')" width="300" align="center">
                        <template #default="scope">
                            <el-button @click="addtheTestReport(scope.row)" size="small" type="primary">{{ $t('file.add') }}</el-button>
                            <el-button @click="gettaskAttachmentdownload(scope.row)" size="small" type="primary">{{ $t('file.down') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import Bottom from "@/layout/components/Bottom/index.vue"
import { scripts, count, listByStatus, getInfoByName, queryImages, simpleLog, getDownload,listByScriptId,taskAttachmentjoinReport } from '@/api/16S'
import { computed, markRaw, onMounted, ref } from "vue";
import Figures from './leftCom/Figures.vue'
import Attachments from './leftCom/Attachments.vue'
import explain from './rightCom/explain.vue'
import analyse from './rightCom/analyse.vue'
import adjust from './rightCom/adjust.vue'
import router from '@/router'
import { useLanguageStore } from '@/store/modules/language';
import { formatDate } from '@/utils/index'
import { getToken } from '@/utils/auth'
import { ElMessage } from "element-plus";

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
const scriptsName = ref('')
const scriptsNameEn = ref('')
const scriptsIDName = ref('')
const scriptsIDNameEn = ref('')
const imageList = ref([])

const fromBut=ref(false)

const dowDig = ref(false)
const tableList = ref([])



const setfromBut=(res)=>{
    fromBut.value=res
}


const changeimageList = (item) => {
    setTimeout(() => {
        queryImages({ taskName: item }).then(res => {
            imageList.value = res.data
        })
    }, 500);
}
const lefttoptabsActive = ref('Figures')
const changelefttoptabsActive = (e) => {

}
const lefttoptabs = ref([
    {
        label: 'tu',
        name: 'Figures',
        com: markRaw(Figures),
    },
    // {
    //     label: '附件 ( Attachments )',
    //     name: 'Attachments',
    //     com: markRaw(Attachments),
    // }
])

const righttoptabsActive = ref('图表说明')
const changerighttoptabsActive = (e) => {

}
const righttoptabs = ref([
    {
        label: 'tbsm',
        name: '图表说明',
        com: markRaw(explain),
    },
    {
        label: 'fxsz',
        name: '分析设置',
        com: markRaw(analyse),
    },
    {
        label: 'tbtz',
        name: '图表调整',
        com: markRaw(adjust),
    }
])
const explainData = ref(null)
const taskId = ref('')

const countList = ref([])
const scriptsId = sessionStorage.getItem('scriptsId')
const simpleLogArr=ref([])

const getlistByScriptId = () => {
    listByScriptId({ scriptsId:scriptsId }).then(res => {
        tableList.value = res.data
        dowDig.value = true
    })
}
const getInfo = (item) => {
    taskId.value = item
    getInfoByName({ taskName: item }).then(res => {
        explainData.value = res.data
        queryImages({ taskName: item }).then(res => {
            imageList.value = res.data
        })
        simpleLog(item).then(res => {
            simpleLogArr.value=res.data
        })
    })
}
function extractFilenameFromContentDisposition(contentDisposition) {
  if (!contentDisposition) {
    return null;
  }

  // 尝试解析 filename*（扩展属性）
  const filenameStarRegex = /filename\*=([^\s]+)'([^']*)/;
  const filenameStarMatch = contentDisposition.match(filenameStarRegex);
  if (filenameStarMatch) {
    // 解码文件名（filename* 的值是经过编码的）
    const encoding = filenameStarMatch[1]; // 例如 "utf-8"
    const encodedFilename = filenameStarMatch[2];
    if (encoding.toLowerCase().indexOf("utf-8") !== -1) {
      return decodeURIComponent(encodedFilename);
    }
  }

  // 如果没有 filename*，尝试解析普通的 filename
  const filenameRegex = /filename=["']?([^"']+)["']?/;
  const filenameMatch = contentDisposition.match(filenameRegex);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1];
  }

  // 如果都没有匹配到，返回 null
  return null;
}
const gettaskAttachmentdownload = async (item) => {
    try {
        // 发起请求
        const response = await fetch(import.meta.env.VITE_APP_BASE_API + "/atlas/taskAttachment/download?taskAttachmentId=" + item.taskAttachmentId, {
            method: "GET",
            // body: {
            //     taskAttachmentId: item.taskAttachmentId
            // },
            headers: {
                // 根据后端要求设置请求头
                "Content-Type": "application/json",
                Authorization: "Bearer "+getToken(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        // 获取文件流数据
        const blob = await response.blob();
        console.log(blob);
        if(blob.size==0){
            ElMessage.error(i18n.value == 'zh' ? '文件无内容': 'File content is empty')
            return;
        }
        // 获取文件名（从响应头中获取，如果没有则使用默认值）
        const contentDisposition = response.headers.get("content-disposition");
        const fileName = contentDisposition
        ? extractFilenameFromContentDisposition(contentDisposition)
        : item.attachmentName;
        console.log(fileName);
        // 创建下载链接
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName; // 设置下载文件名
        a.click(); // 触发下载
        a.remove(); // 清理元素
        URL.revokeObjectURL(downloadUrl); // 释放对象URL
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}

const download = () => {
    getDownload({ taskName: taskId.value }).then(res => {
        var blob = new Blob([res.data], { type: 'application/zip' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = res.headers['download-filename']
        link.click()
    })
}

const addtheTestReport=(item)=>{
    taskAttachmentjoinReport({taskAttachmentId:item.taskAttachmentId,scriptsId:scriptsId}).then(res => {
        if(res.code==200){
            ElMessage.success(i18n.value == 'zh' ? '添加成功': 'Added successfully');
        }
    })
}
const setInter=()=>{
    setTimeout(() => {
        getcount()
    }, 500);
    // getcount()
    simpleLog(taskId.value).then(res => {
        simpleLogArr.value=res.data
    })
}
const getcount=()=>{
    count({ scriptsId }).then(res => {
        countList.value = res.data
        // countList.value.forEach(item => {
        //     listByStatus({ status: item.status, scriptsId }).then(res => {
        //         item.statusList = res.data
        //     })
        // })
    })

}
onMounted(() => {
    getcount()
    scripts({ scriptsId }).then(res => {
        taskId.value = res.data.nickName + formatDate(new Date(), 'yyyyMMddhhmmss')
        explainData.value = res.data
        scriptsIDName.value = res.data.scriptsName
        scriptsIDNameEn.value = res.data.scriptsNameEn
    })
    scriptsName.value = sessionStorage.getItem('scriptsName') || ''
    scriptsNameEn.value = sessionStorage.getItem('scriptsNameEn') || ''

})
</script>

<style lang="scss" scoped>
.toprightbox {
    &>div {
        margin-left: 30px;
        display: flex;

        .el-icon {
            margin-right: 5px;
        }
    }
}

.contentbox {
    display: flex;
    gap: 10px;
    margin-top: 10px;

    .el-card:first-child {
        flex: 3;
    }

    .el-card:last-child {
        flex: 2;
    }

    .leftbox {
        position: relative;

        &>div:last-child {
            top: 0;
            right: 0;
            position: absolute;
        }


    }

    .rightbox {}
}
</style>