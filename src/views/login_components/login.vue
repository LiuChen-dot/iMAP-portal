<template>
    <div>
        <div>
            <div v-show="active == 0">
                <el-form ref="loginFormref" :model="loginForm" :rules="loginFormrules">
                    <el-form-item label="" prop="username">
                        <el-input  v-model="loginForm.username" :placeholder="i18n=='zh'?'请输入手机号':'Please enter your phone number'" >
                            <template #prefix>
                                <img src="@/assets/images/phone.png" alt="" width="15">
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="" prop="password">
                        <el-input v-model="loginForm.password" :placeholder="i18n=='zh'?'请输入密码':'Please enter your password'" show-password>
                            <template #prefix>
                                <img src="@/assets/images/password.png" alt="" width="15">
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="code">
                        <div style="position: relative;"></div>
                        <el-input v-model="loginForm.code" :placeholder="i18n=='zh'?'请输入验证码':'Please enter the verification code'">
                            <template #prefix>
                                <img src="@/assets/images/tpyzm.png" alt="" width="15">
                            </template>
                        </el-input>
                        <img @click="getcaptchaImage" style="position: absolute;right: 0;width: 80px;height: 40px;"
                            :src="captchaImage" />
                    </el-form-item>
                </el-form>
            </div>
            <div v-show="active == 1">
                <el-form ref="loginCodeFormref" :model="loginCodeForm" :rules="loginCodeFormrules">
                    <el-form-item label="" prop="username">
                        <el-input v-model="loginCodeForm.username" :placeholder="i18n=='zh'?'请输入手机号':'Please enter your phone number'">
                            <template #prefix>
                                <img src="@/assets/images/phone.png" alt="" width="15">
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="phoneCode">
                        <div style="position: relative;"></div>
                        <el-input v-model="loginCodeForm.phoneCode" :placeholder="i18n=='zh'?'请输入手机验证码':'Please enter the phone verification code'">
                            <template #prefix>
                                <img src="@/assets/images/yzm.png" alt="" width="15">
                            </template>
                        </el-input>
                        <div @click="sendCode"
                            style="position: absolute;right: 10px;line-height: 40px;cursor: pointer;font-size:11px;">
                            {{ codeSwitch ? (i18n=='zh'?'发送':'Send') : time }}
                        </div>
                    </el-form-item>
                    <el-form-item prop="code">
                        <div style="position: relative;"></div>
                        <el-input v-model="loginCodeForm.code" :placeholder="i18n=='zh'?'请输入验证码':'Please enter the verification code'">
                            <template #prefix>
                                <img src="@/assets/images/tpyzm.png" alt="" width="15">
                            </template>
                        </el-input>
                        <img @click="getcaptchaImage" style="position: absolute;right: 0;width: 80px;height: 40px;"
                            :src="captchaImage" />
                    </el-form-item>
                </el-form>
            </div>
            <div class="formcenter">
                <div>
                    <!-- <div class="nprivacyReadbox">
                        <el-checkbox v-model="loginprivacyCheckbox"></el-checkbox>
                        <div><span @click="openNprivacyRead" >《{{i18n=='zh'?'用户协议及隐私政策':'User agreement and privacy policy'}}》</span></div>
                    </div> -->
                </div>
                <el-button @click="props.changeActive(3)" style="border: none;">{{i18n=='zh'?'忘记密码':'Forget password'}}</el-button>
            </div>
        </div>
        <div class="loginbut">
            <el-button @click="login" type="info" 
                :style="`background-color: ${butcolor};padding:20px 120px;border-radius:50px`">{{i18n=='zh'?'立即登录':'Login now'}}</el-button>
        </div>
        <div class="phonelogin"><span @click="changeLogin" >{{ active ? (i18n=='zh'?'账号密码登录':'Account password login') : (i18n=='zh'?'手机号验证码登录':'Phone number verification login') }}</span></div>
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
import { onMounted, reactive, ref, watch } from "vue"
import useUserStore from '@/store/modules/user'
import { useLanguageStore } from '@/store/modules/language';
import { ElMessage } from 'element-plus'
import router from '@/router'
const userStore = useUserStore()


const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
const active = ref(0)

const emit = defineEmits(['activeChange']);

const props = defineProps(['changeActive'])
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
//登录按钮颜色
const butcolor = ref('#BCBCBC')
//登录按钮是否可点击
const disabled = ref(true)
const login = () => {
    if (!active.value) {
        // loginFormref.value.validate(value => {
        //     value && loginprivacyCheckbox.value ? userStore.login(loginForm).then(() => {
        //         router.push("/KnowledgeQuery");
        //     }).catch(err => {
        //         getcaptchaImage()
        //     }) : loginprivacyCheckbox.value ? '' : ElMessage.warning(i18n.value=='zh'?'请阅读用户协议及隐私政策':'Please read the user agreement and privacy policy')
        // })
        loginFormref.value.validate(value => {
            value  ? userStore.login(loginForm).then(() => {
                router.push("/KnowledgeQuery");
            }).catch(err => {
                getcaptchaImage()
            }) : ''
        })
    } else {
        // loginCodeFormref.value.validate(value => {
        //     if (value && loginprivacyCheckbox.value) {
        //         userStore.login(loginCodeForm).then(() => {
        //             router.push("/KnowledgeQuery");
        //         }).catch(err => {
        //             getcaptchaImage()
        //         })
        //     } else {
        //         loginprivacyCheckbox.value ? '' : ElMessage.warning(i18n.value=='zh'?'请阅读用户协议及隐私政策':'Please read the user agreement and privacy policy')
        //     }
        // })
        loginCodeFormref.value.validate(value => {
            if (value ) {
                userStore.login(loginCodeForm).then(() => {
                    router.push("/KnowledgeQuery");
                }).catch(err => {
                    getcaptchaImage()
                })
            } else {
            }
        })
    }
}
const loginFormref = ref()
const loginForm = reactive({
    username: "",
    password: "",
    code: "",
    uuid: "",
    phoneCode: "1234",
    platform: "user"
});
const loginFormrules = {
    username: [
        { required: true, validator: checkPhone, trigger: 'blur' },
    ],
    password: [
        { required: true, validator: checkpassword, trigger: 'blur' },
    ],
    code: [
        { required: true, message: i18n.value=='zh'?'请输入验证码':'Please enter verification code', trigger: 'blur' },
    ],
}

watch(() => loginForm.username, (item) => {
    // if (item.length == 11) {
    //     api.validateUserAgreement({ userName: item }).then(res => {
    //         res.data==='1' ? loginprivacyCheckbox.value = false : loginprivacyCheckbox.value = true
    //     })
    // }
})


const loginCodeFormref = ref()
const loginCodeForm = reactive({
    username: "",
    password: "",
    code: "",
    uuid: "",
    phoneCode: "",
    platform: "user"
});
const loginCodeFormrules = {
    username: [
        { required: true, validator: checkPhone, trigger: 'blur' },
    ],
    phoneCode: [
        { required: true, message: i18n.value=='zh'?'请输入手机验证码':'Please enter phone verification code', trigger: 'blur' },
    ],
    code: [
        { required: true, message: i18n.value=='zh'?'请输入验证码':'Please enter verification code', trigger: 'blur' },
    ],
}


watch(() => loginCodeForm.username, (item) => {
    // if (item.length == 11) {
    //     api.validateUserAgreement({ userName: item }).then(res => {
    //         res.data==='1' ? loginprivacyCheckbox.value = false : loginprivacyCheckbox.value = true
    //     })
    // }
})

//协议勾选框
const loginprivacyCheckbox = ref(false)
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
    if (loginForm.username.length == 11 || loginCodeForm.username.length == 11) {
        nprivacyReadtime.value = 5
        nprivacyReadtimeChange()
        api.getAgreement().then(res => {
            nprivacydialogtext.value = res.data
        })
        nprivacydialog.value = true
        return
    }
    ElMessage.warning(i18n.value=='zh'?'请先输入合法手机号!':'Please enter a legal phone number!')

}
//关闭用户协议弹窗
const closenprivacydialog = () => {
    nprivacydialog.value = false
    loginprivacyCheckbox.value = true
}


//发送验证码时间限制
const codeSwitch = ref(true)
const time = ref(60)
const sendCode = () => {
    if (codeSwitch.value) {
        if (loginCodeForm.username.length != 11 || loginCodeForm.code == '') {
            ElMessage.warning(i18n.value=='zh'?'手机号或图形验证码不能为空!':'Phone number or image verification code cannot be empty!')
            return
        }
        api.sendPhoneVerificationCode({
            code: loginCodeForm.code,
            userName: loginCodeForm.username,
            uuid: loginCodeForm.uuid
        }).then(res => {
            if (res.code == 200) {
                codeSwitch.value = false
                const timer = setInterval(() => {
                    if (time.value == 1) {
                        clearInterval(timer)
                        codeSwitch.value = true
                        time.value = 60
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

const changeLogin = () => {
    loginFormref.value.resetFields()
    loginCodeFormref.value.resetFields()
    // loginprivacyCheckbox.value = false
    // active.value ? active.value = 0 : active.value = 1
    // emit('activeChange',active.value)
    getcaptchaImage()
}


const judgewatchType = () => {
    return active.value ? loginCodeForm.username && loginCodeForm.phoneCode && loginCodeForm.code : loginForm.username && loginForm.password && loginForm.code 
    // return active.value ? loginCodeForm.username && loginCodeForm.phoneCode && loginCodeForm.code && loginprivacyCheckbox.value : loginForm.username && loginForm.password && loginForm.code && loginprivacyCheckbox.value
}
const watchForm = () => {
    if (judgewatchType()) {
        disabled.value = false
        butcolor.value = 'var(--el-theme-color)'
        return
    }
    disabled.value = true
    butcolor.value = '#BCBCBC'
}
//监听登录表单变化改变按钮状态
watch([loginForm, loginCodeForm], () => {
// watch([loginForm, loginCodeForm, loginprivacyCheckbox], () => {
    watchForm()
})

const captchaImage = ref('')
const uuid = ref('')
//图形验证码
const getcaptchaImage = () => {
    api.captchaImage().then(res => {
        uuid.value = res.uuid
        loginForm.uuid = res.uuid
        loginCodeForm.uuid = res.uuid
        captchaImage.value = `data:image/jpg;base64,${res.img}`
    })
}
onMounted(() => {
    getcaptchaImage()
})
</script>

<style lang="scss" scoped>
::v-deep(.el-input__wrapper) {
    height: 45px;
    background-color: rgba(28,248,142,0.1);
    box-shadow: none;
}

::v-deep(.el-form-item__error) {
    position: absolute;
    right: 0;
    text-align: end;
}
::v-deep(.el-form){
    padding: 0 40px;
    .el-form-item--default{
        margin-bottom: 20px;
    }
    .el-form-item--default:last-child{
        margin-bottom: 20px;
    }
}

.loginbut {
    text-align: center;

    .el-button {
        padding: 0 100px;
    }
}

.phonelogin {
    cursor: pointer;
    text-align: center;
    font-size: 15px;
    padding: 15px 0 5px;
    color: gray;
}

.formcenter {
    width: 100%;
    padding: 0 30px;
    padding-bottom: 20px;
    margin-top: -15px;
    display: flex;
    justify-content: space-between;

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