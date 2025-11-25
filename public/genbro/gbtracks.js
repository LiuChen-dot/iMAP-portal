"use strict";

/// Copyright (C) 2023-2024 by SRI International.  All rights reserved.

var GBTracks = {
    version: 4.2,

    tracks: [],
    
    Init(gb)
    {
	console.log("GB Tracks", this.version);
	
	let scroller = document.createElement("div");
	scroller.classList.add("gbTrackScroller");
	gb.dom.genbro.appendChild(scroller);	    
	gb.dom.trackScroller = scroller;

	gb.dom.btnTracks = gb.dom.controls.querySelector("#tracks");
	gb.dom.btnTracks.onclick = GB.OnPopup.bind(this);
	gb.dom.tracks = gb.dom.controls.querySelector(".gbTracksMenu");
	//gb.dom.tracks.onright = true;
	gb.dom.tracks.onopen = this.OnPopupTracks.bind(GBTracks);
	gb.dom.btnTracks.popup = gb.dom.tracks;
	if (gb.isCmpBro)
	    gb.dom.btnTracks.disabled = true;
	
	gb.dom.btnAddTrackFile = gb.dom.controls.querySelector("#trackfile");
	gb.dom.btnAddTrackFile.onchange = this.OnAddTracksFile.bind(this);
/*
	setTimeout(() => {
	    GB.OnPopup({target: gb.dom.btnTracks});
	    let gfffile = "ecoli-gff2-chipchip-landick-large.gff";
	    FetchCSV(gfffile, "\t").
		then( (gff) => {
		    this.AddTracks(gfffile, gff);
		});
	}, 500);
*/
    },
    
    Draw(gb)
    {
	let view = gb.replicon[0].view;
	if (!view)
	    return;

	for(let track of this.tracks) {
	    HIDE(track.canvas);
	    if (!track.showPoint && !track.showBar && !track.showTrack) {
		track.hide = true;
		continue;
	    }
	    track.hide = false;
	    SHOW(track.canvas);
	    
	    let blocks = [];
	    for(let line of view.axes) {
		//fix this
		if (!line.ticks)
		    line.ticks = view.axes[0].ticks;

		let ctx = gb.replicon[0].ctx;
		ctx.strokeStyle = "#EDEDED";
		ctx.beginPath();
		for(let b of line.ticks) {
		    let x = line.x1 + (b - line.baseMin) / view.scale;
		    let y = line.y2;
		    ctx.moveTo(x, y);
		    ctx.lineTo(x, y+300);
		}
		ctx.stroke();

		for(let d of track.data) {
		    if (d.v < track.min || d.v > track.max)
			continue;
		    if (d.e < line.baseMin || d.s > line.baseMax)
			continue;
		    let x1 = line.x1 + (d.s - line.baseMin) / view.scale;
		    let x2 = line.x1 + (d.e - line.baseMin) / view.scale;
		    x1 = parseInt(Math.max(0, x1));
		    x2 = parseInt(Math.min(view.width, x2));
		    let row0 = null;
		    for(let row of blocks) {
			let overlapped = 0;
			for(let x = x1; x <= x2; x++) {
			    if (row[x]) {
				overlapped=1;
				break;
			    }
			}
			if (!overlapped) {
			    row0 = row;
			    break;
			}
		    }
		    if (!row0) {
			row0 = [];
			for(let x = 0; x <= view.width; x++)
			    row0[x] = 0; //fix this;
			blocks.push(row0);
		    }
		    for(let x = x1; x <= x2; x++)
			row0[x] = d.v;
		}
	    }
	    track.blocks = blocks;
	}	    

	let colors = [
	    "#AB8351",
	    "#C3873D",
	    "#F17C23",
	    "#F16921",
	];

	for(let track of this.tracks) {
	    let h = (track.showPoint || track.showBar) ? 100 : 20;
	    if (track.showTrack)
		h += track.blocks.length * 20;
	    track.height = h + "px";
	    track.canvas.style.height = track.height;
	    track.canvas.height = track.canvas.clientHeight * GB.scaleDevice;
	    
	    let canvas = track.canvas;
	    if (canvas.hide) 
		continue;
	    let ctx = track.ctx;	    
	    ctx.setTransform(1,0,0,1,0,0);
	    ctx.clearRect(0,0, canvas.width, canvas.height);
	    ctx.scale(GB.scaleDevice, GB.scaleDevice);
	    ctx.translate(20, 0);

	    for(let line of view.axes) {
		ctx.strokeStyle = "#EDEDED";
		ctx.beginPath();
		let y = 0;
		let h = track.canvas.height;
		for(let b of line.ticks) {
		    let x = line.x1 + (b - line.baseMin) / view.scale;
		    ctx.moveTo(x, y);
		    ctx.lineTo(x, y+h);
		}
		ctx.moveTo(0, 20);
		ctx.lineTo(2000, 20);	    	    
		ctx.moveTo(0, 90);
		ctx.lineTo(2000, 90);	    	    
		ctx.stroke();

		if (track.showPoint || track.showBar) {
		    ctx.font = "8px Arial";
		    ctx.fillText(track.max, 0, 18);
		    ctx.fillText(track.min, 0, 98);

		    ctx.strokeStyle = "red";
		    ctx.fillStyle = "red";	    
		    ctx.beginPath();
		    let sy = 70 / (track.max-track.min);
		    for(let d of track.data) {
			if (d.v < track.min || d.v > track.max)
			    continue;
			if (d.e < line.baseMin || d.s > line.baseMax)
			    continue;
			let x1 = line.x1 + (d.s - line.baseMin) / view.scale;
			let x2 = line.x1 + (d.e - line.baseMin) / view.scale;
			let y = 90 - (d.v - track.min) * sy;
			if (track.showBar) {
			    let h = 90-y;
			    if (h <= 0)
				h = 1;
			    ctx.fillRect(x1, y, x2-x1+1, h);
			} else {
			    ctx.moveTo(x1, y);
			    ctx.lineTo(x2, y);
			}		    
		    }
		    ctx.stroke();
		    y = 100;
		} else
		    y = 20;
		
		if (track.showTrack) {
		    for(let row of track.blocks) {
			for(let x1 = 0; x1 <= view.width; x1++) {
			    if (row[x1]) {
				let v = 0;
				for(let x2 = x1; x2 < view.width; x2++) {
				    if (!row[x2]) {
					v /= (x2-x1+1);
					let c = parseInt((v-track.min) / (track.max - track.min) * colors.length);
					if (c < 0)
					    c = 0;
					else if (c > colors.length)
					    c = colors.length;
					ctx.fillStyle = colors[c];
					ctx.fillRect(x1, y, x2-x1+1, 5);
					x1 = x2+1;
					break;
				    }
				    v += row[x2];
				}
			    }
			}
			y += 20;
		    }
		}
	    }

	    let title =  (track.id+1) + ": " + track.method + ":" + track.source;
	    ctx.save();
	    ctx.fillStyle = "#1A1D6E";
	    ctx.font = "bold 10px Arial";
	    ctx.fillText(title, 0, 10);
	    ctx.restore();
	}
    },

    OnPopupTracks(evt)
    {
	let gb = GB.gb;
	if (gb.showTracks) {
	    HIDE(gb.dom.trackScroller);
	    HIDE(gb.dom.tracks);
	    gb.dom.btnTracks.children[1].innerText = "Tracks";
	    gb.hasTracks = false;
	    gb.showTracks = false;
	    gb.replicon[0].canvas.style.height = '';
	    GB.OnResize();
	    return;
	}
	
	SHOW(gb.dom.trackScroller);
	SHOW(gb.dom.tracks);
	gb.dom.btnTracks.children[1].innerText = "Hide Tracks";
	gb.hasTracks = this.tracks.length;
	gb.showTracks = true;
	if (gb.hasTracks)
 	    gb.replicon[0].canvas.style.height = '90px';
	GB.OnResize();
    },

    UpdateTrack(track)
    {
	let gb = GB.gb;
	let table = gb.dom.tracks.querySelector("table");
	
	if (!table.innerHTML) {
	    table.innerHTML = 
		"<tr>" +
		"<th id='points'>Graph</th>" +
		"<th id='track'>Track</th>" +
		"<th>Min</th>" +	    
		"<th>Max</th>" +	    
		"<th class='align-left'>Method</th>" +	    
		"<th class='align-left'>Source</th>" +	    
		"<th class='align-left'>File</th>" +	    
		"</tr>";
	}

	let select = "<select>" +
	    "<option>Point</option>" +
	    "<option>Bar</option>" + 	    
	    "<option>(none)</option>" +	    	    
	    "</select>";
	
	let tr = document.createElement("tr");
	tr.id = track.id;
	tr.innerHTML = 
	    "<td>" + select + "</td>" +
	    "<td class='align-center'><input checked type='checkbox' name='track' id='auto'></td>" +
	    "<td data-key='min' contenteditable>" + track.min.toFixed(2) + "</td>" +
	    "<td data-key='max' contenteditable>" + track.max.toFixed(2) + "</td>" +
	    "<td class='align-left'>" + track.method + "</td>" +
	    "<td class='align-left'>" + track.source + "</td>" +
	    "<td class='align-left'>" + track.file + "</td>" +
	    "</tr>";
	
	let selects = tr.querySelectorAll("select");
	for(let select of selects) {
	    select.onchange = () => {
		let tid = select.closest("tr").id;
		let track = this.tracks[tid];
		switch(select.value) {
		case 'Point':
		    track.showPoint = true;
		    track.showBar = false;
		    break;
		case 'Bar':
		    track.showPoint = false;
		    track.showBar = true;
		    break;
		default:
		    track.showPoint = false;
		    track.showBar = false;
		    break;
		}
		GB.Draw(GB.gb);
	    };
	}

	let checks = tr.querySelectorAll("input[name='track']");
	for(let check of checks) {
	    check.onchange = () => {
		let tid = check.closest("tr").id;
		let track = this.tracks[tid];
		track.showTrack = check.checked;
		GB.Draw(GB.gb);
	    };
	}

	let minmax = tr.querySelectorAll('td[contenteditable]');
	for(let td of minmax) {
	    td.onblur = this.OnMinMax.bind(this);
	    td.onkeypress = function(event) {
		td.classList.remove('badval');
		if (event.which === 13) {
		    event.preventDefault();
		}
	    }
	}

	table.appendChild(tr);
    },

    OnMinMax(evt)
    {
	let td = evt.target;
	let value = td.innerText;
	let t = td.closest("tr").id;
	
	console.log(t, "value", value, typeof value, value == "", isNaN(value));
	if (value == "")
	    value = td.dataset.key == 'min' ? this.tracks[t].min : this.tracks[t].max;

	if (isNaN(value)) {
	    td.classList.add('badval');
	    return;
	}

	if (td.dataset.key == 'min')
	    this.tracks[t].min = Number(value);
	else
	    this.tracks[t].max = Number(value);

	GB.Draw(GB.gb);
    },
    
    OnMouse(evt)
    {
	let gb = GB.gb;
	if (!gb)
	    return;

	if (!this.trackMouse)
	    this.trackMouse = {};
	
	let fake = {
	    type: evt.type,
	    target: gb.replicon[0].canvas,
	    clientX: evt.clientX,
	    clientY: gb.replicon[0].view.axes[0].y2,
	    shiftKey: evt.shiftKey,
	    buttons: evt.buttons
	};

	switch(evt.type) {
	case 'mousedown':
	    this.trackMouse.mx0 = evt.clientX;
	    this.trackMouse.my0 = evt.clientY;
	    this.trackMouse.sx0 = gb.dom.trackScroller.scrollLeft;
	    this.trackMouse.sy0 = gb.dom.trackScroller.scrollTop;	    
	    GB.OnMouseDown(fake);
	    break;
	case 'mouseup':
	    GB.OnMouseUp(fake);
	    break;
	case 'mousemove':
	    gb.mouse.move++;
	    if (gb.mouse.drag && evt.buttons == 1) {
		let dx = evt.clientX - this.trackMouse.mx0;
		let dy = evt.clientY - this.trackMouse.my0;
		if (Math.abs(dy) > Math.abs(dx)) {
		    let sy = this.trackMouse.sy0 - dy;
		    gb.dom.trackScroller.scrollTo(0, sy);
		} else {
		    GB.OnDrag(fake);
		}
	    }
	    break;
	}

	return StopEvent(evt);	
    },

    OnWheel(evt)
    {
	let gb = GB.gb;

	StopEvent(evt);

	let fakeEvt = {
	    fake: true,
	    target: gb.replicon[0].canvas,
	    clientX: evt.clientX,
	    clientY: gb.replicon[0].view.axes[0].y2,
	    deltaY: evt.deltaY < -5 ? -5 : evt.deltaY > 5 ? 5 : evt.deltaY,
	    timeStamp: evt.timeStamp,
	}
	return GB.OnWheel(fakeEvt);
    },

    OnAddTracksFile(evt)
    {
        var file = evt.currentTarget.files[0];
	console.log(file);

	const reader = new FileReader();
	reader.onabort = () => console.log('file reading was aborted');
	reader.onerror = () => console.log('file reading has failed');
	reader.onload = () => {
	    let gff = reader.result;
	    let csv = ParseCSV(gff, '\t');
	    this.AddTracks(file.name, csv);
	};
	
	reader.readAsText(file);

	evt.target.value = null;
    },
    
    AddTracks(gfffile, csv)
    {
	let gb = GB.gb;

	let tracks = {};
	let source = csv[0][1].trim();
	for(let r = 0; r < csv.length; r++) {
	    if (!csv[r][0])
		continue;
	    if (csv[r][1] != source) {
		console.log("error source", r, gff[r]);
		return;
	    }
	    let method = csv[r][2].trim();
	    if (!tracks[method]) {
		tracks[method] = {
		    source: source,
		    method: method,
		    file: gfffile,
		    showPoint: true,
		    showBar: false,
		    showTrack: true,
		    data: []
		};
		tracks[method].id = this.tracks.length;
		this.tracks.push(tracks[method])
	    }
	    
	    tracks[method].data.push( {
		s: Number(csv[r][3].trim()),
		e: Number(csv[r][4].trim()),
		v: Number(csv[r][5].trim()),
	    });
	}

	for(let m in tracks) {
	    let track = tracks[m];
	    let data = track.data;
	    let min = data[0].v;
	    let max = data[0].v;	    
	    for(let d of data) {
		if (d.v < min)
		    min = d.v;
		else if (d.v > max)
		    max = d.v;
	    }
	    track.min = min;
	    track.max = max;

	    track.canvas = document.createElement("canvas");
	    track.canvas.classList.add('gbTrack');
	    track.ctx = track.canvas.getContext('2d');
	    track.height = 100 + 3 * 40 + "px";
	    track.canvas.style.height = track.height;
	    track.canvas.onwheel = this.OnWheel.bind(this);
	    track.canvas.onmousedown = this.OnMouse.bind(this);
	    track.canvas.onmouseup = this.OnMouse.bind(this);
	    track.canvas.onmousemove = this.OnMouse.bind(this);
	    gb.dom.trackScroller.appendChild(track.canvas);
	    this.UpdateTrack(track);
	};

	//fake popup
	gb.showTracks = false;
	this.OnPopupTracks();
    },

};
