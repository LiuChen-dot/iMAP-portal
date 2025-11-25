<template>
  <div>
    <div class="search_home">
      <div class="searchbox">
          <el-input class="fts-20" v-model="searchValue" @keyup.enter="SearchButton" placeholder="Please enter a keyword" ></el-input>
          <el-button @click="SearchButton" icon="Search" size="small"></el-button>
      </div>
      <div class="keyWords">
        <span>{{$t("message.rmss")}}：</span>
        <div class="keyCont">
          <div v-for="(item,index) in selectOptions" :key="index" @click="godetail(item)">{{item}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref  } from "vue";
import router from '@/router'
import { useRoute,useRouter } from 'vue-router'
import { getDataTypeData } from '@/api/data.js'
const route = useRoute();

const searchValue = ref(route.query.value?route.query.value:(sessionStorage.getItem('SearchValue')?sessionStorage.getItem('SearchValue'):''));

// 搜索框
const selectValue = ref("");
const selectOptions = ref(["Escherichia coli", "alt", "napC", "L-aspartate oxidase", "DNA polymerase II"]);

const routers=useRouter()
const SearchButton=()=>{
    routers.push({path:'/Search',query:{value:searchValue.value}})
}
const godetail=(item)=>{
  searchValue.value=item
  routers.push({path:'/Search',query:{value:searchValue.value}})
}
onMounted(()=>{

})
</script>

<style lang="scss" scoped>
.search_home{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.searchbox {
  width: 900px;
  display: flex;
  justify-content: center;
  box-shadow: 0 0.125rem 0.25rem 0.125rem rgba(22, 29, 57, 0.2);
  border-radius: 30px;
  ::v-deep(.el-input__wrapper) {
    box-shadow: none;
  }

  .el-input {
    padding: 10px 0;
    padding-left: 40px;
    padding-right: 80px;
    font-size: 18px;
    background-color: white;
    border-radius: 30px;
    height: 60px;
  
  }

  .el-button {
    position: relative;
    font-size: 25px;
    border-radius: 30px;
    width: 140px;
    height: 60px;
    margin-left: -50px;
    ::v-deep(svg){
      cursor: pointer;
    }
  }
}

.keyWords {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  font-size: 16px;
  width: 790px;
  span{
    width: 80px;
    display: flex;
    padding-top: 3px;
    font-weight: 700;
  }
  .keyCont{
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    & > div {
      color: #333333;
      padding: 7px 16px;
      border-radius: 30px;
      margin: 0 10px 5px;
      background: #fff;
      cursor: pointer;
    }
    & > div:hover{
      color: var(--el-theme-color);
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
