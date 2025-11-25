<template>
    <div class="viewbox">
        <div>
            <el-tree :data="treedata" node-key="label" :props="defaultProps" @node-click="handleNodeClick" :default-expanded-keys="'数据资产管理'"></el-tree>
        </div>
        <div>
            <div>功能权限</div>
            <el-table :data="edittableData">
                <el-table-column align="center" label="操作列表" prop="editlist"></el-table-column>
                <el-table-column  label="权限配置">
                    <template v-slot="scope">
                        <div style="display: flex;justify-content: flex-start;">
                            <div style="display: flex;align-items: center;margin-right: 2rem;" v-for="item in scope.row.jurisdictionDeploy"
                                :key="item">
                                <el-checkbox></el-checkbox> <span style="margin-left: 6px;">{{ item }}</span>
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

    </div>
</template>

<script setup>
import { ref } from "vue";

const treedata = ref([
    {
        label: '数据资产管理',
        children: [{
            label: '资产目录',
            children: [{
                label: '资产详情'
            }]
        },
        {
            label: '资产地图',
        }, {
            label: '资产配置',
            children: [{
                label: '资产目录配置'
            }, {
                label: '资产属性配置'
            }, {
                label: '资产标签配置'
            }]
        },]
    },
    {
        label: '元数据管理',
    },
    {
        label: '数据质量管理',
    },
    {
        label: '数据质量规划配置',
    },
    {
        label: '数据标准管理',
    }
])
const a = [0]
const defaultProps = {
    children: 'children',
    label: 'label'
}
const handleNodeClick = (data) => {
    console.log(data);
}

const edittableData = [
    {
        editlist: '资产详情-信息概览',
        jurisdictionDeploy: ['查看页面', '下载', '查看DDL']
    },
    {
        editlist: '资产详情-字段明细',
        jurisdictionDeploy: ['查看页面']
    },
    {
        editlist: '资产详情-数据概览',
        jurisdictionDeploy: ['查看页面']
    },
    {
        editlist: '资产详情-数据血缘',
        jurisdictionDeploy: ['查看页面', '切换视角']
    },
    {
        editlist: '资产详情-生产信息',
        jurisdictionDeploy: ['查看页面']
    }
]
</script>

<style lang="scss" scoped>
.viewbox {
    display: flex;
    padding: 1rem;
    height: 800px;
    &>div:first-child {
        flex: 1;
        border: 1px solid gainsboro;
        padding-left: 3rem;
        padding-top: 1rem;
    }

    &>div:last-child {
        flex: 6;
        border: 1px solid gainsboro;

        &>div:first-child {
            padding: 8px;
        }
    }
}
</style>