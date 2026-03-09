/**
 * 16S 分析流程模块与卡片配置（与后端 scriptsId 对应）
 * 用于单页分析工作台左侧索引导航与右侧 section + card-grid
 */
export const ANALYSIS_SECTIONS = [
  {
    id: 'sequence',
    titleKey: 'sixteensAnalysis.sequence',
    titleZh: '序列处理分析',
    titleEn: 'Sequence Processing',
    cards: [
      { key: 'dada2', titleZh: 'DADA2 降噪', titleEn: 'DADA2 Denoising', descZh: '序列降噪与错误校正', descEn: 'Sequence denoising and error correction', scriptsId: 21 },
      { key: 'annotation', titleZh: '物种注释', titleEn: 'Taxonomic Annotation', descZh: '代表序列物种注释', descEn: 'Taxonomic annotation of representative sequences', scriptsId: 22 },
      { key: 'phylogeny', titleZh: '构建系统发生树', titleEn: 'Phylogenetic Tree', descZh: '多序列比对与进化树构建', descEn: 'Multiple alignment and phylogeny', scriptsId: 23 },
      { key: 'rarefy', titleZh: 'ASV/OTU 抽平', titleEn: 'ASV/OTU Rarefaction', descZh: '丰度表抽平', descEn: 'Rarefaction of abundance table', scriptsId: 24 },
    ],
  },
  {
    id: 'composition',
    titleKey: 'sixteensAnalysis.composition',
    titleZh: '物种组成分析',
    titleEn: 'Taxonomic Composition',
    cards: [
      { key: 'heatmap', titleZh: 'Heatmap', titleEn: 'Heatmap', descZh: '样本/分组热图', descEn: 'Sample/group heatmap', scriptsId: 1 },
      { key: 'circos', titleZh: 'Circos', titleEn: 'Circos', descZh: '物种关系图', descEn: 'Species relation diagram', scriptsId: 2 },
      { key: 'upset', titleZh: 'Upset', titleEn: 'UpSet', descZh: '集合关系图', descEn: 'Set intersection plot', scriptsId: 3 },
      { key: 'stackbar', titleZh: '堆叠柱状图', titleEn: 'Stacked Bar', descZh: '堆叠柱状图、分组堆叠图', descEn: 'Stacked bar and grouped stack', scriptsId: 4 },
      { key: 'impactbar', titleZh: '冲击柱状图', titleEn: 'Impact Bar', descZh: '冲击柱状图、分组冲击图', descEn: 'Impact bar and grouped impact', scriptsId: 26 },
    ],
  },
  {
    id: 'alpha',
    titleKey: 'sixteensAnalysis.alpha',
    titleZh: 'Alpha 多样性分析',
    titleEn: 'Alpha Diversity',
    cards: [
      { key: 'alpha-index', titleZh: 'Alpha 多样性指数', titleEn: 'Alpha Diversity Index', descZh: 'Alpha 多样性表格及多样性箱线图', descEn: 'Alpha diversity table and boxplots', scriptsId: 5 },
      { key: 'rarefaction', titleZh: '稀释曲线', titleEn: 'Rarefaction Curve', descZh: '稀释曲线', descEn: 'Rarefaction curve', scriptsId: 6 },
      { key: 'accumulation', titleZh: '物种累积曲线', titleEn: 'Species Accumulation Curve', descZh: '物种累积曲线', descEn: 'Species accumulation curve', scriptsId: 7 },
      { key: 'rank-abundance', titleZh: '丰度等级曲线', titleEn: 'Rank Abundance Curve', descZh: '丰度等级曲线', descEn: 'Rank abundance curve', scriptsId: 8 },
    ],
  },
  {
    id: 'beta',
    titleKey: 'sixteensAnalysis.beta',
    titleZh: 'Beta 多样性分析',
    titleEn: 'Beta Diversity',
    cards: [
      { key: 'upgma', titleZh: 'UPGMA', titleEn: 'UPGMA', descZh: 'Bray-Curtis / UniFrac 聚类', descEn: 'Bray-Curtis / UniFrac clustering', scriptsId: 9 },
      { key: 'pca', titleZh: 'PCA', titleEn: 'PCA', descZh: '主成分分析图', descEn: 'Principal component analysis', scriptsId: 10 },
      { key: 'pcoa', titleZh: 'PCoA', titleEn: 'PCoA', descZh: 'Bray / UniFrac PCoA', descEn: 'Bray / UniFrac PCoA', scriptsId: 11 },
      { key: 'nmds', titleZh: 'NMDS', titleEn: 'NMDS', descZh: '非度量多维标度', descEn: 'Non-metric multidimensional scaling', scriptsId: 12 },
      { key: 'plsda', titleZh: 'PLS-DA', titleEn: 'PLS-DA', descZh: '偏最小二乘判别分析', descEn: 'Partial least squares discriminant analysis', scriptsId: 13 },
    ],
  },
  {
    id: 'differential',
    titleKey: 'sixteensAnalysis.differential',
    titleZh: '差异/标志物',
    titleEn: 'Differential / Biomarkers',
    cards: [
      { key: 'lefse', titleZh: 'LEFSe 分析', titleEn: 'LEFSe Analysis', descZh: 'LDA 分布柱状图、进化支图', descEn: 'LDA bar plot and cladogram', scriptsId: 14 },
      { key: 'randomforest', titleZh: '随机森林', titleEn: 'Random Forest', descZh: '随机森林与 PLS-DA', descEn: 'Random forest and PLS-DA', scriptsId: 15 },
    ],
  },
  {
    id: 'phylogeny-analysis',
    titleKey: 'sixteensAnalysis.phylogenyAnalysis',
    titleZh: '系统进化',
    titleEn: 'Phylogenetic Analysis',
    cards: [
      { key: 'tree-heatmap', titleZh: '进化树热图', titleEn: 'Phylogenetic Heatmap', descZh: '进化树与热图结合', descEn: 'Phylogenetic tree with heatmap', scriptsId: 16 },
    ],
  },
  {
    id: 'environment',
    titleKey: 'sixteensAnalysis.environment',
    titleZh: '环境因子关联',
    titleEn: 'Environmental Factors',
    cards: [
      { key: 'cca', titleZh: 'CCA', titleEn: 'CCA', descZh: '样本-环境因子 CCA 图', descEn: 'Sample-environment CCA', scriptsId: 17 },
      { key: 'rda', titleZh: 'RDA', titleEn: 'RDA', descZh: '样本-环境因子 RDA 图', descEn: 'Sample-environment RDA', scriptsId: 17 },
      { key: 'corr-heatmap', titleZh: '相关性热图', titleEn: 'Correlation Heatmap', descZh: '物种/环境相关性热图', descEn: 'Taxa/environment correlation heatmap', scriptsId: 18 },
    ],
  },
  {
    id: 'network',
    titleKey: 'sixteensAnalysis.network',
    titleZh: '网络分析',
    titleEn: 'Network Analysis',
    cards: [
      { key: 'network', titleZh: '关联网络图', titleEn: 'Correlation Network', descZh: 'networkone 关联网络', descEn: 'Networkone correlation network', scriptsId: 19 },
    ],
  },
  {
    id: 'functional-prediction',
    titleKey: 'sixteensAnalysis.functionalPrediction',
    titleZh: '功能预测（PICRUSt2）',
    titleEn: 'Functional Prediction (PICRUSt2)',
    cards: [
      { key: 'picrust2', titleZh: 'PICRUSt2 功能预测', titleEn: 'PICRUSt2 Functional Prediction', descZh: 'EC-PCA、KO-PCA、KEGG-PCA、metacyc-PCA 分析图', descEn: 'EC-PCA, KO-PCA, KEGG-PCA, metacyc-PCA analysis', scriptsId: 20 },
    ],
  },
]
