<template>
  <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
    <div style="position: relative;">
      <el-carousel style="" height="657px" arrow="always">
        <el-carousel-item v-for="(item, index) in banner" :key="index">
          <div class="w-100p h-100p">
            <img :src="item" alt="" class="w-100p h-100p">
          </div>
        </el-carousel-item>
      </el-carousel>
      <div style="position: absolute;z-index: 10;left: 50%;transform: translateX(-50%);top: 280px;">
        <Search />
      </div>
      <div class="mask"></div>
    </div>
    <div class="listbox">
      <div class="top">
        <div @click="changeList(item, index)" :class="active == index ? 'active' : ''" v-for="(item, index) in typeList"
          :key="index">{{ item.showName == 'basic_information' ? 'Microbe' : item.showName }}
        </div>
      </div>
      <div class="content">
        <div>
          <img :src='typeList[active]?.imgurl' />
        </div>
        <div>
          <div>{{ activename == 'basic_information' ? 'Microbe' : activename }}</div>

          <div>
            <div v-if="i18n=='en'"> 
              <template v-if="activename == 'Microbe'">
                As of {{ timeEn }}, this platform has indexed a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
              <template v-if="activename == 'Gene'">
                As of {{ timeEn }}, this platform has accumulated a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
              <template v-if="activename == 'RNA'">
                As of {{ timeEn }}, this platform has accumulated a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
              <template v-if="activename == 'Protein'">
                As of {{ timeEn }}, this platform has indexed a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
              <template v-if="activename == 'Small Molecule'">
                As of {{ timeEn }}, this platform has amassed a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
              <template v-if="activename == 'Disease'">
                As of {{ timeEn }}, this platform has indexed a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
              <template v-if="activename == 'GO'">
                As of {{ timeEn }}, this platform has indexed a total of {{ activecount }} {{activename}}-related data entries, and will continue to expand the data within the platform in the future.
              </template>
            </div>
            <div v-else>截止到{{ time }}，本平台已收录{{ activename == 'basic_information' ? 'Microbe' : activename }}相关数据条目累计<span>{{
              activecount }}</span>条，后续还会持续对平台内数据进行扩充。</div>
          </div>
          <div class="lookAllbut" @click="godetail">{{i18n=='en'?'See more':'查看更多'}}</div>
        </div>
      </div>
    </div>

    <div class="modulebox">
      <div class="toptitle" v-if="i18n=='zh'">智能微生物大数据平台，开启微生物研究新范式</div>
      <template v-else>
        <div class="toptitle">Intelligent Microbial Big Data Platform:</div>
        <div class="toptitle">Ushering in a New Paradigm for Microbiological Research</div>
      </template>
      <div class="floortitle">{{i18n=='zh'?'AI+多模态数据融合，一站式科研解决方案':'AI-Driven Multimodal Data Integration, End-to-End Scientific Workflow Platform'}}</div>
      <div class="content">
        <div>
          <div><img :src="modulebox1" />{{i18n=='en'?'Knowledge Search':'知识检索'}}</div>
          <div v-if="i18n=='zh'">
            知识检索作为平台的核心组成部分，整合了全面的微生物学数据资源，包括基因组序列、功能注释、生态特征及实际应用案例等关键信息。通过智能化的多维度检索和筛选系统，研究人员可快速定位目标数据，为实验方案设计和菌种选择提供精准的决策支持。本模块持续跟踪学科前沿动态，确保所有数据资源与最新研究进展同步更新。
          </div>
          <div v-else>
            Knowledge Search as the core component of the platform, integrates comprehensive microbiological data resources, including key information such as genomic sequences, functional annotations, ecological characteristics, and practical application cases. Powered by an intelligent multi-dimensional search and filtering system, researchers can quickly locate target data, enabling precise decision-making support for experimental design and microbial strain selection. This module continuously tracks cutting-edge advancements in the field, ensuring all data resources are synchronized with the latest research developments.
          </div>
          <div>→</div>
        </div>
        <div @click="routers.push('/KnowledgeGraph')">
          <div><img :src="modulebox2" />{{i18n=='en'?'Knowledge Graph':'知识图谱'}}</div>
          <div v-if="i18n=='zh'">
            知识图谱整合了丰富的多模态数据，采用不确定性感知的知识图谱嵌入算法进行推理，能够融合异构数据并考量知识的不确定性，从而显著提升推理准确性。这一技术能力可帮助微生物研究者发现新的微生物学认知，挖掘具有潜力的研究方向；同时也能助力制药企业针对特定疾病开展高效的大规模筛选，发现潜在的活体生物药（LBP），加速药物临床前研发进程。
          </div>
          <div v-else>
            The knowledge graph integrates rich multimodal data and employs uncertainty-aware knowledge graph embedding algorithms for reasoning. This advanced approach enables the fusion of heterogeneous data while effectively accounting for knowledge uncertainty, thereby significantly improving inference accuracy.
          </div>
          <div>→</div>
        </div>
        <div @click="routers.push('/16S')">
          <div><img :src="modulebox3" />{{i18n=='en'?'16S rRNA gene sequencing':'16S 测序分析'}}</div>
          <div v-if="i18n=='zh'">
            16S rRNA基因测序技术是一种广泛应用于微生物组研究的高通量测序方法，主要用于解析细菌和古菌群落的组成特征与多样性。该技术基于微生物16S rRNA基因中保守区与高变区并存的特点，通过特异性扩增可变区域（如V3-V4区）实现微生物种类鉴定。
          </div>
          <div v-else>
            16S rRNA gene sequencing is a high-throughput sequencing method widely used in microbiome research, primarily for analyzing the composition and diversity of bacterial and archaeal communities. This technique leverages the characteristic structure of the microbial 16S rRNA gene, which contains both conserved regions and hypervariable regions. By specifically amplifying these variable regions (e.g., V3-V4 regions), it enables accurate microbial taxonomic identification.
          </div>
          <div>→</div>
        </div>
        <div @click="routers.push('/GenomeBrowser')">
          <div><img :src="modulebox4" />{{i18n=='en'?'Genome Browser':'基因组浏览器'}}</div>
          <div v-if="i18n=='zh'">
            基因组浏览器是生物信息学研究中不可或缺的可视化分析工具，能够实现对基因组特定区域及其注释信息的交互式探索。该工具通过整合多源基因组数据，支持研究人员深入解析基因组结构与功能特征，在新基因发现、调控元件鉴定以及基因-疾病关联研究等领域发挥关键作用。其核心功能包括：基因组全序列导航（涵盖基因、转录本、SNP、CpG岛等要素）、多维度注释信息展示（整合已知基因、预测基因及EST等数据）、为不同研究场景下的基因组数据分析提供全面解决方案。
          </div>
          <div v-else>
            The Genome Browser (Gene Browser) is an indispensable visualization and analysis tool in bioinformatics research, enabling interactive exploration of specific genomic regions and their annotation information. By integrating multi-source genomic data, this tool empowers researchers to conduct in-depth analysis of genomic structure and functional features, playing a pivotal role in new gene discovery, regulatory element identification, and gene-disease association studies. Its core functionalities include: whole-genome sequence navigation (covering genes, transcripts, SNPs, CpG islands, etc.), multi-dimensional annotation display (integrating known genes, predicted genes, ESTs and other data), and providing comprehensive solutions for genomic data analysis across various research scenarios.
          </div>
          <div>→</div>
        </div>
        <div @click="routers.push('/IntelligentQ&A')">
          <div><img :src="modulebox4" />{{i18n=='en'?'Intelligent Q&A System':'智能问答'}}</div>
          <div v-if="i18n=='zh'">
            智能问答系统突破传统数据库查询的格式限制，通过融合大语言模型（LLM）与知识图谱检索增强生成（RAG）技术，实现了肠道微生物领域的自然语言交互式知识获取。该系统支持研究人员使用日常语言自由提问，智能解析问题意图并整合多源知识生成精准回答，将信息检索效率提升80%以上，显著加速了从菌株特性查询到组学数据分析等各类科研场景的工作进程。
          </div>
          <div v-else>
            The intelligent Q&A system overcomes the formatting limitations of traditional database queries by integrating large language models (LLMs) with knowledge graph-enhanced retrieval-augmented generation (RAG) technology, enabling natural language interactive knowledge acquisition in the gut microbiota field. This system allows researchers to freely pose questions in everyday language, intelligently interprets query intent, and synthesizes multi-source knowledge to generate precise answers—improving information retrieval efficiency by over 80% and significantly accelerating research workflows across various scenarios, from strain characteristic queries to omics data analysis.
          </div>
          <div>→</div>
        </div>
      </div>
    </div>
    <!-- <div class="KnowledgeGraphbox">
      <div class="title">— 知识图谱 —</div>
      <childpage></childpage>
    </div> -->
    <div class="floorTitlebox">
      <div>{{i18n=='zh'?'更懂微生物的数据平台，让科研发现更快人一步':'Smarter Microbial Insights, Faster Scientific Breakthroughs'}}</div>
      <div>
        <div>{{i18n=='zh'?'合作伙伴':'Partner'}}：</div>
        <div style="cursor: pointer;"><img @click="gotogw('https://imi.fudan.edu.cn/index.htm')" style="width: 180px;"
            :src="icon1" /></div>
        <!-- http://tianchat.zenithsafe.com:8669 -->
        <!-- <div style="cursor: pointer;"><img @click="gotogw('')" style="width: 130px;" :src="icon2" /></div> -->
        <!-- <div><img style="width: 180px;" :src="icon1" /></div>
        <div><img style="width: 130px;" :src="icon2" /></div> -->
      </div>
    </div>
    <!-- <div class="statistics">
      <div class="statistics_list">
        <div class="statistics_Item" v-for="(item, index) in typeList" :key="index">
          <div :class="['statistics_box']" :title="item.showName">
            <div class="statistics_icon">
              <img style="width: 80px; height: 80px;" :class="[item.baseDataType]" />
            </div>
            <div :style="item.dataCount != 0 || item.showName == 'taxonomy' ? '' : 'cursor: not-allowed;'"
              class="statistics_cont" @click="godetail(item)">
              <p class="text-w-700">{{ item.showName }}</p>
              <p class="fts-12" v-if="item.showName != 'taxonomy'">{{ item.dataCount == 0 ? '-' : item.dataCount }}</p>
              <p class="fts-12" v-if="item.showName != 'taxonomy'">{{ item.lastUpdateDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div> -->
    <Bottom style="position: relative;"></Bottom>
  </div>
</template>

<script setup>
import Search from './Search/search.vue'
import childpage from '@/views/KnowledgeGraph/childpage.vue'
import { ref } from "vue";
import { formatDate } from '@/utils/index'
import { getsearchAggregation, platformAggregation } from '@/api/data.js'
import { useRoute, useRouter } from 'vue-router'
import icon1 from '@/assets/images/home/icon1.png'
import icon2 from '@/assets/images/home/icon2.png'
import modulebox1 from '@/assets/images/home/modulebox1.svg'
import modulebox2 from '@/assets/images/home/modulebox2.svg'
import modulebox3 from '@/assets/images/home/modulebox3.svg'
import modulebox4 from '@/assets/images/home/modulebox4.svg'
import banner1 from '../assets/images/banner1.jpg'
import banner2 from '../assets/images/banner2.jpg'
import banner3 from '../assets/images/banner3.jpg'
import Bottom from "@/layout/components/Bottom/index.vue"
import basic_information from '@/assets/images/home/basic_information.png'
import Gene from '@/assets/images/home/Gene.png'
import RNA from '@/assets/images/home/RNA.png'
import Protein from '@/assets/images/home/Protein.png'
import small_molecule from '@/assets/images/home/small_molecule.png'
import disease from '@/assets/images/home/disease.png'
import go_terms from '@/assets/images/home/go_terms.png'
import { useLanguageStore } from '@/store/modules/language';
const languageStore = useLanguageStore()
const routers = useRouter()
const i18n = computed(() => languageStore.i18n)

const banner = [banner1, banner2, banner3]
const contentbacimgs = {
  basic_information,
  Gene,
  RNA,
  Protein,
  small_molecule,
  disease,
  go_terms
}
const searchValue = ref('')
const typeList = ref([])
const getsearchAggregationFun = () => {
  platformAggregation().then(res => {
    typeList.value = res.data.dataTypeAndDataSize
    activename.value = typeList.value[0].showName
    activecount.value = typeList.value[0].dataCount
    baseDataType.value = typeList.value[0].baseDataType
    typeList.value.forEach(item => {
      item.imgurl = contentbacimgs[item.baseDataType]
    })
    
  })
  
}

getsearchAggregationFun()
const godetail = (item) => {
  if (item.dataCount != 0 || item.showName == 'taxonomy') {
    //   if (item.showName == 'taxonomy') {
    //     routers.push({ path: '/treeChart' })
    //   } else {
    routers.push({ path: '/Search', query: { type: baseDataType.value } })
    //   }
  }
}

const active = ref(0)
const activename = ref('')
const activecount = ref(0)
const baseDataType = ref('')
const date = new Date()
const time = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
const timeEn = ` ${new Date(2000, date.getMonth()).toLocaleString('en-US', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
const changeList = (item, index) => {
  baseDataType.value = item.baseDataType
  activename.value = item.showName
  activecount.value = item.dataCount
  active.value = index
}

const gotogw = (url) => {
  url ? window.open(url) : ''
}
</script>

<style lang="scss" scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 500px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}

::v-deep(.el-carousel__arrow--left) {
  left: 13%;
}

::v-deep(.el-carousel__arrow--right) {
  right: 13%;
}

.listbox {
  background-color: #F2F3F7;
  height: 680px;
  padding-top: 100px;

  .top {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 1200px;
    gap: 20px;
    margin: 0 auto;

    &>div {
      cursor: pointer;
      font-size: 16px;
      padding: 12px 0;
      flex:1;
      text-align: center;
      background-color: white;
      border-radius: 2px;
    }

    .active {
      background-color: #1ABC9C;
      color: white;
    }
  }

  .content {
    padding-top: 66px;
    display: flex;
    justify-content: center;

    &>div:first-child {
      width: 560px;
      height: 360px;
      background-color: white;

      img {
        width: 100%;
        height: 100%;
      }
    }

    &>div:last-child {
      width: 640px;
      height: 360px;
      background-color: white;
      padding: 54px 58px;

      &>div:first-child {
        padding-bottom: 50px;
        font-size: 24px;
        color: var(--el-theme-color);
      }

      &>div:nth-child(2) {
        font-size: 15px;

        span {
          color: var(--el-theme-color);
        }
      }

      &>div:last-child {
        margin-top: 68px;
        width: 160px;
        line-height: 46px;
        background-color: #F7F7F7;
        text-align: center;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
}

.modulebox {
  padding: 80px 280px 60px;

  .toptitle {
    text-align: center;
    font-size: 32px;
    font-weight: bold;
  }

  .floortitle {
    font-size: 32px;
    text-align: center;
    color: #666;
    padding: 20px 0 40px;
  }

  .content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    &>div {
      width: 49%;
      height: 260px;
      padding: 40px;
      margin: 0 0px;
      margin-bottom: 40px;
      box-shadow: 0 0 18px 0 rgba(224, 224, 224, 0.50);
      position: relative;
      cursor: pointer;

      &>div:first-child {
        font-size: 22px;
        font-weight: bold;
        display: flex;
        align-items: center;

        img {
          width: 28px;
          margin-right: 12px;
        }
      }

      &>div:nth-child(2) {
        font-size: 13px;
        margin: 20px 0;
        display: -webkit-box;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 5;
        -webkit-box-orient: vertical;
        line-height: 22px;
        color: #666;
      }

      &>div:last-child {
        position: absolute;
        bottom: 20px;
        right: 30px;
        text-align: end;
        color: var(--el-theme-color);
      }
    }
  }
}

.lookAllbut:hover {
  color: white;
  background-color: var(--el-theme-color) !important;
}

.KnowledgeGraphbox {
  text-align: center;
  padding-top: 80px;
  background-color: #F2F3F7;

  .title {
    font-weight: bold;
    font-size: 26px;
  }
}

.floorTitlebox {
  text-align: center;
  font-size: 24px;
  font-weight: bold;

  &>div:first-child {
    font-size: 28px;
  }


  &>div:last-child {
    margin-top: 50px;
    height: 80px;
    background-color: #F7F9F8;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #BCBCBC;
    gap: 100px;
  }
}

.mask {
  width: 100%;
  height: 657px;
  background-color: #666;
  opacity: 0.3;
  position: absolute;
  top: 0;
}
</style>