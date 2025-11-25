<template>
    <div :style="`padding-left: ${indexNum * 10}px;`">
        <div v-for="(item, index) in FormList" :key="index">
            <div v-if="indexNum == 0 && item.children"
                :class="['pad-b-10', 'pad-t-10', 'pad-l-20', 'fts-16', 'pad-t-10', 'text-w-bold']">
                {{ i18n == 'zh' ? item.titleZh : item.titleEn }}
                <template v-if="indexNum == 0 && item.children && item.componentType == 'title'">
                    <el-icon @click="item.launch = true" v-show="!item.launch">
                        <ArrowDownBold />
                    </el-icon>
                    <el-icon @click="item.launch = false" v-show="item.launch">
                        <ArrowUpBold />
                    </el-icon>
                </template>
            </div>
            <div class="pad-l-10">
                <div v-if="item.children && item.children.length">
                    <div v-show="(item.launch || launch)"
                        :class="item.componentType != 'title' ? ['dis-flex', 'align-c'] : []">
                        <div v-if="indexNum != 0"
                            :class="['pad-b-10', 'pad-t-10', 'pad-l-10', 'fts-14', 'text-w-bold']">
                            {{ i18n == 'zh' ? item.titleZh : item.titleEn }}
                        </div>
                        <dynamicForm v-if="item.componentType == 'title'" :FormList="item.children"
                            :indexNum="parseInt(indexNum) + 1" :Formdata="Formdata" :launch="(item.launch || launch)"
                            :i18n="i18n" :type="tabtype" :FormdatauploadList="props.FormdatauploadList">
                        </dynamicForm>
                        <div v-else class="pad-l-15">
                            <el-select v-if="item.componentType == 'select'" style="width: 200px;"
                                v-model="Formdata[item.title]" :placeholder="i18n == 'zh' ? '请选择':'please select'"  @change="changeForm">
                                <el-option v-for="rangeArrayitem in i18n == 'zh' ? item.rangeArray : item.rangeArrayEn" :key="rangeArrayitem.value"
                                    :value="rangeArrayitem.value" :label="rangeArrayitem.label"></el-option>
                            </el-select>
                            <div v-else-if="item.componentType == 'radio'">
                                <el-radio-group v-model="Formdata[item.title]"  @change="changeForm">
                                    <el-radio v-for="rangeArrayitem in i18n == 'zh' ? item.rangeArray : item.rangeArrayEn" :key="rangeArrayitem.value"
                                        :value="rangeArrayitem.value">{{ rangeArrayitem.label }}</el-radio>
                                </el-radio-group>
                            </div>
                        </div>
                    </div>
                    <div v-show="item.componentType == 'title' ? (item.launch || launch) : true">
                        <div v-if="item.componentType != 'title'" class="pad-l-30 pad-t-10">
                            <div
                                v-show="item.componentType != 'title' && item.componentType == 'radio' && Formdata[item.title] == 'T'">
                                <div v-for="(childitem, index) in item.children" :key="index">
                                    <el-form-item :label="i18n == 'zh' ? childitem.titleZh : childitem.titleEn"
                                        :prop="childitem.title">
                                        <el-input v-if="childitem.componentType == 'input'" style="width: 200px;"
                                            v-model="Formdata[childitem.title]" :placeholder="i18n == 'zh' ? '请输入':'Please input'" @change="changeForm"></el-input>
                                        <el-select v-else-if="childitem.componentType == 'select'" style="width: 200px;"
                                            v-model="Formdata[childitem.title]" :placeholder="i18n == 'zh' ? '请选择':'please select'" @change="changeForm">
                                            <el-option v-for="rangeArrayitem in i18n == 'zh' ? childitem.rangeArray : childitem.rangeArrayEn"
                                                :key="rangeArrayitem.value" :value="rangeArrayitem.value"
                                                :label="rangeArrayitem.label"></el-option>
                                        </el-select>
                                        <div v-else-if="childitem.componentType == 'radio'">
                                            <el-radio-group v-model="Formdata[childitem.title]" @change="changeForm">
                                                <el-radio v-for="rangeArrayitem in i18n == 'zh' ? childitem.rangeArray : childitem.rangeArrayEn"
                                                    :key="rangeArrayitem.value" :value="rangeArrayitem.value">{{
                                                        rangeArrayitem.label }}</el-radio>
                                            </el-radio-group>
                                            <div v-show="Formdata[childitem.title] == 'T'">
                                                <div v-for="(childitem2, index) in childitem.children" :key="index">
                                                    <el-form-item v-if="childitem2.componentType == 'upload'"
                                                        :label="`${i18n == 'zh' ? childitem2.titleZh : childitem2.titleEn}:`">
                                                        <el-upload
                                                            v-model:file-list="FormdatauploadList[childitem2.title]"
                                                            :auto-upload="false" multiple
                                                            :on-remove="(file, uploadFiles) => handleRemove(file, uploadFiles, childitem.title)"
                                                            :limit="1"
                                                            :on-change="(rawFile) => changeFile(rawFile, childitem2.title)"
                                                            :on-exceed="exceed">
                                                            <el-button size="small" type="primary">{{ $t('common.scwj') }}</el-button>
                                                        </el-upload>
                                                        <div class="mar-l-10 dis-flex align-c">
                                                            <div
                                                                style="width: 150px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                                                {{ FormdatauploadList[childitem2.title]?.length &&
                                                                    FormdatauploadList[childitem2.title][0].name
                                                                    ? FormdatauploadList[childitem2.title][0].name : ''
                                                                }}
                                                            </div>
                                                            <el-icon
                                                                v-if="FormdatauploadList[childitem2.title]?.length && FormdatauploadList[childitem2.title][0].name"
                                                                @click.stop="handleRemove(FormdatauploadList[childitem2.title][0].name, childitem2.title)">
                                                                <CloseBold />
                                                            </el-icon>
                                                        </div>
                                                    </el-form-item>
                                                </div>
                                            </div>
                                        </div>
                                        <el-slider v-else-if="childitem.componentType == 'slider'" style="width: 200px;"
                                            v-model="Formdata[childitem.title]" :min="childitem.min"
                                            :max="childitem.max" :step="childitem.step" @change="changeForm">
                                        </el-slider>
                                        <el-upload v-else-if="childitem.componentType == 'upload'"
                                            v-model:file-list="FormdatauploadList[childitem.title]" :auto-upload="false"
                                            multiple
                                            :on-remove="(file, uploadFiles) => handleRemove(file, uploadFiles, childitem.title)"
                                            :limit="1" :on-change="(rawFile) => changeFile(rawFile, childitem.title)"
                                            :on-exceed="exceed">
                                            <el-button size="small" type="primary">{{ $t('common.scwj') }}</el-button>
                                            <div class="mar-l-10 dis-flex align-c">
                                                <div
                                                    style="width: 150px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                                    {{ FormdatauploadList[childitem.title]?.length &&
                                                        FormdatauploadList[childitem.title][0].name
                                                        ? FormdatauploadList[childitem.title][0].name : '' }}
                                                </div>
                                                <el-icon
                                                    v-if="FormdatauploadList[childitem.title]?.length && FormdatauploadList[childitem.title][0].name"
                                                    @click.stop="handleRemove(FormdatauploadList[childitem.title][0].name, childitem.title)">
                                                    <CloseBold />
                                                </el-icon>
                                            </div>
                                        </el-upload>
                                    </el-form-item>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else :style="`padding-left: ${indexNum * 10}px;`">
                    <el-form-item :label="i18n == 'zh' ? item.titleZh : item.titleEn" :prop="item.title">
                        <el-input v-if="item.componentType == 'input'" style="width: 200px;"
                            v-model="Formdata[item.title]" :placeholder="i18n == 'zh' ? '请输入':'Please input'"  @change="changeForm"></el-input>
                        <el-select v-else-if="item.componentType == 'select'" style="width: 200px;"
                            v-model="Formdata[item.title]" :placeholder="i18n == 'zh' ? '请选择':'please select'" @change="changeForm">
                            <el-option v-for="rangeArrayitem in i18n == 'zh' ? item.rangeArray : item.rangeArrayEn" :key="rangeArrayitem.value"
                                :value="rangeArrayitem.value" :label="rangeArrayitem.label"></el-option>
                        </el-select>
                        <div v-else-if="item.componentType == 'radio'">
                            <el-radio-group v-model="Formdata[item.title]" @change="changeForm">
                                <el-radio v-for="rangeArrayitem in i18n == 'zh' ? item.rangeArray : item.rangeArrayEn" :key="rangeArrayitem.value"
                                    :value="rangeArrayitem.value">{{ rangeArrayitem.label }}</el-radio>
                            </el-radio-group>
                        </div>
                        <el-slider v-else-if="item.componentType == 'slider'" style="width: 200px;" @change="changeForm"
                            v-model="Formdata[item.title]" :min="item.min" :max="item.max" :step="item.step">
                        </el-slider>
                        <el-upload v-else-if="item.componentType == 'upload'"
                            v-model:file-list="FormdatauploadList[item.title]" :auto-upload="false" multiple
                            :on-remove="(file, uploadFiles) => handleRemove(file, uploadFiles, item.title)" :limit="1"
                            :on-change="(rawFile) => changeFile(rawFile, item.title)" :on-exceed="exceed">
                            <el-button size="small" type="primary">{{ $t('common.scwj') }}</el-button>
                            <div class="mar-l-10 dis-flex align-c">
                                <div
                                    style="max-width: 150px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                                    {{ FormdatauploadList[item.title]?.length && FormdatauploadList[item.title][0].name
                                        ? FormdatauploadList[item.title][0].name : '' }}
                                </div>
                                <el-icon class="mar-l-10"
                                    v-if="FormdatauploadList[item.title]?.length && FormdatauploadList[item.title][0].name"
                                    @click.stop="handleRemove(FormdatauploadList[item.title][0].name, item.title)">
                                    <CloseBold />
                                </el-icon>
                            </div>
                        </el-upload>
                    </el-form-item>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { ElMessage } from 'element-plus';
import { defineComponent, ref } from 'vue';
import { start2, uploadDataFile, queryImages, deleteFile } from '@/api/16S'

export default defineComponent({
    name: 'dynamicForm',
    props: {
        taskId: {
            type: String,
        },
        FormList: {
            type: Object,
        },
        attachValue: {
            type: String,
        },
        indexNum: {
            type: Number,
        },
        Formdata: {
            type: Object,
        },
        FormdatauploadList: {
            type: Object,
        },
        type: {
            type: String,
        },
        launch: {
            type: Boolean,
        },
        i18n: {
            type: String,
        },
    },
    setup(props) {
        const tabtype= ref('')
        tabtype.value = props.type
        if(props.type=='分析'){
            sessionStorage.setItem('form1',JSON.stringify(props.Formdata))
            sessionStorage.setItem('FormdatauploadList',JSON.stringify(props.FormdatauploadList))
        }else{
            sessionStorage.setItem('form2',JSON.stringify(props.Formdata))
        }
        const changeFile = (rawFile, title) => {
            props.FormdatauploadList[title].push(rawFile)
            changeForm()
            upload(title)
        }
        const exceed = () => {
            ElMessage.warning(props.i18n == 'zh' ? '每次只能上传一条！':'Only one file can be uploaded each time.')
        }
        const handleRemove = (fileName, title) => {
            props.Formdata[title] = []
            props.FormdatauploadList[title] = []
            deleteFile({ taskName: props.taskId, fileName })
        }
        const upload = (title) => {
            const formvalue = new FormData()
            formvalue.append('scriptsId', sessionStorage.getItem('scriptsId'))
            formvalue.append('taskName', props.taskId)
            formvalue.append('inputFile', props.FormdatauploadList[title][0].raw)
            uploadDataFile(formvalue).then(res => {
                if (res.code == 200) {
                    ElMessage.success(res.msg)

                } else {
                    ElMessage.error(res.msg)
                }
            })
        }

        const recursionStartForm = (list, data) => {
            list.forEach(item => {
                if (item.children && item.children.length) {
                    if (item.componentType != 'title') {
                        data[item.title] = data[item.title]
                        if (item.componentType == 'radio' && item.children) {
                            item.children.forEach(item => {
                                if (item.componentType == 'upload') {
                                    data[item.title] =JSON.parse(sessionStorage.getItem('FormdatauploadList'))[item.title]?.length ? JSON.parse(sessionStorage.getItem('FormdatauploadList'))[item.title][0]?.name : ''
                                }
                            })
                        }
                    }
                    recursionStartForm(item.children, data)
                } else {
                    if (item.componentType == 'upload') {
                        console.log(sessionStorage.getItem('FormdatauploadList'), 'FormdatauploadList');
                        data[item.title] = JSON.parse(sessionStorage.getItem('FormdatauploadList'))[item.title]?.length ? JSON.parse(sessionStorage.getItem('FormdatauploadList'))[item.title][0]?.name : ''
                    } else {
                        data[item.title] = data[item.title] || item.defaultValue
                    }
                }
            })
        }
        const timenum = ref(0)
        const timer = ref(null)
        const start = async () => {

            timenum.value = 0
            timer.value = null
            // recursionStartForm(props.FormList, props.Formdata)
            const attachValueData = {}
            const form1=JSON.parse(sessionStorage.getItem('form1'))
            const form2=JSON.parse(sessionStorage.getItem('form2'))
            if(props.type=='分析'){
                recursionStartForm(props.FormList, form1)
            }else{
                recursionStartForm(props.attachValue, form1)
            }

            let res = null

            if (props.type == '分析') {
                res = await start2({
                    scriptsId: sessionStorage.getItem('scriptsId'),
                    taskName: props.taskId,
                    analysisComponents: form1,
                    chartComponents: form2
                })
            } else {
                res = await start2({
                    scriptsId: sessionStorage.getItem('scriptsId'),
                    taskName: props.taskId,
                    chartComponents: form2,
                    analysisComponents: form1
                })
            }
            if (res.code == 200) {
                return 'ok'
            }
        }
        const changeForm=()=>{
            if(props.type=='分析'){
                sessionStorage.setItem('form1',JSON.stringify(props.Formdata))
                sessionStorage.setItem('FormdatauploadList',JSON.stringify(props.FormdatauploadList))
            }else{
                sessionStorage.setItem('form2',JSON.stringify(props.Formdata))
            }
        }
        return {
            props,
            tabtype,
            changeFile,
            exceed,
            handleRemove,
            upload,
            start,
            changeForm
        }
    }
});


</script>

<style lang="scss" scoped>
:deep(.el-form-item--default .el-form-item__label) {
    padding-left: 10px;
    min-width: 100px;
    max-width: 200px;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

}

:deep(.el-upload-list) {
    display: none;
}
</style>