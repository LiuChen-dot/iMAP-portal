"use strict";

/// Copyright (C) 2023-2024 by SRI International.  All rights reserved.

GB.Orthos =
{
    version: 2,
    
    async Load(gb)
    {
	console.log("GB Orthos", this.version);
	
	let orgids = [];
	for(let replicon of gb.replicon)
	    orgids.push(replicon.orgid);
	
	//let url = "https://brg-preview.ai.sri.com/ajax-all-orthos-colors-by-orgids-as-json?lead-orgid=" + orgids[0] + "&orgids=" + orgids.join();
	let url = gb.host + "/ajax-all-orthos-colors-by-orgids-as-json?lead-orgid=" + orgids[0] + "&orgids=" + orgids.join();
	
	if (gb.debug == 1)
	    url = gb.cache + "orthos.json";
	let t0 = performance.now();
	let orthos = await FetchJSON(url);
	if (!orthos)
	    orthos = [];
	console.log(url, orthos.length, DT(t0));
	if (gb.debug == 2)
	    SaveJSON(orthos, "orthos.json", 1);

	//fix preview cors error here
	url = gb.host + "/get-organisms-json";
	if (gb.debug == 1)
	    url = gb.cache + "get-organisms-json";
	t0 = performance.now();
	gb.organisms = await FetchJSON(url);
	if (!gb.organisms)
	    gb.organisms = [];
	console.log(url, gb.organisms, DT(t0));
	if (gb.debug == 2)
	    SaveJSON(gb.organisms, "get-organisms-json", 1);

	this.colorsFill = GB.colorsFill;
	this.colorsText = GB.colorsText;

	let orthoMap = {};
	for(let replicon of gb.replicon) {
	    orthoMap[replicon.orgid] = {};
	}

	for(let orth of orthos) {
	    let [gid1, org1, chrom1, gid2, org2, chrom2, color] = orth;
	    if (!orthoMap[org1] || !orthoMap[org2]) {
		console.log("ortho error!");
		return;
	    }

	    if (!orthoMap[org1][chrom1]) 
		orthoMap[org1][chrom1] = {}		
	    if (!orthoMap[org1][chrom1][gid1]) 
		orthoMap[org1][chrom1][gid1] = [];
	    orthoMap[org1][chrom1][gid1].push([org2, gid2]);

	    if (!orthoMap[org2][chrom2]) 
		orthoMap[org2][chrom2] = {}		
	    if (!orthoMap[org2][chrom2][gid2]) 
		orthoMap[org2][chrom2][gid2] = [];
	    orthoMap[org2][chrom2][gid2].push([org1, gid1]);
	}

	GB.orthoMap = orthoMap;
	return orthos;
    },

    Update(gb)
    {
	this.Align(gb, gb.replicon[0].centerGene);

	for(let r = 0; r < gb.replicon.length; r++) {
	    let replicon = gb.replicon[r];
	    if (!replicon.init)
		continue;
	    if (replicon.genesById)
		continue;
	    let genes = {};
	    for(let gene of replicon.genes) {
		genes[gene.uid] = gene;
		gene.bg = this.colorsFill[0];
		gene.fg = this.colorsText[0];
		gene.color = 0;
	    }
	    replicon.genesById = genes
	}

	let nskipped = 0;
	for(let o in gb.orthos) {
	    let orth = gb.orthos[o];
	    let [gid1, org1, chrom1, gid2, org2, chrom2, color] = orth;
	    let gene = gb.replicon[0].genesById[gid1];
	    if (!gene) {
		console.log("init ortho error!", gid1, gid2);
		continue;
	    }
	    gene.fg = this.colorsText[color];
	    gene.bg = this.colorsFill[color];
	    gene.color = color;
	    for(let r = 1; r < gb.replicon.length; r++) {
		let replicon = gb.replicon[r];
		if (!replicon.init)
		    continue;
		if (replicon.orgid == org2 && replicon.chromosome != chrom2)
		    nskipped++;
		if (replicon.orgid != org2 || replicon.chromosome != chrom2)
		    continue;
		let gene = replicon.genesById[gid2];
		if (!gene) {
		    if (!this.verbose)
			this.verbose = 0;
		    if (this.verbose++ < 5)
			console.log("init ortho error!", o, orth);
		    continue;
		}
		gene.fg = this.colorsText[color];
		gene.bg = this.colorsFill[color];
		gene.color = color;
	    }
	}
    },
    
    /// geneId is the "lead-gene"
    ///
    Align(gb, geneId)
    {
	for(let r = 0; r < gb.replicon.length; r++) {
	    let replicon = gb.replicon[r];
	    if (r != 0)
		replicon.centerGene = null;
	    replicon.gene0 = null;
	}
	
	for(let orth of gb.orthos) {
	    let [gid1, org1, chrom1, gid2, org2, chrom2, color] = orth;
	    gb.replicon[0].chromosome = chrom1; // Don't forget the lead replicon:
	    for(let replicon of gb.replicon) {
		if (gid1 == geneId && replicon.orgid == org2) {
		    if (replicon.chromosome && replicon.chromosome != chrom2) {
			console.log("switch replicon", replicon.chromosome, chrom2);
			replicon.title.innerHTML = "Loading..." + replicon.orgid + " " + chrom2;
			replicon.init = false;
			replicon.ctx.setTransform(1,0,0,1,0,0);
			replicon.ctx.clearRect(0,0, replicon.canvas.width, replicon.canvas.height);
			replicon.chromosome = chrom2;
			replicon.centerGene = gid2;
			GB.LoadReplicon(replicon).then( () => {
			    console.log("reloaded", replicon);
			    replicon.genesById = null;
			    this.Update(gb);
			    GB.CenterReplicons(gb);
			    GB.UpdateTitles(gb);
			    GB.Draw(gb);
			});
		    }
		    replicon.chromosome = chrom2;
		    replicon.centerGene = gid2;
		}
	    }
	}
    },

};

