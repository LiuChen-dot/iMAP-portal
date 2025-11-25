<template>
    <div class="app-container">
        <div style="margin:0 auto;max-width: 1320px;" >
			<div class="pad-l-15 mar-t-15 mar-b-10 fts-18 text-w-800" style="color:#333;" >Entities</div>
			<div class="dis-flex flex-w just-c-sb">
				<div v-for="(item,index) in topList" class="w-16p pad-l-10 pad-r-10 mar-t-10 text-right" >
					<div class="pad-t-18 pad-l-20 pad-b-16 dis-flex flex-d align-c bj" style="box-shadow: 0 0 24px 0 rgba(0,0,0,0.10);border-radius: 6px;color:#333;">
						<div class="mar-b-5 fts-14">{{item.name}}</div>
						<div class="fts-32 text-w-600">{{item.count}}</div>
					</div>
				</div>
			</div>
			<div class="pad-l-15 mar-t-15 mar-b-10 fts-18 text-w-800" style="color:#333;" >Relations</div>
			<div class="dis-flex flex-w just-c-sb">
				<div v-for="(item,index) in topList1" class="w-16p pad-l-10 pad-r-10 mar-t-10 text-right" >
					<div class="pad-t-18 pad-r-20 pad-b-16 dis-flex flex-d align-c bj" style="box-shadow: 0 0 24px 0 rgba(0,0,0,0.10);border-radius: 6px;color:#333;">
						<div class="mar-b-5 fts-14">{{item.name}}</div>
						<div class="fts-32 text-w-600">{{item.count}}</div>
					</div>
				</div>
			</div>
            <div class="dis-flex mar-15" style="flex-wrap:wrap">
				<div v-for="(item,index) in chatDataList" :key="index" class="w-50p pad-l-10 pad-r-10">
					<div class="mar-b-15 h-600 dis-flex flex-d" style="box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.2);">
						<div class="fts-16 text-w-800 h-50 dis-flex align-c pad-l-10" >{{item.name}}</div>
						<div style="flex:1;" class="ov-h">
							<el-tabs type="border-card" @tab-change="handleClick(item,$event)" >
								<el-tab-pane :label="child.name" v-for="child in item.children" :key="child.name">
									<div :id="child.idName" :class="[child.chatType==1?'d3-lollipop-chart':(child.chatType==2?'d3-pie-chart':'d3-histogram-chart')]" class="w-100p h-510"></div>
								</el-tab-pane>
							</el-tabs>
						</div>
					</div>
				</div>
			</div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import stastics from './data.js'
import { getstrains,getEntityRelation,getProteinTypes,getRnaTypes,getTaxonomyTypes,getCellMorphology,getCultureMedium,getPHGrowth,getPHOptimumh,
	getTemperatureGrowth,getTemperatureRange,getTemperatureOptimum,getOxygenTolerance,getSaltGrowth,getSaltOptimum,getMetaboliteUtilizationmPositive,
	getMetaboliteUtilizationmNegative,getMetaboliteProduction,getEnzymesActivityPositive,getEnzymesActivityNegative,getAntibioticSensitive,getAntibioticResistant,
	getCountries,getGCContent,getPathogenicity,getRiskGroup,getFattyAcidProfiles,getVogesProskauerTest,getMethylredTest,getIndoleTest
} from '@/api/stastics.js'

console.log(stastics)

const stasticsList=ref([])
const topList=ref([])
const topList1=ref([])

var chatDataList=[{
    name: 'Taxonomy',
    activeName:'Subkingdom',
    children:[
        {
            name:'Subkingdom',
            idName:'subkingdom',
            chatType:2,
        },
        {
            name:'Kingdom',
            idName:'kingdom',
            chatType:2,
        },
        {
            name:'Phylum',
            idName:'phylum',
            chatType:1,
        },
        {
            name:'Class',
            idName:'class',
            chatType:1,
        },
        {
            name:'Order',
            idName:'order',
            chatType:1,
        },
        {
            name:'Family',
            idName:'family',
            chatType:1,
        },
        {
            name:'Genus',
            idName:'genus',
            chatType:1,
        },
        {
            name:'Species',
            idName:'species',
            chatType:1,
        },
    ]
},{
    name: 'Protein',
    activeName:'Protein',
    children:[
        {
            name:'Protein',
            idName:'Protein_type',
            chatType:1,
        },
    ]
},{
    name: 'RNA',
    activeName:'RNA',
    children:[
        {
            name:'RNA',
            idName:'Rna_type',
            chatType:1,
        },
    ]
},{
    name: 'Morphology',
    activeName:'Flagellum Arrangement',
    children:[
        {
            name:'Flagellum Arrangement',
            idName:'flagellum_arrangement',
            chatType:2,
        },
        {
            name:'Gram Stain',
            idName:'gram_stain',
            chatType:2,
        },
        {
            name:'Motility',
            idName:'motility',
            chatType:2,
        },
        {
            name:'Cell Shape',
            idName:'cell_shape',
            chatType:2,
        },
        {
            name:'Cell Width',
            idName:'cell_width',
            chatType:1,
        },
        {
            name:'Cell Length',
            idName:'cell_length',
            chatType:1,
        },
    ]
},{
    name: 'Cultivation',
    activeName:'Culture Media',
    children:[
        {
            name:'Culture Media',
            idName:'culture_media',
            chatType:1,
        },
        {
            name:'PH Growth',
            idName:'pH_growth',
            chatType:3,
        },
        {
            name:'PH Optimum',
            idName:'pH_optimum',
            chatType:3,
        },
        {
            name:'Temperature Growth',
            idName:'Temperature_growth',
            chatType:3,
        },
        {
            name:'Temperature Range',
            idName:'Temperature_range',
            chatType:2,
        },
        {
            name:'Temperature Optimum',
            idName:'Temperature_optimum',
            chatType:3,
        },
        {
            name:'Oxygen Tolerance',
            idName:'Oxygen_tolerance',
            chatType:2,
        },
        {
            name:'Salt Growth',
            idName:'Salt_growth',
            chatType:1,
        },
        {
            name:'Salt Optimum',
            idName:'Salt_optimum',
            chatType:1,
        },
        
    ]
},
{
    name: 'Metabolism',
    activeName:'Metabolite Utilization (+)',
    children:[
        {
            name:'Metabolite Utilization (+)',
            idName:'utilization_activity_positive',
            chatType:1,
        },
        {
            name:'Metabolite Utilization (-)',
            idName:'utilization_activity_negative',
            chatType:1,
        },
        {
            name:'Metabolite Production',
            idName:'Metabolite_production',
            chatType:1,
        },
        {
            name:'Enzymes Activity (+)',
            idName:'Enzymes_activity_positive',
            chatType:1,
        },
        {
            name:'Enzymes Activity (-)',
            idName:'Enzymes_activity_negative',
            chatType:1,
        },
        {
            name:'Antibiotic Sensitive',
            idName:'Antibiotic_sensitive',
            chatType:1,
        },
        {
            name:'Antibiotic Resistant',
            idName:'Antibiotic_resistant',
            chatType:1,
        },
    ]
},{
    name: 'Isolation Sources',
    activeName:'Countries',
    children:[
        {
            name:'Countries',
            idName:'Countries',
            chatType:1,
        },
    ]
},{
    name: 'Molecular Biology & Pathogenicity',
    activeName:'GC content',
    children:[
        {
            name:'GC Content',
            idName:'gc_content',
            chatType:3,
        },
        {
            name:'Pathogenicity',
            idName:'Pathogenicity',
            chatType:2,
        },
        {
            name:'Risk Group',
            idName:'risk_group',
            chatType:2,
        }
    ]
},{
    name: 'Tests & Profiles',
    activeName:'Fatty acid profles',
    children:[
        {
            name:'Fatty Acid Profles',
            idName:'fatty_acid_profles',
            chatType:1,
        },
        {
            name:'Voges-Proskauer Test',
            idName:'voges_Proskauer_test',
            chatType:2,
        },
        {
            name:'Methylred Test',
            idName:'methylred_test',
            chatType:2,
        },
        {
            name:'Indole Test',
            idName:'indole_test',
            chatType:2,
        }
    ]
}]


onMounted(() => {
	getToplist()
    chatDataList.forEach(item => {
		if(item.name=='Protein'){
			getProteinTypesFun(item)
		}
		if(item.name=='RNA'){
			getRnaTypesFun(item)
		}
		if(item.name=='Taxonomy'){
			getTaxonomyTypesFun(item.children[0])
		}
		if(item.name=='Morphology'){
			getCellMorphologyFun(item.children[0])
		}
		if(item.name=='Cultivation'){
			getCultureMediumFun(item)
		}
		if(item.name=='Metabolism'){
			getMetaboliteUtilizationmPositiveFun(item)
		}
		if(item.name=='Isolation Sources'){
			getCountriesFun(item)
		}
		if(item.name=='Molecular Biology & Pathogenicity'){
			getGCContentFun(item)
		}
		if(item.name=='Tests & Profiles'){
			getFattyAcidProfilesFun(item)
		}
    })
})
const getToplist = async ()=>{
	var res=await getstrains()
	var res1=await getEntityRelation()
	var data=[]
	var data1=[]
	res.data.dataTypeAndDataSize.forEach(item=>{
		data.push({
			name:item.showName,
			count:item.dataCount
		})
	})
	res1.data.forEach(item=>{
		data1.push({
			name:item.relationshipType,
			count:item.relationshipCount
		})
	})
	topList.value=data
	topList1.value=data1
}
const getProteinTypesFun=(row)=>{
	getProteinTypes().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
        	"Total_title": "Protein"
		}
        getThisDiv(row.children[0],obj)
	})		
}
const getRnaTypesFun=(row)=>{
	getRnaTypes().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
        	"Total_title": "RNA"
		}
        getThisDiv(row.children[0],obj)
	})
}
const getTaxonomyTypesFun=(row)=>{
	getTaxonomyTypes(row.idName).then(res=>{
		var obj=null
		if(row.chatType==1){
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			obj={
				Data:data,
				"Total": res.data.length,
				"Total_title": row.name
			}
		}
		if(row.chatType==2){
			var count=0
			res.data.forEach(item=>{
				count=count+item.count
			})
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			obj={
				Data:data,
				"Total": count,
			}
		}
        getThisDiv(row,obj)
	})
}
const getCellMorphologyFun=(row)=>{
	getCellMorphology(row.idName).then(res=>{
		var obj=null
		if(row.chatType==1){
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			obj={
				Data:data,
				"Total": res.data.length,
				"Total_title": row.name
			}
		}
		if(row.chatType==2){
			var count=0
			res.data.forEach(item=>{
				count=count+item.count
			})
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			obj={
				Data:data,
				"Total": count,
			}
		}
		if(row.chatType==3){
			var obj={
				Data:res.data.data,
				"Total": res.data.data.length,
				ranges:res.data.range,
			}
		}
        getThisDiv(row,obj)
	})
}
const getCultureMediumFun=(row)=>{
	getCultureMedium().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
        	"Total_title": row.name
		}
		console.log(obj)
        getThisDiv(row.children[0],obj)
	})
}

const getPHGrowthFun=(row)=>{
	getPHGrowth().then(res=>{
		var obj={
			Data:res.data.data,
			"Total": res.data.data.length,
			ranges:res.data.range,
		}
        getThisDiv(row.children[1],obj)
	})
}
const getPHOptimumhFun=(row)=>{
	getPHOptimumh().then(res=>{
		var obj={
			Data:res.data.data,
			"Total": res.data.data.length,
			ranges:res.data.range,
		}
        getThisDiv(row.children[2],obj)
	})
}
const getTemperatureGrowthFun=(row)=>{
	getTemperatureGrowth().then(res=>{
		var obj={
			Data:res.data.data,
			"Total": res.data.data.length,
			ranges:res.data.range,
		}
        getThisDiv(row.children[3],obj)
	})
}
const getTemperatureRangeFun=(row)=>{
	getTemperatureRange().then(res=>{
		var count=0
		res.data.forEach(item=>{
			count=count+item.count
		})
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": count,
		}
        getThisDiv(row.children[4],obj)
	})
}
const getTemperatureOptimumFun=(row)=>{
	getTemperatureOptimum().then(res=>{
		var obj={
			Data:res.data.data,
			"Total": res.data.data.length,
			ranges:res.data.range,
		}
        getThisDiv(row.children[5],obj)
	})
}
const getOxygenToleranceFun=(row)=>{
	getTemperatureRange().then(res=>{
		var count=0
		res.data.forEach(item=>{
			count=count+item.count
		})
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": count,
		}
        getThisDiv(row.children[6],obj)
	})
}
const getSaltGrowthFun=(row)=>{
	getSaltGrowth().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[7],obj)
	})
}
const getSaltOptimumFun=(row)=>{
	getSaltOptimum().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[8],obj)
	})
}
const getMetaboliteUtilizationmPositiveFun=(row)=>{
	getMetaboliteUtilizationmPositive().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[0],obj)
	})
}
const getMetaboliteUtilizationmNegativeFun=(row)=>{
	getMetaboliteUtilizationmNegative().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[1],obj)
	})
}
const getMetaboliteProductionFun=(row)=>{
	getMetaboliteProduction().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[2],obj)
	})
}
const getEnzymesActivityPositiveFun=(row)=>{
	getEnzymesActivityPositive().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[3],obj)
	})
}
const getEnzymesActivityNegativeFun=(row)=>{
	getEnzymesActivityNegative().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[4],obj)
	})
}
const getAntibioticSensitiveFun=(row)=>{
	getAntibioticSensitive().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[5],obj)
	})
}
const getAntibioticResistantFun=(row)=>{
	getAntibioticResistant().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[6],obj)
	})
}
const getCountriesFun=(row)=>{
	getCountries().then(res=>{
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": res.data.length,
		}
        getThisDiv(row.children[0],obj)
	})
}

const getGCContentFun=(row)=>{
	getGCContent().then(res=>{
		var obj={
			Data:res.data.data,
			"Total": res.data.data.length,
			ranges:res.data.range,
		}
        getThisDiv(row.children[0],obj)
	})
}

const getPathogenicityFun=(row)=>{
	getPathogenicity().then(res=>{
		if(res.data){
			var count=0
			res.data.forEach(item=>{
				count=count+item.count
			})
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			var obj={
				Data:data,
				"Total": count,
			}
			getThisDiv(row.children[1],obj)
		}
	})
}

const getRiskGroupFun=(row)=>{
	getRiskGroup().then(res=>{
		if(res.data){
			var count=0
			res.data.forEach(item=>{
				count=count+item.count
			})
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			var obj={
				Data:data,
				"Total": count,
			}
			getThisDiv(row.children[2],obj)
		}
	})
}


const getFattyAcidProfilesFun=(row)=>{
	getFattyAcidProfiles().then(res=>{
		if(res.data){
			var data=res.data.map(item=>{
				return {
					Name:item.types,
					Value:item.count,
					Link:''
				}
			})
			var obj={
				Data:data,
				"Total": res.data.length,
			}
			getThisDiv(row.children[0],obj)
		}
	})
}


const getVogesProskauerTestFun=(row)=>{
	getVogesProskauerTest().then(res=>{
		var count=0
		res.data.forEach(item=>{
			count=count+item.count
		})
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": count,
		}
        getThisDiv(row.children[1],obj)
	})
}

const getMethylredTestFun=(row)=>{
	getMethylredTest().then(res=>{
		var count=0
		res.data.forEach(item=>{
			count=count+item.count
		})
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": count,
		}
        getThisDiv(row.children[2],obj)
	})
}

const getIndoleTestFun=(row)=>{
	getIndoleTest().then(res=>{
		var count=0
		res.data.forEach(item=>{
			count=count+item.count
		})
		var data=res.data.map(item=>{
			return {
				Name:item.types,
				Value:item.count,
				Link:''
			}
		})
		var obj={
			Data:data,
			"Total": count,
		}
        getThisDiv(row.children[3],obj)
	})
}





const handleClick=(tab, event)=>{
	if(tab.name=='Taxonomy'){
		getTaxonomyTypesFun(tab.children[event])
	}
	if(tab.name=='Morphology'){
		getCellMorphologyFun(tab.children[event])
	}
	if(tab.name=='Cultivation'){
		if(event=='0'){
			getCultureMediumFun(tab)
		}else if(event=='1'){
			getPHGrowthFun(tab)
		}else if(event=='2'){
			getPHOptimumhFun(tab)
		}else if(event=='3'){
			getTemperatureGrowthFun(tab)
		}else if(event=='4'){
			getTemperatureRangeFun(tab)
		}else if(event=='5'){
			getTemperatureOptimumFun(tab)
		}else if(event=='6'){
			getOxygenToleranceFun(tab)
		}else if(event=='7'){
			getSaltGrowthFun(tab)
		}else if(event=='8'){
			getSaltOptimumFun(tab)
		}
	}
	
	if(tab.name=='Metabolism'){
		if(event=='0'){
			getMetaboliteUtilizationmPositiveFun(tab)
		}else if(event=='1'){
			getMetaboliteUtilizationmNegativeFun(tab)
		}else if(event=='2'){
			getMetaboliteProductionFun(tab)
		}else if(event=='3'){
			getEnzymesActivityPositiveFun(tab)
		}else if(event=='4'){
			getEnzymesActivityNegativeFun(tab)
		}else if(event=='5'){
			getAntibioticSensitiveFun(tab)
		}else if(event=='6'){
			getAntibioticResistantFun(tab)
		}
	}
	if(tab.name=='Molecular Biology & Pathogenicity'){
		if(event=='0'){
			getGCContentFun(tab)
		}else if(event=='1'){
			getPathogenicityFun(tab)
		}else{
			getRiskGroupFun(tab)
		}
	}
	if(tab.name=='Tests & Profiles'){
		if(event=='0'){
			getFattyAcidProfilesFun(tab)
		}else if(event=='1'){
			getVogesProskauerTestFun(tab)
		}else if(event=='2'){
			getMethylredTestFun(tab)
}		else{
			getIndoleTestFun(tab)
		}
	}
}

const getThisDiv=(element,obj)=>{
    nextTick(() => {
        var dom=document.getElementById(element.idName)
        if(element.chatType==1){
            d3_lollipop_chart(dom,obj);
        }
        if(element.chatType==2){
            d3_pie_chart(dom,obj);
        }
        if(element.chatType==3){
			d3_histogram_chart(dom,obj);
        }
    })
    
}
function d3_lollipop_chart(element,obj){
	var object = {
			element: element,
			margin: {top: 0, right: 30, bottom: 0, left: 165},
			data: null,
			Tooltip: null,
			svg: null,
			resize_timer: null
	};
	
	// Initialize
	init();
	
	
	function init(){
        $(object.element).empty();
		// Parse the Data
		// Element id must much the GLOBAL variable name with the data
		// var data = stastics[$(object.element).attr('id')];
		var data = obj;
		object.data = data;
		// Add Total count elment
		var total_title = object.data['Total_title'] == undefined ? 'count'  : object.data['Total_title'];
		$(object.element).append('<div class="clearfix"><span class="total-count"> Total ' + total_title + ': ' + data['Total'] + '</span></div>');
		
		// Add elements for x-axis top bottom and graphic
		$(object.element).append('<div class="axis-top"></div><div class="graphic"></div><div class="axis-bottom"></div>');
		
		
		
		// Draw chart
		draw_chart();
		
		// Redraw chart on resize
		$(window).resize(resizing);
	}
	
	function draw_chart(){
		
		// Delete svg if available and redraw it
		$(object.element).find('svg').remove();
		$(object.element).find('.tooltip').remove();
		
		var data = object.data['Data'];
		// Get the max value. Needed to create x-axis
		var max_value = 0;
		for(var i=0, l=data.length; i < l; i++){
			var value = parseInt(data[i]['Value']);
			if(max_value < value){
				max_value = value;
			}
		}
//		$(object.element).find('.count-select').append('<span class="total-count">Total count: ' + total_count + '</span>');
		
		var margin = object.margin;
		
		// set the dimensions and margins of the graph
		var width = $(object.element).width() - margin.left - margin.right;
		var height = (20 * data.length);

		// append the svg object to the element
		var el_id = "#" + $(object.element).attr('id');
		var svg = d3.select(el_id + ' .graphic')
		.append("svg")
			.attr("width", width + margin.left + 1)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		object.svg = svg;
		
		
		// Add X
		var x = d3.scaleLinear()
//			.domain([0, max_value_x_axis])
		.domain([0, max_value])
		.range([ 0, width])
		.nice();
		
		// X Axis Bottom
		d3.select(el_id + ' .axis-bottom').append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", 70)
			.append("g")
				.attr("class", "x axis bottom")
				.attr("transform", "translate(" + margin.left + ",0)")
				.call(d3.axisBottom(x))
				.selectAll("text")
					.attr("transform", "translate(-10,0)rotate(-45)")
					.style("text-anchor", "end");
	
		// text label for the x axis
		d3.select(el_id + ' .axis-bottom svg').append("text")             
			.attr("transform",
				"translate(" + (width/2 + margin.left) + " ," + 
				(50) + ")")
//				(height + margin.top + 20) + ")")
			.style("text-anchor", "middle")
			.text("Strains");
		
		// X Axis Top
		d3.select(el_id + ' .axis-top').append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", 50)
		.append("g")
			.attr("class", "x axis top")
			.attr("transform", "translate(" + margin.left + ", 49)")
			.call(d3.axisTop(x))
			.selectAll("text")
				.attr("transform", "translate(10,0)rotate(-45)")
				.style("text-anchor", "start");

		
		// Add X axis gridlines
		svg.append("g")			
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(make_x_gridlines(x)
				.tickSize(-height)
				.tickFormat("")
		);
		
		
		// Y axis
		var y = d3.scaleBand()
			.range([ 0, height ])
			.domain(data.map(function(d) {
				return d.Name; 
			}))
			.padding(1);
		svg.append("g")
			.attr("class", "y axis left")
			.call(d3.axisLeft(y).tickFormat(function(d){
				return format_y_axis_name(d);
			}))
			.selectAll("text")
				.attr("class", function(d) { return makeSafeForCSS('text_' + d); })
				.style("font-size", "14px")
				.style("cursor", "pointer")
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave)
				.on("click", click);
		
		
		// Lines
		svg.selectAll("myline")
		.data(data)
		.enter()
		.append("line")
		.attr("x1", function(d) { return x(d.Value); })
		.attr("x2", x(0))
		.attr("y1", function(d) { return y(d.Name); })
		.attr("y2", function(d) { return y(d.Name); })
		.attr("stroke", "grey")
		.attr("class", "loli-line");
		
		
		// create a tooltip
		object.Tooltip = d3.select(el_id)
		.append("div")
		.style("display", 'none')
		.style("opacity", 1)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "5px");
		
		// Circles
		svg.selectAll("mycircle")
			.data(data)
			.enter()
			.append("circle")
				.attr("cx", function(d) { return x(d.Value); })
				.attr("cy", function(d) { return y(d.Name); })
				.attr("r", "4")
				.style("fill", "#578cab")
				.style("cursor", "pointer")
				.attr("stroke", "black")
				.attr("class", function(d) { return "loli-point " + makeSafeForCSS('circle_' + d.Name); }) // Needed for the y axis hover Tooltip function
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave)
				.on("click", click);
		
	}
	
	function format_y_axis_name(name){
		name = name.replace('&omega;', '\u03C9');
		
		if (name.length > 17)
			return name.substring(0,15) + '...';
		else
			return name;
	}
	
	function makeSafeForCSS(name) {
		return name.replace(/[^a-z0-9]/g, function(s) {
			var c = s.charCodeAt(0);
			if (c == 32) return '-';
			if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
			return '__' + ('000' + c.toString(16)).slice(-4);
		});
	}
	
	function make_x_gridlines(x) {		
		return d3.axisBottom(x)
		.ticks(10);
	}
	
	function mouseover(d){
		var svg = object.svg;
		
		// Function used for y axis hover and circle hover. So hier we need to get circle and y axis text element.
		if(typeof d == 'string' || typeof d == 'number'){
			var class_name = makeSafeForCSS('circle_' + d);
			var circle = svg.select('.' + class_name);
			var text = d3.select(this);
		}
		else{
			var class_name = makeSafeForCSS('text_' + d.Name);
			
			var circle = d3.select(this);
			var text = svg.select('.' + class_name);
		}
		
		var data = circle.data()[0];
		
		// Take scroll position into account
		var scroll_top_pos = $(object.element).find('.graphic').scrollTop();
		
		var pos_y = parseInt(circle.attr("cy")) + 70 - scroll_top_pos;
		var pos_x = parseInt(circle.attr("cx")) + 175;
		object.Tooltip
		.html("Count: " + data.Value + '<br>Value: ' + data.Name)
		.style("display", 'block')
		.style("top", pos_y + "px")
		.style("left", pos_x + "px");
		
		// Point element effect on hover
		circle.style("fill", "#eba434");
		text.style("fill", "#578cab");
	}
	function mouseleave(d) {
		var svg = object.svg;
		
		// Function used for y axis hover and circle hover. So hier we need to get circle and y axis text element.
		if(typeof d == 'string' || typeof d == 'number'){
			var class_name = makeSafeForCSS('circle_' + d);
			var circle = svg.select('.' + class_name);
			var text = d3.select(this);
		}
		else{
			var class_name = makeSafeForCSS('text_' + d.Name);
			var circle = d3.select(this);
			var text = svg.select('.' + class_name);
		}
		
		object.Tooltip
		.style("display", 'none');
		
		// Point element effect on hover
		circle.style("fill", "#578cab");
		text.style("fill", "currentColor");
	}
	function click(d) {
		// Function used for y axis hover and circle hover. So hier we need to get circle and y axis text element.
		if(typeof d == 'string'){
			var class_name = makeSafeForCSS('circle_' + d);
			var circle = d3.select("#" + $(object.element).attr('id') + ' .' + class_name);
		}
		else{
			var circle = d3.select(this);
		}
		
		var data = circle.data()[0];
		
		if(data.Link){
			window.open(data.Link);
		}
		
	}
	
	
	function resizing(){
		if (object.resize_timer != null) clearTimeout(object.resize_timer);
		
		object.resize_timer = setTimeout(function() {
			// Redraw chart
			draw_chart();
		}, 500);
	}
	
}



function d3_pie_chart(element,obj){
    var object = {
		element: element,
		margin: {top: 80, right: 80, bottom: 80, left: 80},
		data: null,
		svg:null,
		color:null,
		radius: null,
		Tooltip: null,
		resize_timer: null,
		sum: null
    };
    
    // Initialize
    init();
    
    
    function init(){
        $(object.element).empty();
    	
    	// Parse the Data
    	// Element id must much the GLOBAL variable name with the data
    	// var data = stastics[$(object.element).attr('id')];
    	var data = obj;
    	object.data = data;
    	
		// Add Total count elment
		$(object.element).append('<div class="clearfix"><span class="total-count">Total count: ' + data['Total'] + '</span></div>');
    	
    	// Draw chart
//    	draw_chart();
    	draw_chart_relax();
    	
    	// Total of the parts to calculate percentage values
    	object.sum = d3.sum(data['Data'], function(d) {
            return d.Value; 
        });
    	
    	// Redraw chart on resize
    	$(window).resize(resizing);
    }
    
    function draw_chart_relax(){
    	
    	// set the dimensions and margins of the graph
    	var margin = object.margin;
    	var width = $(object.element).width() - margin.left - margin.right;
    	var height = width;
    	var margin = object.margin;
    	// Get data
    	var data = object.data['Data'];
    	
    	// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    	var radius = Math.min(width, height) / 2 - 80;
    	object.radius = radius;
    	
    	// Delete svg if available and redraw it
    	$(object.element).find('svg').remove();
    	$(object.element).find('.tooltip').remove();
    	
    	
    	// append the svg object to the element
    	var el_id = "#" + $(object.element).attr('id');
    	// append the svg object to the div called 'my_dataviz'
    	var svg = d3.select(el_id)
    	.append("svg")
    	.attr("width", $(object.element).width())
    	.attr("height", height)
    	.append("g")
    	.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2) + ")");
    	
    	object.svg = svg;
    	
    	// Create colors
//    	var colors = get_colors(data.length);
    	var colors = ["#5290b2", "#ECE4B7", "#CF98B5", "#E5FCFF", "#BBCBCA", "#919995", "#3C362A", "#B8336A", "#D4DCCD", "#3E000C"];
    	
    	var color = d3.scaleOrdinal()
    	.domain(Object.keys(data))
    	.range(colors);
    	
    	object.color = color;
    	
    	// Compute the position of each group on the pie:
    	var pie = d3.pie()
    	.value(function(d) { return d.value.Value; });
    	var data_ready = pie(d3.entries(data));
    	
    	// The arc generator
    	var arc = d3.arc()
    	.innerRadius(radius * 0)         // This is the size of the donut hole
    	.outerRadius(radius * 0.8);
    	
    	
    	// create a tooltip
    	object.Tooltip = d3.select(el_id)
    	.append("div")
    	.style("display", 'none')
    	.style("opacity", 1)
    	.attr("class", "tooltip")
    	.style("background-color", "white")
    	.style("border", "solid")
    	.style("border-width", "2px")
    	.style("border-radius", "5px")
    	.style("padding", "5px");
    	
    	
    	// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    	svg.selectAll('mySlices')
    	.data(data_ready)
    	.enter()
    	.append('path')
    	.attr('d', arc)
    	.attr('fill', function(d){ return(color(d.data.key)); })
    	.attr("stroke", "black")
    	.attr("class", function(d) { return makeSafeForCSS('slice_' + d.data.value.Name); })
    	.style("stroke-width", "2px")
    	.style("opacity", 0.7)
    	.style("cursor", 'pointer')
    	.on("mouseover", mouseover)
    	.on("mouseleave", mouseleave)
    	.on("click", click);
    	
    	
    	// Another 2 arcs that won't be drawn. Just used for labels positioning
    	var outerArc = d3.arc()
    	.innerRadius(radius * 1.1)
    	.outerRadius(radius * 1.1);
    	
    	var outerArcSmall = d3.arc()
    	.innerRadius(radius * 0.9)
    	.outerRadius(radius * 0.9);
    	

    	// Draw labels
    	svg.selectAll('allLabels')
    	.data(data_ready)
	    	.enter()
	    	.append('text')
	    	.text( function(d) { return d.data.value.Name;} )
	    	.attr("class", function(d) { return makeSafeForCSS('label_' + d.data.value.Name); })
	//    	.attr('transform', function(d) {
	//    		var pos = outerArc.centroid(d);
	//    		
	//    		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // Optional to arrange left or right
	//    		pos[0] = radius * 1 * (midangle < Math.PI ? 1 : -1); // Optional to arrange left or right
	//    		
	//    		return 'translate(' + pos + ')';
	//    	})
	    	.attr('x', function(d) {
	    		var pos = outerArc.centroid(d);
	    		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // Optional to arrange left or right
	    		pos[0] = radius * 1 * (midangle < Math.PI ? 1 : -1); // Optional to arrange left or right
	    		
	    		return pos[0];
	    	})
	    	.attr('y', function(d) {
	    		var pos = outerArc.centroid(d);
	    		return pos[1];
	    	})
	    	.style('cursor', 'pointer')
	    	.style('text-anchor', function(d) {
	    		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
	    		return (midangle < Math.PI ? 'start' : 'end')
	    	})
	    	.on("mouseover", mouseover)
	    	.on("mouseleave", mouseleave)
	    	.on("click", click);
    	

    	// Add the polylines between chart and labels:
    	svg.selectAll('allPolylines')
    	.data(data_ready)
    	.enter()
    	.append('line')
    	.attr("stroke", "black")
    	.style("fill", "none")
    	.attr("stroke-width", 1)
    	.attr('x1', function(d) {
    		return arc.centroid(d)[0];
    	})
    	.attr('y1', function(d) {
    		return arc.centroid(d)[1];
    	})
    	.attr('x2', function(d) {
    		var pos = outerArc.centroid(d);
    		var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // Optional to arrange left or right
    		pos[0] = radius * 1 * (midangle < Math.PI ? 1 : -1); // Optional to arrange left or right
    		
    		return pos[0];
    	})
    	.attr('y2', function(d) {
    		var pos = outerArc.centroid(d);
    		return pos[1];
    	});
    	
    	// Move overlapping labels and lines
    	overlapping();
    }
    
    function overlapping(){
    	var svg = object.svg;
    	var textLabels = svg.selectAll('text');
    	var textLines = svg.selectAll('line');
    	
    	var again = false;
    	var spacing = 12;
    	var alpha = 5;
    	textLabels.each(function (d, i) {
			var a = this;
			var da = d3.select(a);
			var y1 = da.attr("y");
			textLabels.each(function (d, j) {
				var b = this;
				
				// a & b are the same element and don't collide.
				if (a == b) return;
				var db = d3.select(b);
				// a & b are on opposite sides of the chart and
				// don't collide
				if (da.style("text-anchor") != db.style("text-anchor")) return;
				// Now let's calculate the distance between
				// these elements. 
				var y2 = db.attr("y");
				var deltaY = y1 - y2;
				
                // Our spacing is greater than our specified spacing,
                // so they don't collide.
                if (Math.abs(deltaY) > spacing) return;
                
                // If the labels collide, we'll push each 
                // of the two labels up and down a little bit.
                
                again = true;
                var sign = deltaY > 0 ? 1 : -1;
                var adjust = sign * alpha;
                da.attr("y",+y1 + adjust);
                db.attr("y",+y2 - adjust);
            });
    	});
        // Adjust our line leaders here
        // so that they follow the labels. 
        if(again) {
            var labelElements = textLabels;
            textLines.attr("y2",function(d,i) {
                var labelForLine = d3.select(textLabels._groups[0][i]);
                
//		    	var tanslate_val = labelForLine.attr("transform");
//		    	var parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(tanslate_val);
		    	var y = parseInt(labelForLine.attr("y"));
		    	
                return y;
            });
            setTimeout(overlapping,20)
        }    	
    }
    
    function makeSafeForCSS(name) {
        return name.replace(/[^a-z0-9]/g, function(s) {
            var c = s.charCodeAt(0);
            if (c == 32) return '-';
            if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
            return '__' + ('000' + c.toString(16)).slice(-4);
        });
    }
    
    function mouseover(d){
    	
    	var name = d.data.value.Name;
    	
		// The arc generator
		var arc = d3.arc()
			.innerRadius(object.radius * 0)         // This is the size of the donut hole
			.outerRadius(object.radius * 0.8);
		
		var pos = arc.centroid(d);
		pos[0] = pos[0] + $(object.element).width() / 2;
		pos[1] = pos[1] + $(object.element).height() / 2;
		
		// percent 
		var percent = Math.round((d.data.value.Value/object.sum) * 100);
		
		object.Tooltip
			.html("Value: " + d.data.value.Value + '<br>' + percent + '%')
			.style("display", 'block')
			.style("top", pos[1] + "px")
			.style("left", pos[0] + "px");
		
		var svg = object.svg;
		var slice = svg.select('.' + makeSafeForCSS('slice_' + name));
		var label = svg.select('.' + makeSafeForCSS('label_' + name));
		
		slice.style("fill", "#eba434");
		label.style("fill", "#69b3a2");
    }
    function mouseleave(d) {
    	var name = d.data.value.Name;
    	
		object.Tooltip
			.style("display", 'none');
		
		var svg = object.svg;
		var slice = svg.select('.' + makeSafeForCSS('slice_' + name));
		var label = svg.select('.' + makeSafeForCSS('label_' + name));
		
		slice.style("fill", object.color(d.data.key));
		label.style("fill", "currentColor");
	}
	function click(d) {
		if(d.data.value.Link){
			window.open(d.data.value.Link);
		}
	}
    
    
    function get_colors(number){
    	var colors = new Array();
    	var step = 1/number;
    	
    	var step_comulative = 0;
    	for(i=0;i<number; i++){
    		colors.push(d3.interpolateBuPu(step_comulative));
    		step_comulative = step_comulative + step;
    	}
    	
    	return colors;
    }
	

	function resizing(){
	    if (object.resize_timer != null) clearTimeout(object.resize_timer);
	    
	    object.resize_timer = setTimeout(function() {
	            // Redraw chart
	    	draw_chart_relax();
	    }, 500);
	}
	
}

function d3_histogram_chart(element,obj){
	var object = {
			element: element,
			margin: {top: 10, right: 30, bottom: 50, left: 40},
			data: null,
    		Tooltip: null,
			resize_timer: null,
			last_range: null,
			first_range: null
	};
	
	// Initialize
	init();
	
	function init(){
        $(object.element).empty();
		
		// Parse the Data
		// Element id must much the GLOBAL variable name with the data
		var data = obj;
		object.data = data;
		
		// Add Total count elment
		var total_title = object.data['Total_title'] == undefined ? 'count'  : object.data['Total_title'];
        
        $(object.element).append('<div class="clearfix"><span class="total-count"> Total ' + total_title + ': ' + data['Total'] + '</span></div>');
		// Draw chart
		draw_chart();
		
		// Redraw chart on resize
    	$(window).resize(resizing);
	}
	
	function draw_chart(){
		
    	// Delete svg if available and redraw it
    	$(object.element).find('svg').remove();
    	$(object.element).find('.tooltip').remove();
		
		// set the dimensions and margins of the graph
		var margin = object.margin;
		var width = $(object.element).width() - margin.left - margin.right;
		var height = 400 - margin.top - margin.bottom;
		
		// append the svg object to the body of the page
		var el_id = "#" + $(object.element).attr('id');
		var svg = d3.select(el_id)
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// get the data
		var data = object.data.Data;
		
		// X axis: scale and draw:
		var x = d3.scaleLinear()
			.domain([0, d3.max(data, function(d) { return +d })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
			.range([0, width])
			.nice();
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));
		
		// text label for the x axis
		var x_axis_title = object.data['x-axis-title'];
		if (x_axis_title != undefined && x_axis_title != ''){
			svg.append("text")             
			.attr("transform",
			"translate(" + (width/2) + " ," + 
				(height + margin.top + 25) + ")")
			.style("text-anchor", "middle")
			.text(x_axis_title);
		}

		// set the parameters for the histogram
		
		// Generate ranges for histogram
		var ranges = object.data['ranges'];
		
		var histogram = d3.histogram()
			.value(function(d) { return d; }) 
			.domain(x.domain())  // then the domain of the graphic
//			.thresholds(x.ticks(100)); // then the numbers of bins
			.thresholds(ranges); // then the numbers of bins


		// And apply this function to data to get the bins
		var bins = histogram(data);
		// Save last bin value for tooltip last range
		object.last_range = bins[bins.length - 1]['x0'];
		// Save first bin value for tooltip first range
		object.first_range = bins[0]['x0'];
		
		// Y axis: scale and draw:
		var y = d3.scaleLinear()
			.range([height, 0]);
		y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
		svg.append("g")
			.call(d3.axisLeft(y));
		
		
		// create a tooltip
		object.Tooltip = d3.select(el_id)
			.append("div")
			.style("display", 'none')
			.style("opacity", 1)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "2px")
			.style("border-radius", "5px")
			.style("padding", "5px");

		// append the bar rectangles to the svg element
		svg.selectAll("rect")
			.data(bins)
			.enter()
			.append("rect")
				.attr("x", 1)
				.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
				.attr("width", function(d) {  return (x(d.x1) - x(d.x0) -1)<0 ?0:(x(d.x1) - x(d.x0) -1 ) })
				.attr("height", function(d) { return height - y(d.length); })
				.style("fill", "#578cab")
				.style("cursor", "pointer")
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave)
				.on("click", click);
		
		
		// Circles
		svg.selectAll("mycircle")
			.data(bins)
			.enter()
			.append("circle")
//				.attr("cx", function(d) { return x(d.x0) + 3; })
//				.attr("cy", function(d) { return y(d.length); })
				
				.attr("transform", function(d) {
					// position circle in the middle of the bar
					var pos_circle = Math.round((x(d.x1) - x(d.x0) -1) / 2);
					return "translate(" + (x(d.x0) + pos_circle + 1) + "," + y(d.length) + ")"; 
				})
				.attr("r", "3")
				.style("fill", "#eba434")
				.style("cursor", "pointer")
				.style("display", function(d) { return d.length > 0 ? 'block': 'none';  })
				.attr("stroke", "black")
//				.attr("class", function(d) { return "loli-point " + makeSafeForCSS('circle_' + d.Name); }) // Needed for the y axis hover Tooltip function
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave)
				.on("click", click);
		
	}
	
	
    function mouseover(d){
    	
    	var tanslate_val = d3.select(this).attr("transform");
    	var parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(tanslate_val);
    	
    	var firstX = parseFloat(parts[1]),
    	    firstY = parts[2];
  	
		var min_range = d['x0'];
		var max_range= d['x1'];
		
		var range_number = 0;
		if( (d['x1'] - d['x0']) <= 1 ){
			range_number = ((d['x1'] + d['x0'])/2);
			range_number = decimalPlaces(range_number) > 3 ? range_number.toFixed(2) : range_number;
		} 
		else{
			// If we have a more than 3 decimals, round to 3 decimals
			min_range = decimalPlaces(min_range) > 3 ? min_range.toFixed(2) : min_range;
			max_range=  decimalPlaces(max_range) > 3 ? max_range.toFixed(2) : max_range;
			range_number = min_range + '-' + max_range;
		}
		
		if(min_range == object.last_range){
			// round number down to next .5 value
			range_number = '>' + round_floor_half(min_range);
		}
		if(min_range == object.first_range){
			// round number up to next .5 value
			range_number = '<' + round_ceil_half(max_range);
		}
		
		object.Tooltip
//			.html("Value: " + d.length)
			.html("Value: " + d.length + '<br>Range: ' + range_number)
			.style("display", 'block')
			.style("left", (firstX - 80) + "px")
			// .style("bottom", 0 + "px");
			// .style("top", (firstY - 55) + "px");
			// .style("left", (d3.mouse(this)[0]+20) + "px")
			.style("bottom", (d3.mouse(this)[1])+87 + "px")

		// Point element effect on hover
	    d3.select(this)
	      .style("fill", "#eba434");
    }
	function mouseleave(d) {
		object.Tooltip
			.style("display", 'none');
		

		// Point element effect on hover
		if (this.nodeName == 'circle'){
		    d3.select(this)
		      .style("fill", "#eba434");
		}
		// Rect element effect on hover
		else{
		    d3.select(this)
		      .style("fill", "#578cab");
		}
	}
	function click(d) {
		var min_range = d['x0'];
		var max_range= d['x1'] - 0.01;
		
		// If we have a more than 3 decimals, round to 3 decimals
		min_range = decimalPlaces(min_range) > 3 ? min_range.toFixed(3) : min_range;
		max_range=  decimalPlaces(max_range) > 3 ? max_range.toFixed(3) : max_range;
		
		if(d['x0'] == object.last_range){
//			var top_range_number = (d['x0'] - Math.floor(d['x0']) > 0.5) ? (Math.floor(d['x0']) + 0.5) : Math.floor(d['x0']); 
			var link = object.data.Link.replace("range", "greater") + round_floor_half(min_range);
		}
		else if(d['x0'] == object.first_range){
			// var link = object.data.Link.replace("range", "smaller") + round_ceil_half(max_range);
			var link = object.data.Link.replace("range", "smaller");
			link = link.replace('####', round_ceil_half(max_range));
		}
		else{
			// var link = object.data.Link + min_range + '+' + max_range;
			var link = object.data.Link.replace('####', min_range + '-' + max_range);
		}
		
		
		if(link){
			window.open(link);
		}
	}
	
	function round_floor_half(num){
		if(num % 0.5 == 0){
			return num;
		}
		else{
			return (num - Math.floor(num) > 0.5) ? (Math.floor(num) + 0.5) : Math.floor(num);
		}
	}
	
	function round_ceil_half(num){
		if(num % 0.5 == 0){
			return num;
		}
		else{
			return (Math.ceil(num) - num > 0.5) ? (Math.ceil(num) - 0.5) : Math.ceil(num);
		}
	}
	
	function decimalPlaces(num) {
		var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
		if (!match) { return 0; }
		return Math.max(
			0,
			// Number of digits right of decimal point.
			(match[1] ? match[1].length : 0)
			// Adjust for scientific notation.
			- (match[2] ? +match[2] : 0)
		);
	}
	
	
	function resizing(){
		if (object.resize_timer != null) clearTimeout(object.resize_timer);
		
		object.resize_timer = setTimeout(function() {
			// Redraw chart
			draw_chart();
		}, 500);
	}
	
	
}



</script>

<style>
.d3-lollipop-chart,.d3-histogram-chart,.d3-pie-chart{
    position: relative;
    font-size: 12px;
}
.d3-lollipop-chart .graphic{
    max-height: 310px;
    overflow: auto;
    position: relative;
}
.d3-lollipop-chart .total-count, .d3-histogram-chart .total-count {
    float: right;
    margin-right: 22px;
    margin-top: 10px;
    border: 1px solid black;
    padding: 3px 5px;
}
.d3-pie-chart .total-count {
    border: 1px solid black;
    padding: 3px 5px;
    position: absolute;
    right: 20px;
    top: 20px;
}
.tooltip {
    position: absolute;
    z-index: 1070;
    display: block;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
    text-align: start;
    text-decoration: none;
    text-shadow: none;
    text-transform: none;
    letter-spacing: normal;
    word-break: normal;
    word-spacing: normal;
    white-space: normal;
    line-break: auto;
    font-size: .875rem;
    word-wrap: break-word;
    opacity: 0;
}
svg:not(:root) {
    overflow-clip-margin: content-box;
    overflow: hidden;
}
.bj{
	background: url('../../assets/images/tjbj.png') no-repeat center;
	background-size: 100% 100%;
}
</style>