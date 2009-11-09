
function PD_ToolbarManager(pddb) {
	this.pddb = pddb;
	//this.initialize()
	//window.addEventListener("load", _bind(this, this.initialize), false);
}
PD_ToolbarManager.prototype = {};
_extend(PD_ToolbarManager.prototype, {
		
	classify_button : null,
	pd_progress_button: null,
	tws_progress_button: null,
	// tag id, image pairs
	images : {},
	// this is tricky. we need to initialize *after* the chrome
	// toolbar is set up so that we can getElementById.
	// otherwise, the first time FF starts, the buttons are null,
	// and thus the classify icon doesn't cycle through icons.
	// for some reason, initializing in window init (Overlay.init)
	// doesn't help. instead, we initialize on page load if necessary.
	initialized : false,

	/*
	* do stuff when new browser window opens 
	* #@TODO ?? use a settimeout to allow window to open if masterpassword is set
	*/
	initialize : function() {
		var self = this;
		
		//this.removeEventListener('load', this.initialize, false);

		this.classify_button = document.getElementById("PD-classify-toolbar-button");
		if (this.classify_button) {
			self.initialized = true;
		} else {
			self.initialized = false;
			return
		}
		
		this.pd_progress_button = document.getElementById("PD-progress-toolbar-button");
		this.tws_progress_button = document.getElementById("TWS-progress-toolbar-button");
		
		self.images = {};
		this.pddb.Tag.select({}, function(row) {
			self.images[row.id] = "chrome://ProcrasDonate/skin/"+row.tag+"Icon.png";	
		});
		
		// Update button images and text
		this.updateButtons({ url: _href() });
	},
	
	install_toolbar : function() {
		// inserted toolbar button fine, but didn't persist
		//var navToolbar = document.getElementById("nav-bar")
		//navToolbar.insertItem("smxtra-button", null, null, false);
		//document.persist("nav-bar", "currentset");
		
		// fvcks up ff address bar etc
		//var currentset = document.getElementById("nav-bar").currentSet;
		//currentset=currentset + ",smxtra-button";
		//document.getElementById("nav-bar").setAttribute("currentset",currentset);   //not needed I suppose
		//document.getElementById("nav-bar").currentSet = currentset;
		//document.persist("nav-bar","currentset");
		
		// this works, though ff address is kind of messed up. works when restart ff.
		// classify icon is also unclickable until ff restarts.
		//var navbar = document.getElementById("nav-bar");
		//var newset = navbar.currentSet + ",PD-classify-toolbar-button,PD-progress-toolbar-button,TWS-progress-toolbar-button";
		//navbar.currentSet = newset;
		//navbar.setAttribute("currentset", newset );
		//document.persist("nav-bar", "currentset");
		
		try {
			var navbar = document.getElementById("nav-bar");
			var urlbar = document.getElementById("urlbar-container");
			var currentset = navbar.currentSet;
			var b1 = currentset.indexOf("PD-classify-toolbar-button") == -1;
			var b2 = currentset.indexOf("PD-progress-toolbar-button") == -1;
			// var b3 = currentset.indexOf("TWS-progress-toolbar-button") == -1;
			// only called on install, not upgrade. still, let's check that
			// no icons are present already.
			if ( b1 && b2 /*&& b3*/ ) {
				var set;
				//var button_text = "PD-classify-toolbar-button,PD-progress-toolbar-button,TWS-progress-toolbar-button,urlbar-container";
				var button_text = "PD-classify-toolbar-button,PD-progress-toolbar-button,urlbar-container";
				// Place the button before the urlbar
				if (currentset.indexOf("urlbar-container") != -1) {
					set = currentset.replace(/urlbar-container/, button_text);
				} else { // at the end
					set = currentset + ","+ button_text;
				}
				navbar.setAttribute("currentset", set);
				navbar.currentSet = set;
				document.persist("nav-bar", "currentset");
				// If you don't do the following call, funny things happen
				try {
					BrowserToolboxCustomizeDone(true);
				} catch (e) {
					logger(" Tried to call BrowserToolboxCustomizeDone but encountered error: " + e);
				}
			}
		} catch (e) {
			logger(" Tried to complete Toolbar installation but encountered error: " + e);		
		} 
			
		//tb.insertItem("PD-classify-toolbar-button", beforeElement); 
		//tb.insertItem("PD-progress-toolbar-button", beforeElement); 
		//tb.insertItem("TWS-progress-toolbar-button", beforeElement);
		//currentset = currentset.replace(/urlbar-container/i,"PD-classify-toolbar-button,PD-progress-toolbar-button,TWS-progress-toolbar-button,urlbar-container");
		//document.getElementById("nav-bar").setAttribute("currentset",currentset);
		//document.getElementById("nav-bar").currentSet = currentset;
		//document.persist("nav-bar","currentset");
		
		/*
		var tb = document.getElementById("nav-bar");
		var urlbar = document.getElementById("urlbar-container");
		tb.insertItem("PD-classify-toolbar-button", beforeElement); 
		tb.insertItem("PD-progress-toolbar-button", beforeElement); 
		tb.insertItem("TWS-progress-toolbar-button", beforeElement); 
		document.persist("nav-bar", "currentset"); 
		*/
	},
	
	uninstall_toolbar : function() {
		// @TODO explicitly remove toolbar items from nav-bar   ?
		// removal is automatic when extn is uninstalled,
		// but if re-installed, old icons will show up.
		var tb = document.getElementById("nav-bar");
		var e1 = document.getElementById("PD-classify-toolbar-button");
		var e2 = document.getElementById("PD-progress-toolbar-button");
		var e3 = document.getElementById("TWS-progress-toolbar-button");
		if ( tb ) {
			if ( e1 ) { tb.removeChild(e1); }
			if ( e2 ) { tb.removeChild(e2); }
			if ( e3 ) { tb.removeChild(e3); }
		}
	},

	/*
	 * get site classification for current URL and update button image
	 * @param options: contains either {sitegroup, tag} or {url}
	 */
	updateButtons : function(options) {
		if (!this.initialized) { return }
		
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
			
			// alter progress bars only if they exist
			if ( !this.pd_progress_button && !this.tws_progress_button ) {
				return;
			}
			
			// alter progress bars
			var tag_content_type = this.pddb.ContentType.get_or_null({ modelname: "Tag" });
			var pd_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.ProcrasDonate.id,
				datetime: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly.id
			});
			var tws_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.TimeWellSpent.id,
				datetime: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly.id
			});
			//logger("yyyyy "+this.pddb.TimeWellSpent+"     "+tws_total);
			
			var pd_goal = parseFloat(this.pddb.prefs.get('pd_hr_per_week_goal', 1));
			var pd_limit = parseFloat(this.pddb.prefs.get('pd_hr_per_week_max', 1));
			
			var tws_goal = parseFloat(this.pddb.prefs.get('tws_hr_per_week_goal', 1));
			var tws_limit = parseFloat(this.pddb.prefs.get('tws_hr_per_week_max', 1));
			
			if ( pd_total && this.pd_progress_button) {
				pd_total = parseInt(pd_total.total_time);
				this.update_progress(pd_total, pd_goal, pd_limit, this.pd_progress_button, "PD")
			}
			
			if ( tws_total && this.tws_progress_button) {
				tws_total = parseInt(tws_total.total_time);
				this.update_progress(tws_total, tws_goal, tws_limit, this.tws_progress_button, "TWS")
			}
			
		}
    },

	update_progress: function(total, goal, limit, button, label) {
    	//logger("toolbar.js::update_progress LABEL="+label);

    	var total_in_date = _start_of_week();
		total_in_date.setSeconds(total);
		
		var start = _start_of_week();
		var days = total_in_date.getDate() - start.getDate();
		var hours = total_in_date.getHours() - start.getHours();
		var minutes = total_in_date.getMinutes() - start.getMinutes();
		//logger("toolbar.js::update_progress: total for the week is: " + total);
		//logger("toolbar.js::update_progress:    days, hours, minutes="+days+" hr="+hours+" mi="+minutes);
		//logger("toolbar.js::update_progress: goal="+goal+" limit="+limit);

		var goal_in_s = parseFloat(goal) * 3600;
		var limit_in_s = parseFloat(limit) * 3600;
		//logger("toolbar.js::update_progress: goal in sec="+goal_in_s+" limit in sec="+limit_in_s);
		
		var percentile = total/goal_in_s;
		var limit_progress = (total - goal_in_s) / (limit_in_s - goal_in_s) 
		//logger("toolbar.js::update_progress: total/goal="+percentile+" limit_progress="+limit_progress);
		var icon_number = "0";
		
		if (percentile < (0.125 * 1)) {
			icon_number = "0";
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
		
		button.setAttribute("image", "chrome://ProcrasDonate/skin/IconBar"+icon_number+".png");
		var diff_str = "";
		if (days > 0) { diff_str += days+" days, "; }
		if (hours > 0) { diff_str += hours+" hr, "; }
		if (minutes >= 0) { diff_str += minutes+" min"; }
		button.setAttribute("label", label+": "+diff_str);
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
    	if (!this.initialized) { return }
    	
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
    
    onProgressButtonPDCommand : function(e) {
    	this.pddb.prefs.set('impact_state', 'goals');
    	window.content.location.href = constants.PD_URL + constants.PROGRESS_URL;
    },
    
    onProgressButtonTWSCommand : function(e) {
    	this.pddb.prefs.set('impact_state', 'goals');
    	window.content.location.href = constants.PD_URL + constants.IMPACT_URL;
    }

});
