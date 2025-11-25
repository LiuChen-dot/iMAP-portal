<template>
  <div style="padding: 20px; width: 100%;height: 100%;overflow: auto;">
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
      nodes: {
        type: Array,
        default: []
      },
      edges: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        height: '100%',
        nodeData: [{
            name:'Process',
            color:'#00709b',
        },{
            name:'Function',
            color:'#404040',
        },{
            name:'Component',
            color:'#93a661',
        }],
        lineData: [{
            id:'is_a',
            name:'Is a',
            type:'solid',
            color:'#000000',
        },{
            id:'part_of',
            name:'Part of',
            type:'solid',
            color:'#0000ff',
        },{
            id:'regulates',
            name:'Regulates',
            type:'solid',
            color:'#ffc000',
        },{
            id:'positively_regulates',
            name:'Positively regulates',
            type:'solid',
            color:'#00ff00',
        },{
            id:'negatively_regulates',
            name:'Negatively regulates',
            type:'solid',
            color:'#FF0000',
        },{
            id:'occurs_in',
            name:'Occurs in',
            type:'solid',
            color:'#008080',
        },{
            id:'capable_of',
            name:'Capable of',
            type:'dashed',
            color:'#0080ff',
        },{
            id:'capable_of_part_of',
            name:'Capable of part of',
            type:'dashed',
            color:'#ff8000',
        }],
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
        this.height = this.calculateMaxDepth(this.edges) * 90;
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
            var color='#404040'
            if(!node.type){
                color=this.nodeData.find(item => item.name === 'Function').color
            }else{
              var obj=this.nodeData.find(item => item.name === node.type)
              if(obj){
                color=obj.color
              }
            }
          g.setNode(node.id, {
            id: node.id,
            label: `<div style="width: 150px;border: 1px solid #333;border-radius: 3px;" data-id="${node.id}">
                    <div style="height: 20px;width: 100%;background: ${color};color: #fff;font-size: 12px;line-height: 20px;text-align: center;" data-id="${node.id}">${node.id}</div>
                    <div style="height: 50px;width: 150px;font-size: 12px;display: flex;align-items: center;white-space: normal;text-align: center;justify-content: center;padding: 8px;box-sizing: border-box;line-height: 15px;" data-id="${node.id}">
                        ${node.name}
                    </div>
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
            var color='#000000'
            var type='solid'
            if(!edge.type){
                var obj=this.lineData.find(item => item.id === 'is_a')
                color=obj.color
                type=obj.type
            }else{
                var obj=this.lineData.find(item => item.id === edge.type)
                if(obj){
                  color=obj.color
                  type=obj.type
                }
            }
            g.setEdge(edge.start, edge.end, {
                curve: d3.curveBasis,
                style: `stroke: ${color}; fill: none; stroke-width: 1;stroke-dasharray: ${type=='dashed'?'3':'0'}`, // 连线样式
                arrowheadStyle: 'fill: '+color+';stroke: '+color+';', //箭头样式，可以设置箭头颜色
                arrowhead: 'vee', //箭头形状，可以设置 normal,vee,undirected 三种样式，默认为 normal
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
            sessionStorage.setItem('go_terms_id', e.target.dataset.id)
            window.open('/go_terms', '_blank')
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
