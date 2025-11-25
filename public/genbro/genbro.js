"use strict";

/// Copyright (C) 2023-2024 by SRI International.  All rights reserved.

var GB = {
	version: 18.7,

	icon: {},

	gb: null, //assumes only one genbro per page

	OnLoad() {

		this.ptools = parent != window.self ? parent : '';
		console.log("GB", this.version, this.ptools ? "embedded" : "");
		if (this.ptools) {
			console.log("ptools", this.ptools);
			document.body.style.overflow = "hidden";
			let iframe = parent.document.querySelector(".genbro-iframe");
			if (iframe) {
				iframe.style.width = "calc(100vw - 20px)";
				iframe.style.height = "100vh"; //adjusted in AdjustGenbroIframe()
				iframe.style.borderWidth = "0px";
				iframe.parentNode.style.padding = "0px"; //pageContentDynamic
				/*
						var styles = parent.document.createElement('link');
						styles.rel = 'stylesheet';
						styles.type = 'text/css';
						styles.media = 'screen';
						styles.href = 'genbro-iframe.css';
						parent.document.getElementsByTagName('head')[0].appendChild(styles);
				*/
				this.ptools.GB = this;
				parent.postMessage("Genbro Ready", "*");
				//console.log("iframe on ready", iframe.onready);
				//call parent's onready function ie. comparativeGenbro
				//iframe.onready(this);
				iframe.contentWindow.focus();
				parent.addEventListener("load", MinimizeBioCycHeader);

				//hack to keep scrollbar visible
				let win = iframe.contentWindow.parent;
				setInterval(() => {
					win.scrollTo(0, win.scrollY + 1);
					win.scrollTo(0, win.scrollY - 1);
				}, 500);
			}
		} else {
			MinimizeBioCycHeader();
		}

		this.CreateHashFill();

		this.init = true;
	},

	async Load(gb) {
		this.gb = gb;

		gb.dom = {};
		gb.dom.controls = document.querySelector(".gbControl");

		//embedded?
		if (this.ptools)
			gb.divId = "gbBrowser";

		if (!gb.divId || !(gb.dom.genbro = document.querySelector("#" + gb.divId))) {
			alert("GB: invalid divID ", gb.divId);
			return;
		}
		gb.dom.genbro.classList.add("gb");
		gb.speed = 10;
		gb.mouse = {
			mx0: 0,
			my0: 0,
			shift: 0,
			drag: 0,
			move: 0,
			zoom: 0,
			tsWheel: 0,
		};
		gb.isCmpBro = gb.replicon.length > 1;
		if (!gb.host)
			gb.host = "";

		await this.InitControls(gb);

		if (gb.hasBaseline) {
			this.InitBaseline(gb);
		}

		let scroller = document.createElement('div');
		scroller.classList.add("gbScroller");
		if (gb.hasBaseline)
			scroller.classList.add("hasBaseline");
		gb.dom.genbro.appendChild(scroller);
		gb.dom.scroller = scroller;

		this.InitLegend(gb);

		if (gb.isCmpBro) {
			SHOW(gb.dom.busy);
			gb.orthos = await this.Orthos.Load(gb);
			HIDE(gb.dom.busy);
			if (!gb.orthos) {
				alert("failed to load orthologs");
				return;
			}
			//Sets center gene of all replicons.
			//Also initialize replicon chromosome field	    
			this.Orthos.Align(gb, gb.replicon[0].centerGene);
		}

		let query = [];
		for (let replicon of gb.replicon) {
			query.push(this.InitReplicon(gb, replicon));
		}

		if (gb.isCmpBro) {
			for (let r = 0; r < gb.replicon.length; r++) {
				let title = gb.replicon[r].title;
				let cmpbro = title.parentElement;
				cmpbro.id = r;
				cmpbro.classList.add("gbCmpBro");
				title.onpointerenter = this.OnCmpBroDrag.bind(this);
				title.onpointerleave = this.OnCmpBroDrag.bind(this);
				title.onpointerdown = this.OnCmpBroDrag.bind(this);
				title.onpointerup = this.OnCmpBroDrag.bind(this);
				title.onwheel = this.OnCmpBroDrag.bind(this);
			}
		}

		await Promise.all(query);

		this.InitHTMLText(gb);

		GBTracks.Init(gb);

		GBSeq.Init();

		this.OnResize();

		if (gb.orthos)
			this.Orthos.Update(gb);

		setTimeout(() => {
			AdjustGenbroIFrame();
			this.CenterReplicons(gb);
			this.UpdateTitles(gb);
			this.Draw(gb);
		}, 10);

		//this.RestoreFilters();

		document.addEventListener("keydown", this.OnKey.bind(this));

		//back button?
		if (performance.navigation.type == window.performance.navigation.TYPE_BACK_FORWARD || location.host == "localhost")
			this.RestoreState();

		this.WelcomeTip();
		this.CenterReplicons(gb);
		this.UpdateTitles(gb);
		this.Draw(gb);
		this.MarkBase0();

		return gb;
	},

	async InitControls(gb) {

		if (!gb.dom.controls) {
			//genbro not included as an iframe. dynamically load gbcontrol.html
			let html = document.createElement("html");
			html.innerHTML = await FetchFile("gbControls.html");
			let controls = html.querySelector(".gbControl");
			if (!html.innerHTML || !controls) {
				alert("gbControls.html load failed");
				return false;
			}

			gb.dom.controls = document.createElement("div");
			gb.dom.controls.innerHTML = controls.innerHTML;
			gb.dom.controls.classList.add("gbControl");
			gb.dom.genbro.appendChild(gb.dom.controls);
		}

		if (gb.hasControls)
			SHOW(gb.dom.controls);

		gb.dom.popup = gb.dom.controls.querySelector(".gbtooltip");

		let levels = gb.dom.controls.querySelectorAll(".zoomlevels span");
		for (let level of levels)
			level.onclick = this.OnZoomLevel.bind(this);

		gb.dom.search = gb.dom.controls.querySelector(".searchBox");
		gb.dom.search.onchange = this.OnSearch.bind(this);
		gb.dom.search.onfocus = this.OnSearchInit.bind(this);
		gb.dom.search.oninput = this.OnSearchInput.bind(this);
		gb.dom.searchDropdown = gb.dom.controls.querySelector(".searchDropdown");
		gb.dom.searchDropdown.onscroll = OnLazyScroll;
		gb.dom.searchGenes = gb.dom.searchDropdown.querySelector(".searchGenes");

		gb.dom.play = gb.dom.controls.querySelector("#play");
		gb.dom.play.onclick = this.OnPlay.bind(this);

		gb.dom.speedbar = gb.dom.controls.querySelector(".speedBar");
		gb.dom.speed = gb.dom.controls.querySelector("#speed");
		gb.dom.speed.onmousemove = this.OnSpeed.bind(this);

		gb.dom.speedPos = gb.dom.speed.querySelector(".fa-caret-up");
		gb.dom.speedVel = gb.dom.speed.querySelector("#speedVel");

		gb.dom.btnBrowse = gb.dom.controls.querySelector("#browse");
		gb.dom.btnBrowse.onclick = this.OnPopup.bind(this);
		gb.dom.browseMenu = gb.dom.controls.querySelector(".browseMenu");
		gb.dom.btnBrowse.popup = gb.dom.browseMenu;
		gb.dom.newCmpDlg = gb.dom.controls.querySelector(".newCmpDlg");

		gb.dom.btnSequence = gb.dom.controls.querySelector("#seqselect");
		gb.dom.btnSequence.onclick = this.OnPopup.bind(this);
		gb.dom.seqselectMenu = gb.dom.controls.querySelector(".seqselectMenu");
		gb.dom.btnSequence.popup = gb.dom.seqselectMenu;

		gb.dom.btnSeqSelectDNA = gb.dom.controls.querySelector("#seqselectDNA");
		gb.dom.btnSeqSelectDNA.onclick = this.OnPopup.bind(this);
		gb.dom.seqselect = gb.dom.controls.querySelector(".seqselect");
		gb.dom.seqselect.onright = true;
		gb.dom.seqselect.onclose = GBSeq.OnCloseDna.bind(GBSeq);
		gb.dom.btnSeqSelectDNA.popup = gb.dom.seqselect;

		gb.dom.btnSeqSelectAA = gb.dom.controls.querySelector("#seqselectAA");
		gb.dom.btnSeqSelectAA.onclick = this.OnPopup.bind(this);
		gb.dom.seqselectAma = gb.dom.controls.querySelector(".seqselectAma");
		gb.dom.seqselectAma.onright = true;
		gb.dom.seqselectAma.onclose = GBSeq.OnCloseAma.bind(GBSeq);
		gb.dom.btnSeqSelectAA.popup = gb.dom.seqselectAma;

		gb.dom.btnLegend = gb.dom.controls.querySelector("#legend");
		gb.dom.btnLegend.onclick = this.OnPopup.bind(this);
		gb.dom.legend = gb.dom.controls.querySelector(".legend");
		gb.dom.legend.onright = true;
		gb.dom.btnLegend.popup = gb.dom.legend;

		gb.dom.btnQHelp = gb.dom.controls.querySelector("#qhelp");
		gb.dom.btnQHelp.onclick = this.OnPopup.bind(this);
		gb.dom.qhelp = gb.dom.controls.querySelector(".qhelp");
		gb.dom.btnQHelp.popup = gb.dom.qhelp;

		gb.dom.marker = document.querySelector(".fa-map-marker-alt");
		gb.dom.welcome = document.querySelector(".gbWelcome");
		gb.dom.busy = gb.dom.controls.querySelector(".busy");

		gb.dom.cmpDrag = gb.dom.controls.querySelector(".gbCmpDrag");

		// load help menu content asynchronous
		FetchFile("https://brg-preview.ai.sri.com/help.html?object=genome-browser-brief")
			.then(content => gb.dom.qhelp.querySelector("#quickhelpcontent").innerHTML = content);
	},

	InitBaseline(gb) {
		let canvas = document.createElement("canvas");
		canvas.classList.add("gbBaseline");
		gb.baseline = {
			canvas: canvas,
			ctx: canvas.getContext('2d')
		};
		gb.dom.genbro.appendChild(canvas);

		canvas.onmousedown = this.OnMouseBaseline.bind(this);
		canvas.onmouseup = this.OnMouseBaseline.bind(this);
		canvas.onmousemove = this.OnMouseBaseline.bind(this);
	},

	async InitReplicon(gb, replicon) {
		let div = document.createElement("div");
		gb.dom.scroller.appendChild(div);

		let title = document.createElement("div");
		title.classList.add("gbRepliconTitle");
		title.innerHTML = "Loading..." + replicon.orgid + " " + (replicon.chromosome ? replicon.chromosome : '');
		title.replicon = replicon;
		div.appendChild(title);
		replicon.title = title;

		replicon.canvas = document.createElement("canvas");
		replicon.canvas.classList.add('gbReplicon');
		replicon.ctx = replicon.canvas.getContext('2d');
		replicon.ctx.font = "30px Arial";
		if (gb.isCmpBro) {
			replicon.height = "80px";
			replicon.canvas.style.height = replicon.height;
		}
		replicon.canvas.classList.add('replicon');
		replicon.canvas.replicon = replicon;
		div.appendChild(replicon.canvas);

		this.OnResize();

		// this.InitToolTips(replicon);

		replicon.canvas.onwheel = this.OnWheel.bind(this);
		replicon.canvas.onmousedown = this.OnMouseDown.bind(this);
		replicon.canvas.onmouseup = this.OnMouseUp.bind(this);
		replicon.canvas.onmousemove = this.OnMouseMove.bind(this);
		this.InitTouchHandlers(replicon.canvas);

		//default view
		replicon.view = {
			scale: 10,
			base0: 0,
			x0: 0,
			y0: 0,
			width: replicon.canvas.width / this.scaleDevice - 40,
			height: replicon.canvas.height / this.scaleDevice,
			dir: 1 //flipped in CenterReplicons()
		};
		if (gb.debugSeq)
			replicon.view.scale = .1;

		replicon.bboxes = [];
		replicon.htmlText = [];

		await this.LoadReplicon(replicon); //*****************拿到数据后使用canvas进行渲染

		return;
	},

	async Draw(gb) {
		let t0 = performance.now();

		if (gb.baseline && !gb.baseline.canvas)
			return;

		this.UpdateSemZoom();

		for (let replicon of gb.replicon) {
			if (!replicon.init)
				continue;
			let canvas = replicon.canvas;
			let ctx = replicon.ctx;
			let width = (canvas.width / this.scaleDevice) - 40;
			let height = canvas.height / this.scaleDevice;
			let nlines = (gb.isCmpBro || gb.hasTracks) ? 1 : Math.ceil(height / 70);
			if (nlines == 1)
				replicon.view.y0 = 60;

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.scale(this.scaleDevice, this.scaleDevice);
			ctx.translate(20, 0);

			replicon.bboxes.length = 0;

			if (gb.isCmpBro && replicon != gb.replicon[0] && !replicon.gene0)
				continue;

			gb.linegap = gb.semzoom == 'sequence' ? 100 : 70;

			this.DrawAxes(gb, replicon, width, height);

			if (gb.semzoom == 'sequence')
				ctx.translate(0, -35);

			if (replicon.insertions && gb.filters.insertion.enabled)
				this.DrawInsertions(gb, replicon);

			if (replicon.operons && gb.filters.operon.enabled)
				this.DrawOperons(gb, replicon);

			if (replicon.genes)
				this.DrawGenes(gb, replicon);

			if (replicon.promoters && gb.filters.promoter.enabled)
				this.DrawPromoters(gb, replicon);

			if (replicon.terminators && gb.filters.terminator.enabled)
				this.DrawTerminatorsAttenuators(gb, replicon, 'T');

			if (replicon.attenuators && gb.filters.attenuator.enabled)
				this.DrawTerminatorsAttenuators(gb, replicon, 'A');

			if (replicon.transcriptions && gb.filters.tfbs.enabled)
				this.DrawTranscriptions(gb, replicon);

			if (replicon.mRNAs && gb.filters.mrna.enabled)
				this.DrawMRNAs(gb, replicon);

			if (replicon.extragenics && gb.filters.extragenic.enabled)
				this.DrawExtraGenics(gb, replicon);

			if (replicon.rbs && gb.filters.rbs.enabled)
				this.DrawRBS(gb, replicon);

			if (gb.semzoom == 'sequence') {
				for (let bbox of replicon.bboxes)
					bbox.y -= 35;
				ctx.translate(0, 35);
				GBSeq.Draw(gb, replicon);
			}
		}

		if (gb.hasBaseline)
			this.DrawBaseline(gb);

		if (gb.hasTracks)
			GBTracks.Draw(gb);

		return;
	},

	UpdateSemZoom() {
		let gb = this.gb
		let replicon = gb.replicon[0];
		if (!replicon || !replicon.view)
			return "genes";

		let view = replicon.view;
		let nlines = parseInt(view.height / 70); // fix this
		let maxpixels = nlines * view.width;
		let maxscale = Math.ceil(replicon.length / maxpixels);
		let semzoom = null;
		if (view.scale >= 1000 || view.scale >= maxscale)
			semzoom = "genome";
		else if (view.scale >= 50)
			semzoom = "operons";
		else if (view.scale >= 15)
			semzoom = "genes";
		else if (view.scale > .1)
			semzoom = "sites";
		else
			semzoom = "sequence";

		if (semzoom == gb.semzoom)
			return;

		gb.semzoom = semzoom;

		let levels = gb.dom.controls.querySelectorAll(".zoomlevels span");
		for (let level of levels) {
			if (level.id == gb.semzoom)
				level.classList.add("active");
			else
				level.classList.remove("active");
		}

		for (let f in gb.filters)
			gb.filters[f].enabled = true;

		switch (gb.semzoom) {
			case "genome":
			case "operons":
			case "genes":
				gb.filters.promoter.enabled = false;
				gb.filters.terminator.enabled = false;
				gb.filters.attenuator.enabled = false;
				gb.filters.tfbs.enabled = false;
				gb.filters.mrna.enabled = false;
				gb.filters.extragenic.enabled = false;
				gb.filters.rbs.enabled = false;
		}
		for (let f in gb.filters) {
			if (gb.filters[f].state == 'on')
				gb.filters[f].enabled = true;
			else if (gb.filters[f].state == 'off')
				gb.filters[f].enabled = false;
			if (gb.filters[f].enabled)
				gb.filters[f].label.classList.remove("disabled");
			else
				gb.filters[f].label.classList.add("disabled");
		}
	},

	DrawAxes(gb, replicon, width, height, nlines) {
		let view = replicon.view;
		view.width = width;
		view.height = height;
		if (gb.semzoom == 'sequence') {
			view.basesPerTick = 1;
			view.basesPerTick10 = 10;
			view.basesPerPixel = .1;
			view.pixelsPerTick = 10;
			view.scale = .1;
			width = parseInt(width / 10) * 10;
			view.basesPerRow = view.width * view.scale;
		} else {
			view.basesPerRow = view.width * view.scale;
			view.basesPerTick10 = this.TickGap(view.basesPerRow, view.width);
			view.basesPerTick = view.basesPerTick10 / 10;
			view.basesPerPixel = view.basesPerRow / view.width;
			view.pixelsPerTick = view.basesPerTick / view.basesPerPixel;
		}

		let x0 = view.x0;
		let y0 = view.y0;
		let b0 = view.base0;
		let dir = view.dir;
		let dh = 4;
		let ticks = 0;
		let ctx = replicon.ctx;
		let canvas = replicon.canvas;
		ctx.save();

		if (y0 < 0) {
			let dy = -parseInt((y0 - 60) / gb.linegap);
			y0 += dy * gb.linegap;
			b0 += view.basesPerRow * dy;
		} else if (y0 > height) {
			let dy = parseInt((height - y0 - 60) / gb.linegap);
			y0 += dy * gb.linegap;
			b0 += view.basesPerRow * dy;
		}
		let b00 = b0;
		b0 = parseInt(b0 / view.basesPerTick) * view.basesPerTick;
		b0 = parseInt(b0 / view.basesPerTick10) * view.basesPerTick10;
		x0 = x0 - (b00 - b0) * dir / view.basesPerPixel;
		while (x0 <= 0) {
			x0 += view.pixelsPerTick * 10;
			b0 += view.basesPerTick10 * dir;
		}
		while (x0 > width) {
			x0 -= view.pixelsPerTick * 10;
			b0 -= view.basesPerTick10 * dir;
		}

		while (b0 < 0)
			b0 += replicon.length;
		while (b0 >= replicon.length)
			b0 -= replicon.length;

		if (gb.semzoom == 'sequence')
			x0 = parseInt(x0 / view.pixelsPerTick) * view.pixelsPerTick;

		/*
			ctx.strokeStyle = "#ff0000";
			ctx.beginPath();
			ctx.moveTo(view.x0, view.y0-10);
			ctx.lineTo(view.x0, view.y0+10);
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = "#ff00ff";	
			ctx.moveTo(x0, view.y0-20);
			ctx.lineTo(x0, view.y0+10);
			ctx.stroke();
		*/
		ctx.strokeStyle = "#808080";
		ctx.fillStyle = "#808080";
		ctx.lineWidth = 1;
		ctx.beginPath();

		let axes = [];
		let b = b0;
		let x = x0;
		let y = y0;
		while (y >= 0) {
			let axis = null;
			while (x >= 0) {
				if (!axis) {
					axis = {
						y1: y - gb.linegap,
						y2: y,
						x1: x,
						x2: x,
						b1: b,
						b2: b,
						ticks: [],
					};
				}
				axis.x1 = x;
				axis.b1 = b;
				if (ticks % 5 == 0) {
					ctx.moveTo(x, y);
					ctx.lineTo(x, y + dh * 2);
					if (ticks % 10 == 0) {
						let num = parseInt(b).toLocaleString();
						let tx = ctx.measureText(num).width / 2;
						ctx.fillText(num, x - tx, y + dh * 4);
					}
				} else {
					ctx.moveTo(x, y);
					ctx.lineTo(x, y + dh);
				}
				axis.ticks.push(b);
				ticks++;
				b -= view.basesPerTick * dir;
				x -= view.pixelsPerTick;

				if (b < 0) {
					b = replicon.length;
					x += view.pixelsPerTick * dir;
					let b1 = parseInt(b / view.basesPerTick) * view.basesPerTick;
					let b2 = parseInt(b1 / view.basesPerTick10) * view.basesPerTick10;
					x = x - (b - b1) / view.basesPerPixel * dir;
					b = b1;
					ticks = 10 - (b1 - b2) / view.basesPerTick;
					if (ticks % 10 == 0) {
						ticks = 1;
						b -= view.basesPerTick * dir;
						x -= view.pixelsPerTick * dir;
					}
					/*jah*/
					axis.x2 = x;
					axis.b2 = b;
					axes.push(axis);
					axis = {
						y1: y - gb.linegap,
						y2: y,
						x1: x,
						x2: x,
						b1: b,
						b2: b,
						ticks: [],
					};
				}
			}
			x += width;
			y -= gb.linegap;
			if (axis)
				axes.push(axis);
		}

		b = b0; // + basesPerTick * dir;
		x = x0; // + pixelsPerTick;
		y = y0
		ticks = 0;
		while (y < height) {
			let axis = null;
			while (x <= width) {
				if (!axis) {
					axis = axes.find(a => a.y2 == y);
					if (!axis) {
						axis = {
							y1: y - gb.linegap,
							y2: y,
							x1: x,
							x2: x,
							b1: b,
							b2: b,
							ticks: [],
						};
					}
				}
				axis.x2 = x;
				axis.b2 = b;
				if (ticks % 5 == 0) {
					ctx.moveTo(x, y);
					ctx.lineTo(x, y + dh * 2);
					if (ticks % 10 == 0) {
						let num = parseInt(b).toLocaleString();
						let tx = ctx.measureText(num).width / 2;
						ctx.fillText(num, x - tx, y + dh * 4);
					}
				} else {
					ctx.moveTo(x, y);
					ctx.lineTo(x, y + dh);
				}
				axis.ticks.push(b);
				ticks++;
				b += view.basesPerTick * dir;
				x += view.pixelsPerTick;
				if (b > replicon.length) { //fix this
					b -= replicon.length;
					x += view.pixelsPerTick * dir;
					let b1 = parseInt(b / view.basesPerTick) * view.basesPerTick;
					let b2 = parseInt(b1 / view.basesPerTick10) * view.basesPerTick10;
					x = x - (b - b1) / view.basesPerPixel * dir;
					b = b1;
					ticks = 10 - (b1 - b2) / view.basesPerTick;
					if (ticks % 10 == 0) {
						ticks = 1;
						b -= view.basesPerTick * dir;
						x -= view.pixelsPerTick * dir;
					}
				}

			}
			x -= width;
			y += gb.linegap;
			if (axis && axis != axes[0])
				axes.push(axis);
		}


		for (let axis of axes) {
			if (!gb.isCmpBro && !gb.hasTracks) { //fix this!
				axis.b1 -= parseInt(axis.x1 * view.basesPerPixel * dir);
				while (axis.b1 < 0)
					axis.b1 += replicon.length;
				axis.x1 = 0;
				axis.b2 += parseInt((width - axis.x2) * view.basesPerPixel * dir);
				while (axis.b2 > replicon.length)
					axis.b2 -= replicon.length;
				axis.x2 = width;
			}
			ctx.moveTo(axis.x1, axis.y2);
			ctx.lineTo(axis.x2, axis.y2);

			if (gb.semzoom == 'sequence') {
				ctx.moveTo(axis.x1, axis.y2);
				ctx.lineTo(axis.x1, axis.y2 + dh * 2);
			}

			axis.baseMin = axis.b1;
			axis.baseMax = axis.b2;
		}
		ctx.stroke();
		view.axes = axes;

		if (!gb.isCmpBro) { //fix this!
			for (let axis of axes) {
				if (axis.b1 > axis.b2) {
					if (view.dir != 1)
						console.log("debug splitting flipped axis");
					let x = (replicon.length - axis.b1) / view.basesPerPixel * view.dir;
					let newaxis = {
						y1: axis.y1,
						y2: axis.y2,
						x1: x,
						x2: axis.x2,
						b1: 0,
						b2: axis.b2,
						baseMin: 0,
						baseMax: axis.b2
					};
					axes.push(newaxis);
					axis.x2 = x;
					axis.b2 = replicon.length;
					axis.baseMax = replicon.length;
					//console.log("split", x, newaxis.b1, newaxis.b2, axis.b1, axis.b2);
					if (axes.length > 20) {
						console.log("axis error!", axes);
						break;
					}
				}
			}
			let index = [];
			for (let axis of axes)
				index.push(axis);
			index.sort((a, b) => {
				return Number(a.y1 - b.y1);
			});
			axes = [];
			for (let a = 0; a < index.length; a++)
				axes[a] = index[a];
			view.axes = axes;

			//fix this
			axes = [];
			for (let old of view.axes) {
				let dup = false;
				for (let axis of axes) {
					if (old.baseMin == axis.baseMin &&
						old.baseMax == axis.baseMax) {
						console.log("dup", old)
						dup = true;
						break;
					}
				}
				if (dup)
					continue;

				let axis = JSON.stringify(old);
				axes.push(axis);
			}
			view.axes = [];
			for (let a of axes)
				view.axes.push(JSON.parse(a));
		}

		if (gb.isCmpBro && replicon == gb.replicon[0] && gb.mouse.shift) {
			ctx.strokeStyle = "#FF0000";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(view.width / 2, y0);
			ctx.lineTo(view.width / 2, y0 + 10);
			ctx.stroke();
		}

		/*
	ctx.strokeStyle = "#FF0000";
	for(let axis of view.axes)
		ctx.strokeRect(axis.x1, axis.y1, axis.x2-axis.x1, axis.y1-axis.y2);
		console.log(view.axes);
	   */
		ctx.restore();

		return;
	},

	TickGap(range, pixels) {
		let dx = pixels / range;
		for (let s = 10; s < range; s *= 10) {
			if (dx * s > 100) return s;
			else if (dx * s * 2 > 100) return s * 2;
			else if (dx * s * 5 > 100) return s * 5;
		}
	},

	DrawBaseline(gb) {
		if (!gb.baseline)
			return;
		let canvas = gb.baseline.canvas;
		let ctx = gb.baseline.ctx;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.scale(this.scaleDevice, this.scaleDevice);
		ctx.translate(10, 20);

		let replicon = gb.replicon[0];
		if (!replicon)
			return;
		let view = gb.replicon[0].view;
		if (!view || !view.axes)
			return;

		let basesPerTick10 = this.TickGap(replicon.length, view.width);
		let basesPerTick = basesPerTick10 / 10;
		let basesPerPixel = replicon.length / view.width;
		let pixelsPerTick = basesPerTick / basesPerPixel;

		/*
		console.log("length", replicon.length);
		console.log("basesPerTick10", basesPerTick10);
		console.log("basesPerTick", basesPerTick);
		console.log("basesPerPixel", basesPerPixel);
		console.log("pixelsPerTick", pixelsPerTick);
		*/
		let x = 0;
		let y = 0;
		let dh = 5;

		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#000000";
		ctx.lineWidth = 2;
		ctx.beginPath();

		//baseline
		ctx.moveTo(x, y);
		ctx.lineTo(view.width, y);
		ctx.stroke();
		ctx.beginPath();
		ctx.lineWidth = 1;
		gb.baseline.xmin = x;
		let ticks = 0;
		for (let b = 0; b <= replicon.length; b += basesPerTick) {
			if (ticks++ % 10 == 0) {
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + dh * 2);
				let num = parseInt(b).toLocaleString();
				let tx = ctx.measureText(num).width / 2;
				ctx.fillText(num, x - tx, y + dh * 4);
			} else {
				ctx.moveTo(x, y);
				ctx.lineTo(x, y + dh);
			}
			gb.baseline.xmax = x;
			x += pixelsPerTick;
		}
		ctx.stroke();

		//draw red "thumb" and pale red triange to first axis
		ctx.fillStyle = "#FF0000";
		let a = 0;
		let xmin = view.axes[0].x1;
		let xmax = view.axes[0].x2;
		y += 2;
		let baseRanges = [];
		for (let axis of view.axes) {
			let baseMin = axis.b1 < axis.b2 ? axis.b1 : axis.b2;
			let baseMax = axis.b1 > axis.b2 ? axis.b1 : axis.b2;
			let range0 = baseRanges.find(r =>
				(baseMin >= r.baseMin &&
					baseMin <= r.baseMax) ||
				(baseMax >= r.baseMin &&
					baseMax <= r.baseMax)
			);

			if (!range0) {
				baseRanges.push({
					baseMin: baseMin,
					baseMax: baseMax,
				});
			} else {
				range0.baseMin = Math.min(range0.baseMin, baseMin);
				range0.baseMax = Math.max(range0.baseMax, baseMax);
			}

			xmin = Math.min(xmin, axis.x1);
			xmax = Math.max(xmax, axis.x2);
			let x1 = axis.baseMin / basesPerPixel;
			let x2 = axis.baseMax / basesPerPixel;
			let h = 10;
			ctx.fillRect(x1, y - h, x2 - x1 + 1, h);
		}

		let range0 = null;
		for (let range of baseRanges) {
			if (!range0 ||
				range0.baseMax - range0.baseMin < range.baseMax - range.baseMin)
				range0 = range;
		}
		if (range0) {
			let x1 = range0.baseMin / basesPerPixel;
			let x2 = range0.baseMax / basesPerPixel;
			x2 += 1;
			let ymin = view.axes[0].y2 + 30;
			ymin = Math.max(ymin, 50);
			if (gb.semzoom == 'sequence')
				ymin -= 35;
			ctx.strokeStyle =
				ctx.fillStyle = "rgba(255, 0, 0, .1)";
			ctx.beginPath();
			ctx.moveTo(x1, y);
			ctx.lineTo(xmin + 10, ymin);
			ctx.lineTo(xmax + 10, ymin);
			ctx.lineTo(x2, y);
			ctx.lineTo(x1, y);
			ctx.stroke();
			ctx.fill();
		}
	},

	DrawOperons(gb, replicon) {
		if (!replicon.operons)
			return;
		let ctx = replicon.ctx;
		let noperons = 0;
		let ndraw = 0;
		let dir = replicon.view.dir;
		let lines = replicon.view.axes;

		ctx.save();
		for (let l in lines) {
			let line = lines[l];
			for (let o in replicon.operons) {
				let operon = replicon.operons[o];
				if (operon.baseEnd < operon.baseStart) {
					console.log("error", operon);
				}
				let baseStart = operon.baseStart;
				let baseEnd = operon.baseEnd;
				let x1, x2;
				if (dir > 0) {
					x1 = line.x1 + (baseStart - line.baseMin) / replicon.view.scale;
					x2 = line.x1 + (baseEnd - line.baseMin) / replicon.view.scale;
				} else {
					x2 = line.x1 - (baseStart - line.baseMin) / replicon.view.scale;
					x1 = line.x1 - (baseEnd - line.baseMin) / replicon.view.scale;
				}

				x1 = Math.max(x1, line.x1);
				x2 = Math.min(x2, line.x2);
				if (x2 <= x1)
					continue;

				noperons++;
				let len = x2 - x1;
				let h = 26;
				let x = x1;
				let y = line.y2 - 26;

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x,
						y: y,
						l: len,
						h: h,
						t: 'O',
						e: operon
					});

				ctx.fillStyle = operon.color;
				ctx.fillRect(x, y, len, h);

				ctx.strokeStyle = "#666";
				ctx.lineWidth = .5;
				ctx.strokeRect(x, y, len, h);
			}
		}
		ctx.restore();
		//console.log("draw operon", noperons, Object.keys(replicon.operons).length);
		return;
	},

	DrawGenes(gb, replicon) {
		let t0 = performance.now();
		if (!replicon.genes)
			return;
		let ctx = replicon.ctx;
		let ngenes = 0;
		let view = replicon.view;
		let lines = view.axes;
		let dir = view.dir;
		let xoverlaps = [];
		let bbox = replicon.canvas.getBoundingClientRect();

		ctx.save();
		ctx.font = "1rem sans-serif";

		for (let a of replicon.htmlText)
			HIDE(a);
		replicon.htmlText.length = 0;

		for (let l in lines) {
			let line = lines[l];
			let width = replicon.view.width;
			for (let x = 0; x <= width; x++)
				xoverlaps[x] = 0;

			for (let g in replicon.genes) {
				let gene = replicon.genes[g];
				if (gene.type == 'P' && !gb.filters.protein.enabled ||
					gene.type == 'R' && !gb.filters.rna.enabled ||
					gene.type == 'S' && !gb.filters.pseudo.enabled ||
					gene.type == 'H' && !gb.filters.phantom.enabled)
					continue;

				if (gene.baseEnd < gene.baseStart) {
					console.log("error", gene);
				}
				let baseStart = gene.baseStart;
				let baseEnd = gene.baseEnd;

				let x1, x2;
				let clipleft, clipright;
				let cliptol = replicon.view.basesPerPixel * 5;
				if (dir > 0) {
					x1 = line.x1 + (baseStart - line.baseMin) / view.scale;
					x2 = line.x1 + (baseEnd - line.baseMin) / view.scale;
					clipleft = baseStart + cliptol < line.baseMin;
					clipright = baseEnd - cliptol > line.baseMax;

				} else {
					x2 = line.x1 - (baseStart - line.baseMin) / view.scale;
					x1 = line.x1 - (baseEnd - line.baseMin) / view.scale;
					clipleft = baseStart + cliptol > line.baseMin;
					clipright = baseEnd - cliptol < line.baseMax;
				}
				x1 = parseInt(Math.max(x1, line.x1));
				x2 = parseInt(Math.min(x2, line.x2));
				if (x2 <= x1)
					continue;

				ngenes++;

				let len = x2 - x1;
				let x = x1;
				let y = line.y2;

				//compute/update overlaps
				let xover = 0;
				let xoverMax = 0;
				let xoverLen = 0;
				for (let xx = x1; xx <= x2; xx++) {
					if (xoverlaps[xx] > xover) {
						if (xoverlaps[xx] >= xoverMax) {
							xoverMax = xoverlaps[xx];
							if (xoverLen++ > 5)
								xover = xoverMax;
						}
					} else {
						xoverMax = 0;
						xoverLen = 0;
					}
				}
				for (let xx = x1; xx <= x2; xx++) {
					xoverlaps[xx] = xover + 1;
				}
				xover = Math.min(xover, 2);
				y -= xover * 20;

				if (!gb.mouse.drag || gb.semzoom == "sequence")
					replicon.bboxes.push({
						x: x,
						y: y - 20,
						l: len,
						h: 20,
						t: 'G',
						e: gene
					});

				ctx.beginPath();
				ctx.fillStyle = gene.bg;
				ctx.strokeStyle = "#000000";
				ctx.lineWidth = .5;
				if (gene.highlight) {
					ctx.lineWidth = 3;
				} else if (gene.uid == replicon.centerGene) {
					ctx.lineWidth = 2;
					ctx.fillStyle = this.hashFill[gene.color];
				}

				if (gene.dir == '-') {
					x = x2;
					if (clipleft) {
						ctx.moveTo(x, y);
						ctx.lineTo(x - len + 10, y);
						ctx.lineTo(x - len, y - 8);
						ctx.lineTo(x - len + 6, y - 14);
						ctx.lineTo(x - len, y - 20);
					} else {
						let dl = (len > 10) ? 10 : len;
						if (gene.type == 'R') {
							ctx.moveTo(x, y);
							ctx.lineTo(x - len + dl, y);
							ctx.lineTo(x - len, y - 20);
						} else {
							ctx.moveTo(x, y);
							ctx.lineTo(x - len + dl, y);
							ctx.lineTo(x - len, y - 10);
							ctx.lineTo(x - len + dl, y - 20);
						}
					}
					if (clipright) {
						ctx.lineTo(x, y - 20);
						ctx.lineTo(x - 6, y - 14);
						ctx.lineTo(x, y - 8);
						ctx.lineTo(x - 10, y);
						ctx.lineTo(x, y);
					} else {
						ctx.lineTo(x, y - 20);
						ctx.lineTo(x, y);
					}
					x = x1;
				} else {
					if (clipright) {
						ctx.moveTo(x, y);
						ctx.lineTo(x + len - 10, y);
						ctx.lineTo(x + len, y - 8);
						ctx.lineTo(x + len - 6, y - 14);
						ctx.lineTo(x + len, y - 20);
					} else {
						let dl = (len > 10) ? 10 : len;
						if (gene.type == 'R') {
							ctx.moveTo(x, y);
							ctx.lineTo(x + len - dl, y);
							ctx.lineTo(x + len, y - 20);
						} else {
							ctx.moveTo(x, y);
							ctx.lineTo(x + len - dl, y);
							ctx.lineTo(x + len, y - 10);
							ctx.lineTo(x + len - dl, y - 20);
						}
					}
					if (clipleft) {
						ctx.lineTo(x, y - 20);
						ctx.lineTo(x + 6, y - 14);
						ctx.lineTo(x, y - 8);
						ctx.lineTo(x - 10, y);
						ctx.lineTo(x, y);
					} else {
						ctx.lineTo(x, y - 20);
						ctx.lineTo(x, y);
					}
				}
				ctx.fill();
				ctx.stroke();

				if (gene.dir == '-')
					x += 10;
				len -= 10;

				let drawX = gene.type == 'S' || //pseudogene X
					gene.type == 'H'; //phantom gene (thicker X)
				if (drawX) {
					let l = len;
					let h = -20;
					let xx = x;
					if (len > 5) {
						ctx.lineWidth = gene.type == 'H' ? 3 : 1;
						ctx.beginPath();
						ctx.moveTo(xx, y);
						ctx.lineTo(xx + l, y + h);
						ctx.moveTo(xx + l, y);
						ctx.lineTo(xx, y + h);
						ctx.stroke();
						ctx.lineWidth = .5;
					}
				}

				if (gene.pnameDom && gene.plen < len && y > 0) {
					let a = gene.pnameDom;
					x = (x + len / 2) - gene.plen / 2;
					SHOW(a);
					let dx = bbox.left + 20;
					let dy = bbox.top - a.clientHeight - 2;
					//fix this
					if (gb.semzoom == 'sequence')
						dy -= 35;
					a.style.left = x + dx + "px";
					a.style.top = y + dy + "px";
					replicon.htmlText.push(a);
				} else if (gene.nameDom && gene.len < len && y > 0) {
					let a = gene.nameDom;
					x = (x + len / 2) - gene.len / 2;
					SHOW(a);
					let dx = bbox.left + 20;
					let dy = bbox.top - a.clientHeight - 2;
					if (gb.semzoom == 'sequence')
						dy -= 35;
					a.style.left = x + dx + "px";
					a.style.top = y + dy + "px";
					replicon.htmlText.push(a);
				} else if (gene.pname && gene.plen < len - 10) {
					x += len / 2 - gene.plen / 2;
					if (drawX) {
						ctx.fillStyle = gene.bg;
						ctx.fillRect(x - 1, y, gene.plen + 2, -20);
					}
					ctx.fillStyle = gene.fg;
					ctx.fillText(gene.name + " : " + gene.pname, x, y - 5);
				} else if (gene.name && gene.len < len - 10) {
					x += len / 2 - gene.len / 2;
					if (drawX) {
						ctx.fillStyle = gene.bg;
						ctx.fillRect(x - 1, y, gene.len + 2, -20);
					}
					ctx.fillStyle = gene.fg;
					ctx.fillText(gene.name, x, y - 5);
				}

			}
		}
		ctx.restore();
		//console.log("draw genes", ngenes, replicon.genes.length, DT(t0));
		return;
	},

	DrawMRNAs(gb, replicon) {
		let t0 = performance.now();
		let ctx = replicon.ctx;
		let lines = replicon.view.axes;
		let dir = replicon.view.dir;
		let xoverlaps = [];

		ctx.save();
		for (let l in lines) {
			let line = lines[l];
			let width = replicon.view.width;
			for (let x = 0; x <= width; x++)
				xoverlaps[x] = 0;
			for (let mrna of replicon.mRNAs) {
				let pos = (mrna.start + mrna.end) / 2;
				if (dir > 0) {
					if (pos < line.baseMin || pos > line.baseMax)
						continue;
				} else {
					if (pos < line.baseMax || pos > line.baseMin)
						continue;
				}
				let x = line.x1 + (pos - line.baseMin) * dir / replicon.view.basesPerPixel;
				if (x < line.x1 || x > line.x2)
					continue;

				let len = (mrna.end - mrna.start) / replicon.view.basesPerPixel;
				len = Math.max(len, 5);
				x -= len / 2;
				let y = line.y2 - 25;

				//compute/update overlaps
				let x1 = parseInt(Math.max(x, 0));
				let x2 = parseInt(Math.min(x + len, width));
				let xover = 0;
				for (let xx = x1; xx <= x2; xx++) {
					if (xoverlaps[xx] > xover)
						xover = xoverlaps[xx];
				}
				for (let xx = x1; xx <= x2; xx++) {
					xoverlaps[xx] = xover + 1;
				}
				xover = Math.min(xover, 3);
				y -= xover * 12;

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x,
						y: y,
						l: len,
						h: 10,
						t: 'r',
						e: mrna
					});

				ctx.beginPath();
				ctx.strokeStyle = "#FF0000";
				ctx.moveTo(x, y);
				ctx.lineTo(x + len, y);
				ctx.stroke();
				ctx.beginPath();
				ctx.lineWidth = .5;
				for (let dx = 0; dx <= len; dx += 5) {
					ctx.moveTo(x + dx, y);
					ctx.lineTo(x + dx, y + 4);
				}
				ctx.stroke();
				ctx.lineWidth = 1;
				if (len > mrna.tfLen) {
					x += len / 2 - mrna.tfLen / 2;
					y += 9;
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(x, y, mrna.tfLen, -8);
					ctx.fillStyle = "#FF0000";
					ctx.fillText(mrna.tfName, x, y);
				}
			}
		}
		ctx.restore();
	},

	DrawPromoters(gb, replicon) {
		let t0 = performance.now();
		if (!replicon.promoters)
			return;
		let ctx = replicon.ctx;
		let npromoters = 0;
		let lines = replicon.view.axes;
		let dir = replicon.view.dir;
		let xoverlaps = [];

		ctx.save();
		ctx.strokeStyle = "#0C0C6C";
		ctx.fillStyle = "#0C0C6C";
		ctx.lineWidth = .5;

		for (let l in lines) {
			let line = lines[l];
			for (let x = 0; x <= replicon.view.width; x++)
				xoverlaps[x] = 0;

			for (let promoter of replicon.promoters) {
				let pos = promoter.pos;
				if (dir > 0) {
					if (pos < line.baseMin || pos > line.baseMax)
						continue;
				} else {
					if (pos < line.baseMax || pos > line.baseMin)
						continue;
				}
				npromoters++;
				let d = (promoter.dir == '-') ? -dir : dir;
				let x1 = line.x1 + (pos - line.baseMin) * dir / replicon.view.basesPerPixel;
				x1 = Math.round(x1);
				//console.log(l, x1, line.x1, line.x2);
				if (x1 < line.x1 || x1 > line.x2)
					continue;
				let x2 = x1 + 20 * d;
				let dy = 3 * d;
				let dx = 8 * d;
				let y1 = line.y2;
				let y2 = y1 - 30;

				//adjust/save bbox
				let x11 = x1;
				let x22 = x2;
				if (promoter.sigma)
					x22 += 20 * d;
				if (x11 > x22) {
					x11 = x22;
					x22 = x1;
				}

				//compute/update overlaps
				let xover = 0;
				for (let x = parseInt(x11); x <= x22; x++) {
					if (xoverlaps[x] > xover)
						xover = xoverlaps[x];
				}
				for (let x = parseInt(x11); x <= x22; x++) {
					xoverlaps[x] = xover + 1;
				}
				y2 -= xover * 9;
				if (y1 - y2 > 30 + 2 * 9)
					y2 = y1 - 30 - 2 * 9;

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x11,
						y: y2 - 4,
						l: x22 - x11,
						h: 8,
						t: 'P',
						e: promoter
					});

				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x1, y2);
				ctx.lineTo(x2, y2);
				ctx.stroke();
				ctx.beginPath();
				ctx.lineTo(x2 - dx, y2 - dy);
				ctx.lineTo(x2 - dx, y2 + dy);
				ctx.lineTo(x2, y2);
				ctx.fill();
				if (promoter.sigma) {
					y2 += 3;
					if (d == -1)
						x2 -= 20;
					else
						x2 += 2;
					ctx.font = "normal normal 8pt Symbol";
					ctx.fillText("\u03C3", x2, y2);
					ctx.font = "normal normal 8pt Helvetica";
					x2 += 6;
					ctx.fillText(promoter.sigma, x2, y2);
					y2 -= 3;
				}
			}
		}
		ctx.restore();
	},

	DrawTerminatorsAttenuators(gb, replicon, type) {
		if (!replicon.terminators)
			return;
		let ctx = replicon.ctx;
		let nterminators = 0;
		let lines = replicon.view.axes;
		let dir = replicon.view.dir;

		ctx.save();
		//ctx.strokeStyle = "#191970";
		ctx.strokeStyle = "#0C0C6C";
		ctx.lineWidth = .5;

		let x = 0;
		let r = 4;
		let h = 27;
		const PI = Math.PI;
		let elements = type == 'T' ? replicon.terminators : replicon.attenuators;
		for (let l in lines) {
			let line = lines[l];
			for (let terminator of elements) {
				let pos = (terminator.start + terminator.end) / 2;
				if (dir > 0) {
					if (pos < line.baseMin || pos > line.baseMax)
						continue;
				} else {
					if (pos < line.baseMax || pos > line.baseMin)
						continue;
				}
				nterminators++;
				let d = (terminator.dir == '+') ? -dir : dir;
				let x1 = line.x1 + (terminator.start - line.baseMin) * dir / replicon.view.basesPerPixel;
				let x2 = line.x1 + (terminator.end - line.baseMin) * dir / replicon.view.basesPerPixel;

				let y = line.y2;

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x1,
						y: y - h - 2 * r,
						l: x2 - x1,
						h: h + 2 * r,
						t: type,
						e: terminator
					});

				ctx.beginPath();
				ctx.setLineDash(d > 0 ? [] : [5, 5]);
				ctx.moveTo(x1, y);
				ctx.lineTo(x1, y - h);
				ctx.stroke();

				ctx.beginPath();
				ctx.setLineDash(d > 0 ? [5, 5] : []);
				ctx.moveTo(x2, y);
				ctx.lineTo(x2, y - h);
				ctx.stroke();

				ctx.beginPath();
				ctx.setLineDash([]);
				ctx.moveTo(x1, y - h);
				ctx.arc(x1, y - h - r, r, PI / 2, -PI / 2, 0);
				if (type == 'T') {
					ctx.lineTo(x2, y - h - r * 2);
				} else { //attenuator
					let xx = (x1 + x2) / 2;
					let yy = y - h - r * 2;
					ctx.lineTo(xx - 1.5, yy);
					ctx.moveTo(xx - 1.5, yy - 5)
					ctx.lineTo(xx - 1.5, yy + 5);
					ctx.moveTo(xx + 1.5, yy - 5);
					ctx.lineTo(xx + 1.5, yy + 5);
					ctx.moveTo(xx + 1.5, yy);
					ctx.lineTo(x2, yy);
				}
				ctx.moveTo(x2, y - h);
				ctx.arc(x2, y - h - r, r, PI / 2, -PI / 2, 1);
				ctx.stroke();
			}
		}
		ctx.restore();
	},

	DrawTranscriptions(gb, replicon) {
		let t0 = performance.now();
		let ctx = replicon.ctx;
		let ntrans = 0;
		let lines = replicon.view.axes;
		let dir = replicon.view.dir;

		ctx.save();
		for (let l in lines) {
			let line = lines[l];
			let x11 = -100,
				y11 = -100,
				x22 = -100,
				y22 = -100;
			for (let trans of replicon.transcriptions) {
				let pos = trans.pos;
				if (dir > 0) {
					if (pos < line.baseMin || pos > line.baseMax)
						continue;
				} else {
					if (pos < line.baseMax || pos > line.baseMin)
						continue;
				}
				ntrans++;
				let x1 = line.x1 + (pos - line.baseMin) * dir / replicon.view.basesPerPixel;
				x1 = Math.round(x1);
				if (x1 < line.x1 || x1 > line.x2)
					continue;
				let len = trans.len / replicon.view.basesPerPixel;
				x1 -= len / 2;
				let x2 = x1 + len;
				let y1 = line.y2;
				let y2 = y1 - 12;

				if (x1 >= x11 && x1 <= x22 ||
					x2 >= x11 && x2 <= x22) {
					y2 = y22 - 12;
					if (y1 - y2 > 60)
						y2 = y1 + 60;
				}
				if (x1 < x2) {
					x11 = x1;
					x22 = x2;
				} else {
					x11 = x2;
					x22 = x1;
				}
				y22 = y2;

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x1,
						y: y2,
						l: len,
						h: 12,
						t: 't',
						e: trans
					});

				ctx.setLineDash(trans.Q == "T" ? [] : [3, 3]);
				switch (trans.action) {
					case 'R':
						ctx.strokeStyle = "#9E1750"; //red
						ctx.fillStyle = "#F9DDE9";
						break;
					case 'A':
						ctx.strokeStyle = "#4F7850"; //green
						ctx.fillStyle = "#E3FAE3";
						break;
					case 'D':
						ctx.strokeStyle = "#8A451B"; //light brown
						ctx.fillStyle = "#FAE9DE";
						break;
					default:
						ctx.strokeStyle = "#444"; //gray
						ctx.fillStyle = "#CCC";
						break;
				}
				ctx.fillRect(x1, y2, len, 12);
				ctx.strokeRect(x1, y2, len, 12);

				let w = ctx.measureText(trans.tfname).width;
				if (w < len) {
					ctx.fillStyle = ctx.strokeStyle;
					ctx.fillText(trans.tfname, x1 + (len - w) / 2, y2 + 10);
				}

			}
		}
		ctx.restore();
	},

	DrawExtraGenics(gb, replicon) {
		let t0 = performance.now();
		let ctx = replicon.ctx;
		let lines = replicon.view.axes;
		let dir = replicon.view.dir;

		ctx.save();
		for (let l in lines) {
			let line = lines[l];
			for (let extra of replicon.extragenics) {
				let pos = (extra.start + extra.end) / 2;
				if (dir > 0) {
					if (pos < line.baseMin || pos > line.baseMax)
						continue;
				} else {
					if (pos < line.baseMax || pos > line.baseMin)
						continue;
				}
				let x = line.x1 + (pos - line.baseMin) * dir / replicon.view.basesPerPixel;
				if (x < line.x1 || x > line.x2)
					continue;

				let l = (extra.end - extra.start) / replicon.view.basesPerPixel;
				x -= l / 2;
				let h = 12;
				let y = line.y2 - h;

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x,
						y: y,
						l: l,
						h: h,
						t: 'e',
						e: extra
					});

				ctx.fillStyle = "#BBB";
				ctx.fillRect(x, y, l, h);
				ctx.strokeStyle = "#000000";
				ctx.lineWidth = .5;
				ctx.strokeRect(x, y, l, h);
				ctx.lineWidth = 1;
			}
		}
		ctx.restore();
	},

	DrawRBS(gb, replicon) {
		let t0 = performance.now();
		let ctx = replicon.ctx;
		let lines = replicon.view.axes;
		let dir = replicon.view.dir;

		ctx.save();
		for (let l in lines) {
			let line = lines[l];
			for (let rbs of replicon.rbs) {
				let pos = (rbs.start + rbs.end) / 2;
				if (dir > 0) {
					if (pos < line.baseMin || pos > line.baseMax)
						continue;
				} else {
					if (pos < line.baseMax || pos > line.baseMin)
						continue;
				}
				let x = line.x1 + (pos - line.baseMin) * dir / replicon.view.basesPerPixel;
				if (x < line.x1 || x > line.x2)
					continue;

				let l = (rbs.end - rbs.start) / replicon.view.basesPerPixel;
				x -= l / 2;
				let h = 20;
				let y = line.y2; //

				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x,
						y: y - h,
						l: l,
						h: h,
						t: 'e',
						e: rbs
					});

				let x1 = x;
				let x2 = x + l;
				ctx.beginPath();
				ctx.fillStyle = "#0B24FB";
				ctx.moveTo(x1, y);
				ctx.lineTo(x1, y - h + 5);
				ctx.lineTo((x1 + x2) / 2, y - h);
				ctx.lineTo(x2, y - h + 5);
				ctx.lineTo(x2, y);
				ctx.lineTo(x1, y);
				ctx.fill();
			}
		}
		ctx.restore();
	},

	DrawInsertions(gb, replicon) {
		if (!replicon.insertions)
			return;
		let ctx = replicon.ctx;
		let ninsertions = 0;
		let ndraw = 0;
		let dir = replicon.view.dir;
		let lines = replicon.view.axes;

		ctx.save();
		ctx.fillStyle = "#F0F0F0";
		ctx.strokeStyle = "#BBB";
		ctx.lineWidth = .5;

		for (let l in lines) {
			let line = lines[l];
			for (let insertion of replicon.insertions) {
				if (insertion.baseEnd < insertion.baseStart) {
					console.log("error", insertion);
				}
				let baseStart = insertion.baseStart;
				let baseEnd = insertion.baseEnd;
				let x1, x2;
				if (dir > 0) {
					x1 = line.x1 + (baseStart - line.baseMin) / replicon.view.scale;
					x2 = line.x1 + (baseEnd - line.baseMin) / replicon.view.scale;
				} else {
					x2 = line.x1 - (baseStart - line.baseMin) / replicon.view.scale;
					x1 = line.x1 - (baseEnd - line.baseMin) / replicon.view.scale;
				}
				x1 = Math.max(x1, line.x1);
				x2 = Math.min(x2, line.x2);
				if (x2 <= x1)
					continue;

				ninsertions++;
				let len = x2 - x1;
				let h = 20;
				let x = x1;
				let y = line.y2 - h;

				y -= 20;
				h += 20;
				insertion.x = x;
				insertion.y = y
				insertion.l = len;
				insertion.h = h;
				if (!gb.mouse.drag)
					replicon.bboxes.push({
						x: x,
						y: y,
						l: len,
						h: h,
						t: 'I',
						e: insertion
					});
				ctx.fillRect(x, y, len, h);
				ctx.strokeRect(x, y, len, h);
			}
		}
		ctx.lineWidth = 1;
		ctx.restore();
		return;
	},

	OnResize(evt) {
		//assume on browser per page
		let gb = this.gb;
		if (!gb)
			return;

		if (gb.baseline) {
			let canvas = gb.baseline.canvas;
			let ctx = gb.baseline.ctx;
			this.scaleDevice = DevicePixelRatio(ctx);
			canvas.width = canvas.clientWidth * this.scaleDevice;
			canvas.height = canvas.clientHeight * this.scaleDevice;
		}
		for (let replicon of gb.replicon) {
			let canvas = replicon.canvas;
			if (!canvas)
				continue;
			let ctx = replicon.ctx;
			this.scaleDevice = DevicePixelRatio(ctx);
			canvas.width = canvas.clientWidth * this.scaleDevice;
			canvas.height = canvas.clientHeight * this.scaleDevice;
			if (replicon.view) {
				replicon.view.width = canvas.width / this.scaleDevice - 40;
				replicon.view.height = canvas.height / this.scaleDevice;
			}
			//console.log("rescale", this.scaleDevice, canvas.clientWidth, canvas.clientHeight, canvas.width, canvas.height);
		}
		for (let track of GBTracks.tracks) {
			let canvas = track.canvas;
			if (!canvas)
				continue;
			let ctx = track.ctx;
			this.scaleDevice = DevicePixelRatio(ctx);
			canvas.width = canvas.clientWidth * this.scaleDevice;
			canvas.height = canvas.clientHeight * this.scaleDevice;
		}
		this.Draw(gb);
	},

	OnWheel(evt) {
		let t0 = performance.now();
		let gb = this.gb;
		if (gb.mouse.zoom++)
			return !evt.fake ? StopEvent(evt) : 0;

		let canvas = evt.target;
		let bbox = canvas.getBoundingClientRect();
		let x = evt.clientX - bbox.left;
		let y = evt.clientY - bbox.top;
		//console.log("onwheel", evt.clientX, evt.clientY, bbox.left, bbox.top);

		x -= 20; //fix this

		var delta = evt.deltaY;
		if (!evt.fake) {
			if (delta > 3)
				delta = 3;
			if (delta < -3)
				delta = -3;
		}

		var scaleFactor = 1 + .02; // / this.scaleDevice;
		if (delta == 0)
			delta = -1;
		var factor = Math.pow(scaleFactor, delta);

		for (let r = 1; r < gb.replicon.length; r++) {
			gb.replicon[r].view.xoff = gb.replicon[r].view.x0 - gb.replicon[0].view.x0;
			gb.replicon[r].view.yoff = gb.replicon[r].view.y0 - gb.replicon[0].view.y0;
			gb.replicon[r].view.boff = gb.replicon[r].view.base0 - gb.replicon[0].view.base0;
		}

		let replicon = gb.replicon[0];
		let view = replicon.view;
		if (!view || !view.axes)
			return;
		if (view.scale < 1)
			view.scale += (factor < 1) ? -.02 : .02;
		else
			view.scale *= factor;

		if (view.scale < .1 && gb.hasTracks) {
			view.scale = .101;
		}
		if (view.scale < .1) {
			view.scale = .1;
		}

		let nlines = parseInt(view.height / gb.linegap);
		let maxpixels = nlines * view.width;
		let maxscale = Math.ceil(replicon.length / maxpixels);
		if (view.scale > maxscale) {
			view.scale = maxscale;
		}
		let yy = Math.max(0, y - 20);
		if (gb.isCmpBro)
			yy = view.axes[0].y1 + 1;
		let db = 0;
		for (let axis of view.axes) {
			if (yy > axis.y1 && x > axis.x1 &&
				yy < axis.y2 && x < axis.x2) {
				let base0 = axis.b1 + (x - axis.x1) * view.basesPerPixel * view.dir;
				view.x0 = x;
				view.y0 = axis.y2;
				let dt = evt.timeStamp - gb.mouse.tsWheel;
				if (dt > 1000) {
					db = base0 - view.base0;
					view.base0 = base0;
				}
				gb.mouse.tsWheel = evt.timeStamp;
				break;
			}
		}
		for (let r = 1; r < gb.replicon.length; r++) {
			let view0 = gb.replicon[0].view;
			let view = gb.replicon[r].view;
			if (!view || !view.axes)
				continue;
			view.scale = view0.scale;
			view.x0 = view0.x0 + view.xoff;
			view.base0 += db * view.dir;
		}


		this.Draw(gb);
		if (gb.tip0) {
			this.HidePopup();
		}

		setTimeout(() => {
			gb.mouse.zoom = 0;
			gb.dom.search.value = '';
			HIDE(gb.dom.marker);
		}, 5);

		if (!evt.fake)
			return StopEvent(evt);
	},

	OnMouseDown(evt) {
		let gb = this.gb;

		gb.tip00 = gb.tip0;

		if (gb.tip0)
			this.HidePopup();

		if (!gb.mouse)
			gb.mouse = {};
		for (let replicon of gb.replicon) {
			replicon.view.x00 = replicon.view.x0;
			replicon.view.y00 = replicon.view.y0;
		}
		gb.mouse.mx0 = evt.clientX;
		gb.mouse.my0 = evt.clientY;
		gb.mouse.drag = true;
		gb.mouse.shift = evt.shiftKey;
		gb.mouse.buttons = evt.buttons;
		gb.mouse.move = 0;
		gb.mouse.ndrag = 0;
		gb.dom.search.value = '';
		HIDE(gb.dom.marker);
	},

	OnMouseUp(evt) {
		let gb = this.gb;
		gb.mouse.drag = false;
		gb.mouse.shift = null;

		// This is for a left-click on a gene, to jump to that page (in the same Tab):
		if (gb.mouse.buttons == 1 && gb.mouse.move <= 1 && gb.tip00) {
			let orgid = evt.target.replicon.orgid;
			let uid0 = gb.tip00.uid;
			let type = gb.tip00.t;
			let name = gb.tip00.name
			GBMenu.OpenBioCycPage(evt, orgid, uid0, type, name);
		}

		//sequence select?
		if (gb.semzoom == 'sequence' && GBSeq.tip0 && gb.mouse.move < 3)
			GBSeq.OnMouseUp(evt);

		this.Draw(gb);
		this.SaveState();
		return StopEvent(evt);
	},

	OnMouseMove(evt) {
		let gb = this.gb;
		if (!gb)
			return;

		gb.mouse.move++;
		/*
			if (gb.mouse.drag && evt.buttons == 1 && gb.mouse.shift)
				return this.OnMouseSelect(evt);
		*/
		if (gb.mouse.drag && evt.buttons == 1)
			return this.OnDrag(evt);

		if (!gb.mouse.drag && !evt.buttons)
			return this.OnHover(evt);
	},

	OnMouseSelect(evt) {
		let gb = this.gb;
		this.Draw(gb);
		let canvas = gb.replicon[0].canvas;
		let ctx = gb.replicon[0].ctx;
		let x = gb.mouse.mx0 - canvas.offsetLeft - 20;
		let y = gb.mouse.my0 - canvas.offsetTop;
		let l = evt.clientX - gb.mouse.mx0;
		let h = evt.clientY - gb.mouse.my0;

		let view = gb.replicon[0].view;
		let axis0 = null;
		let axisN = null;
		let a = 0;
		for (let axis of view.axes) {
			axis.a = a++;
			if (y >= axis.y1 && y <= axis.y2) {
				axis0 = axis;
			}
			if (y + h >= axis.y1 && y + h <= axis.y2) {
				axisN = axis;
			}
		}
		if (!axis0 || !axisN)
			return;
		//console.log(y, y+h, axis0.a, axisN.a);
		ctx.save();
		ctx.fillStyle = "#000000";
		ctx.globalAlpha = .15;
		ctx.fillRect(x, y, l, h);
		/*
		//ctx.fillRect(x, y, axis0.x2-x, h);
		if (axis0 != axisN) {
			console.log("fill2", 0, axis0.y2, view.width, axisN.y2 - axis0.y1);	    
			ctx.fillRect(0, axis0.y2, view.width, axisN.y2 - axis0.y1);
			}
			*/
		ctx.globalAlpha = 1;
		ctx.strokeStyle = "#000000";
		ctx.strokeRect(x, y, l, h);
		ctx.restore();
	},

	OnDrag(evt) {
		let t0 = performance.now();
		let gb = this.gb;
		let dx = evt.clientX - gb.mouse.mx0;
		let dy = evt.clientY - gb.mouse.my0;
		if (gb.replicon.length > 1)
			dy = 0;

		if (!gb.mouse.ndrag++)
			gb.mouse.tsDrag = t0;

		for (let replicon of gb.replicon) {
			replicon.view.x0 = replicon.view.x00 + dx;
			if (!gb.hasTracks)
				replicon.view.y0 = replicon.view.y00 + dy;
		}

		if (evt.shiftKey && gb.isCmpBro) {
			let view = gb.replicon[0].view;
			for (let replicon of gb.replicon)
				this.DrawAxes(gb, replicon, view.width, view.height);

			let axis = view.axes[0];
			let base0 = axis.baseMin + parseInt((view.width / 2 - axis.x1) * view.basesPerPixel);
			for (let gene of gb.replicon[0].genes) {
				if (base0 >= gene.baseStart && base0 <= gene.baseEnd) {
					if (gene != gb.replicon[0].gene0) {
						//console.log('new lead', base0, gene.name);
						gb.replicon[0].gene0 = gene;
						gb.replicon[0].centerGene = gene.uid;
						this.Orthos.Update(gb);
						this.CenterReplicons(gb);
						this.UpdateTitles(gb);
						for (let replicon of gb.replicon)
							this.DrawAxes(gb, replicon, view.width, view.height);

						dx = (base0 - view.base0) / view.basesPerPixel;
						for (let replicon of gb.replicon) {
							replicon.view.x0 -= dx;
							replicon.view.x00 = replicon.view.x0;
							replicon.view.y00 = replicon.view.y0;
						}
						gb.mouse.mx0 = event.clientX;
						gb.mouse.my0 = event.clientY;
						dx = (base0 - view.base0) / view.basesPerPixel;
					}
					break;
				}
			}
		}
		gb.mouse.shift = evt.shiftKey;

		//this.Draw(gb);
		setTimeout(() => {
			this.Draw(gb);
			if (DT(t0) > 50)
				console.log("drag", DT(t0));
		}, 1);
		return;
	},

	OnHover(evt) {
		let gb = this.gb;
		let canvas = evt.target; // ? target.canvas : target;
		let bbox = canvas.getBoundingClientRect();
		let x = evt.clientX - bbox.left;
		let y = evt.clientY - bbox.top;

		//fix this
		x -= 20;

		let popup = gb.dom.popup;
		for (let replicon of gb.replicon) {
			if (replicon.canvas != canvas)
				continue;
			if (!replicon.tips)
				replicon.tips = {};

			for (let b = replicon.bboxes.length - 1; b >= 0; b--) {
				let bbox = replicon.bboxes[b];
				if (x < bbox.x ||
					y < bbox.y ||
					x > bbox.x + bbox.l ||
					y > bbox.y + bbox.h)
					continue;

				if (bbox.t == 'BP+' || bbox.t == 'BP-' || bbox.t == 'AA') {
					GBSeq.OnHover(replicon, bbox, x, y);
					return;
				}

				let element = bbox.e;
				element.t = bbox.t;
				let tip = replicon.tips ? replicon.tips[bbox.e.uid] : null;
				if (gb.isCmpBro && element != gb.ortho0) {
					for (let replicon of gb.replicon) {
						for (let bbox of replicon.bboxes) {
							if (bbox.e)
								bbox.e.highlight = false;
						}
					}

					let orthos = this.orthoMap[replicon.orgid][replicon.chromosome];
					if (orthos[bbox.e.uid] && bbox.t == 'G') {
						let uid0 = bbox.e.uid;
						if (replicon != gb.replicon[0]) {
							uid0 = orthos[uid0] ? orthos[uid0][0][1] : null;
						}
						if (uid0) {
							let bbox = gb.replicon[0].bboxes.find(b => b.e.uid == uid0);
							if (bbox) {
								bbox.e.highlight = true;
							}
							orthos = this.orthoMap[gb.replicon[0].orgid][gb.replicon[0].chromosome][uid0];
							for (let o of orthos) {
								for (let r = 1; r < gb.replicon.length; r++) {
									let replicon = gb.replicon[r];
									if (replicon.orgid == o[0]) {
										let bbox = replicon.bboxes.find(b => b.e.uid == o[1]);
										if (bbox)
											bbox.e.highlight = true;
									}
								}
							}
						}
					}
					gb.ortho0 = bbox.t == 'G' ? bbox.e : '';
					gb.tip0 = null;
					gb.tip00 = null;
					this.Draw(gb);
				}

				// if (!tip && element) {
				// 	replicon.tips[element.uid] = {
				// 		none: "<h3> Loading " + (element.name ? element.name : "") + "...</h3>"
				// 	}
				// 	gb.tip0 = element;
				// 	this.LoadToolTip(replicon, element.uid, evt);
				// }

				if (tip) {
					if (element != gb.tip0) {
						if (gb.tip0)
							this.HidePopup();
						gb.tip0 = element;
						gb.tip00 = null;
						let html = "";
						for (let key in tip) {
							html += "<div>" + tip[key] + "</div>";
						}
						popup.innerHTML = html;
						let ctx = replicon.ctx;
						ctx.save();
						ctx.lineWidth = 1.5;
						ctx.strokeStyle = "#000000";
						for (let bbox of replicon.bboxes) {
							if (bbox.e == element &&
								bbox.t != 'BP+' && bbox.t != 'BP-' && bbox.t != 'AA') {
								ctx.strokeRect(bbox.x, bbox.y, bbox.l, bbox.h);
							}
						}
						ctx.restore();
					}
					SHOW(popup);
					let bbox = popup.getBoundingClientRect();

					popup.onleft = evt.pageX + bbox.width > window.innerWidth;
					if (popup.onleft)
						popup.style.left = evt.pageX - 5 * this.scaleDevice - bbox.width + "px";
					else
						popup.style.left = evt.pageX + 5 * this.scaleDevice + "px";

					popup.onbottom = evt.pageY - bbox.height < 0;
					if (popup.onbottom)
						popup.style.top = evt.pageY - 10 * this.scaleDevice + "px";
					else
						popup.style.top = evt.pageY - 10 * this.scaleDevice - bbox.height + "px";

					canvas.onmouseleave = this.HidePopup.bind(this);
				} else {
					this.HidePopup();
				}
				return;
			}
		}
		if (GBSeq.tip0)
			GBSeq.OnHover(GBSeq.tip0.r, null, 0, 0);

		if (gb.tip0)
			this.HidePopup();

		return;
	},

	InitTouchHandlers(canvas) {
		let mx = 0,
			my = 0;

		function touch2mouse(touchEvt) {
			let mouseEvt = {
				target: touchEvt.target,
				buttons: 1,
				shiftKey: touchEvt.shiftKey,
				clientX: touchEvt.changedTouches[0].clientX,
				clientY: touchEvt.changedTouches[0].clientY,
			}
			return mouseEvt;
		}

		function OnTouchStart(evt) {
			mx = evt.changedTouches[0].clientX;
			my = evt.changedTouches[0].clientY;
			console.log("touch down", evt.touches.length,
				evt.clientX, evt.clientY,
				evt.shiftKey,
				evt.buttons,
				evt.changedTouches[0].force.toFixed(1));

			this.OnMouseDown(touch2mouse(evt));
			return StopEvent(evt);
		}

		function OnTouchMove(evt) {
			let dx = mx - evt.changedTouches[0].clientX;
			let dy = my - evt.changedTouches[0].clientY;
			let f = evt.changedTouches[0].force;
			console.log("touch move", evt.touches.length,
				dx.toFixed(1), dy.toFixed(1), f.toFixed(1));
			this.OnMouseMove(touch2mouse(evt));
			return StopEvent(evt);
		}

		function OnTouchEnd(evt) {
			console.log("touch end", evt.buttons);
			this.OnMouseUp(touch2mouse(evt));
			return StopEvent(evt);
		}

		canvas.addEventListener("touchstart", OnTouchStart.bind(this), false);
		canvas.addEventListener("touchmove", OnTouchMove.bind(this), false);
		canvas.addEventListener("touchend", OnTouchEnd.bind(this), false);
	},

	HidePopup() {
		let gb = this.gb;

		for (let replicon of gb.replicon) {
			for (let bbox of replicon.bboxes) {
				if (bbox.e)
					bbox.e.highlight = false;
			}
		}

		this.Draw(gb);
		HIDE(gb.dom.popup);
		gb.tip0 = null;
		gb.ortho0 = null;
	},

	OnMouseBaseline(evt) {
		let gb = this.gb;
		if (!gb || !gb.baseline)
			return;

		if (evt.type == "mousemove" && !evt.buttons) {
			gb.baseline.drag = false;
			return;
		}

		let canvas = evt.target;
		let x = evt.clientX - canvas.offsetLeft - 10;
		let y = evt.clientY - canvas.offsetTop;

		let view = gb.replicon[0].view;
		let width = view.width;
		let scale = gb.replicon[0].length / width;
		if (x < gb.baseline.xmin || x > gb.baseline.xmax || y > 30)
			return;
		let base0 = (x - gb.baseline.xmin) * scale;
		base0 = parseInt(base0 / view.basesPerTick) * view.basesPerTick;
		//console.log(base0);
		switch (evt.type) {
			case "mousedown":
				gb.baseline.drag = true;
			//fallthrough
			case "mousemove":
				if (gb.baseline.drag) {
					//fix this
					view.base0 = base0;
					view.x0 = view.width / 2;
					view.y0 = view.height / 2;
					this.Draw(gb);
				}
				break;
			case "mouseup":
				gb.baseline.drag = false;
				break;
		}
		return;
	},

	OnCmpBroDrag(evt) {
		let gb = this.gb;
		let cmpbro = evt.target.closest(".gbCmpBro");

		if (cmpbro.id == 0)
			return StopEvent(evt);

		switch (evt.type) {
			case "wheel":
				let canvas = evt.target.closest("div").nextElementSibling;
				let bbox = canvas.getBoundingClientRect();
				let fake = {
					fake: true,
					type: evt.type,
					target: canvas,
					clientX: evt.clientX,
					clientY: bbox.top + 30,
					deltaY: Math.max(-5, Math.min(5, evt.deltaY)),
					shiftKey: evt.shiftKey,
					buttons: evt.buttons
				};
				this.OnWheel(fake);
				return StopEvent(evt);

			case "pointerenter":
				cmpbro.classList.add("enter");
				break;
			case "pointerleave":
				cmpbro.classList.remove("enter");
				break;
			case "pointerdown": {
				let cmpbros = gb.dom.scroller.querySelectorAll(".gbCmpBro");
				let top0 = cmpbro.offsetTop;
				let y0 = evt.pageY;
				let ymin = cmpbros[0].offsetTop + cmpbros[0].offsetHeight;
				let ymax = gb.dom.scroller.offsetTop + gb.dom.scroller.offsetHeight + gb.dom.scroller.scrollTop;

				gb.dom.cmpDrag.style.left = cmpbro.offsetLeft + "px";
				gb.dom.cmpDrag.style.top = cmpbro.offsetTop - gb.dom.scroller.scrollTop + "px";
				gb.dom.cmpDrag.style.width = cmpbro.clientWidth + "px";
				gb.dom.cmpDrag.style.height = cmpbro.clientHeight + "px";
				SHOW(gb.dom.cmpDrag);
				cmpbro.classList.add("move");
				cmpbro.setPointerCapture(evt.pointerId);

				cmpbro.onpointermove = function (event) {
					let top = top0 + (event.pageY - y0);
					top = Math.max(top, ymin);
					top = Math.min(top, ymax);
					gb.dom.cmpDrag.style.top = top - gb.dom.scroller.scrollTop + "px";
					for (let bro of cmpbros) {
						let h = cmpbro.offsetHeight;
						let y1 = Math.max(bro.offsetTop, top);
						let y2 = Math.min(bro.offsetTop + h, top + h);
						if (bro != cmpbro && (y2 - y1) > bro.offsetHeight / 2) {
							let beforebro = bro.nextElementSibling != cmpbro ? bro.nextElementSibling : bro;
							cmpbro.remove();
							gb.dom.scroller.insertBefore(cmpbro, beforebro);
							cmpbro.setPointerCapture(evt.pointerId);
							cmpbros = gb.dom.scroller.querySelectorAll(".gbCmpBro");
							break;
						}
					}
				};
				cmpbro.onpointerup = function (event) {
					cmpbro.onpointermove = null;
					cmpbro.releasePointerCapture(evt.pointerId);
					cmpbro.classList.remove("move");
					HIDE(gb.dom.cmpDrag);
				};
				break;
			}
			case "pointerup":
				break;
			default:
				console.log("unkown event", evt.type);
		}
	},

	async LoadReplicon(replicon) {
		console.log("LoadReplicon", replicon);
		let gb = this.gb;
		//"https://brg-preview.ai.sri.com/ajax-replicon-genbro-colf?orgid=" + replicon.orgid + "&chromosome=" + replicon.chromosome;
		let csv = [];
		if (replicon.orgid && replicon.chromosome) {
			// let url = '/gb-api/database/lishan_511145(COLI-K12).tsv'; //本地
			let url=''
			// console.log(replicon.centerGene,replicon.TaxId)
			if(replicon.TaxId){
				// url= `/gb-api/database/lishan_${replicon.TaxId}(${replicon.chromosome}).tsv`
				url = `https://www.imicap.com:8443/database/lishan_${replicon.TaxId}(${replicon.chromosome}).tsv`
			}else{
				// url = '/gb-api/database/lishan_511145(COLI-K12).tsv'; //生产
				url = 'https://www.imicap.com:8443/database/lishan_511145(COLI-K12).tsv'; //生产
			}
			// console.log(url)
			if (this.gb.debug == 1)
				url = this.gb.cache + replicon.orgid + "-" + replicon.chromosome + ".tsv";
			csv = await FetchCSV(url, "\t");
			if (!csv) {
				alert("failed to retrieve org " + replicon.orgid + " " + replicon.chromosome);
				replicon.orgname = replicon.orgid;
				replicon.name = replicon.chromosome;
				replicon.genes = [];
				return null;
			}
			// debugger
			console.log(url, csv, csv.length);
			if (this.gb.debug == 2) {
				url = replicon.orgid + "-" + replicon.chromosome + ".tsv";
				SaveCSV(csv, url, "\t");
			}
		} else {
			// console.log(gb.organisms[replicon.orgid]);

			let org = gb.organisms ? gb.organisms.find(o => o.id == replicon.orgid) : null;
			console.log(org);
			replicon.orgname = org ? org.label : replicon.orgid;
			replicon.name = "";
		}

		let s = 0;
		let counts = {};

		replicon.operons = [];
		replicon.insertions = [];
		replicon.genes = [];
		replicon.promoters = [];
		replicon.terminators = [];
		replicon.attenuators = [];
		replicon.transcriptions = [];
		replicon.mRNAs = [];
		replicon.rbss = [];
		replicon.extragenics = [];
		replicon.replicon = {};
		//replicon.elements = {};

		for (let r = 0; r < csv.length; r++) {
			let row = csv[r];
			if (!row[0] || row[0][0] != "$") {
				if (s)
					counts[s]++;
				continue;
			}
			let key = row[0].split(" ")[0].substr(1);
			switch (key) {
				case "Replicon":
					this.ParseReplicon(replicon, csv, r + 1);
					break;
				case "Transcription-Units":
					this.ParseOperons(replicon, csv, r + 1);
					break;
				case "GENES":
					this.ParseGenes(replicon, csv, r + 1);
					break;
				case "PROMOTERS":
					this.ParsePromoters(replicon, csv, r + 1);
					break;
				case "Terminators":
				case "Attenuators":
					this.ParseTerminatorsAttenuators(replicon, csv, r + 1, key);
					break;
				case "Transcription-Factor-Binding-Sites":
					this.ParseTranscriptions(replicon, csv, r + 1);
					break;
				case "mRNA-Binding-Sites":
					this.ParseMRNAs(replicon, csv, r + 1);
					break;
				case "Extragenic-Sites":
					this.ParseExtraGenics(replicon, csv, r + 1);
					break;
				case "Ribosome-Binding-Sites":
					this.ParseRBS(replicon, csv, r + 1);
					break;
				case "IS-Elements":
					this.ParseInsertions(replicon, csv, r + 1);
					break;
				default:
					console.log("invalid section", row);
			}
			//console.log(key, csv[++r]);
			counts[key] = 0;
			s = key;
		}
		replicon.init = true;
		console.log("load genome", counts);
	},

	ParseGenes(replicon, csv, r) {
		let genes = {};
		let keyname = {
			"*UNIQUE-ID": 'uid',
			"ACCESSION-1": 'accession',
			"NAME": 'name',
			"PRODUCT-NAME": 'pname',
			"SWISS-PROT-ID": 'sid',
			"START-BASE": 'baseStart',
			"END-BASE": 'baseEnd',
			"GENE-TYPE": 'type',
			"TU-COLOR": 'color'
		};
		let h = 0;
		let hdr = {
			uid: h++,
			acc: h++,
			name: h++,
			sym: h++,
			pname: h++,
			sid: h++,
			baseStart: h++,
			baseEnd: h++,
			dir: h++,
			type: h++,
			color: h++
		};

		let types = {};
		let index = [];
		let errColors = 0;
		r++;

		replicon.ctx.save();
		//replicon.ctx.font = ".9rem sans-serif";
		replicon.ctx.font = "1rem sans-serif";

		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}

			let gene = {};
			for (let h in hdr)
				gene[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (gene.baseStart)
				gene.baseStart = Number(gene.baseStart);
			if (gene.baseEnd)
				gene.baseEnd = Number(gene.baseEnd);
			gene.len = replicon.ctx.measureText(gene.name).width;
			gene.plen = replicon.ctx.measureText(gene.name + " : " + gene.pname).width;
			if (genes[gene.uid]) {
				console.log("dup gene", r, gene);
				return;
			}
			if (!gene.uid || !gene.name || !gene.baseStart || !gene.baseEnd) {
				console.log("invalid gene", r, gene.uid, gene.name, gene.pname, gene.baseStart);
				continue;
			}
			//fix this
			if (gene.baseStart > gene.baseEnd) {
				console.log("ParseGene: wrap around gene not implemented", r, gene.uid, gene.name, gene.pname, gene.baseStart);
				continue;
			}
			gene.dir0 = gene.dir; //save original direction to realigning orthologs
			if (!gene.color) {
				errColors++;
				gene.color = 0;
			}
			if (gene.color >= this.colorsText.length ||
				gene.color >= this.colorsFill.length) {
				console.log("invalid color", gene.color);
			}
			gene.fg = this.colorsText[gene.color];
			gene.bg = this.colorsFill[gene.color];

			genes[gene.uid] = gene;
			index.push(gene);

			if (!types[gene.type])
				types[gene.type] = 1;
			else
				types[gene.type]++;
			/*
					if (replicon.elements[gene.uid]) {
					console.log("dup gene", gene);
					}
					replicon.elements[gene.uid] = gene;
			*/
		}

		index.sort((a, b) => {
			return Number(a.baseStart) - Number(b.baseStart);
		});

		replicon.ctx.restore();
		replicon.genes = index.length ? index : null;
		//console.log("parse genes", types, genes.length);
		return;
	},

	ParseOperons(replicon, csv, r) {
		let operons = {};
		let h = 0;
		let hdr = {
			uid: h++,
			baseStart: h++,
			baseEnd: h++,
			quality: h++,
		};

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}

			let operon = {};
			for (let h in hdr)
				operon[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (operon.baseStart)
				operon.baseStart = Number(operon.baseStart);
			if (operon.baseEnd)
				operon.baseEnd = Number(operon.baseEnd);
			//operon.color = operon.quality ? "#CCE5CC" : "#D3D3D3";
			operon.color = operon.quality ? "#CCE5CC" : "#CCC";

			if (operons[operon.uid]) {
				console.log("dup operon", r, operon);
				return;
			}
			if (!operon.uid || !operon.baseStart || !operon.baseEnd || operon.baseEnd < operon.baseStart) {
				console.log("invalid start", r, operon.uid);
				continue;
			}
			operons[operon.uid] = operon;
			index.push(operon);
			/*
					if (replicon.elements[operon.uid]) {
					console.log("dup operon", operon);
					}
					replicon.elements[operon.uid] = operon;
			*/
		}
		index.sort((a, b) => {
			return Number(a.baseStart) - Number(b.baseStart);
		});
		replicon.operons = index.length ? index : null;
		//console.log("operons", csv.length);
		return;
	},

	ParsePromoters(replicon, csv, r) {
		let promoters = {};
		let h = 0;
		//UNIQUE-ID	NAME	POSITION	DIRECTION	SIGMA-FACTOR	HIGH-QUALITY-EVIDENCE?
		let hdr = {
			uid: h++,
			name: h++,
			pos: h++,
			dir: h++,
			sigma: h++,
			quality: h++,
		};

		let index = [];
		let minStart = 0;
		let maxEnd = 0;
		r++;
		let err = 0;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				//console.log("promoters", r, csv[r]);
				break;
			}

			let promoter = {};
			for (let h in hdr)
				promoter[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (promoter.pos)
				promoter.pos = Number(promoter.pos);

			if (promoters[promoter.uid]) {
				console.log("dup promoter", r, promoter);
				return;
			}
			if (!promoter.uid || !promoter.pos) {
				//console.log("invalid start", r, promoter.uid);
				err++;
				continue;
			}
			promoters[promoter.uid] = promoter;
			index.push(promoter);
			/*
					if (replicon.elements[promoter.uid]) {
					console.log("dup promoter", promoter);
					}
					replicon.elements[promoter.uid] = promoter;
			*/
		}
		index.sort((a, b) => {
			return Number(a.pos) - Number(b.pos);
		});
		replicon.promoters = index.length ? index : null;
		//console.log("promoters", 'err', err, replicon.promoters.length);
	},

	ParseTerminatorsAttenuators(replicon, csv, r, key) {
		let terminators = {};
		let h = 0;
		let hdr = {
			uid: h++,
			start: h++,
			end: h++,
			dir: h++,
		};

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}
			let terminator = {};
			for (let h in hdr)
				terminator[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (terminators[terminator.uid]) {
				console.log("dup terminator", r, terminator);
				return;
			}
			if (!terminator.uid || !terminator.start || !terminator.end) {
				console.log("invalid terminator", r, terminator);
				continue;
			}
			terminator.start = Number(terminator.start);
			terminator.end = Number(terminator.end);

			terminators[terminator.uid] = terminator;
			index.push(terminator);
			/*
					if (replicon.elements[terminator.uid]) {
					console.log("dup terminator", terminator);
					}
					replicon.elements[terminator.uid] = terminator;
			*/
		}
		index.sort((a, b) => {
			return Number(a.start) - Number(b.start);
		});

		replicon[key.toLowerCase()] = index.length ? index : null;

		//console.log(key, index);
		return;
	},

	ParseTranscriptions(replicon, csv, r) {
		let transcriptions = {};
		let h = 0;
		let hdr = {
			uid: h++,
			pos: h++,
			len: h++,
			tf: h++,
			tfname: h++,
			Q: h++,
			action: h++,
		};
		let poserr = 0;

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}

			let transcription = {};
			for (let h in hdr)
				transcription[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (transcriptions[transcription.uid]) {
				console.log("dup transcription", r, transcription);
				return;
			}
			if (!transcription.pos) {
				poserr++;
				continue;
			}

			if (!transcription.uid || !transcription.pos || !transcription.len) {
				console.log("invalid transcription", r, transcription);
				continue;
			}
			let pos = Number(transcription.pos);
			let len = Number(transcription.len);
			transcriptions[transcription.uid] = transcription;
			index.push(transcription);
			/*
					if (replicon.elements[transcription.uid]) {
					console.log("dup transcription", transcription);
					}
					replicon.elements[transcription.uid] = transcription;
			*/
		}

		index.sort((a, b) => {
			return Number(a.start) - Number(b.start);
		});
		replicon.transcriptions = index.length ? index : null;
		/*
		console.log("trans binding sites", 'err', poserr, replicon.transcriptions.length,
				replicon.transcriptions[0],
				replicon.transcriptions[1]);
		*/
		return;
	},

	ParseMRNAs(replicon, csv, r) {
		let mRNAs = {};
		let h = 0;

		let hdr = {
			uid: h++,
			start: h++,
			end: h++,
			tf: h++,
			tfName: h++,
			Q: h++,
			action: h++
		};

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$')
				break;

			let mrna = {};
			for (let h in hdr)
				mrna[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (mRNAs[mrna.uid]) {
				console.log("dup mrna", r, mrna);
				return;
			}
			if (!mrna.uid || !mrna.start || !mrna.end) {
				console.log("invalid mrna", r, mrna);
				continue;
			}
			mrna.start = Number(mrna.start);
			mrna.end = Number(mrna.end);

			if (!mrna.end || mrna.end < mrna.start) {
				console.log("mrna error", r, mrna);
				continue;
			}
			mrna.tfLen = replicon.ctx.measureText(mrna.tfName).width;
			mRNAs[mrna.uid] = mrna;
			index.push(mrna);
			/*
					if (replicon.elements[mrna.uid]) {
					console.log("dup mrna", mrna);
					}
					replicon.elements[mrna.uid] = mrna;
			*/
		}

		index.sort((a, b) => {
			return Number(a.start) - Number(b.start);
		});

		replicon.mRNAs = index.length ? index : null;
		//console.log("mRNAs", replicon.mRNAs);
	},

	ParseInsertions(replicon, csv, r) {
		let insertions = {};
		let h = 0;
		let hdr = {
			uid: h++,
			baseStart: h++,
			baseEnd: h++,
			quality: h++,
		};

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}

			let insertion = {};
			for (let h in hdr)
				insertion[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (insertion.baseStart)
				insertion.baseStart = Number(insertion.baseStart);
			if (insertion.baseEnd)
				insertion.baseEnd = Number(insertion.baseEnd);
			insertion.color = "#DDD";

			if (insertions[insertion.uid]) {
				console.log("dup insertion", r, insertion);
				return;
			}
			if (!insertion.uid || !insertion.baseStart || !insertion.baseEnd || insertion.baseEnd < insertion.baseStart) {
				console.log("invalid start", r, insertion.uid);
				continue;
			}
			insertions[insertion.uid] = insertion;
			index.push(insertion);
			/*
					if (replicon.elements[insertion.uid]) {
					console.log("dup insertion", insertion);
					}
					replicon.elements[insertion.uid] = insertion;
			*/
		}
		index.sort((a, b) => {
			return Number(a.baseStart) - Number(b.baseStart);
		});
		replicon.insertions = index.length ? index : null;

		return;
	},

	ParseExtraGenics(replicon, csv, r) {
		let extras = {};
		let h = 0;
		let hdr = {
			uid: h++,
			start: h++,
			end: h++,
			quality: h++,
		};

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}

			let extra = {};
			for (let h in hdr)
				extra[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (extra.start)
				extra.start = Number(extra.start);
			if (extra.end)
				extra.end = Number(extra.end);
			extra.color = "#BBB";

			if (extras[extra.uid]) {
				console.log("dup extra", r, extra);
				return;
			}
			if (!extra.uid || !extra.start || !extra.end || extra.end < extra.start) {
				console.log("invalid start", r, extra.uid);
				continue;
			}
			extras[extra.uid] = extra;
			index.push(extra);
			/*
					if (replicon.elements[extra.uid]) {
					console.log("dup extra", extra);
					}
					replicon.elements[extra.uid] = extra;
			*/
		}
		index.sort((a, b) => {
			return Number(a.start) - Number(b.start);
		});
		replicon.extragenics = index.length ? index : null;

		//console.log("extragenics", replicon.extragenics);
		return;
	},

	ParseRBS(replicon, csv, r) {
		let sites = {};
		let h = 0;
		let hdr = {
			uid: h++,
			start: h++,
			end: h++,
			quality: h++,
		};

		let index = [];
		r++;
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}

			let rbs = {};
			for (let h in hdr)
				rbs[h] = csv[r][hdr[h]] ? csv[r][hdr[h]].trim() : '';

			if (rbs.start)
				rbs.start = Number(rbs.start);
			if (rbs.end)
				rbs.end = Number(rbs.end);

			if (sites[rbs.uid]) {
				console.log("dup rbs", r, rbs);
				return;
			}
			if (!rbs.uid || !rbs.start || !rbs.end || rbs.end < rbs.start) {
				console.log("invalid start", r, rbs.uid);
				continue;
			}
			sites[rbs.uid] = rbs;
			index.push(rbs);
			/*
					if (replicon.elements[rbs.uid]) {
					console.log("dup rbs", rbs);
					}
					replicon.elements[rbs.uid] = rbs;
			*/
		}
		index.sort((a, b) => {
			return Number(a.start) - Number(b.start);
		});
		replicon.rbs = index.length ? index : null;

		//console.log("rbs", replicon.rbs);
		return;
	},

	ParseReplicon(replicon, csv, r) {
		for (; r < csv.length; r++) {
			if (!csv[r][0] || csv[r][0][0] == '$') {
				break;
			}
			let key = csv[r][0].trim();
			let val = csv[r][1].trim();
			key = name2key(key);
			if (key == 'length')
				val = Number(val);
			replicon[key] = val;
		}
		this.replicon = replicon.length;
	},

	CenterReplicons(gb) {
		console.log("CenterReplicons");
		for (let replicon of gb.replicon) {
			replicon.gene0 = null;
			if (!replicon.init)
				continue;
			if (!replicon.view)
				continue;
			if (!replicon.genes || !replicon.centerGene) {
				replicon.gene0 = null;
				replicon.view.base0 = gb.replicon[0].view.base0;
				replicon.view.x0 = gb.replicon[0].view.x0;
				replicon.view.y0 = gb.replicon[0].view.y0;
				replicon.view.dir = gb.replicon[0].view.dir;
				replicon.view.scale = gb.replicon[0].view.scale;
				continue;
			}

			//reset any previous flip
			for (let gene of replicon.genes)
				gene.dir = gene.dir0;

			let gene0 = replicon.genes.find(g => g.uid == replicon.centerGene);
			if (!gene0) {
				replicon.gene0 = null;
				console.log("can't locate center gene", replicon.centerGene, replicon);
				continue;
			}
			replicon.gene0 = gene0;
			replicon.view.base0 = parseInt((gene0.baseStart + gene0.baseEnd) / 2);
			replicon.view.x0 = replicon.view.width / 2;
			replicon.view.y0 = gb.isCmpBro ? 60 : replicon.view.height / 2;
			replicon.view.dir = 1;

			if (gb.replicon[0].gene0 && gb.replicon[0].gene0 != gene0 && replicon.debug_dir) {
				console.log("force flip");
				gene0.dir = gb.replicon[0].gene0.dir == '-' ? '+' : '-';
			}

			if (gb.replicon[0].gene0 && gb.replicon[0].gene0.dir0 != gene0.dir0) {
				console.log("flip replicon", replicon);
				replicon.view.dir = -1;
				for (let gene of replicon.genes)
					gene.dir = gene.dir0 == '-' ? '+' : '-';
			}
		}

		//reorder no orthologs to bottom of cmpbro
		let noOrthos = [];
		for (let replicon of gb.replicon) {
			if (!replicon.gene0) {
				let cmpbro = replicon.canvas.parentElement;
				noOrthos.push(cmpbro);
				cmpbro.remove();
			}
		}
		for (let cmpbro of noOrthos)
			gb.dom.scroller.appendChild(cmpbro);

		return;
	},

	UpdateTitles(gb) {
		for (let replicon of gb.replicon) {
			if (!replicon.init)
				continue;
			let html = "<span class='orgName'>" + replicon.orgname + " " + replicon.name + ": </span>";
			if (replicon.gene0) {
				html += "<span class='geneName'> Gene: " + replicon.gene0.name + "</span>";
				html += "<span class='productName'> Product: " + replicon.gene0.pname + "</span>";
			} else {
				if (gb.isCmpBro) {
					html += "<span class='geneName'> Gene: No Ortholog found</span>";
				} else {
					html += "<span class='geneName'> Gene: None selected</span>";
				}
			}
			replicon.title.innerHTML = html;
		}
	},

	InitHTMLText(gb) {
		let t0 = performance.now();
		let keys = {};
		let html = '';
		let ndoms = 0;
		for (let replicon of gb.replicon) {
			for (let g in replicon.genes) {
				let gene = replicon.genes[g];
				if (gene.name.indexOf("&") != -1 ||
					gene.name.indexOf("<") != -1) {
					gene.nameDom = ++ndoms;
					let color = "style=color:" + gene.fg;
					html += "<a " + color + ">" + gene.name + "</a>";
				}
				if (gene.pname &&
					gene.pname.indexOf("&") != -1 ||
					gene.pname.indexOf("<") != -1) {
					gene.pnameDom = ++ndoms;
					let color = "style=color:" + gene.fg;
					html += "<a " + color + ">" + gene.name + " : " + gene.pname + "</a>";
				}
			}
		}
		let t1 = performance.now();
		let overlay = document.createElement("div");
		overlay.classList.add("gb", "overlay");
		overlay.innerHTML = html;
		document.body.appendChild(overlay);
		gb.dom.overlay = overlay;

		let j = 0;
		for (let replicon of gb.replicon) {
			let canvas = replicon.canvas;
			for (let gene of replicon.genes) {
				if (gene.nameDom) {
					let a = overlay.children[gene.nameDom - 1];
					if (!a) {
						console.log("missing name dom", gene);
						continue;
					}
					gene.nameDom = a
					gene.len = a.offsetWidth;
					HIDE(a);
				}
				if (gene.pnameDom) {
					let a = overlay.children[gene.pnameDom - 1];
					if (!a) {
						console.log("missing name dom", gene);
						continue;
					}
					gene.pnameDom = a
					gene.plen = a.offsetWidth;
					HIDE(a);
				}
			}
		}
		let t2 = performance.now();
		//console.log('text init', ndoms, t1-t0, t2-t1, t2-t0);
	},

	InitToolTips(replicon) {
		let t0 = performance.now();
		let gb = this.gb;
		replicon.tips = {};
		replicon.tipsURL = 'https://brg-preview.ai.sri.com' + "/ajax-tooltip-as-json?orgid=" + replicon.orgid; //gb.host
		let url;
		return;
		switch (gb.debug) {
			case 1:
				url = this.gb.cache + replicon.orgid + "-tips.json";
				FetchJSON(url)
					.then((tips) => {
						replicon.tips = tips;
						//console.log("tips", Object.keys(tips).length, DT(t0), url);
					});
				break;
			case 2:
				url = replicon.tipsURL + "&all=T";
				FetchJSON(url)
					.then((tips) => {
						replicon.tips = tips;
						console.log("tipsall", Object.keys(tips).length, DT(t0), url);
						SaveJSON(tips, replicon.orgid + "-tips.json", 0);
					});
				break;
		}
	},

	LoadToolTip(replicon, uid, evt) {
		//https://brg-preview.ai.sri.com/ajax-tooltip-as-json?orgid=ECOLI&objs=EG11000,EG10999,TU00178,PM00249,TERM0-1288	

		let t0 = performance.now();
		let gb = this.gb;
		let url = replicon.tipsURL + "&objs=" + uid;

		FetchJSON(url)
			.then((tips) => {
				//brg-rt #9295 -- empty tooltip 		
				if (tips && Object.keys(tips).length == 0)
					tips[uid] = {
						uid: uid
					};
				if (!tips || !tips[uid])
					return;

				replicon.tips[uid] = tips[uid];
				if (gb.tip0 && uid == gb.tip0.uid) {
					gb.tip0 = null;
					this.OnHover(evt);
				}
			});
	},

	OnSearch(evt) {
		let dropdown = this.gb.dom.searchDropdown;
		let table = this.gb.dom.searchDropdown.querySelector(".searchGenes");

		// select if only one gene is visible in search menu
		if (table.nvisible == 1) {
			for (let tr of table.rows) {
				if (!tr.hide && tr.id) {
					return table.onclick({
						target: tr
					});
				}
			}
		} else {
			//multiple genes visible. Not sure what to do??
		}
	},

	OnSearchInit(evt) {
		let t0 = performance.now();
		let genes = this.gb.replicon[0].genes;
		if (!genes)
			return;

		let table = this.gb.dom.searchDropdown.querySelector(".searchGenes");
		table.onclick = this.OnSearchSelect.bind(this);
		if (table.searchInit)
			return;

		let html = "<tr>" +
			"<th>Gene Name: Product</th>" +
			"<th>Synonyms</th>" +
			"<th colSpan='3'>Accessions</th>" +
			"</tr>";

		html += "<tr id='base'><td></td></tr>";

		let words = {};
		for (let g in genes) {
			let gene = genes[g];
			html += "<tr id='" + gene.uid + "'>" +
				"<td>" + gene.name + ": " + gene.pname + "</td>" +
				"<td>" + gene.sym + "</td>" +
				"<td>" + gene.uid + "</td>" +
				"<td>" + gene.acc + "</td>" +
				"<td>" + gene.sid + "</td>" +
				"</tr>";
			words[gene.uid] = [gene.name,
			gene.pname,
			gene.sym,
			gene.acc,
			gene.sid,
			gene.uid
			]
				.join(" ")
				.toLowerCase();
		}

		table.innerHTML = html;
		table.init = true;

		for (let tr of table.rows) {
			let uid = tr.id;
			if (!uid || uid == 'base' | !words[uid])
				continue;
			tr.words = words[uid];

			for (let td of tr.cells)
				td.nobold = td.innerHTML;

			tr.onclick = this.OnSearchSelect.bind(this);
		}
		table.searchInit = true;
		table.boldCells = []; //list of cells with highlighted (bold) text
		HIDE(table);
	},

	OnSearchInput(evt) {
		let t0 = performance.now();
		let search = evt.target;
		let value = search.value;
		let dropdown = this.gb.dom.searchDropdown;
		let table = this.gb.dom.searchGenes;
		console.log(dropdown, '111');


		if (!value || !table) {
			HIDE(dropdown);
			return;
		}

		if (!table.searchInit)
			this.OnSearchInit(evt);

		value = value.replace(/\\/g, '');
		if (!value)
			return;
		let words = value.toLowerCase().split(' ');
		words = words.filter(w => w != '');

		let regWords = value.split(' ');
		regWords = regWords.filter(w => w != '');
		let regexp = [];
		for (let w in words)
			regexp.push(new RegExp(words[w], "ig"));
		console.log(regexp, '222');
		HIDE(table);

		for (let td of table.boldCells)
			td.innerHTML = td.nobold;
		table.boldCells = [];

		let nfilter = 0;
		for (var tr of table.rows) {
			tr.classList.remove('hide');
			tr.hide = false;

			if (!tr.id)
				continue;

			if (tr.id == 'base') {
				let [start, end] = value
					.replace(/,|-/g, ' ')
					.replace(/\s\s+/g, ' ')
					.split(' ');

				if (isNaN(start) || (end && isNaN(end)))
					tr.hide = true;
				else if (!end) // || Number(end) < Number(start))
					tr.cells[0].innerHTML = "<i>base coordinate:</i><b> " + start + "</b>";
				else
					tr.cells[0].innerHTML = "<i>base coordinates:</i><b> " + start + ' - ' + end + "</b>";
				tr.dataset.start = start;
				tr.dataset.end = end;
				continue;
			}

			if (!value || !tr.words)
				continue;

			for (var w in words) {
				if (tr.words.indexOf(words[w]) == -1) {
					tr.hide = true;
					nfilter++;
					break;
				}
				if (table.boldCells.length < 500) {
					for (let td of tr.cells) {
						td.innerHTML = td.innerHTML.replace(regexp[w], "<b>" + regWords[w] + "</b>");
						table.boldCells.push(td);
					}
				}
			}
		}
		SHOW(dropdown);
		let bbox = search.getBoundingClientRect();
		dropdown.style.top = bbox.bottom + "px";
		dropdown.style.left = bbox.left - 200 + "px";
		table.nvisible = 0;
		LazyScroll(table, 200);
		HIDE(this.gb.dom.marker);
		//console.log("filter", DT(t0), nfilter, table.rows.length);
	},

	OnSearchSelect(evt) {
		let gb = this.gb;
		let tr = evt.target.closest("tr");
		if (!tr || tr.tagName != 'TR')
			return;
		let table = tr.closest("table");

		HIDE(gb.dom.searchDropdown);

		let uid = tr.id;
		if (uid == 'base')
			return this.OnSearchBase(tr.dataset.start, tr.dataset.end);

		let gene = gb.replicon[0].genes.find(g => g.uid == uid);
		if (!gene)
			return;

		this.gb.dom.search.value = gene.name;
		gb.replicon[0].centerGene = gene.uid;
		gb.replicon[0].gene0 = gene;

		if (gb.replicon[0].view.scale > 10) //fix this
			gb.replicon[0].view.scale = 10;

		if (this.gb.isCmpBro)
			this.Orthos.Update(gb);

		this.CenterReplicons(gb);
		this.UpdateTitles(gb);

		this.Draw(gb);
		this.MarkBase0();
	},

	MarkBase0() {
		let gb = this.gb;
		let bbox = gb.replicon[0].canvas.getBoundingClientRect();
		let x0 = gb.replicon[0].view.x0 + bbox.left;
		let y0 = gb.replicon[0].view.y0 + bbox.top;
		if (gb.replicon[0].gene0.dir == '-')
			x0 += 10;
		let marker = gb.dom.marker;
		HIDE(marker);
		let root = document.documentElement;
		root.style.setProperty('--fly-top-end', y0 + "px");
		root.style.setProperty('--fly-left50', x0 + "px");
		root.style.setProperty('--fly-left75', x0 + 100 + "px");
		root.style.setProperty('--fly-left100', x0 + "px");
		marker.style.top = y0 + "px";
		marker.style.left = x0 + "px";

		setTimeout(() => {
			SHOW(marker);
		}, 10);
	},

	OnSearchBase(min, max) {
		min = Number(min);
		max = !isNaN(max) ? Number(max) : '';
		if (max && min > max) {
			let tmp = min;
			min = max;
			max = tmp;
		}

		let gb = this.gb;
		if (!max) {
			for (let replicon of gb.replicon) {
				let view = replicon.view;
				view.x0 = view.width / 2;
				view.y0 = view.height / 2 - 70;
				view.base0 = min;
			}
		}

		let view = gb.replicon[0].view;
		let canvas = gb.replicon[0].canvas;
		let bbox = canvas.getBoundingClientRect();
		if (max) {
			for (let replicon of gb.replicon) {
				let view = replicon.view;
				let range = max - min + 4;
				let nlines = 0;
				let yprev = null;
				let x0 = 0,
					y0 = 0;
				for (let axis of view.axes) {
					if (yprev != null && yprev > axis.y2)
						console.log("invalid axis order!", axis);
					if (yprev != axis.y2 && axis.y2 > -4 && axis.y2 < view.height) {
						console.log(nlines, yprev, axis.y2, axis.b1, view.height, window.innerHeight, bbox.height);
						nlines++;
						if (yprev == null) {
							x0 = axis.x1;
							y0 = axis.y2;
						}
					}
					yprev = axis.y2
				}
				console.log("nlines", nlines, x0, y0);
				view.x0 = x0 + 2;
				view.y0 = y0;
				view.base0 = view.dir == 1 ? min : max;
				view.scale = range / (view.width * nlines);
			}
		}

		this.Draw(gb);
		return;
	},

	OnSpeed(evt) {
		let gb = this.gb;
		let speed = gb.dom.speed;
		if (!speed.classList.contains('active'))
			return;
		let x = evt.clientX - speed.offsetLeft;
		if (x < 0 || x > speed.clientWidth)
			return;

		switch (evt.type) {
			case "mousemove":
				gb.speed = parseInt(200 * x / speed.clientWidth - 100);
				gb.dom.speedPos.style.left = x + "px";
				gb.dom.speedVel.innerText = gb.speed;
				gb.dom.speedVel.style.left = (x - 10) + "px";
				break;
		}
	},

	OnZoomLevel(evt) {
		let gb = this.gb;
		let newlevel = evt.target.id;
		let scale = 10;
		let view = gb.replicon[0].view;
		let nlines = parseInt(view.height / 70); // fix this
		let maxpixels = nlines * view.width;
		let maxscale = Math.ceil(gb.replicon[0].length / maxpixels);

		switch (newlevel) {
			case "genome":
				scale = Math.min(1000, maxscale);
				break;
			case "operons":
				scale = 50;
				break;
			case "genes":
				scale = 15;
				break;
			case "sites":
				scale = 5;
				break;
			case "sequence":
				scale = .1;
				break;
		}

		for (let replicon of gb.replicon)
			replicon.view.scale = scale;
		this.Draw(gb);
		this.SaveState();
	},

	OnPlay(evt) {
		let gb = this.gb;
		let play = evt.target.closest("button");
		let icon = play.querySelector(".fas");
		let speed = gb.dom.speed;
		let speedbar = gb.dom.speedbar;
		let speedVel = gb.dom.speedVel;

		if (!play.isactive) {
			play.isactive = true;
			SHOW(speedbar);
			speed.classList.add("active");
			speedVel.innerText = gb.speed;
			icon.classList.remove("fa-play");
			icon.classList.add("fa-pause");
			icon.nextElementSibling.innerText = "Pause";
			play.timerId = setInterval(function () {
				this.OnPan();
			}.bind(this), 5);
		} else {
			play.isactive = false;
			HIDE(speedbar);
			speed.classList.remove("active");
			icon.classList.add("fa-play");
			icon.classList.remove("fa-pause");
			icon.nextElementSibling.innerText = "Auto Scroll";
			clearInterval(play.timerId);
		}
	},

	OnPan() {
		let gb = this.gb;
		if (gb.isCmpBro) {
			let dx = -gb.speed / 10;
			for (let replicon of gb.replicon) {
				replicon.view.x0 += dx;
			}
		} else {
			let dy = -gb.speed / 10;
			gb.replicon[0].view.y0 += dy;
		}

		gb.dom.search.value = '';
		HIDE(gb.dom.marker);
		this.Draw(gb);
		return;
	},

	OnKey(evt) {
		let gb = this.gb;
		if (evt.target != document.body)
			return;

		let view = gb.replicon[0].view;

		//set base0 to center of screen if centergene isn't selected
		if (!gb.replicon[0].gene0) {
			let x0 = view.width / 2;
			let y0 = view.height / 2;
			let axis0 = null;
			for (let axis of view.axes) {
				if (x0 >= axis.x1 && x0 <= axis.x2) {
					if (!axis0 || Math.abs(y0 - axis.y2) < Math.abs(y0 - axis0.y2))
						axis0 = axis;
				}
			}
			if (axis0) {
				let base0 = axis0.b1 + (x0 - axis0.x1) * view.basesPerPixel * view.dir;
				y0 = axis0.y2;
				view.x0 = x0;
				view.y0 = y0;
				view.base0 = base0;
			}
		}

		switch (evt.key) {
			case 'ArrowUp':
				for (let replicon of gb.replicon)
					replicon.view.scale *= 1.1;
				break;
			case 'ArrowDown':
				for (let replicon of gb.replicon)
					replicon.view.scale *= .9;
				break;
			case 'ArrowLeft':
				for (let replicon of gb.replicon)
					replicon.view.x0 -= 25;
				break;
			case 'ArrowRight':
				for (let replicon of gb.replicon)
					replicon.view.x0 += 25;
				break;
			default:
				return;
		}
		this.Draw(gb);
		return StopEvent(evt);
	},

	OnPopup(evt, popup) {
		//can be called by qhelp dialog so 'this' isn't defined
		let gb = GB.gb;
		let btn = evt.target.closest("button");
		if (!btn)
			btn = evt.target.closest("div");

		// fix this for nexted menus!
		let bbox = btn.getBoundingClientRect();
		let btnLeft = bbox.left; //btn.offsetLeft;
		let btnTop = bbox.top; //btn.offsetTop
		if (btn == gb.dom.btnSeqSelectDNA || btn == gb.dom.btnSeqSelectAA) {
			btnLeft = gb.dom.btnSequence.offsetLeft;
			btnTop = gb.dom.btnSequence.offsetTop;
		}

		if (!popup)
			popup = btn.popup;

		if (!popup) {
			console.log("invalid popup", btn);
			return;
		}

		if (popup.onright) {
			popup.style.left = '';
			popup.style.right = "5px";
			popup.style.top = btnTop + 20 + "px";
		} else {
			//center
			let bbox = popup.getBoundingClientRect();
			let overflow = Math.max(0, btnLeft + bbox.width / 2 - window.innerWidth);
			let left = btnLeft + btn.clientWidth / 2 - bbox.width / 2 - overflow;
			left = Math.max(0, left);
			popup.style.left = left + "px";
			popup.style.right = '';
			popup.style.top = btnTop + 20 + "px";
		}

		let popups = gb.dom.controls.querySelectorAll(".popup");
		for (let dlg of popups) {
			if (dlg == popup) {
				VISIBLE(dlg);
			} else {
				HIDDEN(dlg);
				if (dlg.onclose)
					dlg.onclose(evt);
			}
		}

		let btnClose = popup.querySelector(".fa-window-close");
		if (btnClose) {
			btnClose.onclick = Dismiss;
		} else {
			popup.onmouseleave = Dismiss;
			document.body.onclick = Dismiss;
		}

		let title = popup.querySelector(".titlebar");
		if (title) {
			title.onmousedown = function (event) {
				let x0 = popup.offsetLeft;
				let y0 = popup.offsetTop;
				let mx0 = event.pageX;
				let my0 = event.pageY;

				document.body.onmousemove = function (event) {
					let dx = event.pageX - mx0;
					let dy = event.pageY - my0;
					popup.style.right = '';
					popup.style.left = (x0 + dx) + "px";
					popup.style.top = (y0 + dy) + "px";
				};
			}
			title.onmouseup = function (event) {
				document.body.onmousemove = null;
			}
		}

		if (popup.onopen)
			popup.onopen(evt);

		return StopEvent(evt);

		function Dismiss(evt) {
			HIDDEN(popup);
			document.body.onmousemove = null;
			document.body.onmouseup = null;
			document.body.onclick = null;

			//if (evt.type == 'click' && popup.onclose)
			if (popup.onclose)
				popup.onclose(evt);
		}
	},

	WelcomeTip() {
		let show = localStorage.getItem("welcome");
		if (show == "no")
			return;

		//default is not to show
		localStorage.setItem("welcome", "no");

		let btn = this.gb.dom.btnSequence;
		let popup = this.gb.dom.welcome;

		let check = popup.querySelector(".gbWelcome .donotshow input");
		check.checked = true;
		check.onclick = function () {
			if (check.checked) {
				localStorage.setItem("welcome", "no");
			} else {
				localStorage.setItem("welcome", "yes");
			}
		}

		this.OnPopup({
			target: btn
		}, popup);
	},

	InitLegend(gb) {
		let icons = gb.dom.legend.querySelectorAll(".icon");

		for (let canvas of icons) {
			let ctx = canvas.getContext('2d')
			let scaleDevice = DevicePixelRatio(ctx);
			canvas.width = canvas.clientWidth * scaleDevice;
			canvas.height = canvas.clientHeight * scaleDevice;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(scaleDevice, scaleDevice);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let x = 1;
			let y = 5 + 15;
			let l = 30;
			let h = 15;
			let id = canvas.closest("tr").id;
			switch (id) {
				case "protein": {
					ctx.fillStyle = "#a4c862";
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + l - 10, y);
					ctx.lineTo(x + l, y - h / 2);
					ctx.lineTo(x + l - 10, y - h);
					ctx.lineTo(x, y - h);
					ctx.lineTo(x, y);
					ctx.fill();
					ctx.stroke();
					break;
				}
				case "rna": {
					ctx.fillStyle = "#a4c862";
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + l - 10, y);
					ctx.lineTo(x + l, y - h);
					ctx.lineTo(x, y - h);
					ctx.lineTo(x, y);
					ctx.fill();
					ctx.stroke();
					break;
				}
				case "pseudo": {
					ctx.fillStyle = "#a4c862";
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + l - 10, y);
					ctx.lineTo(x + l, y - h / 2);
					ctx.lineTo(x + l - 10, y - h);
					ctx.lineTo(x, y - h);
					ctx.lineTo(x, y);
					ctx.moveTo(x + 5, y);
					ctx.lineTo(x + l - 10, y - h);
					ctx.moveTo(x + l - 10, y);
					ctx.lineTo(x + 5, y - h);
					ctx.fill();
					ctx.stroke();
					break;
				}
				case "phantom": {
					ctx.fillStyle = "#a4c862";
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + l - 10, y);
					ctx.lineTo(x + l, y - h / 2);
					ctx.lineTo(x + l - 10, y - h);
					ctx.lineTo(x, y - h);
					ctx.lineTo(x, y);
					ctx.fill();
					ctx.stroke();
					ctx.save();
					ctx.beginPath();
					ctx.lineWidth = 2;
					ctx.moveTo(x + 5, y);
					ctx.lineTo(x + l - 10, y - h);
					ctx.moveTo(x + l - 10, y);
					ctx.lineTo(x + 5, y - h);
					ctx.fill();
					ctx.stroke();
					ctx.restore();
					break;
				}
				case "promoter": {
					let x1 = x + 5;
					let x2 = x1 + 15;
					let y1 = y;
					let y2 = y - 15;
					let dy = 4;
					let dx = 8;
					ctx.save();
					ctx.strokeStyle = "#0C0C6C";
					ctx.fillStyle = "#0C0C6C";
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x1, y2);
					ctx.lineTo(x2, y2);
					ctx.stroke();
					ctx.beginPath();
					ctx.lineTo(x2 - dx, y2 - dy);
					ctx.lineTo(x2 - dx, y2 + dy);
					ctx.lineTo(x2, y2);
					ctx.fill();
					break;
				}
				case "terminator":
				case "attenuator": {
					let x1 = x + 5;
					let x2 = x1 + 10;
					h -= 5;
					let r = 4;
					const PI = Math.PI;
					ctx.beginPath();
					ctx.moveTo(x1, y);
					ctx.lineTo(x1, y - h);
					ctx.stroke();

					ctx.beginPath();
					//ctx.setLineDash([5,5]);
					ctx.setLineDash([2, 2]);
					ctx.moveTo(x2, y);
					ctx.lineTo(x2, y - h);
					ctx.stroke();

					ctx.beginPath();
					ctx.setLineDash([]);
					ctx.moveTo(x1, y - h);
					ctx.arc(x1, y - h - r, r, PI / 2, -PI / 2, 0);
					if (id == 'terminator') {
						ctx.lineTo(x2, y - h - r * 2);
					} else { //attenuator
						let xx = (x1 + x2) / 2;
						let yy = y - h - r * 2;
						ctx.lineTo(xx - 1, yy);
						ctx.moveTo(xx - 1, yy - 5)
						ctx.lineTo(xx - 1, yy + 5);
						ctx.moveTo(xx + 1, yy - 5);
						ctx.lineTo(xx + 1, yy + 5);
						ctx.moveTo(xx + 1, yy);
						ctx.lineTo(x2, yy);
					}
					ctx.moveTo(x2, y - h);
					ctx.arc(x2, y - h - r, r, PI / 2, -PI / 2, 1);
					ctx.stroke();
					break;
				}
				case "tfbs":
					ctx.save();
					ctx.setLineDash([3, 3]);
					x += 5;
					//ctx.strokeStyle = "#9E1750"; //red
					//ctx.fillStyle = "#F9DDE9";
					ctx.strokeStyle = "#4F7850"; //green
					ctx.fillStyle = "#E3FAE3";
					ctx.fillRect(x, y, 10, -12);
					ctx.strokeRect(x, y, 10, -12);
					ctx.restore();
					break;

				case "operon":
					h += 5;
					l += 19;
					ctx.fillStyle = "#CCE5CC"; // "#D3D3D3"
					ctx.fillRect(x, y, l, -h);
					ctx.strokeStyle = "#000000";
					ctx.lineWidth = .5;
					ctx.strokeRect(x, y, l, -h);
					ctx.lineWidth = 1;

					x += 5;
					y -= 2;
					h -= 5;
					l = 10;
					ctx.fillStyle = "#a4c862";
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + l - 10, y);
					ctx.lineTo(x + l, y - h / 2);
					ctx.lineTo(x + l - 10, y - h);
					ctx.lineTo(x, y - h);
					ctx.lineTo(x, y);
					ctx.fill();
					ctx.stroke();

					x += 18;
					l = 20;
					ctx.fillStyle = "#a4c862";
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x + l - 10, y);
					ctx.lineTo(x + l, y - h / 2);
					ctx.lineTo(x + l - 10, y - h);
					ctx.lineTo(x, y - h);
					ctx.lineTo(x, y);
					ctx.fill();
					ctx.stroke();
					break;

				case "mrna":
					y -= 10;
					ctx.beginPath();
					ctx.strokeStyle = "#FF0000";
					ctx.moveTo(x, y);
					ctx.lineTo(x + l, y);
					for (let dx = 0; dx <= l; dx += 5) {
						ctx.moveTo(x + dx, y);
						ctx.lineTo(x + dx, y + 5);
					}
					y += 10;
					ctx.stroke();
					break;
				case "extragenic":
					x += 5;
					l -= 20;
					h -= 2;
					ctx.fillStyle = "#BBB";
					ctx.fillRect(x, y, l, -h);
					ctx.strokeStyle = "#000000";
					ctx.lineWidth = .5;
					ctx.strokeRect(x, y, l, -h);
					ctx.lineWidth = 1;
					break;
				case "insertion":
					ctx.fillStyle = "#F0F0F0";
					ctx.strokeStyle = "#BBB";
					ctx.lineWidth = .5;
					h += 20;
					ctx.fillRect(x, y, l, -h);
					ctx.strokeRect(x, y, l, -h);
					ctx.lineWidth = 1;
					h -= 20;
					break;

				case "rbs": {
					let x1 = x + 8;
					let x2 = x1 + 7;
					ctx.fillStyle = "#0B24FB";
					ctx.moveTo(x1, y);
					ctx.lineTo(x1, y - h + 5);
					ctx.lineTo((x1 + x2) / 2, y - h);
					ctx.lineTo(x2, y - h + 5);
					ctx.lineTo(x2, y);
					ctx.lineTo(x1, y);
					ctx.fill();
					break;
				}
				default:
					ctx.fillText("???", canvas.width / 2 / scaleDevice - 20, canvas.height / 2 / scaleDevice);
					break;
			}
		}

		let checks = gb.dom.legend.querySelectorAll("input[type='radio']");
		let all = null;
		gb.filters = {};
		for (let check of checks) {
			check.onchange = this.OnLegend.bind(this);
			if (check.id == 'auto' && check.name == 'all')
				all = check;
			if (check.id == 'auto')
				check.checked = true;
			let td = check.closest("tr").cells[4]; //element name
			gb.filters[check.name] = {
				label: td,
				enabled: true,
			};
		}
	},

	OnLegend(evt) {
		let gb = this.gb;
		let btn = evt.target;
		let checks = this.gb.dom.legend.querySelectorAll("input#" + btn.id);

		for (let check of checks) {
			if (btn.name == 'all' || check.name == btn.name) {
				check.checked = true;
				gb.filters[check.name].state = check.id;
			}
		}

		gb.semzoom = -1; //force filter reset
		this.Draw(gb);
		return;
	},

	RestoreFilters() {
		let gb = this.gb;
		gb.filters = {};
		let filters = sessionStorage.getItem("filters");
		if (!filters)
			return;
		gb.filters = JSON.parse(filters);

		for (let f in gb.filters) {
			if (gb.filters[f]) {
				this.OnPopup({
					target: this.gb.dom.btnLegend
				});
				this.Draw(this.gb);
				break;
			}
		}
	},

	ParseColors() {
		this.colorsFill = [];
		for (let c in this.colorsMarkus) {
			let [r, g, b] = this.colorsMarkus[c].split(",");
			r = parseInt(r * 255).toString(16);
			g = parseInt(g * 255).toString(16);
			b = parseInt(b * 255).toString(16);
			if (r.length < 2)
				r = '0' + r;
			if (g.length < 2)
				g = '0' + g;
			if (b.length < 2)
				b = '0' + b;
			this.colorsFill[c] = "#" + r + g + b;
		}
		//SaveJSON(this.colorsFill, "colorsFill.json", 1);
	},

	CreateHashFill() {
		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");
		let scale = 1; //DevicePixelRatio(ctx);	
		ctx.scale(scale, scale);
		let w = 5 * scale;
		let h = 5 * scale;
		canvas.width = w;
		canvas.height = h;

		let hashFill = [];
		for (let bg of this.colorsFill) {
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, w, h);
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = .5;
			ctx.beginPath();
			ctx.moveTo(w, 0);
			ctx.lineTo(0, h);
			ctx.stroke();

			hashFill.push(ctx.createPattern(canvas, "repeat"));
		}
		this.hashFill = hashFill;
	},

	// from Markus' email 12/19/22
	colorsMarkus: [
		"1.0, 0.4, 0.4",
		"0.647, 0.788, 0.388",
		"0.525, 0.639, 0.871",
		"0.988, 0.584, 0.337",
		"0.769, 0.392, 0.608",
		"0.957, 0.792, 0.094",
		"0.306, 0.729, 0.498",
		"0.6, 0.196, 0.8",
		"0.0, 0.706, 0.69",
		"0.753, 0.424, 0.424",
		"0.471, 0.494, 0.729",
	],

	colorsFill: [
		//"#FFFFFF",
		"#E0E0E0", // PeterK wanted a gray instead of white, for stray genes.
		"#ff6666",
		"#a4c862",
		"#85a2de",
		"#fb9455",
		"#c4639b",
		"#f4c917",
		"#4eb97e",
		"#9931cc",
		"#00b4af",
		"#c06c6c",
		"#787db9"
	],

	colorsText: [
		"#000000",
		"#000000",
		"#FFFFFF",
		"#000000",
		"#000000",
		"#FFFFFF",
		"#000000",
		"#FFFFFF",
		"#FFFFFF",
		"#FFFFFF",
		"#FFFFFF",
		"#FFFFFF"
	],

	SaveState() {
		let gb = this.gb;
		if (!gb)
			return;
		let replicon = gb.replicon[0];
		let state = {
			url: location.href,
			orgid: replicon.orgid,
			chromosome: replicon.chromosome,
			centerGene: replicon.centerGene,
			base0: replicon.view.base0,
			x0: replicon.view.x0,
			y0: replicon.view.y0,
			scale: replicon.view.scale
		};
		localStorage.setItem("gb", JSON.stringify(state));

	},

	RestoreState() {
		let gb = this.gb;
		let state = localStorage.getItem("gb");
		if (!state)
			return;
		state = JSON.parse(state);
		//console.log("restore",  state);
		if (state.url != location.href ||
			state.orgid != gb.replicon[0].orgid ||
			state.chromosome != gb.replicon[0].chromosome) {
			console.log("skip restore");
			return;
		}
		let view = this.gb.replicon[0].view;
		view.x0 = state.x0;
		view.y0 = state.y0;
		view.base0 = state.base0;
		view.scale = state.scale;
		this.Draw(this.gb);
	}
};

GB.icon.rateControl = new Image(20, 65);
GB.icon.rateControl.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAABBCAYAAADRyoRJAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA1xJREFUWIXlmF9IU1Ecxz/nupwbRGkz6kEqHxrTrCd96CGjHsL1GKFBBv15U19qbo/ZU8SsHrInCyKDAoneUoKoRVj0EhW1stDUoGi6LNmWOL09qNO7e+7dvXNJ0BcGZ7/f+X3u7+x3/t0JpDq/FYqaQOwFfIBnwTEOvAM1AsptCIxkRwrt18ubIX0JOAwUyR+WURrUXuA0BL9JgOF9QC9QlgOUrQmYOwyhR8uAnXtA7QdcNmGLSoI4AIGnAi6sBeUNsCVP2KKGwb3TAcpJM5jbvQa32zGfRjJNMjlj1HUbJI4roDaaPTYYrCUWayEWayEYrM2RpGhSQGzP0cuOtivYr6qZPA6Ztatrf6ZdV7c50/b7K/F4liZCa+vD7FBVQFjVWdWApXSE6NSFKpYibUg65La2paH4/ZU0NGwDoK9vmPv3h+wDu7peZtoejysDfPHiq8Yn0+oMebmSyTQTE6lMO5ekVV6BCl/l/w+4CiulomItfX2HLAU3NNxlbGzKHOh0FlFd7ck2S+V06g9GHXB0dIqamhuWgKOjUzpboSf23Oqt5XC4nl27Nkp9r159p709Yg9YW7uJ+voKqa+42HhghsBAIEJZWYnUF4//NgT++0VRAMMMQ6E64vFWzScUqjPjqaY7tsvloLS0RGczk4DwHLqL51JwNiCVSpNKGR4Fsw7mhywF5giW6q+sFMOi+Hwb8Pm0d6loNE40OmEKNFRjo5ezZ3drbOfODdDRMZBfhtFonHv3PupsZhIQnsmVqQ3Nmk7sPGQ8sU+dqqGycr3UNzQ0ybVrb6Q+Q+DRo1WG21ckMmYKlA65u/s1Dx58lgaNjPwyygMB4Wmg2LCHPaULXRT9b7hunZPm5ipLwT097/j5c1oH1GRYXu7iypX9WFF//7AUqNHk5DRXr5rfo5f3zZIqIJwC5KeRfc0UvCire0jlCyyopEvP67X2xvvhg35vlALfvz9hCSh5G0UBfliKtqZxB6iDIDT71OBg3s8YdIDoBTRrzeu9nidP3FEg0QN8yjelZfoEao8CHUngGJBYASwBSjO0JxbmYfszUA8y/++bXY2D8MOZ56CZ2MEIrNkB3AKsXGhmgJtANQSeLBqllyS4WAGzR0DUzwdQvuCIAW+BxzB3G0JfsiP/APowCP9vY/eXAAAAAElFTkSuQmCC";


async function TestColors() {
	let url = "https://brg-preview.ai.sri.com/ajax-all-orthos-colors-by-orgids-as-json?lead-orgid=ECOLI&orgids=ECOLI,APLAT,GCF_000008525";

	let t0 = performance.now();
	let orthos = await FetchJSON(url);
	console.log("orthos", DT(t0), orthos);
}

function MinimizeBioCycHeader() {
	let doc = parent != window.self ? parent.document : document;
	let logo = doc.querySelector("#small-logo img");
	if (!logo)
		return;

	//add header expand/collapse icon
	LoadFontAwesome();
	let div = doc.createElement("div");
	div.style.margin = "6px";

	//center change/search text but class 'centered' not defined in iframe parent
	//div.classList.add("centered");
	div.style.fontSize = "1.25rem";
	div.style.display = "flex";
	div.style.alignItems = "center";
	div.style.justifyContent = "center";

	div.innerHTML = "<span>change/search database <i class='fas fa-caret-down'></i></span>";
	let icon = div.querySelector(".fa-caret-down");
	icon.style.cursor = "pointer";
	icon.onclick = ExpandBioCycHeader;

	let hdr = doc.querySelector("#changeDBAndQuickSearch");
	hdr.parentNode.insertBefore(div, hdr);
	hdr.style.display = "none";

	let menubarLogo = doc.createElement("img");
	menubarLogo.height = 20;
	menubarLogo.width = parseInt(logo.width * menubarLogo.height / logo.height);
	menubarLogo.src = logo.src;
	menubarLogo.style.filter = "invert(100%)";
	menubarLogo.style.margin = "auto 0px";

	menubar = doc.querySelector(".pure-g");
	if (!menubar)
		return;
	let bar1 = menubar.children[0];
	let bar2 = menubar.children[1];

	menubar.style.minWidth = "200px"; //biocyc menubar wrap around bug
	bar1.style.width = "400px";
	bar2.style.width = "calc(100% - 550px)";
	bar2.style.minWidth = "400px";
	menubar.insertBefore(menubarLogo, bar1);

	logo.parentNode.remove();
	logo.remove();

	return;

	function ExpandBioCycHeader(evt) {
		let icon = evt.target;
		let expand = icon.classList.contains("fa-caret-down");
		if (expand) {
			icon.classList.remove("fa-caret-down");
			icon.classList.add("fa-caret-up");
			hdr.style.display = '';

		} else {
			icon.classList.remove("fa-caret-up");
			icon.classList.add("fa-caret-down");
			hdr.style.display = 'none';
		}
		AdjustGenbroIFrame();
	}

	function LoadFontAwesome() {
		var link = doc.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		link.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css');
		doc.head.appendChild(link);
	}
}

function AdjustGenbroIFrame() {
	let doc = parent != window.self ? parent.document : document;
	let banner = doc.querySelector("#topBannerMenu");

	//no scrollbar in iframe
	let iframe = parent.document.querySelector(".genbro-iframe");
	let h1 = GB.gb.dom.controls.clientHeight;
	let h2 = GB.gb.dom.genbro.clientHeight;
	if (iframe) {
		iframe.style.height = h1 + h2 + "px";
	}
}

window.addEventListener('resize', GB.OnResize.bind(GB), false);
window.addEventListener('load', GB.OnLoad.bind(GB), false);