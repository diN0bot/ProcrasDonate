
var PD_ToolbarManager = {
		
	//prefManager : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
	classify_button : null,
	progress_button: null,
	// database
	//db: null,
	// models
	Site: null,
	Tag: null,
	SiteTagging: null,
	// tag name, image pairs
	images : {},

	/*
	* do stuff when new browser window opens 
	* use a settimeout to allow window to open if masterpassword is set
	*/
	initialize : function() {
		this.removeEventListener('load', PD_ToolbarManager.initialize, false);
		//this.addEventListener('unload', PD_ToolbarManager.uninitialize, false);
		
		//var container = gBrowser.tabContainer;
		//gBrowser.addEventListener("load", PD_ToolbarManager.updateButtons, false);
		
		//container.addEventListener("TabOpen", PD_ToolbarManager.updateButtons, false);
		//container.addEventListener("TabClose", PD_ToolbarManager.updateButtons, false);
		//container.addEventListener("TabMove", PD_ToolbarManager.updateButtons, false);
		//container.addEventListener("TabSelect", PD_ToolbarManager.updateButtons, false);
		
		PD_ToolbarManager.classify_button = document.getElementById("PD-classify-toolbar-button");
		PD_ToolbarManager.progress_button = document.getElementById("PD-progress-toolbar-button");
		
		var tag_names = ['ProcrasDonate', 'TimeWellSpent', 'Unsorted'];
		if (Tag.count() == 0) {
			for (var i=0; i < tag_names.length; i++) {
				Tag.create({ tag: tag_names[i] });
			}
		}
		
		for (var i=0; i < tag_names.length; i++) {
			PD_ToolbarManager.images[tag_names[i]] = "chrome://ProcrasDonate/skin/"+tag_names[i]+"Icon.png";	
		}
		
		// Update button images and text
		PD_ToolbarManager.updateButtons();
	},

	// get site classification for current URL and update button image
	updateButtons : function(site, tag) {
		
		if (PD_ToolbarManager.classify_button) {
			if (!site || !tag) {
				var d = PD_ToolbarManager.getDbRowsForLocation();
				site = d.site;
				tag = d.tag;
			}
			
			PD_ToolbarManager.classify_button.setAttribute("image", PD_ToolbarManager.images[tag.tag]);
			PD_ToolbarManager.classify_button.setAttribute("label", tag.tag);
		}
    },
    
    getDbRowsForLocation : function() {
    	/* 
    	 * returns { site: {}, sitetagging: {}, tag: {} }
    	 */
		var href = _href();
		var host = _host(href);

		var site = null;
		var sitetagging = null;
		var tag = null;
		
		site = Site.select({ url: href });

		if (site.length == 0) {
			site = Site.create({ name: host, url: host, url_re: host });
			tag = Tag.select({ id: 1 })[0]
			sitetagging = SiteTagging.create({ site_id: site.id, tag_id: tag.id});
		}
		else {
			site = site[0]
			sitetagging = SiteTagging.select({ site_id: site.id })

			if (sitetagging.length == 0) {
				sitetagging = SiteTagging.create({ site_id: site.id, tag_id: 1});
			} else {
				sitetagging = sitetagging[0];
			}
			tag = Tag.select({ id: sitetagging.tag_id })[0]
		}
		
		return { site: site, sitetagging: sitetagging, tag: tag }
    },

    onClassifyButtonCommand : function(e) {
    	var d = PD_ToolbarManager.getDbRowsForLocation();
		var site = d.site;
		var tag = d.tag;
		var sitetagging = d.sitetagging;
		
		var new_tag_id = parseInt(tag.id) + 1;
		if (new_tag_id > 3) { new_tag_id = 1; }

		// update tag
		db.execute("update sitetaggings set tag_id="+new_tag_id+" where site_id="+site.id);
		tag = Tag.select({ id: new_tag_id })[0]
		
		PD_ToolbarManager.updateButtons(site, tag);
    },
    
    onProgressButtonCommand : function(e) {
    	//set "goals" substate
    	window.content.location.href="http://localhost:8000/my_impact/";
    }

};

window.addEventListener("load", PD_ToolbarManager.initialize, false);