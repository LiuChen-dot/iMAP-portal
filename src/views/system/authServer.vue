<template>
  <div class="app-container pad-15 app-container-gray">
    <el-card class="box-card">
      <el-row :gutter="10" class="mar-b-10">
        <el-col :span="2">
          <el-button @click="dialogAuth = true">新增授权</el-button></el-col
        >
        <el-col :span="3" :offset="14">
          <el-select v-model="type" class="w-100p" placeholder="--请选择--">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
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
          <el-table-column label="服务器别名" prop="alias" width="180">
          </el-table-column>
          <el-table-column label="服务器IP" prop="ip" width="120">
          </el-table-column>
          <el-table-column label="插件版本" prop="version" width="120">
          </el-table-column>
          <el-table-column label="状态" prop="status" width="80">
          </el-table-column>
          <el-table-column label="服务器参数" prop="parameters" width="150">
          </el-table-column>
          <el-table-column label="磁盘使用率" prop="usageRate" width="150">
          </el-table-column>
          <el-table-column label="备注" prop="remark" width="150">
          </el-table-column>
          <el-table-column label="添加时间" prop="addTime" width="150">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <span style="margin-left: 10px">{{
                  scope.row.addTime
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-popconfirm title="您确定要对该服务器进行解除授权吗？" @confirm="handleRemove(scope.$index, scope.row)">
                <template #reference>
                  <el-button
                    size="small"
                    type="danger"
                    >解除授权</el-button
                  >
                </template>
              </el-popconfirm>
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
    <el-dialog v-model="dialogAuth" title="新增授权" width="70%">
      <addAuthServer @onHandleAuth="onHandleAuth"></addAuthServer>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import addAuthServer from './addAuthServer.vue'
import { ElMessage } from "element-plus";
const keyword = ref("");
const type = ref("");
const loading = ref(false)
const typeOptions = [
  { name: "服务器别名", value: "alias" },
  { name: "ip", value: "ip" },
];
const dialogAuth = ref(false)
const currentPage = ref(1);
const pageSize = ref(10);

const handleSearch = () => {
  console.log(keyword.value, "====");
   loading.value = true;
  setTimeout(()=>{
    loading.value = false
  },1000)
};
const handleRemove = (index,row)=>{
    handleSearch()
    tableData.value.splice(index,1)
    ElMessage({
        showClose: true,
        message: '操作成功！',
        type: 'success',
    })
}
const onHandleAuth  = ()=>{
    dialogAuth.value = false;
}
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
    addTime: "2016-05-03",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.188",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-02",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.188",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-04",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.188",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-01",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.188",
    version: "2.1.12",
    description: "123",
    remark: "Angeles",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-03",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.200",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-02",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.200",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-04",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.200",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-01",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.200",
    version: "2.1.12",
    description: "123",
    remark: "Angeles",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-04",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.200",
    version: "2.1.12",
    description: "123",
    remark: "zhangnfa",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
  {
    addTime: "2016-05-01",
    alias: "DESKTOP-C1RMFKD",
    ip: "192.168.5.200",
    version: "2.1.12",
    description: "123",
    remark: "Angeles",
    status: "正常",
    usageRate:'C:\(60%)D:\(12%)E:\(8%)',
    parameters: 'CPU主频：2.6GHzCPU核心数：8带宽：2048Kb内存：8054MB',
  },
]);
</script>
<style lang="scss" scoped></style>
