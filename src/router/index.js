import {
  createWebHistory,
  createRouter
} from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [{
  path: "/redirect",
  component: Layout,
  hidden: true,
  children: [{
    path: "/redirect/:path(.*)",
    component: () => import("@/views/redirect/index.vue"),
  },],
},
{
  path: "/login",
  component: () => import("@/views/login"),
  hidden: true,
},
{
  path: "/:pathMatch(.*)*",
  component: () => import("@/views/error/404"),
  hidden: true,
},
{
  path: "/401",
  component: () => import("@/views/error/401"),
  hidden: true,
},

{
  path: "",
  component: Layout,
  redirect: "/KnowledgeQuery",
  children: [{
    path: "/KnowledgeQuery",
    component: () => import("@/views/index"),
    name: "KnowledgeQuery",
    meta: {
      title: "KnowledgeQuery",
      icon: "menu1",
      affix: true,
    },
  },],
},
{
  path: '',
  component: Layout,
  children: [{
    path: "/KnowledgeGraph",
    component: () => import("@/views/KnowledgeGraph/index"),
    name: "KnowledgeGraph",
    meta: {
      title: "KnowledgeGraph",
      icon: "menu2",
      affix: true,
    },
  }]
},
{
  path: '',
  component: Layout,
  children: [{
    path: "/GenomeBrowser",
    component: () => import("@/views/cytoscape/index"),
    name: "GenomeBrowser",
    meta: {
      title: "GenomeBrowser",
      icon: "menu3",
      affix: true,
    },
  }]
},
// {
//   path: '',
//   component: Layout,
//   children: [{
//     path: "/Blast",
//     component: () => import("@/views/Blast/index"),
//     name: "Blast",
//     meta: {
//       title: "Blast",
//       icon: "menu4",
//       affix: true,
//       isDev: true,
//     },
//   }]
// },
// 附带二级选项框的16S功能
//{
//  component: Layout,
//  isTop: true,
//  meta: {
//    title: "sixteenS",
//    icon: "menu5",
//    affix: true,
//  },
//  children: [{
//    path: "/16S",
//    component: () => import("@/views/16S/index"),
//    name: "16S",
//    meta: {
//      title: "sixteenS16s",
//      icon: "menu5",
//      affix: true,
//    },
//  },

  // {
  //   path: "/MetagenomicAnalysis",
  //   component: () => import("@/views/16S/Analysis"),
  //   name: "Metagenomic Analysis",
  //   meta: {
  //     title: "sixteenSMA",
  //     icon: "menu5",
  //     affix: true,
  //   },
  // }
//  ]
//},
 // 不附带二级页面的16S功能
{
    path: '',
    component: Layout,
    children: [{
      path: "/16S",
      component: () => import("@/views/16S/index"),
      name: "16S",
      meta: {
        title: "sixteenS16s",
        icon: "menu4",
        affix: true,
      },
    }]
 },
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/taskupload",
    component: () => import("@/views/16S/taskupload"),
    name: "taskupload",
    hidden: true,
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/taskdetails",
    component: () => import("@/views/16S/taskdetails"),
    name: "taskdetails",
    hidden: true,
  }]
},
{
  path: '',
  component: Layout,
  children: [{
    path: "/IntelligentQ&A",
    component: () => import("@/views/IntelligentQ&A/index"),
    name: "IntelligentQ&A",
    meta: {
      title: "Intelligent",
      icon: "menu6",
      affix: true,
    },
  }]
},
{
  path: '',
  component: Layout,
  children: [{
    path: "/Stastics",
    component: () => import("@/views/Stastics/index"),
    name: "Stastics",
    meta: {
      title: "Stastics",
      icon: "menu6",
      affix: true,
    },
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/userInfo",
    component: () => import("@/views/userInfo/index"),
    name: "userInfo",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/Search",
    component: () => import("@/views/Search/index"),
    name: "Search",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/treeChart",
    component: () => import("@/views/treeChart/index"),
    name: "treeChart",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/SearchList",
    component: () => import("@/views/Search/SearchList"),
    name: "SearchList",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/protein",
    component: () => import("@/views/Search/protein"),
    name: "protein",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/basic_information",
    component: () => import("@/views/Search/protein"),
    name: "basic_information",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/go_terms",
    component: () => import("@/views/Search/protein"),
    name: "go_terms",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/Gene",
    component: () => import("@/views/Search/Gene"),
    name: "Gene",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/disease",
    component: () => import("@/views/Search/Gene"),
    name: "disease",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/small_molecule",
    component: () => import("@/views/Search/protein"),
    name: "small_molecule",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/rna",
    component: () => import("@/views/Search/protein"),
    name: "rna",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/cytoscape",
    component: () => import("@/views/cytoscape/index"),
    name: "cytoscape",
  }]
},
{
  path: '',
  component: Layout,
  hidden: true,
  children: [{
    path: "/ceshi",
    component: () => import("@/views/ceshi"),
    name: "ceshi",
  }]
}
];


const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        top: 0
      }
    }
  },
});

export default router;