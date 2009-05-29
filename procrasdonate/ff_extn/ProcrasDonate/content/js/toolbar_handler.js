
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
	 * @param options: contains either {sitegroup, tag} or {url}
	 */
	updateButtons : function(options) {
		if (PD_ToolbarManager.classify_button) {
			var sitegroup = null;
			var tag = null;
			
			if ('sitegroup' in options && 'tag' in options) {
				sitegroup = options.sitegroup;
				tag = options.tag;
			} else {
				var url = null;
				if ('url' in options) {
					url = options.url;
				} else {
					url = _href();
				}
				var d = PD_ToolbarManager.getDbRowsForLocation(url);
				sitegroup = d.sitegroup;
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
    	 * returns { sitegroup: {}, sitegrouptagging: {}, tag: {} }
    	 */
		var href = url;
		var host = _host(href);
		var sitegroup = null;
		var sitegrouptagging = null;
		var tag = null;
		sitegroup = SiteGroup.get_or_null({ host: host });
		
		if (!sitegroup) {
			sitegroup = SiteGroup.create({ name: host, host: host });
			tag = Tag.get_or_null({ tag: PD_ToolbarManager.default_image_name })
			sitegrouptagging = SiteGroupTagging.create({ sitegroup_id: sitegroup.id, tag_id: tag.id});
		}
		else {
			sitegrouptagging = SiteGroupTagging.get_or_null({ sitegroup_id: sitegroup.id })
			if (!sitegrouptagging) {
				tag = Tag.get_or_null({ tag: PD_ToolbarManager.default_image_name })
				sitegrouptagging = SiteGroupTagging.create({ sitegroup_id: sitegroup.id, tag_id: tag.id});
			} else {
				tag = Tag.get_or_null({ id: sitegrouptagging.tag_id })
			}
		}
		
		return { sitegroup: sitegroup, sitegrouptagging: sitegrouptagging, tag: tag }

    },

    onClassifyButtonCommand : function(e) {
    	var d = PD_ToolbarManager.getDbRowsForLocation(_href());
    	var sitegroup = d.sitegroup;
    	var tag = d.tag;
    	var sitegrouptagging = d.sitegrouptagging;
    	
    	var new_tag_id = parseInt(tag.id) + 1;
		if (new_tag_id > 3) { new_tag_id = 1; }
		
		// update tag
		db.execute("update sitegrouptaggings set tag_id="+new_tag_id+" where sitegroup_id="+sitegroup.id);

		tag = Tag.get_or_null({ id: new_tag_id })
		
		PD_ToolbarManager.updateButtons({ sitegroup: sitegroup, tag: tag });
    },
    
    onProgressButtonCommand : function(e) {
    	//@TOD set my_impact substate to "goals"
    	window.content.location.href = constants.IMPACT_URL;
    }

};

window.addEventListener("load", PD_ToolbarManager.initialize, false);
