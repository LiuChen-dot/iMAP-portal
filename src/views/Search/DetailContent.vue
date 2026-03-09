<template>
    <ul>
        <template v-for="(item, index) in items" :key="index">
            <li :class="[item.ind == 1 ? 'lis1' : '']"
                :data-nav-key="getBlockKey(index)"
                :data-nav-level="item.ind"
                v-if="(((!item.last || item.fieldValue) && !item.show) || ((item.dataType == '2' ||item.dataType == '6' || item.dataType == '4'|| item.dataType == '5'|| item.dataType == '7'||item.dataType == '9'||item.dataType == '10') && !item.show))">
                <p :class="['p_box', (item.dataType != '2'&&item.dataType != '6'&&item.dataType != '7') ? (item.last ? 'fts-12' : 'fts-' + (20 - ((item.ind - 1) * 2))) : (item.ind == 1 ? 'fts-20' : 'fts-16'),
                    (item.dataType != '2'&&item.dataType != '6'&&item.dataType != '7') ? (item.last ? 'text-w-400' : 'text-w-' + (8 - ((item.ind - 1) * 2)) + '00') : (item.ind == 1 ? 'text-w-800' : 'text-w-600'), 'pad-l-16',
                    item.dataType !=='1'?'p_1':'']">
                    <span :class="[(item.dataType != '2'&&item.dataType != '6'&&item.dataType != '7') ? (item.ind > 2 || item.last ? 'lable3' : '') : '']">{{
                        capitalizeFirstLetter(item.showNameNew) }}</span>
                    <b v-if="item.dataType != '0' && item.dataType != '2' && item.dataType != '6' && item.dataType != '4' && item.dataType != '5'&& item.dataType != '7'&&item.dataType != '9'&&item.dataType != '10'"
                        class="b"></b>
                    <span :style="item.url ? 'color: blue;cursor: pointer;' : ''" @click.stop="!item.urlType?gobasic(item):null"
                        class="span_value" v-if="item.dataType != '0' && item.dataType != '2' && item.dataType != '4'&&item.dataType != '9'&&item.dataType != '10'"
                        v-html="item.fieldValue ? getLink(item) : ''"></span>
                </p>
                <div v-if="(item.dataType == '2' || item.dataType == '6')  && item.childList" class="pad-10" >
                    <template v-if="item.tableList.length > 1">
                        <!-- 多 strain：合并展示，≤N 个用按钮切换，>N 个用下拉选择；表格保留每页条数分页 -->
                        <div class="strain-switcher mar-b-10">
                            <template v-if="item.tableList.length <= MAX_VISIBLE_STRAINS">
                                <el-radio-group
                                    :model-value="getSelectedStrainIndex(getBlockKey(index))"
                                    @update:model-value="(i) => setSelectedStrainIndex(getBlockKey(index), i)"
                                    size="small">
                                    <el-radio-button
                                        v-for="(str, si) in item.tableList"
                                        :key="si"
                                        :label="si">
                                        {{ str.name }}
                                    </el-radio-button>
                                </el-radio-group>
                            </template>
                            <template v-else>
                                <span class="strain-label">{{ (i18n === 'zh' ? '选择菌株：' : 'Strain: ') }}</span>
                                <el-select
                                    :model-value="getSelectedStrainIndex(getBlockKey(index))"
                                    @update:model-value="(i) => setSelectedStrainIndex(getBlockKey(index), i)"
                                    size="small"
                                    class="strain-select"
                                    :placeholder="i18n === 'zh' ? '请选择菌株' : 'Select strain'">
                                    <el-option
                                        v-for="(str, si) in item.tableList"
                                        :key="si"
                                        :label="str.name"
                                        :value="si" />
                                </el-select>
                            </template>
                        </div>
                        <div v-if="getSelectedStr(item, index)" style="border:1px dashed #ccc;padding:10px;padding-top:0;border-radius:10px;">
                            <div class="fts-12" style="color:var(--el-theme-color);padding:10px 0">{{ getSelectedStr(item, index).name }}</div>
                            <el-table border class="table"
                                :data="getSelectedStr(item, index).data.slice((getSelectedStr(item, index).page - 1) * getSelectedStr(item, index).pageSize, (getSelectedStr(item, index).page - 1) * getSelectedStr(item, index).pageSize + getSelectedStr(item, index).pageSize)"
                                :scrollbar-always-on="getSelectedStr(item, index).tableWidth > getSelectedStr(item, index).contentWidth">
                                <el-table-column v-for="(val, ind) in item.childList" :key="ind" :prop="val.showName"
                                    :min-width="getColumnHeaderWidth(val.showNameNew)">
                                    <template #header>
                                        <div :title="val.showNameNew">{{ val.showNameNew }}</div>
                                    </template>
                                    <template #default="scope">
                                        <p class="ellipsis-multiline" style="cursor: pointer">
                                            <el-tooltip class="box-item" effect="light"
                                                :content="scope.row[val.showName] ? scope.row[val.showName] : ''"
                                                placement="top">
                                                <span>{{ scope.row[val.showName] ? getTableLink(val,scope.row) : '' }}</span>
                                            </el-tooltip>
                                        </p>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <!-- 当前菌株表格的每页条数分页（保留原分页功能） -->
                            <div class="mar-t-10 dis-flex just-c-fe" v-if="getSelectedStr(item, index).data.length > 5">
                                <el-pagination class="pagination" size="small"  v-model:current-page="getSelectedStr(item, index).page"
                                    v-model:page-size="getSelectedStr(item, index).pageSize"
                                    :page-sizes="[5, 10, 20, 30, 50, getSelectedStr(item, index).data.length < 100 ? 100 : getSelectedStr(item, index).data.length]"
                                    layout="total, sizes, prev, pager, next, jumper" :total="getSelectedStr(item, index).data.length">
                                </el-pagination>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <!-- 单 strain 或原分页展示 -->
                        <div v-for="(str,indz) in item.tableList.slice((item.page - 1) * item.pageSize, (item.page - 1) * item.pageSize + item.pageSize)" style="border:1px dashed #ccc;padding:10px;padding-top:0;border-radius:10px;">
                            <div class="fts-12" style="color:var(--el-theme-color);padding:10px 0">{{str.name}}</div>
                            <el-table border class="table"
                                :data="str.data.slice((str.page - 1) * str.pageSize, (str.page - 1) * str.pageSize + str.pageSize)"
                                :scrollbar-always-on='str.tableWidth > str.contentWidth ? true : false'>
                                <el-table-column v-for="(val, ind) in item.childList" :key="ind" :prop="val.showName"
                                    :min-width="getColumnHeaderWidth(val.showNameNew)">
                                    <template #header>
                                        <div :title="val.showNameNew">{{ val.showNameNew }}</div>
                                    </template>
                                    <template #default="scope">
                                        <p class="ellipsis-multiline" style="cursor: pointer">
                                            <el-tooltip class="box-item" effect="light"
                                                :content="scope.row[val.showName] ? scope.row[val.showName] : ''"
                                                placement="top">
                                                <span>{{ scope.row[val.showName] ? getTableLink(val,scope.row) : '' }}</span>
                                            </el-tooltip>
                                        </p>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="mar-t-10 dis-flex just-c-fe" v-if="str.data.length>5">
                                <el-pagination class="pagination" size="small"  v-model:current-page="str.page"
                                    v-model:page-size="str.pageSize"
                                    :page-sizes="[5, 10, 20, 30, 50, str.data.length < 100 ? 100 : str.data.length]"
                                    layout="total, sizes, prev, pager, next, jumper" :total="str.data.length">
                                </el-pagination>
                            </div>
                        </div>
                        <div class="mar-t-10 dis-flex just-c-c" v-if="item.tableList.length>3">
                            <el-pagination class="pagination" size="small"  v-model:current-page="item.page"
                                v-model:page-size="item.pageSize"
                                :page-sizes="[5, 10, 20, 30, 50, item.tableList.length < 100 ? 100 : item.tableList.length]"
                                layout="total, sizes, prev, pager, next, jumper" :total="item.tableList.length">
                            </el-pagination>
                        </div>
                    </template>
                </div>
                <div v-else-if="(item.dataType == '7')  && item.childList" class="pad-10" >
                    <el-table border class="table"
                        :data="item.tableList.slice((item.page - 1) * item.pageSize, (item.page - 1) * item.pageSize + item.pageSize)"
                        :scrollbar-always-on='item.tableWidth > item.contentWidth ? true : false'>
                        <el-table-column v-for="(val, ind) in item.childList" :key="ind" :prop="val.showName"
                            :min-width="getColumnHeaderWidth(val.showNameNew)">
                            <template #header>
                                <div :title="val.showNameNew">{{ val.showNameNew }}</div>
                            </template>
                            <template #default="scope">
                                <p class="ellipsis-multiline" style="cursor: pointer">
                                    <el-tooltip class="box-item" effect="light"
                                        :content="scope.row[val.showName] ? scope.row[val.showName] : ''"
                                        placement="top">
                                        <span>{{ scope.row[val.showName] ? getTableLink(val,scope.row) : '' }}</span>
                                    </el-tooltip>
                                </p>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="mar-t-10 dis-flex just-c-c" v-if="item.tableList.length>3">
                        <el-pagination class="pagination" size="small"  v-model:current-page="item.page"
                            v-model:page-size="item.pageSize"
                            :page-sizes="[5, 10, 20, 30, 50, item.tableList.length < 100 ? 100 : item.tableList.length]"
                            layout="total, sizes, prev, pager, next, jumper" :total="item.tableList.length">
                        </el-pagination>
                    </div>
                </div>
                <div v-else-if="item.dataType == '4' && item.tableList && item.tableList.length > 0"
                    class="dis-flex flex-w pad-t-10 pad-b-10 pad-r-20 pad-l-20">
                    <a href="javascript:;"
                        v-for="(item, index) in item.launch ? item.tableList.slice(0, 10) : item.tableList "
                        :key="index" class="mar-r-15 more fts-14" @click="goDetail(item.url, item.urlType)">{{ item.name
                        }}</a>
                    <div v-show="item.launch" style="cursor: pointer;font-size: 15px;" @click="item.launch = false">⬇展开</div>
                    <div v-show="!item.launch" style="cursor: pointer;font-size: 15px;" @click="item.launch = true">⬆收起</div>
                </div>
                <div v-else-if="item.dataType == '5' && item.filedList && item.filedList.length > 0"
                    class="dis-flex flex-d pad-t-10 pad-b-10 pad-r-20 pad-l-20">
                    <template v-if="item.filedList.length > 1">
                        <div class="strain-switcher mar-b-10">
                            <template v-if="item.filedList.length <= MAX_VISIBLE_STRAINS">
                                <el-radio-group
                                    :model-value="getSelectedStrainIndex(getBlockKey(index))"
                                    @update:model-value="(i) => setSelectedStrainIndex(getBlockKey(index), i)"
                                    size="small">
                                    <el-radio-button
                                        v-for="(obj, fi) in item.filedList"
                                        :key="fi"
                                        :label="fi">
                                        {{ obj.name }}
                                    </el-radio-button>
                                </el-radio-group>
                            </template>
                            <template v-else>
                                <span class="strain-label">{{ (i18n === 'zh' ? '选择菌株：' : 'Strain: ') }}</span>
                                <el-select
                                    :model-value="getSelectedStrainIndex(getBlockKey(index))"
                                    @update:model-value="(i) => setSelectedStrainIndex(getBlockKey(index), i)"
                                    size="small"
                                    class="strain-select"
                                    :placeholder="i18n === 'zh' ? '请选择菌株' : 'Select strain'">
                                    <el-option
                                        v-for="(obj, fi) in item.filedList"
                                        :key="fi"
                                        :label="obj.name"
                                        :value="fi" />
                                </el-select>
                            </template>
                        </div>
                        <div v-if="getSelectedFiledItem(item, index)" style="border:1px dashed #ccc;padding:10px;padding-top:0;border-radius:10px;">
                            <div class="fts-12" style="color:var(--el-theme-color);padding:10px 0">{{ getSelectedFiledItem(item, index).name }}</div>
                            <ul>
                                <li v-for="(obj1,key1) in getSelectedFiledItem(item, index).data" :key="key1">
                                    <p class="p_box fts-12 text-w-400 pad-l-16">
                                        <span class="lable3">{{ capitalizeFirstLetter(key1) }}</span>
                                        <b class="b"></b>
                                        <span class="span_value" v-html="obj1 ? obj1 : ''"></span>
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="(obj,key) in item.filedList" :key="key" style="border:1px dashed #ccc;padding:10px;padding-top:0;border-radius:10px;">
                            <div class="fts-12" style="color:var(--el-theme-color);padding:10px 0">{{obj.name}}</div>
                            <ul>
                                <li v-for="(obj1,key1) in obj.data" :key="key1">
                                    <p class="p_box fts-12 text-w-400 pad-l-16">
                                        <span class="lable3">{{capitalizeFirstLetter(key1) }}</span>
                                        <b class="b"></b>
                                        <span class="span_value" v-html="obj1 ? obj1 : ''"></span>
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
                <div v-else-if="item.dataType=='9' && item.tableList && item.tableList.length > 0">
                    <div class="dis-flex pad-15">
                        <div class="fl-1 mar-r-15">
                            <Dagre :nodes="item.tableList[0].nodes" :edges="item.tableList[0].edges"/>
                        </div>
                        <div >
                            <div class="dis-flex flex-d align-fe mar-b-50">
                                <span class="w-120 h-30text-center fts-12 mar-b-10 dis-flex align-c just-c-c" style="color:#fff;" v-for="item in nodeData" :key="item.name" :style="{background:item.color}">{{ item.name }}</span>
                            </div>
                            <div class="dis-flex flex-d">
                                <div class="dis-flex mar-b-10 align-c pos-r" v-for="item in lineData" :key="item.id" >
                                    <span class="w-30 h-30 dis-flex align-c just-c-c fts-12" style="border:1px solid #333;">A</span>
                                    <span class="pos-a left-50p top-50p fts-12 text-w-800 w-200 text-center" style="transform: translate(-50%, -23px);">{{ item.name }}</span>
                                    <svg width="200" height="20" viewBox="0 0 200 20">
                                        <line x1="0" y1="10" x2="200" y2="10" :stroke="item.color" stroke-width="2" :stroke-dasharray="item.type=='dashed'?'3':'0'"/>
                                        <polygon points="200,10 190,15 192,10 190,5" :fill="item.color" />
                                    </svg>
                                    <span class="w-30 h-30 dis-flex align-c just-c-c fts-12" style="border:1px solid #333;">B</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="item.dataType == '10'&& item.childList && item.childList.length > 0" >
                    <p class="p_box" v-if="item.childList && item.childList.length">
                        <span class="lable3 fts-12 pad-l-15">{{ capitalizeFirstLetter(item.childList[0].showName) }}</span>
                        <b class="b"></b>
                        <el-button type="primary" size="small" @click="godetail1(item.childList[1],item.childList[0])">{{ item.childList[0].fieldValue }}</el-button>
                    </p>
                </div>
                <div v-else-if="item.dataType=='11' && item.childList && item.childList.length > 0">
                    <div class="dis-flex pad-15 flex-d">
                        <div class="dis-flex">
                            <span :class="ind_11==item1?'active':'tab'" class="w-100 h-40 dis-flex align-c just-c-c fts-12"
                                style="border-right:1px solid #ddd;cursor: pointer;"
                            v-for="(item1,index1) in list_11" :key="index1" @click="ind_11=item1;getSvg(item.childList[0].fieldValue)">{{ item1 }}</span>
                        </div>
                        <div>
                          <span id="svg_box"></span>
                        </div>
                    </div>
                </div>
                <template v-else>
                    <detail-content v-if="item.childList" :items="item.childList" :parent-key="getBlockKey(index)" />
                </template>
            </li>
            <li v-else></li>
        </template>
        <el-dialog :title="i18n=='zh'?'文本':'Text'" v-model="dialogVisible" width="80%" modal-class="dialogBox"  class="max-h-80p" >
            <div class="fl-1 dis-flex flex-d ov-h">
                <div class="fl-1 ov-h ov-y-a">
                {{ dialogContent }}
                </div>
                <div class="dis-flex just-c-fe mar-t-10">
                <el-button type="primary" size="small" @click="downloadText()">{{i18n=='zh'?'下载':'Download'}}</el-button>
                </div>
            </div>
        </el-dialog>
    </ul>
</template>

<script setup>
defineOptions({ name: 'DetailContent' })
import { onMounted, computed, ref } from 'vue';
import Dagre from './DagreGraph.vue';
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
const props = defineProps({
  items: { type: Array, default: () => [] },
  parentKey: { type: String, default: '' }
})

// 菌株切换：≤4 个用按钮，>4 个用下拉；下拉宽度适中
const MAX_VISIBLE_STRAINS = 4
// 每个导航条目下多 strain 时，当前选中的 strain 下标（key = blockKey）
const selectedStrainByKey = ref({})
function getBlockKey(index) {
  return props.parentKey === '' ? String(index) : `${props.parentKey}-${index}`
}
function getSelectedStrainIndex(blockKey) {
  return selectedStrainByKey.value[blockKey] ?? 0
}
function setSelectedStrainIndex(blockKey, index) {
  selectedStrainByKey.value = { ...selectedStrainByKey.value, [blockKey]: index }
}
function getSelectedStr(item, index) {
  if (!item.tableList || !item.tableList.length) return null
  const i = getSelectedStrainIndex(getBlockKey(index))
  return item.tableList[i] || item.tableList[0]
}
function getSelectedFiledItem(item, index) {
  if (!item.filedList || !item.filedList.length) return null
  const i = getSelectedStrainIndex(getBlockKey(index))
  return item.filedList[i] || item.filedList[0]
}

const nodeData=ref([{
    name:'Process',
    color:'#00709b',
},{
    name:'Function',
    color:'#404040',
},{
    name:'Component',
    color:'#93a661',
}])
const lineData=ref([{
    id:'is_a',
    name:'Is a',
    type:'solid',
    color:'#000000',
},{
    id:'part_of',
    name:'Part of',
    type:'solid',
    color:'#0000ff',
},{
    id:'regulates',
    name:'Regulates',
    type:'solid',
    color:'#ffc000',
},{
    id:'positively_regulates',
    name:'Positively regulates',
    type:'solid',
    color:'#00ff00',
},{
    id:'negatively_regulates',
    name:'Negatively regulates',
    type:'solid',
    color:'#FF0000',
},{
    id:'occurs_in',
    name:'Occurs in',
    type:'solid',
    color:'#008080',
},{
    id:'capable_of',
    name:'Capable of',
    type:'dashed',
    color:'#0080ff',
},{
    id:'capable_of_part_of',
    name:'Capable of part of',
    type:'dashed',
    color:'#ff8000',
}])

const ind_11=ref('bpcons')
const list_11=ref(['bpcons','cov','ent','maxcm','norm','seqcons','cons'])

const setSvg=()=>{
    var ind=props.items.findIndex(s=>s.dataType=='11')
    if(ind>-1){
        getSvg(props.items[ind].childList[0].fieldValue)
    }
}

const dialogVisible = ref(false)
const dialogContent = ref('')
const contentName = ref('')
const capitalizeFirstLetter = (string) => {
    return string.replace(/\b[a-z]/g, function (match) {
        return match.toUpperCase();
    });
}
// 列头左对齐，宽度 = 列头文本长度(px) + 右侧留白 + 单元格内边距
// 英文约9px/字符，中文约16px/字符，右侧留白10px，单元格默认左右各12px
const getColumnHeaderWidth = (text) => {
    if (!text) return 34
    const textWidth = [...String(text)].reduce((sum, c) => sum + (c.charCodeAt(0) > 127 ? 16 : 9), 0)
    return textWidth + 10 + 24  // 10右侧留白 + 24单元格左右内边距
}
const gobasic = (e) => {
    if (e.url) {
        sessionStorage.setItem('basic_information_id', e.url)
        sessionStorage.setItem('zwType', 'Microbe')
        window.open('/basic_information', '_blank')
    }
}

const getSvg= async (val)=>{
    // const response = await fetch(`/gb-api/structure/${ind_11.value}/${val}.xml`);
    const response = await fetch(`https://www.imicap.com:8443/structure/${ind_11.value}/${val}.xml`);
    if(response.ok){
        const text = await response.text(); // 获取 XML 文件的文本内容
        nextTick(() => {
            if(document.getElementById('svg_box')){
                document.getElementById('svg_box').innerHTML = text
            }
        })
    }else{
        nextTick(() => {
            if(document.getElementById('svg_box')){
                document.getElementById('svg_box').innerHTML = ''
            }
        })
    }
}
const godetail1 = (item,val) => {
  dialogVisible.value = true
  dialogContent.value = item.fieldValue
  contentName.value = val.fieldValue
}
const downloadText = () => {
  // 创建一个 Blob 对象，指定类型为 text/plain
  const blob = new Blob([dialogContent.value], { type: "text/plain;charset=utf-8"});

  // 创建一个下载链接
  const link = document.createElement("a");

  // 使用 URL.createObjectURL 创建一个指向 Blob 的 URL
  link.href = URL.createObjectURL(blob);

  // 设置下载文件的名称
  link.download = contentName.value?contentName.value+'.txt':'download.txt';

  // 触发点击事件以下载文件
  document.body.appendChild(link);
  link.click();

  // 下载完成后移除链接并释放 URL 对象
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
const goDetail = (val, type) => {
    if (type == '1') {
        var str = val.split('/')
        if (str[0] == 'disease') {
            sessionStorage.setItem('disease_id', str[1])
            sessionStorage.setItem('zw1Type', str[0])
            window.open('/disease', '_blank')
        } else if (str[0] == 'small_molecule') {
            sessionStorage.setItem('small_molecule_id', str[1])
            sessionStorage.setItem('zw1Type', str[0])
            window.open('/small_molecule', '_blank')
        } else if (str[0] == 'protein') {
            sessionStorage.setItem('protein_id', str[1])
            sessionStorage.setItem('zwType', str[0])
            window.open('/protein', '_blank')
        } else if (str[0] == 'gene') {
            sessionStorage.setItem('zw1Type', str[0])
            sessionStorage.setItem('gene_id', str[1])
            window.open('/gene', '_blank')
        } else if (str[0] == 'rna') {
            sessionStorage.setItem('rna_id', str[1])
            window.open('/rna', '_blank')
        } else if (str[0] == 'go_terms') {
            sessionStorage.setItem('go_terms_id', str[1])
            window.open('/go_terms', '_blank')
        }
    } else {

    }
}
const getLink=(item)=>{
    console.log(item)
  if(item.urlType=='2'){
    var b=[]
    if(item.url){
      b=item.url.split(',').map(val=>val.split('|'))
    }
    var str = item.fieldValue.split(';').map(val => {
      var ind = b.findIndex(s=>s[0].trim() == val.split(':')[0].trim())
      if(ind != -1){
        var link=b[ind][1].replace(`{${b[ind][0]}}`,val.split(':')[1].trim())
        return `<a href="${link}" class="interlinkage" target="_blank">${val}</a>`;
      }else{
        return val;
      }
    }).join(';');
    return str;
  } else if(item.urlType=='3'){
    var link=item.url+ item.fieldValue
    return `<a href="${link}" class="interlinkage" target="_blank">${item.fieldValue}</a>`;
  } else{
    return item.fieldValue
  }
}
const getTableLink=(item,row)=>{
    if(item.urlType=='2'){
        var b=[]
        if(item.url){
            b=item.url.split(',').map(val=>val.split('|'))
        }
        var str = row[item.showName].split(';').map(val => {
            var ind = b.findIndex(s=>s[0].trim() == val.split(':')[0].trim())
            if(ind != -1){
            var link=b[ind][1].replace(`{${b[ind][0]}}`,val.split(':')[1].trim())
                return `<a href="${link}" class="interlinkage" target="_blank">${val}</a>`;
            }else{
                return val;
            }
        }).join(';');
        return str;
    }else if(item.urlType=='3'){
        var link=item.url + row[item.showName]
        return `<a href="${link}" class="interlinkage" target="_blank">${row[item.showName]}</a>`;
    }else{
        return row[item.showName]
    }
}
onMounted(() => {
    setSvg()
    // console.log(props.items, 'kkk');
})
</script>

<style scoped lang="scss">
::v-deep .el-table th.el-table__cell {
    background-color: #DFFBEF !important;
}
::v-deep .el-table th.el-table__cell>.cell {
    color: #666666;
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 15px;
    font-weight: 600;

    &>div {
        white-space: normal;
        word-wrap: break-word;
        word-break: break-word;
        line-height: 1.35;
    }
}
/* 表格内容单元格字体略小于列头 */
::v-deep .el-table td.el-table__cell>.cell {
    font-size: 13px;
}

li {
    list-style: none;
    line-height: 25px;
}

.lis1 {
    box-shadow: 0 2px 5px gainsboro;
    background-color: #fbfeff;
    border-radius: .2rem;
    margin-bottom: 15px;
    // color: red;
}

.p_box {
    display: flex;
    padding: 5px 0;

}

.p_1 {
    border-bottom: 1px dashed #DCF1EE;
    line-height: 40px;
    margin: 0 16px;
    color: var(--el-theme-color);
    position: relative;
}
.p_1::before {
    content: '';
    width: 3px;
    height: 40%;
    position: absolute;
    left: 0px;
    top: 30%;
    z-index: 999;
    background-color: var(--el-theme-color);
}

.lable3 {
    width: 100px;
    word-wrap: break-word;
    color: #666;

}

.more {
    color: blue !important;
}

.more:hover {
    text-decoration: underline;
}

.b {
    width: 1px;
    background: var(--el-theme-color);
    margin: 0 10px;
    opacity: 30%;
}

.span_value {
    flex: 1;
    overflow: auto;
}

/* 自定义整个滚动条 */
.span_value::-webkit-scrollbar {
    height: 5px;
    /* 设置滚动条的宽度 */
    background-color: #f9f9f9;
    /* 滚动条的背景色 */
}

/* 自定义滚动条轨道 */
.span_value::-webkit-scrollbar-track {
    background: #e1e1e1;
    /* 轨道的背景色 */
    border-radius: 5px;
    /* 轨道的圆角 */
}

/* 自定义滚动条的滑块（thumb） */
.span_value::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    /* 滑块的背景色 */
    border-radius: 5px;
    /* 滑块的圆角 */
}

/* 当滑块悬停或活动时的样式 */
.span_value::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
    /* 悬停或活动状态下滑块的背景色 */
}

.list_ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    li {
        min-width: 50%;
        padding-right: 30px;

    }
}

.ellipsis-multiline {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
}
.tab{
    background: #f5f5f5;
    color:#333;
}
.active{
    background: var(--el-theme-color);
    color:#fff;
}

.strain-switcher {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.strain-switcher :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
/* 圆角与边框：小圆角、细边框，每个按钮独立圆角 */
.strain-switcher :deep(.el-radio-button) {
  margin: 0;
}
.strain-switcher :deep(.el-radio-button__inner) {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}
.strain-switcher :deep(.el-radio-button:not(.is-active) .el-radio-button__inner:hover) {
  border-color: var(--el-theme-color);
  color: var(--el-theme-color);
}
.strain-switcher :deep(.el-radio-button.is-active .el-radio-button__inner) {
  border-color: var(--el-theme-color);
  background: color-mix(in srgb, var(--el-theme-color) 12%, transparent);
  color: var(--el-theme-color);
  box-shadow: none;
}
.strain-switcher :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  box-shadow: none;
}
.strain-label {
  font-size: 12px;
  color: #666;
  margin-right: 6px;
}
.strain-select {
  width: 200px;
  max-width: 100%;
}
.strain-select :deep(.el-input__wrapper) {
  padding: 4px 10px;
  border-radius: 6px;
}
</style>