<template>
  <div class="app-container">
    <div class="pad-t-15">
      <el-row class="pad-l-15 pad-r-15">
        <el-col :span="4" style="background-color: #fff;border-radius: 7px;">
          <h3 class="font-style pad-t-23">{{ $t('personal.personalCenter') }}</h3>
          <div class="mar-t-10 mar-b-30" style="border: 1px solid #c8c8c8"></div>
          <div style="display: flex; justify-content: center">
            <el-menu activeIndex="1" default-active="1" class="el-menu-vertical-demo" @select="handleSelect">
              <el-menu-item index="1">
                <span>{{ $t('personal.personalInfo') }}</span>
              </el-menu-item>
              <el-menu-item index="3">
                <span>{{ $t('personal.ssls') }}</span>
              </el-menu-item>
              <el-menu-item index="4">
                <span>{{ $t('file.fileModel') }}</span>
              </el-menu-item>
              <el-menu-item index="5">
                <span>{{ $t('personal.personalPwd') }}</span>
              </el-menu-item>
              <el-menu-item index="6">
                <span>{{ $t('personal.dljl') }}</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-col>
        <el-col :span="19" class="detail h-600 mar-l-20" style="background-color: #fff;border-radius: 7px;">
          <!-- 个人信息 -->
          <div v-if="activeIndex === '1'" class="form-style">
            <div>
              <h3 style="font-weight: 600">{{ $t('personal.personalInfo') }}</h3>
              <div class="dis-flex">
                <div class="avatar">
                  <userAvatar />
                </div>
                <span class="name">{{ perForm.nickName }}</span>
              </div>
            </div>
            <el-form :model="perForm" label-width="auto" style="width: 400px">
              <el-form-item :label="`${$t('personal.nickname')}：`">
                <el-input v-model="perForm.nickName" :placeholder="i18n=='zh'?'请输入您的用户名':'Please enter your username'" />
              </el-form-item>
              <el-form-item :label="`${$t('personal.phone')}：`">
                <el-input v-model="perForm.userName" :placeholder="i18n=='zh'?'请输入您的手机号':'Please enter your phone number'" />
              </el-form-item>
              <el-form-item :label="`${$t('personal.name')}：`">
                <el-input v-model="perForm.realName" :placeholder="i18n=='zh'?'请输入您的真实名字':'Please enter your real name'" />
              </el-form-item>
              <el-form-item :label="`${$t('personal.email')}：`">
                <el-input v-model="perForm.email" :placeholder="i18n=='zh'?'请输入您的邮箱':'Please enter your email'" />
              </el-form-item>
              <el-form-item :label="`${$t('personal.jobType')}：`">
                <el-select clearable :placeholder="i18n=='zh'?'请选择工作单位类型':'Please select work unit type'" class="w-100p" v-model="perForm.typeOfWorkUnit">
                  <el-option v-for="item in work_types" :key="item.dictLabel" :label="i18n=='zh'?item.dictLabel:item.remark"
                    :value="item.dictValue"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="`${$t('personal.jobName')}：`">
                <el-input v-model="perForm.nameOfWorkUnit" :placeholder="i18n=='zh'?'请输入您的单位':'Please enter your unit'" />
              </el-form-item>
            </el-form>
            <el-button class="mar-t-20" type="primary" @click="saveUser">{{ $t('personal.save') }}</el-button>
          </div>
          <!-- 搜索历史 -->
          <div v-if="activeIndex === '3'">
            <h3 style="font-weight: 600">{{ $t('personal.ssls') }}</h3>
            <div class="mar-l-60">
              <div class="mar-t-70"><span class="text-w-600">{{ perForm.nickName }}</span>，{{ $t('personal.ssmsg') }}</div>
              <div class="mar-t-30">
                <el-table :data="searchList" :empty-text="$t('personal.zwssls')" style="width: 95%">
                  <el-table-column align="center" prop="createTime" :label="$t('personal.sssj')" />
                  <el-table-column align="center" prop="searchContent" :label="$t('personal.ssgjz')" />
                </el-table>
                <div style="display: flex;justify-content: flex-end;padding: 50px;">
                  <el-pagination layout="prev, pager, next" @current-change="searchCurrentChange"
                    v-model:current-page="searchHistorypageInfo.pageNum"
                    v-model:page-size="searchHistorypageInfo.pageSize" :total="searchHistorytotal" />
                </div>
              </div>
            </div>
          </div>
          <!-- 我的文件 -->
          <div v-if="activeIndex === '4'">
            <h3 style="font-weight: 600">{{ $t('file.fileModel') }}</h3>
            <div class="mar-l-60 mar-t-30">
              <div>
                <el-table :data="myfileList" :empty-text="$t('file.zw')" style="width: 95%" height="400">
                  <el-table-column prop="taskName" :label="$t('file.rwmc')" />
                    <el-table-column prop="attachmentName" :label="$t('file.fileName')" />
                    <el-table-column prop="createTime" :label="$t('file.czsj')">
                        <template #default="scope">
                            {{ formatDate(scope.row.createTime, 'yyyy-MM-dd hh:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('file.cz')" width="120" align="center">
                        <template #default="scope">
                            <el-button @click="gettaskAttachmentdownload(scope.row)" size="small" type="primary">{{ $t('file.down') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <!-- 修改密码 -->
          <div v-if="activeIndex === '5'" class="form-style">
            <h3 style="font-weight: 600">{{ $t('personal.personalPwd') }}</h3>
            <el-form ref="pwdFormref" :model="pwdForm" :rules="passwordRules" :label-width="i18n=='zh'?'100px':'200px'" style="width: 500px"
              class="mar-t-60">
              <el-form-item :label="$t('personal.oldPwd')" prop="oldPassword">
                <el-input v-model="pwdForm.oldPassword" type="password" show-password="true" :placeholder="i18n=='zh'?'请输入原始密码':'Please enter the original password'" />
              </el-form-item>
              <el-form-item :label="$t('personal.newPwd')" prop="newPassword">
                <el-input v-model="pwdForm.newPassword" type="password" show-password="true" :placeholder="i18n=='zh'?'请输入新密码':'Please enter a new password'" />
              </el-form-item>
              <el-form-item :label="$t('personal.confirmpwd')" prop="confirmnewPassword">
                <el-input v-model="pwdForm.confirmnewPassword" type="password" show-password="true"
                  :placeholder="i18n=='zh'?'请输入确认新密码':'Please confirm the new password'" />
              </el-form-item>
              <el-form-item>
                <el-button @click="resetpwd" style="width: 300px" type="primary">{{ $t('personal.submit') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 登录记录 -->
          <div v-if="activeIndex === '6'">
            <h3 style="font-weight: 600">{{ $t('personal.dljl') }}</h3>
            <el-table :data="loginData" style="width: 90%" class="mar-t-70 mar-l-60">
              <el-table-column prop="loginLocation" :label="$t('personal.dlfs')" />
              <el-table-column prop="userName" :label="$t('personal.sbmc')" />
              <el-table-column prop="os" :label="$t('personal.xt')" />
              <el-table-column prop="loginTime" :label="$t('personal.dlsj')" />
            </el-table>
            <div style="display: flex;justify-content: flex-end;padding: 50px;">
              <el-pagination layout="prev, pager, next" @current-change="LogininfototalCurrentChange"
                v-model:current-page="LogininfopageInfo.pageNum" v-model:page-size="LogininfopageInfo.pageSize"
                :total="Logininfototal" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup scoped>
import userAvatar from "./userAvatar";
import api from '@/utils/api/index'
import { onMounted, reactive, ref } from "vue";
import { getUserInfo, searchHistory, sysLogininforList, updateUserPwd, updateUserInfo } from '@/api/userInfo'
import { listByScriptId,taskAttachmentdownload } from '@/api/16S'
import { ElMessage } from "element-plus";
import { formatDate } from '@/utils/index'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import { useLanguageStore } from '@/store/modules/language';
const activeIndex = ref("1");
const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)

// 头像
const circleUrl = ref(
  "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
);
const checkpassword = (rule, value, callback) => {
  console.log(rule, value)
  const phoneReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
  if (!value) {
    if (rule.field == 'oldPassword') {
      return callback(new Error(i18n.value == 'zh' ? "原始密码不能为空" : "The original password cannot be empty"));
    } else if (rule.field == 'newPassword') {
      return callback(new Error(i18n.value == 'zh' ? "新密码不能为空" : "The new password cannot be empty"));
    } else {
      return callback(new Error(i18n.value == 'zh' ? "密码不能为空" : "Password cannot be empty"));
    }
  }
  setTimeout(() => {
    if (phoneReg.test(value)) {
      callback();
    } else {
      callback(new Error(i18n.value == 'zh' ? "密码至少为6-16位字母和数字的组合" : "The password must be a combination of 6-16 digits and letters"));
    }
  }, 100);
};
// 个人信息表单数据
const perForm = ref({});

const verificationregisterformref = ref()
const work_types = ref([])
const gettype_simp = () => {
  api.gettype_simp().then(res => {
    work_types.value = res.data
  })
}
const myfileList = ref([])
gettype_simp()
// 修改密码表单数据
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmnewPassword: ''
});
// 修改密码 - 表单校验
const confirmpwdrules = (rule, value, callback) => {
  pwdForm.newPassword == value ? callback() : callback(i18n.value == 'zh' ? '两次密码不一致':'The two passwords are inconsistent')
}
const passwordRules = ref({
  oldPassword: [
    {
      required: true,
      validator: checkpassword,
      trigger: "blur",
    },
  ],
  newPassword: [
    {
      required: true,
      validator: checkpassword,
      trigger: "blur",
    },
  ],
  confirmnewPassword: [
    {
      required: true,
      message: i18n.value == 'zh' ? "确认新密码不能为空" : "Confirm new password cannot be empty",
      trigger: "blur",
    },
    { validator: confirmpwdrules, trigger: 'blur' }
  ]
});
const pwdFormref = ref()
const resetpwd = () => {
  pwdFormref.value.validate(value => {
    if (value) {
      updateUserPwd({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword }).then(res => {
        if (res.code == 200) {
          ElMessage.success(i18n.value == 'zh' ? '修改密码成功！': 'Password modified successfully！')
          pwdFormref.value.resetFields()
        }
      })
    }
  })
}

const saveUser = () => {
  updateUserInfo(perForm.value).then(res => {
    if (res.code == 200) {
      useUserStore().getInfo()
    }
    ElMessage.success(res.msg)
  })
}

// 左侧菜单
const handleSelect = (index) => {
  activeIndex.value = index;
  if (index == 1) {
    getuserInfo()
  } else if (index == 3) {
    getsearchHistory()
  } else if (index == 4) {
    getlistByScriptId()
  } else if (index == 6) {
    getsysLogininforList()
  }
};

const getuserInfo = () => {
  getUserInfo().then(res => {
    perForm.value = res.data
  })
}

//搜索历史
const searchList = ref([])
const searchHistorypageInfo = reactive({
  pageNum: 1,
  pageSize: 5
})
const searchHistorytotal = ref(0)
const getsearchHistory = () => {
  searchHistory(searchHistorypageInfo).then(res => {
    searchHistorytotal.value = res.total
    searchList.value = res.rows
  })
}
const searchCurrentChange = (page) => {
  searchHistorypageInfo.pageNum = page
  getsearchHistory()
}


// 登录记录表格数据
const loginData = ref([]);
const LogininfopageInfo = reactive({
  pageNum: 1,
  pageSize: 10
})
const Logininfototal = ref(0)
const getsysLogininforList = () => {
  sysLogininforList(LogininfopageInfo).then(res => {
    Logininfototal.value = res.total
    loginData.value = res.rows
  })
}
const LogininfototalCurrentChange = (page) => {
  LogininfopageInfo.pageNum = page
  getsysLogininforList()
}

const getlistByScriptId = () => {
    listByScriptId({ scriptsId:'' }).then(res => {
        myfileList.value = res.data
    })
}

function extractFilenameFromContentDisposition(contentDisposition) {
  if (!contentDisposition) {
    return null;
  }

  // 尝试解析 filename*（扩展属性）
  const filenameStarRegex = /filename\*=([^\s]+)'([^']*)/;
  const filenameStarMatch = contentDisposition.match(filenameStarRegex);
  if (filenameStarMatch) {
    // 解码文件名（filename* 的值是经过编码的）
    const encoding = filenameStarMatch[1]; // 例如 "utf-8"
    const encodedFilename = filenameStarMatch[2];
    if (encoding.toLowerCase().indexOf("utf-8") !== -1) {
      return decodeURIComponent(encodedFilename);
    }
  }

  // 如果没有 filename*，尝试解析普通的 filename
  const filenameRegex = /filename=["']?([^"']+)["']?/;
  const filenameMatch = contentDisposition.match(filenameRegex);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1];
  }

  // 如果都没有匹配到，返回 null
  return null;
}
const gettaskAttachmentdownload = async (item) => {
    try {
        // 发起请求
        const response = await fetch(import.meta.env.VITE_APP_BASE_API + "/atlas/taskAttachment/download?taskAttachmentId=" + item.taskAttachmentId, {
            method: "GET",
            // body: {
            //     taskAttachmentId: item.taskAttachmentId
            // },
            headers: {
                // 根据后端要求设置请求头
                "Content-Type": "application/json",
                Authorization: "Bearer "+getToken(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        // 获取文件流数据
        const blob = await response.blob();
        console.log(blob);
        if(blob.size==0){
            ElMessage.error(i18n.value == 'zh' ? '文件无内容': 'File content is empty')
            return;
        }
        // 获取文件名（从响应头中获取，如果没有则使用默认值）
        const contentDisposition = response.headers.get("content-disposition");
        const fileName = contentDisposition
        ? extractFilenameFromContentDisposition(contentDisposition)
        : item.attachmentName;
        console.log(fileName);
        // 创建下载链接
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName; // 设置下载文件名
        a.click(); // 触发下载
        a.remove(); // 清理元素
        URL.revokeObjectURL(downloadUrl); // 释放对象URL
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}


onMounted(() => {
  getuserInfo()

})
</script>

<style lang="scss" scoped>
.app-container {
  background: #f3f3f3;
}

.font-style {
  margin-left: 40px;
}

.detail {
  padding: 20px 30px;
}

.th-bgc {
  background-color: #f3f3f3;
}

.avatar {
  padding: 20px;
}

.el-col {
  height: auto !important;
  min-height: 600px !important;
}

.el-menu {
  border-right: 0;
  width: 100%;

  .el-menu-item {
    margin-bottom: 20px;
    height: 45px;

    &>span {
      font-weight: 600;
    }
  }

  .menu-item-content {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    height: 100%;
    /* 让内容充满整个menu-item的高度 */
    width: 100%;
    padding: 0 16px;
    /* 根据需要调整内边距，这里设置左右各16px */
  }

  .el-menu-item.is-active {
    background-color: var(--el-color-primary-light-9);
    /* 示例灰色背景色，可根据需要调整 */
    color: var(--el-theme-color);
    /* 文字颜色，可选，用于保证文字与背景的对比度 --el-color-primary-light-9*/
    border-right: 3px solid var(--el-theme-color);
  }
}

.form-style {
  ::v-deep(.el-input__wrapper) {
    background-color: #f5f5f5 !important;
  }
}

.table {
  width: 70%;
  border-collapse: collapse;

  th {
    background-color: #ebf1f7;
  }

  td {
    background-color: #f5f5f5;
  }
}

.name {
  display: flex;
  align-items: center;
  font-weight: 800;
  font-size: 30px;
  color: var(--el-theme-color);
}

::v-deep(.el-table .el-table__header-wrapper th) {
  background: var(--el-color-primary-light-9) !important;
}

::v-deep(.el-menu--vertical .nest-menu .el-sub-menu > .el-sub-menu__title:hover, .el-menu--vertical .el-menu-item:hover) {
  background-color: var(--el-color-primary-light-9) !important;
}
</style>
