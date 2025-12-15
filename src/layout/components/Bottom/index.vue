<template>
  <div class="footer_page">
    <div class="footer">
      <div class="icon_list">
        <div style="cursor: pointer;" @click="gotogw">
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
          <!--
          <p>{{ $t("message.vandm2") }}</p>
          -->
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

.footer_page {
  width: 100%;
  min-height: 180px;
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

  .filing-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px 0 16px;
    margin-top: 12px;
    font-size: 12px;
    color: #cfd3dc;
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