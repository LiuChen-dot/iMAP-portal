<template>
    <div style="height: 100%;overflow: scroll;overflow-x: hidden;">
        <iframe id="iframeViewer" class="genbro-iframe" :src="iframeUrl" style="width: calc(100vw - 20px); height: 933px; border-width: 0px;"></iframe>
        <Bottom style="position: relative;"></Bottom>
    </div>
</template>

<script setup>

import { onMounted ,ref} from 'vue';
import Bottom from "@/layout/components/Bottom/index.vue"

const iframeUrl=ref()
const VITE_APP_ENV = import.meta.env.VITE_APP_ENV
// if(VITE_APP_ENV === "production"){
    iframeUrl.value='/genbro/genbro.html'
// }else{
//     // iframeUrl.value=location.origin+'/html/genbro.html'
//     iframeUrl.value='/public/genbro/genbro.html'
// }


onMounted(() => {
    var iframe = document.getElementById("iframeViewer");
    iframe.onload = function() {
        //以下操作必须在iframe加载完后才可进行
        async function genBro() {
            let orgid = 'ECOLI';
            let gene = ''
            let TaxId=''
            let repliconId = 'COLI-K12';
            if(location.pathname != '/GenomeBrowser'){
                gene = sessionStorage.getItem('gene_searchId');
                TaxId = sessionStorage.getItem('gene_SubstrainsTaxId');
                repliconId = sessionStorage.getItem('gene_replicon')||'COLI-K12';
            }
            let gb = {
                divId: "gbBrowser", // id of html div to contain genome browser
                hasControls: true,  // true to include control panel (zoom, search, play, legend, etc)
                hasBaseline: true,  // true to include baseline navigation.
                replicon: [
                    {
                        orgid: orgid,
                        chromosome: repliconId,
                        centerGene: gene,
                        TaxId: TaxId,
                    } 
                ],
            };  
            console.log('111111111111111',gb)          
            await GB.Load(gb);
            updateCmpTitle();
        }

        async function updateCmpTitle() {
            let potGeneNameStr = ''
            potGeneNameStr = (GB.gb.replicon[0].gene0) ? ' ' + GB.gb.replicon[0].gene0.name : '';
            window.top.document.title = 'Genome Browser:' +
                ' ' + GB.gb.replicon[0].orgname + potGeneNameStr;
        }

        function a() {
            let a = 0
            return function b() {
                a++
                return a
            }
        }
        const b = a()
        window.addEventListener("message", () => {
            if (b() == 1) {
                genBro();
            }

        }, false);
    };

})
</script>

<style scoped>

</style>