


function PageRequest(url, event) {
	this.url = url;
	this.event = event;
}
PageRequest.prototype = {};
_extend(PageRequest.prototype, {
	get_unsafeContentWin: function() {
		var unsafeWin = this.event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		return unsafeWin;
	},
	get_document: function() {
		var document = this.event.originalTarget;
		return document;
	},
	get_document_type: function() {
		var document = this.get_document();
		
		if (event.originalTarget instanceof HTMLDocument) {
			// Target is an HTML element
			if (event.originalTarget.defaultView.frameElement) {
				// Target is a frame
				return "html frame";
			} else {
				return "html";
			}
		} else {
			return "other";
		}
	},
	
	add_jQuery_ui: function() {
		var self = this;
		// the jQuery referenced inside here refers to the object loaded by the jQuery library
		var jq = function(selector, context) {
			return jQuery.fn.init(selector, context || self.get_document());
		};
		jQuery.extend(jq, jQuery);
		var c = self.get_document();
		jQuery_UI(jq, c)
		//jQuery_UI(function() { return self.jQuery.apply(self, Array.prototype.slice.apply(arguments, [0])) });
		return jq
	},
	
	jQuery: (function() {
		// the jQuery referenced inside here refers to the object loaded by the jQuery library
		var jq = function(selector, context) {
			//logger("request.jQuery(): " + selector + this.event);
			return jQuery.fn.init(selector, context || this.get_document());
		};
		jQuery.extend(jq, jQuery);
		return jq;
	})(),
		
	do_in_page: function(fn) {
		new XPCNativeWrapper(this.get_unsafeContentWin(), "setTimeout()").
			setTimeout(fn, 0);
	},
	
	http_request: function() {
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
	},
	
	inject_script: function(script) {
		var url = this.url;
		var unsafeContentWin = this.get_unsafeContentWin();
		var safeWin = new XPCNativeWrapper(unsafeContentWin);
		
		var sandbox = new Components.utils.Sandbox(safeWin);
		
		//var storage=new pageaddict_ScriptStorage();
		//xmlhttpRequester=new pageaddict_xmlhttpRequester(
		//	unsafeContentWin, window//appSvc.hiddenDOMWindow
		//);
		
		sandbox.window=safeWin;
		sandbox.document=sandbox.window.document;
		sandbox.unsafeWindow=unsafeContentWin;
		
		// patch missing properties on xpcnw
		sandbox.XPathResult=Components.interfaces.nsIDOMXPathResult;
		
		// Here we add all the necessary references to the sandbox:
		sandbox.jQuery = sandbox.$ = function(selector, context) {
			return jQuery.fn.init(selector, context || sandbox.document);
		}
		
		
		
		// add our own APIs
		//sandbox.GM_addStyle=function(css) { 
		//	pageaddict_gmCompiler.addStyle(sandbox.document, css) };
		//sandbox.GM_setValue=pageaddict_gmCompiler.hitch(storage, "setValue");
		//sandbox.GM_getValue=pageaddict_gmCompiler.hitch(storage, "getValue");
		//sandbox.GM_delValue=pageaddict_gmCompiler.hitch(storage, "remove");
		//sandbox.GM_savePrefs=pageaddict_gmCompiler.hitch(storage, "savePrefs");
		//sandbox.GM_openInTab=pageaddict_gmCompiler.hitch(this, "openInTab", unsafeContentWin);
		//sandbox.GM_xmlhttpRequest=pageaddict_gmCompiler.hitch(
		//	xmlhttpRequester, "contentStartRequest"
		//);
		
		//unsupported
		//sandbox.GM_registerMenuCommand=function(){};
		//sandbox.GM_log=function(msg) {
		//	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].
		//		getService(Components.interfaces.nsIConsoleService);
		//	consoleService.logStringMessage(msg);
		//};
		
		sandbox.__proto__=sandbox.window;
		
		try {
			this.evalInSandbox(script, url, sandbox);
		} catch (e) {
			var e2 = new Error(typeof e=="string" ? e : e.message);
			e2.fileName=script.filename;
			e2.lineNumber=0;
			logger(e2);
			//GM_logError(e2);
			//alert(e2);
		}
	},
	
	evalInSandbox: function(code, codebase, sandbox) {
		if (Components.utils && Components.utils.Sandbox) {
			// DP beta+
			Components.utils.evalInSandbox(code, sandbox);
		} else if (Components.utils && Components.utils.evalInSandbox) {
			// DP alphas
			Components.utils.evalInSandbox(code, codebase, sandbox);
		} else if (Sandbox) {
			// 1.0.x
			evalInSandbox(code, sandbox, codebase);
		} else {
			throw new Error("Could not create sandbox.");
		}
	},
	
	
	
});