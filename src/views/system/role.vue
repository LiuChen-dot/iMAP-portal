<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索框 -->
      <div class="mar-t-30 searchbox">
        <el-input placeholder="请输入关键字" clearable>
          <template #prepend>
            <el-select
              v-model="select"
              placeholder="Select"
              style="width: 120px"
              collapse-tags
            >
              <el-option
                v-for="item in selectOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-input>
        <el-button icon="Search"></el-button>
      </div>
      <div class="search mar-t-20">
        <span class="text">Gene</span>
        <span class="text">RNA</span>
        <span class="text">Protain</span>
        <span class="text">Pathway</span>
        <span class="text">Species</span>
      </div>
      <el-divider />
      <!-- 内容 -->
      <el-card>
        <div>
          <span>GBFF</span>
          <div class="mar-t-10">
            hypothetical protein (plasmid) [Escherichia coli].
          </div>
          <div class="mar-t-10" style="font-size: 15px">
            GenBank：<span style="color: #4579a8">AER93371.1</span>
          </div>
        </div>
        <el-divider />
        <div>111111</div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const select = ref("1");
// 搜索框
const selectOptions = [
  {
    value: "1",
    label: "All",
  },
  {
    value: "2",
    label: "Gene",
  },
  {
    value: "3",
    label: "RNA",
  },
  {
    value: "4",
    label: "Protein",
  },
  {
    value: "5",
    label: "Pathway",
  },
  {
    value: "6",
    label: "Peaction",
  },
  {
    value: "7",
    label: "Small Molecule",
  },
];
</script>

<style lang="scss" scoped>
.search {
  text-align: center;
  & > .text {
    color: #4f80e3;
    margin-right: 40px;
  }
}
.searchbox {
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: center;
  margin-top: -30px;
  ::v-deep(.el-input__wrapper) {
    box-shadow: none;
  }
  .el-input {
    padding: 10px 0;
    padding-left: 40px;
    padding-right: 80px;
    font-size: 18px;
    background-color: white;
    border: 1px solid gray;
    border-radius: 30px;
    width: 800px;
    height: 60px;
    .el-select {
      position: relative;
      border-radius: 30px;
    }
  }
  .el-button {
    position: relative;
    font-size: 30px;
    border-radius: 30px;
    border-color: gray;
    width: 110px;
    height: 60px;
    margin-left: -50px;
  }
}

.border-left {
  padding-left: 80px;
  border-left: 1px solid #cdcdcd;
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
