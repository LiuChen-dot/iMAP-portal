<template>
  <div class="box">
    <div v-if="FormList.length">
      <el-form ref="FormRef" :model="Formdata" :rules="Formdatarules">
        <dynamicForm ref="dynamicFormRef" :taskId="taskId" :FormList="FormList"
          :attachValue="explainData?.chartComponents" :indexNum="indexNum" :Formdata="Formdata"
          :FormdatauploadList="FormdatauploadList" type="分析" :i18n="i18n"></dynamicForm>
      </el-form>
      <div class="pad-l-20 pad-t-20"><el-button @click="start" :disabled="props.fromBut"
          type="primary">{{ $t('common.yypz') }}</el-button></div>
    </div>
    <div v-else>
      <el-empty :description="$t(`common.nodata`)" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { queryImages,getStatus } from '@/api/16S'
import dynamicForm from '../dynamicForm/index.vue'
const emits = defineEmits(['changeexplainData', 'changeimageList','setInterFun','setfromButFun'])
const props = defineProps(['explainData', 'taskId', 'i18n','fromBut'])
const FormRef = ref()
const FormList = ref([])
const Formdata = reactive({})
const Formdatarules = reactive({})
const FormdatauploadList = reactive({})
const indexNum = ref(0)
const dynamicFormRef = ref()

watch(() => props.explainData, () => {
  FormList.value = props.explainData.analysisComponents
  FormList.value.forEach(item => {
    item.launch = false
  })
  recursionForm(FormList.value)
})

const recursionStartForm = (list, data) => {
  list.forEach(item => {
    if (item.children && item.children.length) {
      if (item.componentType != 'title') {
        data[item.title] = data[item.title]
        if (item.componentType == 'radio' && item.children) {
          item.children.forEach(item => {
            if (item.componentType == 'upload') {
              data[item.title] = FormdatauploadList[item.title]?.length ? FormdatauploadList[item.title][0]?.name : ''
            }
          })
        }
      }
      recursionStartForm(item.children, data)
    } else {
      if (item.componentType == 'upload') {
        data[item.title] = FormdatauploadList[item.title]?.length ? FormdatauploadList[item.title][0]?.name : ''
      } else {
        data[item.title] = data[item.title] || item.defaultValue
      }
    }
  })
}

const recursionForm = (list) => {
  list.forEach(item => {
    if (item.children && item.children.length) {
      if (item.componentType != 'title') {
        Formdata[item.title] = item.defaultValue
        Formdatarules[item.title] = []
        if (item.rule) {
          if (item.rule.pattern) {
            item.rule.pattern = new RegExp(item.rule.pattern)
          }
          Formdatarules[item.title].push(item.rule)
        }
      }
      recursionForm(item.children)
    } else {
      if (item.componentType == 'upload') {
        if (Formdata[item.title]) {
          // Formdata[item.title] = item.defaultValue
          FormdatauploadList[item.title] = [{ name: item.defaultValue }]

          recursionStartForm(FormList.value, Formdata)

        } else {
          Formdata[item.title] = []
          FormdatauploadList[item.title] = []
        }
      } else {
        Formdata[item.title] = item.defaultValue
      }
      Formdatarules[item.title] = []
      if (item.rule) {
        if (item.rule.pattern) {
          item.rule.pattern = new RegExp(item.rule.pattern)
        }
        Formdatarules[item.title].push(item.rule)
      }
    }
  })
}

const timenum = ref(0)
const timer = ref(null)

const start = () => {
  timenum.value = 0
  timer.value = null
  FormRef.value.validate(val => {
    if (val) {
      dynamicFormRef.value.start().then(res => {
        if (res == 'ok') {
          emits('setInterFun')
          emits('setfromButFun', true)
          timer.value = setInterval(() => {
            getStatus({ taskName: props.taskId }).then(res => {
              timenum.value += 5000
              emits('setInterFun')
              if (timenum.value >= 1800000||res.msg=='3'||res.msg=='4') {
                emits('changeimageList', props.taskId)
                emits('setfromButFun', false)
                clearInterval(timer.value)
              }
            })
          }, 5000);
        }
      })
    }
  })

}
</script>

<style lang="scss" scoped>
:deep(.el-upload-list__item-name) {
  width: 200px;
}

.box {
  height: 700px;
  overflow: auto;
  overflow-x: hidden;
  padding-bottom: 30px;
  padding-right: 30px;

  .el-input {
    width: 70%;
  }

  .el-select {
    width: 70%;
  }


}
</style>