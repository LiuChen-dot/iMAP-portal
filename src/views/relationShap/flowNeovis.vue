 <template>
  <div>
    <div class="search-form">
      <el-form
        layout="inline"
        :model="formData"
        @submit="handleSubmit"
        @reset="handleReset"
      >
        <el-row type="flex" justify="space-between">
          <el-col :span="12">
            <el-form-item>
              <el-input
                v-model="formData.searchSQL"
                placeholder="查询语句"
                style="width: 30rem"
              >
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" html-type="submit"> 查询 </el-button>
              <el-button html-type="reset" style="margin-left: 10px">
                重置
              </el-button>
            </el-form-item>
          </el-col>
          <el-form-item>
            <el-button @click="download">
              <el-icon style="font-size: 16px" type="cloud-download" />
            </el-button>
            <el-button style="margin-left: 10px" @click="upload">
              <el-icon style="font-size: 16px" type="cloud-upload" />
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </div>
    <div class="main">
      <div class="left" id="viz" ref="viz" ></div>
      <!-- <el-empty
        class="empty"
        :image-style="{ height: '200px' }"
        v-else
      ></el-empty> -->
    </div>
    <!-- <el-modal
      title="上传文件"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <el-upload
        name="file"
        :multiple="false"
        :fileList="fileList"
        :before-upload="beforeUpload"
      >
        <el-button> <el-icon type="upload" />选择文件 </el-button>
      </el-upload>
    </el-modal> -->
  </div>
</template>
<script>
import NeoVis from "neovis.js";
import config from "../../utils/neo4j.config.js";
// const axios = require('axios')
export default {
  name: "indexPage",
  data() {
    return {
      viz: {},
      showData:true,
      searchSQL: "MATCH p=()-[r:CANDIDATE]->() RETURN p LIMIT 25",
      formData: {
        searchSQL: undefined,
      },
      // confirmLoading: false,
      visible: false,
      fileList: [],
    };
  },
  created() {},

  mounted() {
    // if(this.showData){
      this.$nextTick(()=>{
        this.draw();
      })
      
    // }
  },
  methods: {
    draw() {
      let viz = document.getElementById("#viz");
      this.viz = new NeoVis(config(viz));
      console.log("🚀 ~ draw ~ viz:", this.viz.nodes);
      this.viz.render();
    },
    nodeClick(node) {
      console.log("🚀 ~ nodeClick ~ node:", node);
      this.viz.network.off("click");
      const statement =
        "match p = (n)-[r]->() where id(n)= " + node.nodeId + " return p";
      this.viz.renderWithCypher(statement);
    },
    handleReset() {
      this.formData = {
        searchSQL: undefined,
      };
    },
    handleSubmit() {
      const cypher = this.formData.searchSQL;
      if (cypher.length > 3) {
        this.viz.renderWithCypher(cypher);
      } else {
        this.viz.reload();
      }
    },
    // download() {
    //   console.log(this.formData);
    //   axios.get('/api/download').then(res=>{
    //     console.log(res);
    //     let a = document.createElement('a');
    //     // a.download = fileName
    //     a.style.display = 'none';
    //     a.href = 'http://10.10.10.16:5000/download';
    //     document.body.appendChild(a);
    //     a.click();
    //     URL.revokeObjectURL(a.href)
    //     document.body.removeChild(a)

    //   })

    // },
    upload() {
      this.visible = true;
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    handleOk() {
      console.log("sss");
      const { fileList } = this;
      let formData = new FormData();
      fileList.forEach((file) => {
        formData.append("file", file);
      });
      axios.post('/api/upload',formData).then(res=>{
        console.log(res);
        if(res){
          this.visible = false
          this.$message.success('上传成功！')
        }

      })
    },
    handleCancel() {
      this.visible = false;
    },
  },
};
</script>
<style scoped>
.search-form {
  /* height: 60px; */
  padding: 10px 0 10px 30px;
}
/* 主体部分 */
.MainArea {
  height: 100%;
}
.Mainleft {
  height: 100%;
  background: #ffffff;
}
.menu {
  /*这个样式不写，右键弹框会一直显示在画布的左下角*/
  position: absolute;
  background: rgba(3, 3, 3, 0.6);
  border-radius: 5px;
  left: -99999px;
  top: -999999px;
  color: #fff;
  padding: 5px;
}
.main {
  height: 80vh;
  width: 100%;
  background-color: #fff;
}
.left {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
}

#viz {
  width: 100%;
  height: 100%;
  font: 22pt arial;
}
.empty {
  position: relative;
  top: 30%;
  height: 300px;
}
</style>