var includedScripts = [
	'chrome://pageaddict/content/procrasdonate.js',
	'chrome://pageaddict/content/procrasdonate/constants.js',
	'chrome://pageaddict/content/procrasdonate/main.js',
	'chrome://pageaddict/content/procrasdonate/html.js',
	'chrome://pageaddict/content/pageaddict.js'
];

var pageaddict_gmCompiler={

// getUrlContents adapted from Greasemonkey Compiler
// http://www.letitblog.com/code/python/greasemonkey.py.txt
// used under GPL permission
//
// most everything else below based heavily off of Greasemonkey
// http://greasemonkey.mozdev.org/
// used under GPL permission

getUrlContents: function(aUrl){
	var	ioService=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var	scriptableStream=Components
		.classes["@mozilla.org/scriptableinputstream;1"]
		.getService(Components.interfaces.nsIScriptableInputStream);

	var	channel=ioService.newChannel(aUrl, null, null);
	var	input=channel.open();
	scriptableStream.init(input);
	var	str=scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();

	return str;
},

isGreasemonkeyable: function(url) {
	var scheme=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService)
		.extractScheme(url);
	return (
		(scheme == "http" || scheme == "https" || scheme == "file") &&
		!/hiddenWindow\.html$/.test(url)
	);
},

contentLoad: function(e) {
	var unsafeWin=e.target.defaultView;
	if (unsafeWin.wrappedJSObject) unsafeWin=unsafeWin.wrappedJSObject;

	var unsafeLoc=new XPCNativeWrapper(unsafeWin, "location").location;
	var href=new XPCNativeWrapper(unsafeLoc, "href").href;

	if (
		pageaddict_gmCompiler.isGreasemonkeyable(href)
		&& ( /.*/.test(href) )
		&& true
	) {
		var scripts = [];
		for (var i in includedScripts) {
			var script = pageaddict_gmCompiler.getUrlContents(includedScripts[i]);
			scripts.push(script);
		}
		pageaddict_gmCompiler.injectScript(scripts.join("\n"), href, unsafeWin);
	}
},

injectScript: function(script, url, unsafeContentWin) {
	var sandbox, script, logger, storage, xmlhttpRequester;
	var safeWin=new XPCNativeWrapper(unsafeContentWin);

	sandbox=new Components.utils.Sandbox(safeWin);

	var storage=new pageaddict_ScriptStorage();
	xmlhttpRequester=new pageaddict_xmlhttpRequester(
		unsafeContentWin, window//appSvc.hiddenDOMWindow
	);

	sandbox.window=safeWin;
	sandbox.document=sandbox.window.document;
	sandbox.unsafeWindow=unsafeContentWin;

	// patch missing properties on xpcnw
	sandbox.XPathResult=Components.interfaces.nsIDOMXPathResult;

	// add our own APIs
	sandbox.GM_addStyle=function(css) { pageaddict_gmCompiler.addStyle(sandbox.document, css) };
	sandbox.GM_setValue=pageaddict_gmCompiler.hitch(storage, "setValue");
	sandbox.GM_getValue=pageaddict_gmCompiler.hitch(storage, "getValue");
	sandbox.GM_delValue=pageaddict_gmCompiler.hitch(storage, "remove");
	sandbox.GM_savePrefs=pageaddict_gmCompiler.hitch(storage, "savePrefs");
	sandbox.GM_openInTab=pageaddict_gmCompiler.hitch(this, "openInTab", unsafeContentWin);
	sandbox.GM_xmlhttpRequest=pageaddict_gmCompiler.hitch(
		xmlhttpRequester, "contentStartRequest"
	);
	//unsupported
	sandbox.GM_registerMenuCommand=function(){};
	sandbox.GM_log=function(msg) {
		var consoleService = Components.classes["@mozilla.org/consoleservice;1"].
			getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage(msg);
	};
	
	sandbox.__proto__=sandbox.window;
	
	try {
		this.evalInSandbox(
			"(function(){"+script+"})()",
			url,
			sandbox);
	} catch (e) {
		var e2=new Error(typeof e=="string" ? e : e.message);
		e2.fileName=script.filename;
		e2.lineNumber=0;
		//GM_logError(e2);
		alert(e2);
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

openInTab: function(unsafeContentWin, url) {
	var unsafeTop = new XPCNativeWrapper(unsafeContentWin, "top").top;

	for (var i = 0; i < this.browserWindows.length; i++) {
		this.browserWindows[i].openInTab(unsafeTop, url);
	}
},

hitch: function(obj, meth) {
	if (!obj[meth]) {
		throw "method '" + meth + "' does not exist on object '" + obj + "'";
	}

	var staticArgs = Array.prototype.splice.call(arguments, 2, arguments.length);

	return function() {
		// make a copy of staticArgs (dont modify it because it gets reused for
		// every invocation).
		var args = staticArgs.concat();

		// add all the new arguments
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		// invoke the original function with the correct this obj and the combined
		// list of static and dynamic arguments.
		return obj[meth].apply(obj, args);
	};
},

addStyle:function(doc, css) {
	var head, style;
	head = doc.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = doc.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
},

onLoad: function() {
	var	appcontent=window.document.getElementById("appcontent");
	if (appcontent && !appcontent.greased_pageaddict_gmCompiler) {
		appcontent.greased_pageaddict_gmCompiler=true;
		appcontent.addEventListener("DOMContentLoaded", pageaddict_gmCompiler.contentLoad, false);
	}
},

onUnLoad: function() {
	//remove now unnecessary listeners
	window.removeEventListener('load', pageaddict_gmCompiler.onLoad, false);
	window.removeEventListener('unload', pageaddict_gmCompiler.onUnLoad, false);
	window.document.getElementById("appcontent").
		removeEventListener("DOMContentLoaded", pageaddict_gmCompiler.contentLoad, false);
},

goToStats: function() {
	window.content.location.href="http://pageaddict.com";
},

}; //object pageaddict_gmCompiler


function pageaddict_ScriptStorage() {
	this.prefMan=new pageaddict_PrefManager();
}
pageaddict_ScriptStorage.prototype.setValue = function(name, val) {
	this.prefMan.setValue(name, val);
}
pageaddict_ScriptStorage.prototype.getValue = function(name, defVal) {
	return this.prefMan.getValue(name, defVal);
}
pageaddict_ScriptStorage.prototype.remove = function(name) {
	return this.prefMan.remove(name);
}
pageaddict_ScriptStorage.prototype.savePrefs = function() {
	return this.prefMan.savePrefs();
}

window.addEventListener('load', pageaddict_gmCompiler.onLoad, false);
window.addEventListener('unload', pageaddict_gmCompiler.onUnLoad, false);
