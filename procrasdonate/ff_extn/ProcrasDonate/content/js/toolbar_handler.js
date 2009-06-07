
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
			var tag_content_type = this.pddb.ContentType.get_or_null({ modelname: "Tag" });
			var pd_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.ProcrasDonate.id,
				time: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly.id
			});
			var tws_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.TimeWellSpent.id,
				time: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly.id
			});
			logger("yyyyy "+this.pddb.TimeWellSpent+"     "+tws_total);
			
			var total = 0;
			if (pd_total) { total += parseInt(pd_total.total_time); }
			if (tws_total) { total += parseInt(tws_total.total_time); }
			
			var total_in_date = _start_of_week();
			total_in_date.setSeconds(total);
			var start = _start_of_week();
			var days = total_in_date.getDate() - start.getDate();
			var hours = total_in_date.getHours() - start.getHours();
			var minutes = total_in_date.getMinutes() - start.getMinutes();
			logger("total for the week is: " + total +" pd_total="+pd_total + " tws_total="+tws_total);
			logger(" days, hours, minutes="+days+" hr="+hours+" mi="+minutes);
			
			var goal = parseFloat(this.pddb.prefs.get('hr_per_week_goal', 1));
			var limit = parseFloat(this.pddb.prefs.get('hr_per_week_max', 1));
			logger("goal="+goal+" limit="+limit);
			// wk * 7d/wk * 24hr/d * 60m/hr * 60s/m
			var goal_in_s = parseInt(goal) * 7 * 24 * 60 * 60;
			var limit_in_s = parseInt(limit) * 7 * 24 * 60 * 60;
			logger("gis="+goal_in_s+" lis="+limit_in_s);
			var percentile = total/goal;
			var limit_progress = (total - goal_in_s) / (limit_in_s - goal_in_s) 
			logger("per="+percentile+" lp="+limit_progress);
			var icon_number = "0";
			
			if (percentile < (0.125 * 1)) {
				
			} else if (percentile < (0.125 * 2)) {
				icon_number = "10";
			} else if (percentile < (0.125 * 3)) {
				icon_number = "20";
			} else if (percentile < (0.125 * 4)) {
				icon_number = "30";
			} else if (percentile < (0.125 * 5)) {
				icon_number = "40";
			} else if (percentile < (0.125 * 6)) {
				icon_number = "50";
			} else if (percentile < (0.125 * 7)) {
				icon_number = "60";
			} else if (percentile < (0.125 * 8)) {
				icon_number = "70";
			
			} else if (limit_progress < (0.25 * 1)) {
				icon_number = "80";
			} else if (limit_progress < (0.25 * 2)) {
				icon_number = "85";
			} else if (limit_progress < (0.25 * 3)) {
				icon_number = "90";
			} else if (limit_progress < (0.25 * 4)) {
				icon_number = "95";
			} else {
				icon_number = "100";
			}
			
			this.progress_button.setAttribute("image", "chrome://ProcrasDonate/skin/IconBar"+icon_number+".png");
			var diff_str = "";
			if (days > 0) { diff_str += days+" days, "; }
			if (hours > 0) { diff_str += hours+" hr, "; }
			if (minutes > 0) { diff_str += minutes+" min"; }
			this.progress_button.setAttribute("label", "Progress: "+diff_str);
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
    	this.pddb.prefs.set('impact_state', 'goals');
    	window.content.location.href = constants.PD_URL + constants.IMPACT_URL;
    }

});
