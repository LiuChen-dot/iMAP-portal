<template>
  <div>
    <el-card class="box-card mar-t-10">
      <template #header>
        <div class="card-header">
          <span>资产类目分布</span>
          <el-radio-group v-model="type" class="pull-right">
            <el-radio-button label="管理视角" />
            <el-radio-button label="业务视角" />
          </el-radio-group>
        </div>
      </template>
      <el-row  class="mar-b-10 h-380"> 
        <el-col :span="5" class="text-white text-center dis-flex align-c flex-d just-c-c" :style="{'background':'#409EFF'}">
            <div>供应链中心</div>
            <div>资产数 29092条</div>
            <div>空间：90GB</div>
        </el-col>
        <el-col :span="9">
            <div class="text-white text-center dis-flex align-c flex-d just-c-c h-50p" :style="{'background':'#67C23A'}">
                <div>研发中心</div>
                <div>资产数 29092条</div>
                <div>空间：90GB</div>
            </div>
            <div class="text-white text-center dis-flex align-c flex-d just-c-c h-50p" :style="{'background':'#F56C6C'}">   
                <div>营销中心</div>
                <div>资产数 29092条</div>
                <div>空间：43GB</div>
            </div>
        </el-col>
        <el-col :span="5" class="text-white text-center dis-flex align-c flex-d just-c-c" :style="{'background':'#E6A23C'}">
            <div>财务中心</div>
            <div>资产数 29092条</div>
            <div>空间：130GB</div>
        </el-col>
        <el-col :span="5" class="text-white text-center dis-flex align-c flex-d just-c-c" :style="{'background':'#909399'}">
            <div>数字化中心</div>
            <div>资产数 29092条</div>
            <div>空间：910GB</div>
        </el-col>
    </el-row>
    </el-card>
  </div>
</template>
<script setup>
const type = ref('管理视角');

</script>
<style lang="scss" scoped></style>
