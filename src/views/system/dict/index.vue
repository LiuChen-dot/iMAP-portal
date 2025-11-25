<template>
  <div class="app-container">
    <el-card class="pad-t-30">
      <el-row>
        <el-col :span="4" class="bor-right">
          <h3 class="font-style pad-t-10">个人中心</h3>
          <h4 class="font-style mar-t-50 mar-b-30 mar-r-30">用户名</h4>
          <div style="display: flex; justify-content: center">
            <el-menu :default-active="activeIndex" @select="handleSelect">
              <el-menu-item index="1" class="menu-item-content">
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="2" class="menu-item-content">
                <span>搜索历史</span>
              </el-menu-item>
              <el-menu-item index="3" class="menu-item-content">
                <span>我的文件</span>
              </el-menu-item>
              <el-menu-item index="4" class="menu-item-content">
                <span>修改密码</span>
              </el-menu-item>
              <el-menu-item index="5" class="menu-item-content">
                <span>登录记录</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-col>
        <el-col :span="20" class="detail h-600">
          <!-- 个人信息 -->
          <div v-if="activeIndex === '1'">
            <el-form
              :model="perForm"
              label-width="auto"
              style="max-width: 320px"
            >
              <el-form-item label="用户名">
                <el-input v-model="perForm.user" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="perForm.tel" />
              </el-form-item>
              <el-form-item label="姓名">
                <el-input v-model="perForm.name" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="perForm.email" />
              </el-form-item>
              <el-form-item label="工作单位类型">
                <el-input v-model="perForm.unitType" />
              </el-form-item>
              <el-form-item label="工作单位名称">
                <el-input v-model="perForm.unitName" />
              </el-form-item>
            </el-form>
          </div>
          <!-- 搜索历史 -->
          <div v-if="activeIndex === '2'">
            <span>用户名，以下是您最近1个月的搜索记录。</span>
            <div class="mar-t-30">
              <table style="width: 70%; border-collapse: collapse" border="1">
                <thead style="border: 1px solid #7b7b7b">
                  <tr class="h-50">
                    <th class="th-bgc">搜索字段</th>
                    <th class="th-bgc">搜索说明</th>
                  </tr>
                </thead>
                <tbody style="border: 1px solid #7b7b7b">
                  <tr v-for="index in 2" :key="index" class="h-30">
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- 我的文件 -->
          <div v-if="activeIndex === '3'">
            <el-button text type="primary">我的下载</el-button>
            <el-button text type="primary">我的上传</el-button>
            <div>
              <table style="width: 70%; border-collapse: collapse" border="1">
                <thead style="border: 1px solid #7b7b7b">
                  <tr class="h-50">
                    <th class="th-bgc">文件名称</th>
                    <th class="th-bgc">文件格式</th>
                    <th class="th-bgc">下载时间</th>
                    <th class="th-bgc">附件链接</th>
                  </tr>
                </thead>
                <tbody style="border: 1px solid #7b7b7b">
                  <tr v-for="index in 3" :key="index" class="h-30">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- 修改密码 -->
          <div v-if="activeIndex === '4'">
            <el-form
              :model="passForm"
              label-width="auto"
              style="max-width: 320px"
            >
              <el-form-item label="用户名">
                <el-input v-model="passForm.user" />
              </el-form-item>
              <el-form-item label="原始密码">
                <el-input v-model="passForm.activePassword" />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="passForm.newPassword" />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input v-model="passForm.confirm" />
              </el-form-item>
              <div style="text-align: center">
                <el-button style="width: 120px; border: 1px solid" :plain="true"
                  >提交</el-button
                >
              </div>
            </el-form>
          </div>
          <!-- 登录记录 -->
          <div v-if="activeIndex === '5'">
            <el-table :data="loginData" style="width: 60%">
              <el-table-column prop="way" label="登录方式" />
              <el-table-column prop="name" label="设备名称" />
              <el-table-column prop="system" label="系统" />
              <el-table-column prop="date" label="登录时间" />
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup scoped>
import { reactive, ref } from "vue";

const activeIndex = ref("1");

// 个人信息表单数据
const perForm = reactive({
  user: "xxxxx",
  tel: "123456",
  name: "xxx",
  email: "2804234344@qq.com",
  unitType: "xxxx",
  unitName: "xxxx",
});

// 修改密码表单数据
const passForm = reactive({
  user: "xxxxx",
  activePassword: "",
  newPassword: "",
  confirm: "",
});

// 登录记录表格数据
const loginData = reactive([
  {
    way: "用户名登录",
    name: "电脑",
    system: "OS X10.15.7",
    date: "2024-05-08 14:29:18",
  },
  {
    way: "用户名登录",
    name: "电脑",
    system: "OS X10.15.7",
    date: "2024-05-08 14:29:18",
  },
]);

// 左侧菜单
const handleSelect = (index) => {
  activeIndex.value = index;
};
</script>

<style lang="scss" scoped>
.bor-right {
  border-right: 1px solid #000;
}
.font-style {
  font-weight: 700;
  text-align: center;
}
.detail {
  padding: 130px;
}
.th-bgc {
  background-color: #f3f3f3;
}
.el-menu {
  border-right: 0;
  .el-menu-item {
    margin-bottom: 20px;
    border: 1px solid #797979; /* 设置边框颜色和宽度 */
    border-radius: 5px;
    padding: 0; /* 移除默认内边距以完美居中文本 */
    width: 150px !important;
    height: 45px !important;
  }
  .menu-item-content {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    height: 100%; /* 让内容充满整个menu-item的高度 */
    width: 100%;
    padding: 0 16px; /* 根据需要调整内边距，这里设置左右各16px */
  }
  .el-menu-item.is-active {
    background-color: #d7d7d7; /* 示例灰色背景色，可根据需要调整 */
    color: #606266; /* 文字颜色，可选，用于保证文字与背景的对比度 */
  }
}
</style>
