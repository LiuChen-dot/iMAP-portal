<template>
  <div class="app-container">
    <div class="home">
        <div class="home_List">
            <div class="list_header mar-b-10">
                <el-button type="primary" class="w-100p mar-b-10" @click="addMsg()" >
                    <el-icon class="mar-r-10 fts-17"> <CirclePlusFilled /> </el-icon> {{i18n=='zh'?'新建对话':'New conversation'}}
                </el-button>
                <el-input v-model="historyValue" class="w-100p" size="default" :placeholder="i18n=='zh'?'搜索历史记录':'Search history'" :prefix-icon="Search" @input="historySearch()" />
            </div>
            <div class="list_box">
                <!-- <el-tooltip class="box-item" effect="dark" :content="i18n=='zh'?'清除所有历史会话。':'Clear all history sessions.'" placement="top">
                    <span @click="deleteHistory()" class="close">{{i18n=='zh'?'一键删除':'Delete All'}}</span>
                </el-tooltip> -->
                <div>
                    <div v-for="(item, index) in hisMsgList" :key="index" v-show="item.children.length">
                        <h6>{{ i18n == 'zh' ? item.name:item.enname }}</h6>
                        <ul>
                            <li :class="[val.conversationId == listItemId ? 'active' : '']" v-for="(val, ind) in item.children" :key="index" @click="listClick(val)">
                                <el-icon> <ChatDotSquare /> </el-icon>
                                <p>{{ val.conversationName }}</p>
                                <span>
                                    <!-- <el-icon class="mar-r-5" @click.stop="msgEdit(val)"> <Edit /> </el-icon> -->
                                    <el-icon @click.stop="msgDelete(val)"> <Delete /> </el-icon>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="home_Cont">
            <div class="message_box">
                <div class="message_cont" ref="messageCont">
                    <div class="message_list">
                        <template v-for="(item, index) in msglist" :key="index">
                            <div class="message_item " v-if="item.type=='question'" style="flex-direction: row-reverse;">
                                <div class="message_avatar" style="background:#fff;">
                                    <el-icon><User /></el-icon>
                                </div>
                                <div class="message_wrp question text-right">
                                    <div v-html="marked.parse(item.message)"></div>
                                </div>
                            </div>
                            <div class="message_item" v-if="item.type=='answer'">
                                <div class="message_avatar">
                                    <img src="../../assets/images/kfjqr.png" alt="" class="w-100p h-100p">
                                </div>
                                <div class="message_wrp">
                                    <div class="thinkBox" v-if="item.thinkContent"  v-html="marked.parse(item.thinkContent)"></div>
                                    <div class="markdown-box" v-html="item.textValue"></div>
                                    <div>
                                        <div class="dis-flex align-c mar-l-10 just-c-fe">
                                            <el-tooltip class="box-item" :content="i18n=='zh'?'复制内容':'Copy content'" placement="top" trigger='hover' >
                                                <el-button link :icon="CopyDocument" @click="copyText(item.message)" ></el-button>
                                            </el-tooltip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="message_input" >
                    <div class="textarea">
                        <el-input v-model="msgTextarea" class="w-100p" style="border:0;" type="textarea" :rows="textRows" clearable 
                            :placeholder="i18n=='zh'?textPlaceholderzh:textPlaceholderen" @keydown="keydownEnter" />
                        <img v-if="textareaSS" src="@/assets/images/sheng.png" alt="" class="w-15 h-15 mar-5 cur-p" @click="textareaSS = false; textRows = 25">
                        <img v-else src="@/assets/images/suo.png" alt="" class="w-15 h-15 mar-5 cur-p" @click="textareaSS = true; textRows = textRowsDe">
                    </div>
                    <div class="btn_box dis-flex align-c">
                        <el-button v-if="msgBtnFlag" type="primary" style="border-radius: 50px;font-size:18px;cursor: pointer;" color="#ff3751" @click="msgStop()">
                            <svg-icon class-name="stop-icon" icon-class="stop" style="color:#fff;" />
                        </el-button>
                        <el-button v-else type="primary" style="border-radius: 50px;font-size:18px;cursor: pointer;" :color="sendDisabled ? '#d6d5de' : ''" :disabled="sendDisabled" @click="msgSend()" :icon="Promotion"></el-button>
                    </div>
                </div>
            </div>
            <div class="Affix" @click="gobottom">
                <el-tooltip :content="i18n=='zh'?'直到最新':'To the latest'" effect="dark" placement="top">
                    <div class="aff_div w-100p h-100p">
                        <el-icon><Bottom /></el-icon>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, onUnmounted } from "vue";
import { Search, Promotion, PictureFilled, CopyDocument } from '@element-plus/icons-vue'
import { userList,infoList,delconversation } from '@/api/chat'
import { ElMessageBox, ElMessage } from 'element-plus'
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // 引入 KaTeX 的样式
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { getToken } from '@/utils/auth'
import { formatDate } from '@/utils/index.js'
import hljs from 'highlight.js';
import * as echarts from 'echarts';
import 'highlight.js/styles/lightfair.css';
import loadingIcon from '@/assets/images/loading.gif'
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)

const textPlaceholderzh = ref('问我任何问题...(Shift + Enter 换行，按下 Enter 发送)')
const textPlaceholderen = ref('Ask me any question...(Shift + Enter to change line, press Enter to send)')




const userInfo = localStorage.getItem('userinfo') ? JSON.parse(localStorage.getItem('userinfo')) : null


const textss = ref('')
const listItemId = ref('')
const msgTextarea = ref('')
const msglist = ref([])
const historyValue = ref('')
const hisMsgListArr = ref([])
const hisMsgList = ref([])
const textareaSS = ref(true)
const textRowsDe = ref(3)
const textRows = ref(textRowsDe.value)
const sendDisabled = ref(true)
const messageCont = ref(null)

const msgBtnFlag = ref(false)
const msgTextValue = ref('')
let ctrlControll



const sessionId=ref('')




//监听消息框内容变化
watch(msgTextarea, (newtext) => {
  if (newtext.trim()) {
    sendDisabled.value = false
  } else {
    sendDisabled.value = true
  }
})
onMounted(() => {
    queryAssistantGroupFun()
    nextTick(() => {
        messageCont.value.scrollTo({ top: messageCont.value.scrollHeight, behavior: "smooth" });
    })
})




const gobottom = () => {
    messageCont.value.scrollTo({ top: messageCont.value.scrollHeight, behavior: "smooth" });
}

// Shift + Enter 换行判断
const keydownEnter = (event) => {
  if (event.shiftKey && event.key === 'Enter') {
    event.preventDefault();
    msgTextarea.value = msgTextarea.value + '\n';
  } else {
    if (event.key === 'Enter') {
      if (!sendDisabled.value) {
        if (!msgBtnFlag.value) {
          msgSend()
        }
      }
      event.preventDefault();
    }
  }
}
// 获取左侧列表
const queryAssistantGroupFun = () => {
    userList().then(res => {
        hisMsgListArr.value = res.data
        var arr = [{
            name: '当天',
            enname: 'Today',
            children: []
        }, {
            name: '历史记录',
            enname: 'History',
            children: []
        },]
        res.data.forEach(item => {
            if (formatDate(item.updateTime, 'yyyy-MM-dd') == formatDate(new Date(), 'yyyy-MM-dd')) {
                arr[0].children.push(item)
            } else {
                arr[1].children.push(item)
            }
        })
        hisMsgList.value = arr
    })
}
const getkatex=(text)=>{
    return text.replace(/\\\((.*?)\\\)/g, (txt, math) => {
        try{
            return katex.renderToString(math, { throwOnError: false });
        }catch (error) {
            return txt
        }
    }).replace(/\\\[(.*?)\\\]/g, (txt, math) => {
        try{
            return katex.renderToString(math, { displayMode: true, throwOnError: false });
        }catch (error) {
            return txt
        }
    }).replace(/\\\[([\s\S]*?)\\\]/g, (txt, math) => {
        try{
            return katex.renderToString(math, { displayMode: true, throwOnError: false });
        }catch (error) {
            return txt
        }
    });
}

const renderer = new marked.Renderer();
renderer.code = function(code) {
    if (code.lang === 'echarts') {
        try {
            const chartConfig = JSON.parse(code.text); // 将代码块内容解析为 JSON 对象
            var id = generateUUID();
            nextTick(() => {
                // 可以对返回数据进行渲染，也可以通过数据请求获取数据信息进行渲染
                setTimeout(() => {
                    if(document.getElementById('echarts_content_' + id)){
                        let myChart = echarts.init(document.getElementById('echarts_content_' + id));
                        myChart.setOption(chartConfig,true);
                        const resizeObserver1 = new ResizeObserver((entries) => {
                            for (const entry of entries) {
                                const { width } = entry.contentRect
                                myChart.resize({ width })
                            }
                        })
                        // // 开始监听最外层的 resizeTarget 元素的大小变化
                        const resizeTarget1 = document.getElementById('echarts_content_' + id)
                        resizeObserver1.observe(resizeTarget1)
                    }
                }, 500);
            });
            return `<div class="echarts-cont" id="echarts_content_${id}" style="width: 100%;height: 400px;display: flex;align-items:center;justify-content:center"></div>`;
        }catch (error) {
            return i18n.value == 'zh' ? '错误':'Error'
        }
    } else if(code.type === 'code'&&code.lang != 'echarts'){
        const validLanguage = hljs.getLanguage(code.lang) ? code.lang : 'plaintext';
        var id = generateUUID();
        // 可以对返回数据进行渲染，也可以通过数据请求获取数据信息进行渲染
        setTimeout(() => {
            if(document.getElementById('code_copy_' + id)){
                document.getElementById('code_copy_' + id).onclick=()=>{
                    copyText(code.text)
                }
            }
        }, 500);
        return `<div class='code_box'>
                    <div class="code_title">
                        <span>${code.lang}</span>
                        <span class="cur-p"  id="code_copy_${id}">${i18n.value == 'zh' ? '复制':'Copy'}</span>
                    </div>
                    <div class="code_cont"><pre><code class="${validLanguage}">${hljs.highlight(code.text, { language: validLanguage }).value}</code></pre></div>
                </div>`;
    } else{
        return code.text
    }
};



// 获取右边历史消息
const queryAssistantHistoryFun = () => {
    msglist.value = []
    infoList({ conversationId: listItemId.value }).then(res => {
        var data=res.data.reverse()
        data.forEach((item) => {
          if(item.createUserId!='AI'){
            msglist.value.push({
                type:'question',
                message:item.message,
            })
          }else{
            if(item.message.indexOf('<think>')>-1){
                if(item.message.indexOf('</think>')==-1){
                  item.thinkContent=item.message.replace('<think>','')
                  item.message = ''
                }else{
                  item.thinkContent=item.message.replace('<think>','').slice(0,item.message.indexOf('</think>')-7)
                  item.message = getkatex(item.message.slice(item.message.indexOf('</think>')+8)) 
                }
            }else{
                item.message = getkatex(item.message) 
            }
            item.textValue = marked.parse(item.message, { renderer })
            msglist.value.push({
              type:'answer',
              message:item.message,
              thinkContent:item.thinkContent,
              textValue:marked.parse(item.textValue, { renderer })
            })
          }
        })
        console.log('msglist.value', msglist.value)
        nextTick(() => {
            messageCont.value.scrollTo({ top: messageCont.value.scrollHeight, behavior: "smooth" });
        })
    })
}

// 搜索历史记录
const historySearch = () => {
    var arr1 = hisMsgListArr.value.filter(val => val.conversationName.indexOf(historyValue.value) !== -1)
    var arr = [{
        name: '当天',
        enname: 'Today',
        children: []
    }, {
        name: '历史记录',
        enname: 'History',
        children: []
    },]
    arr1.forEach(item => {
        if (formatDate(item.updateTime, 'yyyy-MM-dd') == formatDate(new Date(), 'yyyy-MM-dd')) {
            arr[0].children.push(item)
        } else {
            arr[1].children.push(item)
        }
    })
    hisMsgList.value = arr
}

// 左侧列表点击
const listClick = (val) => {
    listItemId.value = val.conversationId
    queryAssistantHistoryFun()
}

// 添加新对话
const addMsg = (type) => {
    msglist.value = []
    msgTextarea.value = ''
    listItemId.value = ''
    historyValue.value = ''
    sessionId.value=''
}

// 编辑对话名称
const msgEdit = (val) => {
    ElMessageBox.prompt(null, i18n.value == 'zh' ? '编辑' : 'Edit', {
        confirmButtonText: i18n.value == 'zh' ? '保存' : 'Save',
        cancelButtonText: i18n.value == 'zh' ? '取消' : 'Cancel',
        inputPlaceholder: i18n.value == 'zh' ? '请输入' : 'Please enter',
        inputValue: val.conversationName,
        beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
                if (instance.inputValue.trim()) {
                    done()
                } else {
                    ElMessage({
                        message: i18n.value == 'zh' ? '名称不能为空' : 'Name cannot be empty',
                        type: 'error',
                    })
                }
            } else {
                done()
            }
        },
    }).then(({ value }) => {
        // updateGroupName({
        //     "groupid": val.conversationId,
        //     "assistantGroupName": value
        // }).then(res => {
        //     msgName.value = res.data.assistantGroupName
        //     listItemId.value = res.data.conversationId
        //     queryAssistantGroupFun()
        // }).catch(err => {})
    }).catch(() => {

    })
}

const copyText=(text)=>{
    if (text == '') {
        showToast(i18n.value == 'zh' ? '您要复制的内容不存在' : 'The content you want to copy does not exist')
        return
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (success) {
        ElMessage.success(i18n.value == 'zh' ? '复制成功': 'Copied successfully')
    } else {
        ElMessage.error(i18n.value == 'zh' ? '复制失败': 'Copy failed')
    }
}

// 对话删除
const msgDelete = (val) => {
    ElMessageBox.confirm(
        i18n.value == 'zh' ? '删除后，该对话将不可恢复。确认删除吗？':'Deleting this conversation will not be recoverable. Are you sure you want to delete?',
        i18n.value == 'zh' ? '永久删除对话':'Permanent deletion of conversation',
        {
            confirmButtonText: i18n.value == 'zh' ? '删除':'Delete',
            cancelButtonText: i18n.value == 'zh' ? '取消':'Cancel',
            type: 'warning',
        }
    )
    .then(() => {
        delconversation({conversationId:val.conversationId}).then(res => {
            queryAssistantGroupFun()
            if (val.conversationId == listItemId.value) {
                listItemId.value = ''
                msglist.value = []
            }
        }).catch(err => {})
    })
    .catch(() => {
    })

}

// 一键删除
const deleteHistory = () => {
    ElMessageBox.confirm(
        `<p style="margin-bottom:10px;">${i18n.value == 'zh' ? '如点击确认删除，当前账号的所有历史对话将被清空，无法找回。':'If you confirm the deletion, all history conversations on the current account will be cleared and cannot be recovered.'}</p>
        <p>${i18n.value == 'zh' ? '确认要删除所有历史对话吗？':'Are you sure you want to delete all history conversations?'}</p>`,
        i18n.value == 'zh' ? '删除所有历史对话':'Delete all history conversations',
        {
            confirmButtonText: i18n.value == 'zh' ? '确认删除':'Confirm deletion',
            cancelButtonText: i18n.value == 'zh' ? '取消':'Cancel',
            dangerouslyUseHTMLString: true,
        }
    )
    .then(() => {
        // oneClickDelAssistantGroup().then(res => {
        //     queryAssistantGroupFun()
        //     msgName.value = ''
        //     msglist.value = []
        // }).catch(err => {})
    })
    .catch(() => {
    })

}
// 发送对话
const msgSend = () => {
  saveAssistantInfoFun()
}

const msgStop = () => {
  ctrlControll.abort()
  if(textss.value.indexOf('<think>')>-1){
    if(textss.value.indexOf('</think>')==-1){
        msglist.value[msglist.value.length-1].thinkContent=textss.value.replace('<think>','')
        msglist.value[msglist.value.length-1].message = ''
    }else{
        msglist.value[msglist.value.length-1].thinkContent=textss.value.replace('<think>','').slice(0,textss.value.indexOf('</think>')-7)
        msglist.value[msglist.value.length-1].message = getkatex(textss.value.slice(textss.value.indexOf('</think>')+8)) 
    }
  }else{
      msglist.value[msglist.value.length-1].message = getkatex(textss.value) 
  }
  msglist.value[msglist.value.length-1].textValue = marked.parse(msglist.value[msglist.value.length-1].message, { renderer })
  textss.value = ''
  msgTextValue.value = ''
  msgBtnFlag.value = false
}




// 发送消息
const saveAssistantInfoFun = () => {
    const ctrl = new AbortController()
    ctrlControll = ctrl
    msgBtnFlag.value = true
    msgTextValue.value = msgTextarea.value
    msgTextarea.value = "";
    textss.value = ''
    msglist.value.push({
        type: 'question',
        message: msgTextValue.value,
    })
    var obj = {
        type: 'answer',
        message: '',
        textValue: `<span class="isassistant pad-b-10"><img src="${loadingIcon}"/></span>`,
        thinkContent: '',
    }
    msglist.value.push(obj)
    nextTick(() => {
        messageCont.value.scrollTo({ top: messageCont.value.scrollHeight, behavior: "smooth" });
    })
    var url='';
    var body=null;
    url=import.meta.env.VITE_APP_BASE_API + '/conversation/chatToAI'
    
    body = {
      "conversationId": listItemId.value,
      "query": msgTextValue.value,
    }
    fetchEventSource(url, {
        method: "POST",
        // 请求头参数
        headers: {
            Authorization: 'Bearer ' + getToken(),
            "Accept": "text/event-stream",
            "Content-Type": "application/json"
        },
        // 具体传参
        body: JSON.stringify(body),
        openWhenHidden: true, // 在调用失败时禁止重复调用
        signal: ctrlControll.signal,
        /*onopen: function (e: any) {
            console.log("open");
        },*/
        onmessage(msg) {
            // console.log(msg)
            var res = JSON.parse(msg.data);
            console.log(res)
            if(res.evnet=='message_start'){
              queryAssistantGroupFun()
            }
            if (res.evnet == 'message_end') {
                if(textss.value.indexOf('<think>')>-1){
                    if(textss.value.indexOf('</think>')==-1){
                        msglist.value[msglist.value.length-1].thinkContent=textss.value.replace('<think>','')
                        msglist.value[msglist.value.length-1].message = ''
                    }else{
                        msglist.value[msglist.value.length-1].thinkContent=textss.value.replace('<think>','').slice(0,textss.value.indexOf('</think>')-7)
                        msglist.value[msglist.value.length-1].message = getkatex(textss.value.slice(textss.value.indexOf('</think>')+8)) 
                    }
                }else{
                    msglist.value[msglist.value.length-1].message = getkatex(textss.value) 
                }
                msglist.value[msglist.value.length-1].textValue = marked.parse(msglist.value[msglist.value.length-1].message, { renderer })
                msgTextValue.value = ''
                msgBtnFlag.value = false
            }else{
                if(res.evnet == 'message'){
                    listItemId.value = res.session_id
                    textss.value += res.text ? res.text : ''
                    if(textss.value.indexOf('<think>')>-1){
                        if(textss.value.indexOf('</think>')==-1){
                            msglist.value[msglist.value.length-1].thinkContent=textss.value.replace('<think>','')
                            msglist.value[msglist.value.length-1].message = ''
                        }else{
                            msglist.value[msglist.value.length-1].thinkContent=textss.value.replace('<think>','').slice(0,textss.value.indexOf('</think>')-7)
                            msglist.value[msglist.value.length-1].message = getkatex(textss.value.slice(textss.value.indexOf('</think>')+8))
                        }
                    }else{
                        msglist.value[msglist.value.length-1].message =  getkatex(textss.value)
                    }
                }
                
                msglist.value[msglist.value.length-1].textValue = marked.parse(msglist.value[msglist.value.length-1].message, { renderer }) + `<span class="isassistant"><img src="${loadingIcon}"/></span>`
                if(res.evnet=='error'){
                    ElMessage.error(res.error);
                    msgTextValue.value = ''
                    msglist.value.splice(msglist.value.length - 2, 2)
                    msgBtnFlag.value = false
                }
            }

            nextTick(() => {
                messageCont.value.scrollTo({ top: messageCont.value.scrollHeight, behavior: "smooth" });
            })
        },
        /*onclose(e: any) {
            console.log("close");
            console.log(e);
            ctrl.abort();
        },*/
        onerror(err) {
            // console.log('err',err)
            ElMessage.error(err.msg || i18n.value == 'zh' ? "询问人数过多请稍后在试！": "Ask too many people, please try again later!");
            console.log("error", err);
            // 此方法会报错，但可以解决ts语法打包报错问题
            // ctrl.signal[0].aborted = false;
            msglist.value.splice(msglist.value.length - 1, 1)
            msgBtnFlag.value = false
            msgTextValue.value = ''
            try {
                // onerror后关闭请求，但打包是ts语法报错
                ctrlControll.signal.aborted = false;
                if (ctrlControll) {
                    ctrlControll.abort();
                }
            } finally {
                console.log("finally", ctrlControll);
            }
        }
    });
}



onUnmounted(() => {

});



</script>
<style lang="scss" scoped>
::v-deep(.katex-display){
  >.katex{
    background: rgb(40, 44, 52);
    color:#fff;
    border-radius: 7px;
  }
  .katex-html{
    overflow: hidden;
    overflow-x: auto;
    padding: 15px;
  }
  /* 自定义整个滚动条 */
  ::-webkit-scrollbar {
    height: 5px;
  }

  /* 自定义滚动条轨道 */
  ::-webkit-scrollbar-track {
    background: rgb(40, 44, 52);
    /* 轨道的背景色 */
    border-radius: 5px;
    /* 轨道的圆角 */
  }

  /* 自定义滚动条的滑块（thumb） */
  ::-webkit-scrollbar-thumb {
    cursor: pointer;
    background-color: #c1c1c1;
    /* 滑块的背景色 */
    border-radius: 5px;
    /* 滑块的圆角 */
  }

  /* 当滑块悬停或活动时的样式 */
  ::-webkit-scrollbar-thumb:hover {
    cursor: pointer;
    background: #f9f9f9;
    /* 悬停或活动状态下滑块的背景色 */
  }
}
::v-deep(.el-image-viewer__img) {
  width: auto;
  border-radius: 0;
  margin: 0;
}

.home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  transition: all 0.3s linear;
}

.home_List {
  width: 260px;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 15px;
  padding-bottom: 20px;
  .close {
    cursor: pointer;
    color: #ff6f6f;
    position: absolute;
    z-index: 1;
    right: 5px;
    top: 10px;
    font-size: 12px;
  }

  .list_box {
    flex: 1;
    overflow-y: auto;
    position: relative;

    h6 {
      margin: 0;
      padding: 12px 0 8px 12px;
      font-size: 12px;
      color: #878aab;
      display: flex;
      align-items: center;
      justify-content: space-between;

    }

    ul {
      li {
        display: flex;
        align-items: center;
        font-size: 14px;
        padding: 7px 12px;
        border: 1px solid #e8e8f1;
        border-radius: 7px;
        margin-bottom: 10px;
        cursor: pointer;

        p {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 5px;
        }
      }

      li.active {
        background-color: var(--el-theme-color-opacity);
        border: 1px solid var(--el-theme-color);
        color: var(--el-theme-color);
      }

      li:hover {
        background-color: var(--el-theme-color-opacity);
      }
    }
  }
}


.home_Cont {
  flex: 1;
  overflow: hidden;
  background: #f7f8fc;
  padding: 20px 120px 10px;
  display: flex;
  flex-direction: column;
  position: relative;

  .message_title {
    height: 50px;
    font-weight: 700;
    display: flex;
    align-items: center;

    .message_title_left {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  }

  .message_box {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .message_cont {
      flex: 1;
      overflow: hidden;
      overflow-y: auto;

      .message_list {
        .message_item {
          display: flex;
          margin-bottom: 10px;

          .message_avatar {
            width: 32px;
            height: 32px;
            border-radius: 7px;
            margin-top: 12px;
            margin-right: 15px;
            overflow: hidden;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--el-theme-color);
          }

          .message_wrp {
            flex: 1;
            background: #fff;
            padding: 16px 16px 6px;
            font-size: 16px;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
            text-size-adjust: 100%;
            word-wrap: break-word;
            color: #2c2c36;
            line-height: 1.5;
            border-radius: 16px;
            overflow: hidden;

            .interrupted {
              color: #b6b6b6;
              padding: 0 8px 10px;
              font-size: 14px;
            }
          }

          .question {
            background: none;
            margin-bottom: 0;
          }
        }

        .message_item:last-child {
          margin-bottom: 0;
        }

        .reverse {
          flex-direction: row-reverse;

          .message_avatar {
            margin-left: 15px;
            margin-right: 0;
          }

          .message_wrp {
            text-align: right;
          }
        }
      }
    }

    .message_input {
      background: #fff;
      padding: 10px;
      display: flex;
      flex-direction: column;
      border-radius: 10px;
      margin-top: 15px;

      .message_btn {
        display: flex;
      }

      .textarea {
        display: flex;
      }

      .btn_box {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 10px;
      }

      ::v-deep(.el-textarea__inner) {
        box-shadow: none;
      }

      /* 自定义整个滚动条 */
      ::-webkit-scrollbar {
        width: 5px;
        /* 设置滚动条的宽度 */
        background-color: #f9f9f9;
        /* 滚动条的背景色 */
      }

      /* 自定义滚动条轨道 */
      ::-webkit-scrollbar-track {
        background: #e1e1e1;
        /* 轨道的背景色 */
        border-radius: 5px;
        /* 轨道的圆角 */
      }

      /* 自定义滚动条的滑块（thumb） */
      ::-webkit-scrollbar-thumb {
        background-color: #c1c1c1;
        /* 滑块的背景色 */
        border-radius: 5px;
        /* 滑块的圆角 */
      }

      /* 当滑块悬停或活动时的样式 */
      ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
        /* 悬停或活动状态下滑块的背景色 */
      }
    }
  }
}

::-webkit-scrollbar {
  display: none;
}

::v-deep(.el-textarea) {
  .el-textarea__inner {
    resize: none; // 去除右下角图标
  }
}

.system_rank {
  font-size: 9px;
  color: rgba(103, 104, 144, .6);
  line-height: 15px;
  text-align: center;
  padding: 10px 10px 0;
}

/* 定义关键帧 */
@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.isassistant {
  animation: blink 1s infinite;
}

.Affix {
  position: absolute;
  bottom: 200px;
  right: 60px;
  background: #fff;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  font-size: 18px;

  .aff_div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.docw>span {
  display: none;
}

.docw>p:hover {
  color: #888;
}

.docw:hover>span {
  display: block;
}
</style>