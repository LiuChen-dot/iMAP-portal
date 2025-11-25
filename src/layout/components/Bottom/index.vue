<template>
  <div class="footer_page">
    <div class="footer">
      <div class="icon_list">
        <div>
          <img src="../../../assets/logo/logo1.png" alt="">
        </div>
      </div>
      <div>
        <div class="title">{{ $t("message.jz") }} </div>
        <div class="cont">
          <p>{{ $t("message.value") }}</p>
        </div>
      </div>
      <div>
        <div class="title">{{ $t("message.yj") }} </div>
        <div class="cont">
          <p>{{ $t("message.vandm1") }}</p>
          <p>{{ $t("message.vandm2") }}</p>
        </div>
      </div>
      <ul>
        <p>{{ $t("message.lxwm") }}</p>
        <li>{{ $t("message.gsmc") }}</li>
        <li style="cursor: pointer;" @click="gotogw">{{ $t("message.gw") }}</li>
        <li>{{ $t("message.lxdh") }}</li>
        <li>{{ $t("message.email") }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const gotogw = ()=>{
  window.open('http://www.fojann.com')
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/variables.module.scss';

.footer_page {
  width: 100%;
  height: 150px;
  padding: 20px 100px 0;
  position: absolute;
  background: var(--footerbg);
  box-shadow: 0px 0px 12px var(--boxshadow);
  border-top: 1px solid var(--ccc);
  color: white;

  .footer {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    font-size: 12px;
    padding: 0 20px;

    ul {
      line-height: 20px;

      p {
        font-weight: 700;
        margin-bottom: 6px;
      }

      li {
        list-style: none;
      }
    }

    .title {
      line-height: 30px;
      font-weight: 700;
    }

    .cont {
      line-height: 20px;
    }
  }

  .icon_list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    &>div {
      display: flex;
      align-items: center;

      &>div {
        font-size: 16px;
      }
    }

    img {
      width: 150px;
      // height: 60px;
    }
  }
}
</style>