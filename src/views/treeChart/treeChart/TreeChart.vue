<template>
  <table v-if="treeData.dataValue">
    <tr>
      <td :colspan="Array.isArray(treeData.childList) ? treeData.childList.length * 2 : 1"
        :class="{ parentLevel: Array.isArray(treeData.childList) && treeData.childList.length, extend: Array.isArray(treeData.childList) && treeData.childList.length && treeData.extend }">
        <div
          :class="{ node: true, hasMate: treeData.mate, mateImg: !treeData.image_url && treeData.mate && treeData.mate.findIndex(val => val.image_url) == -1 }">
          <div class="person" :class="Array.isArray(treeData.class) ? treeData.class : []"
            @click="emit('click-node', treeData)">
            <div class="name" :title="treeData.dataValue">
              <div>
                {{ treeData.dataValue }}
              </div>
            </div>
          </div>
        </div>
        <div class="extend_handle"
          v-if="(Array.isArray(treeData.childList) && treeData.childList.length) || treeData.hiveChild"
          @click="toggleExtend(treeData)"></div>
      </td>
    </tr>
    <tr v-if="Array.isArray(treeData.childList) && treeData.childList.length && treeData.extend">
      <td v-for="(children, index) in treeData.childList" :key="index" colspan="2" class="childLevel">
        <TreeChart :json="children" @click-node="emit('click-node', $event)" @click-open="emit('click-open', $event)" />
      </td>
    </tr>
  </table>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const props = defineProps(['json'])
const emit = defineEmits(['click-node', 'click-open'])
const treeData = ref([])
const toggleExtend = (treeData) => {
  if (!treeData.childList) {
    emit('click-open', treeData)
  }
  treeData.extend = !treeData.extend;
}
let extendKey = (jsonData) => {
  jsonData.extend = jsonData.level >= 2 ? false : true
  if (Array.isArray(jsonData.childList)) {
    jsonData.childList.forEach(item => {
      extendKey(item)
    })
  }
  return jsonData;
}

nextTick(() => {
  setTimeout(() => {
    if (props.json) {
      if (Array.isArray(props.json)) {
        props.json.forEach(item => {
          treeData.value = extendKey(item)
        })
      } else {
        treeData.value = props.json
      }
    }
  }, 500);
})

</script>


<style lang="scss" scoped>
table {
  margin-top: 20px;
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

td {
  position: relative;
  vertical-align: top;
  padding: 0 0 50px 0;
  text-align: center;
}

.extend_handle {
  position: absolute;
  left: 50%;
  bottom: 15px;
  width: 10px;
  height: 10px;
  padding: 10px;
  transform: translate3d(-15px, 0, 0);
  cursor: pointer;
  box-sizing: initial;
}

.extend_handle:before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid;
  border-color: #ccc #ccc transparent transparent;
  transform: rotateZ(135deg);
  transform-origin: 50% 50% 0;
  transition: transform ease 300ms;
}

.extend_handle:hover:before {
  border-color: #333 #333 transparent transparent;
}

.extend .extend_handle:before {
  transform: rotateZ(-45deg);
}

.extend::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 15px;
  height: 15px;
  border-left: 2px solid #ccc;
  transform: translate3d(-1px, 0, 0)
}

.childLevel::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  height: 15px;
  border-left: 2px solid #ccc;
  transform: translate3d(-1px, 0, 0)
}

.childLevel::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -15px;
  border-top: 2px solid #ccc;
}

.childLevel:first-child:before,
.childLevel:last-child:before {
  display: none;
}

.childLevel:first-child:after {
  left: 50%;
  height: 15px;
  border: 2px solid;
  border-color: #ccc transparent transparent #ccc;
  border-radius: 6px 0 0 0;
  transform: translate3d(1px, 0, 0)
}

.childLevel:last-child:after {
  right: 50%;
  height: 15px;
  border: 2px solid;
  border-color: #ccc #ccc transparent transparent;
  border-radius: 0 6px 0 0;
  transform: translate3d(-1px, 0, 0)
}

.childLevel:first-child.childLevel:last-child::after {
  left: auto;
  border-radius: 0;
  border-color: transparent #ccc transparent transparent;
  transform: translate3d(1px, 0, 0)
}

.node {
  position: relative;
  display: inline-block;
  margin: 0 1em;
  box-sizing: border-box;
  text-align: center;
}

.node .person {
  position: relative;
  display: inline-block;
  z-index: 2;
  text-align: center;
  cursor: pointer;
}

.node .person .avat {
  display: block;
  width: 4em;
  height: 4em;
  margin: auto;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.node .person .avat img {
  width: 100%;
  height: 100%;
}

.node .person .name {
  height: 2em;
  line-height: 2em;
  width: 100%;
}

.node.hasMate::after {
  content: "";
  position: absolute;
  left: 2em;
  right: 2em;
  top: 2em;
  border-top: 2px solid #ccc;
  z-index: 1;
  height: 10px;
  border: 2px solid;
  border-color: #ccc #ccc transparent #ccc;
  border-radius: 6px 6px 0 0;
  transform: translate3d(-1px, 0, 0);
}

.node.mateImg::after {
  content: "";
  position: absolute;
  right: 3em;
  height: 10px;
  top: auto;
  bottom: 3px;
  border: 2px solid;
  border-color: transparent #ccc #ccc #ccc;
  border-radius: 0 0 6px 6px;
  transform: translate3d(-1px, 0, 0);
  left: 3em
}

/* 横板 */
.landscape {
  transform: translate(-100%, 0) rotate(-90deg);
  transform-origin: 100% 0;

}

.landscape .node {
  width: 70px;
  height: 150px;
  padding-top: 10px;
}

.landscape .person {
  position: relative;
  transform: rotate(90deg);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

}


.landscape .person .avat {
  position: absolute;
  left: 0;

}

.landscape .person .name {
  height: 100%;
  width: 200%;
  display: flex;
  align-items: center;

  &>div {
    width: 100%;
    word-wrap: break-word;
    // overflow: hidden;
    // text-overflow: ellipsis;
    // display: -webkit-box;
    // -webkit-line-clamp: 3;
    // -webkit-box-orient: vertical;
  }
}

.landscape .hasMate {
  position: relative;

}

.landscape .hasMate .person {
  position: absolute;
}

.landscape .hasMate .person:first-child {
  left: auto;
  right: -4em;
}

.landscape .hasMate .person:last-child {
  left: -4em;
  margin-left: 0;
}
</style>
