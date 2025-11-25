"use strict";

/// Copyright (C) 2023-2024 by SRI International.  All rights reserved.

var GBMenu = {
	version: "1.3",

	OnContextMenu(evt) {
		let canvas = evt.target.closest("canvas");
		if (!canvas || !canvas.classList.contains("gbReplicon"))
			return;

		let gb = GB.gb;
		this.tip0 = null;
		if (gb && gb.tip00) {
			//console.log(gb.tip00.t, gb.tip00);
			this.tip0 = gb.tip00;
			switch (gb.tip00.t) {
				case 'G': //gene -- protein, rna, pseudo, or phantom
					break;
					//implement for other elements		
				case 'O': //operon
				case 'I': //insertion
				case 'P': //promoter
				case 'T': //terminator
				case 'A': //attenuator
				case 'r': //mRNA binding sitesrna
				case 't': //tanscription-factor binding sites
				case 'e': //extragenic sites
				default:
					return false;
			}
			let menu = document.querySelector(".gbContextMenu");
			menu.style.left = evt.pageX + 10 + "px";
			menu.style.top = evt.pageY - 5 + "px";
			menu.onmouseleave = dismiss;
			menu.onclick = dismiss;
			document.body.addEventListener('click', dismiss, false);
			document.body.addEventListener('touchstart', dismiss, false);
			//kr:Sep-25-2023 In the regular genbro, hide this menu item from the right-click
			// contextmenu, because this is only makes sense in the Comparative mode.
			if (!gb.isCmpBro)
				document.getElementById('menuGenbroGene').style.display = "none";
			SHOW(menu);
			return false; // cancel default menu

			function dismiss() {
				HIDE(menu);
				document.body.removeEventListener('click', dismiss, false);
				document.body.removeEventListener('touchstart', dismiss, false);
				gb.replicon[0].canvas.focus();
				gb.mouse.drag = false;
			}
		}
	},

	///kr:Sep-13-2023 This fn returns a list of 3 strings:
	/// - the UID (the frame ID) of the gene at the tip (= cursor position),
	///   when the event was triggered.
	/// - the orgid
	/// - the replicon ID
	///
	getGeneUidOrgidbyTip() {
		let gb = GB.gb;
		if (!this.tip0)
			return;

		let uidOrgid0 = [];
		for (let replicon of gb.replicon) {
			replicon.gene0 = null;
			for (let gene of replicon.genes) {
				if (this.tip0 == gene) {
					uidOrgid0 = [gene.uid, replicon.orgid, replicon.chromosome];
					console.log("getGeneUidOrgidbyTip center", uidOrgid0, gene.name, replicon.name);
					/* // This replaces the result by the orthologous gene of the lead orgid:
					if (replicon != gb.replicon[0]) {
					  uidOrgid0 = GB.orthoMap[replicon.orgid][gene.uid] ? [ GB.orthoMap[replicon.orgid][gene.uid][0][1] , gb.replicon[0].orgid ] : null; 
					}
					*/
					console.log("getGeneUidOrgidbyTip [UID,orgid] of gene: ", uidOrgid0);
					return uidOrgid0;
				}
			}
		}
	},

	getLeadGeneUidbyGeneUidOrgid(uidOrgid0) { /// unfinished
		let [uid0, orgid] = uidOrgid0;
		let leadGeneUid = "";
		// This replaces the leadGeneUid by the orthologous gene of the lead orgid:
		if (orgid != gb.replicon[0].orgid) {
			let orthos = GB.orthoMap[replicon.orgid][replicon.chromosome][gene.uid];
			leadGeneUid = orthos ? [orthos[0][1], gb.replicon[0].orgid] : null;
			return leadGeneUid;
		}
	},

	//// ::::::::::::::: Right-Click ContextMenu Fns ::::::::::::::: 
	OnCenterGene(evt) {
		let gb = GB.gb;
		if (!this.tip0)
			return;

		let [uid0, orgid] = GBMenu.getGeneUidOrgidbyTip();
		for (let replicon of gb.replicon) {
			replicon.gene0 = null;
			for (let gene of replicon.genes) {
				if (this.tip0 == gene) {
					uid0 = gene.uid;
					//console.log("center", uid0, gene.name, replicon.name);
					if (replicon != gb.replicon[0]) {
						let orthos = GB.orthoMap[replicon.orgid][replicon.chromosome][gene.uid];
						uid0 = orthos ? orthos[0][1] : null;
					}
					if (uid0)
						gb.replicon[0].centerGene = uid0;
					break;
				}
			}
		}
		if (uid0) {
			if (gb.isCmpBro)
				GB.Orthos.Update(gb);
			GB.CenterReplicons(gb);
			GB.UpdateTitles(gb);
			GB.Draw(gb);
			GB.MarkBase0();
		}
	},

	///kr:Sep-13-2023 From the current gene, bring up a gene page in a new Tab.
	OnGenePageNewTab(evt) {
		let [uid0, orgid] = GBMenu.getGeneUidOrgidbyTip();
		// Target URL example: /gene?orgid=ECOLI&id=EG11024
		window.open('/gene?orgid=' + orgid + '&id=' + uid0, '_blank');
	},

	/// For the onclick event (= mouse left-click).  Jumps to gene page, in the same Tab.
	OpenBioCycPage(evt, orgid, uid0, type, name) {
		let gb = GB.gb;
		let host = gb.host ? gb.host : '';

		switch (type) {
			case 'G': //gene
				//OpenLink(evt, host + '/getid?id=' + orgid + ':' + uid0);
				//OpenLink(evt, host+'/gene?orgid=' + orgid + '&id=' + uid0);
				//window.top.location.href = 
				//break;
			case 'O': //operon	    
				//OpenLink(evt, host + '/getid?id=' + orgid + ':' + uid0);
				// ECOLI/NEW-IMAGE?object=TU0-12788
				//OpenLink(evt, host + '/' + orgid + '/NEW-IMAGE?object=' + uid0);
				//break;
			case 'I': //insertion
			case 'P': //promoter
			case 'T': //terminator
			case 'A': //attenuator
			case 'r': //mRNA binding sitesrna
			case 't': //tanscription-factor binding sites
			case 'e': //extragenic sites
				//kr:Dec-11-2023 It turns out that the same URL skeletton can be used for all of these objects
				OpenLink(evt, host + '/getid?id=' + orgid + ':' + uid0, name);
				break;
			default:
				console.log("OpenBioCycPage: type", type, "not implemented");
				return;
		}
	},

	/// orgid will become the new lead-orgid
	OnNewCmpInternal(uid0, orgid) {
		let gb = GB.gb;
		// Put the orgid at the top, which will become the new lead-orgid :
		let cmpOrgids = [orgid];
		// Add the remaining orgids :
		for (let replicon of gb.replicon) {
			if (replicon.orgid != orgid) {
				cmpOrgids[cmpOrgids.length] = replicon.orgid;
			}
		}
		// Invoke the multiorg Chooser, and then the Multi-Genome Browser
		//kr:Sep-14-2023 ## is the orgid section even needed ??
		let genBrowseURL = "/" + orgid + "/invoke-browse-orthologs?type=LOCUS-POSITION&object=" + uid0;
		///onChangedOrgsStored.subscribe(updateRSorgCount);
		//onChangedOrgsStored.subscribe(alert(genBrowseURL));

		if (GB.ptools)
			GB.ptools.selectOrgsAndGo(genBrowseURL, GB.ptools.navBoxMultiorgChooser);

		// Direct Target URL example: 
		// /genbro/ortho.shtml?lead-orgid=ECOLI&lead-genes=EG10241&orgids=ECOLI,BSUB
		// window.location.href = '/genbro/ortho.shtml?lead-orgid=' + orgid + '&lead-genes=' + uid0 + '&orgids=' + cmpOrgids.join(",") ;
	},

	///kr:Sep-13-2023 From the current gene, bring up the Multi-Organism Selector,
	/// so the user can confirm or change the set of organisms to compare with.
	/// Then, the current page is replaced with a new Comparative Genbro display,
	/// in which the current gene becomes the new lead-gene (at the top of the display),
	/// spawning a new alignment (and necessitating a call to fetch a new set of orthologs).
	OnNewCmp(evt) {
		let gb = GB.gb;
		let [uid0, orgid, chromosome] = GBMenu.getGeneUidOrgidbyTip();
		// A white gene has no ortholog info, therefore it needs to be ignored:
		if (gb.isCmpBro && !GB.orthoMap[orgid][chromosome][uid0]) {
			alert("The selected gene has no ortholog information. " +
				"Therefore, no alignment can be performed.");
			return;
		}

		GBMenu.OnNewCmpInternal(uid0, orgid);
	},

	/// For a right-click menu event, in the Comparative Genbro mode.
	/// Jumps to the regular genbro, centered around the gene, in the same Tab.
	OnGenbroGene(evt) {
		let [uid0, orgid, replicon] = GBMenu.getGeneUidOrgidbyTip();
		window.top.location.href = '/genbro/genbro.shtml?orgid=' + orgid + '&gene=' + uid0 + '&replicon=' + replicon;
	},

	OnSeqAlignOrthoNT() {
		let [uid0, orgid, replicon] = GBMenu.getGeneUidOrgidbyTip();
		if (GB.ptools) {
			GB.ptools.getTypeObjectPage().gene = uid0; // Will be extracted by GB.ptools.getOrthologsForMSA()
			GB.ptools.invokeOrthologMSA();
		}
	},

	OnSeqAlignOrthoAA() {
		let [uid0, orgid, replicon] = GBMenu.getGeneUidOrgidbyTip();
		let aaURL = "/msa1.html?orgid=" + orgid + "&orthologs=" + uid0 + ":" + orgid + "&type=pep";
		if (GB.ptools)
			GB.ptools.selectOrgsAndGo(aaURL, GB.ptools.navBoxMultiorgChooser);
	},


	//// ::::::::::::::: Browse Button Fns ::::::::::::::: 

	//kr:Oct-9-2023 This is supposed to bring up a Comparative Genbro page.
	// However, for this, a new lead-gene has to be specified by the user, such that
	// the genomes can be aligned according to the orthologs of the lead-gene.
	// Therefore, the first step is to show a popup dialog containing a text search box
	// for selecting a gene of interest.  After clicking on the OK button,
	// the second step will show the multiorg Chooser for selecting the organisms to compare with.
	// After clicking on that OK button, the last step jumps to the desired Comparative Genbro page.
	OnNewCmpAskForGene() {
		let gb = GB.gb;
		let btn = gb.dom.btnBrowse;
		let dlg = gb.dom.newCmpDlg;
		// dlg stands for: dialog
		if (!dlg.dom) {
			dlg.dom = {};
			dlg.dom.search = dlg.querySelector(".searchBox");
			dlg.dom.search.onfocus = OnSearchInit.bind(this);
			dlg.dom.search.onchange = GB.OnSearch.bind(GB);
			dlg.dom.search.oninput = GB.OnSearchInput.bind(GB);
			dlg.dom.ok = dlg.querySelector("#ok");
			dlg.dom.ok.onclick = OnOK.bind(this);
			//dlg.dom.cancel = dlg.querySelector("#cancel");
			//dlg.dom.cancel.onclick = Dismiss;
		}
		dlg.dom.search.value = '';

		dlg.style.left = btn.offsetLeft - 50 + "px";
		dlg.style.top = btn.offsetTop + 20 + "px";
		VISIBLE(dlg);

		dlg.querySelector(".fa-window-close").onclick = function () {
			HIDDEN(dlg);
		};

		let table = gb.dom.searchDropdown.querySelector(".searchGenes");

		function OnOK() {
			if (dlg.gene) {
				//alert("Multi Org Browser " + dlg.gene.name);
				let orgid = gb.replicon[0].orgid;
				let chromosome = gb.replicon[0].chromosome;
				// A white gene has no ortholog info, therefore it needs to be ignored:
				if (gb.isCmpBro && !GB.orthoMap[orgid][chromosome][dlg.gene.uid]) {
					alert("The selected gene has no ortholog information. " +
						"Therefore, no alignment can be performed.");
					return;
				}
				Dismiss();
				// Bring up the multiorg Chooser (and from there, jump to next page)
				GBMenu.OnNewCmpInternal(dlg.gene.uid, orgid);
			}
		}

		function Dismiss() {
			HIDDEN(dlg);
			gb.replicon[0].canvas.focus();

		}

		function OnSearchInit(evt) {
			GB.OnSearchInit(evt);
			table.onclick = OnSearchSelect.bind(this);
		}

		function OnSearchSelect(evt) {
			HIDE(gb.dom.searchDropdown);
			let tr = evt.target.closest("tr");
			if (!tr || !tr.id)
				return;
			let uid = tr.id;
			let gene = gb.replicon[0].genes.find(g => g.uid == uid);
			if (!gene)
				return;
			dlg.gene = gene;
			dlg.dom.search.value = gene.name;
			table.onclick = GB.OnSearchSelect.bind(GB);
		}
	},

	//kr:Oct-3-2023 Bring up the Replicon Selector dialog, if multiple replicons exist.
	// Otherwise, directly enter genbro.
	OnNewRepl() {
		let gb = GB.gb;
		let orgid = gb.replicon[0].orgid;
		window.top.location.href = '/' + orgid + '/select-gen-el';
	},

};

//override browser right click context menu
window.oncontextmenu = GBMenu.OnContextMenu.bind(GBMenu);