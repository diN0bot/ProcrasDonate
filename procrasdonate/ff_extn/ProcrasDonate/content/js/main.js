
logger = function(msg) {
	dump("---------\n" + msg + "\n");
	try {
		//logger.FAIL();
	} catch (e) {
		dump(e.stack);
	}
};

var ProcrasDonate__UUID="extension@procrasdonate.com";


// from https://developer.mozilla.org/En/Code_snippets:On_page_load
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var URLBarListener = function URLBarListener(self, pddb) {
	this.self = self;
	this.pddb = pddb;
	this.toolbar_manager = new PD_ToolbarManager(pddb);
};
URLBarListener.prototype = {
	QueryInterface: function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports)) {
			//logger("QueryInterface:: " + aIID);
			return this;
		}
		throw Components.results.NS_NOINTERFACE;
	},
	
	onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
		// If you use myListener for more than one tab/window, use
		// aWebProgress.DOMWindow to obtain the tab/window which triggers the state change
		var msg = "onStateChange:: ";
		if (aFlag & STATE_START) {
			// This fires when the load event is initiated
			msg += "load_start ";
			//logger("onStateChange::load_start: " + aWebProgress.DOMWindow.location.href);
		}
		if (aFlag & STATE_STOP) {
			// This fires when the load finishes
			msg += "load_stop ";
			//logger("onStateChange::load_end: " + aWebProgress.DOMWindow.location.href);
		}
		//logger(msg);
	},
	
	onLocationChange: function(aProgress, aRequest, aURI) {
		// This fires when the location bar changes; i.e load event is confirmed
		// or when the user switches tabs. If you use myListener for more than one tab/window,
		// use aProgress.DOMWindow to obtain the tab/window which triggered the change.
		var href = aProgress.DOMWindow.location.href;
		//logger("onLocationChange:: " + href +" "+aURI);
		//logger(jQuery(aProgress.DOMWindow,
		//if (aURI == "about:config")
		//	return;
		//logger(window);
		//logger(document);
		//logger(gBrowser);
		//logger(gBrowser.contentWindow);
		//logger(gBrowser.contentWindow.document);
		//logger(gBrowser.contentDocument);
		
		http_request = new HttpRequest(window, window);
		var request = http_request.contentStartRequest({
			method: "get",
			//url: "http://localhost:8000/start_now",
			url: "http://www.google.com",
			onload: function(event) {
				//logger(["HttpRequest->onload()", arguments.length]);
				//logger(event.responseText);
			},
			onerror: function(event) {
				//logger(["HttpRequest->onerror()",arguments.length]);
			},
			onreadystatechange: function(event) {
				//logger(["HttpRequest->onreadystatechange()", arguments]);
			},
		});
		
		//logger(jQuery("*", gBrowser.contentWindow.document).length);
		//logger([]);
		//logger([aProgress.DOMWindow.content]);
		
		//logger(" location changed. start recording: "+href);
		this.pddb.start_recording(href);

		this.toolbar_manager.updateButtons({ url: href });
		this.self.processNewURL(aProgress.DOMWindow, aURI);
	},
	
	// For definitions of the remaining functions see XULPlanet.com
	onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {
		//logger("onProgressChange:: " + curTot + "/" + maxTot);
	},
	onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
		//logger("onStatusChange:: " + aStatus + " => " + aMessage);
	},
	onSecurityChange: function(aWebProgress, aRequest, aState) {
		//logger("onSecurityChange:: " + aState);
	}
	
};


var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
Prefs = Prefs.getBranch("extensions.my_extension_name.");

//ProcrasDonate.log

//function _callback(obj, method) {
//	var args = Array.prototype.slice.apply(arguments, [2, arguments.length]);
//	return function() {
//		return method.apply(obj, 
//							args.concat(Array.prototype.slice.apply(arguments)));
//	}
//}

function Overlay() {
	//logger("Overlay()");
	//logger([window, document, gBrowser]);
	
	var self = this;
	window.addEventListener("load", _bind(this, this.init), false);
	window.addEventListener("unload", _bind(this, this.uninit), false);
	//function() { return self.init() }, false);
};

Overlay.prototype = {
	VERSION: -1,
	
	//eventListeners: {
	//	load: function(){ Overlay.init(); },
	//	unload: function() { Overlay.uninit(); }
	//},
	
	init: function() {
		//logger([window, document, gBrowser]);
		//logger("Overlay.init()");
		
		this.pddb = new PDDB();
		this.pddb.init_db();
		
		this.url_bar_listener = new URLBarListener(this, this.pddb);
		
		this.page_controllers = [];
		this.page_controllers.push(
			new Controller(this.pddb.prefs, this.pddb));
		
		var appcontent = document.getElementById("appcontent");   // browser
		
		if(appcontent && !appcontent.seen_by_ProcrasDonate) {
			//logger("Overlay.init::appcontent!" + appcontent);
			appcontent.seen_by_ProcrasDonate = true;
			
			// DOMContentLoaded - fires when DOM is ready but images not loaded
			appcontent.addEventListener(
				"DOMContentLoaded", _bind(this, this.onPageLoad), true);
			// load - fires after pageload is complete
			//appcontent.addEventListener(
			//	"load", _bind(this, this.onLoad), false);
			
			//appcontent.addEventListener("pageshow", Overlay.onPageShow, false);
			//appcontent.addEventListener("pagehide", Overlay.onPageHide, false);
			
			//appcontent.addEventListener(
			//	"unload", _bind(this, this.onUnload), false);
		}
		
		this.checkVersion();
		//// Listen for webpage loads
		gBrowser.addProgressListener(
			this.url_bar_listener,//new URLBarListener(this, this.pddb),
		    Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		// Only works in 3.5+
		//gBrowser.addTabsProgressListener(Overlay_urlBarListener,
		//                             Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		// FIXME: Do we remove this right away or only at onUnload?
		//window.removeEventListener("load", this.eventListeners.load ,true);
		//window.addEventListener("load", function(){ Overlay.onLoad(); }, false);
		
		//logger("Overlay.init() => end");
	},
	
	uninit: function() {
		//logger("Overlay.uninit()");
		gBrowser.removeProgressListener(this.url_bar_listener);
	},
	
	
	onLoad: function() {
		//logger("Overlay.onLoad()");
	},
	
	onUnload: function() {
		//logger("Overlay.onUnload()");
	},
	
	onPageShow: function() {
		//logger("Overlay.onPageShow()");
	},
	
	onPageHide: function() {
		//logger("Overlay.onPageHide()");
	},
	
	dispatch: function(href, event) {
		var i, controller, request, response;
		request = new PageRequest(href, event);
		//logger("request: " + request);
		for (i=0; i<this.page_controllers.length; i++) {
			controller = this.page_controllers[i];
			response = controller.handle(request);
			if (response)
				return response;
		}
		//logger("done");
		return null;
	},
	
	onPageLoad: function(event) {
		// We only care about page load (DOMContentLoaded) when we're
		// going to display a page.
		var msg = "Overlay.onPageLoad:: ";
		//logger(msg);
		
		var unsafeWin = event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		
		var href = new XPCNativeWrapper(
			new XPCNativeWrapper(unsafeWin, "location").location, "href").href;
		
		//logger("  x-x-x-x-x-x-x-x href="+href);
		return this.dispatch(href, event);
		
		////////// OLD /////////////
		//
		//var doc = event.originalTarget; // doc is document that triggered "onload" event
		//if (event.originalTarget instanceof HTMLDocument) {
		//	// Target is an HTML element
		//	msg += "HTML ";
		//	
		//	if (event.originalTarget.defaultView.frameElement) {
		//		// Target is a frame
		//		msg += "Frame: " + event.originalTarget;
		//	} else {
		//		msg += event.originalTarget;
		//	}
		//	
		//} else {
		//	msg += "non-HTML: " + typeof(event.originalTarget);
		//}
		//logger(msg);
		//// do something with the loaded page.
		//// doc.location is a Location object (see below for a link).
		//// You can use it to make your code executed on certain pages only.
		////logger("a page is loaded: " + doc.location);
		////if (doc.location.href.search("forum") > -1)
		////	alert("a forum page is loaded");
		//var unsafeWin = event.target.defaultView;
		//if (unsafeWin.wrappedJSObject)
		//	unsafeWin = unsafeWin.wrappedJSObject;
		//
		//var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location;
		//var href = new XPCNativeWrapper(unsafeLoc, "href").href;
		//
		//if (this.handle_url(href)) {
		//	// Inject scripts into page
		//	logger("handling url: "+href);
		//	//logger(jQuery("#content", doc).length);
		//	this.pddb.dispatch(doc, href);
		//	//this.injectScript("logger(\"Script injected!\");", href, unsafeWin);
		//} else {
		//	logger("storing url: "+href);
		//	var now = Math.round((new Date()).getTime() / 1000);
		//	this.pddb.store_visit(href, now, 1000);
		//}
	},
	
	handle_url: function(url) {
		// First, is this a page we can inject into?
		var scheme=Components.classes["@mozilla.org/network/io-service;1"]
		                     .getService(Components.interfaces.nsIIOService)
		                     .extractScheme(url);
		if (!((scheme == "http" || scheme == "https" || scheme == "file") &&
			  !/hiddenWindow\.html$/.test(url)))
			return false;
		
		if (/http:\/\/localhost.*/.test(url))
			return true;
		
		return false;
	},
	
	injectScript: function(script, url, unsafeWin) {
		//logger("Overlay.injectScript:: url=" + url);
	},
	
	onPageUnload: function(event) {
		var msg = "Overlay.onPageUnload:: ";
		var doc = event.originalTarget;
		if (event.originalTarget instanceof HTMLDocument) {
			msg += "HTML "
			//var doc = event.originalTarget;
			//logger("page unloaded:" + doc.location.href);
		}
		//logger(msg);
	},
	
	
	processNewURL: function(win, url) {
		//logger("Overlay.processNewURL:: url=" + url);
		//logger(jQuery("#content", win.document.defaultView).length);
		this.pddb.house_keeping();
		//if (is_procrasdonate_domain()) {
		//	logger("Overlay.processNewURL:: do house keeping");
		//	house_keeping();
		//} else {
		//	logger("Overlay.processNewURL:: don't do house keeping");
		//}
	},
	
	checkVersion: function() {
		var ver = -1, firstrun = true;
		
		var gExtensionManager = Components.
		    classes["@mozilla.org/extensions/manager;1"].
		    getService(Components.interfaces.nsIExtensionManager);
		
		//"extension@guid.net" should be replaced with your extension's GUID.
		var current = gExtensionManager.getItemForID(ProcrasDonate__UUID).version;
		
		try {
			ver = Prefs.getCharPref("version");
			firstrun = Prefs.getBoolPref("firstrun");
		} catch(e) {
			//nothing
		} finally {
			if (firstrun) {
				this.doInstall();
				
				Prefs.setBoolPref("firstrun",false);
				Prefs.setCharPref("version",current);
				
				// Insert code for first run here
				this.onInstall();
			}
			
			if (ver != current && !firstrun) {
				this.doUpgrade();
				// !firstrun ensures that this section does not get loaded if its a first run.
				Prefs.setCharPref("version",current);
				
				// Insert code if version is different here => upgrade
				this.onUpgrade();
			}
		}
	},
	
	doInstall: function() { // 
		//logger("Overlay.doInstall::");
	},
	onInstall: function() { // execute on first run
		//logger("Overlay.onInstall::");
		// The example below loads a page by opening a new tab.
		// Useful for loading a mini tutorial
		window.setTimeout(function() {
			gBrowser.selectedTab = gBrowser.addTab(constants.REGISTER_URL);
		}, 1500); //Firefox 2 fix - or else tab will get closed
		
		// initialize state
		for (var i = 0; i < this.page_controllers.length; i++) {
			this.page_controllers[i].initialize_state();
		}

	},
	
	doUpgrade: function() { // make any necessary changes for a new version (upgrade)
		//logger("Overlay.doUpgrade::");
	},
	onUpgrade: function() { // execute after each new version (upgrade)
		//logger("Overlay.onUpgrade::");
	},
	
	doMenuSelect: function() {
		//logger("Menu selected!");
	},
};


var Dispatcher = function Dispatcher(pddb) {
	this.pddb = pddb;
	//this.template = Template;
	//this.prefs = new PreferenceManager("ProcrasDonate.", {});
	
	this.controllers = [];
};
Dispatcher.prototype = {};
_extend(Dispatcher.prototype, {
	get_controller: function(url, event, chromeWindow, contentWindow) {
		
	},
	dispatch: function(url, event, chromeWindow, contentWindow) {
		
	},
});

var PDDB = function PDDB() {
	//logger("PDDB()");
	//if (Main.locked)
	//	return Main.instance;
	
	this.template = Template;
	logger(this.template);
	
	this.prefs = new PreferenceManager("ProcrasDonate.", {
		
	});
	logger(" &&&&&&&&&&&&&&&&&&&& last_url="+this.prefs.get('last_url', 'no last url'));
	
	this.controller = new Controller(this.prefs, this);
	this.page = new PageController(this.prefs, this);
	this.schedule = new Schedule(this.prefs, this);
};

PDDB.prototype = {
	init_db: function() {
		//logger("PDDB.init_db()");
		var db = new Backend__Firefox();
		db.connect("test011.sqlite");
		this.db = db;
		this.models = load_models(db);
		
		var self = this;
		_iterate(this.models, function(name, model) {
			//logger("model: "+name);
			self[name] = model; //new Model(db, name, spec);
			
			var already_exists = false;
			self.db.execute("SELECT * FROM sqlite_master", {}, function(row) {
				if (row[1] == model.table_name)
					already_exists = true;
			});
			if (!already_exists) {
				model.create_table();
			}
		});
		
		// install data if not already installed.
		
		////// TAGS ////////
		this.Unsorted      = this.Tag.get_or_create({ tag: "Unsorted" });
		this.ProcrasDonate = this.Tag.get_or_create({ tag: "ProcrasDonate" });
		this.TimeWellSpent = this.Tag.get_or_create({ tag: "TimeWellSpent" });

		////// TIMETYPES ////////
		this.Daily   = this.TimeType.get_or_create({ timetype: "Daily" });
		this.Weekly  = this.TimeType.get_or_create({ timetype: "Weekly" });
		this.Forever = this.TimeType.get_or_create({ timetype: "Forever" });

		////// CONTENTTYPES ////////
		this.content_types = {};
		if (this.ContentType.count() == 0) {
			var contenttype_names = ['Site', 'SiteGroup', 'Recipient', 'Tag'];
			for (var i=0; i < contenttype_names.length; i++) {
				var ct = this.ContentType.create({ modelname: contenttype_names[i] });
				this.content_types[ct.id] = this[ct.modelname];
			}
		}
		
		////// CATEGORIES ////////
		if (this.Category.count() == 0) {
			var category_names = ["Family Planning", "African-American", "AIDS", "American-Indian", "Asian-American", "Asia", "Blindness", "Cancer Research", "Child Protection", "Child Sponsorship", "Civil Rights", "Public Interest", "Consumer Impact", "Crime and Fire Prevention", "Disabled", "Drug and Alcohol Abuse", "Environmental Conservation", "Environmental Advocacy", "Health Research", "Hispanic", "Homeless", "Human Rights", "Disaster and Medical Relief", "Farming", "Hunger", "International Relief and Development", "Jewish Charity", "Literacy", "Mental Health", "Peace", "Population", "Aging", "Terminally Ill", "Veterans", "Women", "Youth", ];
			for (var i=0; i < category_names.length; i++) {
				this.Category.create({ category: category_names[i] });
			}
		}
		
		////// RECIPIENTS ////////
		if (this.Recipient.count() == 0) {
			this.Recipient.create({
                twitter_name: "ProcrasDonate",
                name: "ProcrasDonate",
                mission: "mission",
                description: "description",
                url: "http://procrasdonate.com",
                is_visible: False,
                email: "info@procrasdonate.com",
                category_id: 1
	        });
	        this.Recipient.create({
                twitter_name: "bilumi",
                name: "Buy It Like You Mean It",
                mission: "To provide access to collaborative tools for educational discovery and communication about the real world impact of product supply chains.",
                description: "Without knowing the socially responsible impact of purchasing a product, we're all still shopping in the dark.<br>Buy It Like You Mean It helps students and volunteers cooperate to review and rate the real world effects of industry supply chains. We provide these ratings, free of charge, to help shoppers decide which products support their own unique values.<br>Together we are modeling how specific companies perform on a variety of socially responsible interests.",
                url: "http://bilumi.org",
                is_visible: True,
                email: "",
                category_id: 13
	        });
            this.Recipient.create({
                twitter_name: "",
                name: "Pathfinder International",
                mission: "To ensure that people everywhere have the right and opportunity to live a healthy reproductive life.",
                description: "Reproductive health is essential for creating better opportunities throughout life. When people take charge of their life choices such as when and how often to have children, they gain confidence and strength. They can better pursue their education, contribute to the local economy, and engage in their communities.<br>Pathfinder International places reproductive health services at the center of all that we do&#8212;believing that health care is not only a fundamental human right but is critical for expanding opportunities for women, families, communities, and nations, while paving the way for transformations in environmental stewardship, decreases in population pressures, and innovations in poverty reduction.  <br>In more than 25 countries, Pathfinder provides women, men, and adolescents with a range of quality health services&#8212;from contraception and maternal care to HIV prevention and AIDS care and treatment. Pathfinder strives to strengthen access to family planning, ensure availability of safe abortion services, advocate for sound reproductive health policies, and, through all of our work, improve the rights and lives of the people we serve. ",
                url: "http://www.pathfind.org",
                is_visible: True,
                email: "",
                category_id: 1
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "UNCF",
	                mission: "A mind is a terrible thing to waste.",
	                description: "At a time when a college degree is what a high school diploma was to previous generations, the minimum entry-level requirement for almost every well-paying career, UNCF plays a critical role in enabling more than 60,000 students each year to attend college and get the education they want and deserve. To close the educational attainment gap between African Americans and the majority population, UNCF helps promising students attend college and graduate by:<br> - Providing operating funds for its 39 member colleges, all of them small, liberal arts institutions, making it possible for them to offer their students 21st century academic programs while keeping their tuitions to less than half the average of other private colleges;<br> - Administering 400 scholarship and internship programs, so that even students from low- and moderate-income families can afford college tuition, books and room and board;<br> - Serving as a national advocate for the importance minority higher education by representing the public policy interests of its students and member colleges, through its annual television program, An Evening of Stars, and by using print and electronic media to carry out the mission implicit in its motto, ''A mind is a terrible thing to waste.''",
	                url: "http://www.uncf.org/",
	                is_visible: True,
	                email: "",
	                category_id: 2
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "AIDs Research Alliance",
	                mission: "Established in 1989, AIDS Research Alliance (ARA) envisions a future in which HIV and its effects on health are eliminated, and new infections are prevented. We exist TO DEVELOP A CURE FOR HIV and AIDS, medical strategies to prevent new infections and better treatments for people living with HIV/AIDS.",
	                description: "AIDS Research Alliance of America (ARA) tackles HIV on many fronts:<br> - Improving the health of people living with HIV and AIDS<br> - Striving to develop vaccines and microbicides that prevent the further spread of HIV.<br> - Creating Reservoir Ablative Strategies (RAS) that could eliminate HIV from infected individuals.<br> - Searching for a cure.<br>AIDS Research Alliance is pioneering a revolutionary business model for conducting medical research in the United States, influencing the direction of HIV research along the way.",
	                url: "http://www.aidsresearch.org/",
	                is_visible: True,
	                email: "",
	                category_id: 3
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "American Indian College Fund",
	                mission: "The American Indian College Fund transforms Indian higher education by funding and creating awareness of the unique, community-based accredited Tribal Colleges and Universities, offering students access to knowledge, skills, and cultural values which enhance their communities and the country as a whole.",
	                description: "When the American Indian College Fund was launched, providing scholarship support to the tribal colleges was its primary mission.  Today, the Fund also supports cultural preservation projects, capital construction and other programs at the tribal colleges.",
	                url: "http://www.collegefund.org/",
	                is_visible: True,
	                email: "",
	                category_id: 4
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Asian-American Legal Defense and Education Fund",
	                mission: "The Asian American Legal Defense and Education Fund (AALDEF) is a national organization that protects and promotes the civil rights of Asian Americans.",
	                description: "AALDEF focuses on critical issues affecting Asian Americans, including immigrant rights, civic participation and voting rights, economic justice for workers, language access to services, Census policy, affirmative action, youth rights and educational equity, and the elimination of anti-Asian violence, police misconduct, and human trafficking.",
	                url: "https://www.aaldef.org/",
	                is_visible: True,
	                email: "info@aaldef.org",
	                category_id: 5
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Asia Foundation",
	                mission: "Working to build a peaceful, prosperous, just and open asia-pacific region.",
	                description: "The Asia Foundation is a non-profit, non-governmental organization committed to the development of a peaceful, prosperous, just, and open Asia-Pacific region. The Foundation supports programs in Asia that help improve governance, law, and civil society; women's empowerment; economic reform and development; and international relations. Drawing on more than 50 years of experience in Asia, the Foundation collaborates with private and public partners to support leadership and institutional development, exchanges, and policy research.<br>With offices throughout Asia, an office in Washington, D.C., and its headquarters in San Francisco, the Foundation addresses these issues on both a country and regional level. In 2008, the Foundation provided more than 87 million dollars in program support and distributed over one million books and educational materials valued at 41 million dollars throughout Asia.",
	                url: "http://www.asiafoundation.org/",
	                is_visible: True,
	                email: "",
	                category_id: 6
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Helen Keller International - Childsight",
	                mission: "To save the sight and lives of the most vulnerable and disadvantaged. We combat the causes and consequences of blindness and malnutrition by establishing programs based on evidence and research in vision, health and nutrition. Our vision is to strive to be the most scientifically competent organization in improving vision and nutrition throughout the world.",
	                description: "Founded in 1915, Helen Keller International (HKI) is among the oldest international nonprofit organizations devoted to fighting and treating preventable blindness and malnutrition. HKI is headquartered in New York City, and has programs in 21 countries in Africa and Asia as well as in the United States. HKI builds local capacity by establishing sustainable programs, and provides scientific and technical assistance and data to governments and international, regional, national and local organizations around the world.<br>HKI programs combat malnutrition, cataract, trachoma, onchocerciasis (river blindness) and refractive error. The goal of all HKI programs is to reduce suffering of those without access to needed health or vision care and ultimately, to help lift people from poverty.",
	                url: "http://www.hki.org/",
	                is_visible: True,
	                email: "info@hki.org",
	                category_id: 7
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Cancer Research Institute",
	                mission: "The Cancer Research Institute is dedicated to finding novel ways to harness the power of our own immune systems to conquer cancer.",
	                description: "The Institute fulfills its mission by providing academic researchers at top institutions around the world the funding they need to carry out their important work. To accomplish this, the Cancer Research Institute has relied on generous support from individuals, corporations, and foundations who have a desire to become partners in our effort to conquer cancer through immunology.",
	                url: "http://www.cancerresearch.org/",
	                is_visible: True,
	                email: "grants@cancerresearch.org",
	                category_id: 8
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Children's Defense Fund",
	                mission: "Leading our nation since 1973 to ensure a level playing field for our children.",
	                description: "CDF is the foremost national proponent of policies and programs that provide children with the resources they need to succeed.<br>We champion policies that will lift children out of poverty; protect them from abuse and neglect; and ensure their access to health care, quality education, and a moral and spiritual foundation.",
	                url: "http://www.childrensdefense.org/",
	                is_visible: True,
	                email: "cdfinfo@childrensdefense.org",
	                category_id: 9
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Compassion International",
	                mission: "In response to the Great Commission, Compassion International exists as an advocate for children, to release them from their spiritual, economic, social and physical poverty and enable them to become responsible and fulfilled Christian adults.",
	                description: "Sponsoring children in need is breaking the cycle of poverty<br>Compassion International exists as a Christian child advocacy ministry that releases children from spiritual, economic, social and physical poverty and enables them to become responsible, fulfilled Christian adults.<br>Founded by the Rev. Everett Swanson in 1952, Compassion began providing Korean War orphans with food, shelter, education and health care, as well as Christian training.<br>Today, Compassion helps more than 1 million children in 25 countries.",
	                url: "http://www.compassion.com",
	                is_visible: True,
	                email: "",
	                category_id: 10
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Center for Constitutional Rights",
	                mission: "The Center for Constitutional Rights is dedicated to advancing and protecting the rights guaranteed by the United States Constitution and the Universal Declaration of Human Rights.",
	                description: "Founded in 1966 by attorneys who represented civil rights movements in the South, CCR is a non-profit legal and educational organization committed to the creative use of law as a positive force for social change.<br>CCR uses litigation proactively to advance the law in a positive direction, to empower poor communities and communities of color, to guarantee the rights of those with the fewest protections and least access to legal resources, to train the next generation of constitutional and human rights attorneys, and to strengthen the broader movement for constitutional and human rights. Our work began on behalf of civil rights activists, and over the last four decades CCR has lent its expertise and support to virtually every popular movement for social justice.<br>Since our founding, CCR has provided legal skills in a unique and effective manner and always with a progressive perspective. We use daring and innovative legal strategies which have produced many important precedents. CCR is often ''ahead of the curve'' in both identifying a problem and in suggesting novel or radical legal responses which, over time, become accepted and respected precedents and theories.<br>Attica MarchCCR accepts cases and projects based on principle and the value of the struggle itself, not solely by using a calculus of victory. There are cases which CCR has worked on tenaciously for decades before success was achieved, yet we stood by the cause and the client. We will continue to take these types of cases because justice demands it.<br>As we look to the future, CCR will continue to be at the forefront of legal thinking, using the law creatively in the service of justice.<br>Through our human rights work, we will strengthen the international rule of law to promote justice and oppose armed and other forms of aggression.<br>Through our racial justice work, we will strive to complete the unfinished civil rights movement, targeting racial profiling and other modern-day manifestations of racial repression.<br>TJC march We are dedicated to restoring the fundamental right to habeas corpus and will continue to combat the illegal expansion of executive power and the American torture programs that have undermined fundamental rights in the name of the so-called war on terror.<br>History has repeatedly taught us that the hard-won victories of yesterday can never be taken for granted. As society changes, new threats to our rights arise, even as old ones are defeated. CCR will continue defending progressive movements for social change and devising new strategies to ensure that fundamental rights are the rights of the many and not just the few.",
	                url: "http://ccrjustice.org/",
	                is_visible: True,
	                email: "",
	                category_id: 11
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Public Citizen Foundation",
	                mission: "Public Citizen is a national, nonprofit consumer advocacy organization founded in 1971 to represent consumer interests in Congress, the executive branch and the courts.",
	                description: "We fight for openness and democratic accountability in government, for the right of consumers to seek redress in the courts; for clean, safe and sustainable energy sources; for social and economic justice in trade policies; for strong health, safety and environmental protections; and for safe, effective and affordable prescription drugs and health care.",
	                url: "http://www.citizen.org/",
	                is_visible: True,
	                email: "",
	                category_id: 12
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Prison Fellowship Ministries",
	                mission: "Prison Fellowship partners with local churches across the country to minister to a group that society often scorns and neglects: prisoners, ex-prisoners, and their families.",
	                description: "God, unlike the world, has always chosen to identify closest with those who are isolated and broken. ''For I was hungry and you gave me something to eat, I was thirsty and you gave me something to drink, I was a stranger and you invited me in, I needed clothes and you clothed me, I was sick and you looked after me, I was in prison, and you came to visit me . . . I tell you the truth, whatever you did for one of the least of these brothers of mine, you did for me'' (Matthew 25:35-36, 40).<br>Prison Fellowship reaches out to prisoners, ex-prisoners, and their families both as an act of service to Jesus Christ and as a contribution to restoring peace to our cities and communities endangered by crime. For the best way to transform our communities is to transform the people within those communities&#8212;and truly restorative change comes only through a relationship with Jesus Christ.",
	                url: "http://www.prisonfellowship.org",
	                is_visible: True,
	                email: "",
	                category_id: 14
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Christopher and Dana Reeve Foundation",
	                mission: "Today's care, tomorrow's cure.",
	                description: "The Christopher and Dana Reeve Foundation is dedicated to curing spinal cord injury by funding innovative research, and improving the quality of life for people living with paralysis through grants, information and advocacy.",
	                url: "http://www.christopherreeve.org",
	                is_visible: True,
	                email: "",
	                category_id: 15
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Drug Policy Alliance",
	                mission: "To advance those policies and attitudes that best reduce the harms of both drug misuse and drug prohibition, and to promote the sovereignty of individuals over their minds and bodies.",
	                description: "The Drug Policy Alliance Network (DPA Network) is the nation's leading organization promoting policy alternatives to the drug war that are grounded in science, compassion, health and human rights.<br>Our supporters are individuals who believe the war on drugs is doing more harm than good. Together we advance policies that reduce the harms of both drug misuse and drug prohibition, and seek solutions that promote safety while upholding the sovereignty of individuals over their own minds and bodies. We work to ensure that our nation's drug policies no longer arrest, incarcerate, disenfranchise and otherwise harm millions of nonviolent people. Our work inevitably requires us to address the disproportionate impact of the drug war on people of color.<br>DPA Network is actively involved in the legislative process and seeks to roll back the excesses of the drug war, block new, harmful initiatives, and promote sensible drug policy reforms.  As a result of our work, hundreds of thousands of people have been diverted from incarceration to drug treatment programs, tens of thousands of sick and dying patients can safely access their medicine without being considered criminals under the law, and states like California have saved more than 1.5 billion dollars by eliminating wasteful and ineffective law enforcement, prosecution and prison expenditures.",
	                url: "http://www.drugpolicy.org",
	                is_visible: True,
	                email: "",
	                category_id: 16
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Conservation Fund",
	                mission: "The Conservation Fund is dedicated to advancing America's land and water legacy. With our partners, we conserve land, train leaders and invest in conservation.",
	                description: "Every community&#8212;and landscape&#8212;is different. That's why conservation calls for different solutions, from protecting land to empowering rural communities, strategically planning infrastructure, investing in sustainable business and using water wisely. At The Conservation Fund, we do all this and more.<br>How? We're a nonprofit that treats conservation as our business. We provide the skills, strategies and funds that our partners need to fulfill conservation priorities swiftly and successfully. With support from donors, we partner with community, government and corporate leaders to protect America's favorite outdoor places and to conserve resources for healthy, sustainable communities. We operate leanly, with no formal membership, charitable endowment or political agenda.",
	                url: "http://www.conservationfund.org/",
	                is_visible: True,
	                email: "postmaster@conservationfund.org",
	                category_id: 17
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Greenpeace Fund, Inc.",
	                mission: "Greenpeace's mission is to halt environmental destruction and to promote solutions for future generations.",
	                description: "Greenpeace is a force for hope. We are independent and non-partisan. We do not solicit donations from corporations or governments and rely on individuals such as you to make our work possible.<br>One of Greenpeace's unique strengths is our capacity to conduct international campaigns in countries around the world, giving us the ability to challenge environmental threats and promote change on issues that transcend national borders and require international cooperation.<br>Greenpeace has a strong track record, thanks to individuals like you. We continue to increasingly gain a reputation as a formidable force in the realm of international environmental policy through sophisticated strategies which form a unique combination of advocacy, lobbying, research & education and complex negotiations with corporations and in international forums.",
	                url: "http://www.greenpeace.org/usa/fund/",
	                is_visible: True,
	                email: "",
	                category_id: 18
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "National Organization for Rare Disorders",
	                mission: "A unique federation of voluntary health organizations dedicated to helping people with rare ''orphan'' diseases and assisting the organizations that serve them. NORD is committed to the identification, treatment, and cure of rare disorders through programs of education, advocacy, research, and service.",
	                description: "What is A Rare Disorder?<br>A rare or ''orphan'' disease affects fewer than 200,000 people in the United States. There are more than 6,000 rare disorders that, taken together, affect approximately 25 million Americans. For almost twenty years, NORD has served as the primary non-governmental clearinghouse for information on rare disorders. NORD also provides referrals support groups and other sources of assistance.<br>NORD was established in 1983 by patients and families who worked together to get the Orphan Drug Act passed. This legislation provides financial incentives to encourage development of new treatments for rare diseases.<br>NORD provides information about diseases, referrals to patient organizations, research grants and fellowships, advocacy for the rare-disease community, and Medication Assistance Programs that help needy patients obtain certain drugs they could not otherwise afford. ",
	                url: "http://www.rarediseases.org/",
	                is_visible: True,
	                email: "orphan@rarediseases.org",
	                category_id: 19
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Hispanic Scholarship Fund",
	                mission: "To strengthen America by advancing higher education for Hispanic Americans.",
	                description: "The Hispanic Scholarship Fund (HSF) is the nation's leading organization supporting Hispanic higher education. Founded in 1975 as a 501(c)(3) not-for-profit organization, HSF's vision is to strengthen the country by advancing college education among Hispanic Americans. In support of its mission to double the rate of Hispanics earning college degrees, HSF provides the Latino community more college scholarships and educational outreach support than any other organization in the country. During the 2007-2008 academic year, HSF awarded almost 4,100 scholarships exceeding 26.6 million dollars. In its 33-year history, HSF has awarded in excess of 86,000 scholarships, worth more than 247 million dollars, to Latinos attending nearly 2,000 colleges and universities in all 50 states, Puerto Rico, Guam and the U.S. Virgin Islands.",
	                url: "http://www.hsf.net/",
	                is_visible: True,
	                email: "",
	                category_id: 20
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "National Alliance to End Homelessness",
	                mission: "The National Alliance to End Homelessness is a nonpartisan organization committed to preventing and ending homelessness in the United States.",
	                description: "The National Alliance to End Homelessness is a leading voice on the issue of homelessness. The Alliance analyzes policy and develops pragmatic, cost-effective policy solutions. We work collaboratively with the public, private, and nonprofit sectors to build state and local capacity, leading to stronger programs and policies that help communities achieve their goal of ending homelessness. We provide data and research to policymakers and elected officials in order to inform policy debates and educate the public and opinion leaders nationwide.<br>The Ten Year Plan:  Guiding our work is A Plan, Not a Dream: How to End Homelessness in Ten Years. The Alliance's Ten Year Plan identifies our nation's current challenges in addressing the problem and lays out practical steps that can be taken to change its present course and truly end homelessness. The announcement of this plan started a snowball effect that is now felt across the country. The Administration and Congress have adopted significant parts of the Ten Year Plan as policy goals. Opinion leaders have begun to echo the language and key concepts of the plan and communities and states across the nation have taken up the challenge to end homelessness. Hundreds of communities are developing or have implemented plans to end homelessness within ten years. Across the country, the movement is growing. Now more than ever, our nation is poised to end homelessness.",
	                url: "http://www.endhomelessness.org/",
	                is_visible: True,
	                email: "naeh@naeh.org",
	                category_id: 21
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Human Rights First",
	                mission: "Human Rights First believes that building respect for human rights and the rule of law will help ensure the dignity to which every individual is entitled and will stem tyranny, extremism, intolerance, and violence.",
	                description: "Human Rights First protects people at risk: refugees who flee persecution, victims of crimes against humanity or other mass human rights violations, victims of discrimination, those whose rights are eroded in the name of national security, and human rights advocates who are targeted for defending the rights of others. These groups are often the first victims of societal instability and breakdown; their treatment is a harbinger of wider-scale repression. Human Rights First works to prevent violations against these groups and to seek justice and accountability for violations against them.<br>Human Rights First is practical and effective. We advocate for change at the highest levels of national and international policymaking. We seek justice through the courts. We raise awareness and understanding through the media. We build coalitions among those with divergent views. And we mobilize people to act.",
	                url: "http://www.humanrightsfirst.org",
	                is_visible: True,
	                email: "",
	                category_id: 22
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "American Red Cross",
	                mission: "The American Red Cross is where people mobilize to help their neighbors&#8212;across the street, across the country, and across the world&#8212;in emergencies.",
	                description: "Since its founding in 1881 by visionary leader Clara Barton, the American Red Cross has been the nation's premier emergency response organization. As part of a worldwide movement that offers neutral humanitarian care to the victims of war, the American Red Cross distinguishes itself by also aiding victims of devastating natural disasters. Over the years, the organization has expanded its services, always with the aim of preventing and relieving suffering.<br>Today, in addition to domestic disaster relief, the American Red Cross offers compassionate services in five other areas: community services that help the needy; support and comfort for military members and their families; the collection, processing and distribution of lifesaving blood and blood products; educational programs that promote health and safety; and international relief and development programs.<br>The American Red Cross is where people mobilize to help their neighbors&#8212;across the street, across the country, and across the world&#8212;in emergencies. Each year, in communities large and small, victims of some 70,000 disasters turn to neighbors familiar and new&#8212;the more than half a million volunteers and 35,000 employees of the Red Cross. Through over 700 locally supported chapters, more than 15 million people gain the skills they need to prepare for and respond to emergencies in their homes, communities and world.",
	                url: "http://www.redcross.org/",
	                is_visible: True,
	                email: "",
	                category_id: 23
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Farm Aid",
	                mission: "Family farmers, good food, a better America.",
	                description: "Farm Aid features the best that music has to offer, while remaining true to its ultimate mission.<br>23 years of great music, supporting farmers, and strengthening America.Promoting Food from Family Farms<br>Farm Aid stages America's longest running annual concert event that unites farmers, artists, consumers, and concerned citizens to build a powerful movement for good food from family farms. Throughout the year, Farm Aid promotes food from family farms through inspiring and informative television, radio, mail, and web campaigns.<br>Growing the Good Food Movement<br>The Good Food Movement is growing the number of Americans reaching for and demanding family farm-identified, local, organic or humanely-raised food. Farm Aid grants build connections between farmers and consumers creating new markets for family farmers.",
	                url: "http://www.farmaid.org",
	                is_visible: True,
	                email: "info@farmaid.org",
	                category_id: 24
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Global Hunger Project",
	                mission: "The Hunger Project is a global, non-profit, strategic organization committed to the sustainable end of world hunger.",
	                description: "In Africa, Asia and Latin America, The Hunger Project seeks to end hunger and poverty by empowering people to lead lives of self-reliance, meet their own basic needs and build better futures for their children.<br>The Hunger Project carries out its mission through three essential activities: mobilizing village clusters at the grassroots level to build self-reliance, empowering women as key change agents, and forging effective partnerships with local government.",
	                url: "http://www.thp.org/",
	                is_visible: True,
	                email: "",
	                category_id: 25
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Grameen Foundation",
	                mission: "Combining the power of microfinance, technology and innovative solutions to defeat global poverty.",
	                description: "Using microfinance and technology, we work with local poverty-focused organizations and global allies to help them reach and serve more of the world's poor people more effectively. Our goal is to use our resources, knowledge and innovations to identify large scale solutions and strategies that really do move people out of poverty, and then share that knowledge widely.",
	                url: "http://www.grameenfoundation.org/",
	                is_visible: True,
	                email: "",
	                category_id: 26
	        });
	        this.Recipient.create({
	                twitter_name: "ajwsdotorg",
	                name: "American Jewish World Service",
	                mission: "American Jewish World Service (AJWS) is an international development organization motivated by Judaism's imperative to pursue justice.",
	                description: "AJWS is dedicated to alleviating poverty, hunger and disease among the people of the developing world regardless of race, religion or nationality. Through grants to grassroots organizations, volunteer service, advocacy and education, AJWS fosters civil society, sustainable development and human rights for all people, while promoting the values and responsibilities of global citizenship within the Jewish community.",
	                url: "http://www.ajws.org/",
	                is_visible: True,
	                email: "",
	                category_id: 27
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Proliteracy Worldwide",
	                mission: "ProLiteracy champions the power of literacy to improve the lives of adults and their families, communities, and societies.",
	                description: "ProLiteracy works with our members, partners, and the adult learners they serve; along with local, national, and international organizations. ProLiteracy helps build the capacity and quality of programs that are teaching adults to read, write, compute, use technology, and learn English as a new language...",
	                url: "http://www.proliteracy.org",
	                is_visible: True,
	                email: "info@proliteracy.org",
	                category_id: 28
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Mental Health America",
	                mission: "Mental Health America is dedicated to promoting mental health, preventing mental and substance use conditions and achieving victory over mental illnesses and addictions through advocacy, education, research and service.",
	                description: "Mental Health America envisions a just, humane and healthy society in which all people are accorded respect, dignity and the opportunity to achieve their full potential through meaningful social inclusion that is free from discrimination.<br>Consistent with this mission, Mental Health America's membership adopted a new Statement of Purpose in 2007, coinciding with the change in the name of the organization. The purposes of (Mental Health America) the Corporation are to work for wellness, mental health and victory over mental and substance use conditions through the development of a coordinated citizens' voluntary movement; to advocate for the improved care and treatment of persons with mental and substance use conditions; to advocate for improved methods and services in research, prevention, detection, diagnosis and treatment of mental and substance use conditions; to educate the public about mental and substance use conditions and their causes and treatments; and to fight tigma and prejudice and promote social justice and recovery from mental and substance use conditions.",
	                url: "http://www.nmha.org/",
	                is_visible: True,
	                email: "sjones@mentalhealthamerica.net",
	                category_id: 29
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "International Peace Institute",
	                mission: "The International Peace Institute (IPI) formerly International Peace Academy is an independent, international institution dedicated to promoting the prevention and settlement of armed conflict between and within states through policy research and development.",
	                description: "IPI is uniquely placed to facilitate this necessary exchange among academia, governments, NGOs, and international organizations, and thus to help build a more secure and peaceful world. I am extremely fortunate to have inherited a thriving institution in early 2005 from previous IPI Presidents Ð Major General Rikhye, the Honorable Olara Otunnu and, in particular, my immediate predecessor, Ambassador David Malone Ð who made IPI a fixture in United Nations circles and beyond.<br>As a policy research institute, our core goal is to inform decision-makers in government and the UN of trends and dynamics in peace and security and provide them with realistic policy recommendations. We do so by generating policy-relevant research and by channeling expert advice from all over the world into the UN system. Our publications are also of much broader relevance, often appearing in university teaching curricula, academic research papers, and media commentary. In this way, IPI's research contributes to a broader debate on the role of the United Nations in today's world.",
	                url: "http://www.ipacademy.org/",
	                is_visible: True,
	                email: "ipi@ipinst.org",
	                category_id: 30
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Population Council",
	                mission: "To improve the well-being and reproductive health of current and future generations around the world and to help achieve a humane, equitable, and sustainable balance between people and resources.",
	                description: "Since 1952, the Population Council has been the premier international organization conducting biomedical, public health, and social science research on population issues. The Council has been instrumental in the design of health products, service-delivery programs, and public policies responsive to the needs of people living in the world's poorest countries.<br>Reflecting a commitment to excellence, objectivity, and policy relevance, Council research identifies promising, sustainable approaches to enhancing people's health and well-being. The widespread dissemination of its findings&#8212;and partnerships with nearly 200 governments, universities, and nongovernmental organizations&#8212;ensure that Council researchers' work can and does make a positive difference in people's lives.<br>Policymakers, program managers, and others concerned with a wide array of population issues turn to the Council for evidence of what works in the real world to improve people's lives.",
	                url: "http://www.popcouncil.org/",
	                is_visible: True,
	                email: "development@popcouncil.org",
	                category_id: 31
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "National Council on Aging",
	                mission: "To improve the lives of older Americans.",
	                description: "The National Council on Aging is a non-profit service and advocacy organization headquartered in Washington, DC.<br> - NCOA is a national voice for older adults Ð especially those who are vulnerable and disadvantaged -- and the community organizations that serve them.<br> - NCOA brings together non-profit organizations, businesses and government to develop creative solutions that improve the lives of all older adults.<br> - NCOA works with thousands of organizations across the country to help seniors live independently, find jobs and benefits, improve their health, live independently and remain active in their communities",
	                url: "http://www.ncoa.org/",
	                is_visible: True,
	                email: "",
	                category_id: 32
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Sunshine Foundation",
	                mission: "The Sunshine Foundation's sole purpose is to answer the dreams of chronically ill, seriously ill, physically challenged and abused children ages three to eighteen, whose families cannot fulfill their requests due to financial strain that the child's illness may cause.",
	                description: "In order to receive a dream through Sunshine Foundation, a child must meet the following requirements:<br> - They must be between the ages of 3-18<br> - The child must be chronically ill, seriously ill, physically challenged or abused<br> - The parent's or guardian's annual income may not exceed 75,000 dollars<br> - The child or any other family member may not have had a dream granted through Sunshine Foundation or any other wish-granting organization. Sunshine Foundation grants ONE DREAM PER FAMILY<br> - The child must be a citizen of the United States",
	                url: "http://www.sunshinefoundation.org/",
	                is_visible: True,
	                email: "philly@sunshinefoundation.org",
	                category_id: 33
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "National Military Family Association",
	                mission: "To educate military families concerning their rights, benefits and services available to them and to inform them regarding the issues that affect their lives and... To promote and protect the interests of military families by influencing the development and implementation of legislation and policies affecting them.",
	                description: "NMFA activities revolve around programs to educate the public, the military community, and the Congress on the rights and benefits of military families AND to advocate an equitable quality of life for those families. Members of the Government Relations Department study issues, testify before Congressional Committees, work with Congressional staff and represent NMFA on advisory groups for many DoD agencies, to include the Defense Commissary Agency Patron Council and the TRICARE Beneficiary Panel. Since its inception in 1969, the effectiveness of NMFA is reflected in accomplishments in most of the issue areas in which the association works. These include medical and dental benefits, dependent education, retiree and survivor benefits, relocation and spousal employment. NMFA staff speaks regularly to all types of groups, including family service organizations, Commanders' Conferences, and officer and enlisted spouse clubs. More than 100 NMFA Representatives in the field extend our presence worldwide. NMFA has access and credibility in areas where it CAN and DOES make a difference.<br>NMFA sponsors a military spouse scholarship program, as well as the NMFA Very Important Patriot Award, which recognizes outstanding volunteers in the military community, and the NMFA Family Award, which recognizes families that exemplify the best of the military lifestyle. In 2004, it published an analysis of military family support, entitled Serving the Homefront: An Analysis of Military Family Support Since September 11, 2001. NMFA sponsors Operation Purple Camps for children of deployed service members in many U.S. military communities around the world. <br>NMFA, ''The Voice for Military Families,'' is dedicated to providing information to and representing the interests of family members of the uniformed services on which our national security depends. Its website, www.nmfa.org, provides extensive information for military families and those who service them. It publishes a monthly newsletter as well as a weekly legislative e-mail newsletter, the Government and You E-News.",
	                url: "http://www.nmfa.org/",
	                is_visible: True,
	                email: "Info@MilitaryFamily.org",
	                category_id: 34
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Global Fund for Women",
	                mission: "The Global Fund makes grants to seed, strengthen and link women's rights groups based outside the United States working to address human rights issues.",
	                description: "The Global Fund for Women is an international network of women and men committed to a world of equality and social justice. We advocate for and defend women's human rights by making grants to support women's groups around the world.<br>We are part of a global women's movement that is rooted in a commitment to justice and an appreciation of the value of women's experience. The challenges women face vary widely across communities, cultures, religions, traditions and countries. We believe that women should have a full range of choices, and that women themselves know best how to determine their needs and propose solutions for lasting change. The way in which we do our work is as important as what we do. This philosophy is reflected in our flexible, respectful and responsive style of grantmaking.",
	                url: "http://www.globalfundforwomen.org",
	                is_visible: True,
	                email: "donations@globalfundforwomen.org",
	                category_id: 35
	        });
	        this.Recipient.create({
	                twitter_name: "",
	                name: "Big Brothers Big Sisters",
	                mission: "To help children reach their potential through professionally supported, one-to-one relationships with mentors that have a  measurable impact on youth.",
	                description: "Big Brothers Big Sisters is the oldest, largest and most effective youth mentoring organization in the United States. We have been the leader in one-to-one youth service for more than a century, developing positive relationships that have a direct and lasting impact on the lives of young people. Big Brothers Big Sisters mentors children, ages 6 through 18, in communities across the country - including yours.",
	                url: "http://www.bbbs.org",
	                is_visible: True,
	                email: "donations@bbbs.org",
	                category_id: 36
	        });
		}
		////// RECIPIENTPERCENTS ////////
		if (this.RecipientPercent.count() == 0) {
			this.RecipientPercent.create({
				recipient_id: 1,
				percent: 0.05
			});
			this.RecipientPercent.create({
				recipient_id: 2,
				percent: 1.00
			});
		}
		////// SITEGROUPS ////////
		if (this.SiteGroup.count() == 0) {
			//this.SiteGroup.create({
			
			//});
		}
		
	},
	
	dispatch: function(doc, url) {
		//logger("dispatch()", doc, url);
		this.controller.dispatch_by_host(doc, _href());
	},
	
	house_keeping: function() {
		/* Called on every page load.
		   Checks schedule. Not sure if it should do anything else... */
		
		// does period checks
		//   * latext version of extension?
		//   * new 24hr period?
		//   * new week?
		this.schedule.run();
		
		// @TODO might still want last vist to be time in seconds not 0 >>>??
		var last_global = this.prefs.get('last_visit', 0);
		var first = this.prefs.get('first_visit', 0);
		// var currentTime = new Date();
		// var t_in_s = Math.round(currentTime.getTime()/1000);
		// this.prefs.set('last_visit', t_in_s);
	},

	start_recording: function(url) {
		this.stop_recording();
		
		if (this.prefs.get("idle_timeout_mode", true)) {
			this.prefs.set("last_url", url);
			var now = Math.round((new Date()).getTime() / 1000);
			this.prefs.set("last_start", now);
			this.prefs.set("last_wakeup", now);
		}
	},
	
	stop_recording: function() {
		var url = this.prefs.get("last_url", false);
		if (url) {
			this.prefs.set("last_url", null);
			var start = this.prefs.get("last_start");
			var now = Math.round((new Date()).getTime() / 1000.0);
			//logger(" start: "+start+" now: "+now+" diff: "+now-start);
			this.prefs.set("last_start", null);
			var diff = now - start;
			// cap diff at 20 mintes (60s/m * 20m)
			if (diff > 60*20) {
				diff = 60*20;
			}
			this.store_visit(url, start, diff);
		}
	},
	
	store_visit: function(url, start_time, duration) {
		logger("  >>>> store_visit ");
		
		var site = null;
		this.Site.select({ url__eq: url }, function(row) {
			logger(row[0]);
			site = row;
		});

		logger(site);
		if (!site) {
			var host = _host(url);
			var sitegroup = this.SiteGroup.get_or_null({ host: host });
			if (!sitegroup) {
				sitegroup = this.SiteGroup.create({ name: host, host: host });
			}
			site = this.Site.create({ url: url, sitegroup_id: sitegroup.id });
		}
		logger("store_visit site: "+site);
		
		var visit = this.Visit.create({
			site_id: site.id,
			enter_at: start_time,
			duration: duration
		});
		logger("store_visit visit: " + visit);
		
		this.update_totals(site, visit);
	},
		
	update_totals: function(site, visit) {
		
		var sitegroup = this.SiteGroup.get_or_null({ id: site.sitegroup_id });
		var tag = this.Tag.get_or_null({ id: sitegroup.tag_id })
		if (!tag) {
			tag = this.Unsorted;
			if (tag) {
				this.SiteGroup.set({ tag_id: tag.id }, { id: sitegroup.id });
			}
		}
		
		var totals = {};
		
		var pd_recipient = this.Recipient.get_or_null({ twitter_name: "ProcrasDonate" });
		var pd_recipientpercent = this.RecipientPercent.get_or_null({ recipient_id: pd_recipient.id });
		
		var end_of_day     = _dbify_date(_end_of_day());
		var end_of_week    = _dbify_date(_end_of_week());
		var end_of_forever = _end_of_forever;
		
		var timetypes = [ this.Daily, this.Weekly, this.Forever ];
		var times     = [ end_of_day, end_of_week, end_of_forever ];
		
		var cents_per_hour = this.prefs.get('cents_per_hour', 0);
		var time_delta = visit.duration;
		// recipient percents and pd skim not applied
		var full_amount_delta = ( time_delta / (60.0*60.0) ) * cents_per_hour
		var skim_amount = full_amount_delta * parseFloat(pd_recipientpercent.percent);
		var rest_amount = full_amount_delta - skim_amount;
		
		// array objects containing:
		//	contenttype instance
		//  content instance
		//  amt (float)
		var content_instances = [];
		
		var self = this;
		this.ContentType.select({}, function(row) {
			if (row.modelname == "Site") {
				if (tag == self.TimeWellSpent) {
					content_instances.push({
						contenttype: row,
						content: site,
						amt: rest_amount,
					});
				}
			} else if (row.modelname == "SiteGroup") {
				content_instances.push({
					contenttype: row,
					content: sitegroup,
					amt: rest_amount,
				});

			} else if (row.modelname == "Tag") {
				content_instances.push({
					contenttype: row,
					content: tag,
					amt: rest_amount,
				});

			} else if (row.modelname == "Recipient") {
				if (tag != self.Unsorted) {
					self.RecipientPercent.select({}, function(r) {
						if (r == pd_recipientpercent) {
							content_instances.push({
								contenttype: row,
								content: pd_recipient,
								amt: skim_amount,
							});
						} else {
							if (tag == self.ProcrasDonate) {
								content_instances.push({
									contenttype: row,
									content: r,
									amt: rest_amount * parseFloat(r.percent),
								});
							}
						}
					});
				}
				
			} else {
			}
		});

		for (var i = 0; i < timetypes.length; i++) {
		
			for (var j = 0; i < content_instances.length; i++) {
				var triple = content_instances[j];
				var contenttype = triple.contenttype;
				var content = triple.content;
				var amt = triple.amt;
				logger(" `````triple: "+triple);
				logger(" `````contenttype: "+contenttype);
				logger(" `````content: "+content);
				logger(" `````amt: "+amt);
				
				logger(" .....timetypes="+timetypes+" length="+timetypes.length);
				logger(" .....times="+times+" length="+times.length);
				logger(" .....before.. total...");
				var total = this.Total.get_or_create({
					contenttype_id: contenttype.id,
					content_id: content.id,
					time: times[0],
					timetype_id: timetypes[i].id
				}, {
					total_time: 0,
					total_amount: 0,
				});
				logger(" .....after.. total="+total);
				
				this.Total.set({
					total_time: parseInt(total.total_time) + time_delta,
					total_amount: parseFloat(total.total_amount) + triple.amt
				}, {
					id: total.id
				});
				
				if (contenttype.modelname == "Tag") {
					this.Payment.get_or_create({
						total_id: total.id
					}, {
						tipjoy_transaction_id: 0,
					});
				}
			}
		}
	},
};

var myOverlay = new Overlay();
