<template>
  <div>
    <el-row :gutter="10" class="mar-b-10 h-380">
      <el-col :span="12">
        <el-card class="box-card mar-t-10">
          <template #header>
            <div class="card-header">
              <span>资产搜索热词TOP10</span>
            </div>
          </template>
          <div v-for="(item, i) in dataList" class="dis-flex h-40 align-c">
            <span class="w-30 text-right">{{ i + 1 }}</span>
            <span class="mar-10 w-80">{{ item.name }}</span>
            <el-progress
              class="w-60p"
              :show-text="false"
              :class="'progress' + (i + 1)"
              :percentage="80 - 5 * i"
              stroke-width="16"
              :color="item.color"
            />
            <span>{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card mar-t-10">
          <template #header>
            <div class="card-header">
              <span>资产查看TOP10</span>
            </div>
          </template>
          <div v-for="(item, i) in dataList" class="dis-flex h-40 align-c">
            <span class="w-30 text-right">{{ i + 1 }}</span>
            <span class="mar-10 w-80">{{ item.name }}</span>
            <el-progress
              class="w-60p"
              :show-text="false"
              :class="'progress' + (i + 1)"
              :percentage="80 - 5 * i"
              stroke-width="16"
              :color="item.color"
            />
            <span>{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card mar-t-10">
          <template #header>
            <div class="card-header">
              <span>资产收藏TOP10</span>
            </div>
          </template>
          <div v-for="(item, i) in dataList" class="dis-flex h-40 align-c">
            <span class="w-30 text-right">{{ i + 1 }}</span>
            <span class="mar-10 w-80">{{ item.name }}</span>
            <el-progress
              class="w-60p"
              :show-text="false"
              :class="'progress' + (i + 1)"
              :percentage="80 - 5 * i"
              stroke-width="16"
              :color="item.color"
            />
            <span>{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card mar-t-10">
          <template #header>
            <div class="card-header">
              <span>资产低频使用TOP10</span>
            </div>
          </template>
          <div v-for="(item, i) in dataList" class="dis-flex h-40 align-c">
            <span class="w-30 text-right">{{ i + 1 }}</span>
            <span class="mar-10 w-80">{{ item.name }}</span>
            <el-progress
              class="w-60p"
              :show-text="false"
              :class="'progress' + (i + 1)"
              :percentage="80 - 5 * i"
              stroke-width="16"
              :color="item.color"
            />
            <span>{{ item.value }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card mar-t-10">
          <template #header>
            <div class="card-header">
              <span>近期共享服务资产</span>
            </div>
          </template>
          <el-table :data="tableData" style="width: 100%" stripe>
            <el-table-column label="资产名称" prop="name"> </el-table-column>
            <el-table-column label="资产类型" prop="type"> </el-table-column>
            <el-table-column label="共享时间" prop="shareTime">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card mar-t-10">
          <template #header>
            <div class="card-header">
              <span>近期发布/公开资产</span>
            </div>
          </template>
          <el-table :data="tableData" style="width: 100%" stripe>
            <el-table-column label="资产名称" prop="name"> </el-table-column>
            <el-table-column label="资产类型" prop="type"> </el-table-column>
            <el-table-column label="共享时间" prop="shareTime">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getHotWords,
  getShareAsset
} from "@/api/assets";
const router = useRouter();
const dataList = ref([]);
const tableData = ref([]);
const tableData1 = ref([]);
onMounted(() => {
  getHotWords().then((res) => {
    dataList.value = [...res.data.list];
  });
  getShareAsset().then(res=>{
    tableData.value = res.data.list
  })
});
</script>
<style lang="scss" scoped></style>
