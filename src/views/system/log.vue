<template>
  <div class="app-container pad-15 app-container-gray">
    <el-card class="box-card">
      <el-row :gutter="10" class="mar-b-10">
        <!-- <el-col :span="2">
          <el-button @click="dialogUser = true">新 增</el-button></el-col
        > -->
        <el-col :span="3">
          <el-select v-model="type" class="w-100p" placeholder="--请选择--">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="7">
          <el-date-picker
            v-model="date"
            type="daterange"
            range-separator="To"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-col>
        <el-col :span="3">
          <el-input v-model="keyword" placeholder="请输入关键字进行查询" />
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="handleSearch">查 询</el-button>
        </el-col>
      </el-row>

      <div>
        <el-table :data="tableData" style="width: 100%" stripe v-loading="loading">
          <el-table-column  type="index" width="50">
          </el-table-column>
          <el-table-column label="操作信息描述" prop="description">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <span style="margin-left: 10px">{{
                  scope.row.description
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="日志来源" prop="logSource" width="200">
            <template #default="scope">
              <el-tag>{{ scope.row.logSource }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作用户" prop="operatingUser" width="150">
          </el-table-column>
          <el-table-column label="操作机器IP" prop="ip" width="150">
          </el-table-column>
          <el-table-column label="操作时间" prop="operationTime" width="150">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <span style="margin-left: 10px">{{
                  scope.row.operationTime
                }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[50, 100, 200, 400]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="300"
            background
            small
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
const keyword = ref("");
const date = ref('')
const type = ref("");
const loading = ref(false)
const typeOptions = [
  { name: "服务器监控", value: "Server" },
  { name: "站点监控", value: "Site" },
  { name: "报警信息管理", value: "AlarmInfo" },
  { name: "系统设置", value: "Settings" },
];
const currentPage = ref(1);
const pageSize = ref(10);

const handleSearch = () => {
  loading.value = true;
  setTimeout(()=>{
    loading.value = false
  },1000)
};
const handleSizeChange = (val) => {
  console.log(`${val} items per page`)
  handleSearch()
}
const handleCurrentChange = (val) => {
  console.log(`current page: ${val}`)
  handleSearch()
}
const tableData = ref([
  {
    operationTime: "2016-05-03",
    name: "Tom",
    ip: "18716411124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: true,
  },
  {
    operationTime: "2016-05-02",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-04",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-01",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "Angeles",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-03",
    name: "Tom",
    ip: "18716411124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: true,
  },
  {
    operationTime: "2016-05-02",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-04",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-01",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "Angeles",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-04",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "zhangnfa",
    status: "正常",
    isEnable: false,
  },
  {
    operationTime: "2016-05-01",
    name: "Tom",
    ip: "187164124",
    logSource: "研发部",
    description: "123",
    operatingUser: "Angeles",
    status: "正常",
    isEnable: false,
  },
]);
</script>
<style lang="scss" scoped></style>
