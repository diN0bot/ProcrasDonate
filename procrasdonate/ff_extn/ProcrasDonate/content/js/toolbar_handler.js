
function PD_ToolbarManager(pddb) {
	this.pddb = pddb;
	this.initialize()
	//window.addEventListener("load", _bind(this, this.initialize), false);
}
PD_ToolbarManager.prototype = {};
_extend(PD_ToolbarManager.prototype, {
		
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
		//this.removeEventListener('load', this.initialize, false);

		this.classify_button = document.getElementById("PD-classify-toolbar-button");
		this.progress_button = document.getElementById("PD-progress-toolbar-button");
		
		//PD_ToolbarManager.classify_button.setAttribute("oncommand", "PD_ToolbarManager.onClassifyButtonCommand()");
		//PD_ToolbarManager.progress_button.setAttribute("oncommand", "PD_ToolbarManager.onProgressButtonCommand()");
		
		var tag_names = ['Unsorted', 'ProcrasDonate', 'TimeWellSpent'];
		if (this.pddb.Tag.count() == 0) {
			for (var i=0; i < tag_names.length; i++) {
				this.pddb.Tag.create({ tag: tag_names[i] });
			}
		}
		
		for (var i=0; i < tag_names.length; i++) {
			this.images[tag_names[i]] = "chrome://ProcrasDonate/skin/"+tag_names[i]+"Icon.png";	
		}
		//logger("TAG: "+Tag.get_or_null({ tag: tag_names[0] }));
		//Tag.select({}, function(row) { logger("    > "+row); });
		this.default_tag = this.pddb.Tag.get_or_null({ tag: tag_names[0] });
		
		// Update button images and text
		this.updateButtons({ url: _href() });
	},

	/*
	 * get site classification for current URL and update button image
	 * @param options: contains either {sitegroup, tag} or {url}
	 */
	updateButtons : function(options) {
		if (this.classify_button) {
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
				var d = this.getDbRowsForLocation(url);
				sitegroup = d.sitegroup;
				tag = d.tag;
			}
			
			// alter classify button
			this.classify_button.setAttribute("image", this.images[tag.tag]);
			this.classify_button.setAttribute("label", tag.tag);
			
			var tooltip_text = this.classify_button.getAttribute("tooltiptext");
			var new_tooltip_text = tooltip_text.replace(/: [\w]+\./, ": "+tag.tag+".");
			this.classify_button.setAttribute("tooltiptext", new_tooltip_text);
			
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

		sitegroup = this.pddb.SiteGroup.get_or_create(
			{ host: host },
			{ name: host,
			  host: host,
			  tag_id: this.default_tag.id
			}
		);
		tag = this.pddb.Tag.get_or_null({ id: sitegroup.tag_id })
		
		return { sitegroup: sitegroup, tag: tag }

    },

    onClassifyButtonCommand : function(e) {
    	var d = this.getDbRowsForLocation(_href());
    	var sitegroup = d.sitegroup;
    	var tag = d.tag;
    	
    	var new_tag_id = parseInt(tag.id) + 1;
		if (new_tag_id > 3) { new_tag_id = 1; }
		
		// update tag
		this.pddb.SiteGroup.set({ tag_id: new_tag_id }, { id: sitegroup.id });
		tag = this.pddb.Tag.get_or_null({ id: new_tag_id })
		
		this.updateButtons({ sitegroup: sitegroup, tag: tag });
    },
    
    onProgressButtonCommand : function(e) {
    	//@TOD set my_impact substate to "goals"
    	window.content.location.href = constants.IMPACT_URL;
    }

});
