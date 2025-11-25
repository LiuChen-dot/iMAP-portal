<template>
    <div class="registerbox">
        <div class="registerstep">
            <div v-if="registerActive == 0">
                <el-form ref="registerformref" class="registerform" :model="registerForm" :label-position="i18n=='zh'?'':'top'" :rules="registerFormrules" :label-width="80">
                    <el-form-item :label="i18n=='zh'?'昵称':'Nickname'" prop="nickName" :label-position="i18n=='zh'?'':'top'" :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput" style="">
                            <el-input v-model="registerForm.nickName"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'手机号':'Phone number'" prop="userName" :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input v-model="registerForm.userName"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'密码':'Password'" prop="password" :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input type="password" v-model="registerForm.password" show-password="true"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'密码确认':'Confirm password'" prop="confirmpwd" :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input type="password" v-model="registerForm.confirmpwd" show-password="true"></el-input>
                        </div>
                    </el-form-item>
                </el-form>
                <div style="text-align: center;">
                    <el-button @click="registerFormvalidate"
                        style="background-color: var(--el-theme-color);color: white">{{i18n=='zh'?'下一步:':'Next step:'}}</el-button>
                    <el-button @click="resetField">{{i18n=='zh'?'重置':'Reset'}}</el-button>
                </div>
            </div>
            <div v-else-if="registerActive == 1">
                <el-form ref="verificationregisterformref" class="registerform" :model="verificationregisterForm" :label-position="i18n=='zh'?'':'top'" 
                    :rules="verificationregisterFormrules"  :label-width="120">
                    <el-form-item :label="i18n=='zh'?'手机号':'Phone number'" prop="userName" label-position="right" :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div style="padding-left: 50px;">{{ verificationregisterForm.userName }}</div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'图形验证码':'Image verification code'" prop="code"  :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input v-model="registerForm.code"></el-input><img @click="getcaptchaImage"
                                style="position: absolute;right: 0;width: 80px;height: 42px;" :src="captchaImage" />
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'验证码':'Verification code'" prop="verificationCode"  :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input v-model="verificationregisterForm.verificationCode"></el-input>
                            <div @click="sendCode"
                                style="position: absolute;right: 10px;line-height: 42px;cursor: pointer;font-size:11px;">
                                {{ codeSwitch ? (i18n=='zh'?'发送':'Send') : time }}
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'真实姓名':'Real name'" prop="realName"  :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input v-model="verificationregisterForm.realName"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'邮箱':'Email'" prop="email"  :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-input v-model="verificationregisterForm.email"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'工作单位类型':'Work unit type'" prop="typeOfWorkUnit"  :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <div class="iteminput">
                            <el-select clearable :placeholder="i18n=='zh'?'请选择工作单位类型':'Please select the type of work unit'"
                                v-model="verificationregisterForm.typeOfWorkUnit" class="w-100p">
                                <el-option v-for="item in work_types" :key="item.dictLabel" :label="i18n=='zh'?item.dictLabel:item.remark"
                                    :value="item.dictValue"></el-option>
                            </el-select>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'工作单位名称':'Work unit name'" prop="nameOfWorkUnit"  :class="[i18n=='zh'?'dis-flex align-c':'']">
                        <el-input v-model="verificationregisterForm.nameOfWorkUnit"></el-input>
                    </el-form-item>

                    <div class="formcenter">
                        <div class="nprivacyReadbox">
                            <el-checkbox v-model="registerprivacyCheckbox"></el-checkbox>
                            <div ><span @click="openNprivacyRead">《{{i18n=='zh'?'用户协议及隐私政策':'User agreement and privacy policy'}}》</span></div>
                        </div>
                    </div>
                </el-form>
                <div style="text-align: center;">
                    <el-button @click="verFormresetFieldvalidate" type="info"
                        style="background-color: var(--el-theme-color);color: white">{{i18n=='zh'?'下一步':'Next step'}}</el-button>
                </div>
            </div>

        </div>
        <el-dialog v-model="nprivacydialog" width="50%" :show-close="false" :close-on-click-modal="false">
            <div style="text-align: center;font-size: 18px;">{{i18n=='zh'?'阅读用户协议及隐私政策':'Read user agreement and privacy policy'}}</div>
            <div style="max-height: 500px;overflow: auto;" v-html="nprivacydialogtext"></div>
            <div style="text-align: center;margin-top: 10px;">
                <div v-if="nprivacyReadtime == 0"> <el-button @click="closenprivacydialog"
                        type="primary">{{i18n=='zh'?'我已阅读':'I have read'}}</el-button></div>
                <div v-else><el-button type="info" disabled>{{i18n=='zh'?'阅读':'Read'}}{{ nprivacyReadtime }}{{i18n=='zh'?'秒':'seconds'}}</el-button> </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import api from '@/utils/api/index'
import { computed, onMounted, reactive, ref, watch } from "vue"
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { useLanguageStore } from '@/store/modules/language';
import router from '@/router'
const userStore = useUserStore()
const props = defineProps(['changeActive'])
const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
//----------------------------------注册业务
//第一步表单逻辑
const registerformref = ref()
//注册第一步表单
const registerForm = reactive({
    nickName: '',
    userName: '',
    password: '',
    confirmpwd: '',
    code: ''
});
const confirmpwdrules = (rule, value, callback) => {
    registerForm.password == value ? callback() : callback(i18n.value=='zh'?'两次密码不一致':'Twice passwords are inconsistent')
}
const resetField = () => {
    registerformref.value.resetFields()
}
const registerFormvalidate = () => {
    registerformref.value.validate((value) => {
        value ? registernext() : ''
    })
}
const checkPhone = (rule, value, callback) => {
  const phoneReg = /^\d{11}$/;
  if (!value) {
    return callback(new Error(i18n.value=='zh'?"手机号不能为空":"Phone number cannot be empty"));
  }
  setTimeout(() => {
    if (!Number.isInteger(+value)) {
      callback(new Error(i18n.value=='zh'?"请输入数字值":"Please enter numeric values"));
    } else {
      if (phoneReg.test(value)) {
        callback();
      } else {
        callback(new Error(i18n.value=='zh'?"手机号格式不正确":"Incorrect phone number format"));
      }
    }
  }, 100);
};
const checkpassword = (rule, value, callback) => {
  const phoneReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
  if (!value) {
    return callback(new Error(i18n.value=='zh'?"密码不能为空":"Password cannot be empty"));
  }
  setTimeout(() => {
    if (phoneReg.test(value)) {
        callback();
    } else {
        callback(new Error(i18n.value=='zh'?"密码至少为6-16位字母和数字的组合":"Password must be at least 6-16 digits and letters combination"));
    }
  }, 100);
};
const registerFormrules = {
    nickName: [
        { required: true, message: i18n.value=='zh'?'请输入汉字、英文字母或数字':'Please enter Chinese characters, English letters or numbers', trigger: 'blur' },
        { min: 2, max: 15, message: i18n.value=='zh'?'请输入2-15个字符':'Please enter 2-15 characters', trigger: 'blur' },
    ],
    userName: [
        { required: true, validator: checkPhone, trigger: 'blur' },
    ],
    password: [
        { required: true, validator: checkpassword, trigger: 'blur' },
    ],
    confirmpwd: [
        { required: true, message: i18n.value=='zh'?'密码确认不能为空':'Password confirmation cannot be empty', trigger: 'blur' },
        { validator: confirmpwdrules, trigger: 'blur' }
    ],
}

//第二步表单逻辑
const registerprivacyCheckbox = ref(false)
const verificationregisterformref = ref()
const verificationregisterForm = reactive({
    userName: '',
    verificationCode: '',
    realName: '',
    email: '',
    typeOfWorkUnit: '',//工作单位类型
    nameOfWorkUnit: ''//工作单位名称
})
const checkEmail = (rule, value, callback) => {
  const mailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/;
  if (!value) {
    return callback(new Error(i18n.value=='zh'?"邮箱不能为空":"Email cannot be empty"));
  }
  setTimeout(() => {
    if (mailReg.test(value)) {
      callback();
    } else {
      callback(new Error(i18n.value=='zh'?"请输入正确的邮箱格式":"Please enter the correct email format"));
    }
  }, 100);
};
const verificationregisterFormrules = {
    verificationCode: [
        { required: true, message: i18n.value=='zh'?'验证码不能为空':'Verification code cannot be empty', trigger: 'blur' },
    ],
    realName: [
        { required: true, message: i18n.value=='zh'?'真实姓名不能为空':'Real name cannot be empty', trigger: 'blur' },
        { min: 2, max: 50, message: i18n.value=='zh'?'请输入2-50个字符':'Please enter 2-50 characters', trigger: 'blur' },
    ],
    email: [
        { required: true, validator: checkEmail, trigger: 'blur' },
    ],
    typeOfWorkUnit: [
        { required: true, message: i18n.value=='zh'?'请选择工作单位类型':'Please select the type of work unit', trigger: 'change' },
    ],
    nameOfWorkUnit: [
        { required: true, message: i18n.value=='zh'?'工作单位名称不能为空':'The name of the work unit cannot be empty', trigger: 'blur' },
        { min: 2, max: 50, message: i18n.value=='zh'?'请输入2-50个字符':'Please enter 2-50 characters', trigger: 'blur' },
    ]
}
const verFormresetFieldvalidate = () => {
    verificationregisterformref.value.validate((value) => {
        value && registerprivacyCheckbox.value ? registernext() : registerprivacyCheckbox.value ? '' : ElMessage.warning(i18n.value=='zh'?'请阅读用户协议及隐私政策':'Please read the user agreement and privacy policy')
    })
}

//协议弹框
const nprivacydialog = ref(false)
//协议弹框文本
const nprivacydialogtext = ref('')
//协议阅读时间
const nprivacyReadtime = ref(5)
//阅读协议定时器
let timer = null
const nprivacyReadtimeChange = () => {
    timer = setInterval(() => {
        if (nprivacyReadtime.value == 0) {
            clearInterval(timer)
            timer = null
            return
        }
        nprivacyReadtime.value--
    }, 1000)
}
//打开用户协议弹窗
const openNprivacyRead = () => {
    if (timer != null) {
        return
    }
    if (verificationregisterForm.userName.length != 11) {
        return ElMessage.warning(i18n.value=='zh'?'请先输入合法手机号!':'Please enter a legal phone number!')
    }
    nprivacyReadtime.value = 5
    nprivacyReadtimeChange()
    api.getAgreement().then(res => {
        nprivacydialogtext.value = res.data
    })
    nprivacydialog.value = true
}
//关闭用户协议弹窗
const closenprivacydialog = () => {
    nprivacydialog.value = false
    registerprivacyCheckbox.value = true
}

const registerActivedialog = computed(() => registerActive.value == 2)

//注册步骤条逻辑
const registerActive = ref(0)
const registernext = () => {
    if (!registerActive.value) {
        phoneVerification().then(res => {
            if (res.code == 200) {
                verificationregisterForm.userName = registerForm.userName
                registerActive.value >= 2 ? registerActive.value = 0 : registerActive.value++

            } else {
                ElMessage.warning(res.msg)
            }
        }).catch(err => {
            ElMessage.error(err)
        })
    } else {
        api.registered(
            {
                nickName: registerForm.nickName,
                password: registerForm.password,
                ...verificationregisterForm
            }
        ).then(res => {
            if (res.code == 200) {
                ElMessage.success(i18n.value=='zh'?'注册成功':'Registration successful')
                registerActive.value >= 1 ? registerActive.value = 0 : registerActive.value++
                props.changeActive(0)
            } else {
                ElMessage.error(res.msg)
            }
        })
    }
}

//发送验证码时间限制
const codeSwitch = ref(true)
const time = ref(60)
const sendCode = () => {
    if (codeSwitch.value) {
        if (registerForm.userName.length != 11 || registerForm.code == '') {
            ElMessage.warning(i18n.value=='zh'?'手机号或图形验证码不能为空!':'Phone number or image verification code cannot be empty!')
            return
        }
        api.sendPhoneVerificationCode({
            code: registerForm.code,
            userName: registerForm.userName,
            uuid: uuid.value
        }).then(res => {
            if (res.code == 200) {
                codeSwitch.value = false
                const timer = setInterval(() => {
                    if (time.value == 1) {
                        clearInterval(timer)
                        time.value = 60
                        codeSwitch.value = true
                        return
                    }
                    time.value--
                }, 1000)
            }
        }).catch(err => {
            getcaptchaImage()
        })

    } else {
        ElMessage.warning(i18n.value=='zh'?'不能重复发送验证码':'Cannot resend verification code')
    }
}


//确认手机号是否重复
const phoneVerification = () => {
    return new Promise((resolve, reject) => {
        api.phoneVerification({
            code: '1',
            userName: registerForm.userName,
            uuid: '7d5f79d1576d4ce095e5a369c9cfcfb3'
        }).then(res => {
            //发送手机验证码
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}
//获取工作单位类型
const work_types = ref([])
const gettype_simp = () => {
    api.gettype_simp().then(res => {
        work_types.value = res.data
    })
}

//图形验证码
const captchaImage = ref('')
const uuid = ref('')
const getcaptchaImage = () => {
    api.captchaImage().then(res => {
        uuid.value = res.uuid
        captchaImage.value = `data:image/jpg;base64,${res.img}`
    })
}

onMounted(() => {
    getcaptchaImage()
    gettype_simp()
})
</script>

<style lang="scss" scoped>
::v-deep(.el-form-item__error) {
    position: absolute;
    right: 0;
    text-align: end;
}

::v-deep(.el-form){
    width: 360px;
    padding: 0 15px;
}

.registerbox {
    position: relative;

    ::v-deep(.el-form){
        width: 400px;
        .el-form-item--default{
            margin-bottom: 20px;
        }
    }

    .backbut {
        position: absolute;
        top: -100px;
        right: -100px;
    }

    .registerform {
        .el-input {
            height: 42px;
        }

        ::v-deep(.el-select) {
            height: 42px;
            .el-input__wrapper{
                height: 42px;
                font-size: 11px
            }
        }
    }

    .registerstep {
        display: flex;
        justify-content: center;

        &>div:last-child {
            &>div:last-child {
                display: flex;
                justify-content: space-evenly;
            }
        }

        .iteminput {
            width: 100%;
            display: flex;
            justify-content: flex-end;
        }
       ::v-deep(.el-form-item--default) {
            .el-form-item__label{
                line-height: inherit;
                align-items: center;
                margin: 0;
            }
        }
        .el-button{
            height: 35px;
            line-height: 35px;
            min-width: 140px;
            border-radius: 50px;
            margin-top: 10px;
            margin-bottom: 21px;
        }

    }
}

.formcenter {
    width: 100%;
    padding-bottom: 5px;
    display: flex;
    justify-content: space-between;
    margin-top: -15px;
    .nprivacyReadbox {
        display: flex;
        align-items: center;

        &>div:last-child {
            cursor: pointer;
            margin-left: 10px;
            font-size: 13px;
            span{
                color: var(--el-theme-color);
            }
        }
    }

    &>div:first-child {
        display: flex;
        align-items: center;

        &>div:last-child {
            cursor: pointer;
            margin-left: 10px;
            font-size: 13px;
            span{
                color: var(--el-theme-color);
            }
        }
    }
}
</style>