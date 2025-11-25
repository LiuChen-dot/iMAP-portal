<template>
  <div style="border: 1px solid #ccc; padding: 20px; width: 100%;height: 100%;overflow: auto;">
    <svg class="dagre" width="100%" :height="height">
      <g class="container"></g>
    </svg>
  </div>
</template>

<script>
  import dagreD3 from 'dagre-d3';
  import * as d3 from 'd3';

  export default {
    name: 'dagre',
    props: {
      tableList: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        height: '100%',
        nodes: [
          {id: 0,name: "GO: 0000811",description: "amyloid-beta binding",color: 'Process'},
          {id: 1,name: "GO: 0031261",description: "amide binding",color: 'Function'},
          {id: 2,name: "GO: 0000228",description: "peptide binding",color: 'Component'},
          {id: 3,name: "GO: 0140513",description: "binding"},
          {id: 4,name: "GO: 0005654",description: "molecular function"},
          {id: 5,name: "GO: 0031981",description: "binding"},
          {id: 6,name: "GO: 0005694",description: "binding"},
          {id: 7,name: "GO: 0032993",description: "binding"},
          {id: 8,name: "GO: 0005634",description: "binding"},
          {id: 9,name: "GO: 0070013",description: "binding"},
          {id: 10,name: "GO: 0043231",description: "binding"},
          {id: 11,name: "GO: 0043232",description: "binding"},
          {id: 12,name: "GO: 0043227",description: "binding"},
          {id: 13,name: "GO: 0043233",description: "binding"},
          {id: 14,name: "GO: 0043229",description: "binding"},
          {id: 15,name: "GO: 0043228",description: "binding"},
          {id: 16,name: "GO: 0031974",description: "binding"},
          {id: 17,name: "GO: 0043226",description: "binding"},
          {id: 18,name: "GO: 0005622",description: "binding"},
          {id: 19,name: "GO: 0032991",description: "binding"},
          {id: 20,name: "GO: 0110165",description: "binding"},
          {id: 21,name: "GO: 0005575",description: "binding"},
        ],
        edges: [
          {start: 0,end: 1,},
          {start: 0,end: 2,},
          {start: 1,end: 3,},
          {start: 1,end: 4,},
          {start: 1,end: 7,},
          {start: 2,end: 5,},
          {start: 2,end: 8,},
          {start: 2,end: 6,},
          {start: 3,end: 19,},
          {start: 3,end: 8,color: 'ls_a'},
          {start: 4,end: 20,},
          {start: 4,end: 5,},
          {start: 5,end: 8,color: 'part_of'},
          {start: 5,end: 9,color: 'Regulates'},
          {start: 6,end: 11,color: 'Positively_regulates'},
          {start: 7,end: 19,},
          {start: 8,end: 10,},
          {start: 9,end: 13,},
          {start: 9,end: 14,},
          {start: 10,end: 12,},
          {start: 10,end: 14,},
          {start: 10,end: 18,},
          {start: 11,end: 14,},
          {start: 11,end: 15,},
          {start: 11,end: 18,},
          {start: 12,end: 17,},
          {start: 13,end: 16,},
          {start: 13,end: 17,},
          {start: 14,end: 17,},
          {start: 14,end: 18,},
          {start: 15,end: 17,},
          {start: 16,end: 20,},
          {start: 17,end: 20,},
          {start: 18,end: 20,},
          {start: 19,end: 21,},
          {start: 20,end: 21,},
        ],
      };
    },
    mounted() {
        this.draw();
    },
    methods: {
        calculateMaxDepth(edges) {
            // 构建邻接表
            const graph = {};
            const inDegree = {}; // 入度表
            const nodes = new Set();

            edges.forEach(edge => {
                if (!graph[edge.start]) graph[edge.start] = [];
                if (!graph[edge.end]) graph[edge.end] = [];
                graph[edge.start].push(edge.end);

                nodes.add(edge.start);
                nodes.add(edge.end);

                inDegree[edge.end] = (inDegree[edge.end] || 0) + 1;
                if (!inDegree[edge.start]) inDegree[edge.start] = 0;
            });

            // 找到所有入度为0的节点作为起点
            const queue = [];
            nodes.forEach(node => {
                if (inDegree[node] === 0) queue.push(node);
            });

            let depth = 0;

            while (queue.length > 0) {
                const size = queue.length;
                for (let i = 0; i < size; i++) {
                const current = queue.shift();
                if (graph[current]) {
                    for (const neighbor of graph[current]) {
                    inDegree[neighbor]--;
                    if (inDegree[neighbor] === 0) {
                        queue.push(neighbor);
                    }
                    }
                }
                }
                depth++;
            }

            return depth;
        },
      // 绘制简单的流程图
      draw() {
        this.height = this.calculateMaxDepth(this.edges) * 110;
        // 创建 Graph 对象
        const g = new dagreD3.graphlib.Graph().setGraph({
          rankdir: 'BT', // 流程图从下向上显示，默认'TB'，可取值'TB'、'BT'、'LR'、'RL'
          nodesep: 10,
          ranksep: 20,
        }).setDefaultEdgeLabel(function () {
          return {};
        });

        // Graph添加节点
        this.nodes.forEach(node => {
          g.setNode(node.id, {
            id: node.id,
            label: `<div style="width: 150px;border: 1px solid #333;border-radius: 3px;" data-id="${node.name}">
                    <div style="height: 20px;width: 100%;background: #333;color: #fff;font-size: 12px;line-height: 20px;text-align: center;" data-id="${node.name}">${node.name}</div>
                    <div style="height: 40px;width: 100%;text-align: center;line-height: 40px;font-size: 12px;" data-id="${node.name}">${node.description}</div>
                </div>`,
            labelType: "html",
            shape: 'rect', //节点形状，可以设置rect(长方形),circle,ellipse(椭圆),diamond(菱形) 四种形状，还可以使用render.shapes()自定义形状
            style: 'fill:#fff;', //节点样式,可设置节点的颜色填充、节点边框 fill:#61b2e4;stroke:#fff;stroke:#70baff
            labelStyle: 'fill: #000;font-weight:bold', //节点标签样式, 可设置节点标签的文本样式（颜色、粗细、大小）fill: #fff;font-weight:bold
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
          });
        });
        // Graph添加节点之间的连线
        if (this.nodes.length > 1) {
          this.edges.forEach(edge => {
            const targetNode = g.node(edge.end); // 获取目标节点的信息
            const targetX = targetNode.x + targetNode.width / 2; // 目标节点的中心 x 坐标
            const targetY = targetNode.y + targetNode.height; // 目标节点的下边 y 坐标
            g.setEdge(edge.start, edge.end, {
                curve: d3.curveBasis,
                style: 'stroke: #70baff; fill: none; stroke-width: 1', // 连线样式
                arrowheadStyle: 'fill: #70baff;stroke: #70baff;', //箭头样式，可以设置箭头颜色
                arrowhead: 'vee', //箭头形状，可以设置 normal,vee,undirected 三种样式，默认为 normal
                target: { x: targetX, y: targetY }, // 设置边的终点为目标节点的下边中心
            })
          });
        }

        // 获取要绘制流程图的绘图容器
        const container = d3.select('svg.dagre').select('g.container');

        // 创建渲染器
        const render = new dagreD3.render();
        // 在绘图容器上运行渲染器绘制流程图
        render(container, g);

        
        // 拖拽缩放
        const svg = d3.select('svg.dagre');
        let zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', current => {
          container.attr('transform', current.transform);
        });
        svg.call(zoom);
 
        container.on( "click", (e) => {
            console.log(e.target.dataset.id)
        });
      },
    },
  };

</script>

<style scoped>
  .tooltip {
    position: absolute;
    font-size: 12px;
    background-color: white;
    border-radius: 3px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    cursor: pointer;
    display: none;
    padding: 10px;
  }

  .tooltip>div {
    padding: 10px;
  }

</style>
