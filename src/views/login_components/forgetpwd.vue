<template>
    <div class="resetpwdbox">
        <div>{{i18n=='zh'?'忘记密码':'Forget Password'}}</div>
        <div>
            <!-- <div v-if="resetpwdActive == 0" class="resetpwdsecond">
                <el-form style="padding-top: 20px;" ref="forgetpwdfirstFormref" :model="forgetpwdfirstForm"
                    :rules="forgetpwdfirstFormrules">
                    <el-form-item label="手机号" prop="username">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdfirstForm.username" placeholder="手机号"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item label="手机验证码" prop="phoneCode">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdfirstForm.phoneCode" placeholder="请输入手机验证码"></el-input>
                            <div @click="sendCode"
                                style="position: absolute;right: 10px;line-height: 40px;cursor: pointer;">
                                {{ codeSwitch ? '发送' : time }}
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="图形验证码" prop="code">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdfirstForm.code" placeholder="请输入验证码"></el-input>
                            <img @click="getcaptchaImage" style="position: absolute;right: 0;width: 80px;height: 35px;"
                                :src="captchaImage" />
                        </div>
                    </el-form-item>
                </el-form>
                <div><el-button @click="resetpwdnext" type="info">下一步</el-button></div>
                <div>
                    <div><el-button @click="props.changeActive(0)" type="primary">返回登录</el-button></div>
                    <div><el-button @click="props.changeActive(1)">注册账号</el-button></div>
                </div>
            </div> -->
            <div v-if="resetpwdActive == 0" class="resetpwdsecond">
                <el-form style="padding-top: 20px;" ref="forgetpwdsecondFormref" :model="forgetpwdsecondForm" :label-position="i18n=='zh'?'':'top'"
                    :rules="forgetpwdsecondFormrules" :label-width="95">
                    <el-form-item :label="i18n=='zh'?'手机号':'Phone number'" prop="username" >
                        <div class="iteminput">
                            <el-input v-model="forgetpwdsecondForm.username" :placeholder="i18n=='zh'?'请输入手机号':'Please enter your phone number'"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'手机验证码':'Phone verification code'" prop="phoneCode">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdsecondForm.phoneCode" :placeholder="i18n=='zh'?'请输入手机验证码':'Please enter your phone verification code'"></el-input>
                            <div @click="sendCode"
                                style="position: absolute;right: 10px;line-height: 40px;cursor: pointer;">
                                {{ codeSwitch ? (i18n=='zh'?'发送':'Send') : time }}
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'图形验证码':'Image verification code'" prop="code">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdsecondForm.code" :placeholder="i18n=='zh'?'请输入验证码':'Please enter the verification code'"></el-input>
                            <img @click="getcaptchaImage" style="position: absolute;right: 0;width: 80px;height: 35px;"
                                :src="captchaImage" />
                        </div>
                    </el-form-item>
                </el-form>
                <div class="just-c-sb">
                    <el-button @click="props.changeActive(0)" type="primary">{{i18n=='zh'?'返回登录':'Back to login'}}</el-button>
                    <el-button @click="resetpwdnext" type="primary">{{i18n=='zh'?'下一步':'Next step'}}</el-button>
                </div>
                <!-- <div>
                    <div><el-button @click="props.changeActive(0)" type="primary">{{i18n=='zh'?'返回登录':'Back to login'}}</el-button></div>
                    <div><el-button @click="props.changeActive(1)">{{i18n=='zh'?'注册账号':'Register account'}}</el-button></div>
                </div> -->
            </div>
            <div v-else-if="resetpwdActive == 1" class="resetpwdthird">
                <el-form ref="forgetpwdthirdFormref" :model="forgetpwdthirdForm" :rules="forgetpwdthirdFormrules" :label-width="95" :label-position="i18n=='zh'?'':'top'">
                    <el-form-item :label="i18n=='zh'?'新密码':'New password'" prop="password">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdthirdForm.password" type="password" :placeholder="i18n=='zh'?'请输入新密码':'Please enter a new password'" show-password="true"></el-input>

                        </div>
                    </el-form-item>
                    <el-form-item :label="i18n=='zh'?'确认新密码':'Confirm new password'" prop="confirmpassword">
                        <div class="iteminput">
                            <el-input v-model="forgetpwdthirdForm.confirmpassword" type="password" :placeholder="i18n=='zh'?'请输入确认新密码':'Please enter the confirmed new password'" show-password="true" ></el-input>
                        </div>
                    </el-form-item>
                </el-form>

                <div><el-button @click="resetpwdnext" type="primary">{{i18n=='zh'?'确定':'Confirm'}}</el-button></div>
            </div>

        </div>
    </div>
</template>

<script setup>
import api from '@/utils/api/index'
import useUserStore from '@/store/modules/user'
import router from '@/router'
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
const props = defineProps(['changeActive'])
import { useLanguageStore } from '@/store/modules/language';

const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
//----------------------------------忘记密码业务
const changepwduuid = ref('')



//发送验证码时间限制
const codeSwitch = ref(true)
const time = ref(60)
const sendCode = () => {
    if (codeSwitch.value) {
        if (forgetpwdsecondForm.username.length != 11 || forgetpwdsecondForm.code == '') {
            ElMessage.warning(i18n.value=='zh'?'手机号或图形验证码不能为空!':'Phone number or image verification code cannot be empty!')
            return
        }
        api.sendPhoneVerificationCode({
            code: forgetpwdsecondForm.code,
            userName: forgetpwdsecondForm.username,
            uuid: uuid.value
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
const checkPhone = (rule, value, callback) => {
  const phoneReg = /^\d{11}$/;
  if (!value) {
    return callback(new Error(i18n.value=='zh'?"手机号不能为空":"Phone number cannot be empty"));
  }
  setTimeout(() => {
    if (!Number.isInteger(+value)) {
      callback(new Error(i18n.value=='zh'?"请输入数字值":"Please enter a numeric value"));
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
        callback(new Error(i18n.value=='zh'?"密码至少为6-16位字母和数字的组合":"Password must be a combination of at least 6-16 letters and numbers"));
    }
  }, 100);
};
const captchaImage = ref('')
const uuid = ref('')
//图形验证码
const getcaptchaImage = () => {
    api.captchaImage().then(res => {
        uuid.value = res.uuid
        captchaImage.value = `data:image/jpg;base64,${res.img}`
    })
}

const forgetpwdsecondFormref = ref()
const forgetpwdsecondForm = reactive({
    username: '',
    phoneCode: '',
    code: ''
})
const forgetpwdsecondFormrules = {
    username: [
        { required: true, validator: checkPhone, trigger: 'blur' },
    ],
    phoneCode: [
        { required: true, message: i18n.value=='zh'?'请输入手机验证码':'Please enter phone verification code', trigger: 'blur' },
    ],
    code: [
        { required: true, message: i18n.value=='zh'?'请输入图形验证码':'Please enter image verification code', trigger: 'blur' },
    ]
}

const forgetpwdthirdFormref = ref()
const forgetpwdthirdForm = reactive({
    password: '',
    confirmpassword: ''
})

const confirmpwdrules = (rule, value, callback) => {
    forgetpwdthirdForm.password == value ? callback() : callback(i18n.value=='zh'?'两次密码不一致':'Twice passwords are inconsistent')
}
const forgetpwdthirdFormrules = {
    password: [
        { required: true, validator: checkpassword, trigger: 'blur' },
    ],
    confirmpassword: [
        { required: true, message: i18n.value=='zh'?'请输入确认新密码':'Please enter confirm new password', trigger: 'blur' },
        { validator: confirmpwdrules, trigger: 'blur' }
    ]
}

//忘记密码步骤条逻辑
const resetpwdActive = ref(0)
const resetpwdnext = () => {
    if (resetpwdActive.value == 0) {
        forgetpwdsecondFormref.value.validate(value => {
            if (value) {
                api.forgottenPassword({
                    userName: forgetpwdsecondForm.username,
                    verificationCode: forgetpwdsecondForm.phoneCode
                }).then(res => {
                    if (res.code == 200) {
                        changepwduuid.value = res.data
                        resetpwdActive.value++
                    }
                })
            }
        })
    }
    else if (resetpwdActive.value == 1) {
        forgetpwdthirdFormref.value.validate(value => {
            if (value) {
                api.doForgottenPassword({
                    pwd: forgetpwdthirdForm.password,
                    uuid: changepwduuid.value
                }).then(res => {
                    if (res.code == 200) {
                        ElMessage.success(i18n.value=='zh'?'修改密码成功':'Modify password successfully')
                        props.changeActive(0)
                    }
                })
            }
        })
    }
}

onMounted(() => {
    getcaptchaImage()
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
    margin: 0 auto;
    padding: 0 15px;
    .el-form-item--default{
        margin-bottom: 30px;
        .el-form-item__label{
            margin: 0;
        }
    }
    .el-form-item--default:last-child{
        margin-bottom: 18px;
    }
}
.resetpwdbox {
    padding: 50px 0;

    .iteminput {
        width: 100%;
        display: flex;
        justify-content: flex-end;

        .el-input {
            height: 35px;
            font-size: 11px;
        }
    }

    &>div:first-child {
        font-size: 30px;
        text-align: center;
    }

    &>div:last-child {
        font-size: 15px;

        .resetpwdsecond {
            &>div:first-child {
                padding: 30px 0;

            }

            &>div:nth-child(2) {
                text-align: center;
                padding: 0 15px;
                .el-button {
                    // padding: 20px 130px;
                    color: white
                }
            }

            &>div:last-child {
                padding: 30px 20px;
                display: flex;
                justify-content: space-between;
            }
        }

        .resetpwdthird {

            padding: 30px 0;

            &>div:last-child {
                padding: 30px 0;
                text-align: center;
            }
        }


    }
}
</style>