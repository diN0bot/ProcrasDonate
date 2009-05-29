
var PD_ToolbarManager = {
		
	classify_button : null,
	progress_button: null,
	// tag name, image pairs
	images : {},
	default_image_name : null,

	/*
	* do stuff when new browser window opens 
	* use a settimeout to allow window to open if masterpassword is set
	*/
	initialize : function() {
		this.removeEventListener('load', PD_ToolbarManager.initialize, false);

		PD_ToolbarManager.classify_button = document.getElementById("PD-classify-toolbar-button");
		PD_ToolbarManager.progress_button = document.getElementById("PD-progress-toolbar-button");
		
		var tag_names = ['Unsorted', 'ProcrasDonate', 'TimeWellSpent'];
		if (Tag.count() == 0) {
			for (var i=0; i < tag_names.length; i++) {
				Tag.create({ tag: tag_names[i] });
			}
		}
		
		for (var i=0; i < tag_names.length; i++) {
			PD_ToolbarManager.images[tag_names[i]] = "chrome://ProcrasDonate/skin/"+tag_names[i]+"Icon.png";	
		}
		PD_ToolbarManager.default_image_name = tag_names[0];
		
		// Update button images and text
		PD_ToolbarManager.updateButtons({ url: _href() });
	},

	/*
	 * get site classification for current URL and update button image
	 * @param options: contains either {site, tag} or {url}
	 */
	updateButtons : function(options) {
		if (PD_ToolbarManager.classify_button) {
			var site = null;
			var tag = null;
			
			if ('site' in options && 'tag' in options) {
				site = options.site;
				tag = options.tag;
			} else {
				var url = null;
				if ('url' in options) {
					url = options.url;
				} else {
					url = _href();
				}
				var d = PD_ToolbarManager.getDbRowsForLocation(url);
				site = d.site;
				tag = d.tag;
			}
			
			// alter classify button
			PD_ToolbarManager.classify_button.setAttribute("image", PD_ToolbarManager.images[tag.tag]);
			PD_ToolbarManager.classify_button.setAttribute("label", tag.tag);
			
			var tooltip_text = PD_ToolbarManager.classify_button.getAttribute("tooltiptext");
			var new_tooltip_text = tooltip_text.replace(/: [\w]+\./, ": "+tag.tag+".");
			PD_ToolbarManager.classify_button.setAttribute("tooltiptext", new_tooltip_text);
			
			// alter progress bar
		}
    },
    
    getDbRowsForLocation : function(url) {
    	/* 
    	 * returns { site: {}, sitetagging: {}, tag: {} }
    	 */
		var href = url;
		var host = _host(href);
		var site = null;
		var sitetagging = null;
		var tag = null;
		site = Site.get_or_null({ url: href });
		
		if (!site) {
			site = Site.create({ name: host, url: href, host: host, url_re: host });
			tag = Tag.get_or_null({ tag: PD_ToolbarManager.default_image_name })
			sitetagging = SiteTagging.create({ site_id: site.id, tag_id: tag.id});
		}
		else {
			sitetagging = SiteTagging.get_or_null({ site_id: site.id })
			if (!sitetagging) {
				tag = Tag.get_or_null({ tag: PD_ToolbarManager.default_image_name })
				sitetagging = SiteTagging.create({ site_id: site.id, tag_id: tag.id});
			} else {
				tag = Tag.get_or_null({ id: sitetagging.tag_id })
			}
		}
		
		return { site: site, sitetagging: sitetagging, tag: tag }

    },

    onClassifyButtonCommand : function(e) {
    	var d = PD_ToolbarManager.getDbRowsForLocation(_href());
    	var site = d.site;
    	var tag = d.tag;
    	var sitetagging = d.sitetagging;
    	
    	var new_tag_id = parseInt(tag.id) + 1;
		if (new_tag_id > 3) { new_tag_id = 1; }

		
		// update tag
		db.execute("update sitetaggings set tag_id="+new_tag_id+" where site_id="+site.id);
    	

		tag = Tag.get_or_null({ id: new_tag_id })
		
		PD_ToolbarManager.updateButtons({ site: site, tag: tag });
    },
    
    onProgressButtonCommand : function(e) {
    	//@TOD set my_impact substate to "goals"
    	window.content.location.href = constants.IMPACT_URL;
    }

};

window.addEventListener("load", PD_ToolbarManager.initialize, false);
