<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索框 -->
      <div class="mar-t-30">
        <Search />
      </div>
      <!-- 内容 -->
      <div class="content">
        <span>GBFF</span>
        <div class="mar-t-10">
          hypothetical protein (plasmid) [Escherichia coli].
        </div>
        <div class="mar-t-10" style="font-size: 15px">
          GenBank：<span style="color: #4579a8">AER93371.1</span>
        </div>
      </div>
      <div class="mar-t-10 content">111</div>
    </el-card>
  </div>
</template>

<script setup>
import Search from "./search.vue";
import { reactive, ref } from "vue";


</script>

<style lang="scss" scoped>
.border-left {
  padding-left: 80px;
  border-left: 1px solid #cdcdcd;
}

.content {
  padding: 60px 80px;
  background-color: #ecf1f7;
}
.border-top {
  margin: 0 50px;
  border-top: 1px solid #000;
}

::v-deep(.el-input-group__prepend) {
  background: none;
  box-shadow: none;
}

::v-deep(.el-input-group--prepend
  .el-input-group__prepend
  .el-select
  .el-input
  .el-input__wrapper) {
  box-shadow: none;
  color: #000;
}
</style>
