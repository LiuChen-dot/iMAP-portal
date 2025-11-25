"use strict";

/// Copyright (C) 2023-2024 by SRI International.  All rights reserved.

var GBSeq = {
    version: 3.6,

    baseComplements: {
	'A' : 'T',
	'T' : 'A',
	'G' : 'C',
	'C' : 'G',
	' ' : ' ',  // Whitespace, used (only) at position 0.
	'N' : 'N',
	'X' : 'X',
	'.' : "."
    },

    aaSingleLetterToAbbrevStr:  {
	'A' : "Ala",
	'C' : "Cys",
	'D' : "Asp",
	'E' : "Glu",
	'F' : "Phe",
	'G' : "Gly",
	'H' : "His",
	'I' : "Ile",
	'K' : "Lys",
	'L' : "Leu",
	'M' : "Met",
	'N' : "Asn",
	'P' : "Pro",
	'Q' : "Gln",
	'R' : "Arg",
	'S' : "Ser",
	'T' : "Thr",
	'U' : "Sec", // selenocysteine
	'V' : "Val",
	'W' : "Trp",
	'Y' : "Tyr",
	'*' : "*"
    },

    Init()
    {
	let gb = GB.gb;

	console.log("GBSeq", this.version);
	
	//measure text width of all AA abbrevations
	let ctx = gb.replicon[0].ctx;
	this.aaAbbrevWidth = {};
	for(let aa in this.aaSingleLetterToAbbrevStr) {
	    let aaAbbrev = this.aaSingleLetterToAbbrevStr[aa];
	    this.aaAbbrevWidth[aaAbbrev] = ctx.measureText(aaAbbrev).width;
	}

	let seqselect = gb.dom.seqselect;
	seqselect.startBp = false;
	seqselect.endBp = false;
	
	let seqselectAma = gb.dom.seqselectAma;
	seqselectAma.startAA = false;
	seqselectAma.endAA = false;
	
	seqselect.bpOfTipCoords = () =>
	{
	    let tip = this.tip0;
	    if (!tip)
		return [];

	    switch(tip.t) {
	    case 'BP+':
		return [
		    tip.b,
		    "+",
		    [false, false],
		    tip.r
		];
		break;
	    case 'BP-':		
		return [
		    tip.b,
		    "-",
		    [false, false],
		    tip.r
		];
		break;
	    case 'AA':		
		let aa = this.focus;	    
		return [
		    false,
		    false,
		    [tip.p, tip.e],
		    tip.r
		];
	    }
	}
	
    },
    
    LoadDNA(gb, replicon)
    {
	let view = replicon.view;
	
	if (!replicon.dnaSeq)
	    replicon.dnaSeq = {};

	let baseMin = view.dir > 0 ? view.axes[0].baseMin : view.axes[0].baseMax;
	let baseMax = view.dir > 0 ? view.axes[0].baseMax : view.axes[0].baseMin;
	let axisPrev = null;
	for(let axis of view.axes) {
	    if (axisPrev && axisPrev.y1 == axis.y1) {
		FetchDNA(replicon, baseMin, baseMax);
		baseMin = view.dir > 0 ? axis.baseMin : axis.baseMax;
		baseMax = view.dir > 0 ? axis.baseMax : axis.baseMin;
	    }
	    axisPrev = axis;
	    baseMin = Math.min(baseMin, view.dir > 0 ? axis.baseMin : axis.baseMax);
	    baseMax = Math.max(baseMax, view.dir > 0 ? axis.baseMax : axis.baseMin);
	}
	FetchDNA(replicon, baseMin, baseMax);

	function FetchDNA(replicon, baseMin, baseMax)
	{
	    let dnaSeq = replicon.dnaSeq
	    //	    console.log("fetch0", baseMin, baseMax);
	    dnaSeq[0] = ' ';
	    for(let b = baseMin; b <= baseMax; b++) {
		if (typeof dnaSeq[b] == 'undefined') {
		    baseMin = Math.max(baseMin - 50000, 1);
		    baseMax = Math.min(baseMax + 50000, replicon.length);	    

		    let t0 = performance.now();
		    //0.11sec: https://brg-preview.ai.sri.com/ajax-replicon-nt-seq-as-json?orgid=ECOLI&chromosome=COLI-K12&startbp=100&endbp=200
		    //2.17sec https://brg-preview.ai.sri.com/ajax-replicon-nt-seq-as-json?orgid=ECOLI&chromosome=COLI-K12	
		    let url = gb.host + "/ajax-replicon-nt-seq-as-json?orgid=" +
			replicon.orgid + "&chromosome=" + replicon.chromosome +
			"&startbp=" + baseMin + "&endbp=" + baseMax;	
		    
		    //avoid repeated queries to load pending requests
		    for(let b = baseMin; b <= baseMax; b++) {
			if (typeof dnaSeq[b] == 'undefined')
			    dnaSeq[b] = ' ';
		    }
		    FetchJSON(url)
			.then( (seq) => {
			    //console.log('fetch', baseMin, baseMax, "len", baseMax-baseMin+1, seq ? seq.length : -1, "dt", DT(t0));
			    seq = seq.toUpperCase(seq);
			    for(let boff = 1; boff < seq.length; boff++)
				dnaSeq[baseMin + boff-1] = seq[boff];

			    if (gb.semzoom == 'sequence')
				GB.Draw(gb);
			});
		    return;
		}
	    }
	}
    },
    
    Draw(gb, replicon)
    {
	let t0 = performance.now();

	this.LoadDNA(gb, replicon);

	replicon.ctx.save();
	
	let view = replicon.view;
	let xmin = view.axes[0].x1;
	let xmax = view.axes[0].x2;
	for(let axis of view.axes) {
	    xmin = Math.min(xmin, axis.x1);
	    xmax = Math.max(xmax, axis.x2);
	}

	this.DrawSelectionBP(gb, replicon);
	this.DrawSelectionAA(gb, replicon);

	for(let axis of replicon.view.axes) {
	    //mark each x position along axis with the gene, if any, at that postion.
	    //For overlapped genes use the lower gene for now
	    let geneAtX = [];
	    let genesOnAxis = {};
	    for(let x = xmin; x <= xmax; x++)
		geneAtX[x] = null;
	    for(let bbox of replicon.bboxes) {
		if (bbox.t == 'G' && bbox.e.type == "P" &&  //protein genes only
		    bbox.y - axis.y1 == 45) { //hack for bottom row of genes
		    genesOnAxis[bbox.e.uid] = bbox.e;
		    for(let x = bbox.x; x <= bbox.x+bbox.l; x++)
			geneAtX[x] = bbox.e;
		}
	    }

	    this.DrawBP(gb, replicon, axis, geneAtX, xmin, xmax);
	    this.DrawAASeqs(gb, replicon, axis, genesOnAxis);
	}

	replicon.ctx.restore();
    },

    DrawSelectionBP(gb, replicon)
    {
	let view = replicon.view;
	let ctx = replicon.ctx;
	let seqselect = gb.dom.seqselect;
	let bpStart = seqselect.startBp;
	let bpEnd = seqselect.endBp;
	let bpWrap = seqselect.wrapAroundP;
	
	if (bpStart === false && bpEnd === false) 
	    return;

	if (bpStart === false)
	    bpStart = bpEnd;
	if (bpEnd === false)
	    bpEnd = bpStart;

	if (bpStart > bpEnd) {
	    let tmp = bpStart;
	    bpStart = bpEnd;
	    bpEnd = tmp;
	}

	ctx.fillStyle = "#00FFFF"; // cyan
	
	if (bpWrap) {
	    for(let axis of view.axes) {
		let y = seqselect.strandOfTip == "+" ? axis.y2 - 15 : axis.y2 - 5;
		let baseMin = Math.min(axis.baseMax, bpStart);
		if (baseMin > axis.baseMin) {
		    let x = axis.x1 + (baseMin - axis.baseMin) * view.dir / view.basesPerPixel;
		    x += view.pixelsPerTick/2;
		    ctx.fillRect(axis.x1, y, x-axis.x1, -9);
		}
		let baseMax = Math.max(axis.baseMin, bpEnd);
		if (baseMax < axis.baseMax) {
		    let x = axis.x1 + (baseMax - axis.baseMin) * view.dir / view.basesPerPixel;
		    x -= view.pixelsPerTick/2;
		    ctx.fillRect(x, y, axis.x2-x, -9);
		}
	    }
	} else {
	    for(let axis of view.axes) {
		let baseMin = Math.max(axis.baseMin, bpStart);
		let baseMax = Math.min(axis.baseMax, bpEnd);
		if (baseMin > baseMax)
		    continue;
		let y = seqselect.strandOfTip == "+" ? axis.y2 - 15 : axis.y2 - 5;

		let x1 = axis.x1 + (baseMin - axis.baseMin) * view.dir / view.basesPerPixel;
		let x2 = axis.x1 + (baseMax - axis.baseMin) * view.dir / view.basesPerPixel;

		x1 -= view.pixelsPerTick/2;
		x2 += view.pixelsPerTick/2;
		ctx.fillRect(x1, y, x2-x1, -9);
	    }
	}
    },

    DrawSelectionAA(gb, replicon)
    {
	let view = replicon.view;
	let ctx = replicon.ctx;
	let seqselectAma = gb.dom.seqselectAma;
	let aaStart = seqselectAma.startAA;
	let aaEnd = seqselectAma.endAA;
	let gene = seqselectAma.proteinGeneObj;

	if (aaStart === false && aaEnd === false || !gene)  
	    return;

	if (aaStart === false)
	    aaStart = aaEnd;
	if (aaEnd === false)
	    aaEnd = aaStart;
	if (aaStart > aaEnd) {
	    let tmp = aaStart;
	    aaStart = aaEnd;
	    aaEnd = tmp;
	}
	
	ctx.fillStyle = "#00FFFF"; // cyan
	let baseStart, baseEnd, dir, blen;
	if (gene.dir == '+') {
	    baseStart = gene.baseStart + aaStart*3;
	    baseEnd = gene.baseStart + aaEnd*3;
	    blen = baseEnd - baseStart + 1;
	    dir = 1;
	} else {
	    baseStart = gene.baseEnd - aaStart*3;	    
	    baseEnd = gene.baseEnd - aaEnd*3;
	    blen = baseStart - baseEnd + 1;	    
	    dir = -1;
	}
	for(let axis of view.axes) {
	    let y = axis.y2 - 33;
	    let b = baseStart;
	    for(let boff = 0; boff < blen; boff+=3, b += 3 * dir) {
		let x = axis.x1 + (b - axis.baseMin) * view.dir / view.basesPerPixel;
		x = Math.round(x);
		if (x < axis.x1 + view.pixelsPerTick || x > axis.x2 + view.pixelsPerTick)
		    continue;
		if (dir == -1)
		    x -= view.pixelsPerTick*2;
		let l = view.pixelsPerTick*2;
		let h = 7;
		ctx.fillRect(x, y, l, h);
	    }
	}
    },
    
    DrawBP(gb, replicon, axis, geneAtX, xmin, xmax)
    {
	let ctx = replicon.ctx;
	let view = replicon.view;
	let dnaSeq = replicon.dnaSeq;
	let font = {
	    base: "10px sans-serif",
	    baseBold: "bold 10px sans-serif",
	    label: "8px sans-serif"
	};

	let y = axis.y2;
	let ySeq5 = y-15;
	let ySeq3 = y-5;
	
	//label axis 3' and 5'
	ctx.font = font.label;
	ctx.fillStyle = "black";
	if (axis.x1 == xmin) {
	    let leftPrimeLabelsX = axis.x1 - 12;
	    ctx.fillText("5'", leftPrimeLabelsX, ySeq5 - 2);
	    ctx.fillText("3'", leftPrimeLabelsX, ySeq3 - 2);
	}
	if (axis.x2 == xmax) {
	    let rightPrimeLabelsX = axis.x2 + 2;
	    ctx.fillText("3'", rightPrimeLabelsX, ySeq3 - 2);
	    ctx.fillText("5'", rightPrimeLabelsX, ySeq5 - 2);
	}

	let basesPerTick = view.basesPerTick * view.dir;
	let b = axis.baseMin;
	ctx.font = font.baseBold;
	let dx = 3;
	let tip5AtX = [];
	let tip3AtX = [];	
	for(let x = axis.x1; x < axis.x2; x += view.pixelsPerTick, b += basesPerTick) {
	    //save mouse sensitive area for top strand. Used by GBSeq.OnHover()
	    tip5AtX[x] = {
		x: x-dx-1,
		y: ySeq5 - 9,
		l: dx*2+5,
		h: 11,
		t: 'BP+',
		e: geneAtX[x],
		b: b,
		r: replicon
	    };
	    tip3AtX[x] = {
		x: x-dx-1,
		y: ySeq3 - 9,
		l: dx*2+5,
		h: 11,
		t: 'BP-',
		e: geneAtX[x],
		b: b,
		r: replicon,		
	    };

	    let s = dnaSeq[b];
	    if (!s)
		continue;
	    let sc = this.baseComplements[s];
	    if (geneAtX[x]) {
		if (geneAtX[x].dir == '+') {
		    ctx.fillText(s, x-dx, ySeq5);
		    tip5AtX[x].bp = s;
		    tip5AtX[x].f = font.baseBold;
		} else {
		    ctx.fillText(sc, x-dx, ySeq3);			
		    tip3AtX[x].bp = sc;
		    tip3AtX[x].f = font.baseBold;
		}
	    }
	}

	b = axis.baseMin;
	ctx.font = font.base;
	for(let x = axis.x1; x < axis.x2; x += view.pixelsPerTick, b += basesPerTick) {
	    let s = dnaSeq[b];
	    if (!s)
		continue;
	    let sc = this.baseComplements[s];
	    if (geneAtX[x]) {
		if (geneAtX[x].dir == '+') {
		    ctx.fillText(sc, x-dx, ySeq3);
		    tip3AtX[x].bp = sc;
		    tip3AtX[x].f = font.base;
		} else {
		    ctx.fillText(s, x-dx, ySeq5);			
		    tip5AtX[x].bp = s;
		    tip5AtX[x].f = font.base;
		}
	    } else {
		ctx.fillText(s, x-dx, ySeq5);
		ctx.fillText(sc, x-dx, ySeq3);		    
		tip5AtX[x].bp = s;
		tip5AtX[x].f = font.base;
		tip3AtX[x].bp = sc;
		tip3AtX[x].f = font.base;
	    }

	    if (gb.mouse.drag)
		continue;

	    //save mouse sensitive area for bottom strand. Used by GBSeq.OnHover()
	    replicon.bboxes.push(tip3AtX[x]);
	    replicon.bboxes.push(tip5AtX[x]);	    
	}
    },

    DrawAASeqs(gb, replicon, axis, genes)
    {
	let aaCodonTextY = axis.y2-25;
	let view = replicon.view;
	let ctx = replicon.ctx;
	let fontAA = "9px sans-serif";
	let pixelsPerBase = view.pixelsPerTick; //one base per tick for sequence view
	let basesPerTick = view.basesPerTick * view.dir;
	for(let uid in genes) {
	    let gene = genes[uid];

	    if (typeof gene.aaSeq == 'undefined') {
		gene.aaSeq = ""; //avoid nexted fetches
		FetchAASeq(gene);
		continue;
	    }
	    if (!gene.aaSeq) {
		continue;
	    }

	    let color = maybeDarkenColor(gene.color);
	    ctx.fillStyle =
		ctx.strokeStyle = color;
	    ctx.font = fontAA;
	    ctx.beginPath();
	    let blen = gene.baseEnd - gene.baseStart + 1;
	    let dir = gene.dir == '+' ? 1 : -1;
	    let fillText = []; //for speed, separate line drawing from text drawing
	    for(let boff = 0; boff < blen; boff+=3) {
		let b = (dir > 0) ? gene.baseStart + boff : gene.baseEnd - boff;
		let x = axis.x1 + (b - axis.baseMin) * view.dir / view.basesPerPixel;
		x = Math.round(x);
		if (x < axis.x1 + pixelsPerBase || x > axis.x2 + pixelsPerBase)
		    continue;
		let aaPos = boff / 3;
		let aa = gene.aaSeq[aaPos];
		if (aaPos < 0 || aaPos > gene.aaSeq.length) {
		    console.log(aaPos, aa, gene.aaSeq.length);
		    continue;
		}
		if ( aaPos == gene.aaSeq.length)
		    aa = '*' ; // 1 position after the aaSeq
		let aaAbbrev = this.aaSingleLetterToAbbrevStr[aa];
		let textWidth = this.aaAbbrevWidth[aaAbbrev];
		let baseCenterX = x + pixelsPerBase * dir;//  - 3;
		fillText.push([aaAbbrev, baseCenterX - textWidth/2, aaCodonTextY]);
		let dx = (pixelsPerBase * 3 - textWidth)/2 - 1;
		ctx.moveTo(baseCenterX - textWidth/2 - dx, aaCodonTextY + 1);
		ctx.lineTo(baseCenterX - textWidth/2 - dx, aaCodonTextY - 4);
		ctx.lineTo(baseCenterX - textWidth/2 - 1, aaCodonTextY - 4);
		// on the right of the AA Abrev.
		dx--;
		ctx.moveTo(baseCenterX + textWidth/2 + dx, aaCodonTextY + 1);
		ctx.lineTo(baseCenterX + textWidth/2 + dx, aaCodonTextY - 4);
		ctx.lineTo(baseCenterX + textWidth/2 + 1, aaCodonTextY - 4);

		if (gb.mouse.drag)
		    continue;

		if (aa != "*") {
		    replicon.bboxes.push({
			x: baseCenterX - textWidth/2 - 1,
			y: aaCodonTextY - 7, 
			l: textWidth + 2,
			h: 9,
			t: 'AA',
			aa: aaAbbrev,
			f: fontAA,
			c: color,
			p: aaPos,
			e: gene,
			r: replicon
		    });
		}
	    }
	    ctx.stroke();
	    for(let t of fillText)
		ctx.fillText(t[0], t[1], t[2]);
	}

	function FetchAASeq(gene)
	{
	    let url = gb.host + "/ajax-gene-product-aa-seq-as-json?orgid=" + replicon.orgid + "&genes=" + gene.uid;
	    //console.log("fetchAA", url);
	    FetchJSON(url)
		.then( (aaSeqs) => {
		    //console.log(gene.uid, aaSeqs);
		    gene.aaSeq = aaSeqs && aaSeqs[gene.uid] ? aaSeqs[gene.uid] : "";
		    GB.Draw(gb);
		});
	}

	///kr:Oct-31-2023 Given an index integer into the gene color array,
	/// darken the color a bit, if it would be a very light color
	/// (as indicated by the black/white text color array for gene names),
	/// which would be difficult to read against the white background.
	///
	///   objectColorIndex : An integer into linear arrays like GB.colorsFill[] and colorsText[]
	///
	function maybeDarkenColor(objectColorIndex)
	{
	    //console.log('objectColorIndex: ' + objectColorIndex)
	    // The background color of a gene arrow
	    let fillColorStr = GB.colorsFill[objectColorIndex]
	    // The color of the gene text (gene name and maybe product). White or black.
	    // So the 2 values are:  "#000000" or "#FFFFFF"
	    let textColorStr = GB.colorsText[objectColorIndex]
	    //console.log('textColorStr: ' + textColorStr)
	    let textColorVal = parseInt( textColorStr.slice(1) ,16) // cut off the "#" first
	    if ( textColorVal == 0 ) {
		// A light color, which needs to be darkened.
		let fillColorVal = parseInt( fillColorStr.slice(1) ,16)
		//### Color overflow or underflow are not handled in this simplistic code.
		// So the value has to be small enough to not trigger these problems.
		let darkenedVal = fillColorVal - 0x151515
		let darkenedColorStr = "#" + darkenedVal.toString(16)
		//console.log('darkenedColorStr: ' + darkenedColorStr )
		return darkenedColorStr
	    } else {
		return fillColorStr
	    }
	}
    },

    OnHover(replicon, tip, x, y)
    {
	let ctx = replicon.ctx;

	if (tip && tip == this.tip0)
	    return;
	
	ctx.save();
	if (this.tip0) {
	    switch(this.tip0.t) {
	    case 'AA':
		ctx.clearRect(this.tip0.x-.5, this.tip0.y-.5, this.tip0.l+1, this.tip0.h+1);
		ctx.font = this.tip0.f;
		ctx.fillStyle = this.tip0.c;
		ctx.fillText(this.tip0.aa, this.tip0.x+1, this.tip0.y+7);
		break;
	    case 'BP+':
	    case 'BP-':		
		ctx.clearRect(this.tip0.x, this.tip0.y, this.tip0.l, this.tip0.h);
		ctx.font = this.tip0.f;
		ctx.fillText(this.tip0.bp, this.tip0.x+1, this.tip0.y+9);
		break;
	    }
	}

	this.tip0 = tip;
	if (tip) {
	    ctx.lineWidth = .5;
	    ctx.strokeStyle = "#000000";
	    ctx.strokeRect(tip.x+.5, tip.y+.5, tip.l-2, tip.h-2);
	}
	ctx.restore();
	
	return;
    },

    OnMouseUp(evt)
    {
	let gb = GB.gb;

	// Init DNA select menu?
	if (gb.dom.seqselect.classList.contains("hidden") &&
	    this.tip0 && (this.tip0.t == "BP+" || this.tip0.t == "BP-")) {
	    GB.OnPopup({target: gb.dom.btnSeqSelectDNA});
	    this.OnSeqSelectStart();
	}

	// Init AA select menu?
	if (gb.dom.seqselectAma.classList.contains("hidden") &&
	    this.tip0 && this.tip0.t == "AA") {
	    GB.OnPopup({target: gb.dom.btnSeqSelectAA});
	    this.OnSeqSelectStartAA();
	}

	//kr:Nov-2-2023 For sequence selection
	//kr:Nov-10-2023 For now, set gb.semzoom in OnZoomLevels()  explicitly, while GetSemanticLevel() is in disarray
	//gb.semzoom = GB.GetSemanticLevel(gb.replicon[0].view.scale);
	//console.log('OnMouseUp1 semzoom: ' + gb.semzoom + ' gb.mouse.mx0: ' + gb.mouse.mx0)
	//console.log('gb.replicon[0].view.scale : ' + gb.replicon[0].view.scale)
	let seqselect = gb.dom.seqselect;
	let waitForStartP = (seqselect.SeqSelectStatus == 'waitForStart');
	let waitForEndP = (seqselect.SeqSelectStatus == 'waitForEnd');
	let seqselectAma = gb.dom.seqselectAma;
	let waitForAaStartP = (seqselectAma.SeqSelectStatus == 'waitForStart');
	let waitForAaEndP = (seqselectAma.SeqSelectStatus == 'waitForEnd');
	// The seqselect.SeqSelectStatus needed to be set in OnSeqSelectStart()

	if ((gb.semzoom == 'sequence') && (waitForStartP || waitForEndP || waitForAaStartP || waitForAaEndP) ) {
	    //console.log('OnMouseUp semzoom: ' + gb.semzoom + ' gb.mouse.mx0: ' + gb.mouse.mx0)
	    //kr:Nov-9-2023 bpOfTipCoords(evt) now returns an array of the form [bp, "+"or"-", aaPosGeneV, replicon]
	    // or an array of 4 false values.
	    let bpStrandRepliconOfTip = seqselect.bpOfTipCoords(evt);
	    //console.log('bpStrandRepliconOfTip: ' + bpStrandRepliconOfTip)
	    let [bpOfTip, strandOfTip, aaPosGeneV, replicon] = bpStrandRepliconOfTip
	    //console.log('aaPosGeneV: ' + aaPosGeneV)
	    let successP = (bpStrandRepliconOfTip != [false, false, false, false])
	    let bpFeedbackVal = successP ? parseInt(bpOfTip).toLocaleString() + ' bp'  : '&nbsp;' ;
	    //kr:Nov-13-2023 It is OK to process click results, if either seqselect.strandOfTip has not yet been initialized,
	    // or if seqselect.strandOfTip is the same as the in the current state so far.
	    // Otherwise, a click will be simply ignored.
	    let strandOkP = ( (!seqselect.strandOfTip) || seqselect.strandOfTip == strandOfTip)
	    //console.log('strandOkP: ' + strandOkP + '  bpOfTip: ' + bpOfTip + '    strandOfTip: ' + strandOfTip)
	    if ( (strandOkP) &&
		 (bpOfTip)   &&
		 (typeof(aaPosGeneV[0]) != 'number') // Not in aa mode
	       ) {
		/// DNA sequence selection /////////////////////
		let dirCheckOK = true;
		if (seqselect.SeqSelectStatus == 'waitForStart') {
		    /* The direction enforcement was considered too restrictive...
		       let plusWrongDirP =  (seqselect.endBp) && (strandOfTip == '+') && (bpOfTip >= seqselect.endBp)
		       let minusWrongDirP = (seqselect.endBp) && (strandOfTip == '-') && (bpOfTip <= seqselect.endBp)
		       console.log('##waitForStart plusWrongDirP: ' + plusWrongDirP + '  minusWrongDirP: ' + minusWrongDirP)
		       if (plusWrongDirP || minusWrongDirP) {
		       if (plusWrongDirP) {
		       alert('The Start on the + strand needs to be to the left of the End')
		       dirCheckOK = false;
		       } else if (minusWrongDirP) {
		       alert('The Start on the - strand needs to be to the right of the End')
		       dirCheckOK = false;
		       } else {
		       dirCheckOK = true;
		       //console.log('##dirCheckOK 1.4: ' + dirCheckOK + '  set to true ')
		       }
		       } else
		       //console.log('##dirCheckOK 1.5: ' + dirCheckOK + ' startBp: ' + seqselect.startBp)
		       */
		    if (dirCheckOK) {
			seqselect.startBp = bpOfTip;
			gb.dom.controls.querySelector("#startbpvalue").innerHTML = bpFeedbackVal;
			gb.dom.controls.querySelector("#btnSelectstart").style.background="";
			seqselect.SeqSelectStatus = false;
		    }
		} else if (seqselect.SeqSelectStatus == 'waitForEnd') {
		    /* The direction enforcement was considered too restrictive...
		    //console.log('##dirCheckOK 1: ' + dirCheckOK + '  waitForEnd')
		    let plusWrongDirP =  (seqselect.startBp) && (strandOfTip == '+') && (bpOfTip <= seqselect.startBp)
		    let minusWrongDirP = (seqselect.startBp) && (strandOfTip == '-') && (bpOfTip >= seqselect.startBp)
		    console.log('##waitForEnd plusWrongDirP: ' + plusWrongDirP + '  minusWrongDirP: ' + minusWrongDirP)
		    if (plusWrongDirP || minusWrongDirP) {
		    if (plusWrongDirP) {
		    alert('The End on the + strand needs to be to the right of the Start')
		    dirCheckOK = false;
		    //console.log('##dirCheckOK 2: ' + dirCheckOK + '  set to false ')
		    } else if (minusWrongDirP) {
		    alert('The End on the - strand needs to be to the left of the Start')
		    dirCheckOK = false;
		    //console.log('##dirCheckOK 3: ' + dirCheckOK + ' strandOfTip: ' + strandOfTip)
		    } else {
		    dirCheckOK = true;
		    //console.log('##dirCheckOK 4: ' + dirCheckOK + '  set to true ')
		    }
		    } else
		    //console.log('##dirCheckOK 5: ' + dirCheckOK + ' startBp: ' + seqselect.startBp)
		    */
		    if (dirCheckOK) {
			seqselect.endBp = bpOfTip
			gb.dom.controls.querySelector("#endbpvalue").innerHTML = bpFeedbackVal
			gb.dom.controls.querySelector("#btnSelectend").style.background=""
			seqselect.SeqSelectStatus = false
		    }
		}
		seqselect.strandOfTip = strandOfTip
		seqselect.replicon = replicon
		this.OnSeqSelectMaybeActivateExport()
	    } else if ((aaPosGeneV)                        &&
		       (typeof(aaPosGeneV[0]) == 'number') &&
		       // Is the selection on the same gene, as the prior selection ?
		       (seqselectAma.proteinGeneObj ? (aaPosGeneV[1] == seqselectAma.proteinGeneObj) : true)
		      ) { // In aa mode
		/// AA sequence selection /////////////////////
		let [aaPos, proteinGeneObj] = aaPosGeneV
		//console.log('AA mode (OnMouseUp).  aaPosGeneV: ' + aaPosGeneV + '  uid: ' + proteinGeneObj.uid)
		//let aaSeqStr = replicon.geneAaSeqMap.get(proteinGeneObj.uid);
		let aaSeqStr = proteinGeneObj.aaSeq;		
		let aaSingleLetter = aaSeqStr[aaPos]
		let aaAbbrevStr = this.aaSingleLetterToAbbrevStr[aaSingleLetter]
		//console.log('AA mode (OnMouseUp).  aaPosGeneV: ' + aaPosGeneV + '  aa: ' + aaAbbrevStr)
		let aaFeedbackVal = '&nbsp;&nbsp;&nbsp;' + aaAbbrevStr + ' @ ' + parseInt(aaPos + 1).toLocaleString()
		if (waitForAaStartP) {
		    seqselectAma.startAA = aaPos
		    gb.dom.controls.querySelector("#startAAvalue").innerHTML = aaFeedbackVal
		    gb.dom.controls.querySelector("#btnSelectstartAA").style.background=""
		    seqselectAma.SeqSelectStatus = false
		} else if (waitForAaEndP) {
		    seqselectAma.endAA = aaPos
		    gb.dom.controls.querySelector("#endAAvalue").innerHTML = aaFeedbackVal
		    gb.dom.controls.querySelector("#btnSelectendAA").style.background=""
		    seqselectAma.SeqSelectStatus = false
		}
		seqselectAma.proteinGeneObj = proteinGeneObj
		seqselectAma.replicon = replicon
		this.OnSeqSelectMaybeActivateExportAA()
	    }
	}
    },
    
    /// Controls for DNA sequence selection //////////////////////

    // When clicking on the "Select Start" button in the seqselect dialog box
    OnSeqSelectStart()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect
	seqselect.SeqSelectStatus = 'waitForStart'
	//gb.dom.controls.querySelector("#btnSelectstart").style.background='#00CC00' //green
	gb.dom.controls.querySelector("#btnSelectstart").style.background='cyan'
	gb.dom.controls.querySelector("#btnSelectend").style.background=""
	//alert('OnSeqSelectStart: SeqSelectStatus = ' + seqselect.SeqSelectStatus)
    },

    // When clicking on the "Select End" button in the seqselect dialog box
    OnSeqSelectEnd()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect
	seqselect.SeqSelectStatus = 'waitForEnd'
	//gb.dom.controls.querySelector("#btnSelectend").style.background='#00CC00' //green
	gb.dom.controls.querySelector("#btnSelectend").style.background='cyan'
	gb.dom.controls.querySelector("#btnSelectstart").style.background=""
	//alert('OnSeqSelectEnd: SeqSelectStatus = ' + seqselect.SeqSelectStatus)
    },

    //kr:Nov-8-2023 When the Start and End bp values have been selected, then activate the Export controls
    OnSeqSelectMaybeActivateExport()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect
	let strandStr = (seqselect.strandOfTip == '-') ? 'bottom' : 'top';
	gb.dom.controls.querySelector("#strandStr").innerHTML = 'On the <b>' + strandStr + '</b> strand:&nbsp;'
	if ( (gb.dom.controls.querySelector("#startbpvalue").innerHTML != "&nbsp;") && (gb.dom.controls.querySelector("#endbpvalue").innerHTML != "&nbsp;")) {
	    gb.dom.controls.querySelector("#btnExportClipBoard").disabled = false
	    gb.dom.controls.querySelector("#btnExportFile").disabled = false
	    if (seqselect.replicon.circular == "T") gb.dom.controls.querySelector("#btnSelectWrapAround").disabled = false
	    // Circularity detection needed !
	    // The solution here is to let the user explicitly click on a wraparound button, if this is desired.
	    let wrapAroundP = (seqselect.wrapAroundP) ? seqselect.wrapAroundP : false  // A Boolean flag
	    // The length needs to include the endBp as well
	    //let lengthBp = (strandStr == "-") ? seqselect.startBp - (seqselect.endBp - 1) : 1 + seqselect.endBp - seqselect.startBp ;
	    //let startBp = (wrapAroundP) ? seqselect.endBp : seqselect.startBp
	    //let endBp   = (wrapAroundP) ? seqselect.startBp : seqselect.endBp
	    let startBp = seqselect.startBp;
	    let endBp   = seqselect.endBp;
	    let lengthBp =  false;
	    if (wrapAroundP) {
		// Wraparound involves swapping start with end, to extract the part of the sequence
		// that crosses the circle boundary.
		let lnLeftOfOrig = (startBp > endBp) ? seqselect.replicon.length - (startBp - 1): seqselect.replicon.length - (endBp - 1)
		let lnRightofOrig = (startBp > endBp) ? endBp : startBp
		lengthBp = lnLeftOfOrig + lnRightofOrig
	    } else {
		lengthBp = (startBp > endBp) ? startBp - (endBp - 1) : endBp - (startBp - 1)
	    }
	    //let lengthBp = (startBp > endBp) ? startBp - (endBp - 1) : endBp - (startBp - 1)
	    gb.dom.controls.querySelector("#totalLengthStr").innerHTML = 'Total length:'
	    gb.dom.controls.querySelector("#lengthbpvalue").innerHTML = parseInt(lengthBp).toLocaleString() + ' bp'
	}
    },

    //kr:Nov-30-2023 When the "Wrap Around?" button is pressed.  For circular replicons.
    OnSeqSelectWrapAround()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect
	let wrapAroundP = (seqselect.wrapAroundP) ? seqselect.wrapAroundP : false  // A Boolean flag
	let replicon = seqselect.replicon
	if (replicon.circular == "T") {
	    // Toggle
	    let newWrapAroundP = (wrapAroundP) ? false : true
	    seqselect.wrapAroundP = newWrapAroundP
	    if (newWrapAroundP) {
		gb.dom.controls.querySelector("#wrapP").innerHTML = '<font color="orange">Yes</font>'
		gb.dom.controls.querySelector("#wrapExpl").innerHTML = '<font color="orange">Cross Through Sequence Origin?</font>'
		gb.dom.controls.querySelector("#btnSelectWrapAround").style.background='orange'
	    } else {
		gb.dom.controls.querySelector("#wrapP").innerHTML = 'No'
		gb.dom.controls.querySelector("#wrapExpl").innerHTML = 'Cross Through Sequence Origin?'
		gb.dom.controls.querySelector("#btnSelectWrapAround").style.background=''
	    }
	    this.OnSeqSelectMaybeActivateExport()
	    // Redrawing changes the highlighted sequence region, accordingly:
	    GB.Draw(gb);
	}
    },
    
    // When clicking on the "Select Start" button in the seqselect dialog box
    OnSeqSelectClear()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect
	seqselect.SeqSelectStatus = false
	seqselect.startBp = false
	seqselect.endBp = false
	seqselect.strandOfTip = false
	seqselect.wrapAroundP = false
	gb.dom.controls.querySelector("#btnSelectstart").style.background=""
	gb.dom.controls.querySelector("#startbpvalue").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#btnSelectend").style.background=""
	gb.dom.controls.querySelector("#endbpvalue").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#strandStr").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#totalLengthStr").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#lengthbpvalue").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#btnExportClipBoard").disabled = true
	gb.dom.controls.querySelector("#btnExportFile").disabled = true
	gb.dom.controls.querySelector("#btnSelectWrapAround").disabled = true
	gb.dom.controls.querySelector("#wrapExpl").innerHTML = '<font color="black">Cross Through Sequence Origin?</font>'
	gb.dom.controls.querySelector("#wrapP").innerHTML = 'No'
	gb.dom.controls.querySelector("#btnSelectWrapAround").style.background=''
	// Redrawing removes the highlighted sequence region:
	GB.Draw(gb);
    },

    ///kr:Dec-5-2023 When this is called, the assumption is that a startBp and endBp
    // have already been selected.
    // Returns a string of DNA.
    extractSelectedDNAstr()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect

	let strand  = seqselect.strandOfTip
	let startBp = seqselect.startBp
	let endBp   = seqselect.endBp
	if ( ((strand == "+") && (startBp > endBp)) ||
	     ((strand == "-") && (endBp > startBp))
	   ) {
	    startBp = seqselect.endBp
	    endBp   = seqselect.startBp
	}
	let selectedSeqStr = false
	if (seqselect.wrapAroundP) {
	    // Switch them once more:
	    startBp = seqselect.endBp
	    endBp   = seqselect.startBp	
	    if (strand == "+") {
	      //console.log('strand: ' + strand + ' startBp: ' + startBp + ' endBp: ' + endBp)
	      if (endBp > startBp) {
		let seqLeftOfOrig  = this.DNAsubStr(endBp, seqselect.replicon.length, strand, seqselect.replicon)
		let seqRightOfOrig = this.DNAsubStr(1, startBp, strand, seqselect.replicon)
		selectedSeqStr = seqLeftOfOrig + seqRightOfOrig
	      } else {
		let seqLeftOfOrig  = this.DNAsubStr(startBp, seqselect.replicon.length, strand, seqselect.replicon)
		let seqRightOfOrig = this.DNAsubStr(1, endBp, strand, seqselect.replicon)
		selectedSeqStr = seqLeftOfOrig + seqRightOfOrig
	      }
	    } else if (strand == "-") {
	        //console.log('strand: ' + strand + ' startBp: ' + startBp + ' endBp: ' + endBp)
	        if (endBp > startBp) {
		    let seqLeftOfOrig  = this.DNAsubStr(seqselect.replicon.length, endBp, strand, seqselect.replicon)
		    //console.log('3 seqRightOfOrig (endBp > startBp): ')
		    let seqRightOfOrig = this.DNAsubStr(startBp, 1, strand, seqselect.replicon)
		    selectedSeqStr = seqRightOfOrig + seqLeftOfOrig // got swapped
		} else {
		    //console.log('4 seqRightOfOrig (startBp > endBp): ')
		    let seqLeftOfOrig  = this.DNAsubStr(seqselect.replicon.length, startBp, strand, seqselect.replicon)
		    //console.log('seqLeftOfOrig = ' + seqLeftOfOrig.substr(0, 30) )
		    let seqRightOfOrig = this.DNAsubStr(0, (endBp + 1), strand, seqselect.replicon)
		    //console.log('seqRightOfOrig = ' + seqRightOfOrig.substr(0, 30) )
		    selectedSeqStr = seqRightOfOrig + seqLeftOfOrig // got swapped
		}
	    }
	} else {
	    selectedSeqStr = this.DNAsubStr(startBp, endBp, strand, seqselect.replicon)
	}
	return selectedSeqStr;
    },

    ///kr:Nov-9-2023 When this is called, the assumption is that a startBp and endBp
    // have already been selected.
    OnSeqSelectExportClipBoard()
    {
	let selectedSeqStr = this.extractSelectedDNAstr()
	let DNAlen = selectedSeqStr.length
	let abbrevSeqStr = (DNAlen > 12) ? selectedSeqStr.substring(0, 5) + "..." + selectedSeqStr.substring(DNAlen - 5, DNAlen) : selectedSeqStr;
	let printableSeqStr = "5' " + abbrevSeqStr + " 3'"
	//console.log('seqselect.startBp : ' + seqselect.startBp)
	//console.log('seqselect.endBp : ' + seqselect.endBp)
	//console.log('seqselect.replicon : ' + seqselect.replicon)
	//console.log('selectedSeqStr : ' + selectedSeqStr)
	// Weird problem:  "Uncaught (in promise) DOMException: Document is not focused."
	//navigator.clipboard.writeText(selectedSeqStr)
	navigator.clipboard.writeText(selectedSeqStr).then(function(x) {
	    alert("Copied to clipboard: " + printableSeqStr);
	});
    },

    // For FireFox (and probably others) that have their file selection dialogs crippled.
    // This will save a file to the user's computer.  In Firefox, a popup with the download history
    // seems to automatically pop up, after the save is done.
    nonFileDialogDownload(fileName, fastaStr)
    {
	// From: https://stackoverflow.com/questions/11071473/how-can-javascript-save-to-a-local-file
	// (A) CREATE BLOB OBJECT
	let myBlob = new Blob([fastaStr], {type: "text/plain"});
	// (B) CREATE DOWNLOAD LINK
	let url = window.URL.createObjectURL(myBlob);
	let anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = fileName
	// (C) "FORCE DOWNLOAD"
	// NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
	// BETTER TO LET USERS CLICK ON THEIR OWN
	anchor.click();
	window.URL.revokeObjectURL(url);
	/// This caused the error in FireFox: Uncaught (in promise) DOMException: Node.removeChild: The node to be removed is not a child of this node
	///document.removeChild(anchor);
    },
    
    ///kr:Nov-17-2023 When this is called, the assumption is that a startBp and endBp
    // have already been selected.
    // That selected sequence is saved as a FASTA file format.
    // The user is first asked to choose a file (and directory).
    async OnSeqSelectExportFile()
    {
	let gb = GB.gb;
	let seqselect = gb.dom.seqselect;
	let leftBp  = (seqselect.startBp > seqselect.endBp) ? seqselect.endBp : seqselect.startBp
	let rightBp = (seqselect.startBp > seqselect.endBp) ? seqselect.startBp : seqselect.endBp
	let strand  = seqselect.strandOfTip
	let bpRegionStr = (strand == '-') ? '(complement' + '(' + leftBp + '..' + rightBp + '))  ' : '(' + leftBp + '..' + rightBp + ')  '
	let selectedSeqStr = this.extractSelectedDNAstr()
	//let DNAlen = selectedSeqStr.length
	// Found at: https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
	let seqLinesV = selectedSeqStr.match(/.{1,80}/g)
	//console.log('DNAlen = ' + DNAlen + ' seqLinesV len: ' + seqLinesV.length)
	let orgName = stripHtmlToText(seqselect.replicon.orgname)
	let fastaDeflineDNA = '>gnl|' + seqselect.replicon.orgid  + '|' + bpRegionStr + orgName + '\n'
	let fastaStr = fastaDeflineDNA + seqLinesV.join("\n") + '\n'
	if (typeof(window.showSaveFilePicker) == 'function') {
	    // From: https://stackoverflow.com/questions/11071473/how-can-javascript-save-to-a-local-file
	    const fileHandle = await window.showSaveFilePicker();
	    const fileStream = await fileHandle.createWritable();
	    await fileStream.write(new Blob([fastaStr], {type: "text/plain"}));
	    await fileStream.close();
	} else {
	    //alert('To be implemented: Export Fasta file: ' + fastaStr);
	    
	    ///kr:Dec-8-2023 For FireFox (and probably other browsers)
	    let fileName = seqselect.replicon.orgid + "-DNA-" + bpRegionStr + ".fsa"
	    this.nonFileDialogDownload(fileName, fastaStr)
	}
    },

    /// Controls for AA sequence selection //////////////////////

    // When selecting on the "Get Sequence" button:
    // This will pop up the seqselect ### dialog box for AA, after choosing it from the menu.
    OnAaSequence(evt)
    {
	let gb = GB.gb;
	let btn = gb.dom.btnSequence;
	let seqselectAma = gb.dom.seqselectAma;
	seqselectAma.style.right = "5px";
	seqselectAma.style.left = '';
	seqselectAma.style.top = btn.offsetTop + 20 + "px";
	SHOW(seqselectAma);
	HIDE(gb.dom.browseMenu);
	HIDE(gb.dom.legend);
	HIDE(gb.dom.qhelp);
	HIDE(gb.dom.seqselect);
	
	seqselectAma.querySelector(".fa-window-close").onclick = function() {
	    GBSeq.OnSeqSelectClearAA()
	    HIDE(seqselectAma);
	};
    },
    
    // When clicking on the "Select Start" button in the seqselect dialog box
    OnSeqSelectStartAA()
    {
	let gb = GB.gb;
	let seqselectAma = gb.dom.seqselectAma
	seqselectAma.SeqSelectStatus = 'waitForStart'
	gb.dom.controls.querySelector("#btnSelectstartAA").style.background='cyan'
	gb.dom.controls.querySelector("#btnSelectendAA").style.background=""
    },

    // When clicking on the "Select End" button in the seqselect dialog box
    OnSeqSelectEndAA()
    {
	let gb = GB.gb;
	let seqselectAma = gb.dom.seqselectAma
	seqselectAma.SeqSelectStatus = 'waitForEnd'
	gb.dom.controls.querySelector("#btnSelectendAA").style.background='cyan'
	gb.dom.controls.querySelector("#btnSelectstartAA").style.background=""
    },

    //kr:Nov-27-2023 When the Start and End AA values have been selected, then activate the Export controls
    OnSeqSelectMaybeActivateExportAA()
    {
	let gb = GB.gb;
	let seqselectAma = gb.dom.seqselectAma
	gb.dom.controls.querySelector("#AAproductNameStr").innerHTML = 'For:&nbsp;&nbsp;<b>' + seqselectAma.proteinGeneObj.name + '</b>&nbsp;'
	if ( (gb.dom.controls.querySelector("#startAAvalue").innerHTML != "&nbsp;") && (gb.dom.controls.querySelector("#endAAvalue").innerHTML != "&nbsp;")) {
	    gb.dom.controls.querySelector("#btnExportClipBoardAA").disabled = false
	    gb.dom.controls.querySelector("#btnExportFileAA").disabled = false
	    // ### circularity detection needed !
	    // The length needs to include the endAA as well
	    let startAA = seqselectAma.startAA
	    let endAA   = seqselectAma.endAA
	    let lengthAA = (endAA < startAA) ? startAA - (endAA - 1) : 1 + endAA - startAA ;
	    gb.dom.controls.querySelector("#totalLengthStrAA").innerHTML = 'Total length:'
	    gb.dom.controls.querySelector("#lengthAAvalue").innerHTML = parseInt(lengthAA).toLocaleString()
	}
    },

    // When clicking on the "Select Start" button in the seqselect dialog box
    OnSeqSelectClearAA()
    {
	let gb = GB.gb;
	let seqselectAma = gb.dom.seqselectAma
	seqselectAma.SeqSelectStatus = false
	seqselectAma.startAA = false
	seqselectAma.endAA = false
	seqselectAma.proteinGeneObj = false
	gb.dom.controls.querySelector("#btnSelectstartAA").style.background=""
	gb.dom.controls.querySelector("#startAAvalue").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#btnSelectendAA").style.background=""
	gb.dom.controls.querySelector("#endAAvalue").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#AAproductNameStr").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#totalLengthStrAA").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#lengthAAvalue").innerHTML = '&nbsp;'
	gb.dom.controls.querySelector("#btnExportClipBoardAA").disabled = true
	gb.dom.controls.querySelector("#btnExportFileAA").disabled = true
	// Redrawing removes the highlighted sequence region:
	GB.Draw(gb);
    },

    ///kr:Nov-27-2023 When this is called, the assumption is that a startAA and endAA
    // have already been selected.
    OnSeqSelectExportClipBoardAA()
    {
	let gb = GB.gb;
	let seqselectAma = gb.dom.seqselectAma
	// ### circularity detection needed !
	// The length needs to include the endAA as well
	let startAA  = seqselectAma.startAA
	let endAA    = seqselectAma.endAA
	let uid = seqselectAma.proteinGeneObj.uid
	// The seq. A string of single-letter AA codes:
	//let aaSeqStr = seqselectAma.replicon.geneAaSeqMap.get(uid);
	let aaSeqStr = seqselectAma.proteinGeneObj.aaSeq;
	let selectedAaSeqStr = (endAA < startAA) ? aaSeqStr.substring(endAA, startAA + 1) : aaSeqStr.substring(startAA, endAA + 1)
	let lengthAA = selectedAaSeqStr.length
	let abbrevSeqStr = (lengthAA > 12) ? selectedAaSeqStr.substring(0, 5) + "..." + selectedAaSeqStr.substring(lengthAA - 5, lengthAA) : selectedAaSeqStr;
	let printableSeqStr = abbrevSeqStr
	// Weird problem:  "Uncaught (in promise) DOMException: Document is not focused."
	//navigator.clipboard.writeText(selectedSeqStr)
	navigator.clipboard.writeText(selectedAaSeqStr).then(function(x) {
	    alert("Copied to clipboard: " + printableSeqStr);
	});
    },

    ///kr:Nov-27-2023 When this is called, the assumption is that a startAA and endAA
    // have already been selected.
    // That selected sequence is saved as a FASTA file format.
    // The user is first asked to choose a file (and directory).
    async OnSeqSelectExportFileAA()
    {
	let gb = GB.gb;
	let seqselectAma = gb.dom.seqselectAma
	// ### circularity detection needed !
	// The length needs to include the endAA as well
	let startAA  = seqselectAma.startAA
	let endAA    = seqselectAma.endAA
	let uid = seqselectAma.proteinGeneObj.uid
	// The seq. A string of single-letter AA codes:
	//let aaSeqStr = seqselectAma.replicon.geneAaSeqMap.get(uid);
	let aaSeqStr = seqselectAma.proteinGeneObj.aaSeq;
	let selectedAaSeqStr = (endAA < startAA) ? aaSeqStr.substring(endAA, startAA + 1) : aaSeqStr.substring(startAA, endAA + 1)
	// Found at: https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
	let seqLinesV = selectedAaSeqStr.match(/.{1,80}/g)
	let proteinGeneObj = seqselectAma.proteinGeneObj
	let orgName = stripHtmlToText(seqselectAma.replicon.orgname)
	let aaRegionStr = '(positions ' + (startAA + 1) + ' to ' + (endAA + 1) + ')'
	let fastaDeflineAA = '>gnl|' + seqselectAma.replicon.orgid  + '|' + uid + ' gn=' + proteinGeneObj.name + ' ' + proteinGeneObj.pname  + ' ' + aaRegionStr + ' ' + orgName + '\n'
	let fastaStr = fastaDeflineAA + seqLinesV.join("\n") + '\n'
	if (typeof(window.showSaveFilePicker) == 'function') {
	    // From: https://stackoverflow.com/questions/11071473/how-can-javascript-save-to-a-local-file
	    const fileHandle = await window.showSaveFilePicker();
	    const fileStream = await fileHandle.createWritable();
	    await fileStream.write(new Blob([fastaStr], {type: "text/plain"}));
	    await fileStream.close();
	} else {
	    //alert('To be implemented: Export Fasta file: ' + fastaStr);
	    
	    ///kr:Dec-8-2023 For FireFox (and probably other browsers)
	    let fileName = seqselectAma.replicon.orgid + '-' + uid + '-' + proteinGeneObj.name + "-" + aaRegionStr + "-AA-" + ".fsa"
	    this.nonFileDialogDownload(fileName, fastaStr)
	}
    },

    OnCloseDna()
    {
	this.OnSeqSelectClear()
    },
    
    OnCloseAma()
    {
	//console.log("oncloseAma", this);
	this.OnSeqSelectClearAA()
    },

    reverseComplementDNAstr(DNAstr)
    {
	let complementDNAstr = '';
	for (let i = DNAstr.length - 1; i >= 0; i--)
	    complementDNAstr += this.baseComplements[ DNAstr[i] ];
	return complementDNAstr;
    },

    ///kr:Nov-9-2023 Returns a DNA sequence string from startBp to endBp, inclusive.
    /// The sequence is extracted from the cached sequence of the full-length replicon.
    /// startBp and endBp are positive integers.
    /// strand is either "+" or "-" .  When it is "-", endBp is smaller than startBp .
    /// replicon is a GB replicon datastructure.
    ///

    DNAsubStr(startBp, endBp, strand, replicon)
    {
	console.log('DNAsubStr() startBp: ' + startBp + '    endBp: ' + endBp + '   strand: ' + strand)
	if (!replicon.dnaSeq) {
	    //console.log('in DNAsubseq , replicon.dnaSeq is empty')
	} else {
	    // The sequence needs to include the endBp as well.
	    // If the strand is "-", the endBp is located left of the startBp
	    let rawSeq = [];
	    if ((strand == "-")) {
		for(let s = endBp; s <= startBp; s++) {
		    if (!replicon.dnaSeq || !replicon.dnaSeq[s])
			return "";
		    rawSeq.push(replicon.dnaSeq[s]);
		}
	    } else {
		for(let s = startBp; s <= endBp; s++) {
		    if (!replicon.dnaSeq || !replicon.dnaSeq[s])
			return "";
		    rawSeq.push(replicon.dnaSeq[s]);
		}
	    }		
	    let rawSeqStr = rawSeq.join("");
	    let seqStr = (strand == "-") ? this.reverseComplementDNAstr(rawSeqStr)  : rawSeqStr ;
	    return seqStr;
	}
    },
};
