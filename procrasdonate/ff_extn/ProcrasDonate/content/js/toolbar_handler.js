
function PD_ToolbarManager(pddb) {
	this.pddb = pddb;
	this.initialize()
	//window.addEventListener("load", _bind(this, this.initialize), false);
}
PD_ToolbarManager.prototype = {};
_extend(PD_ToolbarManager.prototype, {
		
	classify_button : null,
	progress_button: null,
	// tag id, image pairs
	images : {},

	/*
	* do stuff when new browser window opens 
	* use a settimeout to allow window to open if masterpassword is set
	*/
	initialize : function() {
		var self = this;
		
		//this.removeEventListener('load', this.initialize, false);

		this.classify_button = document.getElementById("PD-classify-toolbar-button");
		this.progress_button = document.getElementById("PD-progress-toolbar-button");
		
		this.pddb.Tag.select({}, function(row) {
			self.images[row.id] = "chrome://ProcrasDonate/skin/"+row.tag+"Icon.png";	
		});
		
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
			var tag_id = 0;
			if (tag) { tag_id = tag.id; }
			
			// alter classify button
			this.classify_button.setAttribute("image", this.images[tag_id]);
			this.classify_button.setAttribute("label", tag.tag);
			
			var tooltip_text = this.classify_button.getAttribute("tooltiptext");
			var new_tooltip_text = tooltip_text.replace(/: [\w]+\./, ": "+tag.tag+".");
			this.classify_button.setAttribute("tooltiptext", new_tooltip_text);
			
			// alter progress bar
/*
			var tag_content_type = this.pddb.ContentType.get_or_null({ modelname: "Tag" });
			//logger(" toolbar:::tag_content_type "+tag_content_type);
			//logger(" toolbar:::pd tag "+this.pddb.ProcrasDonate);
			//logger(" toolbar:::pd tag "+this.pddb.ProcrasDonate);

			// null because so far, totals only contain contenttype=2, SiteGroup
			var pd_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.ProcrasDonate.id,
				time: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly
			})
			var tws_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.TimeWellSpent.id,
				time: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly
			})
			
			var total = 0;
			if (pd_total) { total += parseInt(pd_total.total_time); }
			if (tws_total) { total += parseInt(tws_total.total_time); }
			
			logger("total for the week is: " + total +" pd_total="+pd_total + " tws_total="+tws_total);
			
			var goal = this.pddb.prefs.get('hrs_per_week_goal', false);
			// hr * 60m/hr * 60s/m
			if (goal) {
				var goal_in_s = parseInt(goal) * 60 * 60;
			
				var percentile = Math.floor( (total/goal) * 10 );
				// 80 = goal
				// 85 = quarter way to goal->limit
				// 100 = limit or above
			}
*/
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

		var self = this;
		sitegroup = this.pddb.SiteGroup.get_or_create(
			{ host: host },
			{ name: host,
			  host: host,
			  tag_id: 1
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
		
	if (!new_tag_id) { new_tag_id = 1; }

		// update tag
		this.pddb.SiteGroup.set({ tag_id: new_tag_id }, { id: sitegroup.id });
		tag = this.pddb.Tag.get_or_null({ id: new_tag_id })
		
		this.updateButtons({ sitegroup: sitegroup, tag: tag });
    },
    
    onProgressButtonCommand : function(e) {
    	//@TOD set my_impact substate to "goals"
    	window.content.location.href = constants.PD_URL + constants.IMPACT_URL;
    }

});
