<template>
    <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
        <div style="padding:50px 100px 20px;">
            <el-button @click="router.go(-1)" type="primary">返回上一级</el-button>
        </div>
        <div class="box" style="height: 100%;">
            <div class="left">
                <div class="header">
                    <div><img :src="scrioptsimg ? `data:image/png;base64,${scrioptsimg}` : img1"></div>
                    <div>{{ scriptsName }}</div>
                </div>
                <div class="warning">
                    <div>
                        <el-icon>
                            <WarningFilled />
                        </el-icon>
                    </div>
                    <div v-html="inputFileDesc"></div>
                </div>

                <div class="content">
                    <div v-for="(item, index) in labelList" :key="index">
                        <div>
                            <div>{{ item.name }}：</div>
                            <div v-if="item.type == 'input'">
                                <el-input v-model="Formdata.id" disabled></el-input>
                            </div>
                            <div style="position: relative;" v-if="item.type == 'file'">
                                <label :for="item.value" class="custom-file-upload">
                                    <div class="uploadfilename">{{ Formdata[item.value + 'name'] }}</div>
                                    <div class="uploadicon">
                                        <img src="@/assets/images/16s/upload.png">
                                    </div>
                                </label>
                                <!-- <div style="position: absolute;font-size: 13px;color: gray;padding-top: 5px;">
                                    上传名称必须为：<span style="color: red;">{{ item.defaultname }}</span></div> -->
                                <input class="file-upload" @change="(event) => uploadfile(event, item)" :id="item.value"
                                    type="file" />
                                <div v-if="item.Loadingshow" style="position: absolute;right: -20px;top: 3px;">
                                    <el-icon class="rotate">
                                        <Loading />
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="scriptsId == '21'">
                        <div>
                            <div>修剪正向reads低质量碱基的位置</div>
                            <div><el-input type="number" @input="(e) => handleInput(e, 'p1')"
                                    v-model="scriptsId22inputValue.p1" placeholder="请输入"></el-input></div>
                        </div>
                        <div>
                            <div>修剪反向reads低质量碱基的位置</div>
                            <div><el-input type="number" @input="(e) => handleInput(e, 'p2')"
                                    v-model="scriptsId22inputValue.p2" placeholder="请输入"></el-input></div>
                        </div>
                        <div>
                            <div>设置修剪截断正向reads的位置</div>
                            <div><el-input type="number" @input="(e) => handleInput(e, 'p3')"
                                    v-model="scriptsId22inputValue.p3" placeholder="请输入"></el-input></div>
                        </div>
                        <div>
                            <div>设置修剪截断反向reads的位置</div>
                            <div><el-input type="number" @input="(e) => handleInput(e, 'p4')"
                                    v-model="scriptsId22inputValue.p4" placeholder="请输入"></el-input></div>
                        </div>
                    </div>
                    <div v-else-if="scriptsId == '22'">
                        <div>
                            <div>物种注释分类器</div>
                            <div>
                                <el-select v-model="scriptsId22SelectValue" placeholder="请选择">
                                    <el-option v-for="item in scriptsId22Select" :key="item" :value="item"
                                        :label="item"></el-option>
                                </el-select>
                            </div>
                        </div>
                    </div>
                    <div style="padding: 20px 0;">
                        <el-button @click="submit" :disabled="butdisabled" type="primary">提交</el-button>
                    </div>
                </div>
            </div>
            <div class="right">
                <el-table :data="taskList" :empty-text="$t(`common.nodata`)" style="width: 100%;color: #04A983;" height="500" border>
                    <el-table-column align="center" prop="taskName" label="任务名称" width="230" />
                    <el-table-column align="center" prop="createTime" label="上传时间" width="180" />
                    <el-table-column align="center" label="状态" width="130">
                        <template v-slot="scope">
                            <el-tag>{{ scope.row.statusName }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="查询运行日志" width="130">
                        <template v-slot="scope">
                            <el-button size="small" type="primary"
                                @click="getlogInfo(scope.row); drawer = true;">查询运行日志</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="下载结果文件" width="130">
                        <template v-slot="scope">
                            <el-button size="small" type="primary" @click="downloadtask(scope.row)">下载结果文件</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="detailsshow" align="center" label="查看详情" width="90">
                        <template v-slot="scope">
                            <el-button size="small" type="primary" @click="gotaskdetails(scope.row)">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <el-drawer size="50%" v-model="drawer" title="操作日志" direction="rtl">
                <el-table :empty-text="$t(`common.nodata`)" :data="detailsdata.logList" style="width: 100%;color: #04A983;" height="500"
                    border>
                    <el-table-column align="center" prop="processName" label="操作记录" />
                    <el-table-column align="center" prop="createTime" label="操作时间" />
                </el-table>
            </el-drawer>
        </div>
        <Bottom style="position: relative;"></Bottom>
    </div>
</template>

<script setup>
import { uploadDataFile, start, tasklist, listData, scripts, getInfo, getDownload } from "@/api/16S";
import { onMounted, reactive, ref, watch, } from 'vue';
import img1 from '@/assets/images/16s/default.png'
import router from '@/router';
import Bottom from "@/layout/components/Bottom/index.vue"
import {
    ElMessage,
} from 'element-plus'
import { getToken } from '@/utils/auth'
import axios from 'axios';
const scriptsName = ref('')
const scrioptsimg = localStorage.getItem('16simgurl')
const detailsshow = ref(true)
const Loadingshow = ref(false)
const Formdata = reactive({
    id: '',
    // matrixfilename: '',
    // matrixfile: null,
})
const inputFileDesc = ref('')
//渲染模板动态数组
const labelList = ref([
    {
        name: '任务编号',
        defaultname: '',
        value: 'id',
        type: 'input',
        Loadingshow: false,
    },
    // {
    //     name: '上传文件',
    //     value: 'matrixfilename',
    //     type: 'file'
    // },

])

const isscriptsId22inputValue = ref(false)
const scriptsId22inputValue = reactive({
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0
})

const handleInput = (value, name) => {
    if (value < 0) {
        scriptsId22inputValue[name] = 0;  // 如果输入的是负数，设置为0
    } else {
        scriptsId22inputValue[name] = value;
    }
}
watch(scriptsId22inputValue, () => {
    if (scriptsId.value == '21') {
        let bol = true
        for (const key in scriptsId22inputValue) {
            if (scriptsId22inputValue[key] < 0) {
                bol = false
            }
        }
        isscriptsId22inputValue.value = bol
        const isAllUpload = needFile.value.filter(needfile => needfile.isUpload)
        if (isAllUpload.length == needFile.value.length && bol) {
            butdisabled.value = false
        } else {
            butdisabled.value = true
        }
    }
})
const scriptsId22SelectValue = ref('')
const scriptsId22Select = ref(['Greengene2', 'Silva'])
watch(() => scriptsId22SelectValue.value, () => {
    const isAllUpload = needFile.value.filter(needfile => needfile.isUpload)
    if (isAllUpload.length == needFile.value.length && scriptsId22SelectValue.value) {
        butdisabled.value = false
    } else {
        butdisabled.value = true
    }
})
const detailsdata = ref([])
const drawer = ref(false)
const drawerhandleClose = () => {
    drawer.value = false
}
const taskList = ref([])
//选择文件
const uploadfile = (event, item) => {
    Formdata[item.value + 'name'] = event.target.files[0].name
    console.log(event.target.files[0]);
    Formdata[item.value + 'file'] = event.target.files[0]
    console.log(Formdata);

    upload(item)
}
const butdisabled = ref(true)

const needFile = ref([])
//上传
const upload = (item) => {
    const formvalue = new FormData()
    formvalue.append('scriptsId', sessionStorage.getItem('scriptsId'))
    formvalue.append('taskName', Formdata.id)
    formvalue.append('inputFile', Formdata[item.value + 'file'])
    item.Loadingshow = true
    uploadDataFile(formvalue).then(res => {
        item.Loadingshow = false
        if (res.code == 200) {
            ElMessage.success(res.msg)
            needFile.value.forEach(needfile => {
                if (needfile.name == item.value) needfile.isUpload = true
            })
            const isAllUpload = needFile.value.filter(needfile => needfile.isUpload)
            if (scriptsId.value == '21') {
                let bol = true
                for (const key in scriptsId22inputValue) {
                    if (scriptsId22inputValue[key] < 0) {
                        bol = false
                    }
                }
                if (isAllUpload.length == needFile.value.length && bol) {
                    butdisabled.value = false
                }
            } else if (scriptsId.value == '22') {
                if (isAllUpload.length == needFile.value.length && scriptsId22SelectValue.value) {
                    butdisabled.value = false
                }
            } else {
                if (isAllUpload.length == needFile.value.length) {
                    butdisabled.value = false
                }
            }

        } else {
            ElMessage.error(res.msg)
        }
    })
}

//提交
const submit = () => {
    butdisabled.value = true
    const params = ref(null)
    if (scriptsId.value == '21') {
        params.value = {
            scriptsId: sessionStorage.getItem('scriptsId'),
            taskName: Formdata.id,
            ...scriptsId22inputValue
        }
    } else if (scriptsId.value == '22') {
        params.value = {
            scriptsId: sessionStorage.getItem('scriptsId'),
            taskName: Formdata.id,
            p5: scriptsId22SelectValue.value
        }
    } else {
        params.value = {
            scriptsId: sessionStorage.getItem('scriptsId'),
            taskName: Formdata.id
        }
    }
    start(params.value).then(res => {
        if (res.code == 200) {
            ElMessage.success(res.msg)
            gettasklist()
        } else {
            ElMessage.error(res.msg)
        }
    })
}
//获取列表
const gettasklist = () => {
    tasklist({ scriptsId: sessionStorage.getItem('scriptsId') }).then(res => {
        taskList.value = res.data
    })
}
//跳转详情
const gotaskdetails = (item) => {
    sessionStorage.setItem('taskId', item.taskId)
    router.push('/taskdetails')
}
//下载文件
const downloadtask = async (item) => {
    if (item.status == '3') {
        getDownload({ taskId: item.taskId }).then(res => {
            var blob = new Blob([res.data], { type: 'application/zip' })
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = res.headers['download-filename']
            link.click()
        }).catch(err => {
            console.log(err);
        })
    } else {
        ElMessage.error('任务未成功')
    }

}
const getlogInfo = (item) => {
    getInfo({
        taskId: item.taskId
    }).then(res => {
        detailsdata.value = res.data
    })
}
const scriptsId = ref('')
onMounted(() => {
    scriptsId.value = sessionStorage.getItem('scriptsId')
    if (scriptsId.value == '21' || scriptsId.value == '22' || scriptsId.value == '23') detailsshow.value = false

    scripts({ scriptsId: scriptsId.value }).then(res => {
        scriptsName.value = res.data.scriptsName
        inputFileDesc.value = res.data.inputFileDesc
        Formdata.id = res.data.nickName + new Date().getTime()
        const inputFileNamesList = res.data.inputFileNames.split(',')
        inputFileNamesList.forEach(item => {
            Formdata[item.split('.')[0] + 'name'] = ''
            Formdata[item.split('.')[0] + 'file'] = null
            needFile.value.push({
                name: item.split('.')[0],
                isUpload: false
            })
            labelList.value.push({
                name: `${item}`,
                defaultname: item,
                value: item.split('.')[0],
                type: 'file',
                Loadingshow: false,
            })
        });
        gettasklist()
        setInterval(() => {
            gettasklist()
        }, 5000)
    })
})
</script>

<style lang="scss" scoped>
.box {
    padding: 50px 100px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    .rotate {
        display: inline-block;
        animation: rotate 2s linear infinite;
    }

    .left {
        flex: 1;

        .header {
            display: flex;
            align-items: center;
            font-weight: bold;

            img {
                width: 60%;
            }
        }

        .warning {
            width: 90%;
            padding: 30px 0 0;
            color: gray;
            font-size: 16px;
            display: flex;
            align-items: flex-start;

            &>div:first-child {
                padding: 3px 5px 0;
            }
        }

        .content {
            padding: 20px 0;

            &>div {

                &>div {
                    display: flex;
                    align-items: center;
                    padding: 20px 0;

                    &>div:first-child {

                        padding-right: 20px;
                        color: gray;
                        font-size: 15px;
                        font-weight: bold;
                        width: 260px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                    }

                    .file-upload {
                        display: none;

                    }

                    .custom-file-upload {
                        border: 1px solid gainsboro;
                        border-radius: 3px;
                        height: 30px;
                        width: 220px;
                        cursor: pointer;
                        display: block;
                        text-align: center;
                        position: relative;

                        .uploadfilename {
                            position: absolute;
                            width: 90%;
                            padding: 3px 5px;
                            top: 0;
                            left: 0;
                            font-size: 15px;
                            text-align: start;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }

                        .uploadicon {
                            position: absolute;
                            top: 0;
                            right: 0;

                            img {
                                width: 70%;
                            }
                        }
                    }

                    .el-input {
                        width: 220px
                    }
                }

                .example {
                    display: flex;
                    align-items: center;
                    padding: 10px 0;

                    &>div:first-child {
                        font-size: 13px;
                        color: gray;
                        font-weight: bold;

                    }

                    &>div:last-child {
                        display: flex;
                        align-items: center;
                        color: #0E94DB;

                        img {
                            padding: 0 10px;
                            width: 45%;
                        }

                    }
                }
            }
        }
    }

    .right {
        flex: 1;

        .rightitem {
            cursor: pointer;
            padding: 20px;
            display: flex;
            font-size: 13px;
            border-bottom: 1px solid gainsboro;

            &>div:last-child {
                margin-left: 20px;
            }

            &:last-child {
                border: none;

            }
        }
    }
}
</style>