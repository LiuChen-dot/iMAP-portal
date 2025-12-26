<template>
  <div class="footer_page">
    <div class="footer">
      <div class="icon_list">
        <div style="cursor: pointer;" @click="gotogw">
          <img src="../../../assets/logo/logo1.png" alt="">
        </div>
      </div>
      <div>
        <div class="title placeholder-title"></div>
        <div class="cont">
          <p>{{ $t("message.value1") }}</p>
          <p>{{ $t("message.value2") }}</p>
        </div>
      </div>
      <div>
        <div class="title"></div>
        <div class="cont">
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
    <div class="filing-bar">
      <a class="filing-link" :href="links.copyright" target="_blank" rel="noopener">
        {{ $t('message.copyright') }}
      </a>
      <a class="filing-link" :href="links.icp" target="_blank" rel="noopener">
        <img src="../../../assets/logo/ICP-Filing.png" alt="ICP备案图标" />
        {{ $t('message.icpfull') }}
      </a>
      <a
        v-if="showPsb"
        class="filing-link"
        :href="links.psb"
        target="_blank"
        rel="noopener"
      >
        <img src="../../../assets/logo/PSB-Filing.png" alt="公网安备图标" />
        {{ $t('message.psbfull') }}
      </a>
    </div>
  </div>
</template>

<script setup>
const gotogw = ()=>{
  window.open('https://www.lishan.ltd/')
}


const showPsb = false
const links = {
  copyright: 'https://www.lishan.ltd/',
  icp: 'https://beian.miit.gov.cn/',
  psb: 'https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31011502019930'
}
</script>

<style lang="scss" scoped>
@import '../../../assets/styles/variables.module.scss';

.placeholder-title {
  height: 30px; // 与原来title的高度一致
  visibility: hidden; // 隐藏但占据空间
}
.footer_page {
  width: 100%;
  min-height: 180px;
  padding: 20px 100px 0;
  position: absolute;
  border-top: 1px solid var(--ccc);

  // 搭配1 浅色+黑色字体
  // background-color: #EBFFFB;
  // background-color: #e2f8fc;
  // box-shadow: 0px 0px 12px var(--boxshadow);
  // color: #4D4D4D;

  // 搭配2 深色+浅色字体
  background-color: #2E5939;
  // 2E5939 墨绿 // 264B82 蓝色
  box-shadow: 0px 0px 12px var(--boxshadow);
  color: #cfd3dc;

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

  .filing-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px 0 16px;
    margin-top: 12px;
    font-size: 12px;

    color: #cfd3dc; // 灰色字体
    // color: #4D4D4D; // 深色字体
    border-top: 1px solid var(--ccc);

    .filing-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: inherit;
      text-decoration: none;

      &:hover {
        color: #ffffff;
        text-decoration: underline;
      }

      img {
        height: 18px;
        width: auto;
      }
    }
  }
}
</style>