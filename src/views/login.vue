<template>
  <div class="loginBox">
    <!-- 登录 -->
    <div v-if="showBox == 0" class="loginForm">
      <div>
        <div>
          <img src="@/assets/logo/logo.png" />
        </div>
      </div>
      <div :class="[i18n=='zh'?'':'w-480']">
        <div v-show="active != 3">
          <div @click="active = 0" :class="[active ? '' : 'active',i18n=='zh'?'':'fts-18']">{{actives?(i18n=='zh'?'验证码登录':'Verification code login'):(i18n=='zh'?'账号密码登录':'Account password login')}}</div>
          <!-- <div @click="active = 1" :class="[active ? 'active' : '',i18n=='zh'?'':'fts-18']">{{i18n=='zh'?'新用户注册':'New user registration'}}</div> -->
        </div>
        <login :changeActive="changeActive" v-if="active == 0" @activeChange="handleactiveChange"></login>
        <register :changeActive="changeActive" v-if="active == 1"></register>
        <forgetpwd :changeActive="changeActive" v-if="active == 3"></forgetpwd>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useLanguageStore } from '@/store/modules/language';

import login from '@/views/login_components/login'
import register from '@/views/login_components/register'
import forgetpwd from '@/views/login_components/forgetpwd'
import router from '@/router'


const languageStore = useLanguageStore()
const i18n = computed(() => languageStore.i18n)
const active = ref(0)
const changeActive = (value) => {
  active.value = value
}
const actives=ref(0)
const handleactiveChange=(val)=>{
  actives.value=val
}
const showBox = ref(0)

onMounted(() => {
 active.value = router.currentRoute.value.query.active || 0
})
</script>

<style lang='scss' scoped>
@import '../assets/styles/variables.module.scss';
.loginBox {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/images/login/loginback.jpg');
  background-size: 100% 100%;
  position: relative;

  .loginForm {
    display: flex;
    align-items: stretch;
    position: absolute;
    right: 15%;
    &>div:first-child {
      position: fixed;
      left: 30px;
      top: 25px;
      img {
        width: 235px;
      }
    }

    &>div:last-child {
      border-radius: 10px;
      padding: 10px;
      background-color: var(--white);
      box-shadow: 0 0 10px 2px var(--gainsboro);
      width: 450px;
      &>div:first-child {
        font-size: 20px;
        padding-bottom: 25px;
        padding-top:20px;
        display: flex;
        justify-content: space-evenly;

        &>div {
          padding: 5px;
          cursor: pointer;
        }
      }

      .active {
        font-size: 22px;
        font-weight: bold;
        border-bottom: 3px solid var(--el-theme-color);
      }

      &>div:nth-child(3) {
        text-align: center;

        .el-button {
          padding: 0 100px;
        }
      }

      &>div:nth-child(4) {
        text-align: center;
        font-size: 12px;
        padding: 20px 0 0;
      }

      .formcenter {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }

    .registerbut {
      position: absolute;
      top: -100px;
      right: -100px;
    }
  }
  .registerbox{
    .registerform{
      .el-input{
        width: 260px;
        height: 45px;
      }
    }
  }

}
</style>
