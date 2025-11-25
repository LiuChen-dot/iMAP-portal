<template>
  <div class="search_home">
    <div class="searchTitle">{{ $t("message.searchtitle") }}</div>
    <div class="searchbox">
      <el-input class="fts-16" v-model="searchValue" @keyup.enter="SearchButton"
        placeholder="Please enter a keyword"></el-input>
      <el-button @click="SearchButton" icon="Search" size="small"></el-button>
    </div>
    <div class="keyWords">
      <div>{{ $t("message.rmss") }}：</div>
      <div class="keyCont">
        <div v-for="(item, index) in selectOptions" :key="index" @click="godetail(item)">{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import router from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { getDataTypeData } from '@/api/data.js'
const route = useRoute();

const searchValue = ref(route.query.value ? route.query.value : (sessionStorage.getItem('SearchValue') ? sessionStorage.getItem('SearchValue') : ''));

// 搜索框
const selectValue = ref("");
const selectOptions = ref(["Escherichia coli", "alt", "napC", "L-aspartate oxidase", "DNA polymerase II"]);

const routers = useRouter()
const SearchButton = () => {
  routers.push({ path: '/Search', query: { value: searchValue.value } })
}
const godetail = (item) => {
  searchValue.value = item
  routers.push({ path: '/Search', query: { value: searchValue.value } })
}
onMounted(() => {

})
</script>

<style lang="scss" scoped>
.search_home {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 999;
}

.searchTitle {
  margin-top: -60px;
  padding-bottom: 60px;
  font-size: 40px;
  font-weight: bold;
  color: white;
  width: 1200px;
  text-align: center;
}



.searchbox {
  ::v-deep(.el-input__wrapper) {
    box-shadow: none;
  }

  .el-input {
    padding-right: 80px;
    background-color: white;
    width: 470px;
    height: 46px;
    border: 1px solid var(--el-theme-color);
    border-radius: 3px 0 0 3px;

    :deep(.el-input__inner::placeholder) {
      color: #999999;
    }
  }


  .el-button {
    position: relative;
    font-size: 18px;
    color: white;
    width: 64px;
    height: 46px;
    background-color: var(--el-theme-color);
    border: none;
    border-radius: 0;
    border-radius: 0 3px 3px 0;

    ::v-deep(svg) {
      cursor: pointer;
    }
  }
}

.keyWords {
  display: flex;
  padding: 8px 1px;
  font-size: 16px;
  width: 535px;
  color: white;
  line-height: 22px;

  .keyCont {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    &>div {
      padding-right: 12px;
      cursor: pointer;
      margin: 0 5px;
      padding: 0 1px;
      text-align: center;
    }

    &>div:hover {
      color: var(--el-theme-color);
      border-bottom: 1px solid var(--el-theme-color);
    }
  }
}

::v-deep(.el-input) {
  --el-input-focus-border-color: none;
  --el-input-hover-border-color: none;
  --el-input-focus-border: none;
}

::v-deep(.el-select) {
  --el-select-input-focus-border-color: none;
}

::v-deep(.el-input__inner) {
  padding: 0 !important;
  margin: 0 !important;
}
</style>
