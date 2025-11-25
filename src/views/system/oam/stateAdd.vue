<template>
  <div class="app-container">
    <el-card>
      <!-- 搜索框 -->
      <div>
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
      </div>
      <el-divider />
      <!-- 内容 -->
      <div>
        <div class="mar-b-10">
          <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item>Knowledge Query</el-breadcrumb-item>
            <el-breadcrumb-item>Search Results for XXX</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-row>
          <el-col :span="4">
            <table
              class="mar-t-30"
              style="width: 80%; border-collapse: collapse"
              border="1"
            >
              <tbody>
                <tr v-for="(i, index) in 7" :key="index" class="h-40">
                  <td style="font-size: 15px; text-align: center">
                    分类（数据量）
                  </td>
                </tr>
              </tbody>
            </table>
          </el-col>
          <el-col :span="17" class="border-left">
            <span>9,6655 records from All databases.</span>
            <el-divider />
            <div
              v-for="i in 3"
              :key="i"
              class="detail mar-l-20"
              @click="detailBtn"
            >
              <span class="message-style"
                >PRJNA745548: Human vaginal cells interacting wicth C.glabrata
                index PRJNA745548: Human vaginal cells interacting wicth
                C.glabrata index</span
              >
              <div class="content-style">
                <p>Accession:PRJNA745548</p>
                <p>
                  Title: Human vaginal cells interacting with C. glabrata i...
                </p>
                <p>Species:</p>
                <p>Data Type: BioProject</p>
                <p>
                  Basci Information: PRJNA745548; Raw sequence reads; Medical
                </p>
                <p>Project Source: SRA</p>
                <p>Relevance: Medical</p>
                <p>Update Date: 2023-07-25 09:02:10</p>
              </div>
              <el-divider />
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import router from "@/router";

// 搜索框
const select = ref("1");
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

// 详情页
const detailBtn = () => {
  router.push({
    path: "/system/role",
  });
};
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
.message-style {
  display: block;
  max-width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #4283c4;
  font-weight: 700;
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

.clicked:hover {
  cursor: pointer; /* 当div被点击过且鼠标悬停时，显示为手型图标 */
}
</style>
