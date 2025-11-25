<template>
  <div style="width: 100%;height: 100%;">
    <TreeChart />
  </div>
</template>


<script setup>
import TreeChart from "./treeChart/App.vue";

</script>

<style lang="scss" scoped>
::v-deep(.el-card.is-always-shadow) {
  border-bottom-width: 0px;
}

::v-deep(.el-divider--horizontal) {
  margin-top: 0px;
}

.list_Cont {
  .list_header {
    display: flex;

    p {
      flex: 1;
      font-size: 20px;
      text-align: center;
      font-weight: 700;
    }
  }

  .list_box {
    display: flex;
    margin-top: 15px;
    min-height: calc(100vh - 464px);

    .list_left {
      width: 265px;

      .tab {
        background: var(--innerbg);
        // padding: 15px 0;
        box-sizing: border-box;
        font-size: 14px;
        line-height: 40px;
        width: 265px;

        .tabitem {
          display: flex;
          align-items: center;
          padding: 0 15px;
          cursor: pointer;

          span {
            flex: 1;
          }
        }

        .active {
          background: var(--inneractive);
          color: var(--el-theme-color);
        }
      }
    }

    .list_rig {
      flex: 1;
      overflow: hidden;
    }
  }
}

.message-style {
  display: block;
  max-width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-theme-color);
  font-weight: 700;
  cursor: pointer;
}

.content-style {
  line-height: 30px;
  display: flex;
  flex-wrap: wrap;

  p {
    display: flex;
    width: 50%;
    padding-right: 30px;

    .lable {
      font-weight: 600;
    }

    .labValue {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
  }
}

.circle {
  margin-right: 8px;
  display: flex;
}

::v-deep(.el-input-group__prepend) {
  background: none;
  box-shadow: none;
}

.content {
  background-color: var(--innerbg);
  border-radius: 5px;
}

::v-deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input .el-input__wrapper) {
  box-shadow: none;
  color: #000;
}

::v-deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
}
</style>
