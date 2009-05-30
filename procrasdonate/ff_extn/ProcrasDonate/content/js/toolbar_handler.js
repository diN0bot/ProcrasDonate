
var PD_ToolbarManager = {
		
	classify_button : null,
	progress_button: null,
	// tag name, image pairs
	images : {},
	default_tag : null,

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
		//logger("TAG: "+Tag.get_or_null({ tag: tag_names[0] }));
		//Tag.select({}, function(row) { logger("    > "+row); });
		PD_ToolbarManager.default_tag = Tag.get_or_null({ tag: tag_names[0] });
		
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
		var tag = null;

		sitegroup = SiteGroup.get_or_create(
			{ host: host },
			{ name: host,
			  host: host,
			  tag_id: PD_ToolbarManager.default_tag.id
			}
		);
		tag = Tag.get_or_null({ id: sitegroup.tag_id })
		
		return { sitegroup: sitegroup, tag: tag }

    },

    onClassifyButtonCommand : function(e) {
    	var d = PD_ToolbarManager.getDbRowsForLocation(_href());
    	var sitegroup = d.sitegroup;
    	var tag = d.tag;
    	
    	var new_tag_id = parseInt(tag.id) + 1;
		if (new_tag_id > 3) { new_tag_id = 1; }
		
		// update tag
		SiteGroup.set({ tag_id: new_tag_id }, { id: sitegroup.id });
		tag = Tag.get_or_null({ id: new_tag_id })
		
		PD_ToolbarManager.updateButtons({ sitegroup: sitegroup, tag: tag });
    },
    
    onProgressButtonCommand : function(e) {
    	//@TOD set my_impact substate to "goals"
    	window.content.location.href = constants.IMPACT_URL;
    }

};

window.addEventListener("load", PD_ToolbarManager.initialize, false);
