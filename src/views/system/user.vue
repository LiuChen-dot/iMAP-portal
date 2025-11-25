<template>
    <div class="app-main">
        <el-card>
            <div class="cardbox">
                <el-card style="flex:2;margin-right: 1rem;">
                    <el-tree :data="treedata" node-key="label" :props="defaultProps" @node-click="handleNodeClick" :default-expanded-keys="['技术部门']"></el-tree>
                </el-card>
                <el-card style="flex:16">
                    <div class="topbox">
                        <div class="topleftbox">
                            <div>
                                筛选：
                            </div>
                            <div>
                                <div>
                                    用户：
                                </div>
                                <el-input style="width: 200px;" v-model="searchuser" placeholder="请输入用户名"></el-input>
                            </div>
                            <div>
                                <div>
                                    用户状态：
                                </div>
                                <el-select v-model="condition" placeholder="请选择用户状态">
                                    <el-option v-for="item in conditionList" :label="item.value" :value="item.value"
                                        :key="item.value"></el-option>
                                </el-select>
                            </div>
                            <div>
                                <el-button type="primary">查询</el-button>
                                <el-button>重置</el-button>
                            </div>
                        </div>
                        <div class="toprighttbox">

                            <div style="flex: 2;">
                                <el-button @click="openAdddialog" type="primary">添加用户</el-button>
                            </div>
                        </div>
                    </div>
                    <el-table :data="tableData" style="width: 100%">
                        <el-table-column align="center" prop="usernum" label="用户账号">
                        </el-table-column>
                        <el-table-column align="center" prop="username" label="用户姓名">
                        </el-table-column>
                        <el-table-column align="center" prop="work" label="所在单位">
                        </el-table-column>
                        <el-table-column align="center" label="用户角色权限">
                            <template v-slot="scope">
                                <el-button @click="openuserDetailsdialog" size="small" type="primary">详情</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作记录">
                            <template v-slot="scope">
                                <el-button @click="openuserEditRecorddialog" size="small" type="primary">查看</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="用户状态">
                            <template v-slot="scope">
                                <el-tag v-if="scope.row.condition" type="success">有效</el-tag>
                                <el-tag v-else type="danger">无效</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作">
                            <template v-slot="scope">
                                <el-button @click="openchangeUserinfodialog" size="small" type="primary">修改</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="paginationbox">
                        <el-pagination :current-page="paginationinfo.currentPage" :page-size="paginationinfo.pageSize"
                            :page-sizes="[10, 20, 50, 100, 200, 400, 500, 1000]" background small
                            layout="total, sizes, prev, pager, next, jumper" :total="paginationinfo.total"
                            @size-change="changeSize" @current-change="changeCurrent" />
                    </div>
                </el-card>
            </div>
        </el-card>
        <!-- 添加用户弹框 -->
        <el-dialog title="添加用户" v-model="adddialog" width="35%">
            <el-form style="padding: 0 8rem;" :model="Formdata">
                <el-form-item label="用户账号">
                    <el-input v-model="Formdata.usernum" suffix-icon="el-icon-search" placeholder="请输入用户账号"></el-input>
                </el-form-item>
                <el-form-item label="用户姓名">
                    <el-input v-model="Formdata.username" placeholder="请输入用户姓名"></el-input>
                </el-form-item>
                <el-form-item label="所在单位">
                    <el-select v-model="Formdata.work" placeholder="请选择所在单位">
                        <el-option v-for="item in conditionList" :label="item.value" :value="item.value"
                            :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="角色设置">
                    <el-select v-model="Formdata.role" placeholder="请选择角色">
                        <el-option v-for="item in conditionList" :label="item.value" :value="item.value"
                            :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="已选角色">
                    <template v-slot="scope">
                        <el-button type="primary">数据资产管理角色</el-button>
                    </template>
                </el-form-item>
                <el-form-item label="备注说明">
                    <el-input v-model="Formdata.remarks" type="textarea" placeholder="请输入备注"></el-input>
                </el-form-item>
            </el-form>
            <div style="text-align: center;padding: 1rem 0;">
                <el-button @click="openCreatedialog" type="primary">添加</el-button>
            </div>
        </el-dialog>
        <!-- 确认创建用户弹框 -->
        <el-dialog title="提示" v-model="createdialog" width="30%">
            <div class="createdialogBox">
                <div>
                    <div><b>账号创建成功</b></div>
                    <div>
                        <div>账号：<b>123123</b></div>
                        <div>初始密码：<b>11111111</b></div>
                    </div>
                    <div>
                        已授角色：
                        <el-button type="primary">系统管理角色</el-button>
                    </div>
                    <div>
                        <el-button @click="backAdddialog">返回</el-button>
                        <el-button @click="confirmCreate" type="primary">确认创建</el-button>
                    </div>
                </div>
            </div>
        </el-dialog>
        <!-- 用户角色权限详情弹框 -->
        <el-dialog title="用户详情信息" v-model="userDetailsdialog" width="35%">
            <div class="userDetailsdialog">
                <div>
                    <div>
                        <div>用户名：</div>
                        <div>zhangsan</div>
                    </div>
                    <div>
                        <div>用户姓名：</div>
                        <div>张三</div>
                    </div>
                    <div>
                        <div>已授权限资源：</div>
                        <div>
                            <el-button size="small" type="primary">资产管理角色</el-button>
                            <el-button size="small" type="primary">后台管理角色</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
        <!-- 用户操作记录弹出框 -->
        <el-dialog title="用户操作记录" v-model="userEditRecorddialog">
            <el-table :data="userEditRecordTabledata" height="300px">
                <el-table-column label="操作时间" prop="edittime"></el-table-column>
                <el-table-column label="操作人" prop="edituser"></el-table-column>
                <el-table-column label="操作内容" prop="editcontent"></el-table-column>
                <el-table-column label="备注说明" prop="remarks">
                    <template v-slot="scope">
                        <div class="remarkshidden">dwaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa21312313waeawea</div>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <!-- 修改用户弹出框 -->
        <el-dialog title="用户信息修改" v-model="changeUserinfodialog" width="40%">
            <div class="changeUserinfoBox">
                <div>
                    <div>
                        <div>用户账号：</div>
                        <div>bawi</div>
                        <div>
                            <div>是否注销：</div>
                            <div><el-checkbox v-model="cancel" size="large" /></div>
                        </div>
                    </div>
                    <div>
                        <div>用户姓名：</div>
                        <div>张三</div>
                    </div>
                    <div>
                        <div>所在组织：</div>
                        <div>财务中心</div>
                    </div>
                    <div>
                        <div>角色：</div>
                        <el-select v-model="condition" placeholder="请选择用户状态">
                            <el-option v-for="item in conditionList" :label="item.value" :value="item.value"
                                :key="item.value"></el-option>
                        </el-select>
                    </div>
                    <div>
                        <div>已选角色：</div>
                        <el-button type="primary">数据资产系统管理角色</el-button>
                    </div>
                    <div>
                        <div>修改说明：</div>
                        <div>
                            <el-input type="textarea" v-model="changetext" placeholder="请输入修改说明"></el-input>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: center;padding: 2rem 0 0;">
                <el-button @click="changeUserinfodialog = false">取消</el-button>
                <el-button @click="changeUserinfodialog = false" type="primary">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup scoped>
import { reactive, ref } from "vue";

const treedata = ref([
    {
        label: '技术部门',
        children: [{
            label: '1-1',
            children: [{
                label: '1-1-1'
            }]
        },
        {
            label: '1-2',
        }]
    },
    {
        label: '财务部门',
        children: [{
            label: '2-1',
            children: [{
                label: '2-1-1'
            }]
        }]
    },
    {
        label: '人事部门',
        children: [{
            label: '2-1',
            children: [{
                label: '2-1-1'
            }]
        }]
    }
])
const defaultProps = {
    children: 'children',
    label: 'label'
}
const handleNodeClick = (data) => {
    console.log(data);
}

const condition = ref('')
const conditionList = ref([
    {
        value: '1'
    }
])

const searchuser = ref('')

const tableData = ref([{
    usernum: 'ber123',
    username: '张三',
    work: '技术部门',
    condition: true,
}, {
    usernum: 'ber123',
    username: '张三',
    work: '技术部门',
    condition: false,
}, {
    usernum: 'ber123',
    username: '张三',
    work: '技术部门',
    condition: true,
}, {
    usernum: 'ber123',
    username: '张三',
    work: '技术部门',
    condition: true,
}, {
    usernum: 'ber123',
    username: '张三',
    work: '技术部门',
    condition: false,
}, {
    usernum: 'ber123',
    username: '张三',
    work: '技术部门',
    condition: true,
}])

const paginationinfo = reactive({
    total: 30,
    currentPage: 1,
    pageSize: 6
})
const changeCurrent = () => {

}
const changeSize = () => {

}

const adddialog = ref(false)
const openAdddialog = () => {
    adddialog.value = true
}

const createdialog = ref(false)
const openCreatedialog = () => {
    adddialog.value = false
    createdialog.value = true
}
const backAdddialog = () => {
    createdialog.value = false
    adddialog.value = true
}
const confirmCreate = () => {
    createdialog.value = false
}

const Formdata = reactive({
    usernum: '',
    username: '',
    work: '',
    role: '',
    remarks: ''
})

const userDetailsdialog = ref(false)
const openuserDetailsdialog = () => {
    userDetailsdialog.value = true
}

const userEditRecordTabledata = [
    {
        edittime: '2023-04-15 11:23:34',
        edituser: '张三',
        editcontent: '修改用户',
        remarks: 'dwaadaaaaaaaaaaaawdwdaaadwaa'
    },
    {
        edittime: '2023-04-15 11:23:34',
        edituser: '张三',
        editcontent: '修改用户',
        remarks: 'dwaadaaaaaaaaaaaawdwdaaadwaa'
    },
    {
        edittime: '2023-04-15 11:23:34',
        edituser: '张三',
        editcontent: '修改用户',
        remarks: 'dwaadaaaaaaaaaaaawdwdaaadwaa'
    }
]
const userEditRecorddialog = ref(false)
const openuserEditRecorddialog = () => {
    userEditRecorddialog.value = true
}

const changeUserinfodialog = ref(false)
const openchangeUserinfodialog = () => {
    changeUserinfodialog.value = true
}
const cancel = ref(false)
const changetext = ref('')

</script>

<style lang="scss">
.cardbox {
    display: flex;
    justify-content: space-around;
    height: 800px;

    .topbox {
        display: flex;
        justify-content: space-between;
        padding: 1rem 3rem;

        .topleftbox {
            display: flex;
            align-items: center;

            &>div:first-child {
                font-weight: bold;
                color: #1890FF;
            }

            &>div:not(:first-child) {
                display: flex;
                align-items: center;
                margin-left: 3rem;
            }
        }

        .toprighttbox {
            display: flex;

            .el-button {
                margin-right: 3rem;
            }
        }
    }

    .paginationbox {
        display: flex;
        justify-content: flex-end;
        padding: 2rem;
    }
}

.createdialogBox {
    display: flex;
    justify-content: center;
    font-size: 16px;

    &>div {
        &>div {
            padding: 8px 0;
        }

        &>div:nth-child(2) {
            display: flex;

            &>div {
                padding-right: 1rem;
            }
        }

        &>div:last-child {

            .el-button {
                margin: 2rem 1rem 0;
            }

            text-align: center;
        }
    }

}

.userDetailsdialog {
    display: flex;
    justify-content: center;
    font-size: 16px;
    &>div {
        &>div {
            display: flex;
            align-items: center;
            padding: 1rem 0;
        }
    }


}

.remarkshidden {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.remarkshidden:hover {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 10;
    -webkit-box-orient: vertical;
}

.changeUserinfoBox {
    display: flex;
    justify-content: center;
    font-size: 16px;
    &>div {
        &>div{
            display: flex;
            align-items: center;
            padding: 1rem 0;
            &>div:first-child{
                width: 100px;
            }
        }
        &>div:first-child {
            &>div:last-child {
                margin-left: 3rem;
                display: flex;
                align-items: center;
            }
        }
    }
}</style>