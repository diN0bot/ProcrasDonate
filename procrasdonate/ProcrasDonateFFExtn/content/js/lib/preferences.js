

function PreferenceManager(prefix, defaults) {
	this.prefix = prefix || "ProcrasDonate.";
	this.defaults = defaults;
	
	this.service = Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService);
	this.pref = this.service.getBranch(this.prefix);
	
	this.observers = {};
}
PreferenceManager.prototype = {};
_extend(PreferenceManager.prototype, {
	exists: function(name) {
		return this.pref.getPrefType(name) != this.pref.PREF_INVALID;
	},
	save: function() {
		this.service.savePrefFile(null);
	},
	
	get: function(name, default_value) {
		var type = this.pref.getPrefType(name);
		
		if (type == this.pref.PREF_INVALID)
			return default_value;
		
		switch (type) {
		case this.pref.PREF_STRING:
			return this.pref.getCharPref(name);
		case this.pref.PREF_BOOL:
			return this.pref.getBoolPref(name);
		case this.pref.PREF_INT:
			return this.pref.getIntPref(name);
		default:
			throw new Error(
				"Invalid preference type \"" + type + "\" for \"" + name + "\"");
		}
	},
	set: function(name, value) {
		var type = typeof(value);
		
		switch (type) {
			case "string":
			case "boolean":
				break;
			case "number":
				if (value % 1 != 0) {
					throw new Error("Cannot set preference to non integral number");
				}
				break;
			//case "object":
				//type = "string";
				//value = JSON.stringify(value);
				//alert("value: "+value+" string: "+JSON.stringify(value));
			//	break;
			default:
				try {
					this.FAIL(); // we expect this to fail because we haven't defined a FAIL property!
				} catch (e) {
					logger("ERROR: lib/preferences.set::"+e.stack);
				}
				throw new Error("Cannot set preference with datatype: " + type +
						"\nname="+name+" value="+value);
		}
		
		// underlying preferences object throws an exception if new pref has a
		// different type than old one. i think we should not do this, so delete
		// old pref first if this is the case.
		if (this.exists(name) && type != typeof(this.get(name))) {
			this.remove(name);
		}
		
		// set new value using correct method
		switch (type) {
		case "string":
			this.pref.setCharPref(name, value);
			break;
		case "boolean":
			this.pref.setBoolPref(name, value);
			break;
		case "number":
			this.pref.setIntPref(name, Math.floor(value));
			break;
		}
	},
	// deletes the named preference or subtree
	remove: function(name) {
		this.pref.deleteBranch(name);
	},
	
	// call a function whenever the named preference subtree changes
	watch: function(name, watcher) {
		// construct an observer
		var observer={
			observe: function(subject, topic, name) {
				watcher(name);
			}
		};
		
		// store the observer in case we need to remove it later
		this.observers[watcher]=observer;
		
		this.pref.QueryInterface(Components.interfaces.nsIPrefBranchInternal).
			addObserver(name, observer, false);
	},
	// stop watching
	unwatch: function(name, watcher) {
		if (this.observers[watcher]) {
			this.pref.QueryInterface(Components.interfaces.nsIPrefBranchInternal)
				.removeObserver(name, this.observers[watcher]);
		}
	},
	
	/** @return an array of all preference keys */
	get_pref_keys: function() {
		return this.pref.getChildList("", {})
	},
	
	/** @return dictionary of (key, value) pairs for all preferences */
	get_all: function() {
		var self = this;
		var ret = {};
		var keys = self.get_pref_keys();
		_iterate(keys, function(idx, key, index) {
			ret[key] = self.get(key, "__DEFAULT__");
		});
		return ret
	},
});

