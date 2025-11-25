<template>
    <div>
        <div style="border: 1px solid #ccc;">
            <!-- <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
                :mode="'default'" /> -->
            <Editor style="height: 700px; overflow-y: hidden;" v-model="valueHtml" :defaultConfig="editorConfig"
                :mode="'default'" @onCreated="handleCreated" />
        </div>
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, shallowRef, onMounted, watch, computed } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { scripts } from '@/api/16S'
const props = defineProps(['explainData', 'i18n'])
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const valueHtmlZh = ref(null)
const valueHtmlEn = ref(null)
watch(props, () => {
    valueHtmlZh.value = props.explainData.inputFileDesc
    valueHtmlEn.value = props.explainData.inputFileDescEn
})
const valueHtml = computed(() => props.i18n == 'zh' ? valueHtmlZh.value : valueHtmlEn.value)
const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})
const handleCreated = (editor) => {
    editorRef.value = editor
}

</script>

<style></style>