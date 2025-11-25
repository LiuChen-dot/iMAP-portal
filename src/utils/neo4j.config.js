export default function (viz) {
  return {
    containerId: "viz",
    // nonFlat:true,
    neo4j: {
      serverUrl: "neo4j://10.50.11.95:7687",
      serverUser: "neo4j",
      serverPassword: "th123456",
    },
    labels: {
      announcement: {
        label: "title",
        size: "pagerank",
        community: "community",
        titleProperties: ["title", "date", "url"],
        function: {
          title: (node) => {
            return viz.nodeToHtml(node, undefined);
          },
        },
      },
      pub_org: {
        label: "name",
        size: "pagerank",
        community: "community",
        titleProperties: ["name", "addr"],
        function: {
          title: (node) => {
            return viz.nodeToHtml(node, undefined);
          },
        },
      },
      principal: {
        label: "name",
        size: "pagerank",
        community: "community",
        titleProperties: ["name", "phone_num"],
        function: {
          title: (node) => {
            return viz.nodeToHtml(node, undefined);
          },
        },
      },
      proj_info: {
        label: "project_no",
        size: "pagerank",
        community: "community",
        titleProperties: ["project_no"],
        function: {
          title: (node) => {
            return viz.nodeToHtml(node, undefined);
          },
        },
      },
      company: {
        label: "company",
        size: "pagerank",
        community: "community",
        titleProperties: ["company"],
        function: {
          title: (node) => {
            return viz.nodeToHtml(node, undefined);
          },
        },
      },
    },
    relationships: {
      CANDIDATE: {
        thickness: "weight",
        caption: "CANDIDATE",
      },
      CUSTOM: {
        thickness: "weight",
        caption: "CUSTOM",
      },
      INCLUDE: {
        thickness: "weight",
        caption: false,
      },
      MANAGE: {
        thickness: "weight",
        caption: true,
      },
      PUBLISH: {
        thickness: "weight",
        caption: true,
      },
      RELATION: {
        thickness: "weight",
        caption: true,
      },
      WORK: {
        thickness: "weight",
        caption: true,
      },
    },
    visConfig: {
      // nodes: {
      //   shape: 'circle',
      // },
      edges: {
        arrows: {
          to: { enabled: true },
        },
        // label:'INCLUDE'
      },
    },
    arrows: true,

    initialCypher: "MATCH p=()-[r:RELATION]->() RETURN p LIMIT 25",
  };
}