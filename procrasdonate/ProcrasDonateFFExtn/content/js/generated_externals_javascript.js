;var ProcrasDonate = (function() {


/**************** content/js/ext/jquery-1.2.6.js *****************/
(function(){
/*
 * jQuery 1.2.6 - New Wave Javascript
 *
 * Copyright (c) 2008 John Resig (jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-05-24 14:22:17 -0400 (Sat, 24 May 2008) $
 * $Rev: 5685 $
 */

// Map over jQuery in case of overwrite
var _jQuery = window.jQuery,
// Map over the $ in case of overwrite
	_$ = window.$;

var jQuery = window.jQuery = window.$ = function( selector, context ) {
	// The jQuery object is actually just the init constructor 'enhanced'
	return new jQuery.fn.init( selector, context );
};

// A simple way to check for HTML strings or ID strings
// (both of which we optimize for)
var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#(\w+)$/,

// Is it a simple selector
	isSimple = /^.[^:#\[\.]*$/,

// Will speed up references to undefined, and allows munging its name.
	undefined;

jQuery.fn = jQuery.prototype = {
	init: function( selector, context ) {
		// Make sure that a selection was provided
		selector = selector || document;

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this[0] = selector;
			this.length = 1;
			return this;
		}
		// Handle HTML strings
		if ( typeof selector == "string" ) {
			// Are we dealing with HTML string or an ID?
			var match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] )
					selector = jQuery.clean( [ match[1] ], context );

				// HANDLE: $("#id")
				else {
					var elem = document.getElementById( match[3] );

					// Make sure an element was located
					if ( elem ){
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id != match[3] )
							return jQuery().find( selector );

						// Otherwise, we inject the element directly into the jQuery object
						return jQuery( elem );
					}
					selector = [];
				}

			// HANDLE: $(expr, [context])
			// (which is just equivalent to: $(content).find(expr)
			} else
				return jQuery( context ).find( selector );

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) )
			return jQuery( document )[ jQuery.fn.ready ? "ready" : "load" ]( selector );

		return this.setArray(jQuery.makeArray(selector));
	},

	// The current version of jQuery being used
	jquery: "1.2.6",

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	// The number of elements contained in the matched element set
	length: 0,

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == undefined ?

			// Return a 'clean' array
			jQuery.makeArray( this ) :

			// Return just the object
			this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {
		// Build a new jQuery matched element set
		var ret = jQuery( elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Force the current matched set of elements to become
	// the specified array of elements (destroying the stack in the process)
	// You should use pushStack() in order to do this, but maintain the stack
	setArray: function( elems ) {
		// Resetting the length to 0, then using the native Array push
		// is a super-fast way to populate an object with array-like properties
		this.length = 0;
		Array.prototype.push.apply( this, elems );

		return this;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		var ret = -1;

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem && elem.jquery ? elem[0] : elem
		, this );
	},

	attr: function( name, value, type ) {
		var options = name;

		// Look for the case where we're accessing a style value
		if ( name.constructor == String )
			if ( value === undefined )
				return this[0] && jQuery[ type || "attr" ]( this[0], name );

			else {
				options = {};
				options[ name ] = value;
			}

		// Check to see if we're setting style values
		return this.each(function(i){
			// Set all the styles
			for ( name in options )
				jQuery.attr(
					type ?
						this.style :
						this,
					name, jQuery.prop( this, options[ name ], type, i, name )
				);
		});
	},

	css: function( key, value ) {
		// ignore negative width and height values
		if ( (key == 'width' || key == 'height') && parseFloat(value) < 0 )
			value = undefined;
		return this.attr( key, value, "curCSS" );
	},

	text: function( text ) {
		if ( typeof text != "object" && text != null )
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );

		var ret = "";

		jQuery.each( text || this, function(){
			jQuery.each( this.childNodes, function(){
				if ( this.nodeType != 8 )
					ret += this.nodeType != 1 ?
						this.nodeValue :
						jQuery.fn.text( [ this ] );
			});
		});

		return ret;
	},

	wrapAll: function( html ) {
		if ( this[0] )
			// The elements to wrap the target around
			jQuery( html, this[0].ownerDocument )
				.clone()
				.insertBefore( this[0] )
				.map(function(){
					var elem = this;

					while ( elem.firstChild )
						elem = elem.firstChild;

					return elem;
				})
				.append(this);

		return this;
	},

	wrapInner: function( html ) {
		return this.each(function(){
			jQuery( this ).contents().wrapAll( html );
		});
	},

	wrap: function( html ) {
		return this.each(function(){
			jQuery( this ).wrapAll( html );
		});
	},

	append: function() {
		return this.domManip(arguments, true, false, function(elem){
			if (this.nodeType == 1)
				this.appendChild( elem );
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, true, function(elem){
			if (this.nodeType == 1)
				this.insertBefore( elem, this.firstChild );
		});
	},

	before: function() {
		return this.domManip(arguments, false, false, function(elem){
			this.parentNode.insertBefore( elem, this );
		});
	},

	after: function() {
		return this.domManip(arguments, false, true, function(elem){
			this.parentNode.insertBefore( elem, this.nextSibling );
		});
	},

	end: function() {
		return this.prevObject || jQuery( [] );
	},

	find: function( selector ) {
		var elems = jQuery.map(this, function(elem){
			return jQuery.find( selector, elem );
		});

		return this.pushStack( /[^+>] [^+>]/.test( selector ) || selector.indexOf("..") > -1 ?
			jQuery.unique( elems ) :
			elems );
	},

	clone: function( events ) {
		// Do the clone
		var ret = this.map(function(){
			if ( jQuery.browser.msie && !jQuery.isXMLDoc(this) ) {
				// IE copies events bound via attachEvent when
				// using cloneNode. Calling detachEvent on the
				// clone will also remove the events from the orignal
				// In order to get around this, we use innerHTML.
				// Unfortunately, this means some modifications to
				// attributes in IE that are actually only stored
				// as properties will not be copied (such as the
				// the name attribute on an input).
				var clone = this.cloneNode(true),
					container = document.createElement("div");
				container.appendChild(clone);
				return jQuery.clean([container.innerHTML])[0];
			} else
				return this.cloneNode(true);
		});

		// Need to set the expando to null on the cloned set if it exists
		// removeData doesn't work here, IE removes it from the original as well
		// this is primarily for IE but the data expando shouldn't be copied over in any browser
		var clone = ret.find("*").andSelf().each(function(){
			if ( this[ expando ] != undefined )
				this[ expando ] = null;
		});

		// Copy the events from the original to the clone
		if ( events === true )
			this.find("*").andSelf().each(function(i){
				if (this.nodeType == 3)
					return;
				var events = jQuery.data( this, "events" );

				for ( var type in events )
					for ( var handler in events[ type ] )
						jQuery.event.add( clone[ i ], type, events[ type ][ handler ], events[ type ][ handler ].data );
			});

		// Return the cloned set
		return ret;
	},

	filter: function( selector ) {
		return this.pushStack(
			jQuery.isFunction( selector ) &&
			jQuery.grep(this, function(elem, i){
				return selector.call( elem, i );
			}) ||

			jQuery.multiFilter( selector, this ) );
	},

	not: function( selector ) {
		if ( selector.constructor == String )
			// test special case where just one selector is passed in
			if ( isSimple.test( selector ) )
				return this.pushStack( jQuery.multiFilter( selector, this, true ) );
			else
				selector = jQuery.multiFilter( selector, this );

		var isArrayLike = selector.length && selector[selector.length - 1] !== undefined && !selector.nodeType;
		return this.filter(function() {
			return isArrayLike ? jQuery.inArray( this, selector ) < 0 : this != selector;
		});
	},

	add: function( selector ) {
		return this.pushStack( jQuery.unique( jQuery.merge(
			this.get(),
			typeof selector == 'string' ?
				jQuery( selector ) :
				jQuery.makeArray( selector )
		)));
	},

	is: function( selector ) {
		return !!selector && jQuery.multiFilter( selector, this ).length > 0;
	},

	hasClass: function( selector ) {
		return this.is( "." + selector );
	},

	val: function( value ) {
		if ( value == undefined ) {

			if ( this.length ) {
				var elem = this[0];

				// We need to handle select boxes special
				if ( jQuery.nodeName( elem, "select" ) ) {
					var index = elem.selectedIndex,
						values = [],
						options = elem.options,
						one = elem.type == "select-one";

					// Nothing was selected
					if ( index < 0 )
						return null;

					// Loop through all the selected options
					for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
						var option = options[ i ];

						if ( option.selected ) {
							// Get the specifc value for the option
							value = jQuery.browser.msie && !option.attributes.value.specified ? option.text : option.value;

							// We don't need an array for one selects
							if ( one )
								return value;

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;

				// Everything else, we just grab the value
				} else
					return (this[0].value || "").replace(/\r/g, "");

			}

			return undefined;
		}

		if( value.constructor == Number )
			value += '';

		return this.each(function(){
			if ( this.nodeType != 1 )
				return;

			if ( value.constructor == Array && /radio|checkbox/.test( this.type ) )
				this.checked = (jQuery.inArray(this.value, value) >= 0 ||
					jQuery.inArray(this.name, value) >= 0);

			else if ( jQuery.nodeName( this, "select" ) ) {
				var values = jQuery.makeArray(value);

				jQuery( "option", this ).each(function(){
					this.selected = (jQuery.inArray( this.value, values ) >= 0 ||
						jQuery.inArray( this.text, values ) >= 0);
				});

				if ( !values.length )
					this.selectedIndex = -1;

			} else
				this.value = value;
		});
	},

	html: function( value ) {
		return value == undefined ?
			(this[0] ?
				this[0].innerHTML :
				null) :
			this.empty().append( value );
	},

	replaceWith: function( value ) {
		return this.after( value ).remove();
	},

	eq: function( i ) {
		return this.slice( i, i + 1 );
	},

	slice: function() {
		return this.pushStack( Array.prototype.slice.apply( this, arguments ) );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function(elem, i){
			return callback.call( elem, i, elem );
		}));
	},

	andSelf: function() {
		return this.add( this.prevObject );
	},

	data: function( key, value ){
		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			var data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			if ( data === undefined && this.length )
				data = jQuery.data( this[0], key );

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;
		} else
			return this.trigger("setData" + parts[1] + "!", [parts[0], value]).each(function(){
				jQuery.data( this, key, value );
			});
	},

	removeData: function( key ){
		return this.each(function(){
			jQuery.removeData( this, key );
		});
	},

	domManip: function( args, table, reverse, callback ) {
		var clone = this.length > 1, elems;

		return this.each(function(){
			if ( !elems ) {
				elems = jQuery.clean( args, this.ownerDocument );

				if ( reverse )
					elems.reverse();
			}

			var obj = this;

			if ( table && jQuery.nodeName( this, "table" ) && jQuery.nodeName( elems[0], "tr" ) )
				obj = this.getElementsByTagName("tbody")[0] || this.appendChild( this.ownerDocument.createElement("tbody") );

			var scripts = jQuery( [] );

			jQuery.each(elems, function(){
				var elem = clone ?
					jQuery( this ).clone( true )[0] :
					this;

				// execute all scripts after the elements have been injected
				if ( jQuery.nodeName( elem, "script" ) )
					scripts = scripts.add( elem );
				else {
					// Remove any inner scripts for later evaluation
					if ( elem.nodeType == 1 )
						scripts = scripts.add( jQuery( "script", elem ).remove() );

					// Inject the elements into the document
					callback.call( obj, elem );
				}
			});

			scripts.each( evalScript );
		});
	}
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

function evalScript( i, elem ) {
	if ( elem.src )
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});

	else
		jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );

	if ( elem.parentNode )
		elem.parentNode.removeChild( elem );
}

function now(){
	return +new Date;
}

jQuery.extend = jQuery.fn.extend = function() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

	// Handle a deep copy situation
	if ( target.constructor == Boolean ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target != "object" && typeof target != "function" )
		target = {};

	// extend jQuery itself if only one argument is passed
	if ( length == i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ )
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null )
			// Extend the base object
			for ( var name in options ) {
				var src = target[ name ], copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy )
					continue;

				// Recurse if we're merging object values
				if ( deep && copy && typeof copy == "object" && !copy.nodeType )
					target[ name ] = jQuery.extend( deep, 
						// Never move original objects, clone them
						src || ( copy.length != null ? [ ] : { } )
					, copy );

				// Don't bring in undefined values
				else if ( copy !== undefined )
					target[ name ] = copy;

			}

	// Return the modified object
	return target;
};

var expando = "jQuery" + now(), uuid = 0, windowData = {},
	// exclude the following css properties to add px
	exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
	// cache defaultView
	defaultView = document.defaultView || {};

jQuery.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep )
			window.jQuery = _jQuery;

		return jQuery;
	},

	// See test/unit/core.js for details concerning this function.
	isFunction: function( fn ) {
		return !!fn && typeof fn != "string" && !fn.nodeName &&
			fn.constructor != Array && /^[\s[]?function/.test( fn + "" );
	},

	// check if an element is in a (or is an) XML document
	isXMLDoc: function( elem ) {
		return elem.documentElement && !elem.body ||
			elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
	},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		data = jQuery.trim( data );

		if ( data ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				script = document.createElement("script");

			script.type = "text/javascript";
			if ( jQuery.browser.msie )
				script.text = data;
			else
				script.appendChild( document.createTextNode( data ) );

			// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
	},

	cache: {},

	data: function( elem, name, data ) {
		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ];

		// Compute a unique ID for the element
		if ( !id )
			id = elem[ expando ] = ++uuid;

		// Only generate the data cache if we're
		// trying to access or manipulate it
		if ( name && !jQuery.cache[ id ] )
			jQuery.cache[ id ] = {};

		// Prevent overriding the named cache with undefined values
		if ( data !== undefined )
			jQuery.cache[ id ][ name ] = data;

		// Return the named cache data, or the ID for the element
		return name ?
			jQuery.cache[ id ][ name ] :
			id;
	},

	removeData: function( elem, name ) {
		elem = elem == window ?
			windowData :
			elem;

		var id = elem[ expando ];

		// If we want to remove a specific section of the element's data
		if ( name ) {
			if ( jQuery.cache[ id ] ) {
				// Remove the section of cache data
				delete jQuery.cache[ id ][ name ];

				// If we've removed all the data, remove the element's cache
				name = "";

				for ( name in jQuery.cache[ id ] )
					break;

				if ( !name )
					jQuery.removeData( elem );
			}

		// Otherwise, we want to remove all of the element's data
		} else {
			// Clean up the element expando
			try {
				delete elem[ expando ];
			} catch(e){
				// IE has trouble directly removing the expando
				// but it's ok with using removeAttribute
				if ( elem.removeAttribute )
					elem.removeAttribute( expando );
			}

			// Completely remove the data cache
			delete jQuery.cache[ id ];
		}
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0, length = object.length;

		if ( args ) {
			if ( length == undefined ) {
				for ( name in object )
					if ( callback.apply( object[ name ], args ) === false )
						break;
			} else
				for ( ; i < length; )
					if ( callback.apply( object[ i++ ], args ) === false )
						break;

		// A special, fast, case for the most common use of each
		} else {
			if ( length == undefined ) {
				for ( name in object )
					if ( callback.call( object[ name ], name, object[ name ] ) === false )
						break;
			} else
				for ( var value = object[0];
					i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
		}

		return object;
	},

	prop: function( elem, value, type, i, name ) {
		// Handle executable functions
		if ( jQuery.isFunction( value ) )
			value = value.call( elem, i );

		// Handle passing in a number to a CSS property
		return value && value.constructor == Number && type == "curCSS" && !exclude.test( name ) ?
			value + "px" :
			value;
	},

	className: {
		// internal only, use addClass("class")
		add: function( elem, classNames ) {
			jQuery.each((classNames || "").split(/\s+/), function(i, className){
				if ( elem.nodeType == 1 && !jQuery.className.has( elem.className, className ) )
					elem.className += (elem.className ? " " : "") + className;
			});
		},

		// internal only, use removeClass("class")
		remove: function( elem, classNames ) {
			if (elem.nodeType == 1)
				elem.className = classNames != undefined ?
					jQuery.grep(elem.className.split(/\s+/), function(className){
						return !jQuery.className.has( classNames, className );
					}).join(" ") :
					"";
		},

		// internal only, use hasClass("class")
		has: function( elem, className ) {
			return jQuery.inArray( className, (elem.className || elem).toString().split(/\s+/) ) > -1;
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};
		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( var name in options )
			elem.style[ name ] = old[ name ];
	},

	css: function( elem, name, force ) {
		if ( name == "width" || name == "height" ) {
			var val, props = { position: "absolute", visibility: "hidden", display:"block" }, which = name == "width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ];

			function getWH() {
				val = name == "width" ? elem.offsetWidth : elem.offsetHeight;
				var padding = 0, border = 0;
				jQuery.each( which, function() {
					padding += parseFloat(jQuery.curCSS( elem, "padding" + this, true)) || 0;
					border += parseFloat(jQuery.curCSS( elem, "border" + this + "Width", true)) || 0;
				});
				val -= Math.round(padding + border);
			}

			if ( jQuery(elem).is(":visible") )
				getWH();
			else
				jQuery.swap( elem, props, getWH );

			return Math.max(0, val);
		}

		return jQuery.curCSS( elem, name, force );
	},

	curCSS: function( elem, name, force ) {
		var ret, style = elem.style;

		// A helper method for determining if an element's values are broken
		function color( elem ) {
			if ( !jQuery.browser.safari )
				return false;

			// defaultView is cached
			var ret = defaultView.getComputedStyle( elem, null );
			return !ret || ret.getPropertyValue("color") == "";
		}

		// We need to handle opacity special in IE
		if ( name == "opacity" && jQuery.browser.msie ) {
			ret = jQuery.attr( style, "opacity" );

			return ret == "" ?
				"1" :
				ret;
		}
		// Opera sometimes will give the wrong display answer, this fixes it, see #2037
		if ( jQuery.browser.opera && name == "display" ) {
			var save = style.outline;
			style.outline = "0 solid black";
			style.outline = save;
		}

		// Make sure we're using the right name for getting the float value
		if ( name.match( /float/i ) )
			name = styleFloat;

		if ( !force && style && style[ name ] )
			ret = style[ name ];

		else if ( defaultView.getComputedStyle ) {

			// Only "float" is needed here
			if ( name.match( /float/i ) )
				name = "float";

			name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

			var computedStyle = defaultView.getComputedStyle( elem, null );

			if ( computedStyle && !color( elem ) )
				ret = computedStyle.getPropertyValue( name );

			// If the element isn't reporting its values properly in Safari
			// then some display: none elements are involved
			else {
				var swap = [], stack = [], a = elem, i = 0;

				// Locate all of the parent display: none elements
				for ( ; a && color(a); a = a.parentNode )
					stack.unshift(a);

				// Go through and make them visible, but in reverse
				// (It would be better if we knew the exact display type that they had)
				for ( ; i < stack.length; i++ )
					if ( color( stack[ i ] ) ) {
						swap[ i ] = stack[ i ].style.display;
						stack[ i ].style.display = "block";
					}

				// Since we flip the display style, we have to handle that
				// one special, otherwise get the value
				ret = name == "display" && swap[ stack.length - 1 ] != null ?
					"none" :
					( computedStyle && computedStyle.getPropertyValue( name ) ) || "";

				// Finally, revert the display styles back
				for ( i = 0; i < swap.length; i++ )
					if ( swap[ i ] != null )
						stack[ i ].style.display = swap[ i ];
			}

			// We should always get a number back from opacity
			if ( name == "opacity" && ret == "" )
				ret = "1";

		} else if ( elem.currentStyle ) {
			var camelCase = name.replace(/\-(\w)/g, function(all, letter){
				return letter.toUpperCase();
			});

			ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if ( !/^\d+(px)?$/i.test( ret ) && /^\d/.test( ret ) ) {
				// Remember the original values
				var left = style.left, rsLeft = elem.runtimeStyle.left;

				// Put in the new values to get a computed value out
				elem.runtimeStyle.left = elem.currentStyle.left;
				style.left = ret || 0;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret;
	},

	clean: function( elems, context ) {
		var ret = [];
		context = context || document;
		// !context.createElement fails in IE with an error but returns typeof 'object'
		if (typeof context.createElement == 'undefined')
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;

		jQuery.each(elems, function(i, elem){
			if ( !elem )
				return;

			if ( elem.constructor == Number )
				elem += '';

			// Convert html string into DOM nodes
			if ( typeof elem == "string" ) {
				// Fix "XHTML"-style tags in all browsers
				elem = elem.replace(/(<(\w+)[^>]*?)\/>/g, function(all, front, tag){
					return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
						all :
						front + "></" + tag + ">";
				});

				// Trim whitespace, otherwise indexOf won't work as expected
				var tags = jQuery.trim( elem ).toLowerCase(), div = context.createElement("div");

				var wrap =
					// option or optgroup
					!tags.indexOf("<opt") &&
					[ 1, "<select multiple='multiple'>", "</select>" ] ||

					!tags.indexOf("<leg") &&
					[ 1, "<fieldset>", "</fieldset>" ] ||

					tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
					[ 1, "<table>", "</table>" ] ||

					!tags.indexOf("<tr") &&
					[ 2, "<table><tbody>", "</tbody></table>" ] ||

				 	// <thead> matched above
					(!tags.indexOf("<td") || !tags.indexOf("<th")) &&
					[ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||

					!tags.indexOf("<col") &&
					[ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

					// IE can't serialize <link> and <script> tags normally
					jQuery.browser.msie &&
					[ 1, "div<div>", "</div>" ] ||

					[ 0, "", "" ];

				// Go to html and back, then peel off extra wrappers
				div.innerHTML = wrap[1] + elem + wrap[2];

				// Move to the right depth
				while ( wrap[0]-- )
					div = div.lastChild;

				// Remove IE's autoinserted <tbody> from table fragments
				if ( jQuery.browser.msie ) {

					// String was a <table>, *may* have spurious <tbody>
					var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ?
						div.firstChild && div.firstChild.childNodes :

						// String was a bare <thead> or <tfoot>
						wrap[1] == "<table>" && tags.indexOf("<tbody") < 0 ?
							div.childNodes :
							[];

					for ( var j = tbody.length - 1; j >= 0 ; --j )
						if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length )
							tbody[ j ].parentNode.removeChild( tbody[ j ] );

					// IE completely kills leading whitespace when innerHTML is used
					if ( /^\s/.test( elem ) )
						div.insertBefore( context.createTextNode( elem.match(/^\s*/)[0] ), div.firstChild );

				}

				elem = jQuery.makeArray( div.childNodes );
			}

			if ( elem.length === 0 && (!jQuery.nodeName( elem, "form" ) && !jQuery.nodeName( elem, "select" )) )
				return;

			if ( elem[0] == undefined || jQuery.nodeName( elem, "form" ) || elem.options )
				ret.push( elem );

			else
				ret = jQuery.merge( ret, elem );

		});

		return ret;
	},

	attr: function( elem, name, value ) {
		// don't set attributes on text and comment nodes
		if (!elem || elem.nodeType == 3 || elem.nodeType == 8)
			return undefined;

		var notxml = !jQuery.isXMLDoc( elem ),
			// Whether we are setting (or getting)
			set = value !== undefined,
			msie = jQuery.browser.msie;

		// Try to normalize/fix the name
		name = notxml && jQuery.props[ name ] || name;

		// Only do all the following if this is a node (faster for style)
		// IE elem.getAttribute passes even for style
		if ( elem.tagName ) {

			// These attributes require special treatment
			var special = /href|src|style/.test( name );

			// Safari mis-reports the default selected property of a hidden option
			// Accessing the parent's selectedIndex property fixes it
			if ( name == "selected" && jQuery.browser.safari )
				elem.parentNode.selectedIndex;

			// If applicable, access the attribute via the DOM 0 way
			if ( name in elem && notxml && !special ) {
				if ( set ){
					// We can't allow the type property to be changed (since it causes problems in IE)
					if ( name == "type" && jQuery.nodeName( elem, "input" ) && elem.parentNode )
						throw "type property can't be changed";

					elem[ name ] = value;
				}

				// browsers index elements by id/name on forms, give priority to attributes.
				if( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) )
					return elem.getAttributeNode( name ).nodeValue;

				return elem[ name ];
			}

			if ( msie && notxml &&  name == "style" )
				return jQuery.attr( elem.style, "cssText", value );

			if ( set )
				// convert the value to a string (all browsers do this but IE) see #1070
				elem.setAttribute( name, "" + value );

			var attr = msie && notxml && special
					// Some attributes require a special call on IE
					? elem.getAttribute( name, 2 )
					: elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}

		// elem is actually elem.style ... set the style

		// IE uses filters for opacity
		if ( msie && name == "opacity" ) {
			if ( set ) {
				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				elem.zoom = 1;

				// Set the alpha filter to set the opacity
				elem.filter = (elem.filter || "").replace( /alpha\([^)]*\)/, "" ) +
					(parseInt( value ) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
			}

			return elem.filter && elem.filter.indexOf("opacity=") >= 0 ?
				(parseFloat( elem.filter.match(/opacity=([^)]*)/)[1] ) / 100) + '':
				"";
		}

		name = name.replace(/-([a-z])/ig, function(all, letter){
			return letter.toUpperCase();
		});

		if ( set )
			elem[ name ] = value;

		return elem[ name ];
	},

	trim: function( text ) {
		return (text || "").replace( /^\s+|\s+$/g, "" );
	},

	makeArray: function( array ) {
		var ret = [];

		if( array != null ){
			var i = array.length;
			//the window, strings and functions also have 'length'
			if( i == null || array.split || array.setInterval || array.call )
				ret[0] = array;
			else
				while( i )
					ret[--i] = array[i];
		}

		return ret;
	},

	inArray: function( elem, array ) {
		for ( var i = 0, length = array.length; i < length; i++ )
		// Use === because on IE, window == document
			if ( array[ i ] === elem )
				return i;

		return -1;
	},

	merge: function( first, second ) {
		// We have to loop this way because IE & Opera overwrite the length
		// expando of getElementsByTagName
		var i = 0, elem, pos = first.length;
		// Also, we need to make sure that the correct elements are being returned
		// (IE returns comment nodes in a '*' query)
		if ( jQuery.browser.msie ) {
			while ( elem = second[ i++ ] )
				if ( elem.nodeType != 8 )
					first[ pos++ ] = elem;

		} else
			while ( elem = second[ i++ ] )
				first[ pos++ ] = elem;

		return first;
	},

	unique: function( array ) {
		var ret = [], done = {};

		try {

			for ( var i = 0, length = array.length; i < length; i++ ) {
				var id = jQuery.data( array[ i ] );

				if ( !done[ id ] ) {
					done[ id ] = true;
					ret.push( array[ i ] );
				}
			}

		} catch( e ) {
			ret = array;
		}

		return ret;
	},

	grep: function( elems, callback, inv ) {
		var ret = [];

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ )
			if ( !inv != !callback( elems[ i ], i ) )
				ret.push( elems[ i ] );

		return ret;
	},

	map: function( elems, callback ) {
		var ret = [];

		// Go through the array, translating each of the items to their
		// new value (or values).
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			var value = callback( elems[ i ], i );

			if ( value != null )
				ret[ ret.length ] = value;
		}

		return ret.concat.apply( [], ret );
	}
});

var userAgent = navigator.userAgent.toLowerCase();

// Figure out what browser is being used
jQuery.browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
	safari: /webkit/.test( userAgent ),
	opera: /opera/.test( userAgent ),
	msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
	mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
};

var styleFloat = jQuery.browser.msie ?
	"styleFloat" :
	"cssFloat";

jQuery.extend({
	// Check to see if the W3C box model is being used
	boxModel: !jQuery.browser.msie || document.compatMode == "CSS1Compat",

	props: {
		"for": "htmlFor",
		"class": "className",
		"float": styleFloat,
		cssFloat: styleFloat,
		styleFloat: styleFloat,
		readonly: "readOnly",
		maxlength: "maxLength",
		cellspacing: "cellSpacing"
	}
});

jQuery.each({
	parent: function(elem){return elem.parentNode;},
	parents: function(elem){return jQuery.dir(elem,"parentNode");},
	next: function(elem){return jQuery.nth(elem,2,"nextSibling");},
	prev: function(elem){return jQuery.nth(elem,2,"previousSibling");},
	nextAll: function(elem){return jQuery.dir(elem,"nextSibling");},
	prevAll: function(elem){return jQuery.dir(elem,"previousSibling");},
	siblings: function(elem){return jQuery.sibling(elem.parentNode.firstChild,elem);},
	children: function(elem){return jQuery.sibling(elem.firstChild);},
	contents: function(elem){return jQuery.nodeName(elem,"iframe")?elem.contentDocument||elem.contentWindow.document:jQuery.makeArray(elem.childNodes);}
}, function(name, fn){
	jQuery.fn[ name ] = function( selector ) {
		var ret = jQuery.map( this, fn );

		if ( selector && typeof selector == "string" )
			ret = jQuery.multiFilter( selector, ret );

		return this.pushStack( jQuery.unique( ret ) );
	};
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function(name, original){
	jQuery.fn[ name ] = function() {
		var args = arguments;

		return this.each(function(){
			for ( var i = 0, length = args.length; i < length; i++ )
				jQuery( args[ i ] )[ original ]( this );
		});
	};
});

jQuery.each({
	removeAttr: function( name ) {
		jQuery.attr( this, name, "" );
		if (this.nodeType == 1)
			this.removeAttribute( name );
	},

	addClass: function( classNames ) {
		jQuery.className.add( this, classNames );
	},

	removeClass: function( classNames ) {
		jQuery.className.remove( this, classNames );
	},

	toggleClass: function( classNames ) {
		jQuery.className[ jQuery.className.has( this, classNames ) ? "remove" : "add" ]( this, classNames );
	},

	remove: function( selector ) {
		if ( !selector || jQuery.filter( selector, [ this ] ).r.length ) {
			// Prevent memory leaks
			jQuery( "*", this ).add(this).each(function(){
				jQuery.event.remove(this);
				jQuery.removeData(this);
			});
			if (this.parentNode)
				this.parentNode.removeChild( this );
		}
	},

	empty: function() {
		// Remove element nodes and prevent memory leaks
		jQuery( ">*", this ).remove();

		// Remove any remaining nodes
		while ( this.firstChild )
			this.removeChild( this.firstChild );
	}
}, function(name, fn){
	jQuery.fn[ name ] = function(){
		return this.each( fn, arguments );
	};
});

jQuery.each([ "Height", "Width" ], function(i, name){
	var type = name.toLowerCase();

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		return this[0] == window ?
			// Opera reports document.body.client[Width/Height] properly in both quirks and standards
			jQuery.browser.opera && document.body[ "client" + name ] ||

			// Safari reports inner[Width/Height] just fine (Mozilla and Opera include scroll bar widths)
			jQuery.browser.safari && window[ "inner" + name ] ||

			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			document.compatMode == "CSS1Compat" && document.documentElement[ "client" + name ] || document.body[ "client" + name ] :

			// Get document width or height
			this[0] == document ?
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					Math.max(document.body["scroll" + name], document.documentElement["scroll" + name]),
					Math.max(document.body["offset" + name], document.documentElement["offset" + name])
				) :

				// Get or set width or height on the element
				size == undefined ?
					// Get width or height on the element
					(this.length ? jQuery.css( this[0], type ) : null) :

					// Set the width or height on the element (default to pixels if value is unitless)
					this.css( type, size.constructor == String ? size : size + "px" );
	};
});

// Helper function used by the dimensions and offset modules
function num(elem, prop) {
	return elem[0] && parseInt( jQuery.curCSS(elem[0], prop, true), 10 ) || 0;
}var chars = jQuery.browser.safari && parseInt(jQuery.browser.version) < 417 ?
		"(?:[\\w*_-]|\\\\.)" :
		"(?:[\\w\u0128-\uFFFF*_-]|\\\\.)",
	quickChild = new RegExp("^>\\s*(" + chars + "+)"),
	quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)"),
	quickClass = new RegExp("^([#.]?)(" + chars + "*)");

jQuery.extend({
	expr: {
		"": function(a,i,m){return m[2]=="*"||jQuery.nodeName(a,m[2]);},
		"#": function(a,i,m){return a.getAttribute("id")==m[2];},
		":": {
			// Position Checks
			lt: function(a,i,m){return i<m[3]-0;},
			gt: function(a,i,m){return i>m[3]-0;},
			nth: function(a,i,m){return m[3]-0==i;},
			eq: function(a,i,m){return m[3]-0==i;},
			first: function(a,i){return i==0;},
			last: function(a,i,m,r){return i==r.length-1;},
			even: function(a,i){return i%2==0;},
			odd: function(a,i){return i%2;},

			// Child Checks
			"first-child": function(a){return a.parentNode.getElementsByTagName("*")[0]==a;},
			"last-child": function(a){return jQuery.nth(a.parentNode.lastChild,1,"previousSibling")==a;},
			"only-child": function(a){return !jQuery.nth(a.parentNode.lastChild,2,"previousSibling");},

			// Parent Checks
			parent: function(a){return a.firstChild;},
			empty: function(a){return !a.firstChild;},

			// Text Check
			contains: function(a,i,m){return (a.textContent||a.innerText||jQuery(a).text()||"").indexOf(m[3])>=0;},

			// Visibility
			visible: function(a){return "hidden"!=a.type&&jQuery.css(a,"display")!="none"&&jQuery.css(a,"visibility")!="hidden";},
			hidden: function(a){return "hidden"==a.type||jQuery.css(a,"display")=="none"||jQuery.css(a,"visibility")=="hidden";},

			// Form attributes
			enabled: function(a){return !a.disabled;},
			disabled: function(a){return a.disabled;},
			checked: function(a){return a.checked;},
			selected: function(a){return a.selected||jQuery.attr(a,"selected");},

			// Form elements
			text: function(a){return "text"==a.type;},
			radio: function(a){return "radio"==a.type;},
			checkbox: function(a){return "checkbox"==a.type;},
			file: function(a){return "file"==a.type;},
			password: function(a){return "password"==a.type;},
			submit: function(a){return "submit"==a.type;},
			image: function(a){return "image"==a.type;},
			reset: function(a){return "reset"==a.type;},
			button: function(a){return "button"==a.type||jQuery.nodeName(a,"button");},
			input: function(a){return /input|select|textarea|button/i.test(a.nodeName);},

			// :has()
			has: function(a,i,m){return jQuery.find(m[3],a).length;},

			// :header
			header: function(a){return /h\d/i.test(a.nodeName);},

			// :animated
			animated: function(a){return jQuery.grep(jQuery.timers,function(fn){return a==fn.elem;}).length;}
		}
	},

	// The regular expressions that power the parsing engine
	parse: [
		// Match: [@value='test'], [@foo]
		/^(\[) *@?([\w-]+) *([!*$^~=]*) *('?"?)(.*?)\4 *\]/,

		// Match: :contains('foo')
		/^(:)([\w-]+)\("?'?(.*?(\(.*?\))?[^(]*?)"?'?\)/,

		// Match: :even, :last-child, #id, .class
		new RegExp("^([:.#]*)(" + chars + "+)")
	],

	multiFilter: function( expr, elems, not ) {
		var old, cur = [];

		while ( expr && expr != old ) {
			old = expr;
			var f = jQuery.filter( expr, elems, not );
			expr = f.t.replace(/^\s*,\s*/, "" );
			cur = not ? elems = f.r : jQuery.merge( cur, f.r );
		}

		return cur;
	},

	find: function( t, context ) {
		// Quickly handle non-string expressions
		if ( typeof t != "string" )
			return [ t ];

		// check to make sure context is a DOM element or a document
		if ( context && context.nodeType != 1 && context.nodeType != 9)
			return [ ];

		// Set the correct context (if none is provided)
		context = context || document;

		// Initialize the search
		var ret = [context], done = [], last, nodeName;

		// Continue while a selector expression exists, and while
		// we're no longer looping upon ourselves
		while ( t && last != t ) {
			var r = [];
			last = t;

			t = jQuery.trim(t);

			var foundToken = false,

			// An attempt at speeding up child selectors that
			// point to a specific element tag
				re = quickChild,

				m = re.exec(t);

			if ( m ) {
				nodeName = m[1].toUpperCase();

				// Perform our own iteration and filter
				for ( var i = 0; ret[i]; i++ )
					for ( var c = ret[i].firstChild; c; c = c.nextSibling )
						if ( c.nodeType == 1 && (nodeName == "*" || c.nodeName.toUpperCase() == nodeName) )
							r.push( c );

				ret = r;
				t = t.replace( re, "" );
				if ( t.indexOf(" ") == 0 ) continue;
				foundToken = true;
			} else {
				re = /^([>+~])\s*(\w*)/i;

				if ( (m = re.exec(t)) != null ) {
					r = [];

					var merge = {};
					nodeName = m[2].toUpperCase();
					m = m[1];

					for ( var j = 0, rl = ret.length; j < rl; j++ ) {
						var n = m == "~" || m == "+" ? ret[j].nextSibling : ret[j].firstChild;
						for ( ; n; n = n.nextSibling )
							if ( n.nodeType == 1 ) {
								var id = jQuery.data(n);

								if ( m == "~" && merge[id] ) break;

								if (!nodeName || n.nodeName.toUpperCase() == nodeName ) {
									if ( m == "~" ) merge[id] = true;
									r.push( n );
								}

								if ( m == "+" ) break;
							}
					}

					ret = r;

					// And remove the token
					t = jQuery.trim( t.replace( re, "" ) );
					foundToken = true;
				}
			}

			// See if there's still an expression, and that we haven't already
			// matched a token
			if ( t && !foundToken ) {
				// Handle multiple expressions
				if ( !t.indexOf(",") ) {
					// Clean the result set
					if ( context == ret[0] ) ret.shift();

					// Merge the result sets
					done = jQuery.merge( done, ret );

					// Reset the context
					r = ret = [context];

					// Touch up the selector string
					t = " " + t.substr(1,t.length);

				} else {
					// Optimize for the case nodeName#idName
					var re2 = quickID;
					var m = re2.exec(t);

					// Re-organize the results, so that they're consistent
					if ( m ) {
						m = [ 0, m[2], m[3], m[1] ];

					} else {
						// Otherwise, do a traditional filter check for
						// ID, class, and element selectors
						re2 = quickClass;
						m = re2.exec(t);
					}

					m[2] = m[2].replace(/\\/g, "");

					var elem = ret[ret.length-1];

					// Try to do a global search by ID, where we can
					if ( m[1] == "#" && elem && elem.getElementById && !jQuery.isXMLDoc(elem) ) {
						// Optimization for HTML document case
						var oid = elem.getElementById(m[2]);

						// Do a quick check for the existence of the actual ID attribute
						// to avoid selecting by the name attribute in IE
						// also check to insure id is a string to avoid selecting an element with the name of 'id' inside a form
						if ( (jQuery.browser.msie||jQuery.browser.opera) && oid && typeof oid.id == "string" && oid.id != m[2] )
							oid = jQuery('[@id="'+m[2]+'"]', elem)[0];

						// Do a quick check for node name (where applicable) so
						// that div#foo searches will be really fast
						ret = r = oid && (!m[3] || jQuery.nodeName(oid, m[3])) ? [oid] : [];
					} else {
						// We need to find all descendant elements
						for ( var i = 0; ret[i]; i++ ) {
							// Grab the tag name being searched for
							var tag = m[1] == "#" && m[3] ? m[3] : m[1] != "" || m[0] == "" ? "*" : m[2];

							// Handle IE7 being really dumb about <object>s
							if ( tag == "*" && ret[i].nodeName.toLowerCase() == "object" )
								tag = "param";

							r = jQuery.merge( r, ret[i].getElementsByTagName( tag ));
						}

						// It's faster to filter by class and be done with it
						if ( m[1] == "." )
							r = jQuery.classFilter( r, m[2] );

						// Same with ID filtering
						if ( m[1] == "#" ) {
							var tmp = [];

							// Try to find the element with the ID
							for ( var i = 0; r[i]; i++ )
								if ( r[i].getAttribute("id") == m[2] ) {
									tmp = [ r[i] ];
									break;
								}

							r = tmp;
						}

						ret = r;
					}

					t = t.replace( re2, "" );
				}

			}

			// If a selector string still exists
			if ( t ) {
				// Attempt to filter it
				var val = jQuery.filter(t,r);
				ret = r = val.r;
				t = jQuery.trim(val.t);
			}
		}

		// An error occurred with the selector;
		// just return an empty set instead
		if ( t )
			ret = [];

		// Remove the root context
		if ( ret && context == ret[0] )
			ret.shift();

		// And combine the results
		done = jQuery.merge( done, ret );

		return done;
	},

	classFilter: function(r,m,not){
		m = " " + m + " ";
		var tmp = [];
		for ( var i = 0; r[i]; i++ ) {
			var pass = (" " + r[i].className + " ").indexOf( m ) >= 0;
			if ( !not && pass || not && !pass )
				tmp.push( r[i] );
		}
		return tmp;
	},

	filter: function(t,r,not) {
		var last;

		// Look for common filter expressions
		while ( t && t != last ) {
			last = t;

			var p = jQuery.parse, m;

			for ( var i = 0; p[i]; i++ ) {
				m = p[i].exec( t );

				if ( m ) {
					// Remove what we just matched
					t = t.substring( m[0].length );

					m[2] = m[2].replace(/\\/g, "");
					break;
				}
			}

			if ( !m )
				break;

			// :not() is a special case that can be optimized by
			// keeping it out of the expression list
			if ( m[1] == ":" && m[2] == "not" )
				// optimize if only one selector found (most common case)
				r = isSimple.test( m[3] ) ?
					jQuery.filter(m[3], r, true).r :
					jQuery( r ).not( m[3] );

			// We can get a big speed boost by filtering by class here
			else if ( m[1] == "." )
				r = jQuery.classFilter(r, m[2], not);

			else if ( m[1] == "[" ) {
				var tmp = [], type = m[3];

				for ( var i = 0, rl = r.length; i < rl; i++ ) {
					var a = r[i], z = a[ jQuery.props[m[2]] || m[2] ];

					if ( z == null || /href|src|selected/.test(m[2]) )
						z = jQuery.attr(a,m[2]) || '';

					if ( (type == "" && !!z ||
						 type == "=" && z == m[5] ||
						 type == "!=" && z != m[5] ||
						 type == "^=" && z && !z.indexOf(m[5]) ||
						 type == "$=" && z.substr(z.length - m[5].length) == m[5] ||
						 (type == "*=" || type == "~=") && z.indexOf(m[5]) >= 0) ^ not )
							tmp.push( a );
				}

				r = tmp;

			// We can get a speed boost by handling nth-child here
			} else if ( m[1] == ":" && m[2] == "nth-child" ) {
				var merge = {}, tmp = [],
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
						m[3] == "even" && "2n" || m[3] == "odd" && "2n+1" ||
						!/\D/.test(m[3]) && "0n+" + m[3] || m[3]),
					// calculate the numbers (first)n+(last) including if they are negative
					first = (test[1] + (test[2] || 1)) - 0, last = test[3] - 0;

				// loop through all the elements left in the jQuery object
				for ( var i = 0, rl = r.length; i < rl; i++ ) {
					var node = r[i], parentNode = node.parentNode, id = jQuery.data(parentNode);

					if ( !merge[id] ) {
						var c = 1;

						for ( var n = parentNode.firstChild; n; n = n.nextSibling )
							if ( n.nodeType == 1 )
								n.nodeIndex = c++;

						merge[id] = true;
					}

					var add = false;

					if ( first == 0 ) {
						if ( node.nodeIndex == last )
							add = true;
					} else if ( (node.nodeIndex - last) % first == 0 && (node.nodeIndex - last) / first >= 0 )
						add = true;

					if ( add ^ not )
						tmp.push( node );
				}

				r = tmp;

			// Otherwise, find the expression to execute
			} else {
				var fn = jQuery.expr[ m[1] ];
				if ( typeof fn == "object" )
					fn = fn[ m[2] ];

				if ( typeof fn == "string" )
					fn = eval("false||function(a,i){return " + fn + ";}");

				// Execute it against the current filter
				r = jQuery.grep( r, function(elem, i){
					return fn(elem, i, m, r);
				}, not );
			}
		}

		// Return an array of filtered elements (r)
		// and the modified expression string (t)
		return { r: r, t: t };
	},

	dir: function( elem, dir ){
		var matched = [],
			cur = elem[dir];
		while ( cur && cur != document ) {
			if ( cur.nodeType == 1 )
				matched.push( cur );
			cur = cur[dir];
		}
		return matched;
	},

	nth: function(cur,result,dir,elem){
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] )
			if ( cur.nodeType == 1 && ++num == result )
				break;

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType == 1 && n != elem )
				r.push( n );
		}

		return r;
	}
});
/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code orignated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

	// Bind an event to an element
	// Original by Dean Edwards
	add: function(elem, types, handler, data) {
		if ( elem.nodeType == 3 || elem.nodeType == 8 )
			return;

		// For whatever reason, IE has trouble passing the window object
		// around, causing it to be cloned in the process
		if ( jQuery.browser.msie && elem.setInterval )
			elem = window;

		// Make sure that the function being executed has a unique ID
		if ( !handler.guid )
			handler.guid = this.guid++;

		// if data is passed, bind to handler
		if( data != undefined ) {
			// Create temporary function pointer to original handler
			var fn = handler;

			// Create unique handler function, wrapped around original handler
			handler = this.proxy( fn, function() {
				// Pass arguments and context to original handler
				return fn.apply(this, arguments);
			});

			// Store data in unique handler
			handler.data = data;
		}

		// Init the element's event structure
		var events = jQuery.data(elem, "events") || jQuery.data(elem, "events", {}),
			handle = jQuery.data(elem, "handle") || jQuery.data(elem, "handle", function(){
				// Handle the second event of a trigger and when
				// an event is called after a page has unloaded
				if ( typeof jQuery != "undefined" && !jQuery.event.triggered )
					return jQuery.event.handle.apply(arguments.callee.elem, arguments);
			});
		// Add elem as a property of the handle function
		// This is to prevent a memory leak with non-native
		// event in IE.
		handle.elem = elem;

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		jQuery.each(types.split(/\s+/), function(index, type) {
			// Namespaced event handlers
			var parts = type.split(".");
			type = parts[0];
			handler.type = parts[1];

			// Get the current list of functions bound to this event
			var handlers = events[type];

			// Init the event handler queue
			if (!handlers) {
				handlers = events[type] = {};

				// Check for a special event handler
				// Only use addEventListener/attachEvent if the special
				// events handler returns false
				if ( !jQuery.event.special[type] || jQuery.event.special[type].setup.call(elem) === false ) {
					// Bind the global event handler to the element
					if (elem.addEventListener)
						elem.addEventListener(type, handle, false);
					else if (elem.attachEvent)
						elem.attachEvent("on" + type, handle);
				}
			}

			// Add the function to the element's handler list
			handlers[handler.guid] = handler;

			// Keep track of which events have been used, for global triggering
			jQuery.event.global[type] = true;
		});

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	guid: 1,
	global: {},

	// Detach an event or set of events from an element
	remove: function(elem, types, handler) {
		// don't do events on text and comment nodes
		if ( elem.nodeType == 3 || elem.nodeType == 8 )
			return;

		var events = jQuery.data(elem, "events"), ret, index;

		if ( events ) {
			// Unbind all events for the element
			if ( types == undefined || (typeof types == "string" && types.charAt(0) == ".") )
				for ( var type in events )
					this.remove( elem, type + (types || "") );
			else {
				// types is actually an event object here
				if ( types.type ) {
					handler = types.handler;
					types = types.type;
				}

				// Handle multiple events seperated by a space
				// jQuery(...).unbind("mouseover mouseout", fn);
				jQuery.each(types.split(/\s+/), function(index, type){
					// Namespaced event handlers
					var parts = type.split(".");
					type = parts[0];

					if ( events[type] ) {
						// remove the given handler for the given type
						if ( handler )
							delete events[type][handler.guid];

						// remove all handlers for the given type
						else
							for ( handler in events[type] )
								// Handle the removal of namespaced events
								if ( !parts[1] || events[type][handler].type == parts[1] )
									delete events[type][handler];

						// remove generic event handler if no more handlers exist
						for ( ret in events[type] ) break;
						if ( !ret ) {
							if ( !jQuery.event.special[type] || jQuery.event.special[type].teardown.call(elem) === false ) {
								if (elem.removeEventListener)
									elem.removeEventListener(type, jQuery.data(elem, "handle"), false);
								else if (elem.detachEvent)
									elem.detachEvent("on" + type, jQuery.data(elem, "handle"));
							}
							ret = null;
							delete events[type];
						}
					}
				});
			}

			// Remove the expando if it's no longer used
			for ( ret in events ) break;
			if ( !ret ) {
				var handle = jQuery.data( elem, "handle" );
				if ( handle ) handle.elem = null;
				jQuery.removeData( elem, "events" );
				jQuery.removeData( elem, "handle" );
			}
		}
	},

	trigger: function(type, data, elem, donative, extra) {
		// Clone the incoming data, if any
		data = jQuery.makeArray(data);

		if ( type.indexOf("!") >= 0 ) {
			type = type.slice(0, -1);
			var exclusive = true;
		}

		// Handle a global trigger
		if ( !elem ) {
			// Only trigger if we've ever bound an event for it
			if ( this.global[type] )
				jQuery("*").add([window, document]).trigger(type, data);

		// Handle triggering a single element
		} else {
			// don't do events on text and comment nodes
			if ( elem.nodeType == 3 || elem.nodeType == 8 )
				return undefined;

			var val, ret, fn = jQuery.isFunction( elem[ type ] || null ),
				// Check to see if we need to provide a fake event, or not
				event = !data[0] || !data[0].preventDefault;

			// Pass along a fake event
			if ( event ) {
				data.unshift({
					type: type,
					target: elem,
					preventDefault: function(){},
					stopPropagation: function(){},
					timeStamp: now()
				});
				data[0][expando] = true; // no need to fix fake event
			}

			// Enforce the right trigger type
			data[0].type = type;
			if ( exclusive )
				data[0].exclusive = true;

			// Trigger the event, it is assumed that "handle" is a function
			var handle = jQuery.data(elem, "handle");
			if ( handle )
				val = handle.apply( elem, data );

			// Handle triggering native .onfoo handlers (and on links since we don't call .click() for links)
			if ( (!fn || (jQuery.nodeName(elem, 'a') && type == "click")) && elem["on"+type] && elem["on"+type].apply( elem, data ) === false )
				val = false;

			// Extra functions don't get the custom event object
			if ( event )
				data.shift();

			// Handle triggering of extra function
			if ( extra && jQuery.isFunction( extra ) ) {
				// call the extra function and tack the current return value on the end for possible inspection
				ret = extra.apply( elem, val == null ? data : data.concat( val ) );
				// if anything is returned, give it precedence and have it overwrite the previous value
				if (ret !== undefined)
					val = ret;
			}

			// Trigger the native events (except for clicks on links)
			if ( fn && donative !== false && val !== false && !(jQuery.nodeName(elem, 'a') && type == "click") ) {
				this.triggered = true;
				try {
					elem[ type ]();
				// prevent IE from throwing an error for some hidden elements
				} catch (e) {}
			}

			this.triggered = false;
		}

		return val;
	},

	handle: function(event) {
		// returned undefined or false
		var val, ret, namespace, all, handlers;

		event = arguments[0] = jQuery.event.fix( event || window.event );

		// Namespaced event handlers
		namespace = event.type.split(".");
		event.type = namespace[0];
		namespace = namespace[1];
		// Cache this now, all = true means, any handler
		all = !namespace && !event.exclusive;

		handlers = ( jQuery.data(this, "events") || {} )[event.type];

		for ( var j in handlers ) {
			var handler = handlers[j];

			// Filter the functions by class
			if ( all || handler.type == namespace ) {
				// Pass in a reference to the handler function itself
				// So that we can later remove it
				event.handler = handler;
				event.data = handler.data;

				ret = handler.apply( this, arguments );

				if ( val !== false )
					val = ret;

				if ( ret === false ) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}

		return val;
	},

	fix: function(event) {
		if ( event[expando] == true )
			return event;

		// store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = { originalEvent: originalEvent };
		var props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view wheelDelta which".split(" ");
		for ( var i=props.length; i; i-- )
			event[ props[i] ] = originalEvent[ props[i] ];

		// Mark it as fixed
		event[expando] = true;

		// add preventDefault and stopPropagation since
		// they will not work on the clone
		event.preventDefault = function() {
			// if preventDefault exists run it on the original event
			if (originalEvent.preventDefault)
				originalEvent.preventDefault();
			// otherwise set the returnValue property of the original event to false (IE)
			originalEvent.returnValue = false;
		};
		event.stopPropagation = function() {
			// if stopPropagation exists run it on the original event
			if (originalEvent.stopPropagation)
				originalEvent.stopPropagation();
			// otherwise set the cancelBubble property of the original event to true (IE)
			originalEvent.cancelBubble = true;
		};

		// Fix timeStamp
		event.timeStamp = event.timeStamp || now();

		// Fix target property, if necessary
		if ( !event.target )
			event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either

		// check if target is a textnode (safari)
		if ( event.target.nodeType == 3 )
			event.target = event.target.parentNode;

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement )
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
		}

		// Add which for key events
		if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) )
			event.which = event.charCode || event.keyCode;

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey )
			event.metaKey = event.ctrlKey;

		// Add which for click: 1 == left; 2 == middle; 3 == right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button )
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));

		return event;
	},

	proxy: function( fn, proxy ){
		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || this.guid++;
		// So proxy can be declared as an argument
		return proxy;
	},

	special: {
		ready: {
			setup: function() {
				// Make sure the ready event is setup
				bindReady();
				return;
			},

			teardown: function() { return; }
		},

		mouseenter: {
			setup: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).bind("mouseover", jQuery.event.special.mouseenter.handler);
				return true;
			},

			teardown: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).unbind("mouseover", jQuery.event.special.mouseenter.handler);
				return true;
			},

			handler: function(event) {
				// If we actually just moused on to a sub-element, ignore it
				if ( withinElement(event, this) ) return true;
				// Execute the right handlers by setting the event type to mouseenter
				event.type = "mouseenter";
				return jQuery.event.handle.apply(this, arguments);
			}
		},

		mouseleave: {
			setup: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).bind("mouseout", jQuery.event.special.mouseleave.handler);
				return true;
			},

			teardown: function() {
				if ( jQuery.browser.msie ) return false;
				jQuery(this).unbind("mouseout", jQuery.event.special.mouseleave.handler);
				return true;
			},

			handler: function(event) {
				// If we actually just moused on to a sub-element, ignore it
				if ( withinElement(event, this) ) return true;
				// Execute the right handlers by setting the event type to mouseleave
				event.type = "mouseleave";
				return jQuery.event.handle.apply(this, arguments);
			}
		}
	}
};

jQuery.fn.extend({
	bind: function( type, data, fn ) {
		return type == "unload" ? this.one(type, data, fn) : this.each(function(){
			jQuery.event.add( this, type, fn || data, fn && data );
		});
	},

	one: function( type, data, fn ) {
		var one = jQuery.event.proxy( fn || data, function(event) {
			jQuery(this).unbind(event, one);
			return (fn || data).apply( this, arguments );
		});
		return this.each(function(){
			jQuery.event.add( this, type, one, fn && data);
		});
	},

	unbind: function( type, fn ) {
		return this.each(function(){
			jQuery.event.remove( this, type, fn );
		});
	},

	trigger: function( type, data, fn ) {
		return this.each(function(){
			jQuery.event.trigger( type, data, this, true, fn );
		});
	},

	triggerHandler: function( type, data, fn ) {
		return this[0] && jQuery.event.trigger( type, data, this[0], false, fn );
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments, i = 1;

		// link all the functions, so any of them can unbind this click handler
		while( i < args.length )
			jQuery.event.proxy( fn, args[i++] );

		return this.click( jQuery.event.proxy( fn, function(event) {
			// Figure out which function to execute
			this.lastToggle = ( this.lastToggle || 0 ) % i;

			// Make sure that clicks stop
			event.preventDefault();

			// and execute the function
			return args[ this.lastToggle++ ].apply( this, arguments ) || false;
		}));
	},

	hover: function(fnOver, fnOut) {
		return this.bind('mouseenter', fnOver).bind('mouseleave', fnOut);
	},

	ready: function(fn) {
		// Attach the listeners
		bindReady();

		// If the DOM is already ready
		if ( jQuery.isReady )
			// Execute the function immediately
			fn.call( document, jQuery );

		// Otherwise, remember the function for later
		else
			// Add the function to the wait list
			jQuery.readyList.push( function() { return fn.call(this, jQuery); } );

		return this;
	}
});

jQuery.extend({
	isReady: false,
	readyList: [],
	// Handle when the DOM is ready
	ready: function() {
		// Make sure that the DOM is not already loaded
		if ( !jQuery.isReady ) {
			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If there are functions bound, to execute
			if ( jQuery.readyList ) {
				// Execute all of them
				jQuery.each( jQuery.readyList, function(){
					this.call( document );
				});

				// Reset the list of functions
				jQuery.readyList = null;
			}

			// Trigger any bound ready events
			jQuery(document).triggerHandler("ready");
		}
	}
});

var readyBound = false;

function bindReady(){
	if ( readyBound ) return;
	readyBound = true;

	// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
	if ( document.addEventListener && !jQuery.browser.opera)
		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", jQuery.ready, false );

	// If IE is used and is not in a frame
	// Continually check to see if the document is ready
	if ( jQuery.browser.msie && window == top ) (function(){
		if (jQuery.isReady) return;
		try {
			// If IE is used, use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			document.documentElement.doScroll("left");
		} catch( error ) {
			setTimeout( arguments.callee, 0 );
			return;
		}
		// and execute any waiting functions
		jQuery.ready();
	})();

	if ( jQuery.browser.opera )
		document.addEventListener( "DOMContentLoaded", function () {
			if (jQuery.isReady) return;
			for (var i = 0; i < document.styleSheets.length; i++)
				if (document.styleSheets[i].disabled) {
					setTimeout( arguments.callee, 0 );
					return;
				}
			// and execute any waiting functions
			jQuery.ready();
		}, false);

	if ( jQuery.browser.safari ) {
		var numStyles;
		(function(){
			if (jQuery.isReady) return;
			if ( document.readyState != "loaded" && document.readyState != "complete" ) {
				setTimeout( arguments.callee, 0 );
				return;
			}
			if ( numStyles === undefined )
				numStyles = jQuery("style, link[rel=stylesheet]").length;
			if ( document.styleSheets.length != numStyles ) {
				setTimeout( arguments.callee, 0 );
				return;
			}
			// and execute any waiting functions
			jQuery.ready();
		})();
	}

	// A fallback to window.onload, that will always work
	jQuery.event.add( window, "load", jQuery.ready );
}

jQuery.each( ("blur,focus,load,resize,scroll,unload,click,dblclick," +
	"mousedown,mouseup,mousemove,mouseover,mouseout,change,select," +
	"submit,keydown,keypress,keyup,error").split(","), function(i, name){

	// Handle event binding
	jQuery.fn[name] = function(fn){
		return fn ? this.bind(name, fn) : this.trigger(name);
	};
});

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function(event, elem) {
	// Check if mouse(over|out) are still within the same parent element
	var parent = event.relatedTarget;
	// Traverse up the tree
	while ( parent && parent != elem ) try { parent = parent.parentNode; } catch(error) { parent = elem; }
	// Return true if we actually just moused on to a sub-element
	return parent == elem;
};

// Prevent memory leaks in IE
// And prevent errors on refresh with events like mouseover in other browsers
// Window isn't included so as not to unbind existing unload events
jQuery(window).bind("unload", function() {
	jQuery("*").add(document).unbind();
});
jQuery.fn.extend({
	// Keep a copy of the old load
	_load: jQuery.fn.load,

	load: function( url, params, callback ) {
		if ( typeof url != 'string' )
			return this._load( url );

		var off = url.indexOf(" ");
		if ( off >= 0 ) {
			var selector = url.slice(off, url.length);
			url = url.slice(0, off);
		}

		callback = callback || function(){};

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params )
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = null;

			// Otherwise, build a param string
			} else {
				params = jQuery.param( params );
				type = "POST";
			}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			complete: function(res, status){
				// If successful, inject the HTML into all the matched elements
				if ( status == "success" || status == "notmodified" )
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div/>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(res.responseText.replace(/<script(.|\s)*?\/script>/g, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						res.responseText );

				self.each( callback, [res.responseText, status, res] );
			}
		});
		return this;
	},

	serialize: function() {
		return jQuery.param(this.serializeArray());
	},
	serializeArray: function() {
		return this.map(function(){
			return jQuery.nodeName(this, "form") ?
				jQuery.makeArray(this.elements) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				(this.checked || /select|textarea/i.test(this.nodeName) ||
					/text|hidden|password/i.test(this.type));
		})
		.map(function(i, elem){
			var val = jQuery(this).val();
			return val == null ? null :
				val.constructor == Array ?
					jQuery.map( val, function(val, i){
						return {name: elem.name, value: val};
					}) :
					{name: elem.name, value: val};
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","), function(i,o){
	jQuery.fn[o] = function(f){
		return this.bind(o, f);
	};
});

var jsc = now();

jQuery.extend({
	get: function( url, data, callback, type ) {
		// shift arguments if data argument was ommited
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = null;
		}

		return jQuery.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	getScript: function( url, callback ) {
		return jQuery.get(url, null, callback, "script");
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get(url, data, callback, "json");
	},

	post: function( url, data, callback, type ) {
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = {};
		}

		return jQuery.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	},

	ajaxSetup: function( settings ) {
		jQuery.extend( jQuery.ajaxSettings, settings );
	},

	ajaxSettings: {
		url: location.href,
		global: true,
		type: "GET",
		timeout: 0,
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		data: null,
		username: null,
		password: null,
		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			script: "text/javascript, application/javascript",
			json: "application/json, text/javascript",
			text: "text/plain",
			_default: "*/*"
		}
	},

	// Last-Modified header cache for next request
	lastModified: {},

	ajax: function( s ) {
		// Extend the settings, but re-extend 's' so that it can be
		// checked again later (in the test suite, specifically)
		s = jQuery.extend(true, s, jQuery.extend(true, {}, jQuery.ajaxSettings, s));

		var jsonp, jsre = /=\?(&|$)/g, status, data,
			type = s.type.toUpperCase();

		// convert data if not already a string
		if ( s.data && s.processData && typeof s.data != "string" )
			s.data = jQuery.param(s.data);

		// Handle JSONP Parameter Callbacks
		if ( s.dataType == "jsonp" ) {
			if ( type == "GET" ) {
				if ( !s.url.match(jsre) )
					s.url += (s.url.match(/\?/) ? "&" : "?") + (s.jsonp || "callback") + "=?";
			} else if ( !s.data || !s.data.match(jsre) )
				s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
			s.dataType = "json";
		}

		// Build temporary JSONP function
		if ( s.dataType == "json" && (s.data && s.data.match(jsre) || s.url.match(jsre)) ) {
			jsonp = "jsonp" + jsc++;

			// Replace the =? sequence both in the query string and the data
			if ( s.data )
				s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
			s.url = s.url.replace(jsre, "=" + jsonp + "$1");

			// We need to make sure
			// that a JSONP style response is executed properly
			s.dataType = "script";

			// Handle JSONP-style loading
			window[ jsonp ] = function(tmp){
				data = tmp;
				success();
				complete();
				// Garbage collect
				window[ jsonp ] = undefined;
				try{ delete window[ jsonp ]; } catch(e){}
				if ( head )
					head.removeChild( script );
			};
		}

		if ( s.dataType == "script" && s.cache == null )
			s.cache = false;

		if ( s.cache === false && type == "GET" ) {
			var ts = now();
			// try replacing _= if it is there
			var ret = s.url.replace(/(\?|&)_=.*?(&|$)/, "$1_=" + ts + "$2");
			// if nothing was replaced, add timestamp to the end
			s.url = ret + ((ret == s.url) ? (s.url.match(/\?/) ? "&" : "?") + "_=" + ts : "");
		}

		// If data is available, append data to url for get requests
		if ( s.data && type == "GET" ) {
			s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;

			// IE likes to send both get and post data, prevent this
			s.data = null;
		}

		// Watch for a new set of requests
		if ( s.global && ! jQuery.active++ )
			jQuery.event.trigger( "ajaxStart" );

		// Matches an absolute URL, and saves the domain
		var remote = /^(?:\w+:)?\/\/([^\/?#]+)/;

		// If we're requesting a remote document
		// and trying to load JSON or Script with a GET
		if ( s.dataType == "script" && type == "GET"
				&& remote.test(s.url) && remote.exec(s.url)[1] != location.host ){
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = s.url;
			if (s.scriptCharset)
				script.charset = s.scriptCharset;

			// Handle Script loading
			if ( !jsonp ) {
				var done = false;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function(){
					if ( !done && (!this.readyState ||
							this.readyState == "loaded" || this.readyState == "complete") ) {
						done = true;
						success();
						complete();
						head.removeChild( script );
					}
				};
			}

			head.appendChild(script);

			// We handle everything using the script element injection
			return undefined;
		}

		var requestDone = false;

		// Create the request object; Microsoft failed to properly
		// implement the XMLHttpRequest in IE7, so we use the ActiveXObject when it is available
		var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();

		// Open the socket
		// Passing null username, generates a login popup on Opera (#2865)
		if( s.username )
			xhr.open(type, s.url, s.async, s.username, s.password);
		else
			xhr.open(type, s.url, s.async);

		// Need an extra try/catch for cross domain requests in Firefox 3
		try {
			// Set the correct header, if data is being sent
			if ( s.data )
				xhr.setRequestHeader("Content-Type", s.contentType);

			// Set the If-Modified-Since header, if ifModified mode.
			if ( s.ifModified )
				xhr.setRequestHeader("If-Modified-Since",
					jQuery.lastModified[s.url] || "Thu, 01 Jan 1970 00:00:00 GMT" );

			// Set header so the called script knows that it's an XMLHttpRequest
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

			// Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
				s.accepts[ s.dataType ] + ", */*" :
				s.accepts._default );
		} catch(e){}

		// Allow custom headers/mimetypes
		if ( s.beforeSend && s.beforeSend(xhr, s) === false ) {
			// cleanup active request counter
			s.global && jQuery.active--;
			// close opended socket
			xhr.abort();
			return false;
		}

		if ( s.global )
			jQuery.event.trigger("ajaxSend", [xhr, s]);

		// Wait for a response to come back
		var onreadystatechange = function(isTimeout){
			// The transfer is complete and the data is available, or the request timed out
			if ( !requestDone && xhr && (xhr.readyState == 4 || isTimeout == "timeout") ) {
				requestDone = true;

				// clear poll interval
				if (ival) {
					clearInterval(ival);
					ival = null;
				}

				status = isTimeout == "timeout" && "timeout" ||
					!jQuery.httpSuccess( xhr ) && "error" ||
					s.ifModified && jQuery.httpNotModified( xhr, s.url ) && "notmodified" ||
					"success";

				if ( status == "success" ) {
					// Watch for, and catch, XML document parse errors
					try {
						// process the data (runs the xml through httpData regardless of callback)
						data = jQuery.httpData( xhr, s.dataType, s.dataFilter );
					} catch(e) {
						status = "parsererror";
					}
				}

				// Make sure that the request was successful or notmodified
				if ( status == "success" ) {
					// Cache Last-Modified header, if ifModified mode.
					var modRes;
					try {
						modRes = xhr.getResponseHeader("Last-Modified");
					} catch(e) {} // swallow exception thrown by FF if header is not available

					if ( s.ifModified && modRes )
						jQuery.lastModified[s.url] = modRes;

					// JSONP handles its own success callback
					if ( !jsonp )
						success();
				} else
					jQuery.handleError(s, xhr, status);

				// Fire the complete handlers
				complete();

				// Stop memory leaks
				if ( s.async )
					xhr = null;
			}
		};

		if ( s.async ) {
			// don't attach the handler to the request, just poll it instead
			var ival = setInterval(onreadystatechange, 13);

			// Timeout checker
			if ( s.timeout > 0 )
				setTimeout(function(){
					// Check to see if the request is still happening
					if ( xhr ) {
						// Cancel the request
						xhr.abort();

						if( !requestDone )
							onreadystatechange( "timeout" );
					}
				}, s.timeout);
		}

		// Send the data
		try {
			xhr.send(s.data);
		} catch(e) {
			jQuery.handleError(s, xhr, null, e);
		}

		// firefox 1.5 doesn't fire statechange for sync requests
		if ( !s.async )
			onreadystatechange();

		function success(){
			// If a local callback was specified, fire it and pass it the data
			if ( s.success )
				s.success( data, status );

			// Fire the global callback
			if ( s.global )
				jQuery.event.trigger( "ajaxSuccess", [xhr, s] );
		}

		function complete(){
			// Process result
			if ( s.complete )
				s.complete(xhr, status);

			// The request was completed
			if ( s.global )
				jQuery.event.trigger( "ajaxComplete", [xhr, s] );

			// Handle the global AJAX counter
			if ( s.global && ! --jQuery.active )
				jQuery.event.trigger( "ajaxStop" );
		}

		// return XMLHttpRequest to allow aborting the request etc.
		return xhr;
	},

	handleError: function( s, xhr, status, e ) {
		// If a local callback was specified, fire it
		if ( s.error ) s.error( xhr, status, e );

		// Fire the global callback
		if ( s.global )
			jQuery.event.trigger( "ajaxError", [xhr, s, e] );
	},

	// Counter for holding the number of active queries
	active: 0,

	// Determines if an XMLHttpRequest was successful or not
	httpSuccess: function( xhr ) {
		try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
			return !xhr.status && location.protocol == "file:" ||
				( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223 ||
				jQuery.browser.safari && xhr.status == undefined;
		} catch(e){}
		return false;
	},

	// Determines if an XMLHttpRequest returns NotModified
	httpNotModified: function( xhr, url ) {
		try {
			var xhrRes = xhr.getResponseHeader("Last-Modified");

			// Firefox always returns 200. check Last-Modified date
			return xhr.status == 304 || xhrRes == jQuery.lastModified[url] ||
				jQuery.browser.safari && xhr.status == undefined;
		} catch(e){}
		return false;
	},

	httpData: function( xhr, type, filter ) {
		var ct = xhr.getResponseHeader("content-type"),
			xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.tagName == "parsererror" )
			throw "parsererror";
			
		// Allow a pre-filtering function to sanitize the response
		if( filter )
			data = filter( data, type );

		// If the type is "script", eval it in global context
		if ( type == "script" )
			jQuery.globalEval( data );

		// Get the JavaScript object, if JSON is used.
		if ( type == "json" )
			data = eval("(" + data + ")");

		return data;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a ) {
		var s = [];

		// If an array was passed in, assume that it is an array
		// of form elements
		if ( a.constructor == Array || a.jquery )
			// Serialize the form elements
			jQuery.each( a, function(){
				s.push( encodeURIComponent(this.name) + "=" + encodeURIComponent( this.value ) );
			});

		// Otherwise, assume that it's an object of key/value pairs
		else
			// Serialize the key/values
			for ( var j in a )
				// If the value is an array then the key names need to be repeated
				if ( a[j] && a[j].constructor == Array )
					jQuery.each( a[j], function(){
						s.push( encodeURIComponent(j) + "=" + encodeURIComponent( this ) );
					});
				else
					s.push( encodeURIComponent(j) + "=" + encodeURIComponent( jQuery.isFunction(a[j]) ? a[j]() : a[j] ) );

		// Return the resulting serialization
		return s.join("&").replace(/%20/g, "+");
	}

});
jQuery.fn.extend({
	show: function(speed,callback){
		return speed ?
			this.animate({
				height: "show", width: "show", opacity: "show"
			}, speed, callback) :

			this.filter(":hidden").each(function(){
				this.style.display = this.oldblock || "";
				if ( jQuery.css(this,"display") == "none" ) {
					var elem = jQuery("<" + this.tagName + " />").appendTo("body");
					this.style.display = elem.css("display");
					// handle an edge condition where css is - div { display:none; } or similar
					if (this.style.display == "none")
						this.style.display = "block";
					elem.remove();
				}
			}).end();
	},

	hide: function(speed,callback){
		return speed ?
			this.animate({
				height: "hide", width: "hide", opacity: "hide"
			}, speed, callback) :

			this.filter(":visible").each(function(){
				this.oldblock = this.oldblock || jQuery.css(this,"display");
				this.style.display = "none";
			}).end();
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2 ){
		return jQuery.isFunction(fn) && jQuery.isFunction(fn2) ?
			this._toggle.apply( this, arguments ) :
			fn ?
				this.animate({
					height: "toggle", width: "toggle", opacity: "toggle"
				}, fn, fn2) :
				this.each(function(){
					jQuery(this)[ jQuery(this).is(":hidden") ? "show" : "hide" ]();
				});
	},

	slideDown: function(speed,callback){
		return this.animate({height: "show"}, speed, callback);
	},

	slideUp: function(speed,callback){
		return this.animate({height: "hide"}, speed, callback);
	},

	slideToggle: function(speed, callback){
		return this.animate({height: "toggle"}, speed, callback);
	},

	fadeIn: function(speed, callback){
		return this.animate({opacity: "show"}, speed, callback);
	},

	fadeOut: function(speed, callback){
		return this.animate({opacity: "hide"}, speed, callback);
	},

	fadeTo: function(speed,to,callback){
		return this.animate({opacity: to}, speed, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed(speed, easing, callback);

		return this[ optall.queue === false ? "each" : "queue" ](function(){
			if ( this.nodeType != 1)
				return false;

			var opt = jQuery.extend({}, optall), p,
				hidden = jQuery(this).is(":hidden"), self = this;

			for ( p in prop ) {
				if ( prop[p] == "hide" && hidden || prop[p] == "show" && !hidden )
					return opt.complete.call(this);

				if ( p == "height" || p == "width" ) {
					// Store display property
					opt.display = jQuery.css(this, "display");

					// Make sure that nothing sneaks out
					opt.overflow = this.style.overflow;
				}
			}

			if ( opt.overflow != null )
				this.style.overflow = "hidden";

			opt.curAnim = jQuery.extend({}, prop);

			jQuery.each( prop, function(name, val){
				var e = new jQuery.fx( self, opt, name );

				if ( /toggle|show|hide/.test(val) )
					e[ val == "toggle" ? hidden ? "show" : "hide" : val ]( prop );
				else {
					var parts = val.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
						start = e.cur(true) || 0;

					if ( parts ) {
						var end = parseFloat(parts[2]),
							unit = parts[3] || "px";

						// We need to compute starting value
						if ( unit != "px" ) {
							self.style[ name ] = (end || 1) + unit;
							start = ((end || 1) / e.cur(true)) * start;
							self.style[ name ] = start + unit;
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] )
							end = ((parts[1] == "-=" ? -1 : 1) * end) + start;

						e.custom( start, end, unit );
					} else
						e.custom( start, val, "" );
				}
			});

			// For JS strict compliance
			return true;
		});
	},

	queue: function(type, fn){
		if ( jQuery.isFunction(type) || ( type && type.constructor == Array )) {
			fn = type;
			type = "fx";
		}

		if ( !type || (typeof type == "string" && !fn) )
			return queue( this[0], type );

		return this.each(function(){
			if ( fn.constructor == Array )
				queue(this, type, fn);
			else {
				queue(this, type).push( fn );

				if ( queue(this, type).length == 1 )
					fn.call(this);
			}
		});
	},

	stop: function(clearQueue, gotoEnd){
		var timers = jQuery.timers;

		if (clearQueue)
			this.queue([]);

		this.each(function(){
			// go in reverse order so anything added to the queue during the loop is ignored
			for ( var i = timers.length - 1; i >= 0; i-- )
				if ( timers[i].elem == this ) {
					if (gotoEnd)
						// force the next step to be the last
						timers[i](true);
					timers.splice(i, 1);
				}
		});

		// start the next in the queue if the last step wasn't forced
		if (!gotoEnd)
			this.dequeue();

		return this;
	}

});

var queue = function( elem, type, array ) {
	if ( elem ){

		type = type || "fx";

		var q = jQuery.data( elem, type + "queue" );

		if ( !q || array )
			q = jQuery.data( elem, type + "queue", jQuery.makeArray(array) );

	}
	return q;
};

jQuery.fn.dequeue = function(type){
	type = type || "fx";

	return this.each(function(){
		var q = queue(this, type);

		q.shift();

		if ( q.length )
			q[0].call( this );
	});
};

jQuery.extend({

	speed: function(speed, easing, fn) {
		var opt = speed && speed.constructor == Object ? speed : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && easing.constructor != Function && easing
		};

		opt.duration = (opt.duration && opt.duration.constructor == Number ?
			opt.duration :
			jQuery.fx.speeds[opt.duration]) || jQuery.fx.speeds.def;

		// Queueing
		opt.old = opt.complete;
		opt.complete = function(){
			if ( opt.queue !== false )
				jQuery(this).dequeue();
			if ( jQuery.isFunction( opt.old ) )
				opt.old.call( this );
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	},

	timers: [],
	timerId: null,

	fx: function( elem, options, prop ){
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		if ( !options.orig )
			options.orig = {};
	}

});

jQuery.fx.prototype = {

	// Simple function for setting a style value
	update: function(){
		if ( this.options.step )
			this.options.step.call( this.elem, this.now, this );

		(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );

		// Set display property to block for height/width animations
		if ( this.prop == "height" || this.prop == "width" )
			this.elem.style.display = "block";
	},

	// Get the current size
	cur: function(force){
		if ( this.elem[this.prop] != null && this.elem.style[this.prop] == null )
			return this.elem[ this.prop ];

		var r = parseFloat(jQuery.css(this.elem, this.prop, force));
		return r && r > -10000 ? r : parseFloat(jQuery.curCSS(this.elem, this.prop)) || 0;
	},

	// Start an animation from one number to another
	custom: function(from, to, unit){
		this.startTime = now();
		this.start = from;
		this.end = to;
		this.unit = unit || this.unit || "px";
		this.now = this.start;
		this.pos = this.state = 0;
		this.update();

		var self = this;
		function t(gotoEnd){
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		jQuery.timers.push(t);

		if ( jQuery.timerId == null ) {
			jQuery.timerId = setInterval(function(){
				var timers = jQuery.timers;

				for ( var i = 0; i < timers.length; i++ )
					if ( !timers[i]() )
						timers.splice(i--, 1);

				if ( !timers.length ) {
					clearInterval( jQuery.timerId );
					jQuery.timerId = null;
				}
			}, 13);
		}
	},

	// Simple 'show' function
	show: function(){
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.attr( this.elem.style, this.prop );
		this.options.show = true;

		// Begin the animation
		this.custom(0, this.cur());

		// Make sure that we start at a small width/height to avoid any
		// flash of content
		if ( this.prop == "width" || this.prop == "height" )
			this.elem.style[this.prop] = "1px";

		// Start by showing the element
		jQuery(this.elem).show();
	},

	// Simple 'hide' function
	hide: function(){
		// Remember where we started, so that we can go back to it later
		this.options.orig[this.prop] = jQuery.attr( this.elem.style, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom(this.cur(), 0);
	},

	// Each step of an animation
	step: function(gotoEnd){
		var t = now();

		if ( gotoEnd || t > this.options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			this.options.curAnim[ this.prop ] = true;

			var done = true;
			for ( var i in this.options.curAnim )
				if ( this.options.curAnim[i] !== true )
					done = false;

			if ( done ) {
				if ( this.options.display != null ) {
					// Reset the overflow
					this.elem.style.overflow = this.options.overflow;

					// Reset the display
					this.elem.style.display = this.options.display;
					if ( jQuery.css(this.elem, "display") == "none" )
						this.elem.style.display = "block";
				}

				// Hide the element if the "hide" operation was done
				if ( this.options.hide )
					this.elem.style.display = "none";

				// Reset the properties, if the item has been hidden or shown
				if ( this.options.hide || this.options.show )
					for ( var p in this.options.curAnim )
						jQuery.attr(this.elem.style, p, this.options.orig[p]);
			}

			if ( done )
				// Execute the complete function
				this.options.complete.call( this.elem );

			return false;
		} else {
			var n = t - this.startTime;
			this.state = n / this.options.duration;

			// Perform the easing function, defaults to swing
			this.pos = jQuery.easing[this.options.easing || (jQuery.easing.swing ? "swing" : "linear")](this.state, n, 0, 1, this.options.duration);
			this.now = this.start + ((this.end - this.start) * this.pos);

			// Perform the next step of the animation
			this.update();
		}

		return true;
	}

};

jQuery.extend( jQuery.fx, {
	speeds:{
		slow: 600,
 		fast: 200,
 		// Default speed
 		def: 400
	},
	step: {
		scrollLeft: function(fx){
			fx.elem.scrollLeft = fx.now;
		},

		scrollTop: function(fx){
			fx.elem.scrollTop = fx.now;
		},

		opacity: function(fx){
			jQuery.attr(fx.elem.style, "opacity", fx.now);
		},

		_default: function(fx){
			fx.elem.style[ fx.prop ] = fx.now + fx.unit;
		}
	}
});
// The Offset Method
// Originally By Brandon Aaron, part of the Dimension Plugin
// http://jquery.com/plugins/project/dimensions
jQuery.fn.offset = function() {
	var left = 0, top = 0, elem = this[0], results;

	if ( elem ) with ( jQuery.browser ) {
		var parent       = elem.parentNode,
		    offsetChild  = elem,
		    offsetParent = elem.offsetParent,
		    doc          = elem.ownerDocument,
		    safari2      = safari && parseInt(version) < 522 && !/adobeair/i.test(userAgent),
		    css          = jQuery.curCSS,
		    fixed        = css(elem, "position") == "fixed";

		// Use getBoundingClientRect if available
		if ( elem.getBoundingClientRect ) {
			var box = elem.getBoundingClientRect();

			// Add the document scroll offsets
			add(box.left + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
				box.top  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));

			// IE adds the HTML element's border, by default it is medium which is 2px
			// IE 6 and 7 quirks mode the border width is overwritable by the following css html { border: 0; }
			// IE 7 standards mode, the border is always 2px
			// This border/offset is typically represented by the clientLeft and clientTop properties
			// However, in IE6 and 7 quirks mode the clientLeft and clientTop properties are not updated when overwriting it via CSS
			// Therefore this method will be off by 2px in IE while in quirksmode
			add( -doc.documentElement.clientLeft, -doc.documentElement.clientTop );

		// Otherwise loop through the offsetParents and parentNodes
		} else {

			// Initial element offsets
			add( elem.offsetLeft, elem.offsetTop );

			// Get parent offsets
			while ( offsetParent ) {
				// Add offsetParent offsets
				add( offsetParent.offsetLeft, offsetParent.offsetTop );

				// Mozilla and Safari > 2 does not include the border on offset parents
				// However Mozilla adds the border for table or table cells
				if ( mozilla && !/^t(able|d|h)$/i.test(offsetParent.tagName) || safari && !safari2 )
					border( offsetParent );

				// Add the document scroll offsets if position is fixed on any offsetParent
				if ( !fixed && css(offsetParent, "position") == "fixed" )
					fixed = true;

				// Set offsetChild to previous offsetParent unless it is the body element
				offsetChild  = /^body$/i.test(offsetParent.tagName) ? offsetChild : offsetParent;
				// Get next offsetParent
				offsetParent = offsetParent.offsetParent;
			}

			// Get parent scroll offsets
			while ( parent && parent.tagName && !/^body|html$/i.test(parent.tagName) ) {
				// Remove parent scroll UNLESS that parent is inline or a table to work around Opera inline/table scrollLeft/Top bug
				if ( !/^inline|table.*$/i.test(css(parent, "display")) )
					// Subtract parent scroll offsets
					add( -parent.scrollLeft, -parent.scrollTop );

				// Mozilla does not add the border for a parent that has overflow != visible
				if ( mozilla && css(parent, "overflow") != "visible" )
					border( parent );

				// Get next parent
				parent = parent.parentNode;
			}

			// Safari <= 2 doubles body offsets with a fixed position element/offsetParent or absolutely positioned offsetChild
			// Mozilla doubles body offsets with a non-absolutely positioned offsetChild
			if ( (safari2 && (fixed || css(offsetChild, "position") == "absolute")) ||
				(mozilla && css(offsetChild, "position") != "absolute") )
					add( -doc.body.offsetLeft, -doc.body.offsetTop );

			// Add the document scroll offsets if position is fixed
			if ( fixed )
				add(Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
					Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));
		}

		// Return an object with top and left properties
		results = { top: top, left: left };
	}

	function border(elem) {
		add( jQuery.curCSS(elem, "borderLeftWidth", true), jQuery.curCSS(elem, "borderTopWidth", true) );
	}

	function add(l, t) {
		left += parseInt(l, 10) || 0;
		top += parseInt(t, 10) || 0;
	}

	return results;
};


jQuery.fn.extend({
	position: function() {
		var left = 0, top = 0, results;

		if ( this[0] ) {
			// Get *real* offsetParent
			var offsetParent = this.offsetParent(),

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft 
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= num( this, 'marginTop' );
			offset.left -= num( this, 'marginLeft' );

			// Add offsetParent borders
			parentOffset.top  += num( offsetParent, 'borderTopWidth' );
			parentOffset.left += num( offsetParent, 'borderLeftWidth' );

			// Subtract the two offsets
			results = {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		}

		return results;
	},

	offsetParent: function() {
		var offsetParent = this[0].offsetParent;
		while ( offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && jQuery.css(offsetParent, 'position') == 'static') )
			offsetParent = offsetParent.offsetParent;
		return jQuery(offsetParent);
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ['Left', 'Top'], function(i, name) {
	var method = 'scroll' + name;
	
	jQuery.fn[ method ] = function(val) {
		if (!this[0]) return;

		return val != undefined ?

			// Set the scroll offset
			this.each(function() {
				this == window || this == document ?
					window.scrollTo(
						!i ? val : jQuery(window).scrollLeft(),
						 i ? val : jQuery(window).scrollTop()
					) :
					this[ method ] = val;
			}) :

			// Return the scroll offset
			this[0] == window || this[0] == document ?
				self[ i ? 'pageYOffset' : 'pageXOffset' ] ||
					jQuery.boxModel && document.documentElement[ method ] ||
					document.body[ method ] :
				this[0][ method ];
	};
});
// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function(i, name){

	var tl = i ? "Left"  : "Top",  // top or left
		br = i ? "Right" : "Bottom"; // bottom or right

	// innerHeight and innerWidth
	jQuery.fn["inner" + name] = function(){
		return this[ name.toLowerCase() ]() +
			num(this, "padding" + tl) +
			num(this, "padding" + br);
	};

	// outerHeight and outerWidth
	jQuery.fn["outer" + name] = function(margin) {
		return this["inner" + name]() +
			num(this, "border" + tl + "Width") +
			num(this, "border" + br + "Width") +
			(margin ?
				num(this, "margin" + tl) + num(this, "margin" + br) : 0);
	};

});})();


/**************** content/js/ext/json2.js *****************/
/*
    http://www.JSON.org/json2.js
    2009-04-16

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    JSON = {};
}
(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


/**************** content/js/ext/xmlhttprequester.js *****************/
function pageaddict_xmlhttpRequester(unsafeContentWin, chromeWindow) {
	this.unsafeContentWin = unsafeContentWin;
	this.chromeWindow = chromeWindow;
}

// this function gets called by user scripts in content security scope to
// start a cross-domain xmlhttp request.
//
// details should look like:
// {method,url,onload,onerror,onreadystatechange,headers,data}
// headers should be in the form {name:value,name:value,etc}
// can't support mimetype because i think it's only used for forcing
// text/xml and we can't support that
pageaddict_xmlhttpRequester.prototype.contentStartRequest = function(details) {
	// important to store this locally so that content cannot trick us up with
	// a fancy getter that checks the number of times it has been accessed,
	// returning a dangerous URL the time that we actually use it.

	var url = details.url;
	
	// make sure that we have an actual string so that we can't be fooled with
	// tricky toString() implementations.
	if (typeof url != "string") {
		throw new Error("Invalid url: url must be of type string");
	}

	var ioService=Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var scheme = ioService.extractScheme(url);

	// This is important - without it, GM_xmlhttpRequest can be used to get
	// access to things like files and chrome. Careful.
	switch (scheme) {
		case "http":
		case "https":
		case "ftp":
			this.chromeWindow.setTimeout(
				pageaddict_gmCompiler.hitch(this, "chromeStartRequest", url, details), 0);
			break;
		default:
			throw new Error("Invalid url: " + url);
	}
}

// this function is intended to be called in chrome's security context, so
// that it can access other domains without security warning
pageaddict_xmlhttpRequester.prototype.chromeStartRequest=function(safeUrl, details) {
	var req = new this.chromeWindow.XMLHttpRequest();

	this.setupRequestEvent(this.unsafeContentWin, req, "onload", details);
	this.setupRequestEvent(this.unsafeContentWin, req, "onerror", details);
	this.setupRequestEvent(this.unsafeContentWin, req, "onreadystatechange", details);

	req.open(details.method, safeUrl);

	if (details.headers) {
		for (var prop in details.headers) {
			req.setRequestHeader(prop, details.headers[prop]);
		}
	}

	req.send(details.data);
}

// arranges for the specified 'event' on xmlhttprequest 'req' to call the
// method by the same name which is a property of 'details' in the content
// window's security context.
pageaddict_xmlhttpRequester.prototype.setupRequestEvent =
function(unsafeContentWin, req, event, details) {
	if (details[event]) {
		req[event] = function() {
			var responseState = {
				// can't support responseXML because security won't
				// let the browser call properties on it
				responseText:req.responseText,
				readyState:req.readyState,
				responseHeaders:(req.readyState==4?req.getAllResponseHeaders():''),
				status:(req.readyState==4?req.status:0),
				statusText:(req.readyState==4?req.statusText:'')
			}

			// Pop back onto browser thread and call event handler.
			// Have to use nested function here instead of GM_hitch because
			// otherwise details[event].apply can point to window.setTimeout, which
			// can be abused to get increased priveledges.
			new XPCNativeWrapper(unsafeContentWin, "setTimeout()")
				.setTimeout(function(){details[event](responseState);}, 0);
		}
	}
}


/**************** content/js/ext/prefman.js *****************/
function pageaddict_PrefManager() {
	var startPoint="pageaddict.";

	var prefService=Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService);

	var pref=prefService.getBranch(startPoint);

	var observers={};

	// whether a preference exists
	this.exists=function(prefName) {
		return pref.getPrefType(prefName) != 0;
	}

	this.savePrefs=function() {
		prefService.savePrefFile(null);
	}

	// returns the named preference, or defaultValue if it does not exist
	this.getValue=function(prefName, defaultValue) {
		var prefType=pref.getPrefType(prefName);

		// underlying preferences object throws an exception if pref doesnt exist
		if (prefType==pref.PREF_INVALID) {
			return defaultValue;
		}

		switch (prefType) {
			case pref.PREF_STRING: return pref.getCharPref(prefName);
			case pref.PREF_BOOL: return pref.getBoolPref(prefName);
			case pref.PREF_INT: return pref.getIntPref(prefName);
		}
		
		/*
https://developer.mozilla.org/En/Code_snippets/Preferences
void getComplexValue(in string aPrefName, in nsIIDRef aType, [iid_is(aType), retval] out nsQIResult aValue);
void setComplexValue(in string aPrefName, in nsIIDRef aType, in nsISupports aValue);
		 */
	}

	// sets the named preference to the specified value. values must be strings,
	// booleans, or integers. Dates are converted to string representations of milliseconds since 1970.
	this.setValue=function(prefName, value) {
		var prefType=typeof(value);

		switch (prefType) {
			case "string":
			case "boolean":
				break;
			case "number":
				if (value % 1 != 0) {
					throw new Error("Cannot set preference to non integral number");
				}
				break;
			case "object":
				prefType = "string";
				//value = JSON.stringify(value);
				//alert("value: "+value+" string: "+JSON.stringify(value));
				value = "2";
				break;
			default:
				throw new Error("Cannot set preference with datatype: " + prefType);
		}

		// underlying preferences object throws an exception if new pref has a
		// different type than old one. i think we should not do this, so delete
		// old pref first if this is the case.
		if (this.exists(prefName) && prefType != typeof(this.getValue(prefName))) {
			this.remove(prefName);
		}

		// set new value using correct method
		switch (prefType) {
			case "string": pref.setCharPref(prefName, value); break;
			case "boolean": pref.setBoolPref(prefName, value); break;
			case "number": pref.setIntPref(prefName, Math.floor(value)); break;
		}
	}

	// deletes the named preference or subtree
	this.remove=function(prefName) {
		pref.deleteBranch(prefName);
	}

	// call a function whenever the named preference subtree changes
	this.watch=function(prefName, watcher) {
		// construct an observer
		var observer={
			observe:function(subject, topic, prefName) {
				watcher(prefName);
			}
		};

		// store the observer in case we need to remove it later
		observers[watcher]=observer;

		pref.QueryInterface(Components.interfaces.nsIPrefBranchInternal).
			addObserver(prefName, observer, false);
	}

	// stop watching
	this.unwatch=function(prefName, watcher) {
		if (observers[watcher]) {
			pref.QueryInterface(Components.interfaces.nsIPrefBranchInternal)
				.removeObserver(prefName, observers[watcher]);
		}
	}
}


/**************** content/js/ext/jssha2/sha2.js *****************/
/* A JavaScript implementation of the Secure Hash Standard
 * Version 0.3 Copyright Angel Marin 2003-2004 - http://anmar.eu.org/
 * Distributed under the BSD License
 * Some bits taken from Paul Johnston's SHA-1 implementation
 */
var chrsz   = 8;   /* bits per input character. 8 - ASCII; 16 - Unicode      */
var hexcase = 0;    /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "=";  /* base-64 pad character. "=" for strict RFC compliance   */

function safe_add (x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

function S (X, n) {return ( X >>> n ) | (X << (32 - n));}

function R (X, n) {return ( X >>> n );}

function Ch(x, y, z) {return ((x & y) ^ ((~x) & z));}

function Maj(x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));}

function Sigma0256(x) {return (S(x, 2) ^ S(x, 13) ^ S(x, 22));}

function Sigma1256(x) {return (S(x, 6) ^ S(x, 11) ^ S(x, 25));}

function Gamma0256(x) {return (S(x, 7) ^ S(x, 18) ^ R(x, 3));}

function Gamma1256(x) {return (S(x, 17) ^ S(x, 19) ^ R(x, 10));}

function Sigma0512(x) {return (S(x, 28) ^ S(x, 34) ^ S(x, 39));}

function Sigma1512(x) {return (S(x, 14) ^ S(x, 18) ^ S(x, 41));}

function Gamma0512(x) {return (S(x, 1) ^ S(x, 8) ^ R(x, 7));}

function Gamma1512(x) {return (S(x, 19) ^ S(x, 61) ^ R(x, 6));}

function core_sha256 (m, l) {
    var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
    var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;

    /* append padding */
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;

    for ( var i = 0; i<m.length; i+=16 ) {
        a = HASH[0];
        b = HASH[1];
        c = HASH[2];
        d = HASH[3];
        e = HASH[4];
        f = HASH[5];
        g = HASH[6];
        h = HASH[7];

        for ( var j = 0; j<64; j++) {
            if (j < 16) W[j] = m[j + i];
            else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

            T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
            T2 = safe_add(Sigma0256(a), Maj(a, b, c));

            h = g;
            g = f;
            f = e;
            e = safe_add(d, T1);
            d = c;
            c = b;
            b = a;
            a = safe_add(T1, T2);
        }
        
        HASH[0] = safe_add(a, HASH[0]);
        HASH[1] = safe_add(b, HASH[1]);
        HASH[2] = safe_add(c, HASH[2]);
        HASH[3] = safe_add(d, HASH[3]);
        HASH[4] = safe_add(e, HASH[4]);
        HASH[5] = safe_add(f, HASH[5]);
        HASH[6] = safe_add(g, HASH[6]);
        HASH[7] = safe_add(h, HASH[7]);
    }
    return HASH;
}

function core_sha512 (m, l) {
    var K = new Array(0x428a2f98d728ae22, 0x7137449123ef65cd, 0xb5c0fbcfec4d3b2f, 0xe9b5dba58189dbbc, 0x3956c25bf348b538, 0x59f111f1b605d019, 0x923f82a4af194f9b, 0xab1c5ed5da6d8118, 0xd807aa98a3030242, 0x12835b0145706fbe, 0x243185be4ee4b28c, 0x550c7dc3d5ffb4e2, 0x72be5d74f27b896f, 0x80deb1fe3b1696b1, 0x9bdc06a725c71235, 0xc19bf174cf692694, 0xe49b69c19ef14ad2, 0xefbe4786384f25e3, 0x0fc19dc68b8cd5b5, 0x240ca1cc77ac9c65, 0x2de92c6f592b0275, 0x4a7484aa6ea6e483, 0x5cb0a9dcbd41fbd4, 0x76f988da831153b5, 0x983e5152ee66dfab, 0xa831c66d2db43210, 0xb00327c898fb213f, 0xbf597fc7beef0ee4, 0xc6e00bf33da88fc2, 0xd5a79147930aa725, 0x06ca6351e003826f, 0x142929670a0e6e70, 0x27b70a8546d22ffc, 0x2e1b21385c26c926, 0x4d2c6dfc5ac42aed, 0x53380d139d95b3df, 0x650a73548baf63de, 0x766a0abb3c77b2a8, 0x81c2c92e47edaee6, 0x92722c851482353b, 0xa2bfe8a14cf10364, 0xa81a664bbc423001, 0xc24b8b70d0f89791, 0xc76c51a30654be30, 0xd192e819d6ef5218, 0xd69906245565a910, 0xf40e35855771202a, 0x106aa07032bbd1b8, 0x19a4c116b8d2d0c8, 0x1e376c085141ab53, 0x2748774cdf8eeb99, 0x34b0bcb5e19b48a8, 0x391c0cb3c5c95a63, 0x4ed8aa4ae3418acb, 0x5b9cca4f7763e373, 0x682e6ff3d6b2b8a3, 0x748f82ee5defb2fc, 0x78a5636f43172f60, 0x84c87814a1f0ab72, 0x8cc702081a6439ec, 0x90befffa23631e28, 0xa4506cebde82bde9, 0xbef9a3f7b2c67915, 0xc67178f2e372532b, 0xca273eceea26619c, 0xd186b8c721c0c207, 0xeada7dd6cde0eb1e, 0xf57d4f7fee6ed178, 0x06f067aa72176fba, 0x0a637dc5a2c898a6, 0x113f9804bef90dae, 0x1b710b35131c471b, 0x28db77f523047d84, 0x32caab7b40c72493, 0x3c9ebe0a15c9bebc, 0x431d67c49c100d4c, 0x4cc5d4becb3e42b6, 0x597f299cfc657e2a, 0x5fcb6fab3ad6faec, 0x6c44198c4a475817);
    var HASH = new Array(0x6a09e667f3bcc908, 0xbb67ae8584caa73b, 0x3c6ef372fe94f82b, 0xa54ff53a5f1d36f1, 0x510e527fade682d1, 0x9b05688c2b3e6c1f, 0x1f83d9abfb41bd6b, 0x5be0cd19137e2179);
    var W = new Array(80);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;

}

function str2binb (str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
  return bin;
}

function binb2str (bin) {
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (24 - i%32)) & mask);
  return str;
}

function binb2hex (binarray) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

function binb2b64 (binarray) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

function hex_sha256(s){return binb2hex(core_sha256(str2binb(s),s.length * chrsz));}
function b64_sha256(s){return binb2b64(core_sha256(str2binb(s),s.length * chrsz));}
function str_sha256(s){return binb2str(core_sha256(str2binb(s),s.length * chrsz));}


/**************** content/js/ext/jssha2/sha256.js *****************/
/* A JavaScript implementation of the Secure Hash Algorithm, SHA-256
 * Version 0.3 Copyright Angel Marin 2003-2004 - http://anmar.eu.org/
 * Distributed under the BSD License
 * Some bits taken from Paul Johnston's SHA-1 implementation
 */
var chrsz = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode  */
function safe_add (x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}
function S (X, n) {return ( X >>> n ) | (X << (32 - n));}
function R (X, n) {return ( X >>> n );}
function Ch(x, y, z) {return ((x & y) ^ ((~x) & z));}
function Maj(x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));}
function Sigma0256(x) {return (S(x, 2) ^ S(x, 13) ^ S(x, 22));}
function Sigma1256(x) {return (S(x, 6) ^ S(x, 11) ^ S(x, 25));}
function Gamma0256(x) {return (S(x, 7) ^ S(x, 18) ^ R(x, 3));}
function Gamma1256(x) {return (S(x, 17) ^ S(x, 19) ^ R(x, 10));}
function core_sha256 (m, l) {
    var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
    var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;
    /* append padding */
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;
    for ( var i = 0; i<m.length; i+=16 ) {
        a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
        for ( var j = 0; j<64; j++) {
            if (j < 16) W[j] = m[j + i];
            else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
            T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
            T2 = safe_add(Sigma0256(a), Maj(a, b, c));
            h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
        }
        HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]); HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
    }
    return HASH;
}
function str2binb (str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
  return bin;
}
function binb2hex (binarray) {
  var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}
function hex_sha256(s){return binb2hex(core_sha256(str2binb(s),s.length * chrsz));}


/**************** content/js/ext/showdown-v0.9/src/showdown.js *****************/
//
// showdown.js -- A javascript port of Markdown.
//
// Copyright (c) 2007 John Fraser.
//
// Original Markdown Copyright (c) 2004-2005 John Gruber
//   <http://daringfireball.net/projects/markdown/>
//
// Redistributable under a BSD-style open source license.
// See license.txt for more information.
//
// The full source distribution is at:
//
//				A A L
//				T C A
//				T K B
//
//   <http://www.attacklab.net/>
//

//
// Wherever possible, Showdown is a straight, line-by-line port
// of the Perl version of Markdown.
//
// This is not a normal parser design; it's basically just a
// series of string substitutions.  It's hard to read and
// maintain this way,  but keeping Showdown close to the original
// design makes it easier to port new features.
//
// More importantly, Showdown behaves like markdown.pl in most
// edge cases.  So web applications can do client-side preview
// in Javascript, and then build identical HTML on the server.
//
// This port needs the new RegExp functionality of ECMA 262,
// 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
// should do fine.  Even with the new regular expression features,
// We do a lot of work to emulate Perl's regex functionality.
// The tricky changes in this file mostly have the "attacklab:"
// label.  Major or self-explanatory changes don't.
//
// Smart diff tools like Araxis Merge will be able to match up
// this file with markdown.pl in a useful way.  A little tweaking
// helps: in a copy of markdown.pl, replace "#" with "//" and
// replace "$text" with "text".  Be sure to ignore whitespace
// and line endings.
//


//
// Showdown usage:
//
//   var text = "Markdown *rocks*.";
//
//   var converter = new Showdown.converter();
//   var html = converter.makeHtml(text);
//
//   alert(html);
//
// Note: move the sample code to the bottom of this
// file before uncommenting it.
//


//
// Showdown namespace
//
var Showdown = {};

//
// converter
//
// Wraps all "globals" so that the only thing
// exposed is makeHtml().
//
Showdown.converter = function() {

//
// Globals:
//

// Global hashes, used by various utility routines
var g_urls;
var g_titles;
var g_html_blocks;

// Used to track when we're inside an ordered or unordered list
// (see _ProcessListItems() for details):
var g_list_level = 0;


this.makeHtml = function(text) {
//
// Main function. The order in which other subs are called here is
// essential. Link and image substitutions need to happen before
// _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
// and <img> tags get encoded.
//

	// Clear the global hashes. If we don't clear these, you get conflicts
	// from other articles when generating a page which contains more than
	// one article (e.g. an index page that shows the N most recent
	// articles):
	g_urls = new Array();
	g_titles = new Array();
	g_html_blocks = new Array();

	// attacklab: Replace ~ with ~T
	// This lets us use tilde as an escape char to avoid md5 hashes
	// The choice of character is arbitray; anything that isn't
    // magic in Markdown will work.
	text = text.replace(/~/g,"~T");

	// attacklab: Replace $ with ~D
	// RegExp interprets $ as a special character
	// when it's in a replacement string
	text = text.replace(/\$/g,"~D");

	// Standardize line endings
	text = text.replace(/\r\n/g,"\n"); // DOS to Unix
	text = text.replace(/\r/g,"\n"); // Mac to Unix

	// Make sure text begins and ends with a couple of newlines:
	text = "\n\n" + text + "\n\n";

	// Convert all tabs to spaces.
	text = _Detab(text);

	// Strip any lines consisting only of spaces and tabs.
	// This makes subsequent regexen easier to write, because we can
	// match consecutive blank lines with /\n+/ instead of something
	// contorted like /[ \t]*\n+/ .
	text = text.replace(/^[ \t]+$/mg,"");

	// Turn block-level HTML blocks into hash entries
	text = _HashHTMLBlocks(text);

	// Strip link definitions, store in hashes.
	text = _StripLinkDefinitions(text);

	text = _RunBlockGamut(text);

	text = _UnescapeSpecialChars(text);

	// attacklab: Restore dollar signs
	text = text.replace(/~D/g,"$$");

	// attacklab: Restore tildes
	text = text.replace(/~T/g,"~");

	return text;
}


var _StripLinkDefinitions = function(text) {
//
// Strips link definitions from text, stores the URLs and titles in
// hash references.
//

	// Link defs are in the form: ^[id]: url "optional title"

	/*
		var text = text.replace(/
				^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
				  [ \t]*
				  \n?				// maybe *one* newline
				  [ \t]*
				<?(\S+?)>?			// url = $2
				  [ \t]*
				  \n?				// maybe one newline
				  [ \t]*
				(?:
				  (\n*)				// any lines skipped = $3 attacklab: lookbehind removed
				  ["(]
				  (.+?)				// title = $4
				  [")]
				  [ \t]*
				)?					// title is optional
				(?:\n+|$)
			  /gm,
			  function(){...});
	*/
	var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,
		function (wholeMatch,m1,m2,m3,m4) {
			m1 = m1.toLowerCase();
			g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive
			if (m3) {
				// Oops, found blank lines, so it's not a title.
				// Put back the parenthetical statement we stole.
				return m3+m4;
			} else if (m4) {
				g_titles[m1] = m4.replace(/"/g,"&quot;");
			}
			
			// Completely remove the definition from the text
			return "";
		}
	);

	return text;
}


var _HashHTMLBlocks = function(text) {
	// attacklab: Double up blank lines to reduce lookaround
	text = text.replace(/\n/g,"\n\n");

	// Hashify HTML blocks:
	// We only want to do this for block-level HTML tags, such as headers,
	// lists, and tables. That's because we still want to wrap <p>s around
	// "paragraphs" that are wrapped in non-block-level tags, such as anchors,
	// phrase emphasis, and spans. The list of tags we're looking for is
	// hard-coded:
	var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
	var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

	// First, look for nested blocks, e.g.:
	//   <div>
	//     <div>
	//     tags for inner block must be indented.
	//     </div>
	//   </div>
	//
	// The outermost tags must start at the left margin for this to match, and
	// the inner nested divs must be indented.
	// We need to do this before the next, more liberal match, because the next
	// match will start at the first `<div>` and stop at the first `</div>`.

	// attacklab: This regex can be expensive when it fails.
	/*
		var text = text.replace(/
		(						// save in $1
			^					// start of line  (with /m)
			<($block_tags_a)	// start tag = $2
			\b					// word break
								// attacklab: hack around khtml/pcre bug...
			[^\r]*?\n			// any number of lines, minimally matching
			</\2>				// the matching end tag
			[ \t]*				// trailing spaces/tabs
			(?=\n+)				// followed by a newline
		)						// attacklab: there are sentinel newlines at end of document
		/gm,function(){...}};
	*/
	text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);

	//
	// Now match more liberally, simply from `\n<tag>` to `</tag>\n`
	//

	/*
		var text = text.replace(/
		(						// save in $1
			^					// start of line  (with /m)
			<($block_tags_b)	// start tag = $2
			\b					// word break
								// attacklab: hack around khtml/pcre bug...
			[^\r]*?				// any number of lines, minimally matching
			.*</\2>				// the matching end tag
			[ \t]*				// trailing spaces/tabs
			(?=\n+)				// followed by a newline
		)						// attacklab: there are sentinel newlines at end of document
		/gm,function(){...}};
	*/
	text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);

	// Special case just for <hr />. It was easier to make a special case than
	// to make the other regex more complicated.  

	/*
		text = text.replace(/
		(						// save in $1
			\n\n				// Starting after a blank line
			[ ]{0,3}
			(<(hr)				// start tag = $2
			\b					// word break
			([^<>])*?			// 
			\/?>)				// the matching end tag
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
	text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);

	// Special case for standalone HTML comments:

	/*
		text = text.replace(/
		(						// save in $1
			\n\n				// Starting after a blank line
			[ ]{0,3}			// attacklab: g_tab_width - 1
			<!
			(--[^\r]*?--\s*)+
			>
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
	text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);

	// PHP and ASP-style processor instructions (<?...?> and <%...%>)

	/*
		text = text.replace(/
		(?:
			\n\n				// Starting after a blank line
		)
		(						// save in $1
			[ ]{0,3}			// attacklab: g_tab_width - 1
			(?:
				<([?%])			// $2
				[^\r]*?
				\2>
			)
			[ \t]*
			(?=\n{2,})			// followed by a blank line
		)
		/g,hashElement);
	*/
	text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);

	// attacklab: Undo double lines (see comment at top of this function)
	text = text.replace(/\n\n/g,"\n");
	return text;
}

var hashElement = function(wholeMatch,m1) {
	var blockText = m1;

	// Undo double lines
	blockText = blockText.replace(/\n\n/g,"\n");
	blockText = blockText.replace(/^\n/,"");
	
	// strip trailing blank lines
	blockText = blockText.replace(/\n+$/g,"");
	
	// Replace the element text with a marker ("~KxK" where x is its key)
	blockText = "\n\n~K" + (g_html_blocks.push(blockText)-1) + "K\n\n";
	
	return blockText;
};

var _RunBlockGamut = function(text) {
//
// These are all the transformations that form block-level
// tags like paragraphs, headers, and list items.
//
	text = _DoHeaders(text);

	// Do Horizontal Rules:
	var key = hashBlock("<hr />");
	text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
	text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);
	text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);

	text = _DoLists(text);
	text = _DoCodeBlocks(text);
	text = _DoBlockQuotes(text);

	// We already ran _HashHTMLBlocks() before, in Markdown(), but that
	// was to escape raw HTML in the original Markdown source. This time,
	// we're escaping the markup we've just created, so that we don't wrap
	// <p> tags around block-level tags.
	text = _HashHTMLBlocks(text);
	text = _FormParagraphs(text);

	return text;
}


var _RunSpanGamut = function(text) {
//
// These are all the transformations that occur *within* block-level
// tags like paragraphs, headers, and list items.
//

	text = _DoCodeSpans(text);
	text = _EscapeSpecialCharsWithinTagAttributes(text);
	text = _EncodeBackslashEscapes(text);

	// Process anchor and image tags. Images must come first,
	// because ![foo][f] looks like an anchor.
	text = _DoImages(text);
	text = _DoAnchors(text);

	// Make links out of things like `<http://example.com/>`
	// Must come after _DoAnchors(), because you can use < and >
	// delimiters in inline links like [this](<url>).
	text = _DoAutoLinks(text);
	text = _EncodeAmpsAndAngles(text);
	text = _DoItalicsAndBold(text);

	// Do hard breaks:
	text = text.replace(/  +\n/g," <br />\n");

	return text;
}

var _EscapeSpecialCharsWithinTagAttributes = function(text) {
//
// Within tags -- meaning between < and > -- encode [\ ` * _] so they
// don't conflict with their use in Markdown for code, italics and strong.
//

	// Build a regex to find HTML tags and comments.  See Friedl's 
	// "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
	var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

	text = text.replace(regex, function(wholeMatch) {
		var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");
		tag = escapeCharacters(tag,"\\`*_");
		return tag;
	});

	return text;
}

var _DoAnchors = function(text) {
//
// Turn Markdown link shortcuts into XHTML <a> tags.
//
	//
	// First, handle reference-style links: [link text] [id]
	//

	/*
		text = text.replace(/
		(							// wrap whole match in $1
			\[
			(
				(?:
					\[[^\]]*\]		// allow brackets nested one level
					|
					[^\[]			// or anything else
				)*
			)
			\]

			[ ]?					// one optional space
			(?:\n[ ]*)?				// one optional newline followed by spaces

			\[
			(.*?)					// id = $3
			\]
		)()()()()					// pad remaining backreferences
		/g,_DoAnchors_callback);
	*/
	text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);

	//
	// Next, inline-style links: [link text](url "optional title")
	//

	/*
		text = text.replace(/
			(						// wrap whole match in $1
				\[
				(
					(?:
						\[[^\]]*\]	// allow brackets nested one level
					|
					[^\[\]]			// or anything else
				)
			)
			\]
			\(						// literal paren
			[ \t]*
			()						// no id, so leave $3 empty
			<?(.*?)>?				// href = $4
			[ \t]*
			(						// $5
				(['"])				// quote char = $6
				(.*?)				// Title = $7
				\6					// matching quote
				[ \t]*				// ignore any spaces/tabs between closing quote and )
			)?						// title is optional
			\)
		)
		/g,writeAnchorTag);
	*/
	text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);

	//
	// Last, handle reference-style shortcuts: [link text]
	// These must come last in case you've also got [link test][1]
	// or [link test](/foo)
	//

	/*
		text = text.replace(/
		(		 					// wrap whole match in $1
			\[
			([^\[\]]+)				// link text = $2; can't contain '[' or ']'
			\]
		)()()()()()					// pad rest of backreferences
		/g, writeAnchorTag);
	*/
	text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

	return text;
}

var writeAnchorTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
	if (m7 == undefined) m7 = "";
	var whole_match = m1;
	var link_text   = m2;
	var link_id	 = m3.toLowerCase();
	var url		= m4;
	var title	= m7;
	
	if (url == "") {
		if (link_id == "") {
			// lower-case and turn embedded newlines into spaces
			link_id = link_text.toLowerCase().replace(/ ?\n/g," ");
		}
		url = "#"+link_id;
		
		if (g_urls[link_id] != undefined) {
			url = g_urls[link_id];
			if (g_titles[link_id] != undefined) {
				title = g_titles[link_id];
			}
		}
		else {
			if (whole_match.search(/\(\s*\)$/m)>-1) {
				// Special case for explicit empty url
				url = "";
			} else {
				return whole_match;
			}
		}
	}	
	
	url = escapeCharacters(url,"*_");
	var result = "<a href=\"" + url + "\"";
	
	if (title != "") {
		title = title.replace(/"/g,"&quot;");
		title = escapeCharacters(title,"*_");
		result +=  " title=\"" + title + "\"";
	}
	
	result += ">" + link_text + "</a>";
	
	return result;
}


var _DoImages = function(text) {
//
// Turn Markdown image shortcuts into <img> tags.
//

	//
	// First, handle reference-style labeled images: ![alt text][id]
	//

	/*
		text = text.replace(/
		(						// wrap whole match in $1
			!\[
			(.*?)				// alt text = $2
			\]

			[ ]?				// one optional space
			(?:\n[ ]*)?			// one optional newline followed by spaces

			\[
			(.*?)				// id = $3
			\]
		)()()()()				// pad rest of backreferences
		/g,writeImageTag);
	*/
	text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);

	//
	// Next, handle inline images:  ![alt text](url "optional title")
	// Don't forget: encode * and _

	/*
		text = text.replace(/
		(						// wrap whole match in $1
			!\[
			(.*?)				// alt text = $2
			\]
			\s?					// One optional whitespace character
			\(					// literal paren
			[ \t]*
			()					// no id, so leave $3 empty
			<?(\S+?)>?			// src url = $4
			[ \t]*
			(					// $5
				(['"])			// quote char = $6
				(.*?)			// title = $7
				\6				// matching quote
				[ \t]*
			)?					// title is optional
		\)
		)
		/g,writeImageTag);
	*/
	text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);

	return text;
}

var writeImageTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
	var whole_match = m1;
	var alt_text   = m2;
	var link_id	 = m3.toLowerCase();
	var url		= m4;
	var title	= m7;

	if (!title) title = "";
	
	if (url == "") {
		if (link_id == "") {
			// lower-case and turn embedded newlines into spaces
			link_id = alt_text.toLowerCase().replace(/ ?\n/g," ");
		}
		url = "#"+link_id;
		
		if (g_urls[link_id] != undefined) {
			url = g_urls[link_id];
			if (g_titles[link_id] != undefined) {
				title = g_titles[link_id];
			}
		}
		else {
			return whole_match;
		}
	}	
	
	alt_text = alt_text.replace(/"/g,"&quot;");
	url = escapeCharacters(url,"*_");
	var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

	// attacklab: Markdown.pl adds empty title attributes to images.
	// Replicate this bug.

	//if (title != "") {
		title = title.replace(/"/g,"&quot;");
		title = escapeCharacters(title,"*_");
		result +=  " title=\"" + title + "\"";
	//}
	
	result += " />";
	
	return result;
}


var _DoHeaders = function(text) {

	// Setext-style headers:
	//	Header 1
	//	========
	//  
	//	Header 2
	//	--------
	//
	text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
		function(wholeMatch,m1){return hashBlock("<h1>" + _RunSpanGamut(m1) + "</h1>");});

	text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
		function(matchFound,m1){return hashBlock("<h2>" + _RunSpanGamut(m1) + "</h2>");});

	// atx-style headers:
	//  # Header 1
	//  ## Header 2
	//  ## Header 2 with closing hashes ##
	//  ...
	//  ###### Header 6
	//

	/*
		text = text.replace(/
			^(\#{1,6})				// $1 = string of #'s
			[ \t]*
			(.+?)					// $2 = Header text
			[ \t]*
			\#*						// optional closing #'s (not counted)
			\n+
		/gm, function() {...});
	*/

	text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
		function(wholeMatch,m1,m2) {
			var h_level = m1.length;
			return hashBlock("<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">");
		});

	return text;
}

// This declaration keeps Dojo compressor from outputting garbage:
var _ProcessListItems;

var _DoLists = function(text) {
//
// Form HTML ordered (numbered) and unordered (bulleted) lists.
//

	// attacklab: add sentinel to hack around khtml/safari bug:
	// http://bugs.webkit.org/show_bug.cgi?id=11231
	text += "~0";

	// Re-usable pattern to match any entirel ul or ol list:

	/*
		var whole_list = /
		(									// $1 = whole list
			(								// $2
				[ ]{0,3}					// attacklab: g_tab_width - 1
				([*+-]|\d+[.])				// $3 = first list item marker
				[ \t]+
			)
			[^\r]+?
			(								// $4
				~0							// sentinel for workaround; should be $
			|
				\n{2,}
				(?=\S)
				(?!							// Negative lookahead for another list item marker
					[ \t]*
					(?:[*+-]|\d+[.])[ \t]+
				)
			)
		)/g
	*/
	var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

	if (g_list_level) {
		text = text.replace(whole_list,function(wholeMatch,m1,m2) {
			var list = m1;
			var list_type = (m2.search(/[*+-]/g)>-1) ? "ul" : "ol";

			// Turn double returns into triple returns, so that we can make a
			// paragraph for the last item in a list, if necessary:
			list = list.replace(/\n{2,}/g,"\n\n\n");;
			var result = _ProcessListItems(list);
	
			// Trim any trailing whitespace, to put the closing `</$list_type>`
			// up on the preceding line, to get it past the current stupid
			// HTML block parser. This is a hack to work around the terrible
			// hack that is the HTML block parser.
			result = result.replace(/\s+$/,"");
			result = "<"+list_type+">" + result + "</"+list_type+">\n";
			return result;
		});
	} else {
		whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
		text = text.replace(whole_list,function(wholeMatch,m1,m2,m3) {
			var runup = m1;
			var list = m2;

			var list_type = (m3.search(/[*+-]/g)>-1) ? "ul" : "ol";
			// Turn double returns into triple returns, so that we can make a
			// paragraph for the last item in a list, if necessary:
			var list = list.replace(/\n{2,}/g,"\n\n\n");;
			var result = _ProcessListItems(list);
			result = runup + "<"+list_type+">\n" + result + "</"+list_type+">\n";	
			return result;
		});
	}

	// attacklab: strip sentinel
	text = text.replace(/~0/,"");

	return text;
}

_ProcessListItems = function(list_str) {
//
//  Process the contents of a single ordered or unordered list, splitting it
//  into individual list items.
//
	// The $g_list_level global keeps track of when we're inside a list.
	// Each time we enter a list, we increment it; when we leave a list,
	// we decrement. If it's zero, we're not in a list anymore.
	//
	// We do this because when we're not inside a list, we want to treat
	// something like this:
	//
	//    I recommend upgrading to version
	//    8. Oops, now this line is treated
	//    as a sub-list.
	//
	// As a single paragraph, despite the fact that the second line starts
	// with a digit-period-space sequence.
	//
	// Whereas when we're inside a list (or sub-list), that line will be
	// treated as the start of a sub-list. What a kludge, huh? This is
	// an aspect of Markdown's syntax that's hard to parse perfectly
	// without resorting to mind-reading. Perhaps the solution is to
	// change the syntax rules such that sub-lists must start with a
	// starting cardinal number; e.g. "1." or "a.".

	g_list_level++;

	// trim trailing blank lines:
	list_str = list_str.replace(/\n{2,}$/,"\n");

	// attacklab: add sentinel to emulate \z
	list_str += "~0";

	/*
		list_str = list_str.replace(/
			(\n)?							// leading line = $1
			(^[ \t]*)						// leading whitespace = $2
			([*+-]|\d+[.]) [ \t]+			// list marker = $3
			([^\r]+?						// list item text   = $4
			(\n{1,2}))
			(?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
		/gm, function(){...});
	*/
	list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
		function(wholeMatch,m1,m2,m3,m4){
			var item = m4;
			var leading_line = m1;
			var leading_space = m2;

			if (leading_line || (item.search(/\n{2,}/)>-1)) {
				item = _RunBlockGamut(_Outdent(item));
			}
			else {
				// Recursion for sub-lists:
				item = _DoLists(_Outdent(item));
				item = item.replace(/\n$/,""); // chomp(item)
				item = _RunSpanGamut(item);
			}

			return  "<li>" + item + "</li>\n";
		}
	);

	// attacklab: strip sentinel
	list_str = list_str.replace(/~0/g,"");

	g_list_level--;
	return list_str;
}


var _DoCodeBlocks = function(text) {
//
//  Process Markdown `<pre><code>` blocks.
//  

	/*
		text = text.replace(text,
			/(?:\n\n|^)
			(								// $1 = the code block -- one or more lines, starting with a space/tab
				(?:
					(?:[ ]{4}|\t)			// Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
					.*\n+
				)+
			)
			(\n*[ ]{0,3}[^ \t\n]|(?=~0))	// attacklab: g_tab_width
		/g,function(){...});
	*/

	// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
	text += "~0";
	
	text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
		function(wholeMatch,m1,m2) {
			var codeblock = m1;
			var nextChar = m2;
		
			codeblock = _EncodeCode( _Outdent(codeblock));
			codeblock = _Detab(codeblock);
			codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines
			codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace

			codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

			return hashBlock(codeblock) + nextChar;
		}
	);

	// attacklab: strip sentinel
	text = text.replace(/~0/,"");

	return text;
}

var hashBlock = function(text) {
	text = text.replace(/(^\n+|\n+$)/g,"");
	return "\n\n~K" + (g_html_blocks.push(text)-1) + "K\n\n";
}


var _DoCodeSpans = function(text) {
//
//   *  Backtick quotes are used for <code></code> spans.
// 
//   *  You can use multiple backticks as the delimiters if you want to
//	 include literal backticks in the code span. So, this input:
//	 
//		 Just type ``foo `bar` baz`` at the prompt.
//	 
//	   Will translate to:
//	 
//		 <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
//	 
//	There's no arbitrary limit to the number of backticks you
//	can use as delimters. If you need three consecutive backticks
//	in your code, use four for delimiters, etc.
//
//  *  You can use spaces to get literal backticks at the edges:
//	 
//		 ... type `` `bar` `` ...
//	 
//	   Turns to:
//	 
//		 ... type <code>`bar`</code> ...
//

	/*
		text = text.replace(/
			(^|[^\\])					// Character before opening ` can't be a backslash
			(`+)						// $2 = Opening run of `
			(							// $3 = The code block
				[^\r]*?
				[^`]					// attacklab: work around lack of lookbehind
			)
			\2							// Matching closer
			(?!`)
		/gm, function(){...});
	*/

	text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
		function(wholeMatch,m1,m2,m3,m4) {
			var c = m3;
			c = c.replace(/^([ \t]*)/g,"");	// leading whitespace
			c = c.replace(/[ \t]*$/g,"");	// trailing whitespace
			c = _EncodeCode(c);
			return m1+"<code>"+c+"</code>";
		});

	return text;
}


var _EncodeCode = function(text) {
//
// Encode/escape certain characters inside Markdown code runs.
// The point is that in code, these characters are literals,
// and lose their special Markdown meanings.
//
	// Encode all ampersands; HTML entities are not
	// entities within a Markdown code span.
	text = text.replace(/&/g,"&amp;");

	// Do the angle bracket song and dance:
	text = text.replace(/</g,"&lt;");
	text = text.replace(/>/g,"&gt;");

	// Now, escape characters that are magic in Markdown:
	text = escapeCharacters(text,"\*_{}[]\\",false);

// jj the line above breaks this:
//---

//* Item

//   1. Subitem

//            special char: *
//---

	return text;
}


var _DoItalicsAndBold = function(text) {

	// <strong> must go first:
	text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
		"<strong>$2</strong>");

	text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
		"<em>$2</em>");

	return text;
}


var _DoBlockQuotes = function(text) {

	/*
		text = text.replace(/
		(								// Wrap whole match in $1
			(
				^[ \t]*>[ \t]?			// '>' at the start of a line
				.+\n					// rest of the first line
				(.+\n)*					// subsequent consecutive lines
				\n*						// blanks
			)+
		)
		/gm, function(){...});
	*/

	text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
		function(wholeMatch,m1) {
			var bq = m1;

			// attacklab: hack around Konqueror 3.5.4 bug:
			// "----------bug".replace(/^-/g,"") == "bug"

			bq = bq.replace(/^[ \t]*>[ \t]?/gm,"~0");	// trim one level of quoting

			// attacklab: clean up hack
			bq = bq.replace(/~0/g,"");

			bq = bq.replace(/^[ \t]+$/gm,"");		// trim whitespace-only lines
			bq = _RunBlockGamut(bq);				// recurse
			
			bq = bq.replace(/(^|\n)/g,"$1  ");
			// These leading spaces screw with <pre> content, so we need to fix that:
			bq = bq.replace(
					/(\s*<pre>[^\r]+?<\/pre>)/gm,
				function(wholeMatch,m1) {
					var pre = m1;
					// attacklab: hack around Konqueror 3.5.4 bug:
					pre = pre.replace(/^  /mg,"~0");
					pre = pre.replace(/~0/g,"");
					return pre;
				});
			
			return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
		});
	return text;
}


var _FormParagraphs = function(text) {
//
//  Params:
//    $text - string to process with html <p> tags
//

	// Strip leading and trailing lines:
	text = text.replace(/^\n+/g,"");
	text = text.replace(/\n+$/g,"");

	var grafs = text.split(/\n{2,}/g);
	var grafsOut = new Array();

	//
	// Wrap <p> tags.
	//
	var end = grafs.length;
	for (var i=0; i<end; i++) {
		var str = grafs[i];

		// if this is an HTML marker, copy it
		if (str.search(/~K(\d+)K/g) >= 0) {
			grafsOut.push(str);
		}
		else if (str.search(/\S/) >= 0) {
			str = _RunSpanGamut(str);
			str = str.replace(/^([ \t]*)/g,"<p>");
			str += "</p>"
			grafsOut.push(str);
		}

	}

	//
	// Unhashify HTML blocks
	//
	end = grafsOut.length;
	for (var i=0; i<end; i++) {
		// if this is a marker for an html block...
		while (grafsOut[i].search(/~K(\d+)K/) >= 0) {
			var blockText = g_html_blocks[RegExp.$1];
			blockText = blockText.replace(/\$/g,"$$$$"); // Escape any dollar signs
			grafsOut[i] = grafsOut[i].replace(/~K\d+K/,blockText);
		}
	}

	return grafsOut.join("\n\n");
}


var _EncodeAmpsAndAngles = function(text) {
// Smart processing for ampersands and angle brackets that need to be encoded.
	
	// Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
	//   http://bumppo.net/projects/amputator/
	text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");
	
	// Encode naked <'s
	text = text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");
	
	return text;
}


var _EncodeBackslashEscapes = function(text) {
//
//   Parameter:  String.
//   Returns:	The string, with after processing the following backslash
//			   escape sequences.
//

	// attacklab: The polite way to do this is with the new
	// escapeCharacters() function:
	//
	// 	text = escapeCharacters(text,"\\",true);
	// 	text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
	//
	// ...but we're sidestepping its use of the (slow) RegExp constructor
	// as an optimization for Firefox.  This function gets called a LOT.

	text = text.replace(/\\(\\)/g,escapeCharacters_callback);
	text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);
	return text;
}


var _DoAutoLinks = function(text) {

	text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");

	// Email addresses: <address@domain.foo>

	/*
		text = text.replace(/
			<
			(?:mailto:)?
			(
				[-.\w]+
				\@
				[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
			)
			>
		/gi, _DoAutoLinks_callback());
	*/
	text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
		function(wholeMatch,m1) {
			return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
		}
	);

	return text;
}


var _EncodeEmailAddress = function(addr) {
//
//  Input: an email address, e.g. "foo@example.com"
//
//  Output: the email address as a mailto link, with each character
//	of the address encoded as either a decimal or hex entity, in
//	the hopes of foiling most address harvesting spam bots. E.g.:
//
//	<a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
//	   x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
//	   &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
//
//  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
//  mailing list: <http://tinyurl.com/yu7ue>
//

	// attacklab: why can't javascript speak hex?
	function char2hex(ch) {
		var hexDigits = '0123456789ABCDEF';
		var dec = ch.charCodeAt(0);
		return(hexDigits.charAt(dec>>4) + hexDigits.charAt(dec&15));
	}

	var encode = [
		function(ch){return "&#"+ch.charCodeAt(0)+";";},
		function(ch){return "&#x"+char2hex(ch)+";";},
		function(ch){return ch;}
	];

	addr = "mailto:" + addr;

	addr = addr.replace(/./g, function(ch) {
		if (ch == "@") {
		   	// this *must* be encoded. I insist.
			ch = encode[Math.floor(Math.random()*2)](ch);
		} else if (ch !=":") {
			// leave ':' alone (to spot mailto: later)
			var r = Math.random();
			// roughly 10% raw, 45% hex, 45% dec
			ch =  (
					r > .9  ?	encode[2](ch)   :
					r > .45 ?	encode[1](ch)   :
								encode[0](ch)
				);
		}
		return ch;
	});

	addr = "<a href=\"" + addr + "\">" + addr + "</a>";
	addr = addr.replace(/">.+:/g,"\">"); // strip the mailto: from the visible part

	return addr;
}


var _UnescapeSpecialChars = function(text) {
//
// Swap back in all the special characters we've hidden.
//
	text = text.replace(/~E(\d+)E/g,
		function(wholeMatch,m1) {
			var charCodeToReplace = parseInt(m1);
			return String.fromCharCode(charCodeToReplace);
		}
	);
	return text;
}


var _Outdent = function(text) {
//
// Remove one level of line-leading tabs or spaces
//

	// attacklab: hack around Konqueror 3.5.4 bug:
	// "----------bug".replace(/^-/g,"") == "bug"

	text = text.replace(/^(\t|[ ]{1,4})/gm,"~0"); // attacklab: g_tab_width

	// attacklab: clean up hack
	text = text.replace(/~0/g,"")

	return text;
}

var _Detab = function(text) {
// attacklab: Detab's completely rewritten for speed.
// In perl we could fix it by anchoring the regexp with \G.
// In javascript we're less fortunate.

	// expand first n-1 tabs
	text = text.replace(/\t(?=\t)/g,"    "); // attacklab: g_tab_width

	// replace the nth with two sentinels
	text = text.replace(/\t/g,"~A~B");

	// use the sentinel to anchor our regex so it doesn't explode
	text = text.replace(/~B(.+?)~A/g,
		function(wholeMatch,m1,m2) {
			var leadingText = m1;
			var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width

			// there *must* be a better way to do this:
			for (var i=0; i<numSpaces; i++) leadingText+=" ";

			return leadingText;
		}
	);

	// clean up sentinels
	text = text.replace(/~A/g,"    ");  // attacklab: g_tab_width
	text = text.replace(/~B/g,"");

	return text;
}


//
//  attacklab: Utility functions
//


var escapeCharacters = function(text, charsToEscape, afterBackslash) {
	// First we have to escape the escape characters so that
	// we can build a character class out of them
	var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

	if (afterBackslash) {
		regexString = "\\\\" + regexString;
	}

	var regex = new RegExp(regexString,"g");
	text = text.replace(regex,escapeCharacters_callback);

	return text;
}


var escapeCharacters_callback = function(wholeMatch,m1) {
	var charCodeToEscape = m1.charCodeAt(0);
	return "~E"+charCodeToEscape+"E";
}

} // end of Showdown.converter

/**************** content/js/ext/google_gauge_api.js *****************/
if (!window['google']) {
window['google'] = {};
}
if (!window['google']['loader']) {
window['google']['loader'] = {};
google.loader.ServiceBase = 'http://www.google.com/uds';
google.loader.GoogleApisBase = 'http://ajax.googleapis.com/ajax';
google.loader.ApiKey = 'notsupplied';
google.loader.KeyVerified = true;
google.loader.LoadFailure = false;
google.loader.Secure = false;
google.loader.GoogleLocale = 'www.google.com';
google.loader.ClientLocation = {"latitude":42.38,"longitude":-71.135,"address":{"city":"Cambridge","region":"MA","country":"USA","country_code":"US"}};
google.loader.AdditionalParams = '';
(function() {var d=true,f=null,g=false,h=encodeURIComponent,j=window,k=google,m=undefined,n=document;function p(a,b){return a.load=b}var q="push",s="length",t="prototype",u="setTimeout",v="replace",w="charAt",x="loader",y="substring",z="ServiceBase",A="name",B="getTime",C="join",D="toLowerCase";function E(a){if(a in F)return F[a];return F[a]=navigator.userAgent[D]().indexOf(a)!=-1}var F={};function G(a,b){var c=function(){};c.prototype=b[t];a.R=b[t];a.prototype=new c}
function H(a,b){var c=a.F||[];c=c.concat(Array[t].slice.call(arguments,2));if(typeof a.s!="undefined")b=a.s;if(typeof a.r!="undefined")a=a.r;var e=function(){var i=c.concat(Array[t].slice.call(arguments));return a.apply(b,i)};e.F=c;e.s=b;e.r=a;return e}function I(a){a=new Error(a);a.toString=function(){return this.message};return a}function J(a,b){a=a.split(/\./);for(var c=j,e=0;e<a[s]-1;e++){c[a[e]]||(c[a[e]]={});c=c[a[e]]}c[a[a[s]-1]]=b}function K(a,b,c){a[b]=c}if(!L)var L=J;if(!M)var M=K;k[x].t={};L("google.loader.callbacks",k[x].t);var N={},O={};k[x].eval={};L("google.loader.eval",k[x].eval);
p(k,function(a,b,c){var e=a;c=c||{};function i(r){var o=r.split(".");if(o[s]>2)throw I("Module: '"+r+"' not found!");else if(typeof o[1]!="undefined"){e=o[0];c.packages=c.packages||[];c.packages[q](o[1])}}if(a instanceof Array||a&&typeof a=="object"&&typeof a[C]=="function"&&typeof a.reverse=="function")for(var l=0;l<a[s];l++)i(a[l]);else i(a);if(a=N[":"+e]){if(c&&!c.language&&c.locale)c.language=c.locale;if(c&&typeof c.callback=="string"){l=c.callback;if(l.match(/^[[\]A-Za-z0-9._]+$/)){l=j.eval(l);
c.callback=l}}if((l=c&&c.callback!=f)&&!a.q(b))throw I("Module: '"+e+"' must be loaded before DOM onLoad!");else if(l)a.l(b,c)?j[u](c.callback,0):a.load(b,c);else a.l(b,c)||a.load(b,c)}else throw I("Module: '"+e+"' not found!");});L("google.load",k.load);k.Q=function(a,b){b?aa(a):P(j,"load",a)};L("google.setOnLoadCallback",k.Q);function P(a,b,c){if(a.addEventListener)a.addEventListener(b,c,g);else if(a.attachEvent)a.attachEvent("on"+b,c);else{var e=a["on"+b];a["on"+b]=e!=f?ba([c,e]):c}}
function ba(a){return function(){for(var b=0;b<a[s];b++)a[b]()}}var Q=[];function aa(a){if(Q[s]==0){P(j,"load",R);if(!E("msie")&&!(E("safari")||E("konqueror"))&&E("mozilla")||j.opera)j.addEventListener("DOMContentLoaded",R,g);else if(E("msie"))n.write("<script defer onreadystatechange='google.loader.domReady()' src=//:><\/script>");else(E("safari")||E("konqueror"))&&j[u](ca,10)}Q[q](a)}
k[x].L=function(){var a=j.event.srcElement;if(a.readyState=="complete"){a.onreadystatechange=f;a.parentNode.removeChild(a);R()}};L("google.loader.domReady",k[x].L);var da={loaded:d,complete:d};function ca(){if(da[n.readyState])R();else Q[s]>0&&j[u](ca,10)}function R(){for(var a=0;a<Q[s];a++)Q[a]();Q.length=0}
k[x].e=function(a,b,c){if(c){var e;if(a=="script"){e=n.createElement("script");e.type="text/javascript";e.src=b}else if(a=="css"){e=n.createElement("link");e.type="text/css";e.href=b;e.rel="stylesheet"}(a=n.getElementsByTagName("head")[0])||(a=n.body.parentNode.appendChild(n.createElement("head")));a.appendChild(e)}else if(a=="script")n.write('<script src="'+b+'" type="text/javascript"><\/script>');else a=="css"&&n.write('<link href="'+b+'" type="text/css" rel="stylesheet"></link>')};
L("google.loader.writeLoadTag",k[x].e);k[x].N=function(a){O=a};L("google.loader.rfm",k[x].N);k[x].P=function(a){for(var b in a)if(typeof b=="string"&&b&&b[w](0)==":"&&!N[b])N[b]=new T(b[y](1),a[b])};L("google.loader.rpl",k[x].P);k[x].O=function(a){if((a=a.specs)&&a[s])for(var b=0;b<a[s];++b){var c=a[b];if(typeof c=="string")N[":"+c]=new U(c);else{c=new V(c[A],c.baseSpec,c.customSpecs);N[":"+c[A]]=c}}};L("google.loader.rm",k[x].O);k[x].loaded=function(a){N[":"+a.module].j(a)};
L("google.loader.loaded",k[x].loaded);k[x].K=function(){var a=(new Date)[B](),b=Math.floor(Math.random()*10000000);return"qid="+(a.toString(16)+b.toString(16))};L("google.loader.createGuidArg_",k[x].K);J("google_exportSymbol",J);J("google_exportProperty",K);k[x].b={};L("google.loader.themes",k[x].b);k[x].b.z="http://www.google.com/cse/style/look/bubblegum.css";M(k[x].b,"BUBBLEGUM",k[x].b.z);k[x].b.B="http://www.google.com/cse/style/look/greensky.css";M(k[x].b,"GREENSKY",k[x].b.B);k[x].b.A="http://www.google.com/cse/style/look/espresso.css";
M(k[x].b,"ESPRESSO",k[x].b.A);k[x].b.D="http://www.google.com/cse/style/look/shiny.css";M(k[x].b,"SHINY",k[x].b.D);k[x].b.C="http://www.google.com/cse/style/look/minimalist.css";M(k[x].b,"MINIMALIST",k[x].b.C);function U(a){this.a=a;this.o={};this.c={};this.k=d;this.d=-1}
U[t].g=function(a,b){var c="";if(b!=m){if(b.language!=m)c+="&hl="+h(b.language);if(b.nocss!=m)c+="&output="+h("nocss="+b.nocss);if(b.nooldnames!=m)c+="&nooldnames="+h(b.nooldnames);if(b.packages!=m)c+="&packages="+h(b.packages);if(b.callback!=f)c+="&async=2";if(b.style!=m)c+="&style="+h(b.style);if(b.other_params!=m)c+="&"+b.other_params}if(!this.k){if(k[this.a]&&k[this.a].JSHash)c+="&sig="+h(k[this.a].JSHash);b=[];for(var e in this.o)e[w](0)==":"&&b[q](e[y](1));for(e in this.c)e[w](0)==":"&&b[q](e[y](1));
c+="&have="+h(b[C](","))}return k[x][z]+"/?file="+this.a+"&v="+a+k[x].AdditionalParams+c};U[t].v=function(a){var b=f;if(a)b=a.packages;var c=f;if(b)if(typeof b=="string")c=[a.packages];else if(b[s]){c=[];for(a=0;a<b[s];a++)typeof b[a]=="string"&&c[q](b[a][v](/^\s*|\s*$/,"")[D]())}c||(c=["default"]);b=[];for(a=0;a<c[s];a++)this.o[":"+c[a]]||b[q](c[a]);return b};
p(U[t],function(a,b){var c=this.v(b),e=b&&b.callback!=f;if(e)var i=new W(b.callback);for(var l=[],r=c[s]-1;r>=0;r--){var o=c[r];e&&i.G(o);if(this.c[":"+o]){c.splice(r,1);e&&this.c[":"+o][q](i)}else l[q](o)}if(c[s]){if(b&&b.packages)b.packages=c.sort()[C](",");if(!b&&O[":"+this.a]!=f&&O[":"+this.a].versions[":"+a]!=f&&!k[x].AdditionalParams&&this.k){a=O[":"+this.a];k[this.a]=k[this.a]||{};for(var S in a.properties)if(S&&S[w](0)==":")k[this.a][S[y](1)]=a.properties[S];k[x].e("script",k[x][z]+a.path+
a.js,e);a.css&&k[x].e("css",k[x][z]+a.path+a.css,e)}else if(!b||!b.autoloaded)k[x].e("script",this.g(a,b),e);if(this.k){this.k=g;this.d=(new Date)[B]();if(this.d%100!=1)this.d=-1}for(r=0;r<l[s];r++){o=l[r];this.c[":"+o]=[];e&&this.c[":"+o][q](i)}}});
U[t].j=function(a){if(this.d!=-1){X("al_"+this.a,"jl."+((new Date)[B]()-this.d),d);this.d=-1}for(var b=0;b<a.components[s];b++){this.o[":"+a.components[b]]=d;var c=this.c[":"+a.components[b]];if(c){for(var e=0;e<c[s];e++)c[e].J(a.components[b]);delete this.c[":"+a.components[b]]}}X("hl",this.a)};U[t].l=function(a,b){return this.v(b)[s]==0};U[t].q=function(){return d};function W(a){this.I=a;this.m={};this.p=0}W[t].G=function(a){this.p++;this.m[":"+a]=d};
W[t].J=function(a){if(this.m[":"+a]){this.m[":"+a]=g;this.p--;this.p==0&&j[u](this.I,0)}};function V(a,b,c){this.name=a;this.H=b;this.n=c;this.u=this.h=g;this.i=[];k[x].t[this[A]]=H(this.j,this)}G(V,U);p(V[t],function(a,b){var c=b&&b.callback!=f;if(c){this.i[q](b.callback);b.callback="google.loader.callbacks."+this[A]}else this.h=d;if(!b||!b.autoloaded)k[x].e("script",this.g(a,b),c);X("el",this[A])});V[t].l=function(a,b){return b&&b.callback!=f?this.u:this.h};V[t].j=function(){this.u=d;for(var a=0;a<this.i[s];a++)j[u](this.i[a],0);this.i=[]};
var Y=function(a,b){return a.string?h(a.string)+"="+h(b):a.regex?b[v](/(^.*$)/,a.regex):""};V[t].g=function(a,b){return this.M(this.w(a),a,b)};
V[t].M=function(a,b,c){var e="";if(a.key)e+="&"+Y(a.key,k[x].ApiKey);if(a.version)e+="&"+Y(a.version,b);b=k[x].Secure&&a.ssl?a.ssl:a.uri;if(c!=f)for(var i in c)if(a.params[i])e+="&"+Y(a.params[i],c[i]);else if(i=="other_params")e+="&"+c[i];else if(i=="base_domain")b="http://"+c[i]+a.uri[y](a.uri.indexOf("/",7));k[this[A]]={};if(b.indexOf("?")==-1&&e)e="?"+e[y](1);return b+e};V[t].q=function(a){return this.w(a).deferred};V[t].w=function(a){if(this.n)for(var b=0;b<this.n[s];++b){var c=this.n[b];if((new RegExp(c.pattern)).test(a))return c}return this.H};function T(a,b){this.a=a;this.f=b;this.h=g}G(T,U);p(T[t],function(a,b){this.h=d;k[x].e("script",this.g(a,b),g)});T[t].l=function(){return this.h};T[t].j=function(){};T[t].g=function(a,b){if(!this.f.versions[":"+a]){if(this.f.aliases){var c=this.f.aliases[":"+a];if(c)a=c}if(!this.f.versions[":"+a])throw I("Module: '"+this.a+"' with version '"+a+"' not found!");}a=k[x].GoogleApisBase+"/libs/"+this.a+"/"+a+"/"+this.f.versions[":"+a][b&&b.uncompressed?"uncompressed":"compressed"];X("el",this.a);return a};
T[t].q=function(){return g};var ea=g,Z=[],fa=(new Date)[B](),X=function(a,b,c){if(!ea){P(j,"unload",ga);ea=d}if(c){if(!k[x].Secure&&(!k[x].Options||k[x].Options.csi===g)){a=a[D]()[v](/[^a-z0-9_.]+/g,"_");b=b[D]()[v](/[^a-z0-9_.]+/g,"_");a="http://csi.gstatic.com/csi?s=uds&v=2&action="+h(a)+"&it="+h(b);j[u](H($,f,a),10000)}}else{Z[q]("r"+Z[s]+"="+h(a+(b?"|"+b:"")));j[u](ga,Z[s]>5?0:15000)}},ga=function(){if(Z[s]){$(k[x][z]+"/stats?"+Z[C]("&")+"&nc="+(new Date)[B]()+"_"+((new Date)[B]()-fa));Z.length=0}},$=function(a){var b=new Image,
c=ha++;ia[c]=b;b.onload=b.onerror=function(){delete ia[c]};b.src=a;b=f},ia={},ha=0;J("google.loader.recordStat",X);J("google.loader.createImageForLogging",$);

}) ();google.loader.rm({"specs":[{"name":"books","baseSpec":{"uri":"http://books.google.com/books/api.js","ssl":null,"key":{"string":"key"},"version":{"string":"v"},"deferred":true,"params":{"callback":{"string":"callback"},"language":{"string":"hl"}}}},"feeds",{"name":"friendconnect","baseSpec":{"uri":"http://www.google.com/friendconnect/script/friendconnect.js","ssl":null,"key":{"string":"key"},"version":{"string":"v"},"deferred":false,"params":{}}},"spreadsheets","gdata","visualization",{"name":"sharing","baseSpec":{"uri":"http://www.google.com/s2/sharing/js","ssl":null,"key":{"string":"key"},"version":{"string":"v"},"deferred":false,"params":{"language":{"string":"hl"}}}},"search",{"name":"maps","baseSpec":{"uri":"http://maps.google.com/maps?file\u003dgoogleapi","ssl":"https://maps-api-ssl.google.com/maps?file\u003dgoogleapi","key":{"string":"key"},"version":{"string":"v"},"deferred":true,"params":{"callback":{"regex":"callback\u003d$1\u0026async\u003d2"},"language":{"string":"hl"}}},"customSpecs":[{"uri":"http://maps.google.com/maps/api/js","ssl":null,"key":{"string":"key"},"version":{"string":"v"},"deferred":true,"params":{"callback":{"string":"callback"},"language":{"string":"hl"}},"pattern":"^(3|3..*)$"}]},"annotations_v2","language","earth",{"name":"annotations","baseSpec":{"uri":"http://www.google.com/reviews/scripts/annotations_bootstrap.js","ssl":null,"key":{"string":"key"},"version":{"string":"v"},"deferred":true,"params":{"callback":{"string":"callback"},"language":{"string":"hl"},"country":{"string":"gl"}}}},"ads","elements"]});
google.loader.rfm({":feeds":{"versions":{":1":"1",":1.0":"1"},"path":"/api/feeds/1.0/ae4d5487c52cf6dbfd3e0f5faa6e88b0/","js":"default+en.I.js","css":"default.css","properties":{":JSHash":"ae4d5487c52cf6dbfd3e0f5faa6e88b0",":Version":"1.0"}},":search":{"versions":{":1":"1",":1.0":"1"},"path":"/api/search/1.0/c1cdabe026cbcfa0e7dc257594d6a01c/","js":"default+en.I.js","css":"default.css","properties":{":JSHash":"c1cdabe026cbcfa0e7dc257594d6a01c",":NoOldNames":false,":Version":"1.0"}},":language":{"versions":{":1":"1",":1.0":"1"},"path":"/api/language/1.0/ea98162c994f78133b5a86d5035af686/","js":"default+en.I.js","properties":{":JSHash":"ea98162c994f78133b5a86d5035af686",":Version":"1.0"}},":spreadsheets":{"versions":{":0":"1",":0.2":"1"},"path":"/api/spreadsheets/0.2/626554c678ff579189704ea83fe72774/","js":"default.I.js","properties":{":JSHash":"626554c678ff579189704ea83fe72774",":Version":"0.2"}},":earth":{"versions":{":1":"1",":1.0":"1"},"path":"/api/earth/1.0/56ce34c6d009ea6795ba3ac23670c3ee/","js":"default.I.js","properties":{":JSHash":"56ce34c6d009ea6795ba3ac23670c3ee",":Version":"1.0"}},":annotations":{"versions":{":1":"1",":1.0":"1"},"path":"/api/annotations/1.0/f193f28356b091de48b6f9ae0de94a0a/","js":"default+en.I.js","properties":{":JSHash":"f193f28356b091de48b6f9ae0de94a0a",":Version":"1.0"}}});
google.loader.rpl({":scriptaculous":{"versions":{":1.8.3":{"uncompressed":"scriptaculous.js","compressed":"scriptaculous.js"},":1.8.2":{"uncompressed":"scriptaculous.js","compressed":"scriptaculous.js"},":1.8.1":{"uncompressed":"scriptaculous.js","compressed":"scriptaculous.js"}},"aliases":{":1.8":"1.8.3",":1":"1.8.3"}},":yui":{"versions":{":2.6.0":{"uncompressed":"build/yuiloader/yuiloader.js","compressed":"build/yuiloader/yuiloader-min.js"},":2.7.0":{"uncompressed":"build/yuiloader/yuiloader.js","compressed":"build/yuiloader/yuiloader-min.js"},":2.8.0r4":{"uncompressed":"build/yuiloader/yuiloader.js","compressed":"build/yuiloader/yuiloader-min.js"}},"aliases":{":2":"2.8.0r4",":2.7":"2.7.0",":2.6":"2.6.0",":2.8":"2.8.0r4",":2.8.0":"2.8.0r4"}},":swfobject":{"versions":{":2.1":{"uncompressed":"swfobject_src.js","compressed":"swfobject.js"},":2.2":{"uncompressed":"swfobject_src.js","compressed":"swfobject.js"}},"aliases":{":2":"2.2"}},":ext-core":{"versions":{":3.0.0":{"uncompressed":"ext-core-debug.js","compressed":"ext-core.js"}},"aliases":{":3":"3.0.0",":3.0":"3.0.0"}},":mootools":{"versions":{":1.2.3":{"uncompressed":"mootools.js","compressed":"mootools-yui-compressed.js"},":1.2.4":{"uncompressed":"mootools.js","compressed":"mootools-yui-compressed.js"},":1.2.1":{"uncompressed":"mootools.js","compressed":"mootools-yui-compressed.js"},":1.2.2":{"uncompressed":"mootools.js","compressed":"mootools-yui-compressed.js"},":1.11":{"uncompressed":"mootools.js","compressed":"mootools-yui-compressed.js"}},"aliases":{":1":"1.11",":1.2":"1.2.4"}},":jqueryui":{"versions":{":1.7.2":{"uncompressed":"jquery-ui.js","compressed":"jquery-ui.min.js"},":1.6.0":{"uncompressed":"jquery-ui.js","compressed":"jquery-ui.min.js"},":1.7.0":{"uncompressed":"jquery-ui.js","compressed":"jquery-ui.min.js"},":1.7.1":{"uncompressed":"jquery-ui.js","compressed":"jquery-ui.min.js"},":1.5.3":{"uncompressed":"jquery-ui.js","compressed":"jquery-ui.min.js"},":1.5.2":{"uncompressed":"jquery-ui.js","compressed":"jquery-ui.min.js"}},"aliases":{":1.7":"1.7.2",":1":"1.7.2",":1.6":"1.6.0",":1.5":"1.5.3"}},":chrome-frame":{"versions":{":1.0.0":{"uncompressed":"CFInstall.js","compressed":"CFInstall.min.js"}},"aliases":{":1":"1.0.0",":1.0":"1.0.0"}},":prototype":{"versions":{":1.6.0.2":{"uncompressed":"prototype.js","compressed":"prototype.js"},":1.6.1.0":{"uncompressed":"prototype.js","compressed":"prototype.js"},":1.6.0.3":{"uncompressed":"prototype.js","compressed":"prototype.js"}},"aliases":{":1.6.1":"1.6.1.0",":1":"1.6.1.0",":1.6":"1.6.1.0",":1.6.0":"1.6.0.3"}},":jquery":{"versions":{":1.2.3":{"uncompressed":"jquery.js","compressed":"jquery.min.js"},":1.3.1":{"uncompressed":"jquery.js","compressed":"jquery.min.js"},":1.3.0":{"uncompressed":"jquery.js","compressed":"jquery.min.js"},":1.3.2":{"uncompressed":"jquery.js","compressed":"jquery.min.js"},":1.2.6":{"uncompressed":"jquery.js","compressed":"jquery.min.js"}},"aliases":{":1":"1.3.2",":1.3":"1.3.2",":1.2":"1.2.6"}},":dojo":{"versions":{":1.2.3":{"uncompressed":"dojo/dojo.xd.js.uncompressed.js","compressed":"dojo/dojo.xd.js"},":1.3.1":{"uncompressed":"dojo/dojo.xd.js.uncompressed.js","compressed":"dojo/dojo.xd.js"},":1.1.1":{"uncompressed":"dojo/dojo.xd.js.uncompressed.js","compressed":"dojo/dojo.xd.js"},":1.3.0":{"uncompressed":"dojo/dojo.xd.js.uncompressed.js","compressed":"dojo/dojo.xd.js"},":1.3.2":{"uncompressed":"dojo/dojo.xd.js.uncompressed.js","compressed":"dojo/dojo.xd.js"},":1.2.0":{"uncompressed":"dojo/dojo.xd.js.uncompressed.js","compressed":"dojo/dojo.xd.js"}},"aliases":{":1":"1.3.2",":1.3":"1.3.2",":1.2":"1.2.3",":1.1":"1.1.1"}}});
}


/**************** content/js/ext/the_real_google_gauge_api.js *****************/
(function() {
/**
 * SWFObject v1.4.2: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * **SWFObject is the SWF embed script formerly known as FlashObject. The name was changed for
 *   legal reasons.
 */
if(typeof deconcept=="undefined"){var deconcept=new Object();}
if(typeof deconcept.util=="undefined"){deconcept.util=new Object();}
if(typeof deconcept.SWFObjectUtil=="undefined"){deconcept.SWFObjectUtil=new Object();}
deconcept.SWFObject=function(_1,id,w,h,_5,c,_7,_8,_9,_a,_b){
if(!document.getElementById){return;}
this.DETECT_KEY=_b?_b:"detectflash";
this.skipDetect=deconcept.util.getRequestParameter(this.DETECT_KEY);
this.params=new Object();
this.variables=new Object();
this.attributes=new Array();
if(_1){this.setAttribute("swf",_1);}
if(id){this.setAttribute("id",id);}
if(w){this.setAttribute("width",w);}
if(h){this.setAttribute("height",h);}
if(_5){this.setAttribute("version",new deconcept.PlayerVersion(_5.toString().split(".")));}
this.installedVer=deconcept.SWFObjectUtil.getPlayerVersion();
if(c){this.addParam("bgcolor",c);}
var q=_8?_8:"high";
this.addParam("quality",q);
this.setAttribute("useExpressInstall",_7);
this.setAttribute("doExpressInstall",false);
var _d=(_9)?_9:window.location;
this.setAttribute("xiRedirectUrl",_d);
this.setAttribute("redirectUrl","");
if(_a){this.setAttribute("redirectUrl",_a);}};
deconcept.SWFObject.prototype={setAttribute:function(_e,_f){
this.attributes[_e]=_f;
},getAttribute:function(_10){
return this.attributes[_10];
},addParam:function(_11,_12){
this.params[_11]=_12;
},getParams:function(){
return this.params;
},addVariable:function(_13,_14){
this.variables[_13]=_14;
},getVariable:function(_15){
return this.variables[_15];
},getVariables:function(){
return this.variables;
},getVariablePairs:function(){
var _16=new Array();
var key;
var _18=this.getVariables();
for(key in _18){_16.push(key+"="+_18[key]);}
return _16;
},getSWFHTML:function(){
var _19="";
if(navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length){
if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","PlugIn");}
_19="<embed type=\"application/x-shockwave-flash\" src=\""+this.getAttribute("swf")+"\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\"";
_19+=" id=\""+this.getAttribute("id")+"\" name=\""+this.getAttribute("id")+"\" ";
var _1a=this.getParams();
for(var key in _1a){_19+=key+"=\""+_1a[key]+"\" ";}
var _1c=this.getVariablePairs().join("&");
if(_1c.length>0){_19+="flashvars=\""+_1c+"\"";}
_19+="/>";
}else{if(this.getAttribute("doExpressInstall")){
this.addVariable("MMplayerType","ActiveX");}
_19="<object id=\""+this.getAttribute("id")+"\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\">";
_19+="<param name=\"movie\" value=\""+this.getAttribute("swf")+"\" />";
var _1d=this.getParams();
for(var key in _1d){_19+="<param name=\""+key+"\" value=\""+_1d[key]+"\" />";}
var _1f=this.getVariablePairs().join("&");
if(_1f.length>0){_19+="<param name=\"flashvars\" value=\""+_1f+"\" />";}
_19+="</object>";}
return _19;
},write:function(_20){
if(this.getAttribute("useExpressInstall")){
var _21=new deconcept.PlayerVersion([6,0,65]);
if(this.installedVer.versionIsValid(_21)&&!this.installedVer.versionIsValid(this.getAttribute("version"))){
this.setAttribute("doExpressInstall",true);
this.addVariable("MMredirectURL",escape(this.getAttribute("xiRedirectUrl")));
document.title=document.title.slice(0,47)+" - Flash Player Installation";
this.addVariable("MMdoctitle",document.title);}}
if(this.skipDetect||this.getAttribute("doExpressInstall")||this.installedVer.versionIsValid(this.getAttribute("version"))){
var n=(typeof _20=="string")?document.getElementById(_20):_20;
n.innerHTML=this.getSWFHTML();
return true;
}else{
if(this.getAttribute("redirectUrl")!=""){document.location.replace(this.getAttribute("redirectUrl"));}}
return false;}};
deconcept.SWFObjectUtil.getPlayerVersion=function(){
var _23=new deconcept.PlayerVersion([0,0,0]);
if(navigator.plugins&&navigator.mimeTypes.length){
var x=navigator.plugins["Shockwave Flash"];
if(x&&x.description){_23=new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split("."));}
}else{
try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");}
catch(e){try{
var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
_23=new deconcept.PlayerVersion([6,0,21]);
axo.AllowScriptAccess="always";}
catch(e){
if(_23.major==6){return _23;}}try{axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");}
catch(e){}}
if(axo!=null){_23=new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));}}
return _23;};
deconcept.PlayerVersion=function(_27){
this.major=_27[0]!=null?parseInt(_27[0],10):0;
this.minor=_27[1]!=null?parseInt(_27[1],10):0;
this.rev=_27[2]!=null?parseInt(_27[2],10):0;
};
deconcept.PlayerVersion.prototype.versionIsValid=function(fv){
if(this.major<fv.major){return false;}
if(this.major>fv.major){return true;}
if(this.minor<fv.minor){return false;}
if(this.minor>fv.minor){return true;}
if(this.rev<fv.rev){return false;}
return true;
};
deconcept.util={getRequestParameter:function(_29){
var q=document.location.search||document.location.hash;
if(q){
var _2b=q.substring(1).split("&");
for(var i=0;i<_2b.length;i++){
if(_2b[i].substring(0,_2b[i].indexOf("="))==_29){
return _2b[i].substring((_2b[i].indexOf("=")+1));}}}
return "";}};
deconcept.SWFObjectUtil.cleanupSWFs=function(){
var _2d=document.getElementsByTagName("OBJECT");
for(var i=0;i<_2d.length;i++){
_2d[i].style.display="none";
for(var x in _2d[i]){if(typeof _2d[i][x]=="function"){_2d[i][x]=null;}}}};
if(typeof window.onunload=="function"){
var oldunload=window.onunload;
window.onunload=function(){
deconcept.SWFObjectUtil.cleanupSWFs();
oldunload();};
}else{window.onunload=deconcept.SWFObjectUtil.cleanupSWFs;}
if(Array.prototype.push==null){
Array.prototype.push=function(_30){
this[this.length]=_30;
return this.length;};}

var getQueryParamValue=deconcept.util.getRequestParameter;
var FlashObject=deconcept.SWFObject; // for legacy support
var SWFObject=deconcept.SWFObject;
(function (){ function d(a){throw a;}var h=true,i=null,k=false,l=Error,ba=clearInterval,ca=encodeURIComponent,m=google_exportSymbol,fa=parseInt,ga=parseFloat,ha=String,o=window,ia=Number,ja=Object,p=document,ka=google,la=decodeURIComponent,ma=isNaN,q=google_exportProperty,r=Math;function na(a,b){return a.toString=b}function oa(a,b){return a.length=b}function pa(a,b){return a.setValue=b}function qa(a,b){return a.className=b}function ra(a,b){return a.width=b}function sa(a,b){return a.innerHTML=b}
function ta(a,b){return a.currentTarget=b}function ua(a,b){return a.left=b}function va(a,b){return a.clone=b}function wa(a,b){return a.target=b}function xa(a,b){return a.screenX=b}function ya(a,b){return a.screenY=b}function za(a,b){return a.send=b}function Aa(a,b){return a.keyCode=b}function Ba(a,b){return a.handleEvent=b}function Ca(a,b){return a.type=b}function Da(a,b){return a.contains=b}function Ea(a,b){return a.clear=b}function Fa(a,b){return a.getValue=b}
function Ga(a,b){return a.display=b}function Ha(a,b){return a.height=b}function Ia(a,b){return a.clientX=b}function Ka(a,b){return a.clientY=b}function La(a,b){return a.visibility=b}
var Ma="appendChild",Na="scrollTop",t="push",Oa="statusText",Pa="stop",Ra="filter",Sa="toString",Ta="getMonth",Va="getNumberOfRows",u="length",Wa="propertyIsEnumerable",Xa="getBoundingClientRect",Ya="getProperties",Za="open",$a="DataTable",v="prototype",ab="test",bb="setValue",cb="className",db="relatedTarget",eb="exec",fb="clearTimeout",w="width",gb="clientWidth",hb="round",ib="abort",jb="slice",kb="setTimeout",x="replace",lb="nodeType",mb="document",nb="removeEventListener",ob="getSeconds",pb="split",
qb="floor",rb="responseText",sb="getElementById",tb="RequestParameters",ub="getMilliseconds",vb="offsetWidth",wb="getColumnProperty",xb="concat",yb="constructor",zb="createTextNode",Ab="getNumberOfColumns",Bb="stopPropagation",Cb="getDate",Db="value",Eb="getDataTable",Fb="location",Gb="preventDefault",Hb="setFormattedValue",Ib="insertBefore",Jb="button",Kb="visualization",y="indexOf",Lb="message",Mb="hasOwnProperty",Nb="getMessage",z="dispatchEvent",Ob="style",Pb="getProperty",Qb="getColumnProperties",
Rb="setQuery",Sb="nodeName",Tb="body",D="left",Vb="removeChild",Wb="clone",F="target",Xb="setColumnProperties",Yb="screenX",Zb="screenY",H="call",$b="match",ac="status",bc="getBoxObjectFor",cc="send",dc="checkLogin",ec="isOpen",fc="charCode",gc="isError",hc="focus",ic="draw",jc="createElement",kc="getColumnLabel",lc="setProperty",mc="scrollHeight",nc="keyCode",oc="getColumnType",pc="firstChild",qc="getFullYear",rc="getSortedRows",sc="forEach",tc="getColumnRange",uc="clientHeight",vc="scrollLeft",
wc="charCodeAt",xc="clientLeft",yc="addEventListener",zc="bottom",Ac="setAttribute",Bc="href",Cc="substring",Dc="clientTop",Ec="handleEvent",Fc="getRowProperties",Gc="every",I="type",Hc="contains",Ic="apply",Jc="shiftKey",Kc="tagName",Lc="addColumn",Mc="getFormattedValue",Nc="errors",Oc="defaultView",Pc="setCell",Qc="name",Rc="parentNode",Sc="getHours",J="getValue",Tc="getMinutes",Uc="fileName",Vc="label",K="height",Wc="splice",Xc="getTime",Yc="offsetHeight",L="join",Zc="setColumns",bd="setActive",
cd="getElementsByTagName",dd="toLowerCase",ed="clientX",fd="clientY",gd="documentElement",hd="substr",id="right",jd="getTimezoneOffset",N,kd=kd||{},O=this,ld=i,md=".";function nd(a,b){a=a[pb](md);b=b||O;for(var c;c=a.shift();)if(b[c])b=b[c];else return i;return b}function od(){}function pd(a){a.ha=function(){return a.T||(a.T=new a)}}var qd="object",rd="[object Array]",P="number",sd="splice",td="array",ud="[object Function]",vd="call",wd="function",xd="null";
function yd(a){var b=typeof a;if(b==qd)if(a){if(a instanceof Array||!(a instanceof ja)&&ja[v][Sa][H](a)==rd||typeof a[u]==P&&typeof a[Wc]!="undefined"&&typeof a[Wa]!="undefined"&&!a[Wa](sd))return td;if(!(a instanceof ja)&&(ja[v][Sa][H](a)==ud||typeof a[H]!="undefined"&&typeof a[Wa]!="undefined"&&!a[Wa](vd)))return wd}else return xd;else if(b==wd&&typeof a[H]=="undefined")return qd;return b}function zd(a){return yd(a)==td}function Ad(a){var b=yd(a);return b==td||b==qd&&typeof a[u]==P}
function Bd(a){return Cd(a)&&typeof a[qc]==wd}var Dd="string";function Ed(a){return typeof a==Dd}function Fd(a){return typeof a==P}function Gd(a){return yd(a)==wd}function Cd(a){a=yd(a);return a==qd||a==td||a==wd}function Hd(a){if(a[Mb]&&a[Mb](Id))return a[Id];a[Id]||(a[Id]=++Jd);return a[Id]}var Id="closure_hashCode_"+r[qb](r.random()*2147483648)[Sa](36),Jd=0;function Kd(a){var b=yd(a);if(b==qd||b==td){if(a[Wb])return a[Wb][H](a);b=b==td?[]:{};for(var c in a)b[c]=Kd(a[c]);return b}return a}
function Ld(a,b){var c=a.xi;if(arguments[u]>2){var e=Array[v][jb][H](arguments,2);c&&e.unshift[Ic](e,c);c=e}b=a.zi||b;a=a.yi||a;var f=b||O;e=c?function(){var g=Array[v][jb][H](arguments);g.unshift[Ic](g,c);return a[Ic](f,g)}:function(){return a[Ic](f,arguments)};e.xi=c;e.zi=b;e.yi=a;return e}function Md(a){var b=Array[v][jb][H](arguments,1);b.unshift(a,i);return Ld[Ic](i,b)}var Nd=Date.now||function(){return(new Date)[Xc]()};
function Q(a,b){function c(){}c.prototype=b[v];a.b=b[v];a.prototype=new c;a[v].constructor=a};function Od(a,b,c){if(a[y])return a[y](b,c);if(Array[y])return Array[y](a,b,c);for(c=c=c==i?0:c<0?r.max(0,a[u]+c):c;c<a[u];c++)if(c in a&&a[c]===b)return c;return-1}var R="";function Pd(a,b,c){if(a[sc])a[sc](b,c);else if(Array[sc])Array[sc](a,b,c);else for(var e=a[u],f=Ed(a)?a[pb](R):a,g=0;g<e;g++)g in f&&b[H](c,f[g],g,a)}
function Qd(a,b,c){if(a[Ra])return a[Ra](b,c);if(Array[Ra])return Array[Ra](a,b,c);for(var e=a[u],f=[],g=0,j=Ed(a)?a[pb](R):a,n=0;n<e;n++)if(n in j){var s=j[n];if(b[H](c,s,n,a))f[g++]=s}return f}function Rd(a,b,c){if(a.map)return a.map(b,c);if(Array.map)return Array.map(a,b,c);for(var e=a[u],f=[],g=0,j=Ed(a)?a[pb](R):a,n=0;n<e;n++)if(n in j)f[g++]=b[H](c,j[n],n,a);return f}function Sd(a,b){if(a[Hc])return a[Hc](b);return Od(a,b)>-1}
function Td(a,b){b=Od(a,b);var c;if(c=b!=-1)Array[v][Wc][H](a,b,1)[u]==1;return c}function Ud(a){if(zd(a))return a[xb]();else{for(var b=[],c=0,e=a[u];c<e;c++)b[c]=a[c];return b}}function Vd(a){for(var b=1;b<arguments[u];b++){var c=arguments[b];if(Ad(c)){c=c;c=zd(c)?c[xb]():Ud(c);a[t][Ic](a,c)}else a[t](c)}}function Wd(a){return Array[v][Wc][Ic](a,Xd(arguments,1))}function Xd(a,b,c){return arguments[u]<=2?Array[v][jb][H](a,b):Array[v][jb][H](a,b,c)}
function Yd(a,b){for(var c=0;c<a[u];c++)a[c]={index:c,value:a[c]};var e=b||Zd;function f(g,j){return e(g[Db],j[Db])||g.index-j.index}Array[v].sort[H](a,f||Zd);for(c=0;c<a[u];c++)a[c]=a[c][Db]}function Zd(a,b){return a>b?1:a<b?-1:0};function $d(a,b){this.x=a!==undefined?a:0;this.y=b!==undefined?b:0}va($d[v],function(){return new $d(this.x,this.y)});var ae="(",be=", ",ce=")";na($d[v],function(){return ae+this.x+be+this.y+ce});function de(a,b){return new $d(a.x-b.x,a.y-b.y)};function ee(a,b){ra(this,a);Ha(this,b)}N=ee[v];va(N,function(){return new ee(this[w],this[K])});var fe=" x ";na(N,function(){return ae+this[w]+fe+this[K]+ce});N.ceil=function(){ra(this,r.ceil(this[w]));Ha(this,r.ceil(this[K]));return this};N.floor=function(){ra(this,r[qb](this[w]));Ha(this,r[qb](this[K]));return this};N.round=function(){ra(this,r[hb](this[w]));Ha(this,r[hb](this[K]));return this};function ge(a,b,c){for(var e in a)b[H](c,a[e],e,a)}function he(a){var b=[],c=0;for(var e in a)b[c++]=a[e];return b}function ie(a){var b=[],c=0;for(var e in a)b[c++]=e;return b}function je(a,b){for(var c in a)if(a[c]==b)return h;return k}function ke(a,b){var c;if(c=b in a)delete a[b];return c}function le(a,b,c){if(b in a)return a[b];return c}function me(a){var b={};for(var c in a)b[c]=a[c];return b}
var ne=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"];function oe(a){for(var b,c,e=1;e<arguments[u];e++){c=arguments[e];for(b in c)a[b]=c[b];for(var f=0;f<ne[u];f++){b=ne[f];if(ja[v][Mb][H](c,b))a[b]=c[b]}}}var pe="Uneven number of arguments";function qe(){var a=arguments[u];if(a==1&&zd(arguments[0]))return qe[Ic](i,arguments[0]);if(a%2)d(l(pe));for(var b={},c=0;c<a;c+=2)b[arguments[c]]=arguments[c+1];return b};function re(a){return a[x](/^[\s\xa0]+|[\s\xa0]+$/g,R)}var se=/^[a-zA-Z0-9\-_.!~*'()]*$/;function te(a){a=ha(a);if(!se[ab](a))return ca(a);return a}var ue=" ";function ve(a){return la(a[x](/\+/g,ue))}var we="&amp;",xe="&lt;",ye="&gt;",ze="&quot;",Ae="&",Be="<",Ce=">",De='"';
function Ee(a,b){if(b)return a[x](Fe,we)[x](Ge,xe)[x](He,ye)[x](Ie,ze);else{if(!Je[ab](a))return a;if(a[y](Ae)!=-1)a=a[x](Fe,we);if(a[y](Be)!=-1)a=a[x](Ge,xe);if(a[y](Ce)!=-1)a=a[x](He,ye);if(a[y](De)!=-1)a=a[x](Ie,ze);return a}}var Fe=/&/g,Ge=/</g,He=/>/g,Ie=/\"/g,Je=/[&<>\"]/;function Ke(a,b){return a[y](b)!=-1}var Le="0";function Me(a,b,c){a=c!==undefined?a.toFixed(c):ha(a);c=a[y](md);if(c==-1)c=a[u];b=r.max(0,b-c);b=(new Array(b+1))[L](Le);return b+a}var Ne="(\\d*)(\\D*)",Oe="g";
function Pe(a,b){var c=0;a=re(ha(a))[pb](md);b=re(ha(b))[pb](md);for(var e=r.max(a[u],b[u]),f=0;c==0&&f<e;f++){var g=a[f]||R,j=b[f]||R,n=new RegExp(Ne,Oe),s=new RegExp(Ne,Oe);do{var A=n[eb](g)||[R,R,R],B=s[eb](j)||[R,R,R];if(A[0][u]==0&&B[0][u]==0)break;c=A[1][u]==0?0:fa(A[1],10);var M=B[1][u]==0?0:fa(B[1],10);c=Qe(c,M)||Qe(A[2][u]==0,B[2][u]==0)||Qe(A[2],B[2])}while(c==0)}return c}function Qe(a,b){if(a<b)return-1;else if(a>b)return 1;return 0}Nd();var Re,Se,Te,Ue,Ve,We,Xe,Ye,Ze,$e;function af(){return O.navigator?O.navigator.userAgent:i}function bf(){return O.navigator}We=Ve=Ue=Te=Se=Re=k;var cf;if(cf=af()){var df=bf();Re=cf[y]("Opera")==0;Se=!Re&&cf[y]("MSIE")!=-1;Ue=(Te=!Re&&cf[y]("WebKit")!=-1)&&cf[y]("Mobile")!=-1;We=(Ve=!Re&&!Te&&df.product=="Gecko")&&df.vendor=="Camino"}var ef=Re,S=Se,ff=Ve,gf=Te,hf=Ue,jf,kf=bf(),lf=jf=kf&&kf.platform||R;Xe=Ke(lf,"Mac");Ye=Ke(lf,"Win");Ze=Ke(lf,"Linux");$e=!!bf()&&Ke(bf().appVersion||R,"X11");
var mf=Xe,nf=$e,of,pf=R,qf;if(ef&&O.opera){var rf=O.opera.version;pf=typeof rf==wd?rf():rf}else{if(ff)qf=/rv\:([^\);]+)(\)|;)/;else if(S)qf=/MSIE\s+([^\);]+)(\)|;)/;else if(gf)qf=/WebKit\/(\S+)/;if(qf){var sf=qf[eb](af());pf=sf?sf[1]:R}}var tf=of=pf,uf={};function vf(a){return uf[a]||(uf[a]=Pe(tf,a)>=0)};var wf;function xf(a){return(a=a[cb])&&typeof a[pb]==wd?a[pb](ue):[]}function yf(a){var b=xf(a),c=Xd(arguments,1),e;e=b;c=c;for(var f=0,g=0;g<c[u];g++)if(!Sd(e,c[g])){e[t](c[g]);f++}e=f==c[u];qa(a,b[L](ue));return e}function zf(a){var b=xf(a),c=Xd(arguments,1),e;e=b;c=c;for(var f=0,g=0;g<e[u];g++)if(Sd(c,e[g])){Wd(e,g--,1);f++}e=f==c[u];qa(a,b[L](ue));return e};function Af(a){return a?new Bf(Cf(a)):wf||(wf=new Bf)}var Df="style",Ef="class",Ff="for";function Gf(a,b){ge(b,function(c,e){if(e==Df)a[Ob].cssText=c;else if(e==Ef)qa(a,c);else if(e==Ff)a.htmlFor=c;else if(e in Hf)a[Ac](Hf[e],c);else a[e]=c})}var If="type",Hf={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",rowspan:"rowSpan",valign:"vAlign",height:"height",width:"width",usemap:"useMap",frameborder:"frameBorder",type:If},Jf="500",Kf="9.50";
function Lf(a){var b=a[mb];if(gf&&!vf(Jf)&&!hf){if(typeof a.innerHeight=="undefined")a=o;b=a.innerHeight;var c=a[mb][gd][mc];if(a==a.top)if(c<b)b-=15;return new ee(a.innerWidth,b)}a=Mf(b)&&(!ef||ef&&vf(Kf))?b[gd]:b[Tb];return new ee(a[gb],a[uc])}function Nf(a){return a?Of(a):o}var Pf="script",Qf="document.parentWindow=window";function Of(a){if(a.parentWindow)return a.parentWindow;if(gf&&!vf(Jf)&&!hf){var b=a[jc](Pf);sa(b,Qf);var c=a[gd];c[Ma](b);c[Vb](b);return a.parentWindow}return a[Oc]}
function Rf(){return Sf(p,arguments)}var Tf=' name="',Uf=' type="';function Sf(a,b){var c=b[0],e=b[1];if(S&&e&&(e[Qc]||e[I])){c=[Be,c];e[Qc]&&c[t](Tf,Ee(e[Qc]),De);if(e[I]){c[t](Uf,Ee(e[I]),De);e=Kd(e);delete e[I]}c[t](Ce);c=c[L](R)}var f=a[jc](c);if(e)if(Ed(e))qa(f,e);else Gf(f,e);if(b[u]>2){function g(j){if(j)f[Ma](Ed(j)?a[zb](j):j)}for(e=2;e<b[u];e++){c=b[e];Ad(c)&&!(Cd(c)&&c[lb]>0)?Pd(Vf(c)?Ud(c):c,g):g(c)}}return f}var Wf="CSS1Compat";function Mf(a){return a.compatMode==Wf}
function Xf(a,b){a[Ma](b)}function Yf(a){for(var b;b=a[pc];)a[Vb](b)}function Zf(a,b){b[Rc]&&b[Rc][Ib](a,b)}function $f(a){return a&&a[Rc]?a[Rc][Vb](a):i}function ag(a,b){var c=b[Rc];c&&c.replaceChild(a,b)}var bg=gf&&vf("522");function cg(a,b){if(typeof a[Hc]!="undefined"&&!bg&&b[lb]==1)return a==b||a[Hc](b);if(typeof a.compareDocumentPosition!="undefined")return a==b||Boolean(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b[Rc];return b==a}
function Cf(a){return a[lb]==9?a:a.ownerDocument||a[mb]}function dg(a){return a=gf?a[mb]||a.contentWindow[mb]:a.contentDocument||a.contentWindow[mb]}var eg="textContent";function fg(a,b){if(eg in a)a.textContent=b;else if(a[pc]&&a[pc][lb]==3){for(;a.lastChild!=a[pc];)a[Vb](a.lastChild);a[pc].data=b}else{Yf(a);var c=Cf(a);a[Ma](c[zb](b))}}var gg={SCRIPT:1,STYLE:1,HEAD:1,IFRAME:1,OBJECT:1},hg="\n",ig={IMG:ue,BR:hg},jg="tabindex";
function kg(a){var b=a.getAttributeNode(jg);if(b&&b.specified){a=a.tabIndex;return Fd(a)&&a>=0}return k}var lg="tabIndex";function mg(a,b){if(b)a.tabIndex=0;else a.removeAttribute(lg)}var ng="innerText";function og(a){if(S&&ng in a)a=a.innerText[x](/(\r\n|\r|\n)/g,hg);else{var b=[];pg(a,b,h);a=b[L](R)}a=a[x](/\xAD/g,R);a=a[x](/ +/g,ue);if(a!=ue)a=a[x](/^\s*/,R);return a}
function pg(a,b,c){if(!(a[Sb]in gg))if(a[lb]==3)c?b[t](ha(a.nodeValue)[x](/(\r\n|\r|\n)/g,R)):b[t](a.nodeValue);else if(a[Sb]in ig)b[t](ig[a[Sb]]);else for(a=a[pc];a;){pg(a,b,c);a=a.nextSibling}}function Vf(a){if(a&&typeof a[u]==P)if(Cd(a))return typeof a.item==wd||typeof a.item==Dd;else if(Gd(a))return typeof a.item==wd;return k}function Bf(a){this.i=a||O[mb]||p}N=Bf[v];N.z=Af;N.a=function(a){return Ed(a)?this.i[sb](a):a};N.setProperties=Gf;N.Nj=function(a){a=a||this.vg();return a=Lf(a||o)};
N.d=function(){return Sf(this.i,arguments)};N.createElement=function(a){return this.i[jc](a)};N.createTextNode=function(a){return this.i[zb](a)};N.Ig=function(){return Mf(this.i)};N.vg=function(){return Of(this.i)};N.xj=function(){return!gf&&Mf(this.i)?this.i[gd]:this.i[Tb]};N.Mb=function(){var a;a=!gf&&Mf(this.i)?this.i[gd]:this.i[Tb];return a=new $d(a[vc],a[Na])};N.appendChild=Xf;N.Ye=Yf;N.pk=Zf;N.removeNode=$f;Da(N,cg);var qg="@",rg="]";function sg(a){a=ha(a);var b;b=a;if(/^\s*$/[ab](b))b=k;else{var c=/\\["\\\/bfnrtu]/g,e=/"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,f=/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,g=/^[\],:{}\s\u2028\u2029]*$/;b=g[ab](b[x](c,qg)[x](e,rg)[x](f,R))}if(b)try{return eval(ae+a+ce)}catch(j){}d(l("Invalid JSON string: "+a))}function tg(){}tg[v].df=function(a){var b=[];this.ef(a,b);return b[L](R)};var ug="boolean";
tg[v].ef=function(a,b){switch(typeof a){case Dd:this.qh(a,b);break;case P:this.ml(a,b);break;case ug:b[t](a);break;case "undefined":b[t](xd);break;case qd:if(a==i){b[t](xd);break}if(zd(a)){this.ll(a,b);break}this.nl(a,b);break;case wd:break;default:d(l("Unknown type: "+typeof a))}};
var vg="\\\\",wg={'"':'\\"',"\\":vg,"/":"\\/","\u0008":"\\b","\u000c":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\u000b":"\\u000b"},xg=/\uffff/[ab]("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g,yg="\\u",zg="000",Ag="00";tg[v].qh=function(a,b){b[t](De,a[x](xg,function(c){if(c in wg)return wg[c];var e=c[wc](0),f=yg;if(e<16)f+=zg;else if(e<256)f+=Ag;else if(e<4096)f+=Le;return wg[c]=f+e[Sa](16)}),De)};tg[v].ml=function(a,b){b[t](isFinite(a)&&!ma(a)?a:xd)};var Bg="[",Cg=",";
tg[v].ll=function(a,b){var c=a[u];b[t](Bg);for(var e=R,f=0;f<c;f++){b[t](e);this.ef(a[f],b);e=Cg}b[t](rg)};var Dg="{",Eg=":",Fg="}";tg[v].nl=function(a,b){b[t](Dg);var c=R;for(var e in a)if(a[Mb](e)){var f=a[e];if(typeof f!=wd){b[t](c);this.qh(e,b);b[t](Eg);this.ef(f,b);c=Cg}}b[t](Fg)};var Gg;var Hg="en";function Ig(){Gg||(Gg=Hg);return Gg}function Jg(a,b){return a in Kg&&b in Kg[a]}var Kg={},Lg="DateTimeConstants";function Mg(a,b){a=a;var c=Lg;b=b;Kg[c]||(Kg[c]={});Kg[c][b]=a;Gg||(Gg=b)}
var Ng="M",Og="A",Pg="S",Qg={Xh:["BC","AD"],Wh:["Before Christ","Anno Domini"],Cf:["J","F",Ng,Og,Ng,"J","J",Og,Pg,"O","N","D"],Bf:["January","February","March","April","May","June","July","August","September","October","November","December"],Df:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Gf:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Ef:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Zh:[Pg,Ng,"T","W","T","F",Pg],bi:["Q1","Q2","Q3","Q4"],$h:["1st quarter",
"2nd quarter","3rd quarter","4th quarter"],Vh:["AM","PM"],yf:["EEEE, MMMM d, yyyy","MMMM d, yyyy","MMM d, yyyy","M/d/yy"],Ff:["h:mm:ss a v","h:mm:ss a z","h:mm:ss a","h:mm a"],dm:6,nm:[5,6],em:6};Qg.di=Qg.Cf;Qg.ci=Qg.Bf;Qg.fi=Qg.Df;Qg.hi=Qg.Gf;Qg.gi=Qg.Ef;Qg.ei=Qg.Zh;function Rg(){}var Sg="UTC",Tg="+",Ug="-";function Vg(a){if(typeof a==P){var b=a;a=new Rg;a.Ch=b;a.Mh=Wg(b);b=b;if(b==0)b=Sg;else{var c=[Sg,b<0?Tg:Ug];b=r.abs(b);c[t](r[qb](b/60)%100);b=b%60;b!=0&&c[t](Eg,b);b=c[L](R)}a.sf=[b,b];a.Qd=[];return a=a}b=new Rg;b.Mh=a.id;b.Ch=-a.std_offset;b.sf=a.names;b.Qd=a.transitions;return b}var Xg="Etc/GMT";function Wg(a){if(a==0)return Xg;var b=[Xg,a<0?Ug:Tg];a=r.abs(a);b[t](r[qb](a/60)%100);a=a%60;a!=0&&b[t](Eg,Me(a,2));return b[L](R)}N=Rg[v];
N.sg=function(a){a=Date.UTC(a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate(),a.getUTCHours(),a.getUTCMinutes());a=a/3600000;for(var b=0;b<this.Qd[u]&&a>=this.Qd[b];)b+=2;return b==0?0:this.Qd[b-1]};var Yg="GMT";N.zj=function(a){a=this.qe(a);var b=[Yg];b[t](a<=0?Tg:Ug);a=r.abs(a);b[t](Me(r[qb](a/60)%100,2),Eg,Me(a%60,2));return a=b[L](R)};N.Cj=function(a){return this.sf[this.Jg(a)?3:1]};N.qe=function(a){return this.Ch-this.sg(a)};
N.Fj=function(a){a=-this.qe(a);var b=[a<0?Ug:Tg];a=r.abs(a);b[t](Me(r[qb](a/60)%100,2),Me(a%60,2));return b[L](R)};N.Hj=function(a){return this.sf[this.Jg(a)?2:0]};N.Jg=function(a){return this.sg(a)>0};function Zg(){var a;a=Lg;var b=Ig();b=b?b:Ig();a=a in Kg?Kg[a][b]:undefined;this.G=a;this.td=[]}var $g=[/^\'(?:[^\']|\'\')*\'/,/^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/,/^[^\'GyMkSEahKHcLQdmsvzZ]+/];N=Zg[v];var ah="''",bh="'";N.Lf=function(a){for(;a;)for(var b=0;b<$g[u];++b){var c=a[$b]($g[b]);if(c){c=c[0];a=a[Cc](c[u]);if(b==0)if(c==ah)c=bh;else{c=c[Cc](1,c[u]-1);c=c[x](/\'\'/,bh)}this.td[t]({text:c,type:b});break}}};
N.C=function(a,b){b||(b=Vg(a[jd]()));var c=(a[jd]()-b.qe(a))*60000,e=c?new Date(a[Xc]()+c):a,f=e;if(e[jd]()!=a[jd]()){c+=c>0?-86400000:86400000;f=new Date(a[Xc]()+c)}c=[];for(var g=0;g<this.td[u];++g){var j=this.td[g].text;1==this.td[g][I]?c[t](this.ej(j,a,e,f,b)):c[t](j)}return c[L](R)};N.Zd=function(a){var b;if(a<4)b=this.G.yf[a];else if(a<8)b=this.G.Ff[a-4];else if(a<12)b=this.G.yf[a-8]+ue+this.G.Ff[a-8];else this.Zd(10);this.Lf(b)};N.dj=function(a,b){b=b[qc]()>0?1:0;return a>=4?this.G.Wh[b]:this.G.Xh[b]};
N.pj=function(a,b){b=b[qc]();if(b<0)b=-b;return a==2?Me(b%100,2):ha(b)};N.hj=function(a,b){b=b[Ta]();switch(a){case 5:return this.G.Cf[b];case 4:return this.G.Bf[b];case 3:return this.G.Df[b];default:return Me(b+1,a)}};N.$i=function(a,b){return Me(b[Sc]()||24,a)};N.fj=function(a,b){b=b[Xc]()%1000/1000;return b.toFixed(r.min(3,a))[hd](2)+(a>3?Me(0,a-3):R)};N.cj=function(a,b){b=b.getDay();return a>=4?this.G.Gf[b]:this.G.Ef[b]};N.aj=function(a,b){a=b[Sc]();return this.G.Vh[a>=12&&a<24?1:0]};
N.Zi=function(a,b){return Me(b[Sc]()%12||12,a)};N.Xi=function(a,b){return Me(b[Sc]()%12,a)};N.Yi=function(a,b){return Me(b[Sc](),a)};N.kj=function(a,b){b=b.getDay();switch(a){case 5:return this.G.ei[b];case 4:return this.G.hi[b];case 3:return this.G.gi[b];default:return Me(b,1)}};N.lj=function(a,b){b=b[Ta]();switch(a){case 5:return this.G.di[b];case 4:return this.G.ci[b];case 3:return this.G.fi[b];default:return Me(b+1,a)}};N.ij=function(a,b){b=r[qb](b[Ta]()/3);return a<4?this.G.bi[b]:this.G.$h[b]};
N.bj=function(a,b){return Me(b[Cb](),a)};N.gj=function(a,b){return Me(b[Tc](),a)};N.jj=function(a,b){return Me(b[ob](),a)};N.mj=function(a,b,c){return a<4?c.Fj(b):c.zj(b)};N.nj=function(a,b,c){return a<4?c.Hj(b):c.Cj(b)};var ch="G",dh="y",eh="k",fh="E",gh="a",hh="h",ih="K",jh="H",kh="c",lh="L",mh="Q",nh="d",oh="m",ph="s",qh="v",rh="z",sh="Z";
N.ej=function(a,b,c,e,f){var g=a[u];switch(a.charAt(0)){case ch:return this.dj(g,c);case dh:return this.pj(g,c);case Ng:return this.hj(g,c);case eh:return this.$i(g,e);case Pg:return this.fj(g,e);case fh:return this.cj(g,c);case gh:return this.aj(g,e);case hh:return this.Zi(g,e);case ih:return this.Xi(g,e);case jh:return this.Yi(g,e);case kh:return this.kj(g,c);case lh:return this.lj(g,c);case mh:return this.ij(g,c);case nh:return this.bj(g,c);case oh:return this.gj(g,e);case ph:return this.jj(g,
e);case qh:return f.Mh;case rh:return this.nj(g,b,f);case sh:return this.mj(g,b,f);default:return R}};function th(a,b,c){var e=new Zg;e.Zd(a);return e.C(b,c)};function uh(a,b,c,e){this.top=a;this.right=b;this.bottom=c;ua(this,e)}va(uh[v],function(){return new uh(this.top,this[id],this[zc],this[D])});var vh="t, ",wh="r, ",xh="b, ",yh="l)";na(uh[v],function(){return ae+this.top+vh+this[id]+wh+this[zc]+xh+this[D]+yh});Da(uh[v],function(a){a=!this||!a?k:a instanceof uh?a[D]>=this[D]&&a[id]<=this[id]&&a.top>=this.top&&a[zc]<=this[zc]:a.x>=this[D]&&a.x<=this[id]&&a.y>=this.top&&a.y<=this[zc];return a});
function zh(a,b){if(a==b)return h;if(!a||!b)return k;return a.top==b.top&&a[id]==b[id]&&a[zc]==b[zc]&&a[D]==b[D]};function Ah(a,b,c,e){ua(this,a);this.top=b;ra(this,c);Ha(this,e)}va(Ah[v],function(){return new Ah(this[D],this.top,this[w],this[K])});var Bh=" - ",Ch="w x ",Dh="h)";na(Ah[v],function(){return ae+this[D]+be+this.top+Bh+this[w]+Ch+this[K]+Dh});Ah[v].qk=function(a){var b=r.max(this[D],a[D]),c=r.min(this[D]+this[w],a[D]+a[w]);if(b<=c){var e=r.max(this.top,a.top);a=r.min(this.top+this[K],a.top+a[K]);if(e<=a){ua(this,b);this.top=e;ra(this,c-b);Ha(this,a-e);return h}}return k};
Da(Ah[v],function(a){return a instanceof Ah?this[D]<=a[D]&&this[D]+this[w]>=a[D]+a[w]&&this.top<=a.top&&this.top+this[K]>=a.top+a[K]:a.x>=this[D]&&a.x<=this[D]+this[w]&&a.y>=this.top&&a.y<=this.top+this[K]});if("StopIteration"in O)var Eh=O.StopIteration;else Eh=l("StopIteration");function Fh(){}Fh[v].Hk=function(){d(Eh)};Fh[v].ki=function(){return this};function Gh(a){if(typeof a.Ta==wd)return a.Ta();if(Ed(a))return a[pb](R);if(Ad(a)){for(var b=[],c=a[u],e=0;e<c;e++)b[t](a[e]);return b}return he(a)}function Hh(a){if(typeof a.lb==wd)return a.lb();if(typeof a.Ta==wd)return undefined;if(Ad(a)||Ed(a)){var b=[];a=a[u];for(var c=0;c<a;c++)b[t](c);return b}return ie(a)}function Ih(a,b,c){if(typeof a[sc]==wd)a[sc](b,c);else if(Ad(a)||Ed(a))Pd(a,b,c);else for(var e=Hh(a),f=Gh(a),g=f[u],j=0;j<g;j++)b[H](c,f[j],e&&e[j],a)};function Jh(a){this.ka={};this.l=[];var b=arguments[u];if(b>1){if(b%2)d(l(pe));for(var c=0;c<b;c+=2)this.A(arguments[c],arguments[c+1])}else a&&this.li(a)}N=Jh[v];N.q=0;N.ab=0;N.Ta=function(){this.Sc();for(var a=[],b=0;b<this.l[u];b++){var c=this.l[b];a[t](this.ka[c])}return a};N.lb=function(){this.Sc();return this.l[xb]()};N.Na=function(a){return Kh(this.ka,a)};Ea(N,function(){this.ka={};oa(this.l,0);this.ab=this.q=0});
N.remove=function(a){if(Kh(this.ka,a)){delete this.ka[a];this.q--;this.ab++;this.l[u]>2*this.q&&this.Sc();return h}return k};N.Sc=function(){if(this.q!=this.l[u]){for(var a=0,b=0;a<this.l[u];){var c=this.l[a];if(Kh(this.ka,c))this.l[b++]=c;a++}oa(this.l,b)}if(this.q!=this.l[u]){var e={};for(b=a=0;a<this.l[u];){c=this.l[a];if(!Kh(e,c)){this.l[b++]=c;e[c]=1}a++}oa(this.l,b)}};N.S=function(a,b){if(Kh(this.ka,a))return this.ka[a];return b};
N.A=function(a,b){if(!Kh(this.ka,a)){this.q++;this.l[t](a);this.ab++}this.ka[a]=b};N.li=function(a){var b;if(a instanceof Jh){b=a.lb();a=a.Ta()}else{b=ie(a);a=he(a)}for(var c=0;c<b[u];c++)this.A(b[c],a[c])};va(N,function(){return new Jh(this)});N.ki=function(a){this.Sc();var b=0,c=this.l,e=this.ka,f=this.ab,g=this,j=new Fh;j.Hk=function(){for(;1;){if(f!=g.ab)d(l("The map has changed since the iterator was created"));if(b>=c[u])d(Eh);var n=c[b++];return a?n:e[n]}};return j};
function Kh(a,b){return ja[v][Mb][H](a,b)};var Lh="window.location.href",Mh="Unknown error",Oh="Not available",Ph="Message: ",Qh='\nUrl: <a href="view-source:',Rh='" target="_new">',Sh="</a>\nLine: ",Th="\n\nBrowser stack:\n",Uh="-> ",Vh="[end]\n\nJS stack traversal:\n",Wh="Exception trying to expose exception! You win, we lose. ";
function Xh(a,b){try{var c;a=a;var e=nd(Lh);c=typeof a==Dd?{message:a,name:Mh,lineNumber:Oh,fileName:e,stack:Oh}:!a.lineNumber||!a[Uc]||!a.stack?{message:a[Lb],name:a[Qc],lineNumber:a.lineNumber||a.line||Oh,fileName:a[Uc]||a.filename||a.sourceURL||e,stack:a.stack||Oh}:a;var f=Ph+Ee(c[Lb])+Qh+c[Uc]+Rh+c[Uc]+Sh+c.lineNumber+Th+Ee(c.stack+Uh)+Vh+Ee(Yh(b)+Uh);return f}catch(g){return Wh+g}}function Yh(a){return Zh(a||arguments.callee.caller,[])}
var $h="[...circular reference...]",ai="true",bi="false",ci="[fn]",di="...",ei=")\n",fi="[exception trying to get caller]\n",gi="[...long stack...]",hi="[end]";
function Zh(a,b){var c=[];if(Sd(b,a))c[t]($h);else if(a&&b[u]<50){c[t](ii(a)+ae);for(var e=a.arguments,f=0;f<e[u];f++){f>0&&c[t](be);var g;g=e[f];switch(typeof g){case qd:g=g?qd:xd;break;case Dd:g=g;break;case P:g=ha(g);break;case ug:g=g?ai:bi;break;case wd:g=(g=ii(g))?g:ci;break;case "undefined":default:g=typeof g;break}if(g[u]>40)g=g[hd](0,40)+di;c[t](g)}b[t](a);c[t](ei);try{c[t](Zh(a.caller,b))}catch(j){c[t](fi)}}else a?c[t](gi):c[t](hi);return c[L](R)}var ji="[Anonymous]";
function ii(a){a=ha(a);if(!ki[a]){var b=/function ([^\(]+)/[eb](a);if(b){b=b[1];ki[a]=b}else ki[a]=ji}return ki[a]}var ki={};function li(a,b,c,e,f){this.Hm=typeof f==P?f:mi++;this.Jm=e||Nd();this.Xb=a;this.Fk=b;this.zm=c}li[v].Ui=i;li[v].Ti=i;var mi=0;li[v].Al=function(a){this.Ui=a};li[v].Bl=function(a){this.Ti=a};li[v].wh=function(a){this.Xb=a};li[v].getMessage=function(){return this.Fk};function ni(a){this.Gk=a;this.R=i;this.J={};this.zg=[]}ni[v].Xb=i;function oi(a,b){this.name=a;this.value=b}na(oi[v],function(){return this[Qc]});new oi("OFF",Infinity);new oi("SHOUT",1200);new oi("SEVERE",1000);var pi=new oi("WARNING",900);new oi("INFO",800);var qi=new oi("CONFIG",700),ri=new oi("FINE",500);new oi("FINER",400);var si=new oi("FINEST",300);new oi("ALL",0);N=ni[v];N.wh=function(a){this.Xb=a};N.Ke=function(a){if(this.Xb)return a[Db]>=this.Xb[Db];if(this.R)return this.R.Ke(a);return k};
N.log=function(a,b,c){this.Ke(a)&&this.Ak(this.Bj(a,b,c))};N.Bj=function(a,b,c){var e=new li(a,ha(b),this.Gk);if(c){e.Al(c);e.Bl(Xh(c,arguments.callee.caller))}return e};N.Xl=function(a,b){this.log(pi,a,b)};N.da=function(a,b){this.log(ri,a,b)};N.le=function(a,b){this.log(si,a,b)};N.Ak=function(a){if(this.Ke(a.Xb))for(var b=this;b;){b.Ai(a);b=b.R}};N.Ai=function(a){for(var b=0;b<this.zg[u];b++)this.zg[b](a)};N.Gl=function(a){this.R=a};N.mi=function(a,b){this.J[a]=b};var ti={},ui=i;
function vi(a){if(!ui){ui=new ni(R);ti[R]=ui;ui.wh(qi)}return a in ti?ti[a]:wi(a)}function wi(a){var b=new ni(a),c=a[pb](md),e=c[c[u]-1];oa(c,c[u]-1);c=c[L](md);c=vi(c);c.mi(e,b);b.Gl(c);return ti[a]=b};function xi(){}xi[v].je=k;xi[v].K=function(){if(!this.je){this.je=h;this.g()}};xi[v].g=function(){};function yi(a,b){xi[H](this);this.Sg=b;this.ib=[];this.Ki(a)}Q(yi,xi);N=yi[v];N.ee=i;N.ie=i;N.Hc=function(a){this.ee=a};N.th=function(a){this.ie=a};N.Da=function(){if(this.ib[u])return this.ib.pop();return this.Vf()};N.tb=function(a){this.ib[u]<this.Sg?this.ib[t](a):this.bg(a)};N.Ki=function(a){if(a>this.Sg)d(l("[goog.structs.SimplePool] Initial cannot be greater than max"));for(var b=0;b<a;b++)this.ib[t](this.Vf())};N.Vf=function(){return this.ee?this.ee():{}};
N.bg=function(a){if(this.ie)this.ie(a);else if(Gd(a.K))a.K();else for(var b in a)delete a[b]};N.g=function(){yi.b.g[H](this);for(var a=this.ib;a[u];)this.bg(a.pop());delete this.ib};function zi(a,b){Ca(this,a);wa(this,b);ta(this,this[F])}Q(zi,xi);N=zi[v];N.g=function(){delete this[I];delete this[F];delete this.currentTarget};N.Za=k;N.bc=h;N.stopPropagation=function(){this.Za=h};N.preventDefault=function(){this.bc=k};function Ai(a,b){a&&this.nd(a,b)}Q(Ai,zi);var Bi=[1,4,2];N=Ai[v];Ca(N,i);wa(N,i);N.relatedTarget=i;N.offsetX=0;N.offsetY=0;Ia(N,0);Ka(N,0);xa(N,0);ya(N,0);N.button=0;Aa(N,0);N.charCode=0;N.ctrlKey=k;N.altKey=k;N.shiftKey=k;N.metaKey=k;N.$=i;var Ci="mouseover",Di="mouseout",Ei="keypress";
N.nd=function(a,b){Ca(this,a[I]);wa(this,a[F]||a.srcElement);ta(this,b);this.relatedTarget=a[db]?a[db]:this[I]==Ci?a.fromElement:this[I]==Di?a.toElement:i;this.offsetX=typeof a.layerX==P?a.layerX:a.offsetX;this.offsetY=typeof a.layerY==P?a.layerY:a.offsetY;Ia(this,typeof a[ed]==P?a[ed]:a.pageX);Ka(this,typeof a[fd]==P?a[fd]:a.pageY);xa(this,a[Yb]||0);ya(this,a[Zb]||0);this.button=a[Jb];Aa(this,a[nc]||0);this.charCode=a[fc]||(this[I]==Ei?a[nc]:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=
a[Jc];this.metaKey=a.metaKey;this.$=a;delete this.bc;delete this.Za};var Fi="click";N.Ie=function(a){return S?this[I]==Fi?a==0:!!(this.$[Jb]&Bi[a]):this.$[Jb]==a};N.stopPropagation=function(){this.Za=h;if(this.$[Bb])this.$[Bb]();else this.$.cancelBubble=h};N.preventDefault=function(){this.bc=k;if(this.$[Gb])this.$[Gb]();else{this.$.returnValue=k;try{Aa(this.$,-1)}catch(a){}}};N.g=function(){Ai.b.g[H](this);this.$=i};function Gi(){}var Hi=0;N=Gi[v];N.ja=0;N.ac=k;N.Pf=k;var Ii="Invalid listener argument";N.nd=function(a,b,c,e,f,g){if(Gd(a))this.Lg=h;else if(a&&a[Ec]&&Gd(a[Ec]))this.Lg=k;else d(l(Ii));this.Yb=a;this.Rk=b;this.src=c;Ca(this,e);this.lc=!!f;this.hd=g;this.Pf=k;this.ja=++Hi;this.ac=k};Ba(N,function(a){if(this.Lg)return this.Yb[H](this.hd||this.src,a);return this.Yb[Ec][H](this.Yb,a)});var Ji={},Ki={},Li={},Mi=new yi(0,600);Mi.Hc(function(){return{q:0,la:0}});Mi.th(function(a){a.q=0});var Ni=new yi(0,600);Ni.Hc(function(){return[]});Ni.th(function(a){oa(a,0);delete a.Bc;delete a.Se});var Oi=new yi(0,600);Oi.Hc(function(){function a(b){return Pi[H](a.src,a.ja,b)}return a});function Qi(){return new Gi}var Ri=new yi(0,600);Ri.Hc(Qi);function Si(){return new Ai}var Ti,Ui=i;if(S){Ui=new yi(0,600);Ui.Hc(Si)}Ti=Ui;var Vi="on",Wi=Vi,Xi={};
function Yi(a,b,c,e,f){if(b)if(zd(b)){for(var g=0;g<b[u];g++)Yi(a,b[g],c,e,f);return i}else{e=!!e;var j=Ki;b in j||(j[b]=Mi.Da());j=j[b];if(!(e in j)){j[e]=Mi.Da();j.q++}j=j[e];var n=Hd(a),s;j.la++;if(j[n]){s=j[n];for(g=0;g<s[u];g++){j=s[g];if(j.Yb==c&&j.hd==f){if(j.ac)break;return s[g].ja}}}else{s=j[n]=Ni.Da();j.q++}g=Oi.Da();g.src=a;j=Ri.Da();j.nd(c,g,a,b,e,f);c=j.ja;g.ja=c;s[t](j);Ji[c]=j;Li[n]||(Li[n]=Ni.Da());Li[n][t](j);if(a[yc]){if(a==O||!a.Wf)a[yc](b,g,e)}else a.attachEvent(Zi(b),g);return c}else d(l("Invalid event type"))}
function $i(a,b,c,e,f){if(zd(b)){for(var g=0;g<b[u];g++)$i(a,b[g],c,e,f);return i}e=!!e;a=aj(a,b,e);if(!a)return k;for(g=0;g<a[u];g++)if(a[g].Yb==c&&a[g].lc==e&&a[g].hd==f)return bj(a[g].ja);return k}function bj(a){if(!Ji[a])return k;var b=Ji[a];if(b.ac)return k;var c=b.src,e=b[I],f=b.Rk,g=b.lc;if(c[nb]){if(c==O||!c.Wf)c[nb](e,f,g)}else c.detachEvent&&c.detachEvent(Zi(e),f);c=Hd(c);f=Ki[e][g][c];if(Li[c]){var j=Li[c];Td(j,b);j[u]==0&&delete Li[c]}b.ac=h;f.Se=h;cj(e,g,c,f);delete Ji[a];return h}
function cj(a,b,c,e){if(!e.Bc)if(e.Se){for(var f=0,g=0;f<e[u];f++)if(e[f].ac)Ri.tb(e[f]);else{if(f!=g)e[g]=e[f];g++}oa(e,g);e.Se=k;if(g==0){Ni.tb(e);delete Ki[a][b][c];Ki[a][b].q--;if(Ki[a][b].q==0){Mi.tb(Ki[a][b]);delete Ki[a][b];Ki[a].q--}if(Ki[a].q==0){Mi.tb(Ki[a]);delete Ki[a]}}}}
function dj(a,b,c){var e=0,f=a==i,g=b==i,j=c==i;c=!!c;if(f)ge(Li,function(s){for(var A=s[u]-1;A>=0;A--){var B=s[A];if((g||b==B[I])&&(j||c==B.lc)){bj(B.ja);e++}}});else{a=Hd(a);if(Li[a]){a=Li[a];for(f=a[u]-1;f>=0;f--){var n=a[f];if((g||b==n[I])&&(j||c==n.lc)){bj(n.ja);e++}}}}return e}function aj(a,b,c){var e=Ki;if(b in e){e=e[b];if(c in e){e=e[c];a=Hd(a);if(e[a])return e[a]}}return i}function Zi(a){if(a in Xi)return Xi[a];return Xi[a]=Wi+a}
function ej(a,b,c,e,f){var g=1;b=Hd(b);if(a[b]){a.la--;a=a[b];if(a.Bc)a.Bc++;else a.Bc=1;try{for(var j=a[u],n=0;n<j;n++){var s=a[n];if(s&&!s.ac)g&=fj(s,f)!==k}}finally{a.Bc--;cj(c,e,b,a)}}return Boolean(g)}function fj(a,b){b=a[Ec](b);a.Pf&&bj(a.ja);return b}var gj="window.event";
function Pi(a,b){if(!Ji[a])return h;a=Ji[a];var c=a[I],e=Ki;if(!(c in e))return h;e=e[c];var f,g;if(S){f=b||nd(gj);b=h in e;var j=k in e;if(b){if(f[nc]<0||f.returnValue!=undefined)return h;a:{var n=f,s=k;if(n[nc]==0)try{Aa(n,-1);break a}catch(A){s=h}if(s||n.returnValue==undefined)n.returnValue=h}}n=Ti.Da();n.nd(f,this);f=h;try{if(b){for(var B=Ni.Da(),M=n.currentTarget;M;M=M[Rc])B[t](M);g=e[h];g.la=g.q;for(var G=B[u]-1;!n.Za&&G>=0&&g.la;G--){ta(n,B[G]);f&=ej(g,B[G],c,h,n)}if(j){g=e[k];g.la=g.q;for(G=
0;!n.Za&&G<B[u]&&g.la;G++){ta(n,B[G]);f&=ej(g,B[G],c,k,n)}}}else f=fj(a,n)}finally{if(B){oa(B,0);Ni.tb(B)}n.K();Ti.tb(n)}return f}g=new Ai(b,this);try{f=fj(a,g)}finally{g.K()}return f};function hj(){}Q(hj,xi);N=hj[v];N.Wf=h;N.sd=i;N.kf=function(a){this.sd=a};N.addEventListener=function(a,b,c,e){Yi(this,a,b,c,e)};N.removeEventListener=function(a,b,c,e){$i(this,a,b,c,e)};
N.dispatchEvent=function(a){a=a;if(Ed(a))a=new zi(a,this);else if(a instanceof zi)wa(a,a[F]||this);else{var b=a;a=new zi(a[I],this);oe(a,b)}b=1;var c,e=a[I],f=Ki;if(e in f){f=f[e];e=h in f;var g;if(e){c=[];for(g=this;g;g=g.sd)c[t](g);g=f[h];g.la=g.q;for(var j=c[u]-1;!a.Za&&j>=0&&g.la;j--){ta(a,c[j]);b&=ej(g,c[j],a[I],h,a)&&a.bc!=k}}if(g=k in f){g=f[k];g.la=g.q;if(e)for(j=0;!a.Za&&j<c[u]&&g.la;j++){ta(a,c[j]);b&=ej(g,c[j],a[I],k,a)&&a.bc!=k}else for(c=this;!a.Za&&c&&g.la;c=c.sd){ta(a,c);b&=ej(g,c,
a[I],k,a)&&a.bc!=k}}a=Boolean(b)}else a=h;return a};N.g=function(){hj.b.g[H](this);dj(this);this.sd=i};var ij=/^(?:([^:\/?#]+):)?(?:\/\/(?:([^\/?#]*)@)?([^\/?#:@]*)(?::([0-9]+))?)?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;function jj(a){return a[$b](ij)}function kj(a,b){a=jj(a);b=jj(b);return a[3]==b[3]&&a[1]==b[1]&&a[4]==b[4]}var lj=/#|$/;function mj(a,b){var c;if(a instanceof mj){this.fc(b==i?a.ta:b);this.Id(a.wa);this.Jd(a.Ab);this.Bd(a.fb);this.Gd(a.Ya);this.Fd(a.ua);this.lf(a.X[Wb]());this.Cd(a.hb)}else if(a&&(c=jj(ha(a)))){this.fc(!!b);this.Id(c[1]||R,h);this.Jd(c[2]||R,h);this.Bd(c[3]||R,h);this.Gd(c[4]);this.Fd(c[5]||R,h);this[Rb](c[6]||R,h);this.Cd(c[7]||R,h)}else{this.fc(!!b);this.X=new nj(i,this,this.ta)}}N=mj[v];N.wa=R;N.Ab=R;N.fb=R;N.Ya=i;N.ua=R;N.hb=R;N.tk=k;N.ta=k;var oj="//",pj="?",qj="#";
na(N,function(){if(this.ga)return this.ga;var a=[];this.wa&&a[t](rj(this.wa,sj),Eg);if(this.fb){a[t](oj);this.Ab&&a[t](rj(this.Ab,sj),qg);a[t](tj(this.fb));this.Ya!=i&&a[t](Eg,ha(this.Ya))}this.ua&&a[t](rj(this.ua,uj));var b=ha(this.X);b&&a[t](pj,b);this.hb&&a[t](qj,rj(this.hb,vj));return this.ga=a[L](R)});var wj="/",xj="..",yj="./",Aj="/.";
N.cl=function(a){var b=this[Wb](),c=a.dk();if(c)b.Id(a.wa);else c=a.fk();if(c)b.Jd(a.Ab);else c=a.Ag();if(c)b.Bd(a.fb);else c=a.bk();var e=a.ua;if(c)b.Gd(a.Ya);else if(c=a.Bg()){if(e.charAt(0)!=wj)if(this.Ag()&&!this.Bg())e=wj+e;else{var f=b.ua.lastIndexOf(wj);if(f!=-1)e=b.ua[hd](0,f+1)+e}f=e;if(f==xj||f==md)e=R;else if(!Ke(f,yj)&&!Ke(f,Aj))e=f;else{e=f[y](wj)==0;f=f[pb](wj);for(var g=[],j=0;j<f[u];){var n=f[j++];if(n==md)e&&j==f[u]&&g[t](R);else if(n==xj){if(g[u]>1||g[u]==1&&g[0]!=R)g.pop();e&&j==
f[u]&&g[t](R)}else{g[t](n);e=h}}e=g[L](wj)}}if(c)b.Fd(e);else c=a.ck();if(c)b[Rb](a.wj());else c=a.ak();c&&b.Cd(a.hb);return b};va(N,function(){var a;a=this.wa;var b=this.Ab,c=this.fb,e=this.Ya,f=this.ua,g=this.X[Wb](),j=this.hb,n=new mj(i,this.ta);a&&n.Id(a);b&&n.Jd(b);c&&n.Bd(c);e&&n.Gd(e);f&&n.Fd(f);g&&n.lf(g);j&&n.Cd(j);return a=n});N.Id=function(a,b){this.Oa();delete this.ga;if(this.wa=b?Bj(a):a)this.wa=this.wa[x](/:$/,R);return this};N.dk=function(){return!!this.wa};
N.Jd=function(a,b){this.Oa();delete this.ga;this.Ab=b?Bj(a):a;return this};N.fk=function(){return!!this.Ab};N.Bd=function(a,b){this.Oa();delete this.ga;this.fb=b?Bj(a):a;return this};N.Ag=function(){return!!this.fb};N.Gd=function(a){this.Oa();delete this.ga;if(a){a=ia(a);if(ma(a)||a<0)d(l("Bad port number "+a));this.Ya=a}else this.Ya=i;return this};N.bk=function(){return this.Ya!=i};N.Fd=function(a,b){this.Oa();delete this.ga;this.ua=b?Bj(a):a;return this};N.Bg=function(){return!!this.ua};
N.ck=function(){return this.X[Sa]()!==R};N.lf=function(a,b){this.Oa();delete this.ga;if(a instanceof nj){this.X=a;this.X.uf=this;this.X.fc(this.ta)}else{b||(a=rj(a,Cj));this.X=new nj(a,this,this.ta)}return this};N.setQuery=function(a,b){return this.lf(a,b)};N.yj=function(){return this.X[Sa]()};N.wj=function(){return this.X.Tl()};N.re=function(){return this.yj()};N.yh=function(a,b){this.Oa();delete this.ga;this.X.A(a,b);return this};N.Cd=function(a,b){this.Oa();delete this.ga;this.hb=b?Bj(a):a;return this};
N.ak=function(){return!!this.hb};N.Oa=function(){if(this.tk)d(l("Tried to modify a read-only Uri"))};N.fc=function(a){this.ta=a;this.X&&this.X.fc(a)};function Bj(a){return a?la(a):R}function tj(a){if(Ed(a))return ca(a);return i}var Dj=/^[a-zA-Z0-9\-_.!~*'():\/;?]*$/;function rj(a,b){var c=i;if(Ed(a)){c=a;Dj[ab](c)||(c=encodeURI(a));if(c.search(b)>=0)c=c[x](b,Ej)}return c}var Fj="%";function Ej(a){a=a[wc](0);return Fj+(a>>4&15)[Sa](16)+(a&15)[Sa](16)}
var sj=/[#\/\?@]/g,uj=/[\#\?]/g,Cj=/[\#\?@]/g,vj=/#/g;function Gj(a,b){a=jj(a);b=jj(b);return a[3]==b[3]&&a[4]==b[4]}function nj(a,b,c){this.Ba=a||i;this.uf=b||i;this.ta=!!c}N=nj[v];var Hj="=";N.Pa=function(){if(!this.s){this.s=new Jh;if(this.Ba)for(var a=this.Ba[pb](Ae),b=0;b<a[u];b++){var c=a[b][y](Hj),e=i,f=i;if(c>=0){e=a[b][Cc](0,c);f=a[b][Cc](c+1)}else e=a[b];e=ve(e);e=this.kb(e);this.add(e,f?ve(f):R)}}};N.s=i;N.q=i;
N.add=function(a,b){this.Pa();this.yc();a=this.kb(a);if(this.Na(a)){var c=this.s.S(a);zd(c)?c[t](b):this.s.A(a,[c,b])}else this.s.A(a,b);this.q++;return this};N.remove=function(a){this.Pa();a=this.kb(a);if(this.s.Na(a)){this.yc();var b=this.s.S(a);if(zd(b))this.q-=b[u];else this.q--;return this.s.remove(a)}return k};Ea(N,function(){this.yc();this.s&&this.s.clear();this.q=0});N.Na=function(a){this.Pa();a=this.kb(a);return this.s.Na(a)};
N.lb=function(){this.Pa();for(var a=this.s.Ta(),b=this.s.lb(),c=[],e=0;e<b[u];e++){var f=a[e];if(zd(f))for(var g=0;g<f[u];g++)c[t](b[e]);else c[t](b[e])}return c};N.Ta=function(a){this.Pa();if(a){a=this.kb(a);if(this.Na(a)){var b=this.s.S(a);if(zd(b))return b;else{a=[];a[t](b)}}else a=[]}else{b=this.s.Ta();a=[];for(var c=0;c<b[u];c++){var e=b[c];zd(e)?Vd(a,e):a[t](e)}}return a};
N.A=function(a,b){this.Pa();this.yc();a=this.kb(a);if(this.Na(a)){var c=this.s.S(a);if(zd(c))this.q-=c[u];else this.q--}this.s.A(a,b);this.q++;return this};N.S=function(a,b){this.Pa();a=this.kb(a);if(this.Na(a)){a=this.s.S(a);return zd(a)?a[0]:a}else return b};
na(N,function(){if(this.Ba)return this.Ba;if(!this.s)return R;for(var a=[],b=0,c=this.s.lb(),e=0;e<c[u];e++){var f=c[e],g=te(f);f=this.s.S(f);if(zd(f))for(var j=0;j<f[u];j++){b>0&&a[t](Ae);a[t](g,Hj,te(f[j]));b++}else{b>0&&a[t](Ae);a[t](g,Hj,te(f));b++}}return this.Ba=a[L](R)});N.Tl=function(){if(!this.Eb)this.Eb=Bj(this[Sa]());return this.Eb};N.yc=function(){delete this.Eb;delete this.Ba;this.uf&&delete this.uf.ga};
va(N,function(){var a=new nj;if(this.Eb)a.Eb=this.Eb;if(this.Ba)a.Ba=this.Ba;if(this.s)a.s=this.s[Wb]();return a});N.kb=function(a){a=ha(a);if(this.ta)a=a[dd]();return a};N.fc=function(a){var b=a&&!this.ta;if(b){this.Pa();this.yc();Ih(this.s,function(c,e){var f=e[dd]();if(e!=f){this.remove(e);this.add(f,c)}},this)}this.ta=a};function Ij(){hj[H](this)}var Jj,Kj;Q(Ij,hj);var Lj=h;if(o[Fb]&&(o[Fb].hash[y]("xdrp")==1||o[Fb].search[y]("xdrp")==1))if(S)p.execCommand("Stop");else if(ff)o[Pa]();else d(l("stopped"));var Mj="complete",Nj="ready";function Oj(a,b,c,e,f){var g=new Ij;b&&Yi(g,Mj,b);Yi(g,Nj,g.reset);g.jl(a,c,e,f)}var Pj=vi("goog.net.CrossDomainRpc"),Qj='<textarea name="',Rj='">',Sj="</textarea>";function Tj(a,b){return Qj+a+Rj+(b&&(Ed(b)||b[yb]==ha)?b[x](/&/g,we):b)+Sj}var Uj="link",Vj="stylesheet",Wj="img",Xj="/robots.txt";
function Yj(){if(Jj)return Jj;if(ff)for(var a=p[cd](Uj),b=0;b<a[u];b++){var c=a[b];if(c.rel==Vj&&Gj(c[Bc],o[Fb][Bc])&&c[Bc][y](pj)<0)return c[Bc][pb](qj)[0]}a=p[cd](Wj);for(b=0;b<a[u];b++){c=a[b];if(Gj(c.src,o[Fb][Bc])&&c.src[y](pj)<0)return c.src[pb](qj)[0]}if(!Lj)d(l("No suitable dummy resource specified or detected for this page"));if(S)return o[Fb][Bc][pb](qj)[0];else{b=o[Fb][Bc];a=b[y](wj,b[y](oj)+2);b=b[Cc](0,a);return b+Xj}}
var Zj=0,$j="iframe",ak="xdrq-",bk="absolute",ck="-5000px",dk="xdpe:request-id",ek="dummyUri: ",fk="xdpe:dummy-uri",gk="xdp:",hk="xdh:",ik='<body><form method="',jk="GET",kk="POST",lk='" action="',mk="</form></body>",nk="load",ok="response ready";
Ij[v].jl=function(a,b,c,e){var f=this.Fc=p[jc]($j),g=Zj++;f.id=ak+g;if(!Kj){f[Ob].position=bk;f[Ob].top=ck;ua(f[Ob],ck)}p[Tb][Ma](f);var j=[];j[t](Tj(dk,g));g=Yj();Pj.log(ri,ek+g);j[t](Tj(fk,g));if(c)for(var n in c){g=c[n];j[t](Tj(gk+n,g))}if(e)for(n in e){g=e[n];j[t](Tj(hk+n,g))}a=ik+(b==jk?jk:kk)+lk+a+Rj+j[L](R)+mk;b=dg(f);b[Za]();b.write(a);b.close();b.forms[0].submit();b=i;this.zk=Yi(f,nk,function(){Pj.log(ri,ok);this.dl=h},k,this);this.Sk()};
Ij[v].Sk=function(){this.Lh=0;var a=o.setInterval(Ld(function(){this.Oi(a)},this),50)};var pk="xd response ready",qk="n",rk="xd response number of chunks: ",sk="xd response iframe not ready",tk="chunk",uk="status",vk="isDataJson",wk="headers",xk="xd response timed out",yk="response timed out",zk="error";
Ij[v].Oi=function(a){var b=this.Fc.contentWindow,c=b.frames[u],e=i;if(c>0&&Ak(e=b.frames[c-1])){Pj.log(ri,pk);c=Bk(e)[Cc](1);c=new nj(c);e=[];var f=ia(c.S(qk));Pj.log(ri,rk+f);for(var g=0;g<f;g++){var j=b.frames[g];if(!j||!j[Fb]||!j[Fb][Bc]){Pj.log(ri,sk);return}j=Bk(j);var n=j[y](tk)+5+1;j=j[Cc](n);e[t](j)}o.clearInterval(a);a=e[L](R);S||(a=la(a));this.status=ia(c.S(uk));this.responseText=a;this.Cm=c.S(vk)==ai;a=c.S(wk);this.xd=a=eval(ae+a+ce);this[z](Nj);this[z](Mj)}else if(this.dl){this.Lh+=50;
if(this.Lh>500){Pj.log(ri,xk);o.clearInterval(a);this.status=500;this.responseText=yk;this[z](Nj);this[z](zk);this[z](Mj)}}};var Ck="xdrp-info";function Ak(a){try{return Bk(a)[y](Ck)==1}catch(b){return k}}function Bk(a){a=a[Fb][Bc];var b=a[y](pj),c=a[y](qj);b=b<0?c:c<0?b:r.min(b,c);return a[Cc](b)}Ij[v].Me=function(){switch(this[ac]){case 200:case 304:return h;default:return k}};var Dk="request frame removed: ";Ij[v].reset=function(){if(!Kj){Pj.log(ri,Dk+this.Fc.id);bj(this.zk);this.Fc[Rc][Vb](this.Fc)}delete this.Fc};
Ij[v].getResponseHeader=function(a){return Cd(this.xd)?this.xd[a]:undefined};var Ek=p.referrer,Fk=Ek[y](pj);if(Fk>0)Ek=Ek[Cc](0,Fk);var Gk=Ek[y](qj);if(Gk>0)Ek=Ek[Cc](0,Gk);function Hk(a,b){hj[H](this);this.xc=a||1;this.Kc=b||Ik;this.$d=Ld(this.Ol,this);this.Oe=Nd()}Q(Hk,hj);Hk[v].qc=k;var Ik=O.window,Jk=0.8;N=Hk[v];N.Y=i;N.setInterval=function(a){this.xc=a;if(this.Y&&this.qc){this[Pa]();this.start()}else this.Y&&this[Pa]()};N.Ol=function(){if(this.qc){var a=Nd()-this.Oe;if(a>0&&a<this.xc*Jk)this.Y=this.Kc[kb](this.$d,this.xc-a);else{this.Pi();if(this.qc){this.Y=this.Kc[kb](this.$d,this.xc);this.Oe=Nd()}}}};var Kk="tick";N.Pi=function(){this[z](Kk)};
N.start=function(){this.qc=h;if(!this.Y){this.Y=this.Kc[kb](this.$d,this.xc);this.Oe=Nd()}};N.stop=function(){this.qc=k;if(this.Y){this.Kc[fb](this.Y);this.Y=i}};N.g=function(){Hk.b.g[H](this);this[Pa]();delete this.Kc};function Lk(a,b,c){if(Gd(a)){if(c)a=Ld(a,c)}else if(a&&typeof a[Ec]==wd)a=Ld(a[Ec],a);else d(l(Ii));return b>2147483647?-1:Ik[kb](a,b||0)};function Mk(){if(ff){this.eb={};this.Sd={};this.Kd=[]}}N=Mk[v];N.Q=vi("goog.net.xhrMonitor");var Nk="Pushing context: ",Ok=" (";N.hh=function(a){if(ff){var b=Ed(a)?a:Cd(a)?Hd(a):R;this.Q.le(Nk+a+Ok+b+ce);this.Kd[t](b)}};var Pk="Popping context: ";N.fh=function(){if(ff){var a=this.Kd.pop();this.Q.le(Pk+a);this.Vl(a)}};var Qk="Opening XHR : ";N.Dk=function(a){if(ff){a=Hd(a);this.Q.da(Qk+a);for(var b=0;b<this.Kd[u];b++){var c=this.Kd[b];this.Oc(this.eb,c,a);this.Oc(this.Sd,a,c)}}};var Rk="Closing XHR : ";
N.Ck=function(a){if(ff){a=Hd(a);this.Q.da(Rk+a);delete this.Sd[a];for(var b in this.eb){Td(this.eb[b],a);this.eb[b][u]==0&&delete this.eb[b]}}};var Sk="Updating dependent contexts";N.Vl=function(a){var b=this.Sd[a],c=this.eb[a];if(b&&c){this.Q.le(Sk);Pd(b,function(e){Pd(c,function(f){this.Oc(this.eb,e,f);this.Oc(this.Sd,f,e)},this)},this)}};N.Oc=function(a,b,c){a[b]||(a[b]=[]);Sd(a[b],c)||a[b][t](c)};var Tk=new Mk;function Uk(){return Vk()}var Vk=i,Wk=i,Xk=i;function Yk(){var a=Zk();return a?new ActiveXObject(a):new XMLHttpRequest}function $k(){var a=Zk(),b={};if(a){b[0]=h;b[1]=h}return b}var al=$k;Vk=Yk;Wk=al;var bl=Xk=i,cl="MSXML2.XMLHTTP.6.0",dl="MSXML2.XMLHTTP.3.0",el="MSXML2.XMLHTTP",fl="Microsoft.XMLHTTP";
function Zk(){if(!bl&&typeof XMLHttpRequest=="undefined"&&typeof ActiveXObject!="undefined"){for(var a=[cl,dl,el,fl],b=0;b<a[u];b++){var c=a[b];try{new ActiveXObject(c);return bl=c}catch(e){}}d(l("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed"))}return bl};function gl(){hj[H](this);this.headers=new Jh}Q(gl,hj);gl[v].Q=vi("goog.net.XhrIo");var hl=[];function il(a,b,c,e,f,g){var j=new gl;hl[t](j);b&&Yi(j,Mj,b);Yi(j,Nj,Md(jl,j));g&&j.Ll(g);j[cc](a,c,e,f)}function kl(){for(var a=hl;a[u];)a.pop().K()}function ll(a,b){gl[v].Te=a.Am(gl[v].Te,b)}function jl(a){a.K();Td(hl,a)}N=gl[v];N.xa=k;N.o=i;N.Rd=i;N.Og=R;N.Mg=R;N.zc=0;N.Wa=R;N.ke=k;N.ld=k;N.Ge=k;N.qb=k;N.Jc=0;N.zb=i;N.Ll=function(a){this.Jc=r.max(0,a)};
var ml="Opening Xhr",nl="Error opening Xhr: ",ol="Content-Type",pl="application/x-www-form-urlencoded;charset=utf-8",ql="Will abort after ",rl="ms if incomplete",sl="Sending request",tl="Send error: ";
za(N,function(a,b,c,e){if(this.xa)d(l("[goog.net.XhrIo] Object is active with another request"));b=b||jk;this.Og=a;this.Wa=R;this.zc=0;this.Mg=b;this.ke=k;this.xa=h;this.o=new Uk;this.Rd=Xk||(Xk=Wk());Tk.Dk(this.o);this.o.onreadystatechange=Ld(this.Xg,this);try{this.Q.da(this.Ca(ml));this.Ge=h;this.o[Za](b,a,h);this.Ge=k}catch(f){this.Q.da(this.Ca(nl+f[Lb]));this.lg(5,f);return}a=c||R;var g=this.headers[Wb]();e&&Ih(e,function(n,s){g.A(s,n)});b==kk&&!g.Na(ol)&&g.A(ol,pl);Ih(g,function(n,s){this.o.setRequestHeader(s,
n)},this);try{if(this.zb){Ik[fb](this.zb);this.zb=i}if(this.Jc>0){this.Q.da(this.Ca(ql+this.Jc+rl));this.zb=Ik[kb](Ld(this.Ql,this),this.Jc)}this.Q.da(this.Ca(sl));this.ld=h;this.o[cc](a);this.ld=k}catch(j){this.Q.da(this.Ca(tl+j[Lb]));this.lg(5,j)}});N.dispatchEvent=function(a){if(this.o){Tk.hh(this.o);try{gl.b[z][H](this,a)}finally{Tk.fh()}}else gl.b[z][H](this,a)};var ul="Timed out after ",vl="ms, aborting",wl="timeout";
N.Ql=function(){if(typeof kd!="undefined")if(this.o){this.Wa=ul+this.Jc+vl;this.zc=8;this.Q.da(this.Ca(this.Wa));this[z](wl);this[ib](8)}};N.lg=function(a,b){this.xa=k;if(this.o){this.qb=h;this.o[ib]();this.qb=k}this.Wa=b;this.zc=a;this.ag();this.Rc()};N.ag=function(){if(!this.ke){this.ke=h;this[z](Mj);this[z](zk)}};var xl="Aborting",yl="abort";N.abort=function(a){if(this.o){this.Q.da(this.Ca(xl));this.xa=k;this.qb=h;this.o[ib]();this.qb=k;this.zc=a||7;this[z](Mj);this[z](yl);this.Rc()}};
N.g=function(){if(this.o){if(this.xa){this.xa=k;this.qb=h;this.o[ib]();this.qb=k}this.Rc(h)}gl.b.g[H](this)};N.Xg=function(){!this.Ge&&!this.ld&&!this.qb?this.Te():this.Wg()};N.Te=function(){this.Wg()};var zl="Local request error detected and ignored",Al="readystatechange",Bl="Request complete",Cl="success",Dl=" [";
N.Wg=function(){if(this.xa)if(typeof kd!="undefined")if(this.Rd[1]&&this.vc()==4&&this.bd()==2)this.Q.da(this.Ca(zl));else if(this.ld&&this.vc()==4)Ik[kb](Ld(this.Xg,this),0);else{this[z](Al);if(this.Hg()){this.Q.da(this.Ca(Bl));this.xa=k;if(this.Me()){this[z](Mj);this[z](Cl)}else{this.zc=6;this.Wa=this.Ij()+Dl+this.bd()+rg;this.ag()}this.Rc()}}};
N.Rc=function(a){if(this.o){this.o.onreadystatechange=this.Rd[0]?od:i;var b=this.o;this.Rd=this.o=i;if(this.zb){Ik[fb](this.zb);this.zb=i}if(!a){Tk.hh(b);this[z](Nj);Tk.fh()}Tk.Ck(b)}};N.ia=function(){return this.xa};N.Hg=function(){return this.vc()==4};N.Me=function(){switch(this.bd()){case 0:case 200:case 204:case 304:return h;default:return k}};N.vc=function(){return this.o?this.o.readyState:0};var El="Can not get status: ";
N.bd=function(){try{return this.vc()>2?this.o[ac]:-1}catch(a){this.Q.Xl(El+a[Lb]);return-1}};N.Ij=function(){try{return this.vc()>2?this.o[Oa]:R}catch(a){this.Q.da(El+a[Lb]);return R}};N.Gj=function(){return this.o?this.o[rb]:R};N.getResponseHeader=function(a){return this.o&&this.Hg()?this.o.getResponseHeader(a):undefined};N.Aj=function(){return Ed(this.Wa)?this.Wa:ha(this.Wa)};N.Ca=function(a){return a+Dl+this.Mg+ue+this.Og+ue+this.bd()+rg};var Fl=gl;za(Fl,il);Fl.rm=kl;Fl.Bm=ll;Fl.sm=jl;Fl.am=ol;Fl.fm=pl;Fl.Fm=hl;var Gl="head",Hl="html",Il="body",Jl="text/javascript";function Kl(a){var b;if(p[cd](Gl)[u]==0){b=p[cd](Hl)[0];var c=p[cd](Il)[0],e=p[jc](Gl);b[Ib](e,c)}b=p[cd](Gl)[0];c=p[jc](Pf);Ca(c,Jl);c.src=a;b[Ma](c)}function Ll(a){var b=a[y](pj);if(b>0)a=a[Cc](0,b);b=a[y](qj);if(b>0)a=a[Cc](0,b);return a}function Ml(a){return function(b){ka[Kb][Nc].Ec(a);var c=b[gc]();c&&ka[Kb][Nc].Hf(a,b);return!c}};var Nl=/^Date\([\d\,\s]*\)$/,Ol="column",Pl="desc";function Ql(a,b,c){if(typeof b!=qd||!(Ol in b))d(l(c+' must have a property "column"'));else if(Pl in b&&typeof b.desc!=ug)d(l('Property "desc" in '+c+" must be boolean."));T(a,b.column)}var Rl="sortColumns[",Sl="Column index ",Tl=" is duplicate in sortColumns.",Ul="sortColumns";
function Vl(a,b){if(typeof b==P){T(a,b);return[{column:b}]}else if(typeof b==qd)if(b[yb]==Array){if(b[u]<1)d(l("sortColumn is an empty array. Must have at least one element."));var c={};if(typeof b[0]==qd){for(var e=0;e<b[u];e++){Ql(a,b[e],Rl+e+rg);var f=b[e].column;if(f in c)d(l(Sl+f+Tl));c[f]=h}return b}else if(typeof b[0]==P){var g=[];for(e=0;e<b[u];e++){T(a,b[e]);if(b[e]in c)d(l(Sl+f+Tl));c[f]=h;g[t]({column:b[e]})}return g}else d(l("sortColumns is an array, but neither of objects nor of numbers. Must be either of those."))}else{Ql(a,
b,Ul);return[b]}}var Wl="Date(";function Xl(a){a=a;a=a[ub]()!==0?[a[qc](),a[Ta](),a[Cb](),a[Sc](),a[Tc](),a[ob](),a[ub]()]:a[ob]()!==0||a[Tc]()!==0||a[Sc]()!==0?[a[qc](),a[Ta](),a[Cb](),a[Sc](),a[Tc](),a[ob]()]:[a[qc](),a[Ta](),a[Cb]()];return a=Wl+a[L](be)+ce}function Yl(a,b){a=a[Va]();if(r[qb](b)!==b||b<0||b>=a)d(l("Invalid row index "+b+". Should be in the range [0-"+(a-1)+"]."))}
function T(a,b){a=a[Ab]();if(r[qb](b)!==b||b<0||b>=a)d(l("Invalid column index "+b+". Should be an integer in the range [0-"+(a-1)+"]."))}var Zl="date",$l="datetime",am="timeofday";
function bm(a,b,c){if(c!=i){a=a[oc](b);var e=typeof c;switch(a){case P:if(e==P)return;break;case Dd:if(e==Dd)return;break;case ug:if(e==ug)return;break;case Zl:case $l:if(e==qd&&c[yb]==Date)return;break;case am:if(e==qd&&c[yb]==Array&&c[u]>=3&&c[u]<=4){e=h;for(var f=0;f<c[u];f++){var g=c[f];if(typeof g!=P||g!=r[qb](g)){e=k;break}}if(c[0]<0||c[0]>23||c[1]<0||c[1]>59||c[2]<0||c[2]>59)e=k;if(c[u]==4&&(c[3]<0||c[3]>999))e=k;if(e)return}break}d(l("Type mismatch. Value "+c+" does not match type "+a+" in column index "+
b))}}function cm(a,b,c){if(b==i&&c==i)return 0;else if(b==i)return-1;else if(c==i)return 1;switch(a){case ug:case P:case Dd:case Zl:case $l:return b<c?-1:c<b?1:0;case am:for(a=0;a<3;a++)if(b[a]<c[a])return-1;else if(c[a]<b[a])return 1;b=b[u]<4?0:b[3];c=c[u]<4?0:c[3];return b<c?-1:c<b?1:0}}
function dm(a,b){T(a,b);var c=a[oc](b),e=i,f=i,g,j,n=a[Va]();for(g=0;g<n;g++){j=a[J](g,b);if(j!=i){f=e=j;break}}if(e==i)return{min:i,max:i};for(g++;g<n;g++){j=a[J](g,b);if(j!=i)if(cm(c,j,e)<0)e=j;else if(cm(c,f,j)<0)f=j}return{min:e,max:f}}function em(a,b){b=Vl(a,b);for(var c=[],e=a[Va](),f=0;f<e;f++)c[t](f);Yd(c,function(g,j){for(var n=0;n<b[u];n++){var s=b[n].column,A=b[n].desc?-1:1;s=cm(a[oc](s),a[J](g,s),a[J](j,s));if(s!=0)return s*A}return 0});return c}
function fm(a,b){T(a,b);if(a[Va]()==0)return[];var c=em(a,[{column:b}]),e=a[oc](b),f=[],g=a[J](c[0],b);f[t](g);for(var j=1;j<c[u];j++){var n=a[J](c[j],b);cm(e,n,g)!=0&&f[t](n);g=n}return f}function gm(a,b,c){for(var e=0;e<b[u];e++){var f=b[e],g=f.column,j=a[J](c,g);g=a[oc](g);if(f.minValue!=i||f.maxValue!=i){if(j==i)return k;if(f.minValue!=i&&cm(g,j,f.minValue)<0)return k;if(f.maxValue!=i&&cm(g,j,f.maxValue)>0)return k}else if(cm(g,j,f[Db])!=0)return k}return h}
var hm="value",im="minValue",jm="maxValue",km="columnFilters[";
function lm(a,b){var c=a,e=b;if(typeof e!=qd||e[yb]!=Array||e[u]<1)d(l("columnFilters must be a non-empty array"));for(var f={},g=0;g<e[u];g++){if(typeof e[g]!=qd||!(Ol in e[g]))if(hm in e[g]||im in e[g]||jm in e[g]){if(hm in e[g]&&(im in e[g]||jm in e[g]))d(l(km+g+'] must specify either "value" or range properties ("minValue" and/or "maxValue"'))}else d(l(km+g+'] must have properties "column" and "value", "minValue"or "maxValue"'));var j=e[g].column;if(j in f)d(l(Sl+j+" is duplicate in columnFilters."));
T(c,j);bm(c,j,e[g][Db]);f[j]=h}c=[];e=a[Va]();for(f=0;f<e;f++)gm(a,b,f)&&c[t](f);return c}function mm(a,b){if(b==am){b=[];a=a;b[t](a[0]);var c=(a[1]<10?Le:R)+a[1];b[t](c);c=(a[2]<10?Le:R)+a[2];b[t](c);b=b[L](Eg);if(a[u]>3&&a[3]>0)b+=md+(a[3]<10?Ag:a[3]<100?Le:R)+a[3]}else b=b==Zl?th(2,a):b==$l?th(10,a):ha(a);return b};var nm="0.5",om="0.6";function U(a,b){this.ab=b?b==nm?nm:om:om;if(a){if(Ed(a))a=sg(a);this.r=a.cols;this.t=a.rows;this.na=a.p||i}else{this.r=[];this.t=[];this.na=i}Jg(Lg,Ig())||Mg(Qg,Ig())}var pm={$l:ug,hm:P,jm:Dd,bm:Zl,km:am,cm:$l};N=U[v];N.r=i;N.ab=i;N.t=i;N.na=i;N.getNumberOfRows=function(){return this.t[u]};N.getNumberOfColumns=function(){return this.r[u]};
va(N,function(){var a=new U(i,this.ab);a.r=[];a.t=[];var b=this.na;if(b)a.na=me(b);for(b=0;b<this.r[u];b++){var c=this.r[b],e=me(c);if(c=c.p)e.p=me(c);a.r[t](e)}for(e=0;e<this.t[u];e++){c=this.t[e];var f;f={};f.c=[];var g=c.c;for(b=0;b<g[u];b++){var j=g[b],n=me(j);if(j)if(j=j.p)n.p=me(j);f.c[t](n);if(n=c.p)f.p=me(n)}a.t[t](f)}return a});N.getColumnId=function(a){T(this,a);return this.r[a].id};N.getColumnIndex=function(a){for(var b=this.r,c=0;c<b[u];c++)if(b[c].id==a)return c;return-1};
N.getColumnLabel=function(a){T(this,a);return this.r[a][Vc]};N.getColumnPattern=function(a){T(this,a);return this.r[a].pattern};N.getColumnType=function(a){T(this,a);return a=this.r[a][I]};var qm="new ";Fa(N,function(a,b){Yl(this,a);T(this,b);a=this.Kb(a,b);var c=i;if(a){c=typeof a.v!="undefined"?a.v:i;b=this[oc](b);if(b===Zl||b===$l)if(Ed(c)){b=c;if(Nl[ab](b))b=eval(qm+b);else d(l("Invalid date: "+b));c=b;a.v=c}}return c});N.Kb=function(a,b){return this.t[a].c[b]};
N.getFormattedValue=function(a,b){Yl(this,a);T(this,b);a=this.Kb(a,b);var c=R;if(a)if(typeof a.f!="undefined"&&a.f!=i)c=a.f;else if(typeof a.v!="undefined"&&a.v!=i)return mm(a.v,this[oc](b));return c};N.getProperty=function(a,b,c){Yl(this,a);T(this,b);return(a=(a=this.Kb(a,b))&&a.p)&&c in a?a[c]:i};N.getProperties=function(a,b){Yl(this,a);T(this,b);var c=this.Kb(a,b);if(!c){c={v:i,f:i};this.t[a].c[b]=c}c.p||(c.p={});return c.p};N.cd=function(){return this.na};
N.dd=function(a){var b=this.na;return b&&a in b?b[a]:i};N.Jl=function(a){this.na=a};N.Kl=function(a,b){if(!this.na)this.na={};this.na[a]=b};pa(N,function(a,b,c){this[Pc](a,b,c,undefined,undefined)});N.setFormattedValue=function(a,b,c){this[Pc](a,b,undefined,c,undefined)};N.setProperties=function(a,b,c){this[Pc](a,b,undefined,undefined,c)};N.setProperty=function(a,b,c,e){a=this[Ya](a,b);a[c]=e};
N.setCell=function(a,b,c,e,f){Yl(this,a);T(this,b);var g=this.Kb(a,b);if(!g){g={};this.t[a].c[b]=g}if(typeof c!="undefined"){bm(this,b,c);g.v=c}if(typeof e!="undefined")g.f=e;if(typeof f!="undefined")g.p=f};N.setRowProperties=function(a,b){Yl(this,a);a=this.t[a];a.p=b};N.setRowProperty=function(a,b,c){a=this[Fc](a);a[b]=c};N.getRowProperty=function(a,b){if((a=this[Fc](a))&&b in a)return a[b]};N.getRowProperties=function(a){Yl(this,a);a=this.t[a];a.p||(a.p={});return a.p};
N.setColumnLabel=function(a,b){T(this,a);a=this.r[a];a.label=b};N.setColumnProperties=function(a,b){T(this,a);a=this.r[a];a.p=b};N.setColumnProperty=function(a,b,c){a=this[Qb](a);a[b]=c};N.getColumnProperty=function(a,b){return(a=this[Qb](a))&&b in a?a[b]:i};N.getColumnProperties=function(a){T(this,a);a=this.r[a];a.p||(a.p={});return a.p};
N.insertColumn=function(a,b,c,e){a!==this.r[u]&&T(this,a);c=c||R;e=e||R;if(!je(pm,b))d(l("Invalid type: "+b+md));this.r[Wc](a,0,{id:e,label:c,pattern:R,type:b});for(b=0;b<this.t[u];b++)this.t[b].c[Wc](a,0,{v:i,f:i})};N.addColumn=function(a,b,c){this.insertColumn(this.r[u],a,b,c);return this.r[u]-1};
N.Mk=function(a,b){var c={};if(yd(b)==qd&&!Bd(b)){c.v=typeof b.v=="undefined"?i:b.v;var e=typeof b.f;if(e=="undefined"||e==xd)c.f=i;else if(e==Dd)c.f=b.f;else d(l("Formatted value ('f'), if specified, must be a string."));e=typeof b.p;if(e==qd)c.p=b.p;else if(e!=xd&&e!="undefined")d(l("Properties ('p'), if specified, must be an Object."))}else{c.v=b!=i?b:i;c.f=i}bm(this,a,c.v);return c};
N.insertRows=function(a,b){a!==this.t[u]&&Yl(this,a);var c;if(typeof b==qd&&b[yb]==Array)c=b;else if(typeof b==P){if(b!=r[qb](b)||b<0)d(l("Invalid value for numOrArray: "+b+". If numOrArray is a number it should be a nonnegative integer."));b=b;c=[];for(var e=0;e<b;e++)c[e]=i;c=c}else d(l("Invalid value for numOrArray. Should be a number or an array of arrays of cells."));b=[];for(e=0;e<c[u];e++){var f=c[e],g=[];if(f===i)for(f=0;f<this.r[u];f++)g[t]({v:i,f:i});else if(zd(f)){f=f;if(f[u]!=this.r[u])d(l("Row given with size different than "+
this.r[u]+" (the number of columns in the table)."));for(var j=0;j<f[u];j++)g[t](this.Mk(j,f[j]))}else d(l("Every row given must be either null or an array."));f={};f.c=g;b[t](f)}c=b;Md(Wd,this.t,a,0)[Ic](i,c);return a+b[u]-1};N.addRows=function(a){if(typeof a==P||typeof a==qd&&a[yb]==Array)return this.insertRows(this.t[u],a);else d(l("Argument given to addRows must be either a number or an array"))};
N.addRow=function(a){if(typeof a==qd&&a[yb]==Array)return this.addRows([a]);else if(typeof a=="undefined"||a==i)return this.addRows(1);else d(l("If argument is given to addRow, it must be an array, or null"))};N.getColumnRange=function(a){return dm(this,a)};N.getSortedRows=function(a){return em(this,a)};
N.sort=function(a){a=Vl(this,a);Yd(this.t,Ld(function(b,c){for(var e=0;e<a[u];e++){var f=a[e].column,g=a[e].desc?-1:1,j=b.c[f]?b.c[f].v:i,n=c.c[f]?c.c[f].v:i;f=cm(this[oc](f),j,n);if(f!=0)return f*g}return 0},this))};N.toJSON=function(){for(var a=0;a<this[Ab]();a++){var b=this[oc](a);if(b==$l||b==Zl)for(b=0;b<this[Va]();b++){var c=this.Kb(b,a),e=c.v;if(Bd(e))c.v=Xl(e)}}return(new tg).df({cols:this.r,rows:this.t,p:this.na})};N.getDistinctValues=function(a){return fm(this,a)};
N.getFilteredRows=function(a){return lm(this,a)};N.removeRows=function(a,b){if(!(b<=0)){Yl(this,a);if(a+b>this.t[u])b=this.t[u]-a;this.t[Wc](a,b)}};N.removeRow=function(a){this.removeRows(a,1)};N.removeColumns=function(a,b){if(!(b<=0)){T(this,a);if(a+b>this.r[u])b=this.r[u]-a;this.r[Wc](a,b);for(var c=0;c<this.t[u];c++)this.t[c].c[Wc](a,b)}};N.removeColumn=function(a){this.removeColumns(a,1)};function rm(a){this.oh=sm(a);this.Vc=a[ac];this.Qa=[];this.bb=[];this.bb=a.warnings||[];this.Qa=a[Nc]||[];tm(this.bb);tm(this.Qa);if(this.Vc!=zk){this.Bh=a.sig;this.h=new U(a.table,this.oh)}}function tm(a){for(var b=0;b<a[u];b++){var c=a[b].detailed_message;if(c)a[b].detailed_message=um(c)}}var vm=/^[^<]*(<a(( )+target=('_blank')?("_blank")?)?( )+(href=('[^']*')?("[^"]*")?)>[^<]*<\/a>[^<]*)*$/,wm=/javascript((s)?( )?)*:/;
function um(a){if(!a)return R;return a[$b](vm)&&!a[$b](wm)?a:a[x](/&/g,we)[x](/</g,xe)[x](/>/g,ye)[x](/\"/g,ze)}function sm(a){a=a.version||om;return je(xm,a)?a:om}var xm={lm:nm,mm:om};N=rm[v];N.Bh=i;N.h=i;N.isError=function(){return this.Vc==zk};var ym="warning";N.hasWarning=function(){return this.Vc==ym};N.Uf=function(a){for(var b=0;b<this.Qa[u];b++)if(this.Qa[b].reason==a)return h;for(b=0;b<this.bb[u];b++)if(this.bb[b].reason==a)return h;return k};N.getDataTable=function(){return this.h};
N.oe=function(a){if(this[gc]()&&this.Qa&&this.Qa[0]&&this.Qa[0][a])return this.Qa[0][a];if(this.hasWarning()&&this.bb&&this.bb[0]&&this.bb[0][a])return this.bb[0][a];return i};var zm="reason";N.getReasons=function(){var a=this.oe(zm);return a!=i&&a!=R?[a]:[]};var Am="message";N.getMessage=function(){return this.oe(Am)||R};var Bm="detailed_message";N.getDetailedMessage=function(){return this.oe(Bm)||R};var Cm="auto";function V(a,b){this.za=a;b=b||{};this.cf=b.sendMethod||Cm;if(!je(Dm,this.cf))d(l("Send method not supported: "+this.cf));this.Rg=b.makeRequestParams_||{};if(/spreadsheets/[ab](a)||/\.corp\.google\.com:4040/[ab](a)){this.Zk();this.al()}this.uk=/spreadsheets.google.com\/a\/.*\/tq\?.*/[ab](this.za)||/.*corp.google.com:4040\/a\/.*\/tq\?.*/[ab](this.za);this.Ze=Em++;Fm[t](this)}
var Gm="xhr",Hm="makeRequest",Dm={om:Gm,im:"scriptInjection",gm:Hm,Zl:Cm},Im=new Jh({"X-DataSource-Auth":gh}),Em=0,Jm={};V[v].Nh=30;var Fm=[],Km=O.gadgets;function Lm(){for(var a=0;a<Fm[u];a++){var b=Fm[a];b.Xe&&b.dc()}}var Mm="/tq?",Nm="/tq?pub=1&";V[v].al=function(){var a=this.za;if(/.google\.com(:4040)?(\/a\/.*)?\/ccc\?.*key=/[ab](a))a=a[x](/\/ccc\?/,Mm);else if(/.google\.com(:4040)?(\/a\/.*)?\/pub\?.*key=/[ab](a))a=a[x](/\/pub\?/,Nm);this.za=a};var Om="spreadsheets.google.com";
V[v].Zk=function(){var a=this.za;a=a[x](/spreadsheets[0-9]\.google\.com/,Om);this.za=a=a[x](/spreadsheets\.google\.com:433/,Om)};var Pm="JavaScript",Qm="var _et_ = 1;";
function Rm(a){if(a[F].Me()){a=re(a[F].Gj());if(a[$b](/^({.*})$/)){a=eval(ae+a+ce);Sm(a)}else{a=a;if(O.execScript)O.execScript(a,Pm);else if(O.eval){if(ld==i){O.eval(Qm);if(typeof O._et_!="undefined"){delete O._et_;ld=h}else ld=k}if(ld)O.eval(a);else{var b=O[mb],c=b[jc](Pf);Ca(c,Jl);c.defer=k;c[Ma](b[zb](a));b[Tb][Ma](c);b[Tb][Vb](c)}}else d(l("goog.globalEval not available"))}}else d(l("google.visualization.Query: "+a[F].Aj()))}
function Sm(a){sm(a);var b=a.reqId,c=Jm[b];if(c){Jm[b]=i;c.gd(a)}else d(l("Missing query for request id: "+b))}N=V[v];N.wd=i;N.vd=i;N.Nd=i;N.Fa=i;N.Ae=i;N.Sb=i;N.Xe=h;N.We=0;N.Ng=i;N.ia=k;N.zh=function(a){if(typeof a!=P||a<0)d(l("Refresh interval must be a non-negative number"));this.We=a;this.mh()};N.ce=function(){if(this.Nd){o[fb](this.Nd);this.Nd=i}};var Tm="Request timed out";N.Pl=function(){var a=wl,b=Tm;this.gf(a,b)};
N.gf=function(a,b,c){a={version:om,status:zk,errors:[{reason:a,message:b,detailed_message:c}]};this.gd(a)};var Um="reqId:",Vm=";sig:",Wm=";type:",Xm=";";
N.Jf=function(a){var b={};if(this.Fa)b.tq=ha(this.Fa);var c=Um+ha(this.Ze),e=this.Ng;if(e)c+=Vm+e;if(this.Ae)c+=Wm+this.Ae;b.tqx=c;if(this.Sb){c=[];for(var f in this.Sb)c[t](f+Eg+this.Sb[f]);b.tqh=c[L](Xm)}var g;f=a;b=b;a=f[y](qj);if(a!=-1)f=f[Cc](0,a);c=f[y](pj);e=a=R;e=[];if(c==-1)a=f;else{a=f[Cc](0,c);e=f[Cc](c+1);e=e[pb](Ae)}f=[];for(c=0;c<e[u];c++){var j=e[c][pb](Hj),n={};n.name=j[0];n.Ue=e[c];f[t](n)}for(g in b){e=b[g];j=k;for(c=0;c<f[u];c++)if(f[c][Qc]==g){f[c].Ue=g+Hj+ca(e);j=h;break}if(!j){c=
{};c.name=g;c.Ue=g+Hj+ca(e);f[t](c)}}g=a;if(f[u]>0){g+=pj;b=[];for(c=0;c<f[u];c++)b[t](f[c].Ue);g+=b[L](Ae)}return g=g};var Ym="gadgets.io.makeRequest",Zm="none",$m="&requireauth=1&";
N.dc=function(){var a=this.Jf(this.za);Jm[ha(this.Ze)]=this;var b=this.cf;if(b==Cm)b=an(a);if(b==Hm)if(nd(Ym))this.il(a,this.Rg);else d(l("gadgets.io.makeRequest is not defined."));else if(b==Gm||b==Cm&&kj(O[Fb][Bc],(new mj(O[Fb][Bc])).cl(new mj(a))[Sa]()))Fl[cc](a,Rm,jk,i,Im);else{b=p[cd](Il)[0];if(this.uk){var c=this,e=p[jc](Wj);e.onerror=function(){c.Yd(a)};e.onload=function(){c.Yd(a)};Ga(e[Ob],Zm);var f=a+$m+(new Date)[Xc]();e.src=f;b[Ma](e)}else this.Yd(a)}};var bn="tqrt";
function an(a){if(/[?&]alt=gviz(&[^&]*)*$/[ab](a))a=Hm;else{a=a;var b=bn,c=a.search(lj),e;b:{e=a;for(var f=b,g=c,j=0,n=f[u];(j=e[y](f,j))>=0&&j<g;){var s=e[wc](j-1);if(s==38||s==63){s=e[wc](j+n);if(!s||s==61||s==38||s==35){e=j;break b}}j+=n+1}e=-1}if(e<0)a=i;else{f=a[y](Ae,e);if(f<0||f>c)f=c;e+=b[u]+1;a=ve(a[hd](e,f-e))}a=a||Cm;je(Dm,a)||(a=Cm)}return a}N=V[v];
N.il=function(a,b){var c=Km;if(b[c.io[tb].CONTENT_TYPE]==i)b[c.io[tb].CONTENT_TYPE]=c.io.ContentType.TEXT;if(b[c.io[tb].AUTHORIZATION]==i)b[c.io[tb].AUTHORIZATION]=c.io.AuthorizationType.SIGNED;if(b.OAUTH_ENABLE_PRIVATE_NETWORK==i)b.OAUTH_ENABLE_PRIVATE_NETWORK=h;if(b.OAUTH_ADD_EMAIL==i)b.OAUTH_ADD_EMAIL=h;c.io.makeRequest(a,Ld(this.Uj,this),b);this.pf()};var cn="make_request_failed",dn="gadgets.io.makeRequest failed";
N.Uj=function(a){if(a!=i&&a.data)eval(a.data);else{var b=cn,c=dn,e=R;if(a&&a[Nc]){a=a[Nc];e=a[L](ue)}this.gf(b,c,e)}};N.Yd=function(a){this.pf();Kl(a);this.mh()};N.pf=function(){var a=this;this.ce();this.Nd=o[kb](function(){a.Pl()},this.Nh*1000)};N.Ih=function(){if(this.vd){o[fb](this.vd);this.vd=i}};N.mh=function(){this.Ih();if(this.We!=0&&this.Xe&&this.ia){var a=this;this.vd=o[kb](function(){a.dc()},this.We*1000)}};za(N,function(a){this.ia=h;this.wd=a;this.dc()});
N.makeRequest=function(a,b){this.ia=h;this.wd=a;this.Gm=Hm;this.Rg=b||{};this.dc()};N.abort=function(){this.ia=k;this.ce();this.Ih()};var en="not_modified";N.gd=function(a){this.ce();a=new rm(a);if(!a.Uf(en)){this.Ng=a[gc]()?i:a.Bh;var b=this.wd;b[H](b,a)}};N.setTimeout=function(a){if(typeof a!=P||ma(a)||a<=0)d(l("Timeout must be a positive number"));this.Nh=a};N.Hl=function(a){if(typeof a!=ug)d(l("Refreshable must be a boolean"));return this.Xe=a};
N.setQuery=function(a){if(typeof a!=Dd)d(l("queryString must be a string"));this.Fa=a};N.Cl=function(a){this.Ae=a;a!=i&&this.vh(If,a)};var fn="\\c",gn="\\s";N.vh=function(a,b){a=a[x](/\\/g,vg);b=b[x](/\\/g,vg);a=a[x](/:/g,fn);b=b[x](/:/g,fn);a=a[x](/;/g,gn);b=b[x](/;/g,gn);if(!this.Sb)this.Sb={};this.Sb[a]=b};var hn="1",jn="google.accounts.user";function kn(a,b){V[H](this,a);this.$e=b||this.za;a:{a=p[cd](Wj);for(b=0;b<a[u];b++){var c=a[b];if(Gj(c.src,o[Fb][Bc])){a=h;break a}}a=k}this.$j=a;this.Cg={"X-If-No-Redirect":hn,"Content-Length":0};if(ln){a=nd(jn);mn=!!(a&&a.login&&a.logout&&a[dc]);ln=k}}Q(kn,V);var ln=h,mn=k;N=kn[v];N.ol=(new Date)[Xc]()+Ug+(r[qb](r.random()*899)+100);N.login=function(a){if(!this.wf())return R;a=a||this.$e;return ka.accounts.user.login(Ll(a))};
N.logout=function(a){if(!this.wf())return k;return ka.accounts.user.logout(a)};N.checkLogin=function(a){if(!this.wf())return R;a=a||this.$e;return ka.accounts.user[dc](Ll(a))};var nn="cannot perfrom authentication - missing auth lib.";N.wf=function(){if(mn)return h;else if(this.ia){this.Ib(nn);return k}else d(l(nn))};var on="An image of the same domain is required on this page for authenticated reads and all writes.";
za(N,function(a){var b=this.Jf(this.za);Jm[ha(this.Ze)]=this;this.wd=pn(a,this.$e);if(this.$j){a=this.Cg;this.rl(b,a);this.zd(b,this.Cg,h);this.pf()}else this.Ib(on)});var qn="failure status code ",rn="unknown failure";N.fl=function(a){if(a&&a[ac]&&a[ac]<300){a=a[rb];yd(a)==Dd&&/version:/[ab](a)&&/reqId:/[ab](a)?eval(a):this.Ib(a)}else{a=a&&a[ac]?qn+a[ac]:rn;this.Ib(a)}};var sn=" Root cause: HTTP error ",tn=" with status text of: ",un="authsub failed",vn="authsub query failed";
N.Ib=function(a){var b=R;if(a instanceof l){b=a[Lb]?Ph+a[Lb]:R;if(a.be){var c=a.be[ac];a=a.be[Oa];b+=sn+c+tn+a}}else if(yd(a)==Dd)b=ha(a);this.gf(un,vn,b)};var wn="X-Redirect-Location",xn="Location",yn="Invalid Feed Type",zn="OK",An="Authorization required";
N.zd=function(a,b,c){var e;this.kl(a,b,Ld(function(f){if(f[ac]<300)this.fl(f);else if(c&&f[ac]==412){e=f.getResponseHeader(wn);this.zd(e,b,k)}else if(c&&f[ac]==302){e=f.getResponseHeader(xn);this.zd(e,b,k)}else if(c&&f[ac]==500){e=a;this.zd(e,b,k)}else if(f[ac]==400&&f[rb]==yn)this.Ib(f[rb]);else{var g=f[Oa];if(f[ac]==401&&f[Oa]==zn)g=An;g=l(g);g.be=f;if(f.xd)g.Im=f.xd[ol];this.Ib(g)}},this))};
var Bn="user_not_authenticated",Cn="google.accounts.user.login('",Dn="');",En='<a href="#" onclick="',Fn='">login</a>';function pn(a,b){var c=Bn,e=R;if(mn){b=Ll(b);e=Cn+b+Dn;var f=En+e+Fn}return function(g){if(g[gc]()&&g.Uf(c)&&e){g={version:g.oh,status:g.Vc,errors:[{reason:c,message:g[Nb](),detailed_message:R}]};g=new rm(g);g.getDetailedMessage=function(){return f};a(g)}else a(g)}}var Gn="AuthSub token=";kn[v].rl=function(a,b){if(a=this[dc](a))b.Authorization=Gn+a};
var Hn="json-xd",In="user-agent",Jn="X-HTTP-Method-Override";kn[v].kl=function(a,b,c){var e=Kn(this.ol),f=this.Ok(a);f.alt=Hn;f[In]=e;b[Jn]=jk;Oj(a,function(g){if(g[F][ac]<300)if(/^[\s\xa0]*$/[ab](g[F][rb]))g[F].responseText=i;if(!g[F][Oa])g[F].statusText=g[F][rb];c(g[F])},kk,f,b)};kn[v].Ok=function(a){var b={};a=a instanceof mj?a[Wb]():new mj(a,undefined);a=a.X;for(var c=a.lb(),e=0;e<c[u];e++){var f=c[e],g=a.Ta(f);b[f]=g&&g[u]>0?g[0]:i}return b};
var Ln="google.visualization",Mn=" GData-JavaScript/",Nn="dev";function Kn(a){var b=Ln;return ca(b+Mn+(O.GData_API_Version||Nn)+ue+a)};function On(a,b){this.x=a;this.y=b}new On(0,0);na(On[v],function(){return ae+this.x+be+this.y+ce});var Pn="px";function Qn(a,b,c,e){ra(this,a);Ha(this,b);this.Mm=c||Pn;this.xm=e||Pn}new Qn(0,0);na(Qn[v],function(){return ae+this[w]+be+this[K]+ce});var Rn=["opera","msie","applewebkit","firefox","camino","mozilla"],Sn=["x11;","macintosh","windows"],Tn="[ /]?([0-9]+(.[0-9]+)?)",Un="intel";
function Vn(a){Ca(this,-1);this.Di=this.ah=-1;this.gl=this.version=0;a=a[dd]();for(var b=0;b<Rn[u];b++){var c=Rn[b];if(a[y](c)!=-1){Ca(this,b);b=new RegExp(c+Tn);if(b[eb](a))this.version=ga(RegExp.$1);break}}for(b=0;b<Sn[u];b++){c=Sn[b];if(a[y](c)!=-1){this.ah=b;break}}if(this.ah==1&&a[y](Un)!=-1)this.Di=0;if(this.sk()&&/\brv:\s*(\d+\.\d+)/[eb](a))this.gl=ga(RegExp.$1)}Vn[v].sk=function(){return this[I]==3||this[I]==5||this[I]==4};var Wn=new Vn(navigator.userAgent);function Xn(a,b){for(var c=a[u],e=0;e<c;++e)b(a[e],e)}function Yn(a,b,c){for(var e in a)if(c||!a[Mb]||a[Mb](e))b(e,a[e])}function Zn(a,b,c,e){c=typeof c!="undefined"&&c!=i?c:0;e=typeof e!="undefined"&&e!=i?e:b[u];for(c=c;c<e;++c)a[t](b[c])}function $n(){return Function[v][H][Ic](Array[v][jb],arguments)}function ao(a){if(!a.T)a.T=new a;return a.T};var bo="blur",co=bo,eo=Fi,fo="dblclick",go=fo,ho="focus",io=ho,jo="unload",ko="focusin",lo=ko,mo="focusout",no=mo;var oo=k;function po(){this.Xa=[]}po[v].removeListener=function(a){var b=a.Fg;if(!(b<0)){var c=this.Xa.pop();if(b<this.Xa[u]){this.Xa[b]=c;c.Dd(b)}a.Dd(-1)}};po[v].ih=function(a){this.Xa[t](a);a.Dd(this.Xa[u]-1)};Ea(po[v],function(){for(var a=0;a<this.Xa[u];++a)this.Xa[a].Dd(-1);this.Xa=[]});function qo(a,b){var c=[];if(a=a.__e_)if(b)a[b]&&Zn(c,a[b]);else Yn(a,function(e,f){Zn(c,f)});return c}
function ro(a,b,c){var e=i,f=a.__e_;if(f){e=f[b];if(!e){e=[];if(c)f[b]=e}}else{e=[];if(c){a.__e_={};a.__e_[b]=e}}return e}function so(a,b){var c=$n(arguments,2);Xn(qo(a,b),function(e){if(oo)e.He(c);else try{e.He(c)}catch(f){}})}function to(){this.Fe=i}to[v].El=function(a){this.Fe=a};to[v].Cc=function(a,b,c,e){return this.Fe?new this.Fe(a,b,c,e):i};function uo(a,b,c,e){var f=this;f.T=a;f.sc=b;f.pb=c;f.Be=i;f.Vk=e;f.Fg=-1;ro(a,b,h)[t](f)}N=uo[v];var vo="javascript:void(0)";
N.Ji=function(){var a=this;return this.Be=function(b){if(!b)b=o.event;if(b&&!b[F])try{wa(b,b.srcElement)}catch(c){}var e=a.He([b]);if(b&&eo==b[I])if((b=b.srcElement)&&Og==b[Kc]&&vo==b[Bc])return k;return e}};
N.remove=function(){var a=this;if(a.T){switch(a.Vk){case 1:a.T[nb](a.sc,a.pb,k);break;case 4:a.T[nb](a.sc,a.pb,h);break;case 2:a.T.detachEvent(Vi+a.sc,a.Be);break;case 3:a.T[Vi+a.sc]=i;break}for(var b=ro(a.T,a.sc),c=a,e=undefined,f=0,g=0;g<b[u];++g)if(b[g]===c||e&&b[g]==c){b[Wc](g--,1);f++}a.T=i;a.pb=i;a.Be=i}};N.Dd=function(a){this.Fg=a};N.He=function(a){if(this.T)return this.pb[Ic](this.T,a)};N.ha=function(){return this.T};ao(to).El(uo);var W={};W.Vd="google-visualization-errors";W.zf=W.Vd+Ug;W.Af=W.Vd+Eg;W.Td=W.Vd+"-all-";W.Ud=W.Af+" container is null";W.Yh="background-color: #c00000; color: white;white-space: nowrap; padding: 2px;";W.ii="background-color: #fff4c2; color: black; white-space: nowrap; padding: 2px; border: 1px solid black;";W.ji="font: normal 0.8em arial,sans-serif; margin-bottom: 5px;";W.ai="font-size: 1.1em; color: #0000cc; font-weight: bold; cursor: pointer; padding-left: 10px; color: black;text-align: right; vertical-align: top;";
W.mg=0;var wo="span",xo="div",yo="padding: 2px",zo="\u00d7";
W.Nc=function(a,b,c,e){if(!W.xf(a))d(l(W.Ud+". message: "+b));c=W.nk(b,c,e);var f=c.errorMessage;b=c.detailedMessage;e=c.options;c=e.showInTooltip!=i?!!e.showInTooltip:h;var g=e[I]==ym?ym:zk,j=g==zk?W.Yh:W.ii;j+=e[Ob]?e[Ob]:R;g=!!e.removable;e=Af();f=e.d(wo,{style:j},e[zb](f));j=W.zf+W.mg++;var n=e.d(xo,{id:j,style:W.ji},f);if(b)if(c)f.title=b;else{c=p[jc](wo);sa(c,b);e[Ma](n,e.d(xo,{style:yo},c))}if(g){b=e.d(wo,{style:W.ai},e[zb](zo));b.onclick=Md(W.yg,n);e[Ma](f,b)}W.oi(a,n);return j};
W.Ec=function(a){if(!W.xf(a))d(l(W.Ud));if(a=W.tg(a,k)){Ga(a[Ob],Zm);Yf(a)}};var Ao=" response is null",Bo="invalid_query";W.Hf=function(a,b){if(!W.xf(a))d(l(W.Ud));if(!b){a=W.Af+Ao;d(l(a))}if(!(b[gc]()||b.hasWarning()))return i;var c=b.getReasons(),e=h;if(b[gc]())e=!(Sd(c,Bn)||Sd(c,Bo));c=b[Nb]();var f=b.getDetailedMessage();e={showInTooltip:e};Ca(e,b[gc]()?zk:ym);return W.Nc(a,c,f,e)};W.Yk=function(a){a=p[sb](a);if(W.Qh(a)){W.yg(a);return h}return k};
W.vj=function(a){a=p[sb](a);if(W.Qh(a))return a[Rc][Rc];return i};W.yg=function(a){var b=a[Rc];$f(a);if(b.childNodes[u]==0)Ga(b[Ob],Zm)};W.Qh=function(a){if(a&&a.id){if(a.id[y](W.zf)==0)var b=a[Rc];if(b&&b.id&&b.id[y](W.Td)==0)if(b[Rc])return h;return k}};W.nk=function(a,b,c){var e=a!=i&&a?a:zk,f=R,g={},j=arguments[u];if(j==2)if(b&&yd(b)==qd)g=b;else f=b!=i?b:f;else if(j==3){f=b!=i?b:f;g=c||{}}e=re(e);f=re(f);return{errorMessage:e,detailedMessage:f,options:g}};
W.xf=function(a){return a!=i&&Cd(a)&&a[lb]>0};var Co="display: none; padding-top: 2px";W.tg=function(a,b){for(var c=a.childNodes,e=i,f=Af(),g=0;g<c[u];g++)if(c[g].id&&c[g].id[y](W.Td)==0){e=c[g];f.removeNode(e);break}if(!e&&b){e=W.Td+W.mg++;e=Rf(xo,{id:e,style:Co},i)}if(e)(b=a[pc])?f.pk(e,b):f[Ma](a,e);return e};var Do="block";W.oi=function(a,b){a=W.tg(a,h);Ga(a[Ob],Do);a[Ma](b)};var Eo={};Eo.addListener=function(a,b,c){a=a;b=b;c=c;c=ao(to).Cc(a,b,c,0);ao(po).ih(c);return c=c};Eo.trigger=function(a,b,c){so(a,b,c)};Eo.pm=function(a,b,c){a=a;b=b;c=c;if(Wn[I]==2&&Wn.version<419.2&&b==go){a[Vi+b]=c;c=ao(to).Cc(a,b,c,3)}else if(a[yc]){var e=k;if(b==lo){b=io;e=h}else if(b==no){b=co;e=h}var f=e?4:1;a[yc](b,c,e);c=ao(to).Cc(a,b,c,f)}else if(a.attachEvent){c=ao(to).Cc(a,b,c,2);a.attachEvent(Vi+b,c.Ji())}else{a[Vi+b]=c;c=ao(to).Cc(a,b,c,3)}if(a!=o||b!=jo)ao(po).ih(c);return a=c};
Eo.removeListener=function(a){a=a;a.remove();ao(po).removeListener(a)};function Y(a,b,c,e){this.ua=a;this.Km=b;this.ym=c;this.Tb=e}Y[v].Ob=function(){return this.Tb};function Fo(a,b){this.Em=a;this.B=b}function Go(a,b,c,e){Fo[H](this,c,e);this.wm=a;this.Lm=b}Q(Go,Fo);var Ho="[_a-z0-9-]+",Io=Ho+"(?::"+Ho+")?",Jo="(?:(?:@)?"+Io+"|\\.|\\.\\.)",Ko="(?:"+Jo+"(?:/"+Jo+")*)?";RegExp("^"+Ko+"$","i");var Lo="atom:feed/atom:entry",Mo="analytics:visits",No="c_visits",Oo="analytics:pageviews",Po="analytics:timeOnSite",Qo="Time on Site",Ro="c_timeOnSite",So="analytics:bounceRate",To="Bounce Rate",Uo="c_bounceRate";
new Go("Google Analytics Visitor Feed",/^http:\/\/www\.google\.com\/analytics\/feeds\/visitor\//,Lo,[new Y("analytics:date/analytics:year",P,"Year","c_year"),new Y("analytics:date/analytics:month",P,"Month","c_month"),new Y("analytics:date/analytics:dayOfMonth",P,"Day","c_day"),new Y("analytics:date/analytics:weekOfYear",P,"Week","c_week"),new Y(Mo,P,"Visits",No),new Y("analytics:visitors",P,"Visitors","c_visitors"),new Y("analytics:newVisitors",P,"New Visitors","c_newVisitors"),new Y(Oo,P,"Pageviews",
"c_pageviews"),new Y(Po,P,Qo,Ro),new Y(So,P,To,Uo)]);var Vo="analytics:pageviewsPerVisit",Wo="Pageviews / Visit",Xo="c_pageviewsPerVisit",Yo="analytics:newVisitPercentage",Zo="c_newVisitPercentage";
new Go("Google Analytics Traffic Source Feed",/^http:\/\/www\.google\.com\/analytics\/feeds\/traffic\//,"atom:feed/atom:entry/analytics:trafficSource",[new Y("../analytics:date/analytics:year",P,"Year","c_year"),new Y("../analytics:date/analytics:month",P,"Month","c_month"),new Y("../analytics:date/analytics:dayOfMonth",P,"Day","c_day"),new Y("../analytics:date/analytics:weekOfYear",P,"Week","c_week"),new Y("@trafficType",Dd,"Traffic Type","c_trafficType"),new Y(Mo,P,"Visits",No),new Y(Vo,P,Wo,Xo),
new Y(Po,P,Qo,Ro),new Y(Yo,P,"New Visitor %",Zo),new Y(So,P,To,Uo)]);new Go("Google Analytics Keywords Overview Feed",/^http:\/\/www\.google\.com\/analytics\/feeds\/keywords\//,Lo,[new Y("analytics:keyword",Dd,"Keyword","c_keyword"),new Y(Mo,P,"Visits",No),new Y(Vo,P,Wo,Xo),new Y(Po,P,Qo,Ro),new Y(Yo,P,"New Visitor %",Zo),new Y(So,P,To,Uo)]);
new Go("Google Analytics Content Overview Feed",/^http:\/\/www\.google\.com\/analytics\/feeds\/content\//,Lo,[new Y("analytics:url",Dd,"URL","c_url"),new Y(Oo,P,"Pageviews","c_pageviews"),new Y("analytics:timeOnPage",P,"Time on Page","c_timeOnPage"),new Y("analytics:uniqueViews",P,"Unique Views","c_uniqueViews"),new Y(So,P,To,Uo),new Y("analytics:exitRate",P,"Exit Rate","c_exitRate"),new Y("analytics:dollarIndex",P,"Dollar Index","c_dollarIndex")]);
new Go("Google Analytics Goal Overview Feed",/^http:\/\/www\.google\.com\/analytics\/feeds\/goals\//,Lo,[new Y("analytics:goal",Dd,"Goal","c_goal"),new Y("analytics:conversions",P,"Conversions","c_conversions"),new Y("analytics:conversionRate",P,"Conversion Rate","c_conversionRate"),new Y("analytics:abandonmentRate",P,"Abandonment Rate","c_abandonmentRate")]);
new Go("Google Trends Query Frequency Feed",/^http:\/\/(?:www|trends)\.google\.com\/trends\/api\/freq\?/,"atom:feed/atom:entry/trends:dp",[new Y("../trends:query",Dd,"Query","c_query"),new Y("../trends:loc",Dd,xn,"c_location"),new Y("@aggval",Dd,"Data Point","c_dataPoint"),new Y(md,P,"Frequency","c_frequency"),new Y("@stderror",Dd,"Standard Error","c_stderror")]);var $o="draw";function ap(a,b,c,e){this.Fa=a;this.Uh=b;this.V=c||{};this.cb=e;this.$f=Ml(this.cb);this.rc=i;if(e)this.rc=this.$f;if(!b||!($o in b)||typeof b[ic]!=wd)d(l("Visualization must have a draw method."))}N=ap[v];N.Yf=i;N.Xf=i;N.h=i;N.xh=function(a){this.V=a||{}};N.draw=function(){this.h&&this.Uh[ic](this.h,this.V)};N.ul=function(a){var b=this.cb;this.rc=a?a:b?(this.rc=this.$f):i};
N.hl=function(){if(!this.rc)d(l("If no container was supplied, a custom error handler must be supplied instead."));var a=this.Fa,b=this;a[cc](function(c){var e=b.Yf;e&&e(c);b.gd(c);(e=b.Xf)&&e(c)})};N.gd=function(a){var b=this.rc;if(b(a)){this.h=a[Eb]();this.Uh[ic](this.h,this.V)}};N.wl=function(a){if(a==i)this.tm=i;else{if(typeof a!=wd)d(l("Custom response handler must be a function."));this.Yf=a}};
N.vl=function(a){if(a!=i){if(typeof a!=wd)d(l("Custom post response handler must be a function."));this.Xf=a}};N.abort=function(){this.Fa[ib]()};function Z(a){this.h=a;var b=[];a=a[Ab]();for(var c=0;c<a;c++)b[t](c);this.B=b;this.Ua=h;this.$a=i}N=Z[v];N.mk=function(){for(var a=[],b=this.h[Va](),c=0;c<b;c++)a[t](c);this.$a=a};N.setColumns=function(a){for(var b=0;b<a[u];b++){var c=a[b];if(Fd(c))T(this.h,c);else if(!Cd(c)||c.calc==i||c[I]==i)d(l('Invalid column input, expected either a number or an object with "calc" and "type" properties.'))}this.B=Kd(a)};
N.Dh=function(a,b){if(zd(a)){if(b!==undefined)d(l("If the first parameter is an array, no second parameter is expected"));for(var c=0;c<a[u];c++)Yl(this.h,a[c]);return Ud(a)}else if(yd(a)==P){if(!yd(b)==P)d(l("If first parameter is a number, second parameter must be specified and be a number."));if(a>b)d(l("The first parameter (min) must be smaller than or equal to the second parameter (max)."));Yl(this.h,a);Yl(this.h,b);var e=[];for(c=a;c<=b;c++)e[t](c);return e}else d(l("First parameter must be a number or an array."))};
N.mf=function(a,b){this.$a=this.Dh(a,b);this.Ua=k};N.getViewColumns=function(){return Kd(this.B)};N.Mj=function(){if(this.Ua){for(var a=[],b=this.h[Va](),c=0;c<b;c++)a[t](c);return a}return Ud(this.$a)};N.gk=function(a){this[Zc](Qd(this.B,function(b){return!Sd(a,b)}))};N.hk=function(a,b){var c=this.Dh(a,b);if(this.Ua){this.mk();this.Ua=k}this.mf(Qd(this.$a,function(e){return!Sd(c,e)}))};N.ug=function(a){return Od(this.B,a)};
N.Lj=function(a){if(this.Ua){if(a<0||a>=this.h[Va]())return-1;return a}return Od(this.$a,a)};N.Jj=function(a){T(this,a);a=this.B[a];return Fd(a)?a:-1};N.mb=function(a){Yl(this,a);return this.Ua?a:this.$a[a]};N.getNumberOfRows=function(){return this.Ua?this.h[Va]():this.$a[u]};N.getNumberOfColumns=function(){return this.B[u]};N.getColumnId=function(a){T(this,a);a=this.B[a];return Fd(a)?this.h.getColumnId(a):a.id};
N.getColumnIndex=function(a){for(var b=0;b<this.B[u];b++){var c=this.B[b];if(Cd(c)&&c.id==a)return b}a=this.h.getColumnIndex(a);return this.ug(a)};N.getColumnLabel=function(a){T(this,a);a=this.B[a];return Fd(a)?this.h[kc](a):a[Vc]};N.getColumnPattern=function(a){T(this,a);return this.h.getColumnPattern(this.B[a])};N.getColumnType=function(a){T(this,a);a=this.B[a];return Fd(a)?this.h[oc](a):a[I]};Fa(N,function(a,b){T(this,b);a=this.mb(a);b=this.B[b];return Fd(b)?this.h[J](a,b):b.calc[H](i,this.h,a)});
N.getFormattedValue=function(a,b){T(this,b);a=this.mb(a);var c=this.B[b];return Cd(c)?mm(this[J](a,b),this[oc](a,b)):this.h[Mc](a,c)};N.getProperty=function(a,b,c){T(this,b);b=this.B[b];if(Fd(b)){a=this.mb(a);return this.h[Pb](a,b,c)}else return i};N.getProperties=function(a,b){T(this,b);b=this.B[b];if(Fd(b)){a=this.mb(a);return this.h[Ya](a,b)}else return{}};N.getColumnProperty=function(a,b){T(this,a);a=this.B[a];return Fd(a)?this.h[wb](a,b):i};
N.getColumnProperties=function(a){T(this,a);a=this.B[a];return Fd(a)?this.h[Qb](a):{}};N.dd=function(a){return this.h.dd(a)};N.cd=function(){return this.h.cd()};N.getRowProperty=function(a,b){a=this.mb(a);return this.h.getRowProperty(a,b)};N.getRowProperties=function(a){Yl(this,a);a=this.mb(a);return this.h[Fc](a)};N.getColumnRange=function(a){return dm(this,a)};N.getDistinctValues=function(a){return fm(this,a)};N.getSortedRows=function(a){return em(this,a)};
N.getFilteredRows=function(a){return lm(this,a)};N.toJSON=function(){for(var a={},b=[],c=0;c<this.B[u];c++){var e=this.B[c];Fd(e)&&b[t](e)}b[u]==0||(a.columns=b);this.Ua||(a.rows=Ud(this.$a));return(new tg).df(a)};function bp(a,b){if(Ed(b))b=sg(b);a=new Z(a);a[Zc](b.columns);a.mf(b.rows);return a};function cp(a,b){a=b(a);var c=yd(a);if(c==qd||c==td){c=c==td?[]:{};a=a;for(var e in a){var f=cp(a[e],b);if(f!==undefined)c[e]=f}}else c=a;return c}function dp(a){a=a;if(Bd(a)){a=a[ub]()!==0?[a[qc](),a[Ta](),a[Cb](),a[Sc](),a[Tc](),a[ob](),a[ub]()]:a[ob]()!==0||a[Tc]()!==0||a[Sc]()!==0?[a[qc](),a[Ta](),a[Cb](),a[Sc](),a[Tc](),a[ob]()]:[a[qc](),a[Ta](),a[Cb]()];a=Wl+a[L](be)+ce}return a};function ep(a){a=a||{};if(Ed(a))a=sg(a);this.mc=a.chartType;this.Zf=a.dataSourceUrl||i;var b=a.dataTable,c=i;if(b!=i)c=b[yb]==ka[Kb][$a]?b:new ka[Kb][$a](b);this.h=c;this.V=a.options||{};b=a.packages;this.bh=b!==undefined?b:i;this.Fa=a.query||i;this.Sh=a.view||i}
var fp={AnnotatedTimeLine:"annotatedtimeline",AreaChart:"areachart",BarChart:"barchart",ColumnChart:"columnchart",Gauge:"gauge",GeoMap:"geomap",ImageAreaChart:"imageareachart",ImageBarChart:"imagebarchart",ImageChart:"imagechart",ImageLineChart:"imagelinechart",ImagePieChart:"imagepiechart",ImageSparkLine:"imagesparkline",IntensityMap:"intensitymap",LineChart:"linechart",Map:"map",MotionChart:"motionchart",OrgChart:"orgchart",PieChart:"piechart",ScatterChart:"scatterchart",Table:"table",Timeline:"timeline"};
ep[v].Tk=i;function gp(a,b){return function(){try{a[Ic](i,arguments)}catch(c){ka[Kb][Nc].Nc(b,c[Lb])}}}N=ep[v];N.draw=function(a){if(!a)d(l("The container is null or not defined."));try{if(this.mc===undefined)d(l("The chart type is not defined."));if(this.rg())this.eg(a);else{var b=Ld(this.eg,this,a);b=gp(b,a);this.yk(b)}}catch(c){ka[Kb][Nc].Nc(a,c[Lb])}};
N.toJSON=function(){var a=this.bh,b=this[Eb]();a={chartType:this.mc,packages:a===i?undefined:a,options:this.V||undefined,dataSourceUrl:this.Zf||undefined,dataTable:b===i?undefined:b.toJSON(),query:this.re()||undefined,view:this.Sh||undefined};a=a=cp(a,dp);return a=(new tg).df(a)};N.getDataTable=function(){return this.h};N.re=function(){return this.Fa};N.setQuery=function(a){this.Fa=a};N.xh=function(a){this.V=a||{}};var hp="google.visualization.";
N.rg=function(){var a=this.mc,b=nd(a);if(Gd(b))b=b;else{b=nd(hp+a);b=Gd(b)?b:i}return b};var ip="Invalid chart type: ";N.Ci=function(){var a=this.bh;if(a==i){var b=this.mc;b=b[x](hp,R);a=fp[b];if(a==i)d(l(ip+b))}if(Ed(a))a=[a];return a};N.fg=function(a,b){var c=this.rg();if(!c)d(l(ip+this.mc));c=new c(a);sa(a,R);this.Tk=b[Wb]();a=this.Sh;if(a!=i)b=ka[Kb].DataView.fromJSON(b,a);c[ic](b,this.V)};N.Ri=function(a,b){if(b[gc]())d(l(b[Nb]()));b=b[Eb]();this.fg(a,b)};var jp="visualization",kp="1.0";
N.yk=function(a){var b=this.Ci();a={packages:b,callback:a};ka.load(jp,kp,a)};N.eg=function(a){var b=this[Eb]();if(b)this.fg(a,b);else{b=Ld(this.Ri,this,a);b=gp(b,a);this.dc(b)}};N.dc=function(a){var b=this.Zf||R;b=new ka[Kb].Query(b);var c=this.re();c&&b[Rb](c);b[cc](a)};function lp(a,b){(new ep(a))[ic](b)};var mp,np="role";function op(a,b){if(ff||mp){a[Ac](np,b);a.Dm=b}}var pp="aria-";function qp(a,b,c){if(ff||mp)a[Ac](pp+b,c)};function rp(a){hj[H](this);this.j=a;a=S?ko:ho;var b=S?mo:bo;this.wk=Yi(this.j,a,this,!S);this.xk=Yi(this.j,b,this,!S)}Q(rp,hj);Ba(rp[v],function(a){var b=a.$;b=new Ai(b);Ca(b,a[I]==ko||a[I]==ho?ko:mo);try{this[z](b)}finally{b.K()}});rp[v].g=function(){rp.b.g[H](this);bj(this.wk);bj(this.xk);delete this.j};var sp=65,tp=90,up="525";function vp(a,b,c){if(!S&&!(gf&&vf(up)))return h;if(S&&!c&&(b==17||b==18))return k;if(a>=48&&a<=57)return h;if(a>=96&&a<=106)return h;if(a>=sp&&a<=tp)return h;if(a==27&&gf)return k;switch(a){case 13:case 27:case 32:case 63:case 107:case 109:case 110:case 111:case 186:case 189:case 187:case 188:case 190:case 191:case 192:case 222:case 219:case 220:case 221:return h;default:return k}}
function wp(a){if(a>=48&&a<=57)return h;if(a>=96&&a<=106)return h;if(a>=sp&&a<=tp)return h;switch(a){case 32:case 63:case 107:case 109:case 110:case 111:case 186:case 189:case 187:case 188:case 190:case 191:case 192:case 222:case 219:case 220:case 221:return h;default:return k}};var xp="mousedown";function yp(a,b,c){wa(this,a);this.se=b||a;this.Pe=c||new Ah(NaN,NaN,NaN,NaN);this.i=a.ownerDocument||a[mb];Yi(this.se,xp,this.Eh,k,this)}Q(yp,hj);var zp=ff&&!vf("1.9a");N=yp[v];xa(N,0);ya(N,0);N.Fh=0;N.Gh=0;N.oc=0;N.pc=0;N.gb=h;N.Aa=k;N.Dg=0;N.Ek=0;N.Eg=k;function Ap(a){a[Gb]()}N=yp[v];N.g=function(){yp.b.g[H](this);$i(this.se,xp,this.Eh,k,this);this.Kh();delete this[F];delete this.se};
N.Eh=function(a){if(this.gb&&!this.Aa&&(a[I]!=xp||a.Ie(0))){if(this.Dg==0){this.Gg(a);if(this.Aa)a[Gb]();else return}else a[Gb]();this.Nl();xa(this,this.Fh=a[Yb]);ya(this,this.Gh=a[Zb]);this.oc=this[F].offsetLeft;this.pc=this[F].offsetTop;this.Dc=Af(this.i).Mb();this.Ek=Nd()}};var Bp="mousemove",Cp="mouseup",Dp="dragstart",Ep="scroll";
N.Nl=function(){Yi(this.i,Bp,this.Tg,k,this);Yi(this.i,Cp,this.Uc,k,this);if(zp)try{Yi(o.top,Di,this.$g,k,this)}catch(a){}S&&this.Eg&&Yi(this.i,Dp,Ap,k,this);this.bf&&Yi(this.bf,Ep,this.Zg,k,this)};var Fp="start";N.Gg=function(a){a=this[z](new Gp(Fp,this,a[ed],a[fd],a));if(a!==k)this.Aa=h};var Hp="end";N.Uc=function(a,b){this.Kh();if(this.Aa){this.Aa=k;var c=this.Pg(this.oc),e=this.Qg(this.pc);this[z](new Gp(Hp,this,a[ed],a[fd],a,c,e,b))}};N.kg=function(a){this.Uc(a,h)};
N.Kh=function(){$i(this.i,Bp,this.Tg,k,this);$i(this.i,Cp,this.Uc,k,this);if(zp)try{$i(o.top,Di,this.$g,k,this)}catch(a){}S&&this.Eg&&$i(this.i,Dp,Ap,k,this);this.bf&&$i(this.bf,Ep,this.Zg,k,this)};var Ip="IFRAME";N.$g=function(a){this.Aa&&!a[db]&&a[F][Kc]!=Ip&&this.kg(a)};var Jp="8",Kp="beforedrag";
N.Tg=function(a){if(this.gb)if(S&&!a[Jb]&&!vf(Jp))this.kg(a);else{var b=a[Yb]-this[Yb],c=a[Zb]-this[Zb];xa(this,a[Yb]);ya(this,a[Zb]);if(!this.Aa){var e=this.Fh-this[Yb],f=this.Gh-this[Zb];e=e*e+f*f;if(e>this.Dg){this.Gg(a);if(!this.Aa){this.Uc(a);return}}}c=this.Of(b,c);b=c.x;c=c.y;if(this.Aa){e=this[z](new Gp(Kp,this,a[ed],a[fd],a,b,c));if(e!==k){this.cg(a,b,c,k);a[Gb]()}}}};
N.Of=function(a,b){var c=Af(this.i).Mb();a+=c.x-this.Dc.x;b+=c.y-this.Dc.y;this.Dc=c;this.oc+=a;this.pc+=b;a=this.Pg(this.oc);b=this.Qg(this.pc);return new $d(a,b)};N.Zg=function(a){var b=this.Of(0,0);Ia(a,this.Dc.x-this[Yb]);Ka(a,this.Dc.x-this[Zb]);this.cg(a,b.x,b.y,h)};var Lp="drag";N.cg=function(a,b,c){this.Ni(b,c);this[z](new Gp(Lp,this,a[ed],a[fd],a,b,c))};N.Pg=function(a){var b=this.Pe,c=!ma(b[D])?b[D]:i;b=!ma(b[w])?b[w]:0;b=c!=i?c+b:Infinity;c=c!=i?c:-Infinity;return r.min(b,r.max(c,a))};
N.Qg=function(a){var b=this.Pe,c=!ma(b.top)?b.top:i;b=!ma(b[K])?b[K]:0;b=c!=i?c+b:Infinity;c=c!=i?c:-Infinity;return r.min(b,r.max(c,a))};N.Ni=function(a,b){ua(this[F][Ob],a+Pn);this[F][Ob].top=b+Pn};function Gp(a,b,c,e,f,g,j,n){zi[H](this,a);Ca(this,a);Ia(this,c);Ka(this,e);this.qm=f;ua(this,g!==undefined?g:b.oc);this.top=j!==undefined?j:b.pc;this.vm=b;this.um=!!n}Q(Gp,zi);var Mp,Np,Op,Pp,Qp,Rp;Rp=Qp=Pp=Op=Np=Mp=k;var Sp=af();if(Sp)if(Sp[y]("Firefox")!=-1)Mp=h;else if(Sp[y]("Camino")!=-1)Np=h;else if(Sp[y]("iPhone")!=-1||Sp[y]("iPod")!=-1)Op=h;else if(Sp[y]("Android")!=-1)Pp=h;else if(Sp[y]("Chrome")!=-1)Qp=h;else if(Sp[y]("Safari")!=-1)Rp=h;function Tp(a,b){var c=Cf(a);if(c[Oc]&&c[Oc].getComputedStyle)if(a=c[Oc].getComputedStyle(a,R))return a[b];return i}function Up(a,b){return Tp(a,b)||(a.currentStyle?a.currentStyle[b]:i)||a[Ob][b]}var Vp="position";function Wp(a){return Up(a,Vp)}var Xp="1.9";function Yp(a,b,c){var e,f=ff&&(mf||nf)&&vf(Xp);if(b instanceof $d){e=b.x;b=b.y}else{e=b;b=c}ua(a[Ob],typeof e==P?(f?r[hb](e):e)+Pn:e);a[Ob].top=typeof b==P?(f?r[hb](b):b)+Pn:b}
function Zp(a){var b=a[Xa]();if(S){a=a.ownerDocument;b.left-=a[gd][xc]+a[Tb][xc];b.top-=a[gd][Dc]+a[Tb][Dc]}return b}var $p="fixed",aq="static";function bq(a){if(S)return a.offsetParent;var b=Cf(a),c=Up(a,Vp),e=c==$p||c==bk;for(a=a[Rc];a&&a!=b;a=a[Rc]){c=Up(a,Vp);e=e&&c==aq&&a!=b[gd]&&a!=b[Tb];if(!e&&(a.scrollWidth>a[gb]||a[mc]>a[uc]||c==$p||c==bk))return a}return i}var cq="overflow",dq="visible",eq="borderLeftWidth",fq="borderRightWidth",gq="borderTopWidth";
function hq(a){var b=new uh(0,Infinity,Infinity,0),c=Af(a),e=c.xj(),f;for(a=a;a=bq(a);)if((!S||a[gb]!=0)&&(a.scrollWidth!=a[gb]||a[mc]!=a[uc])&&Up(a,cq)!=dq){var g=iq(a),j;j=a;if(ff&&!vf(Xp)){var n=ga(Tp(j,eq));if(jq(j)){var s=j[vb]-j[gb]-n-ga(Tp(j,fq));n+=s}j=new $d(n,ga(Tp(j,gq)))}else j=new $d(j[xc],j[Dc]);g.x+=j.x;g.y+=j.y;b.top=r.max(b.top,g.y);b.right=r.min(b[id],g.x+a[gb]);b.bottom=r.min(b[zc],g.y+a[uc]);ua(b,r.max(b[D],g.x));f=f||a!=e}a=e[vc];e=e[Na];if(gf){b.left+=a;b.top+=e}else{ua(b,r.max(b[D],
a));b.top=r.max(b.top,e)}if(!f||gf){b.right+=a;b.bottom+=e}c=c.Nj();b.right=r.min(b[id],a+c[w]);b.bottom=r.min(b[zc],e+c[K]);return b.top>=0&&b[D]>=0&&b[zc]>b.top&&b[id]>b[D]?b:i}var kq="TR";
function iq(a){var b,c=Cf(a),e=Up(a,Vp),f=ff&&c[bc]&&!a[Xa]&&e==bk&&(b=c[bc](a))&&(b[Yb]<0||b[Zb]<0),g=new $d(0,0),j;b=c?c[lb]==9?c:Cf(c):p;j=S&&!Af(b).Ig()?b[Tb]:b[gd];if(a==j)return g;if(a[Xa]){b=Zp(a);a=Af(c).Mb();g.x=b[D]+a.x;g.y=b.top+a.y}else if(c[bc]&&!f){b=c[bc](a);a=c[bc](j);g.x=b[Yb]-a[Yb];g.y=b[Zb]-a[Zb]}else{b=a;do{g.x+=b.offsetLeft;g.y+=b.offsetTop;if(b!=a){g.x+=b[xc]||0;g.y+=b[Dc]||0}if(gf&&Wp(b)==$p){g.x+=c[Tb][vc];g.y+=c[Tb][Na];break}b=b.offsetParent}while(b&&b!=a);if(ef||gf&&e==
bk)g.y-=c[Tb].offsetTop;for(b=a;(b=bq(b))&&b!=c[Tb]&&b!=j;){g.x-=b[vc];if(!ef||b[Kc]!=kq)g.y-=b[Na]}}return g}function lq(a){var b=new $d;if(a[lb]==1)if(a[Xa]){var c=Zp(a);b.x=c[D];b.y=c.top}else{c=Af(a).Mb();a=iq(a);b.x=a.x-c.x;b.y=a.y-c.y}else{b.x=a[ed];b.y=a[fd]}return b}function mq(a,b,c){if(b instanceof ee){c=b[K];b=b[w]}else{if(c==undefined)d(l("missing height argument"));c=c}ra(a[Ob],typeof b==P?r[hb](b)+Pn:b);Ha(a[Ob],typeof c==P?r[hb](c)+Pn:c)}var nq="10",oq="display",pq="hidden",qq="inline";
function rq(a){var b=ef&&!vf(nq);if(Up(a,oq)!=Zm)return b?new ee(a[vb]||a[gb],a[Yc]||a[uc]):new ee(a[vb],a[Yc]);var c=a[Ob],e=c.display,f=c.visibility,g=c.position;La(c,pq);c.position=bk;Ga(c,qq);if(b){b=a[vb]||a[gb];a=a[Yc]||a[uc]}else{b=a[vb];a=a[Yc]}Ga(c,e);c.position=g;La(c,f);return new ee(b,a)}function sq(a){var b=iq(a);a=rq(a);return new Ah(b.x,b.y,a[w],a[K])}var tq="opacity",uq="MozOpacity",vq="filter",wq="alpha(opacity=";
function xq(a,b){a=a[Ob];if(tq in a)a.opacity=b;else if(uq in a)a.MozOpacity=b;else if(vq in a)a.filter=b===R?R:wq+b*100+ce}function yq(a,b){Ga(a[Ob],b?R:Zm)}var zq="rtl",Aq="direction";function jq(a){return zq==Up(a,Aq)}var Bq=ff?"MozUserSelect":gf?"WebkitUserSelect":i,Cq="*",Dq="unselectable";function Eq(a,b,c){c=!c?a[cd](Cq):i;if(Bq){b=b?Zm:R;a[Ob][Bq]=b;if(c){a=0;for(var e;e=c[a];a++)e[Ob][Bq]=b}}else if(S||ef){b=b?Vi:R;a[Ac](Dq,b);if(c)for(a=0;e=c[a];a++)e[Ac](Dq,b)}};function Fq(a){this.pb=a}Q(Fq,xi);var Gq=new yi(0,100);N=Fq[v];N.m=function(a,b,c,e,f){if(zd(b))for(var g=0;g<b[u];g++)this.m(a,b[g],c,e,f);else{a=Yi(a,b,c||this,e||k,f||this.pb||this);this.Uk(a)}return this};N.Uk=function(a){if(this.l)this.l[a]=h;else if(this.Va){this.l=Gq.Da();this.l[this.Va]=h;this.Va=i;this.l[a]=h}else this.Va=a};
N.Z=function(a,b,c,e,f){if(this.Va||this.l)if(zd(b))for(var g=0;g<b[u];g++)this.Z(a,b[g],c,e,f);else{a:{c=c||this;f=f||this.pb||this;e=!!(e||k);if(a=aj(a,b,e))for(b=0;b<a[u];b++)if(a[b].Yb==c&&a[b].lc==e&&a[b].hd==f){a=a[b];break a}a=i}if(a){a=a.ja;bj(a);if(this.l)ke(this.l,a);else if(this.Va==a)this.Va=i}}return this};N.Ec=function(){if(this.l){for(var a in this.l){bj(a);delete this.l[a]}Gq.tb(this.l);this.l=i}else this.Va&&bj(this.Va)};N.g=function(){Fq.b.g[H](this);this.Ec()};Ba(N,function(){d(l("EventHandler.handleEvent not implemented"))});function Hq(){}pd(Hq);Hq[v].Ik=0;Hq[v].Dj=function(){return Eg+(this.Ik++)[Sa](36)};Hq.ha();function Iq(a){hj[H](this);this.qa=a||Af();this.Gc=Jq}Q(Iq,hj);Iq[v].kk=Hq.ha();var Jq=i,Kq="disable",Lq="enable",Mq="highlight",Nq="unhighlight",Oq="activate",Pq="deactivate",Qq="select",Rq="unselect",Sq="check",Tq="uncheck",Uq="open",Vq="close";function Wq(a,b){switch(a){case 1:return b?Kq:Lq;case 2:return b?Mq:Nq;case 4:return b?Oq:Pq;case 8:return b?Qq:Rq;case 16:return b?Sq:Tq;case 32:return b?ho:bo;case 64:return b?Uq:Vq;default:}d(l("Invalid component state"))}N=Iq[v];N.Tb=i;N.qa=i;N.n=k;
N.j=i;N.Gc=i;N.Qe=i;N.R=i;N.J=i;N.Ma=i;N.Yl=k;N.Ob=function(){return this.Tb||(this.Tb=this.kk.Dj())};N.a=function(){return this.j};N.ff=function(a){this.j=a};N.W=function(){return this.Qb||(this.Qb=new Fq(this))};var Xq="Unable to set parent component";N.jf=function(a){if(this==a)d(l(Xq));if(a&&this.R&&this.Tb&&this.R.qg(this.Tb)&&this.R!=a)d(l(Xq));this.R=a;Iq.b.kf[H](this,a)};N.kf=function(a){if(this.R&&this.R!=a)d(l("Method not supported"));Iq.b.kf[H](this,a)};N.z=function(){return this.qa};
N.d=function(){this.j=this.qa[jc](xo)};N.va=function(a){this.lh(a)};var Yq="Component already rendered";N.lh=function(a,b){if(this.n)d(l(Yq));this.j||this.d();a?a[Ib](this.j,b||i):this.qa.i[Tb][Ma](this.j);if(!this.R||this.R.n)this.O()};N.O=function(){this.n=h;this.Jb(function(a){!a.n&&a.a()&&a.O()})};N.ca=function(){this.Jb(function(a){a.n&&a.ca()});this.Qb&&this.Qb.Ec();this.n=k};
N.g=function(){Iq.b.g[H](this);this.n&&this.ca();if(this.Qb){this.Qb.K();delete this.Qb}this.Jb(function(a){a.K()});!this.Yl&&this.j&&$f(this.j);this.R=this.Qe=this.j=this.Ma=this.J=i};N.Fl=function(a){this.Qe=a};N.Mc=function(a,b){this.kc(a,this.Sa(),b)};
N.kc=function(a,b,c){if(a.n&&(c||!this.n))d(l(Yq));if(b<0||b>this.Sa())d(l("Child component index out of bounds"));if(!this.Ma||!this.J){this.Ma={};this.J=[]}if(a.R==this){var e=a.Ob();this.Ma[e]=a;Td(this.J,a)}else{e=this.Ma;var f=a.Ob(),g=a;if(f in e)d(l('The object already contains the key "'+f+De));e[f]=g}a.jf(this);Wd(this.J,b,0,a);if(a.n&&this.n&&a.R==this){c=this.L();c[Ib](a.a(),c.childNodes[b+1]||i)}else if(c){this.j||this.d();b=this.Ra(b+1);a.lh(this.L(),b?b.j:i)}else this.n&&!a.n&&a.j&&
a.O()};N.L=function(){return this.j};N.Le=function(){if(this.Gc==i)this.Gc=jq(this.n?this.j:this.qa.i[Tb]);return this.Gc};N.hc=function(a){if(this.n)d(l(Yq));this.Gc=a};N.Zj=function(){return!!this.J&&this.J[u]!=0};N.Sa=function(){return this.J?this.J[u]:0};N.qg=function(a){return this.Ma&&a?le(this.Ma,a)||i:i};N.Ra=function(a){return this.J?this.J[a]||i:i};N.Jb=function(a,b){this.J&&Pd(this.J,a,b)};N.md=function(a){return this.J&&a?Od(this.J,a):-1};
N.removeChild=function(a,b){if(a){var c=Ed(a)?a:a.Ob();a=this.qg(c);if(c&&a){ke(this.Ma,c);Td(this.J,a);if(b){a.ca();a.j&&$f(a.j)}a.jf(i)}}if(!a)d(l("Child is not in parent component"));return a};N.Wk=function(a,b){return this[Vb](this.Ra(a),b)};N.Ye=function(a){for(;this.Zj();)this.Wk(0,a)};var Zq="modal-dialog";function $q(a,b,c){Iq[H](this,c);this.ya=a||Zq;this.vf=!!b;this.Ka=ar;this.Wc=new rp(this.z().i)}Q($q,Iq);N=$q[v];N.vf=k;N.qd=h;N.dg=h;N.vi=0.3;N.Rl=R;N.oa=R;N.Ka=i;N.Fb=i;N.w=k;N.Qi=k;N.H=i;N.D=i;N.Od=i;N.Pd=i;N.Oh=i;N.rf=i;N.Cb=i;N.Ja=i;N.Ga=function(a){this.oa=a;if(this.Cb)sa(this.Cb,a)};N.L=function(){this.Cb||this.va();return this.Cb};N.Kj=function(){this.n||this.va();return this.Pd};N.tj=function(){this.n||this.va();return this.Ja};var br="-title-draggable";
N.Hi=function(){var a=new yp(this.a(),this.Od);yf(this.Od,this.ya+br);return a};var cr="-title",dr="-title-text",er="-title-close",fr="-content",gr="-buttons",hr="dialog",ir="labelledby";
N.d=function(){this.Bk();var a=this.z();this.ff(a.d(xo,{className:this.ya,tabIndex:0},this.Od=a.d(xo,{className:this.ya+cr,id:this.Ob()},this.Pd=a.d(wo,this.ya+dr,this.Rl),this.rf=a.d(wo,this.ya+er)),this.Cb=a.d(xo,this.ya+fr),this.Ja=a.d(xo,this.ya+gr),this.Jh=a.d(wo,{tabIndex:0})));this.Oh=this.Od.id;op(this.a(),hr);qp(this.a(),ir,this.Oh||R);if(this.oa)sa(this.Cb,this.oa);yq(this.a(),k);this.Ka&&this.Ka.ui(this.Ja)};var jr="border: 0; vertical-align: bottom",kr='javascript:""',lr="-bg";
N.Bk=function(){if(this.vf&&this.qd&&!this.D){var a;a=this.z();this.D=a=a.d($j,{frameborder:0,style:jr,src:kr});qa(this.D,this.ya+lr);yq(this.D,k);xq(this.D,0)}else if((!this.vf||!this.qd)&&this.D){$f(this.D);this.D=i}if(this.qd&&!this.H){this.H=this.z().d(xo,this.ya+lr);xq(this.H,this.vi);yq(this.H,k)}else if(!this.qd&&this.H){$f(this.H);this.H=i}};N.va=function(a){if(this.n)d(l(Yq));this.a()||this.d();a=a||this.z().i[Tb];this.$k(a);$q.b.va[H](this,a)};
N.$k=function(a){this.D&&a[Ma](this.D);this.H&&a[Ma](this.H)};N.O=function(){$q.b.O[H](this);if(this.dg&&!this.Fb)this.Fb=this.Hi();this.W().m(this.rf,Fi,this.Lk).m(this.Wc,ko,this.Jk);op(this.a(),hr);this.Pd.id!==R&&qp(this.a(),ir,this.Pd.id)};N.ca=function(){this.w&&this.N(k);if(this.Fb){this.Fb.K();this.Fb=i}$q.b.ca[H](this)};var mr="keydown",nr="resize",or="button",pr="input",qr="position:fixed;width:0;height:0",rr="afterhide";
N.N=function(a){if(a!=this.w){var b=this.z().i,c=Nf(b)||o;this.n||this.va(b[Tb]);if(a){this.nh();this.ub();this.W().m(this.a(),mr,this.Vg,h).m(c,nr,this.Yg,h)}else this.W().Z(this.a(),mr,this.Vg,h).Z(c,nr,this.Yg,h);this.D&&yq(this.D,a);this.H&&yq(this.H,a);yq(this.a(),a);if(a){ff&&this.a()[hc]();if(this.Ka)if(c=this.Ka.ge)for(var e=this.Ja[cd](or),f=0,g;g=e[f];f++)if(g[Qc]==c){try{if(gf||ef){var j=b[jc](pr);j[Ob].cssText=qr;this.a()[Ma](j);j[hc]();this.a()[Vb](j)}g[hc]()}catch(n){}break}}if(this.w=
a)this.W().m(this.Ja,Fi,this.Ug);else{this.W().Z(this.Ja,Fi,this.Ug);this[z](rr);this.Qi&&this.K()}}};N.nh=function(){this.D&&yq(this.D,k);this.H&&yq(this.H,k);var a=this.z().i,b=Nf(a)||o,c=Lf(b||o);b=a[Tb].scrollWidth;a=r.max(a[Tb][mc],c[K]);if(this.D){yq(this.D,h);mq(this.D,b,a)}if(this.H){yq(this.H,h);mq(this.H,b,a)}if(this.dg){c=rq(this.a());this.Fb.Pe=new Ah(0,0,b-c[w],a-c[K])}};
N.ub=function(){var a=this.z().i,b=Nf(a)||o;if(Wp(this.a())==$p)var c=a=0;else{c=this.z().Mb();a=c.x;c=c.y}var e=rq(this.a());b=Lf(b||o);a=r.max(a+b[w]/2-e[w]/2,0);c=r.max(c+b[K]/2-e[K]/2,0);Yp(this.a(),a,c)};N.Lk=function(){var a=this.Ka,b=a&&a.ae;if(b){a=a.S(b);this[z](new sr(b,a))&&this.N(k)}else this.N(k)};N.g=function(){$q.b.g[H](this);if(this.Wc){this.Wc.K();this.Wc=i}if(this.H){$f(this.H);this.H=i}if(this.D){$f(this.D);this.D=i}this.Jh=this.Ja=this.rf=i};
N.Ug=function(a){if(a=this.Vi(a[F])){a=a[Qc];var b=this.Ka.S(a);this[z](new sr(a,b))&&this.N(k)}};var tr="BUTTON";N.Vi=function(a){for(a=a;a!=i&&a!=this.Ja;){if(a[Kc]==tr)return a;a=a[Rc]}return i};
N.Vg=function(a){var b=k,c=k,e=this.Ka;if(a[nc]==27)if(b=e&&e.ae){c=h;e=e.S(b);b=this[z](new sr(b,e))}else b=h;else if(a[nc]==13){var f;if(a[F]&&a[F][Kc]==tr)f=a[F][Qc];else if(e){var g=(f=e.ge)&&e.sj(f);f=g&&!g.disabled?f:i}if(f){c=h;b=this[z](new sr(f,ha(e.S(f))))}}else if(a[nc]==9&&a[Jc]&&a[F]==this.a())c=h;if(b||c){a[Bb]();a[Gb]()}b&&this.N(k)};N.Yg=function(){this.nh()};N.Jk=function(a){this.Jh==a[F]&&Lk(this.Wi,0,this)};N.Wi=function(){S&&this.z().i[Tb][hc]();this.a()[hc]()};var ur="dialogselect";
function sr(a,b){Ca(this,ur);this.ja=a;this.caption=b}Q(sr,zi);function vr(a){this.qa=a||Af();Jh[H](this)}var ar;Q(vr,Jh);N=vr[v];N.ge=i;N.j=i;N.ae=i;N.A=function(a,b,c,e){Jh[v].A[H](this,a,b);if(c)this.ge=a;if(e)this.ae=a;return this};N.ui=function(a){this.j=a;this.va()};N.va=function(){if(this.j){sa(this.j,R);var a=Af(this.j);Ih(this,function(b,c){this.j[Ma](a.d(or,{name:c},b))},this)}};N.sj=function(a){for(var b=this.rj(),c=0,e;e=b[c];c++)if(e[Qc]==a||e.id==a)return e;return i};N.rj=function(){return this.j[cd](tr)};
var wr="ok",xr="cancel",yr="Cancel",zr="yes",Ar="Yes",Br="no",Cr="No",Dr="continue",Er="Continue",Fr="save",Gr="Save";(function(){(new vr).A(wr,zn,h);ar=(new vr).A(wr,zn,h).A(xr,yr,k,h);(new vr).A(zr,Ar,h).A(Br,Cr,k,h);(new vr).A(zr,Ar).A(Br,Cr,h).A(xr,yr,k,h);(new vr).A(Dr,Er).A(Fr,Gr).A(xr,yr,h,h)})();function Hr(a){hj[H](this);a&&this.Mf(a)}Q(Hr,hj);N=Hr[v];N.j=i;N.od=i;N.Ne=i;N.pd=i;N.Ac=-1;N.Wb=-1;
var Ir={"3":13,"12":144,"63232":38,"63233":40,"63234":37,"63235":39,"63236":112,"63237":113,"63238":114,"63239":115,"63240":116,"63241":117,"63242":118,"63243":119,"63244":120,"63245":121,"63246":122,"63247":123,"63248":44,"63272":46,"63273":36,"63275":35,"63276":33,"63277":34,"63289":144,"63302":45},Jr={Up:38,Down:40,Left:37,Right:39,Enter:13,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,"U+007F":46,Home:36,End:35,PageUp:33,PageDown:34,Insert:45},Kr={61:187,
59:186},Lr=S||gf&&vf(up);N=Hr[v];N.Sj=function(a){if(Lr&&!vp(a[nc],this.Ac,a[Jc]))this[Ec](a);else this.Wb=ff&&a[nc]in Kr?Kr[a[nc]]:a[nc]};N.Tj=function(){this.Wb=this.Ac=-1};
Ba(N,function(a){var b=a.$,c,e;if(S&&a[I]==Ei){c=this.Wb;e=c!=13&&c!=27?b[nc]:0}else if(gf&&a[I]==Ei){c=this.Wb;e=b[fc]>=0&&b[fc]<63232&&wp(c)?b[fc]:0}else if(ef){c=this.Wb;e=wp(c)?b[nc]:0}else{c=b[nc]||this.Wb;e=b[fc]||0;if(mf&&e==63&&!c)c=191}var f=c,g=b.keyIdentifier;if(c)if(c>=63232&&c in Ir)f=Ir[c];else{if(c==25&&a[Jc])f=9}else if(g&&g in Jr)f=Jr[g];a=f==this.Ac;this.Ac=f;b=new Mr(f,e,a,b);try{this[z](b)}finally{b.K()}});var Nr="keyup";
N.Mf=function(a){this.pd&&this.detach();this.j=a;this.od=Yi(this.j,Ei,this);this.Ne=Yi(this.j,mr,this.Sj,k,this);this.pd=Yi(this.j,Nr,this.Tj,k,this)};N.detach=function(){if(this.od){bj(this.od);bj(this.Ne);bj(this.pd);this.pd=this.Ne=this.od=i}this.j=i;this.Ac=-1};N.g=function(){Hr.b.g[H](this);this.detach()};var Or="key";function Mr(a,b,c,e){Ai[H](this,e);Ca(this,Or);Aa(this,a);this.charCode=b;this.repeat=c}Q(Mr,Ai);var Pr="HTML",Qr="BODY";
function Rr(a,b,c,e,f,g,j,n){var s,A=c.offsetParent;if(A){var B=A[Kc]==Pr||A[Kc]==Qr;if(!B||Wp(A)!=aq){s=iq(A);B||(s=de(s,new $d(A[vc],A[Na])))}}B=a;A=sq(B);(B=hq(B))&&A.qk(new Ah(B[D],B.top,B[id]-B[D],B[zc]-B.top));B=A=A;var M=Af(a),G=Af(c);if(M.i!=G.i){var E=M.i[Tb],$=E;G=G.vg();var da=new $d(0,0),Ja=Nf(Cf($));$=$;do{var Qa=Ja==G?iq($):lq($);da.x+=Qa.x;da.y+=Qa.y}while(Ja&&Ja!=G&&($=Ja.frameElement)&&(Ja=Ja.parent));G=da;G=de(G,iq(E));if(S&&!M.Ig())G=de(G,M.Mb());B.left+=G.x;B.top+=G.y}a=(b&4&&
jq(a)?b^2:b)&-5;b=new $d(a&2?A[D]+A[w]:A[D],a&1?A.top+A[K]:A.top);if(s)b=de(b,s);if(f){b.x+=(a&2?-1:1)*f.x;b.y+=(a&1?-1:1)*f.y}var X;if(j)if((X=hq(c))&&s){X.top=r.max(0,X.top-s.y);X.right-=s.x;X.bottom-=s.y;ua(X,r.max(0,X[D]-s.x))}a:{f=b;c=c;e=e;g=g;X=X;j=j;s=n;f=f[Wb]();n=0;e=(e&4&&jq(c)?e^2:e)&-5;a=rq(c);s=s?s[Wb]():a;if(g||e!=0){if(e&2)f.x-=s[w]+(g?g[id]:0);else if(g)f.x+=g[D];if(e&1)f.y-=s[K]+(g?g[zc]:0);else if(g)f.y+=g.top}if(j){n=X?Sr(f,s,X,j):256;if(n&496){n=n;break a}}Yp(c,f);j=a==s?h:!a||
!s?k:a[w]==s[w]&&a[K]==s[K];j||mq(c,s);n=n}return n}function Sr(a,b,c,e){var f=0;if(a.x<c[D]&&e&1){a.x=c[D];f|=1}if(a.x<c[D]&&a.x+b[w]>c[id]&&e&16){b.width-=a.x+b[w]-c[id];f|=4}if(a.x+b[w]>c[id]&&e&1){a.x=r.max(c[id]-b[w],c[D]);f|=1}if(e&2)f|=(a.x<c[D]?16:0)|(a.x+b[w]>c[id]?32:0);if(a.y<c.top&&e&4){a.y=c.top;f|=2}if(a.y>=c.top&&a.y+b[K]>c[zc]&&e&32){b.height-=a.y+b[K]-c[zc];f|=8}if(a.y+b[K]>c[zc]&&e&4){a.y=r.max(c[zc]-b[K],c.top);f|=2}if(e&8)f|=(a.y<c.top?64:0)|(a.y+b[K]>c[zc]?128:0);return f};function Tr(){}Tr[v].ub=function(){};function Ur(a,b){this.Gb=a;this.Db=b}Q(Ur,Tr);Ur[v].ub=function(a,b,c){Rr(this.Gb,this.Db,a,b,undefined,c)};function Vr(a,b,c){Ur[H](this,a,b);this.qi=c}Q(Vr,Ur);Vr[v].ub=function(a,b,c,e){var f=Rr(this.Gb,this.Db,a,b,i,c,10,e)&496;if(f)if(f=Rr(this.Gb,b,a,this.Db,i,c,10,e)&496)this.qi?Rr(this.Gb,this.Db,a,b,i,c,5,e):Rr(this.Gb,this.Db,a,b,i,c,0,e)};function Wr(a,b,c,e){Vr[H](this,a,b,c);this.bl=e}Q(Wr,Vr);Wr[v].ub=function(a,b,c,e){this.bl?Rr(this.Gb,this.Db,a,b,i,c,33,e):Wr.b.ub[H](this,a,b,c,e)};function Xr(){}var Yr;pd(Xr);N=Xr[v];N.jb=function(){return undefined};N.d=function(a){return a.z().d(xo,this.Lb(a)[L](ue),a.oa)};N.L=function(a){return a};var Zr="7";N.Tc=function(a,b,c){if(a=a.a?a.a():a)if(S&&!vf(Zr)){var e=this.og(xf(a),b);e[t](b);c=c?yf:zf;Md(c,a)[Ic](i,e)}else{a=a;b=b;c?yf(a,b):zf(a,b)}};N.gg=function(a,b,c){this.Tc(a,b,c)};N.Ub=function(a){a.Le()&&this.hc(a.a(),h);a.U()&&this.wb(a,a.w)};N.ql=function(a){if(ff){var b=this.jb();b&&op(a,b)}};N.Ad=function(a,b){Eq(a,!b,!S&&!ef)};
var $r="-rtl";N.hc=function(a,b){this.Tc(a,this.Pb()+$r,b)};N.rb=function(a){var b;if(a.ba(32)&&(b=a.M()))return kg(b);return k};N.wb=function(a,b){var c;if(a.ba(32)&&(c=a.M())){if(!b&&a.Kg()){try{c.blur()}catch(e){}a.Kg()&&a.nb(i)}kg(c)!=b&&mg(c,b)}};N.N=function(a,b){yq(a,b)};N.ma=function(a,b,c){var e=a.a();if(e){var f=this.Xc(b);f&&this.Tc(a,f,c);this.Lc(e,b,c)}};var as="disabled",bs="pressed",cs="selected",ds="checked",es="expanded";
N.Lc=function(a,b,c){if(ff){Yr||(Yr=qe(1,as,4,bs,8,cs,16,ds,64,es));(b=Yr[b])&&qp(a,b,c)}};var fs="nodeType";N.Ga=function(a,b){var c=this.L(a);if(c){Yf(c);if(b)if(Ed(b))fg(c,b);else{function e(f){if(f){var g=Cf(c);c[Ma](Ed(f)?g[zb](f):f)}}if(zd(b))Pd(b,e);else Ad(b)&&!(fs in b)?Pd(Ud(b),e):e(b)}}};N.M=function(a){return a.a()};var gs="goog-control";N.P=function(){return gs};N.Pb=function(){return this.P()};
N.Lb=function(a){var b=this.P(),c=[b],e=this.Pb();e!=b&&c[t](e);(b=this.uj(a.ic))&&c[t][Ic](c,b);(a=a.ra)&&c[t][Ic](c,a);S&&!vf(Zr)&&c[t][Ic](c,this.og(c));return c};var hs="_";N.og=function(a,b){var c=[];if(b)a=a[xb]([b]);Pd([],function(e){var f;a:{f=e;var g=Md(Sd,a),j=undefined;if(f[Gc])f=f[Gc](g,j);else if(Array[Gc])f=Array[Gc](f,g,j);else{for(var n=f[u],s=Ed(f)?f[pb](R):f,A=0;A<n;A++)if(A in s&&!g[H](j,s[A],A,f)){f=k;break a}f=h}}if(f&&(!b||Sd(e,b)))c[t](e[L](hs))});return c};
N.uj=function(a){if(a){for(var b=[],c=1;a;c<<=1)if(a&c){b[t](this.Xc(c));a&=~c}return b}return i};N.Xc=function(a){this.Sf||this.Fi();return this.Sf[a]};var is="-disabled",js="-hover",ks="-active",ls="-selected",ms="-checked",ns="-focused",os="-open";N.Fi=function(){var a=this.Pb();this.Sf=qe(1,a+is,2,a+js,4,a+ks,8,a+ls,16,a+ms,32,a+ns,64,a+os)};function ps(){Xr[H](this)}Q(ps,Xr);pd(ps);N=ps[v];N.jb=function(){return or};N.Lc=function(a,b,c){if(ff)b==16?qp(a,bs,c):ps.b.Lc[H](this,a,b,c)};N.d=function(a){var b=ps.b.d[H](this,a),c=a.ed();c&&this.of(b,c);(c=a[J]())&&this[bb](b,c);a.ba(16)&&this.Lc(b,16,k);return b};Fa(N,od);pa(N,od);N.ed=function(a){return a.title};N.of=function(a,b){if(a)a.title=b||R};var qs="goog-button";N.P=function(){return qs};function rs(a){for(var b;a;){b=Hd(a);if(b=ss[b])break;a=a.b?a.b[yb]:i}if(b)return Gd(b.ha)?b.ha():new b;return i}function ts(a,b){if(!a)d(l("Invalid class name "+a));if(!Gd(b))d(l("Invalid decorator function "+b));us[a]=b}var ss={},us={};function vs(a,b,c){Iq[H](this,c);this.k=b||rs(this[yb]);this.rh(a)}Q(vs,Iq);N=vs[v];N.oa=i;N.ic=0;N.Ic=39;N.Qc=255;N.Md=0;N.w=h;N.ra=i;N.we=h;N.Xd=k;N.hf=function(a){this.n&&a!=this.we&&this.ig(a);this.we=a};N.M=function(){return this.k.M(this)};N.Zc=function(){return this.fa||(this.fa=new Hr)};N.ni=function(a){if(a){if(this.ra)Sd(this.ra,a)||this.ra[t](a);else this.ra=[a];this.k.gg(this,a,h)}};N.Xk=function(a){if(a&&this.ra){Td(this.ra,a);if(this.ra[u]==0)this.ra=i;this.k.gg(this,a,k)}};
N.Tc=function(a,b){b?this.ni(a):this.Xk(a)};N.d=function(){var a=this.k.d(this);this.ff(a);this.k.ql(a);this.Xd||this.k.Ad(a,k);this.w||this.k.N(a,k)};N.L=function(){return this.k.L(this.a())};N.O=function(){vs.b.O[H](this);this.k.Ub(this);if(this.Ic&-2){this.we&&this.ig(h);if(this.ba(32)){var a=this.M();if(a){var b=this.Zc();b.Mf(a);this.W().m(b,Or,this.Ea).m(a,ho,this.fd).m(a,bo,this.nb)}}}};
N.ig=function(a){var b=this.W(),c=this.a();if(a){b.m(c,Ci,this.ye).m(c,xp,this.ob).m(c,Cp,this.wc).m(c,Di,this.xe);S&&b.m(c,fo,this.wg)}else{b.Z(c,Ci,this.ye).Z(c,xp,this.ob).Z(c,Cp,this.wc).Z(c,Di,this.xe);S&&b.Z(c,fo,this.wg)}};N.ca=function(){vs.b.ca[H](this);this.fa&&this.fa.detach();this.w&&this.U()&&this.k.wb(this,k)};N.g=function(){vs.b.g[H](this);if(this.fa){this.fa.K();delete this.fa}delete this.k;this.ra=this.oa=i};N.Ga=function(a){this.k.Ga(this.a(),a);this.rh(a)};
N.rh=function(a){this.oa=a};N.ne=function(){var a=this.oa;if(!a||Ed(a))return a;return(a=zd(a)?Rd(a,og)[L](R):og(a))&&re(a)};N.hc=function(a){vs.b.hc[H](this,a);var b=this.a();b&&this.k.hc(b,a)};N.Ad=function(a){this.Xd=a;var b=this.a();b&&this.k.Ad(b,a)};var ws="show",xs="hide";N.N=function(a,b){if(b||this.w!=a&&this[z](a?ws:xs)){(b=this.a())&&this.k.N(b,a);this.U()&&this.k.wb(this,a);this.w=a;return h}return k};N.U=function(){return!this.sa(1)};N.Ha=function(a){this.Vb(2,a)&&this.ma(2,a)};
N.ia=function(){return this.sa(4)};N.setActive=function(a){this.Vb(4,a)&&this.ma(4,a)};N.nf=function(a){this.Vb(8,a)&&this.ma(8,a)};N.rk=function(){return this.sa(16)};N.tl=function(a){this.Vb(16,a)&&this.ma(16,a)};N.Kg=function(){return this.sa(32)};N.uh=function(a){this.Vb(32,a)&&this.ma(32,a)};N.isOpen=function(){return this.sa(64)};N.F=function(a){this.Vb(64,a)&&this.ma(64,a)};N.sa=function(a){return!!(this.ic&a)};
N.ma=function(a,b){if(this.ba(a)&&b!=this.sa(a)){this.k.ma(this,a,b);this.ic=b?this.ic|a:this.ic&~a}};N.Il=function(a){this.ic=a};N.ba=function(a){return!!(this.Ic&a)};N.yb=function(a,b){if(this.n&&this.sa(a)&&!b)d(l(Yq));!b&&this.sa(a)&&this.ma(a,k);this.Ic=b?this.Ic|a:this.Ic&~a};N.aa=function(a){return!!(this.Qc&a)&&this.ba(a)};N.sl=function(a,b){this.Qc=b?this.Qc|a:this.Qc&~a};N.sh=function(a,b){this.Md=b?this.Md|a:this.Md&~a};
N.Vb=function(a,b){return this.ba(a)&&this.sa(a)!=b&&(!(this.Md&a)||this[z](Wq(a,b)))&&!this.je};var ys="enter";N.ye=function(a){a[db]&&!cg(this.a(),a[db])&&this[z](ys)&&this.U()&&this.aa(2)&&this.Ha(h)};var zs="leave";N.xe=function(a){if(a[db]&&!cg(this.a(),a[db])&&this[z](zs)){this.aa(4)&&this[bd](k);this.aa(2)&&this.Ha(k)}};N.ob=function(a){if(this.U()){this.aa(2)&&this.Ha(h);if(a.Ie(0)){this.aa(4)&&this[bd](h);this.k.rb(this)&&this.M()[hc]()}}!this.Xd&&a.Ie(0)&&a[Gb]()};
N.wc=function(a){if(this.U()){this.aa(2)&&this.Ha(h);this.ia()&&this.$b(a)&&this.aa(4)&&this[bd](k)}};N.wg=function(a){this.U()&&this.$b(a)};var As="action",Bs="altKey",Cs="ctrlKey",Ds="metaKey",Es="shiftKey";N.$b=function(a){this.aa(16)&&this.tl(!this.rk());this.aa(8)&&this.nf(h);this.aa(64)&&this.F(!this[ec]());var b=new zi(As,this);if(a)for(var c=[Bs,Cs,Ds,Es],e,f=0;e=c[f];f++)b[e]=a[e];return this[z](b)};N.fd=function(){this.aa(32)&&this.uh(h)};
N.nb=function(){this.aa(4)&&this[bd](k);this.aa(32)&&this.uh(k)};N.Ea=function(a){if(this.w&&this.U()&&this.Rb(a)){a[Gb]();a[Bb]();return h}return k};N.Rb=function(a){return a[nc]==13&&this.$b(a)};var Fs=vs,Gs=Xr;if(!Gd(Fs))d(l("Invalid component class "+Fs));if(!Gd(Gs))d(l("Invalid renderer class "+Gs));var Hs=Hd(Fs);ss[Hs]=Gs;ts(gs,function(){return new vs(i)});function Is(){ps[H](this)}Q(Is,ps);pd(Is);N=Is[v];N.jb=function(){return undefined};N.d=function(a){this.Ml(a);return a.z().d(or,{"class":this.Lb(a)[L](ue),disabled:!a.U(),title:a.ed()||R,value:a[J]()||R},a.ne()||R)};N.Ub=function(a){a.W().m(a.a(),Fi,a.$b)};N.Ad=od;N.hc=od;N.rb=function(a){return a.U()};N.wb=od;N.ma=function(a,b,c){Is.b.ma[H](this,a,b,c);if((a=a.a())&&b==1)a.disabled=c};Fa(N,function(a){return a[Db]});pa(N,function(a,b){if(a)a.value=b});N.Lc=od;
N.Ml=function(a){a.hf(k);a.sl(255,k);a.yb(32,k)};function Js(a,b,c){vs[H](this,a,b||Is.ha(),c)}Q(Js,vs);N=Js[v];Fa(N,function(){return this.Rh});pa(N,function(a){this.Rh=a;this.k[bb](this.a(),a)});N.ed=function(){return this.Ph};N.of=function(a){this.Ph=a;this.k.of(this.a(),a)};N.g=function(){Js.b.g[H](this);delete this.Rh;delete this.Ph};N.O=function(){Js.b.O[H](this);if(this.ba(32)){var a=this.M();a&&this.W().m(a,Nr,this.Rb)}};N.Rb=function(a){if(a[nc]==13&&a[I]==Or||a[nc]==32&&a[I]==Nr)return this.$b(a);return a[nc]==32};ts(qs,function(){return new Js(i)});function Ks(){return Xr[H](this)}Q(Ks,Xr);pd(Ks);Ks[v].d=function(a){return a.z().d(xo,this.P())};Ks[v].Ga=function(){};var Ls="goog-menuseparator";Ks[v].P=function(){return Ls};function Ms(a,b){vs[H](this,i,a||Ks.ha(),b);this.yb(1,k);this.yb(2,k);this.yb(4,k);this.yb(32,k);this.Il(1)}Q(Ms,vs);var Ns="separator";Ms[v].O=function(){Ms.b.O[H](this);op(this.a(),Ns)};ts(Ls,function(){return new Ms});function Os(){}pd(Os);N=Os[v];N.jb=function(){return undefined};N.ek=function(a){if(a){var b=a.getAttributeNode(jg);if(b&&b.specified){a=a.tabIndex;return Fd(a)&&a>=0}}return k};N.jg=function(a,b){if(a)a.tabIndex=b?0:-1};N.d=function(a){return a.z().d(xo,this.Lb(a)[L](ue))};N.L=function(a){return a};N.Ub=function(a){a=a.a();Eq(a,h,ff);if(S)a.hideFocus=h;var b=this.jb();b&&op(a,b)};N.M=function(a){return a.a()};var Ps="goog-container";N.P=function(){return Ps};
var Qs="horizontal",Rs="-horizontal",Ss="-vertical";N.Lb=function(a){var b=this.P(),c=a.Zb==Qs;c=[b,c?b+Rs:b+Ss];a.U()||c[t](b+is);return c};var Ts="vertical";function Us(a,b,c){Iq[H](this,c);this.k=b||Os.ha();this.Zb=a||Ts}Q(Us,Iq);N=Us[v];N.vk=i;N.fa=i;N.k=i;N.Zb=i;N.w=h;N.gb=h;N.me=h;N.ea=-1;N.I=i;N.Re=k;N.ri=k;N.La=i;N.M=function(){return this.vk||this.k.M(this)};N.Zc=function(){return this.fa||(this.fa=new Hr(this.M()))};N.d=function(){this.ff(this.k.d(this))};N.L=function(){return this.k.L(this.a())};
N.O=function(){Us.b.O[H](this);this.Jb(function(b){b.n&&this.jh(b)},this);var a=this.a();this.k.Ub(this);this.N(this.w,h);this.W().m(this,ys,this.te).m(this,Mq,this.ue).m(this,Nq,this.ze).m(this,Uq,this.Wj).m(this,Vq,this.Pj).m(a,xp,this.ob).m(Cf(a),Cp,this.Rj).m(a,[xp,Cp,Ci,Di],this.Oj);this.rb()&&this.hg(h)};N.hg=function(a){var b=this.W(),c=this.M();a?b.m(c,ho,this.fd).m(c,bo,this.nb).m(this.Zc(),Or,this.Ea):b.Z(c,ho,this.fd).Z(c,bo,this.nb).Z(this.Zc(),Or,this.Ea)};
N.ca=function(){this.ec(-1);this.I&&this.I.F(k);this.Re=k;Us.b.ca[H](this)};N.g=function(){Us.b.g[H](this);if(this.fa){this.fa.K();this.fa=i}this.k=this.I=this.La=i};N.te=function(){return h};var Vs="activedescendant";N.ue=function(a){var b=this.md(a[F]);if(b>-1&&b!=this.ea){var c=this.Nb();c&&c.Ha(k);this.ea=b;c=this.Nb();this.Re&&c[bd](h);if(this.I&&c!=this.I)c.ba(64)?c.F(h):this.I.F(k)}qp(this.a(),Vs,a[F].a().id)};N.ze=function(a){if(a[F]==this.Nb())this.ea=-1;qp(this.a(),Vs,R)};
N.Wj=function(a){if((a=a[F])&&a!=this.I&&a.R==this){this.I&&this.I.F(k);this.I=a}};N.Pj=function(a){if(a[F]==this.I)this.I=i};N.ob=function(a){this.gb&&this.gc(h);var b=this.M();this.k.ek(b)?b[hc]():a[Gb]()};N.Rj=function(){this.gc(k)};N.Oj=function(a){var b=this.Ej(a[F]);if(b)switch(a[I]){case xp:b.ob(a);break;case Cp:b.wc(a);break;case Ci:b.ye(a);break;case Di:b.xe(a);break}};N.Ej=function(a){if(this.La)for(var b=this.a();a&&a[Rc]&&a!=b;){var c=a.id;if(c in this.La)return this.La[c];a=a[Rc]}return i};
N.fd=function(){};N.nb=function(){this.ec(-1);this.gc(k);this.I&&this.I.F(k)};N.Ea=function(a){if(this.U()&&this.Sa()!=0&&this.Rb(a)){a[Gb]();a[Bb]();return h}return k};
N.Rb=function(a){var b=this.Nb();if(b&&typeof b.Ea==wd&&b.Ea(a))return h;if(this.I&&this.I!=b&&typeof this.I.Ea==wd&&this.I.Ea(a))return h;switch(a[nc]){case 27:if(this.rb())this.M().blur();else return k;break;case 36:this.ik();break;case 35:this.jk();break;case 38:if(this.Zb==Ts)this.Ee();else return k;break;case 37:if(this.Zb==Qs)this.Le()?this.De():this.Ee();else return k;break;case 40:if(this.Zb==Ts)this.De();else return k;break;case 39:if(this.Zb==Qs)this.Le()?this.Ee():this.De();else return k;
break;default:return k}return h};N.jh=function(a){var b=a.a();b=b.id||(b.id=a.Ob());if(!this.La)this.La={};this.La[b]=a};N.Mc=function(a,b){Us.b.Mc[H](this,a,b)};N.kc=function(a,b,c){a.sh(2,h);a.sh(64,h);if(this.rb()||!this.ri)a.yb(32,k);a.hf(k);Us.b.kc[H](this,a,b,c);c&&this.n&&this.jh(a);b<=this.ea&&this.ea++};N.removeChild=function(a,b){var c=this.md(a);if(c!=-1)if(c==this.ea)a.Ha(k);else c<this.ea&&this.ea--;(c=a.a())&&c.id&&ke(this.La,c.id);a=Us.b[Vb][H](this,a,b);a.hf(h);return a};var Ws="aftershow";
N.N=function(a,b){if(b||this.w!=a&&this[z](a?ws:xs)){this.w=a;var c=this.a();if(c){yq(c,a);this.rb()&&this.k.jg(this.M(),this.gb&&this.w);this.w&&!b&&this[z](Ws)}return h}return k};N.U=function(){return this.gb};N.rb=function(){return this.me};N.wb=function(a){a!=this.me&&this.n&&this.hg(a);this.me=a;this.gb&&this.w&&this.k.jg(this.M(),a)};N.ec=function(a){if(a=this.Ra(a))a.Ha(h);else this.ea>-1&&this.Nb().Ha(k)};N.Ha=function(a){this.ec(this.md(a))};N.Nb=function(){return this.Ra(this.ea)};
N.ik=function(){this.kd(function(a,b){return(a+1)%b},this.Sa()-1)};N.jk=function(){this.kd(function(a,b){a--;return a<0?b-1:a},0)};N.De=function(){this.kd(function(a,b){return(a+1)%b},this.ea)};N.Ee=function(){this.kd(function(a,b){a--;return a<0?b-1:a},this.ea)};N.kd=function(a,b){b=b<0?this.md(this.I):b;var c=this.Sa();b=a(b,c);for(var e=0;e<=c;){var f=this.Ra(b);if(f&&this.Rf(f)){this.Dl(b);return h}e++;b=a(b,c)}return k};N.Rf=function(a){return a.w&&a.U()&&a.ba(2)};N.Dl=function(a){this.ec(a)};
N.gc=function(a){this.Re=a};function Xs(){Xr[H](this);this.Tf=[]}Q(Xs,Xr);pd(Xs);N=Xs[v];var Ys="-highlight",Zs="-checkbox";N.Yc=function(a){var b=this.Tf[a];if(!b){switch(a){case 0:b=this.Pb()+Ys;break;case 1:b=this.Pb()+Zs;break;case 2:b=this.Pb()+fr;break}this.Tf[a]=b}return b};var $s="menuitem";N.jb=function(){return $s};N.d=function(a){var b=a.z().d(xo,this.Lb(a)[L](ue),this.Gi(a.oa,a.z()));this.zl(a,b,a.ba(8)||a.ba(16));return b};N.L=function(a){return a&&a[pc]};
N.Ga=function(a,b){var c=this.L(a),e=this.Ce(a)?c[pc]:i;Xs.b.Ga[H](this,a,b);if(e&&!this.Ce(a))c[Ib](e,c[pc]||i)};N.Gi=function(a,b){var c=this.Yc(2);return b.d(xo,c,a)};N.Ce=function(a){if(a=this.L(a)){a=a[pc];var b=this.Yc(1);return!!a&&!!a[cb]&&a[cb][y](b)!=-1}return k};var at="goog-option";N.zl=function(a,b,c){if(c!=this.Ce(b)){var e=b,f=at;c?yf(e,f):zf(e,f);b=this.L(b);if(c){c=this.Yc(1);b[Ib](a.z().d(xo,c),b[pc]||i)}else b[Vb](b[pc])}};var bt="goog-option-selected";
N.Xc=function(a){switch(a){case 2:return this.Yc(0);case 16:case 8:return bt;default:return Xs.b.Xc[H](this,a)}};var ct="goog-menuitem";N.P=function(){return ct};function dt(a,b,c,e){vs[H](this,a,e||Xs.ha(),c);this[bb](b)}Q(dt,vs);Fa(dt[v],function(){var a=this.Qe;return a!=i?a:this.ne()});pa(dt[v],function(a){this.Fl(a)});ts(ct,function(){return new dt(i)});function et(){Os[H](this)}Q(et,Os);pd(et);var ft="menu";et[v].jb=function(){return ft};et[v].db=function(a,b){return cg(a.a(),b)};var gt="goog-menu";et[v].P=function(){return gt};var ht="haspopup";et[v].Ub=function(a){et.b.Ub[H](this,a);a=a.a();qp(a,ht,ai)};ts(Ls,function(){return new Ms});function it(a,b){Us[H](this,Ts,b||et.ha(),a);this.wb(k)}Q(it,Us);N=it[v];N.Wd=h;N.si=k;N.P=function(){return this.k.P()};N.db=function(a){if(this.k.db(this,a))return h;for(var b=0,c=this.Sa();b<c;b++){var e=this.Ra(b);if(typeof e.db==wd&&e.db(a))return h}return k};N.Ia=function(a){this.Mc(a,h)};N.Bb=function(a,b){this.kc(a,b,h)};N.tc=function(a){return this.Ra(a)};N.pe=function(){return this.Sa()};N.pl=function(a){(this.Wd=a)&&this.wb(h)};
N.N=function(a,b){(b=it.b.N[H](this,a,b))&&a&&this.n&&this.Wd&&this.M()[hc]();return b};N.te=function(a){this.Wd&&this.M()[hc]();return it.b.te[H](this,a)};N.Rf=function(a){return(this.si||a.U())&&a.w&&a.ba(2)};function jt(){ps[H](this)}Q(jt,ps);pd(jt);var kt="goog-inline-block ";jt[v].d=function(a){var b=this.Lb(a);b={"class":kt+b[L](ue),title:a.ed()||R};return a.z().d(xo,b,this.de(a.oa,a.z()))};jt[v].L=function(a){return a&&a[pc][pc]};var lt="-outer-box",mt="-inner-box";jt[v].de=function(a,b){return b.d(xo,kt+(this.P()+lt),b.d(xo,kt+(this.P()+mt),a))};var nt="goog-custom-button";jt[v].P=function(){return nt};function ot(){jt[H](this)}Q(ot,jt);pd(ot);if(ff)ot[v].Ga=function(a,b){var c=ot.b.L[H](this,a&&a[pc]);c&&ag(this.createCaption(b,Af(a)),c)};N=ot[v];N.L=function(a){a=ot.b.L[H](this,a&&a[pc]);if(ff&&a&&a.__goog_wrapper_div)a=a[pc];return a};N.de=function(a,b){return ot.b.de[H](this,[this.createCaption(a,b),this.Ii(b)],b)};var pt="-caption";N.createCaption=function(a,b){var c=this.P();return a=b.d(xo,kt+(c+pt),a)};var qt="-dropdown",rt="\u00a0";N.Ii=function(a){return a.d(xo,kt+(this.P()+qt),rt)};
var st="goog-menu-button";N.P=function(){return st};function tt(a,b,c,e){Js[H](this,a,c||ot.ha(),e);this.yb(64,h);b&&this.Ed(b);this.Y=new Hk(500)}Q(tt,Js);N=tt[v];N.Kf=h;N.af=k;N.Je=k;N.O=function(){tt.b.O[H](this);this.e&&this.Pc(this.e,h);qp(this.a(),ht,ai)};N.ca=function(){tt.b.ca[H](this);if(this.e){this.F(k);this.e.ca();this.Pc(this.e,k);var a=this.e.a();a&&$f(a)}};N.g=function(){tt.b.g[H](this);if(this.e){this.e.K();delete this.e}this.Y.K()};N.ob=function(a){tt.b.ob[H](this,a);if(this.ia()){this.F(!this[ec]());this.e&&this.e.gc(this[ec]())}};
N.wc=function(a){tt.b.wc[H](this,a);this.e&&!this.ia()&&this.e.gc(k)};N.$b=function(){this[bd](k);return h};N.Qj=function(a){this.e&&this.e.w&&!this.db(a[F])&&this.F(k)};N.db=function(a){return a&&cg(this.a(),a)||this.e&&this.e.db(a)||k};N.Rb=function(a){var b=a[nc]==32?Nr:Or;if(a[I]!=b)return k;if(this.e&&this.e.w){b=this.e.Ea(a);if(a[nc]==27){this.F(k);return h}return b}if(a[nc]==40||a[nc]==38||a[nc]==32){this.F(h);return h}return k};N.ve=function(){this.F(k)};N.Vj=function(){this.ia()||this.F(k)};
N.nb=function(a){this.Je||this.F(k);tt.b.nb[H](this,a)};N.uc=function(){this.e||this.Ed(new it(this.z()));return this.e||i};N.Ed=function(a){var b=this.e;if(a!=b){if(b){this.F(k);this.n&&this.Pc(b,k);delete this.e}if(a){this.e=a;a.jf(this);a.N(k);a.pl(this.Je);this.n&&this.Pc(a,h)}}return b};N.Ia=function(a){this.uc().Mc(a,h)};N.Bb=function(a,b){this.uc().kc(a,b,h)};N.tc=function(a){return this.e?this.e.Ra(a):i};N.pe=function(){return this.e?this.e.Sa():0};
N.N=function(a,b){(a=tt.b.N[H](this,a,b))&&!this.w&&this.F(k);return a};N.F=function(a){tt.b.F[H](this,a);if(this.e&&this.sa(64)==a){if(a){this.e.n||this.e.va();this.Th=hq(this.a());this.Nf=sq(this.a());this.gh();this.e.ec(-1)}else{this[bd](k);this.e.gc(k);if(this.rd!=i){this.rd=undefined;var b=this.e.a();b&&mq(b,R,R)}}this.e.N(a);this.ti(a)}};
N.gh=function(){var a=this.Kf?5:7;a=new Wr(this.a(),a,!this.af,this.af);var b=this.e.a();if(!this.e.w){La(b[Ob],pq);yq(b,h)}if(!this.rd&&this.af)this.rd=rq(b);var c=this.Kf?4:6;a.ub(b,c,i,this.rd);if(!this.e.w){yq(b,k);La(b[Ob],dq)}};N.Kk=function(){var a=sq(this.a()),b=hq(this.a()),c;c=this.Nf;c=c==a?h:!c||!a?k:c[D]==a[D]&&c[w]==a[w]&&c.top==a.top&&c[K]==a[K];if(!c||!zh(this.Th,b)){this.Nf=a;this.Th=b;this.gh()}};
N.Pc=function(a,b){var c=this.W();b=b?c.m:c.Z;b[H](c,a,As,this.ve);b[H](c,a,Mq,this.ue);b[H](c,a,Nq,this.ze)};N.ue=function(a){qp(this.a(),Vs,a[F].a().id)};N.ze=function(){this.e.Nb()||qp(this.a(),Vs,R)};N.ti=function(a){var b=this.W(),c=a?b.m:b.Z;c[H](b,this.z().i,xp,this.Qj,h);this.Je&&c[H](b,this.e,bo,this.Vj);c[H](b,this.Y,Kk,this.Kk);a?this.Y.start():this.Y[Pa]()};ts(st,function(){return new tt(i)});function ut(a){hj[H](this);this.sb=[];this.pi(a)}Q(ut,hj);N=ut[v];N.vb=i;N.ph=i;N.pe=function(){return this.sb[u]};N.lk=function(a){return a?Od(this.sb,a):-1};N.tc=function(a){return this.sb[a]||i};N.pi=function(a){if(a){Pd(a,function(b){this.yd(b,k)},this);Vd(this.sb,a)}};N.Ia=function(a){this.Bb(a,this.pe())};N.Bb=function(a,b){if(a){this.yd(a,k);Wd(this.sb,b,0,a)}};N.ad=function(){return this.vb};N.xb=function(a){if(a!=this.vb){this.yd(this.vb,k);this.vb=a;this.yd(a,h)}this[z](Qq)};N.$c=function(){return this.lk(this.vb)};
N.Ah=function(a){this.xb(this.tc(a))};Ea(N,function(){var a=this.sb;if(!zd(a))for(var b=a[u]-1;b>=0;b--)delete a[b];oa(a,0);this.vb=i});N.g=function(){ut.b.g[H](this);delete this.sb;this.vb=i};N.yd=function(a,b){if(a)if(typeof this.ph==wd)this.ph(a,b);else typeof a.nf==wd&&a.nf(b)};function vt(a,b,c,e){tt[H](this,a,b,c,e);this.xl(a)}Q(vt,tt);N=vt[v];N.u=i;N.he=i;N.O=function(){vt.b.O[H](this);this.tf()};N.g=function(){vt.b.g[H](this);if(this.u){this.u.K();this.u=i}this.he=i};N.ve=function(a){this.xb(a[F]);vt.b.ve[H](this,a);a[Bb]();this[z](As)};N.Xj=function(){var a=this.ad();vt.b[bb][H](this,a&&a[J]());this.tf()};N.Ed=function(a){var b=vt.b.Ed[H](this,a);if(a!=b){this.u&&this.u.clear();if(a)this.u?a.Jb(function(c){this.u.Ia(c)},this):this.fe(a)}return b};
N.xl=function(a){this.he=a;this.tf()};N.Ia=function(a){vt.b.Ia[H](this,a);this.u?this.u.Ia(a):this.fe(this.uc())};N.Bb=function(a,b){vt.b.Bb[H](this,a,b);this.u?this.u.Bb(a,b):this.fe(this.uc())};N.xb=function(a){this.u&&this.u.xb(a)};N.Ah=function(a){this.u&&this.xb(this.u.tc(a))};pa(N,function(a){if(a!=i&&this.u)for(var b=0,c;c=this.u.tc(b);b++)if(c&&typeof c[J]==wd&&c[J]()==a){this.xb(c);return}this.xb(i)});N.ad=function(){return this.u?this.u.ad():i};
N.$c=function(){return this.u?this.u.$c():-1};N.fe=function(a){this.u=new ut;a&&a.Jb(function(b){this.u.Ia(b)},this);this.W().m(this.u,Qq,this.Xj)};N.tf=function(){var a=this.ad();this.Ga(a?a.ne():this.he)};N.F=function(a){vt.b.F[H](this,a);this[ec]()&&this.uc().ec(this.$c())};ts("goog-select",function(){return new vt(i)});var wt="http://www.google.com/uds",xt="/modules/gviz/";function yt(){var a=wt,b=kp,c=O.google;if(c&&c.loader&&c.loader.ServiceBase)a=c.loader.ServiceBase;if(c&&c[Kb]&&c[Kb].Version)b=c[Kb].Version;return a+xt+b}var zt="LINK",At="text/css";function Bt(a){var b=yt();b=b+a;a=p[cd](zt);for(var c=0;c<a[u];c++)if(a[c]&&a[c][Bc]&&a[c][Bc]==b)return;a=p[jc](Uj);a.href=b;a.rel=Vj;Ca(a,At);if(p[cd](Gl)[u]==0){b=p[cd](Hl)[0];c=p[cd](Il)[0];var e=p[jc](Gl);b[Ib](e,c)}b=p[cd](Gl)[0];b[Ma](a)};var Ct="/util/util.css";function Dt(a,b){this.qa=Af();this.cb=a;this.Qf=[];Bt(Ct);this.Si(b)}Dt[v].cc=i;var Et="google-visualization-toolbar",Ft=Et+"-export-igoogle",Gt=Et+"-export-data",Ht=Et+"-html-code",It=Et+"-small-dialog",Jt=Et+"-big-dialog",Kt=Et+"-html-code-explanation",Lt=Et+"-triangle",Mt="Copy-Paste this code to an HTML page",Nt="br",Ot="pre",Pt="Google Visualization";
function Qt(a,b){var c=Af(),e,f;switch(a){case 2:e=new $q(It);f=c.d(xo,i,c.d(xo,{"class":Kt},Mt),c.d(Nt,i),c.d(Ot,i,c.d(xo,i,b[Lb])));break;case 3:e=new $q(Jt);f=c.d(xo,i,c.d(xo,{"class":Kt},Mt),c.d(Nt,i));a=b[Lb];a=c.d(xo,i,c.d(Ot,i,a));c[Ma](f,a);break}e.Ga(f.innerHTML);sa(e.Kj(),Pt);sa(e.tj(),R);e.N(h)}
var Rt="Container is not defined",St="Chart options",Tt="\u25bc",Ut="package",Vt="width: 700px; height: 500px;",Wt="csv",Xt="tqx",Yt="out:csv;",Zt="Google_Visualization",$t="Export data as CSV",au="htmlcode",bu='<iframe style="',cu='" src="http://www.google.com/ig/ifr?url=',du="&up__table_query_url=",eu='" />',fu="Publish to web page",gu="jscode",hu='<html>\n <head>\n  <title>Google Visualization API</title>\n  <script type="text/javascript" src="http://www.google.com/jsapi"><\/script>\n  <script type="text/javascript">\n   google.load(\'visualization\', \'1\', {packages: [\'',
iu="']});\n\n   function drawVisualization() {\n    new google.visualization.Query('",ju="').send(\n     function(response) {\n      new ",ku='(\n       document.getElementById(\'visualization\')).\n        draw(response.getDataTable(), null);\n      });\n   }\n\n   google.setOnLoadCallback(drawVisualization);\n  <\/script>\n </head>\n <body>\n  <div id="visualization" style="width: 500px; height: 500px;"></div>\n </body>\n</html>',lu="Javascript code",mu="out:html;",nu="Export data as HTML",ou="igoogle",
pu="http://www.google.com/ig/adde?moduleurl=",qu="Add to iGoogle";
Dt[v].Si=function(a){a=a||{};var b=this.cb,c=this.qa;c.Ye(b);if(!b)d(l(Rt));var e=c.d(wo,i),f=[c.d(wo,i,St),c.d(xo,{"class":Lt},Tt)];this.cc=new vt(f);if(a)for(f=0;f<a[u];f++){var g=i;g=a[f];var j=g[I],n=g.datasource,s=g.gadget,A=g.userprefs,B=g[Kb],M=g[Ut],G=g[Ob]||Vt;switch(j){case Wt:g=this.nc(f,Md(function(E){o[Za]((new mj(E)).yh(Xt,Yt),Zt)},n),$t,Gt);break;case au:g=this.nc(f,Md(function(E,$){E=bu+G+cu+ca(E)+du+ca($)+ru(A)+eu;Qt(2,{message:E})},s,n),fu,Ht);break;case gu:g=this.nc(f,Md(function(E,
$,da){E=hu+ca($)+iu+E+ju+ca(da)+ku;Qt(3,{message:E})},n,M,B),lu,Ht);break;case Hl:g=this.nc(f,Md(function(E){o[Za]((new mj(E)).yh(Xt,mu),Zt)},n),nu,Gt);break;case ou:g=this.nc(f,Md(function(E,$,da){o[Za](pu+ca(E)+du+ca($)+ru(da))},s,n,A),qu,Ft);break;default:d(l("No such toolbar component as: "+g.toSource()))}g&&this.cc.Ia(g)}Yi(this.cc,As,Ld(this.Yj,this));this.cc.va(e);c[Ma](b,e)};Dt[v].yl=function(){this.cc.Ah(-1)};Dt[v].Yj=function(){var a=this.cc.$c();this.Qf[a]();this.yl()};
Dt[v].nc=function(a,b,c){c=new dt(c);this.Qf[a]=b;return c};var su="&up_";function ru(a){if(!a)return R;var b=R;for(var c in a)b+=su+c+Hj+ca(a[c]);return b}function tu(a,b){new Dt(a,b)};var uu="google.visualization.Player.",vu="_swf";function wu(a){this.qa=Af();this.cb=a;this.qf=this.dh=this.Mi=this.pa=this.Hh=this.Hb=this.Ld=i;this.jc=uu+xu++ +vu;yu[this.jc]=this;Bt(Ct)}var xu=0,yu={},zu=yt()+"/util/player.swf";N=wu[v];N.Nk=function(a){this.Ld=a.start||0;this.Hb=a.end||i;if(!this.Hb)d(l("end is mandatory."));this.Hh=a.step||1;this.pa=a.current||this.Ld;this.Mi=a.play||k;this.dh=a.timeInterval||100};
N.draw=function(a){a=a||{};this.Nk(a);var b=this.cb,c=this.qa;c.Ye(b);if(!b)d(l(Rt));this.ok(a)};var Au="9",Bu="#fff",Cu="allowScriptAccess",Du="always",Eu="allowFullscreen",Fu="name";N.ok=function(a){var b=this.cb,c=a[w]||b[w]||500;a=a[K]||b[K]||25;c=new SWFObject(zu,this.jc,c,a,Au,Bu);c.addParam(ft,bi);c.addParam(Cu,Du);c.addParam(Eu,ai);c.addVariable(Fu,this.jc);if(!b.id)b.id=this.jc;c.write(b.id)};N.Hd=function(){var a=p[sb](this.jc);a.setPos(this.pa)};
N.Ei=function(){var a=p[sb](this.jc);a.init(this.Ld,this.Hb);this.Hd()};N.xg=function(a){if(a){if(this.pa==this.Hb)this.pa=this.Ld;this.qf=setInterval(Ld(this.Qk,this),this.dh)}else ba(this.qf)};var Gu="play";N.Qk=function(){this.Hd();ka[Kb].events.trigger(this,Gu,{current:this.pa});this.pa+=this.Hh;if(this.pa>=this.Hb){this.pa=this.Hb;ba(this.qf)}this.Hd()};var Hu="pause",Iu="seek",Ju="seekRelease";
function Ku(a,b,c){a=yu[a];switch(b){case Gu:a.xg(h);break;case Hu:a.xg(k);break;case Nj:a.Ei();break;case Iu:case Ju:a.pa=r[qb](c);ka[Kb].events.trigger(a,Gu,{current:a.pa});a.Hd();break;default:break}};var Lu={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",
darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",
ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",
lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",
moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",
seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};var Mu="hex",Nu="rgb",Ou="named";function Pu(a){var b={};a=ha(a);var c=a.charAt(0)==qj?a:qj+a;if(Qu[ab](c)){b.jd=Ru(c);Ca(b,Mu);return b}else{a:{var e=a[$b](Su);if(e){c=ia(e[1]);var f=ia(e[2]);e=ia(e[3]);if(c>=0&&c<=255&&f>=0&&f<=255&&e>=0&&e<=255){c=[c,f,e];break a}}c=[]}if(c[u]){b.jd=Tu(c[0],c[1],c[2]);Ca(b,Nu);return b}else if(Lu)if(c=Lu[a[dd]()]){b.jd=c;Ca(b,Ou);return b}}d(l(a+" is not a valid color string"))}var Uu=/#(.)(.)(.)/,Vu="#$1$1$2$2$3$3";
function Ru(a){if(!Qu[ab](a))d(l(bh+a+"' is not a valid hex color"));if(a[u]==4)a=a[x](Uu,Vu);return a[dd]()}function Wu(a){a=Ru(a);var b=fa(a[hd](1,2),16),c=fa(a[hd](3,2),16);a=fa(a[hd](5,2),16);return[b,c,a]}function Tu(a,b,c){a=ia(a);b=ia(b);c=ia(c);if(ma(a)||a<0||a>255||ma(b)||b<0||b>255||ma(c)||c<0||c>255)d(l('"('+a+Cg+b+Cg+c+'") is not a valid RGB color'));a=Xu(a[Sa](16));b=Xu(b[Sa](16));c=Xu(c[Sa](16));return qj+a+b+c}var Qu=/^#(?:[0-9a-f]{3}){1,2}$/i,Su=/^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;
function Xu(a){return a[u]==1?Le+a:a};function Yu(a){this.V=a||{};Bt(Ct)}var Zu="google-visualization-formatters-arrow-dr",$u="google-visualization-formatters-arrow-ug",av="google-visualization-formatters-arrow-empty",bv="className";Yu[v].C=function(a,b){if(a[oc](b)==P){var c=this.V;c=c.base||0;for(var e=0;e<a[Va]();e++){var f=a[J](e,b),g=i;g=f<c?Zu:f>c?$u:av;a[lc](e,b,bv,g)}}};var cv="/util/bar_";function dv(a){this.V=a||{};ev||(ev=yt()+cv)}var ev=i,fv="r",gv="b",hv={red:fv,blue:gv,green:Oe},iv='<img style="padding: 0" src="',jv='.png" height="12" width="';function kv(a,b,c){b>0&&c[t](iv,ev,a,jv,b,eu)}var lv='<span style="padding: 0; float: left; white-space: nowrap;">',mv="w",nv="_bar_format_old_value",ov="</span>\u00a0";
dv[v].C=function(a,b){if(a[oc](b)==P){var c=this.V,e=c.min,f=c.max,g=i;if(e==i||f==i){g=a[tc](b);if(f==i)f=g.max;if(e==i)e=r.min(0,g.min)}if(e>=f){g=g||a[tc](b);f=g.max;e=g.min}if(e==f)if(e==0)f=1;else if(e>0)e=0;else f=0;g=f-e;var j=c.base||0;j=r.max(e,r.min(f,j));var n=c[w]||100,s=c.showValue;if(s==i)s=h;for(var A=r[hb]((j-e)/g*n),B=n-A,M=0;M<a[Va]();M++){var G=a[J](M,b),E=[];G=r.max(e,r.min(f,G));var $=r.ceil((G-e)/g*n);E[t](lv);kv(ph,1,E);var da=pv(c.colorPositive,gv),Ja=pv(c.colorNegative,fv),
Qa=c.drawZeroLine?1:0;if(A>0)if(G<j){kv(mv,$,E);kv(Ja,A-$,E);Qa>0&&kv(rh,Qa,E);kv(mv,B,E)}else{kv(mv,A,E);Qa>0&&kv(rh,Qa,E);kv(da,$-A,E);kv(mv,n-$,E)}else{kv(da,$,E);kv(mv,n-$,E)}kv(ph,1,E);G=a[Pb](M,b,nv);if(G==i){G=a[Mc](M,b);a[lc](M,b,nv,G)}if(s){E[t](rt);E[t](G)}E[t](ov);a[Hb](M,b,E[L](R))}}};function pv(a,b){a=(a||R)[dd]();return hv[a]||b};function qv(a,b,c,e){if(Bd(a))a=a[Xc]();if(Bd(b))b=b[Xc]();if(zd(a))a=rv(a);if(zd(b))b=rv(b);this.ng=a;this.Ul=b;this.Bi=c;this.wi=e}Da(qv[v],function(a){var b=this.ng,c=this.Ul;if(a==i)return b==i&&c==i;else if(Bd(a))a=a[Xc]();else if(zd(a))a=rv(a);return(b==i||a>=b)&&(c==i||a<c)});qv[v].pg=function(){return this.wi};function sv(a,b,c,e,f){qv[H](this,a,b,c,R);this.Ve=b-a;if(this.Ve<=0)this.Ve=1;this.qj=Wu(Pu(e).jd);this.Sl=Wu(Pu(f).jd)}Q(sv,qv);
sv[v].pg=function(a){var b=1-(a-this.ng)/this.Ve;a=this.qj;var c=this.Sl;b=b;b=r.min(r.max(b,0),1);a=[r[hb](b*a[0]+(1-b)*c[0]),r[hb](b*a[1]+(1-b)*c[1]),r[hb](b*a[2]+(1-b)*c[2])];return Tu(a[0],a[1],a[2])};function tv(){this.ud=[]}tv[v].addRange=function(a,b,c,e){this.ud[t](new qv(a,b,c,e))};tv[v].If=function(a,b,c,e,f){this.ud[t](new sv(a,b,c,e,f))};var uv="color:",vv="background-color:";
tv[v].C=function(a,b){var c=a[oc](b);if(c==P||c==Dd||c==Zl||c==$l||c==am)for(c=0;c<a[Va]();c++){for(var e=a[J](c,b),f=R,g=0;g<this.ud[u];g++){var j=this.ud[g];if(j[Hc](e)){g=j.Bi;e=j.pg(e);if(g)f+=uv+g+Xm;if(e)f+=vv+e+Xm;break}}a[lc](c,b,Df,f)}};function rv(a){return a[0]*60*60*1000+a[1]*60*1000+a[2]*1000+(a[u]==4?a[3]:0)};function wv(a){this.V=a||{}}var xv="short",yv="long",zv="medium",Av="Invalid formatType parameter ";
wv[v].C=function(a,b){var c=a[oc](b);if(!(c!=Zl&&c!=$l)){var e=this.V;Jg(Lg,Ig())||Mg(Qg,Ig());if(e.pattern!=i){c=e.pattern;var f=new Zg;f.Lf(c);c=f}else{f=e.formatType||xv;if(c==Zl)switch(f){case yv:c=1;break;case zv:c=2;break;case xv:c=3;break;default:d(l(Av+f+md))}else if(c==$l)switch(f){case yv:c=9;break;case zv:c=10;break;case xv:c=11;break;default:d(l(Av+f+md))}else d(l("Column type: required date or datetime found "+c));c=c;f=new Zg;f.Zd(c);c=f}e=e.timeZone;if(e!=i)var g=Vg(-e*60);e=a[Va]();
for(f=0;f<e;f++){var j=a[J](f,b);j=g==i?c.C(j,Vg(j[jd]())):c.C(j,g);a[Hb](f,b,j)}}};function Bv(a){this.V=a||{}}Bv[v].C=function(a,b){if(a[oc](b)==P){var c=this.V,e=c.fractionDigits;if(e==i)e=2;var f=c.decimalSymbol||md,g=c.groupingSymbol;if(g==i)g=f==Cg?md:Cg;var j=c.prefix||R,n=c.suffix||R,s=c.negativeColor;c=c.negativeParens;for(var A=0;A<a[Va]();A++){var B=a[J](A,b);if(B!=i){var M=B;if(c)M=r.abs(M);M=this.oj(M,e,f,g);M=j+M+n;if(c&&B<0)M=ae+M+ce;a[Hb](A,b,M);s&&B<0&&a[lc](A,b,Df,uv+s+Xm)}}}};var Cv="0000000000000000";
Bv[v].oj=function(a,b,c,e){if(b==0)a=r[hb](a);var f=[];if(a<0){a=-a;f[t](Ug)}var g=r.pow(10,b),j=r[hb](a*g);a=ha(r[qb](j/g));g=ha(j%g);if(a[u]>3&&e){j=a[u]%3;if(j>0){f[t](a[Cc](0,j),e);a=a[Cc](j)}for(;a[u]>3;){f[t](a[Cc](0,3),e);a=a[Cc](3)}f[t](a)}else f[t](a);if(b>0){f[t](c);if(g[u]<b)g=Cv+g;f[t](g[Cc](g[u]-b))}return f[L](R)};function Dv(a){this.Pk=a||R}var Ev="\\";function Fv(a,b,c,e,f,g,j){return g>0&&j[g-1]==Ev?e:b[Mc](a,c[fa(f,10)])}var Gv="$1";Dv[v].C=function(a,b,c,e){var f=b[0];if(c!=i&&yd(c)==P)f=c;c=e||i;for(e=0;e<a[Va]();e++){var g=this.Pk[x](/{(\d+)}/g,Md(Fv,e,a,b));g=g[x](/\\(.)/g,Gv);c?a[lc](e,f,c,g):a[Hb](e,f,g)}};m("google.visualization.NumberFormat",Bv);var Hv="format";q(Bv[v],Hv,Bv[v].C);m("google.visualization.ColorFormat",tv);q(tv[v],Hv,tv[v].C);q(tv[v],"addRange",tv[v].addRange);var Iv="addGradientRange";q(tv[v],Iv,tv[v].If);m("google.visualization.BarFormat",dv);q(dv[v],Hv,dv[v].C);m("google.visualization.ArrowFormat",Yu);q(Yu[v],Hv,Yu[v].C);m("google.visualization.PatternFormat",Dv);q(Dv[v],Hv,Dv[v].C);m("google.visualization.DateFormat",wv);q(wv[v],Hv,wv[v].C);
m("google.visualization.TableNumberFormat",Bv);q(Bv[v],Hv,Bv[v].C);m("google.visualization.TableColorFormat",tv);q(tv[v],Hv,tv[v].C);q(tv[v],"addRange",tv[v].addRange);q(tv[v],Iv,tv[v].If);m("google.visualization.TableBarFormat",dv);q(dv[v],Hv,dv[v].C);m("google.visualization.TableArrowFormat",Yu);q(Yu[v],Hv,Yu[v].C);m("google.visualization.TablePatternFormat",Dv);q(Dv[v],Hv,Dv[v].C);m("google.visualization.TableDateFormat",wv);q(wv[v],Hv,wv[v].C);var Jv="left",Kv="full",Lv="right";
function Mv(a,b,c,e,f,g){var j=c==Jv||c==Kv,n=c==Lv||c==Kv,s=new ka[Kb][$a],A=[];Pd(e,function(aa){var Ua=a[oc](aa[0]),Nh=b[oc](aa[1]);if(Ua!=Nh)d(l("Key types do not match:"+Ua+be+Nh));Nh=s[Lc](Ua,a[kc](aa[0]));s[Xb](Nh,a[Qb](aa[0]));A[t](Ua)});var B=[],M=[];Pd(e,function(aa){B[t]({column:aa[0]});M[t]({column:aa[1]})});var G=a[rc](B),E=b[rc](M);Pd(f,function(aa){var Ua=s[Lc](a[oc](aa),a[kc](aa));s[Xb](Ua,a[Qb](aa))});Pd(g,function(aa){var Ua=s[Lc](b[oc](aa),b[kc](aa));s[Xb](Ua,b[Qb](aa))});for(var $=
k,da=0,Ja=0,Qa=0;da<G[u]||Ja<E[u];){var X=0,C=[];if(Ja>=E[u])if(j){C[0]=G[da];X=-1}else break;else if(da>=G[u])if(n){C[1]=E[Ja];X=1}else break;else{C[0]=G[da];C[1]=E[Ja];for(var ea=0;ea<e[u];ea++){X=a[J](C[0],e[ea][0]);var $c=b[J](C[1],e[ea][1]);X=ka[Kb].datautils.compareValues(A[ea],X,$c);if(X!=0)break}}if($&&X!=0){$=k;Ja++}else{if(X==-1&&j||X==1&&n||X==0){s.addRow();var ad,Ub;if(X==-1&&j||X==0&&c!=Lv){ad=a;Ub=0}else{ad=b;Ub=1}Pd(e,function(aa,Ua){c==Kv?s[bb](Qa,Ua,ad[J](C[Ub],aa[Ub])):s[Pc](Qa,
Ua,ad[J](C[Ub],aa[Ub]),ad[Mc](C[Ub],aa[Ub]),ad[Ya](C[Ub],aa[Ub]))});if(X==-1&&j||X==0){var zj=e[u];Pd(f,function(aa,Ua){s[Pc](Qa,Ua+zj,a[J](C[0],aa),a[Mc](C[0],aa),a[Ya](C[0],aa))})}if(X==1&&n||X==0){zj=f[u]+e[u];Pd(g,function(aa,Ua){s[Pc](Qa,Ua+zj,b[J](C[1],aa),b[Mc](C[1],aa),b[Ya](C[1],aa))})}Qa++}if(X==1)Ja++;else da++;if(X==0)$=h}}return s}function Nv(a){for(var b=0,c=0;c<a[u];c++)b+=a[c];return b}function Ov(a){return a[u]}function Pv(a){return Nv(a)/a[u]}
function Qv(a){if(a[u]==0)return i;for(var b=a[0],c=1;c<a[u];c++){var e=a[c];if(e!=i&&e<b)b=e}return b}function Rv(a){if(a[u]==0)return i;for(var b=a[0],c=1;c<a[u];c++){var e=a[c];if(e!=i&&e>b)b=e}return b}function Sv(a){return a[Ta]()+1}var Tv="modifier";
function Uv(a,b,c){function e(C,ea,$c,ad){return ea[H](i,$c[J](ad,C))}var f=[],g=[];Pd(b,function(C){if(Fd(C))f[t](C);else if(yd(C)==qd){var ea=C.column;Tv in C&&g[t]([ea,{calc:Md(e,ea,C.modifier),type:C[I],label:C[Vc],id:C.id}]);f[t](ea)}});if(g[u]!=0){for(var j=new ka[Kb].DataView(a),n=j.getViewColumns(),s=a[Va](),A=0;A<s;A++)Pd(g,function(C){n[C[0]]=C[1]});j[Zc](n);a=j}var B=new ka[Kb][$a],M=[];Pd(f,function(C,ea){var $c=a[oc](C);C=b[ea][Vc]||a[kc](C);ea=b[ea].id;B[Lc]($c,C,ea);M[t]($c)});Pd(c,
function(C){var ea=C.column;ea=C[Vc]||a[kc](ea);var $c=C.id;B[Lc](C[I],ea,$c)});var G=[];Pd(f,function(C){G[t]({column:C})});for(var E=a[rc](G),$=[],da=0;da<c[u];da++)$[t]([]);for(da=0;da<E[u];da++){Pd(c,function(C,ea){$[ea][t](a[J](E[da],C.column))});j=k;if(da<E[u]-1){j=h;for(s=0;s<f[u];s++){A=a[J](E[da],f[s]);var Ja=a[J](E[da+1],f[s]);if(ka[Kb].datautils.compareValues(M[s],A,Ja)!=0){j=k;break}}}if(!j){var Qa=B.addRow();Pd(f,function(C,ea){B[bb](Qa,ea,a[J](E[da],C))});var X=b[u];Pd(c,function(C,
ea){C=C.aggregation[H](this,$[ea]);B[bb](Qa,X+ea,C)});for(j=0;j<E[u];j++)$[j]=[]}}return B};m("google.visualization.context.draw",lp);m("google.visualization.Player",wu);q(wu[v],$o,wu[v][ic]);m("onPlayBarEvent",Ku);m("google.visualization.drawToolbar",tu);m("google.visualization.data.avg",Pv);m("google.visualization.data.count",Ov);m("google.visualization.data.group",Uv);m("google.visualization.data.join",Mv);m("google.visualization.data.max",Rv);m("google.visualization.data.min",Qv);m("google.visualization.data.month",Sv);m("google.visualization.data.sum",Nv);var Vv="528";
function Wv(){if(!Xv){Xv=h;O.IDIModule&&O.IDIModule.registerListener(Lm,{pollingInterval:100});if(O.gadgets){Yv(xj);this.kh()}}var a,b=Il;a:{var c=p;a=undefined;var e=c;b=b&&b!=Cq?b[dd]():R;if(e.querySelectorAll&&(b||a)&&(!gf||Mf(c)||vf(Vv))){a=b+(a?md+a:R);a=e.querySelectorAll(a)}else{if(a&&e.getElementsByClassName){e=e.getElementsByClassName(a);if(b){c={};for(var f=0,g=0,j;j=e[g];g++)if(b==j[Sb][dd]())c[f++]=j;oa(c,f);a=c;break a}else{a=e;break a}}e=e[cd](b||Cq);if(a){c={};for(g=f=0;j=e[g];g++){b=
j[cb];if(typeof b[pb]==wd&&Sd(b[pb](ue),a))c[f++]=j}oa(c,f);a=c}else a=e}}a=a;a=a[0];this.el=Ml(a)}var Xv=k;Wv[v].eh=200;function Zv(){return!!O.gadgets&&!!O.gadgets.rpc}var $v="refresh";Wv[v].kh=function(){if(Zv()){var a=O.gadgets;Gd(a.rpc.register)&&a.rpc.register($v,Lm)}else if(this.eh>0){this.eh--;o[kb](Ld(this.kh,this),100)}};var aw="_table_query_url",bw="http%",cw="https%",dw="_table_query_refresh_interval";
Wv[v].Li=function(a){var b=a.getString(aw),c=b[dd]();if(c[y](bw)==0||c[y](cw)==0)b=la(b);b=new V(b);a=a.getInt(dw);b.zh(a);return b};Wv[v].Wl=function(a){return this.el(a)};var ew="http://dummy.com";function Yv(a){if(Zv()){var b=O.gadgets;try{b.rpc.getRelayUrl(a)||b.rpc.setRelayUrl(a,ew)}catch(c){Gd(b.rpc.setRelayUrl)&&b.rpc.setRelayUrl(a,ew)}}}O.gadgets&&!Zv()&&Kl("http://www.gmodules.com/gadgets/rpc/rpc.v.js");Yv(xj);m("google.visualization.Query",V);q(V[v],Hm,V[v].makeRequest);q(V[v],"setRefreshInterval",V[v].zh);q(V[v],"setQuery",V[v][Rb]);q(V[v],"send",V[v][cc]);q(V[v],"setRefreshable",V[v].Hl);q(V[v],"setTimeout",V[v][kb]);q(V[v],"setHandlerType",V[v].Cl);q(V[v],"setHandlerParameter",V[v].vh);q(V,"setResponse",Sm);q(V,yl,V[ib]);m("google.visualization.AuthQuery",kn);q(kn[v],"send",kn[v][cc]);q(kn[v],"login",kn[v].login);q(kn[v],"logout",kn[v].logout);q(kn[v],"checkLogin",kn[v][dc]);
m("google.visualization.QueryResponse",rm);q(rm[v],"getDataTable",rm[v][Eb]);q(rm[v],"isError",rm[v][gc]);q(rm[v],"hasWarning",rm[v].hasWarning);q(rm[v],"getReasons",rm[v].getReasons);q(rm[v],"getMessage",rm[v][Nb]);q(rm[v],"getDetailedMessage",rm[v].getDetailedMessage);m("google.visualization.DataTable",U);q(U[v],"addColumn",U[v][Lc]);q(U[v],"addRow",U[v].addRow);q(U[v],"addRows",U[v].addRows);q(U[v],"clone",U[v][Wb]);q(U[v],"getColumnId",U[v].getColumnId);var fw="getColumnIndex";q(U[v],fw,U[v].getColumnIndex);
var gw="getColumnLabel";q(U[v],gw,U[v][kc]);var hw="getColumnPattern";q(U[v],hw,U[v].getColumnPattern);var iw="getColumnProperty";q(U[v],iw,U[v][wb]);var jw="getColumnProperties";q(U[v],jw,U[v][Qb]);var kw="getColumnRange";q(U[v],kw,U[v][tc]);q(U[v],"getColumnType",U[v][oc]);var lw="getDistinctValues";q(U[v],lw,U[v].getDistinctValues);var mw="getFilteredRows";q(U[v],mw,U[v].getFilteredRows);var nw="getFormattedValue";q(U[v],nw,U[v][Mc]);var ow="getNumberOfColumns";q(U[v],ow,U[v][Ab]);var pw="getNumberOfRows";
q(U[v],pw,U[v][Va]);q(U[v],"getProperties",U[v][Ya]);q(U[v],"getProperty",U[v][Pb]);var qw="getRowProperty";q(U[v],qw,U[v].getRowProperty);var rw="getRowProperties";q(U[v],rw,U[v][Fc]);q(U[v],"getSortedRows",U[v][rc]);var sw="getTableProperty";q(U[v],sw,U[v].dd);var tw="getTableProperties";q(U[v],tw,U[v].cd);q(U[v],"getValue",U[v][J]);q(U[v],"insertColumn",U[v].insertColumn);q(U[v],"insertRows",U[v].insertRows);q(U[v],"removeColumn",U[v].removeColumn);q(U[v],"removeColumns",U[v].removeColumns);
q(U[v],"removeRow",U[v].removeRow);q(U[v],"removeRows",U[v].removeRows);q(U[v],"setCell",U[v][Pc]);q(U[v],"setColumnLabel",U[v].setColumnLabel);q(U[v],"setColumnProperties",U[v][Xb]);q(U[v],"setColumnProperty",U[v].setColumnProperty);q(U[v],"setFormattedValue",U[v][Hb]);q(U[v],"setProperties",U[v].setProperties);q(U[v],"setProperty",U[v][lc]);q(U[v],"setRowProperties",U[v].setRowProperties);q(U[v],"setRowProperty",U[v].setRowProperty);q(U[v],"setTableProperties",U[v].Jl);
q(U[v],"setTableProperty",U[v].Kl);q(U[v],"setValue",U[v][bb]);q(U[v],"sort",U[v].sort);q(U[v],"toJSON",U[v].toJSON);m("google.visualization.DataView",Z);q(Z,"fromJSON",bp);q(Z[v],"getColumnId",Z[v].getColumnId);q(Z[v],fw,Z[v].getColumnIndex);q(Z[v],gw,Z[v][kc]);q(Z[v],hw,Z[v].getColumnPattern);q(Z[v],iw,Z[v][wb]);q(Z[v],iw,Z[v][wb]);q(Z[v],jw,Z[v][Qb]);q(Z[v],kw,Z[v][tc]);q(Z[v],"getColumnType",Z[v][oc]);q(Z[v],lw,Z[v].getDistinctValues);q(Z[v],mw,Z[v].getFilteredRows);q(Z[v],nw,Z[v][Mc]);
q(Z[v],ow,Z[v][Ab]);q(Z[v],pw,Z[v][Va]);q(Z[v],"getProperties",Z[v][Ya]);q(Z[v],"getProperty",Z[v][Pb]);q(Z[v],qw,Z[v].getRowProperty);q(Z[v],rw,Z[v][Fc]);q(Z[v],"getSortedRows",Z[v][rc]);q(Z[v],"getTableColumnIndex",Z[v].Jj);q(Z[v],"getTableRowIndex",Z[v].mb);q(Z[v],sw,Z[v].dd);q(Z[v],tw,Z[v].cd);q(Z[v],"getValue",Z[v][J]);q(Z[v],"getViewColumnIndex",Z[v].ug);q(Z[v],"getViewColumns",Z[v].getViewColumns);q(Z[v],"getViewRowIndex",Z[v].Lj);q(Z[v],"getViewRows",Z[v].Mj);q(Z[v],"hideColumns",Z[v].gk);
q(Z[v],"hideRows",Z[v].hk);q(Z[v],"setColumns",Z[v][Zc]);q(Z[v],"setRows",Z[v].mf);q(Z[v],"toJSON",Z[v].toJSON);m("google.visualization.GadgetHelper",Wv);q(Wv[v],"createQueryFromPrefs",Wv[v].Li);q(Wv[v],"validateResponse",Wv[v].Wl);m("google.visualization.errors",W);q(W,"addError",W.Nc);q(W,"removeAll",W.Ec);q(W,"removeError",W.Yk);q(W,"addErrorFromQueryResponse",W.Hf);q(W,"getContainer",W.vj);m("google.visualization.events",Eo);q(Eo,"addListener",Eo.addListener);q(Eo,"trigger",Eo.trigger);
q(Eo,"removeListener",Eo.removeListener);m("google.visualization.QueryWrapper",ap);q(ap[v],"setOptions",ap[v].xh);q(ap[v],$o,ap[v][ic]);q(ap[v],"setCustomErrorHandler",ap[v].ul);q(ap[v],"sendAndDraw",ap[v].hl);q(ap[v],"setCustomPostResponseHandler",ap[v].vl);q(ap[v],"setCustomResponseHandler",ap[v].wl);q(ap[v],yl,ap[v][ib]);m("google.visualization.datautils.compareValues",cm); })();

(function (){ function e(a){throw a;}var i=true,k=null,l=false,m=Error,aa=undefined,ba=parseFloat,ca=String,da=Object,o=Math;function ea(a,b){return a.length=b}function fa(a,b){return a.position=b}function ga(a,b){return a.filled=b}function p(a,b){return a.width=b}function ha(a,b){return a.color=b}function ia(a,b){return a.currentTarget=b}function ja(a,b){return a.left=b}function ka(a,b){return a.target=b}function la(a,b){return a.coords=b}function ma(a,b){return a.type=b}function na(a,b){return a.clear=b}
function r(a,b){return a.height=b}function oa(a,b){return a.visibility=b}
var t="appendChild",u="push",pa="toString",w="length",qa="propertyIsEnumerable",x="prototype",sa="lineTo",ta="size",y="width",z="round",ua="setTimeout",va="replace",wa="nodeType",xa="split",A="floor",ya="offsetWidth",za="concat",B="indexOf",Aa="dispatchEvent",C="style",Ba="removeChild",Ca="clone",Da="target",E="call",Ea="createElement",Fa="coords",Ga="keyCode",Ha="forEach",F="setAttribute",Ia="currentStyle",Ja="handleEvent",Ka="moveTo",La="getContext",G="type",H="apply",Ma="clear",I="parentNode",
Na="getValue",Oa="display",J="height",Pa="offsetHeight",Qa="join",K,L=this,Ra=".";function Sa(a,b){a=a[xa](Ra);b=b||L;for(var c;c=a.shift();)if(b[c])b=b[c];else return k;return b}function Ta(a){a.sc=function(){return a.Dd||(a.Dd=new a)}}var Ua="object",Va="[object Array]",M="number",Wa="splice",Xa="array",Ya="[object Function]",Za="call",$a="function",ab="null";
function bb(a){var b=typeof a;if(b==Ua)if(a){if(a instanceof Array||!(a instanceof da)&&da[x][pa][E](a)==Va||typeof a[w]==M&&typeof a.splice!="undefined"&&typeof a[qa]!="undefined"&&!a[qa](Wa))return Xa;if(!(a instanceof da)&&(da[x][pa][E](a)==Ya||typeof a[E]!="undefined"&&typeof a[qa]!="undefined"&&!a[qa](Za)))return $a}else return ab;else if(b==$a&&typeof a[E]=="undefined")return Ua;return b}function cb(a){return bb(a)==Xa}function db(a){var b=bb(a);return b==Xa||b==Ua&&typeof a[w]==M}var eb="string";
function N(a){return typeof a==eb}function fb(a){return typeof a==M}function gb(a){return bb(a)==$a}function hb(a){a=bb(a);return a==Ua||a==Xa||a==$a}function jb(a){if(a.hasOwnProperty&&a.hasOwnProperty(kb))return a[kb];a[kb]||(a[kb]=++lb);return a[kb]}var kb="closure_hashCode_"+o[A](o.random()*2147483648)[pa](36),lb=0;function mb(a){var b=bb(a);if(b==Ua||b==Xa){if(a[Ca])return a[Ca][E](a);b=b==Xa?[]:{};for(var c in a)b[c]=mb(a[c]);return b}return a}
function nb(a,b){var c=a.Vc;if(arguments[w]>2){var d=Array[x].slice[E](arguments,2);c&&d.unshift[H](d,c);c=d}b=a.Xc||b;a=a.Wc||a;var f=b||L;d=c?function(){var g=Array[x].slice[E](arguments);g.unshift[H](g,c);return a[H](f,g)}:function(){return a[H](f,arguments)};d.Vc=c;d.Xc=b;d.Wc=a;return d}var ob=Date.now||function(){return(new Date).getTime()};function P(a,b){function c(){}c.prototype=b[x];a.h=b[x];a.prototype=new c;a[x].constructor=a};var Q="";function pb(a,b,c){if(a[Ha])a[Ha](b,c);else if(Array[Ha])Array[Ha](a,b,c);else for(var d=a[w],f=N(a)?a[xa](Q):a,g=0;g<d;g++)g in f&&b[E](c,f[g],g,a)}function qb(a,b,c){if(a.map)return a.map(b,c);if(Array.map)return Array.map(a,b,c);for(var d=a[w],f=[],g=0,h=N(a)?a[xa](Q):a,j=0;j<d;j++)if(j in h)f[g++]=b[E](c,h[j],j,a);return f}
function rb(a,b){var c;a:{c=a;b=b;var d=aa;if(c[B])c=c[B](b,d);else if(Array[B])c=Array[B](c,b,d);else{for(d=d=d==k?0:d<0?o.max(0,c[w]+d):d;d<c[w];d++)if(d in c&&c[d]===b){c=d;break a}c=-1}}if(b=c!=-1)Array[x].splice[E](a,c,1)[w]==1;return b}function sb(a){if(cb(a))return a[za]();else{for(var b=[],c=0,d=a[w];c<d;c++)b[c]=a[c];return b}};function tb(a,b,c){for(var d in a)b[E](c,a[d],d,a)}function ub(a){for(var b in a)return l;return i}function vb(a,b){var c;if(c=b in a)delete a[b];return c}function wb(a,b,c){if(b in a)return a[b];return c}var xb=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"];function yb(a){for(var b,c,d=1;d<arguments[w];d++){c=arguments[d];for(b in c)a[b]=c[b];for(var f=0;f<xb[w];f++){b=xb[f];if(da[x].hasOwnProperty[E](c,b))a[b]=c[b]}}};function zb(){}zb[x].ic=l;zb[x].$=function(){if(!this.ic){this.ic=i;this.c()}};zb[x].c=function(){};function Ab(a,b){zb[E](this);this.zc=b;this.ba=[];this.ad(a)}P(Ab,zb);K=Ab[x];K.rb=k;K.tb=k;K.Ja=function(a){this.rb=a};K.Fc=function(a){this.tb=a};K.L=function(){if(this.ba[w])return this.ba.pop();return this.fc()};K.ea=function(a){this.ba[w]<this.zc?this.ba[u](a):this.hc(a)};K.ad=function(a){if(a>this.zc)e(m("[goog.structs.SimplePool] Initial cannot be greater than max"));for(var b=0;b<a;b++)this.ba[u](this.fc())};K.fc=function(){return this.rb?this.rb():{}};
K.hc=function(a){if(this.tb)this.tb(a);else if(gb(a.$))a.$();else for(var b in a)delete a[b]};K.c=function(){Ab.h.c[E](this);for(var a=this.ba;a[w];)this.hc(a.pop());delete this.ba};function Bb(a,b){var c=a[w]-b[w];return c>=0&&a.lastIndexOf(b,c)==c}function Cb(a){return a[va](/^[\s\xa0]+|[\s\xa0]+$/g,Q)}var Db="&amp;",Eb="&lt;",Fb="&gt;",Gb="&quot;",Hb="&",Ib="<",Jb=">",Kb='"';function Lb(a,b){if(b)return a[va](Mb,Db)[va](Nb,Eb)[va](Ob,Fb)[va](Pb,Gb);else{if(!Qb.test(a))return a;if(a[B](Hb)!=-1)a=a[va](Mb,Db);if(a[B](Ib)!=-1)a=a[va](Nb,Eb);if(a[B](Jb)!=-1)a=a[va](Ob,Fb);if(a[B](Kb)!=-1)a=a[va](Pb,Gb);return a}}var Mb=/&/g,Nb=/</g,Ob=/>/g,Pb=/\"/g,Qb=/[&<>\"]/;
function Rb(a,b){return a[B](b)!=-1}var Sb="(\\d*)(\\D*)",Tb="g";function Ub(a,b){var c=0;a=Cb(ca(a))[xa](Ra);b=Cb(ca(b))[xa](Ra);for(var d=o.max(a[w],b[w]),f=0;c==0&&f<d;f++){var g=a[f]||Q,h=b[f]||Q,j=new RegExp(Sb,Tb),n=new RegExp(Sb,Tb);do{var s=j.exec(g)||[Q,Q,Q],q=n.exec(h)||[Q,Q,Q];if(s[0][w]==0&&q[0][w]==0)break;c=s[1][w]==0?0:parseInt(s[1],10);var v=q[1][w]==0?0:parseInt(q[1],10);c=Vb(c,v)||Vb(s[2][w]==0,q[2][w]==0)||Vb(s[2],q[2])}while(c==0)}return c}
function Vb(a,b){if(a<b)return-1;else if(a>b)return 1;return 0}ob();var Wb,Xb,Yb,Zb,$b,ac,bc,cc,dc,ec;function fc(){return L.navigator?L.navigator.userAgent:k}function gc(){return L.navigator}ac=$b=Zb=Yb=Xb=Wb=l;var hc;if(hc=fc()){var ic=gc();Wb=hc[B]("Opera")==0;Xb=!Wb&&hc[B]("MSIE")!=-1;Zb=(Yb=!Wb&&hc[B]("WebKit")!=-1)&&hc[B]("Mobile")!=-1;ac=($b=!Wb&&!Yb&&ic.product=="Gecko")&&ic.vendor=="Camino"}var jc=Wb,kc=Xb,lc=$b,mc=Yb,nc=Zb,oc,pc=gc(),qc=oc=pc&&pc.platform||Q;bc=Rb(qc,"Mac");cc=Rb(qc,"Win");dc=Rb(qc,"Linux");ec=!!gc()&&Rb(gc().appVersion||Q,"X11");
var rc=bc,sc,tc=Q,uc;if(jc&&L.opera){var vc=L.opera.version;tc=typeof vc==$a?vc():vc}else{if(lc)uc=/rv\:([^\);]+)(\)|;)/;else if(kc)uc=/MSIE\s+([^\);]+)(\)|;)/;else if(mc)uc=/WebKit\/(\S+)/;if(uc){var wc=uc.exec(fc());tc=wc?wc[1]:Q}}var xc=sc=tc,yc={};function zc(a){return yc[a]||(yc[a]=Ub(xc,a)>=0)};function Ac(a,b){ma(this,a);ka(this,b);ia(this,this[Da])}P(Ac,zb);Ac[x].c=function(){delete this[G];delete this[Da];delete this.currentTarget};Ac[x].sa=l;Ac[x].gb=i;function Bc(a,b){a&&this.ab(a,b)}P(Bc,Ac);K=Bc[x];ma(K,k);ka(K,k);K.relatedTarget=k;K.offsetX=0;K.offsetY=0;K.clientX=0;K.clientY=0;K.screenX=0;K.screenY=0;K.button=0;K.keyCode=0;K.charCode=0;K.ctrlKey=l;K.altKey=l;K.shiftKey=l;K.metaKey=l;K.lc=k;var Cc="mouseover",Dc="mouseout",Gc="keypress";
K.ab=function(a,b){ma(this,a[G]);ka(this,a[Da]||a.srcElement);ia(this,b);this.relatedTarget=a.relatedTarget?a.relatedTarget:this[G]==Cc?a.fromElement:this[G]==Dc?a.toElement:k;this.offsetX=typeof a.layerX==M?a.layerX:a.offsetX;this.offsetY=typeof a.layerY==M?a.layerY:a.offsetY;this.clientX=typeof a.clientX==M?a.clientX:a.pageX;this.clientY=typeof a.clientY==M?a.clientY:a.pageY;this.screenX=a.screenX||0;this.screenY=a.screenY||0;this.button=a.button;this.keyCode=a[Ga]||0;this.charCode=a.charCode||
(this[G]==Gc?a[Ga]:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.lc=a;delete this.gb;delete this.sa};K.c=function(){Bc.h.c[E](this);this.lc=k};function Hc(){}var Ic=0;K=Hc[x];K.F=0;K.ua=l;K.ec=l;K.ab=function(a,b,c,d,f,g){if(gb(a))this.xc=i;else if(a&&a[Ja]&&gb(a[Ja]))this.xc=l;else e(m("Invalid listener argument"));this.oa=a;this.Sd=b;this.src=c;ma(this,d);this.Aa=!!f;this.Za=g;this.ec=l;this.F=++Ic;this.ua=l};K.handleEvent=function(a){if(this.xc)return this.oa[E](this.Za||this.src,a);return this.oa[Ja][E](this.oa,a)};var Jc={},R={},Kc={},Lc=new Ab(0,600);Lc.Ja(function(){return{e:0,C:0}});Lc.Fc(function(a){a.e=0});var Mc=new Ab(0,600);Mc.Ja(function(){return[]});Mc.Fc(function(a){ea(a,0);delete a.Ga;delete a.Jb});var Nc=new Ab(0,600);Nc.Ja(function(){function a(b){return Oc[E](a.src,a.F,b)}return a});function Pc(){return new Hc}var Qc=new Ab(0,600);Qc.Ja(Pc);function Rc(){return new Bc}var Sc,Tc=k;if(kc){Tc=new Ab(0,600);Tc.Ja(Rc)}Sc=Tc;var Uc="on",Vc=Uc,Wc={};
function Xc(a,b,c,d,f){if(b)if(cb(b)){for(var g=0;g<b[w];g++)Xc(a,b[g],c,d,f);return k}else{d=!!d;var h=R;b in h||(h[b]=Lc.L());h=h[b];if(!(d in h)){h[d]=Lc.L();h.e++}h=h[d];var j=jb(a),n;h.C++;if(h[j]){n=h[j];for(g=0;g<n[w];g++){h=n[g];if(h.oa==c&&h.Za==f){if(h.ua)break;return n[g].F}}}else{n=h[j]=Mc.L();h.e++}g=Nc.L();g.src=a;h=Qc.L();h.ab(c,g,a,b,d,f);c=h.F;g.F=c;n[u](h);Jc[c]=h;Kc[j]||(Kc[j]=Mc.L());Kc[j][u](h);if(a.addEventListener){if(a==L||!a.sb)a.addEventListener(b,g,d)}else a.attachEvent(Yc(b),
g);return c}else e(m("Invalid event type"))}function Zc(a,b,c,d,f){if(cb(b)){for(var g=0;g<b[w];g++)Zc(a,b[g],c,d,f);return k}d=!!d;a=$c(a,b,d);if(!a)return l;for(g=0;g<a[w];g++)if(a[g].oa==c&&a[g].Aa==d&&a[g].Za==f)return ad(a[g].F);return l}
function ad(a){if(!Jc[a])return l;var b=Jc[a];if(b.ua)return l;var c=b.src,d=b[G],f=b.Sd,g=b.Aa;if(c.removeEventListener){if(c==L||!c.sb)c.removeEventListener(d,f,g)}else c.detachEvent&&c.detachEvent(Yc(d),f);c=jb(c);f=R[d][g][c];if(Kc[c]){var h=Kc[c];rb(h,b);h[w]==0&&delete Kc[c]}b.ua=i;f.Jb=i;bd(d,g,c,f);delete Jc[a];return i}
function bd(a,b,c,d){if(!d.Ga)if(d.Jb){for(var f=0,g=0;f<d[w];f++)if(d[f].ua)Qc.ea(d[f]);else{if(f!=g)d[g]=d[f];g++}ea(d,g);d.Jb=l;if(g==0){Mc.ea(d);delete R[a][b][c];R[a][b].e--;if(R[a][b].e==0){Lc.ea(R[a][b]);delete R[a][b];R[a].e--}if(R[a].e==0){Lc.ea(R[a]);delete R[a]}}}}
function cd(a,b,c){var d=0,f=a==k,g=b==k,h=c==k;c=!!c;if(f)tb(Kc,function(n){for(var s=n[w]-1;s>=0;s--){var q=n[s];if((g||b==q[G])&&(h||c==q.Aa)){ad(q.F);d++}}});else{a=jb(a);if(Kc[a]){a=Kc[a];for(f=a[w]-1;f>=0;f--){var j=a[f];if((g||b==j[G])&&(h||c==j.Aa)){ad(j.F);d++}}}}return d}function $c(a,b,c){var d=R;if(b in d){d=d[b];if(c in d){d=d[c];a=jb(a);if(d[a])return d[a]}}return k}function Yc(a){if(a in Wc)return Wc[a];return Wc[a]=Vc+a}
function dd(a,b,c,d,f){var g=1;b=jb(b);if(a[b]){a.C--;a=a[b];if(a.Ga)a.Ga++;else a.Ga=1;try{for(var h=a[w],j=0;j<h;j++){var n=a[j];if(n&&!n.ua)g&=ed(n,f)!==l}}finally{a.Ga--;bd(c,d,b,a)}}return Boolean(g)}function ed(a,b){b=a[Ja](b);a.ec&&ad(a.F);return b}var fd="window.event";
function Oc(a,b){if(!Jc[a])return i;a=Jc[a];var c=a[G],d=R;if(!(c in d))return i;d=d[c];var f,g;if(kc){f=b||Sa(fd);b=i in d;var h=l in d;if(b){if(f[Ga]<0||f.returnValue!=aa)return i;a:{var j=f,n=l;if(j[Ga]==0)try{j.keyCode=-1;break a}catch(s){n=i}if(n||j.returnValue==aa)j.returnValue=i}}j=Sc.L();j.ab(f,this);f=i;try{if(b){for(var q=Mc.L(),v=j.currentTarget;v;v=v[I])q[u](v);g=d[i];g.C=g.e;for(var D=q[w]-1;!j.sa&&D>=0&&g.C;D--){ia(j,q[D]);f&=dd(g,q[D],c,i,j)}if(h){g=d[l];g.C=g.e;for(D=0;!j.sa&&D<q[w]&&
g.C;D++){ia(j,q[D]);f&=dd(g,q[D],c,l,j)}}}else f=ed(a,j)}finally{if(q){ea(q,0);Mc.ea(q)}j.$();Sc.ea(j)}return f}g=new Bc(b,this);try{f=ed(a,g)}finally{g.$()}return f};function S(a,b){p(this,a);r(this,b)}K=S[x];K.clone=function(){return new S(this[y],this[J])};var gd="(",hd=" x ",id=")";K.toString=function(){return gd+this[y]+hd+this[J]+id};K.ceil=function(){p(this,o.ceil(this[y]));r(this,o.ceil(this[J]));return this};K.floor=function(){p(this,o[A](this[y]));r(this,o[A](this[J]));return this};K.round=function(){p(this,o[z](this[y]));r(this,o[z](this[J]));return this};K.scale=function(a){this.width*=a;this.height*=a;return this};var jd;function kd(a){return a?new ld(a[wa]==9?a:a.ownerDocument||a.document):jd||(jd=new ld)}var md="style",nd="class",pd="for";function qd(a,b){tb(b,function(c,d){if(d==md)a[C].cssText=c;else if(d==nd)a.className=c;else if(d==pd)a.htmlFor=c;else if(d in rd)a[F](rd[d],c);else a[d]=c})}var rd={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",rowspan:"rowSpan",valign:"vAlign",height:"height",width:"width",usemap:"useMap",frameborder:"frameBorder",type:"type"};
function sd(){return td(document,arguments)}var ud=' name="',vd=' type="';function td(a,b){var c=b[0],d=b[1];if(kc&&d&&(d.name||d[G])){c=[Ib,c];d.name&&c[u](ud,Lb(d.name),Kb);if(d[G]){c[u](vd,Lb(d[G]),Kb);d=mb(d);delete d[G]}c[u](Jb);c=c[Qa](Q)}var f=a[Ea](c);if(d)if(N(d))f.className=d;else qd(f,d);if(b[w]>2){function g(h){if(h)f[t](N(h)?a.createTextNode(h):h)}for(d=2;d<b[w];d++){c=b[d];db(c)&&!(hb(c)&&c[wa]>0)?pb(wd(c)?sb(c):c,g):g(c)}}return f}function xd(a,b){a[t](b)}
function yd(a){for(var b;b=a.firstChild;)a[Ba](b)}var zd=mc&&zc("522");function Ad(a,b){if(typeof a.contains!="undefined"&&!zd&&b[wa]==1)return a==b||a.contains(b);if(typeof a.compareDocumentPosition!="undefined")return a==b||Boolean(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b[I];return b==a}function wd(a){if(a&&typeof a[w]==M)if(hb(a))return typeof a.item==$a||typeof a.item==eb;else if(gb(a))return typeof a.item==$a;return l}function ld(a){this.T=a||L.document||document}K=ld[x];K.pc=kd;
K.a=function(a){return N(a)?this.T.getElementById(a):a};K.k=function(){return td(this.T,arguments)};K.createElement=function(a){return this.T[Ea](a)};K.createTextNode=function(a){return this.T.createTextNode(a)};K.appendChild=xd;K.Dc=yd;K.contains=Ad;var Bd,Cd="aria-";function Dd(a,b,c){if(lc||Bd)a[F](Cd+b,c)};function T(){}P(T,zb);K=T[x];K.sb=i;K.eb=k;K.Qb=function(a){this.eb=a};K.addEventListener=function(a,b,c,d){Xc(this,a,b,c,d)};K.removeEventListener=function(a,b,c,d){Zc(this,a,b,c,d)};
K.dispatchEvent=function(a){a=a;if(N(a))a=new Ac(a,this);else if(a instanceof Ac)ka(a,a[Da]||this);else{var b=a;a=new Ac(a[G],this);yb(a,b)}b=1;var c,d=a[G],f=R;if(d in f){f=f[d];d=i in f;var g;if(d){c=[];for(g=this;g;g=g.eb)c[u](g);g=f[i];g.C=g.e;for(var h=c[w]-1;!a.sa&&h>=0&&g.C;h--){ia(a,c[h]);b&=dd(g,c[h],a[G],i,a)&&a.gb!=l}}if(g=l in f){g=f[l];g.C=g.e;if(d)for(h=0;!a.sa&&h<c[w]&&g.C;h++){ia(a,c[h]);b&=dd(g,c[h],a[G],l,a)&&a.gb!=l}else for(c=this;!a.sa&&c&&g.C;c=c.eb){ia(a,c);b&=dd(g,c,a[G],l,
a)&&a.gb!=l}}a=Boolean(b)}else a=i;return a};K.c=function(){T.h.c[E](this);cd(this);this.eb=k};function Ed(a,b){T[E](this);this.cb=a||1;this.Ma=b||Fd;this.nb=nb(this.ne,this);this.Hb=ob()}P(Ed,T);Ed[x].Wa=l;var Fd=L.window,Gd=0.8;K=Ed[x];K.ga=k;K.ne=function(){if(this.Wa){var a=ob()-this.Hb;if(a>0&&a<this.cb*Gd)this.ga=this.Ma[ua](this.nb,this.cb-a);else{this.dd();if(this.Wa){this.ga=this.Ma[ua](this.nb,this.cb);this.Hb=ob()}}}};var Hd="tick";K.dd=function(){this[Aa](Hd)};K.start=function(){this.Wa=i;if(!this.ga){this.ga=this.Ma[ua](this.nb,this.cb);this.Hb=ob()}};
K.stop=function(){this.Wa=l;if(this.ga){this.Ma.clearTimeout(this.ga);this.ga=k}};K.c=function(){Ed.h.c[E](this);this.stop();delete this.Ma};function Id(a){return 3*a*a-2*a*a*a}function Jd(a,b,c,d){T[E](this);if(!cb(a)||!cb(b))e(m("Start and end parameters must be arrays"));if(a[w]!=b[w])e(m("Start and end points must be the same length"));this.Ka=a;this.ed=b;this.Va=c;this.cc=d;la(this,[])}P(Jd,T);var Kd={},Ld=k;function Md(){Fd.clearTimeout(Ld);var a=ob();for(var b in Kd)Kd[b].gc(a);Ld=ub(Kd)?k:Fd[ua](Md,20)}function Nd(a){a=jb(a);delete Kd[a];if(Ld&&ub(Kd)){Fd.clearTimeout(Ld);Ld=k}}K=Jd[x];K.H=0;K.nc=0;K.r=0;K.fa=k;K.kc=k;K.Fb=k;
K.play=function(a){if(a||this.H==0){this.r=0;la(this,this.Ka)}else if(this.H==1)return l;Nd(this);this.fa=ob();if(this.H==-1)this.fa-=this.Va*this.r;this.kc=this.fa+this.Va;this.Fb=this.fa;this.r||this.Ld();this.Od();this.H==-1&&this.Pd();this.H=1;a=jb(this);a in Kd||(Kd[a]=this);Ld||(Ld=Fd[ua](Md,20));this.gc(this.fa);return i};K.stop=function(a){Nd(this);this.H=0;if(a)this.r=1;this.Vb(this.r);this.Qd();this.Bc()};K.c=function(){this.H!=0&&this.stop(l);this.Md();Jd.h.c[E](this)};
K.gc=function(a){this.r=(a-this.fa)/(this.kc-this.fa);if(this.r>=1)this.r=1;this.nc=1000/(a-this.Fb);this.Fb=a;gb(this.cc)?this.Vb(this.cc(this.r)):this.Vb(this.r);if(this.r==1){this.H=0;Nd(this);this.Nd();this.Bc()}else this.H==1&&this.Id()};K.Vb=function(a){la(this,new Array(this.Ka[w]));for(var b=0;b<this.Ka[w];b++)this[Fa][b]=(this.ed[b]-this.Ka[b])*a+this.Ka[b]};var Od="animate";K.Id=function(){this.S(Od)};var Pd="begin";K.Ld=function(){this.S(Pd)};var Qd="destroy";K.Md=function(){this.S(Qd)};
var Rd="end";K.Bc=function(){this.S(Rd)};var Sd="finish";K.Nd=function(){this.S(Sd)};var Td="play";K.Od=function(){this.S(Td)};var Ud="resume";K.Pd=function(){this.S(Ud)};var Vd="stop";K.Qd=function(){this.S(Vd)};K.S=function(a){this[Aa](new Wd(a,this))};function Wd(a,b){Ac[E](this,a);la(this,b[Fa]);this.x=b[Fa][0];this.y=b[Fa][1];this.He=b[Fa][2];this.Va=b.Va;this.r=b.r;this.ye=b.nc;this.Ee=b.H;this.ve=b}P(Wd,Ac);function Xd(a,b){this.size=a;this.wb=b}Xd[x].Na=l;Xd[x].Db=l;var Yd,Zd,$d,ae,be,ce;ce=be=ae=$d=Zd=Yd=l;var de=fc();if(de)if(de[B]("Firefox")!=-1)Yd=i;else if(de[B]("Camino")!=-1)Zd=i;else if(de[B]("iPhone")!=-1||de[B]("iPod")!=-1)$d=i;else if(de[B]("Android")!=-1)ae=i;else if(de[B]("Chrome")!=-1)be=i;else if(de[B]("Safari")!=-1)ce=i;var U="px";function ee(a,b,c){if(b instanceof S){c=b[J];b=b[y]}else{if(c==aa)e(m("missing height argument"));c=c}p(a[C],typeof b==M?o[z](b)+U:b);r(a[C],typeof c==M?o[z](c)+U:c)}var fe="10",ge="none",he="hidden",ie="absolute",je="inline";
function ke(a){var b=jc&&!zc(fe),c;a:{c=a[wa]==9?a:a.ownerDocument||a.document;if(c.defaultView&&c.defaultView.getComputedStyle)if(c=c.defaultView.getComputedStyle(a,Q)){c=c[Oa];break a}c=k}if((c||(a[Ia]?a[Ia][Oa]:k)||a[C][Oa])!=ge)return b?new S(a[ya]||a.clientWidth,a[Pa]||a.clientHeight):new S(a[ya],a[Pa]);c=a[C];var d=c[Oa],f=c.visibility,g=c.position;oa(c,he);fa(c,ie);c.display=je;if(b){b=a[ya]||a.clientWidth;a=a[Pa]||a.clientHeight}else{b=a[ya];a=a[Pa]}c.display=d;fa(c,g);oa(c,f);return new S(b,
a)};function le(a){this.ca=a}P(le,zb);var me=new Ab(0,100);K=le[x];K.Ib=function(a,b,c,d,f){if(cb(b))for(var g=0;g<b[w];g++)this.Ib(a,b[g],c,d,f);else{a=Xc(a,b,c||this,d||l,f||this.ca||this);this.Td(a)}return this};K.Td=function(a){if(this.v)this.v[a]=i;else if(this.V){this.v=me.L();this.v[this.V]=i;this.V=k;this.v[a]=i}else this.V=a};
K.Oc=function(a,b,c,d,f){if(this.V||this.v)if(cb(b))for(var g=0;g<b[w];g++)this.Oc(a,b[g],c,d,f);else{a:{c=c||this;f=f||this.ca||this;d=!!(d||l);if(a=$c(a,b,d))for(b=0;b<a[w];b++)if(a[b].oa==c&&a[b].Aa==d&&a[b].Za==f){a=a[b];break a}a=k}if(a){a=a.F;ad(a);if(this.v)vb(this.v,a);else if(this.V==a)this.V=k}}return this};K.removeAll=function(){if(this.v){for(var a in this.v){ad(a);delete this.v[a]}me.ea(this.v);this.v=k}else this.V&&ad(this.V)};K.c=function(){le.h.c[E](this);this.removeAll()};
K.handleEvent=function(){e(m("EventHandler.handleEvent not implemented"))};function ne(){}Ta(ne);ne[x].Hd=0;var oe=":";ne[x].ud=function(){return oe+(this.Hd++)[pa](36)};ne.sc();function pe(a){T[E](this);this.s=a||kd();this.Zd=qe}P(pe,T);pe[x].Bd=ne.sc();var qe=k;K=pe[x];K.$a=k;K.s=k;K.n=l;K.b=k;K.Zd=k;K.Gd=k;K.P=k;K.o=k;K.Oa=k;K.se=l;K.nd=function(){return this.$a||(this.$a=this.Bd.ud())};K.a=function(){return this.b};K.hb=function(a){this.b=a};var re="Unable to set parent component";K.ce=function(a){if(this==a)e(m(re));if(a&&this.P&&this.$a&&this.P.oc(this.$a)&&this.P!=a)e(m(re));this.P=a;pe.h.Qb[E](this,a)};
K.Qb=function(a){if(this.P&&this.P!=a)e(m("Method not supported"));pe.h.Qb[E](this,a)};K.pc=function(){return this.s};var se="div";K.k=function(){this.b=this.s[Ea](se)};K.Xd=function(a){this.Yd(a)};K.Yd=function(a,b){if(this.n)e(m("Component already rendered"));this.b||this.k();a?a.insertBefore(this.b,b||k):this.s.T.body[t](this.b);if(!this.P||this.P.n)this.D()};K.D=function(){this.n=i;this.xb(function(a){!a.n&&a.a()&&a.D()})};
K.aa=function(){this.xb(function(a){a.n&&a.aa()});this.Ya&&this.Ya.removeAll();this.n=l};K.c=function(){pe.h.c[E](this);this.n&&this.aa();if(this.Ya){this.Ya.$();delete this.Ya}this.xb(function(a){a.$()});!this.se&&this.b&&(this.b&&this.b[I]?this.b[I][Ba](this.b):k);this.P=this.Gd=this.b=this.Oa=this.o=k};K.Ad=function(){return!!this.o&&this.o[w]!=0};K.oc=function(a){return this.Oa&&a?wb(this.Oa,a)||k:k};K.hd=function(a){return this.o?this.o[a]||k:k};K.xb=function(a,b){this.o&&pb(this.o,a,b)};
K.removeChild=function(a,b){if(a){var c=N(a)?a:a.nd();a=this.oc(c);if(c&&a){vb(this.Oa,c);rb(this.o,a);if(b){a.aa();a.b&&(a.b&&a.b[I]?a.b[I][Ba](a.b):k)}a.ce(k)}}if(!a)e(m("Child is not in parent component"));return a};K.Vd=function(a,b){return this[Ba](this.hd(a),b)};K.Dc=function(a){for(;this.Ad();)this.Vd(0,a)};function te(a){a=a%360;return a=a*360<0?a+360:a}function ue(a){return a*180/o.PI}function V(a,b){return b*o.cos(a*o.PI/180)}function ve(a,b){return b*o.sin(a*o.PI/180)};function W(){this.i=[];this.e=[];this.J=[]}W[x].ja=k;W[x].l=k;W[x].va=i;var we=function(){var a=[];a[0]=2;a[1]=2;a[2]=6;a[3]=6;a[4]=0;return a}();K=W[x];na(K,function(){ea(this.i,0);ea(this.e,0);ea(this.J,0);delete this.ja;delete this.l;delete this.va;return this});K.moveTo=function(a,b){if(this.i[this.i[w]-1]==0)this.J.length-=2;else{this.i[u](0);this.e[u](1)}this.J[u](a,b);this.l=this.ja=[a,b];return this};
K.lineTo=function(){var a=this.i[this.i[w]-1];if(a==k)e(m("Path cannot start with lineTo"));if(a!=1){this.i[u](1);this.e[u](0)}for(a=0;a<arguments[w];a+=2){var b=arguments[a],c=arguments[a+1];this.J[u](b,c)}this.e[this.e[w]-1]+=a/2;this.l=[b,c];return this};
K.Ra=function(){var a=this.i[this.i[w]-1];if(a==k)e(m("Path cannot start with curve"));if(a!=2){this.i[u](2);this.e[u](0)}for(a=0;a<arguments[w];a+=6){var b=arguments[a+4],c=arguments[a+5];this.J[u](arguments[a],arguments[a+1],arguments[a+2],arguments[a+3],b,c)}this.e[this.e[w]-1]+=a/6;this.l=[b,c];return this};K.close=function(){var a=this.i[this.i[w]-1];if(a==k)e(m("Path cannot start with close"));if(a!=4){this.i[u](4);this.e[u](1);this.l=this.ja}return this};
K.arc=function(a,b,c,d,f,g,h){a=a+V(f,c);b=b+ve(f,d);if(h){if(!this.l||a!=this.l[0]||b!=this.l[1])this[sa](a,b)}else this[Ka](a,b);return this.arcTo(c,d,f,g)};K.arcTo=function(a,b,c,d){var f=this.l[0]-V(c,a),g=this.l[1]-ve(c,b);f=f+V(c+d,a);g=g+ve(c+d,b);this.i[u](3);this.e[u](1);this.J[u](a,b,c,d,f,g);this.va=l;this.l=[f,g];return this};
K.Uc=function(a,b,c,d){var f=this.l[0]-V(c,a),g=this.l[1]-ve(c,b),h=d*o.PI/180;d=o.ceil(o.abs(h)/o.PI*2);h=h/d;c=c*o.PI/180;for(var j=0;j<d;j++){var n=o.cos(c),s=o.sin(c),q=4/3*o.sin(h/2)/(1+o.cos(h/2)),v=f+(n-q*s)*a,D=g+(s+q*n)*b;c+=h;n=o.cos(c);s=o.sin(c);this.Ra(v,D,f+(n+q*s)*a,g+(s-q*n)*b,f+n*a,g+s*b)}return this};K.Xa=function(a){for(var b=this.J,c=0,d=0,f=this.i[w];d<f;d++){var g=this.i[d],h=we[g]*this.e[d];a(g,b.slice(c,c+h));c+=h}};
K.clone=function(){var a=new this.constructor;a.i=this.i[za]();a.e=this.e[za]();a.J=this.J[za]();a.ja=this.ja&&this.ja[za]();a.l=this.l&&this.l[za]();a.va=this.va;return a};var xe=function(){var a={};a[0]=W[x][Ka];a[1]=W[x][sa];a[4]=W[x].close;a[2]=W[x].Ra;a[3]=W[x].Uc;return a}();function ye(a){if(a.va)return a[Ca]();var b=new W;a.Xa(function(c,d){xe[c][H](b,d)});return b};function ze(a,b,c,d,f){pe[E](this,f);p(this,a);r(this,b);this.w=c||k;this.Ca=d||k}P(ze,pe);K=ze[x];K.g=k;K.R=0;K.Y=0;K.zb=function(){return this.w?new S(this.w,this.Ca):this.u()};K.u=function(){if(this.n)return ke(this.a());if(fb(this[y])&&fb(this[J]))return new S(this[y],this[J]);return k};K.Fa=function(){var a=this.u();return a?a[y]/this.zb()[y]:0};K.vd=function(){var a=this.u();return a?a[J]/this.zb()[J]:0};K.ub=function(a,b,c,d,f,g){return this.vb(a,b,c,c,d,f,g)};K.Qa=function(){return new W};function Ae(a,b,c,d,f,g){if(arguments[w]==6)this.setTransform(a,b,c,d,f,g);else if(arguments[w]!=0)e(m("Insufficient matrix parameters"));else{this.M=this.O=1;this.G=this.N=this.W=this.X=0}}K=Ae[x];K.clone=function(){return new Ae(this.M,this.G,this.N,this.O,this.W,this.X)};K.setTransform=function(a,b,c,d,f,g){if(!fb(a)||!fb(b)||!fb(c)||!fb(d)||!fb(f)||!fb(g))e(m("Invalid transform parameters"));this.M=a;this.G=b;this.N=c;this.O=d;this.W=f;this.X=g;return this};
K.scale=function(a,b){this.M*=a;this.G*=a;this.N*=b;this.O*=b;return this};K.translate=function(a,b){this.W+=a*this.M+b*this.N;this.X+=a*this.G+b*this.O;return this};K.rotate=function(a,b,c){return this.$c((new Ae).ge(a,b,c))};var Be="matrix(",Ce=",";K.toString=function(){return Be+[this.M,this.G,this.N,this.O,this.W,this.X][Qa](Ce)+id};
K.$c=function(a){var b=this.M,c=this.N;this.M=a.M*b+a.G*c;this.N=a.N*b+a.O*c;this.W+=a.W*b+a.X*c;b=this.G;c=this.O;this.G=a.M*b+a.G*c;this.O=a.N*b+a.O*c;this.X+=a.W*b+a.X*c;return this};K.ge=function(a,b,c){var d=o.cos(a);a=o.sin(a);return this.setTransform(d,a,-a,d,b-b*d+c*a,c-b*a-c*d)};function De(a,b){T[E](this);this.b=a;this.j=b;this.sb=l}P(De,T);K=De[x];K.j=k;K.b=k;K.Nc=k;K.a=function(){return this.b};K.xd=function(){return this.Nc?this.Nc[Ca]():new Ae};K.addEventListener=function(a,b,c,d){Xc(this.b,a,b,c,d)};K.removeEventListener=function(a,b,c,d){Zc(this.b,a,b,c,d)};K.c=function(){De.h.c[E](this);cd(this.b)};function Ee(a,b,c,d){De[E](this,a,b);this.Ic(c);this.Hc(d)}P(Ee,De);K=Ee[x];K.Da=k;K.Sb=k;K.Hc=function(a){this.Da=a;this.j.Nb(this,a)};K.ld=function(){return this.Da};K.Ic=function(a){this.Sb=a;this.j.Ob(this,a)};K.wd=function(){return this.Sb};function Fe(a,b,c,d){Ee[E](this,a,b,c,d)}P(Fe,Ee);function Ge(a,b){De[E](this,a,b)}P(Ge,De);function He(a,b){De[E](this,a,b)}P(He,De);function Ie(a,b,c,d){Ee[E](this,a,b,c,d)}P(Ie,Ee);function Je(a,b,c,d){Ee[E](this,a,b,c,d)}P(Je,Ee);function Ke(a){Ge[E](this,k,a);this.o=[]}P(Ke,Ge);na(Ke[x],function(){if(this.o[w]){ea(this.o,0);this.j.da()}});Ke[x].appendChild=function(a){this.o[u](a)};Ke[x].t=function(){for(var a=0,b=this.o[w];a<b;a++)this.j.jc(this.o[a])};function Le(a,b,c,d,f,g,h,j){Fe[E](this,a,b,h,j);this.bd=c;this.cd=d;this.$d=f;this.ae=g;this.ra=new W;this.he();this.Rd=new Me(k,b,this.ra,h,j)}P(Le,Fe);Le[x].he=function(){this.ra[Ma]();this.ra.arc(this.bd,this.cd,this.$d,this.ae,0,360,l);this.ra.close()};Le[x].t=function(a){this.Rd.t(a)};
function Me(a,b,c,d,f){Ie[E](this,a,b,d,f);this.Rb(c)}P(Me,Ie);Me[x].Ua=l;Me[x].Rb=function(a){this.ra=a.va?a:ye(a);this.Ua&&this.j.da()};Me[x].t=function(a){this.Ua=i;a.beginPath();this.ra.Xa(function(b,c){switch(b){case 0:a[Ka](c[0],c[1]);break;case 1:for(b=0;b<c[w];b+=2)a[sa](c[b],c[b+1]);break;case 2:for(b=0;b<c[w];b+=6)a.bezierCurveTo(c[b],c[b+1],c[b+2],c[b+3],c[b+4],c[b+5]);break;case 3:e(m("Canvas paths cannot contain arcs"));case 4:a.closePath();break}})};
var Ne="left",Oe="DIV",Pe="display:table;position:absolute;padding:0;margin:0;border:0",Qe="display:table-cell;padding: 0;margin: 0;border: 0";function Re(a,b,c,d,f,g,h,j,n,s){Je[E](this,k,a,n,s);this.Mc=b;this.ha=c;this.xa=d;this.ia=f;this.ya=g;this.Tc=h||Ne;this.fd=j;this.b=sd(Oe,{style:Pe});this.bb=sd(Oe,{style:Qe});this.qe();this.re();a.a()[t](this.b);this.b[t](this.bb)}P(Re,Je);K=Re[x];K.Hc=function(a){this.Da=a;if(this.b)ha(this.b[C],a.p||a.ka)};K.Ic=function(){};K.t=function(){};
var Se="90%",Te="center",Ue="middle",Ve="top",Ye="bottom",Ze="pt",$e="100%",af="auto",bf="bold",cf="normal",df="italic";
K.qe=function(){var a=this.ha,b=this.ia,c=this.xa,d=this.ya,f=this.Tc,g=this.fd,h=this.b[C],j=this.j.Fa(),n=this.j.vd();if(a==b){h.lineHeight=Se;this.bb[C].verticalAlign=f==Te?Ue:f==Ne?c<d?Ve:Ye:c<d?Ye:Ve;h.textAlign=Te;b=g[ta]*j;h.top=o[z](o.min(c,d)*n)+U;ja(h,o[z]((a-b/2)*j)+U);p(h,o[z](b)+U);r(h,o.abs(c-d)*n+U);h.fontSize=g[ta]*0.6*n+Ze}else{h.lineHeight=$e;this.bb[C].verticalAlign=Ve;h.textAlign=f;h.top=o[z](((c+d)/2-g[ta]*2/3)*n)+U;ja(h,o[z](a*j)+U);p(h,o[z](o.abs(b-a)*j)+U);r(h,af);h.fontSize=
g[ta]*n+Ze}h.fontWeight=g.Na?bf:cf;h.fontStyle=g.Db?df:cf;h.fontFamily=g.wb;a=this.Da;ha(h,a.p||a.ka)};var ef="<br>";K.re=function(){this.bb.innerHTML=this.ha==this.ia?qb(this.Mc[xa](Q),Lb)[Qa](ef):Lb(this.Mc)};function ff(a,b,c,d,f,g,h){He[E](this,a,b);this.te=c;this.ue=d;this.Rc=f;this.vc=g;this.le=h}P(ff,He);ff[x].Ua=l;ff[x].t=function(a){if(this.wc){this.Rc&&this.vc&&a.drawImage(this.wc,this.te,this.ue,this.Rc,this.vc);this.Ua=i}else{a=new Image;a.onload=nb(this.zd,this,a);a.src=this.le}};
ff[x].zd=function(a){this.wc=a;this.j.da()};function gf(){};function hf(a,b,c,d,f,g){this.ha=a;this.xa=b;this.ia=c;this.ya=d;this.ka=f;this.Pa=g}P(hf,gf);function X(a,b){this.p=a;this.Ia=b||1}P(X,gf);function jf(a,b){this.f=a;this.p=b};function kf(a,b,c,d,f){ze[E](this,a,b,c,d,f)}P(kf,ze);K=kf[x];K.Nb=function(){this.da()};K.Ob=function(){this.da()};K.Cc=function(a){var b=this[La]();b.save();a=a.xd();var c=a.W,d=a.X;if(c||d)b.translate(c,d);(a=a.G)&&b.rotate(o.asin(a))};K.Kb=function(){this[La]().restore()};var lf="position:relative;overflow:hidden",mf="canvas";K.k=function(){var a=this.s.k(se,{style:lf});this.hb(a);this.za=this.s.k(mf);a[t](this.za);this.Gb=this.g=new Ke(this);this.Ud=0;this.Pc()};K.Yc=function(){this.la=k};
var nf="2d";K.getContext=function(){this.a()||this.k();if(!this.la){this.la=this.za[La](nf);this.la.save()}return this.la};var of="%";K.u=function(){var a=this[y],b=this[J],c=N(a)&&a[B](of)!=-1,d=N(b)&&b[B](of)!=-1;if(!this.n&&(c||d))return k;var f,g;if(c){f=this.a()[I];g=ke(f);a=ba(a)*g[y]/100}if(d){f=f||this.a()[I];g=g||ke(f);b=ba(b)*g[J]/100}return new S(a,b)};K.Pc=function(){ee(this.a(),this[y],this[J]);var a=this.u();if(a){ee(this.za,a[y],a[J]);p(this.za,a[y]);r(this.za,a[J]);this.Yc()}};
K.reset=function(){var a=this[La]();a.restore();var b=this.u();b[y]&&b[J]&&a.clearRect(0,0,b[y],b[J]);a.save()};na(K,function(){this.reset();this.g[Ma]();for(var a=this.a();a.childNodes[w]>1;)a[Ba](a.lastChild)});K.da=function(){if(this.Ae)this.ze=i;else if(this.n){this.reset();if(this.w){var a=this.u();this[La]().scale(a[y]/this.w,a[J]/this.Ca)}if(this.R||this.Y)this[La]().translate(-this.R,-this.Y);this.Cc(this.g);this.g.t(this.la);this.Kb()}};
K.jc=function(a){if(!(a instanceof Re)){var b=this[La]();this.Cc(a);if(!a.ld||!a.wd){a.t(b);this.Kb()}else{var c=a.Da;if(c)if(c instanceof X){if(c.Ia!=0){b.globalAlpha=c.Ia;b.fillStyle=c.p;a.t(b);b.fill();b.globalAlpha=1}}else{var d=b.createLinearGradient(c.ha,c.xa,c.ia,c.ya);d.addColorStop(0,c.ka);d.addColorStop(1,c.Pa);b.fillStyle=d;a.t(b);b.fill()}if(c=a.Sb){a.t(b);b.strokeStyle=c.p;a=c.f;if(N(a)&&a[B](U)!=-1)a=ba(a)/this.Fa();b.lineWidth=a;b.stroke()}this.Kb()}}};
K.m=function(a,b){b=b||this.g;b[t](a);this.Ed(b)&&this.jc(a)};K.vb=function(a,b,c,d,f,g,h){a=new Le(k,this,a,b,c,d,f,g);this.m(a,h);return a};K.drawImage=function(a,b,c,d,f,g){a=new ff(k,this,a,b,c,d,f);this.m(a,g);return a};K.na=function(a,b,c,d,f,g,h,j,n,s){a=new Re(this,a,b,c,d,f,g,h,j,n);this.m(a,s);return a};K.ma=function(a,b,c,d){a=new Me(k,this,a,b,c);this.m(a,d);return a};K.Ed=function(a){return this.n&&!this.Ud&&!this.Fd(a)};K.Fd=function(a){return a!=this.g&&a!=this.Gb};
K.qb=function(a){var b=new Ke(this);a=a||this.g;if(a==this.g||a==this.Gb)this.Gb=b;this.m(b,a);return b};K.c=function(){this.la=k;kf.h.c[E](this)};var pf="resize";K.D=function(){var a=this.u();kf.h.D[E](this);if(!a){this.Pc();this[Aa](pf)}this.da()};function qf(a,b){Ge[E](this,a,b)}P(qf,Ge);na(qf[x],function(){yd(this.a())});function rf(a,b,c,d){Fe[E](this,a,b,c,d)}P(rf,Fe);function sf(a,b,c,d){Ie[E](this,a,b,c,d)}P(sf,Ie);sf[x].Rb=function(a){this.j.Gc(this.a(),{d:tf(a)})};function uf(a,b,c,d){Je[E](this,a,b,c,d)}P(uf,Je);function vf(a,b){He[E](this,a,b)}P(vf,He);function wf(a,b,c,d,f){ze[E](this,a,b,c,d,f);this.Z={};this.Wb=mc;this.ca=new le(this)}var xf;P(wf,ze);var yf=0;K=wf[x];var zf="http://www.w3.org/2000/svg";K.z=function(a,b){a=this.s.T.createElementNS(zf,a);b&&this.Gc(a,b);return a};K.Gc=function(a,b){for(var c in b)a[F](c,b[c])};K.m=function(a,b){b=b||this.g;b.a()[t](a.a())};var Af="fill",Bf="fill-opacity",Cf="lg-",Df="-",Ef="linearGradient",Ff="userSpaceOnUse",Gf="0%",Hf="stop-color:",If="url(#";
K.Nb=function(a,b){a=a.a();if(b instanceof X){a[F](Af,b.p);a[F](Bf,b.Ia)}else if(b instanceof hf){var c=Cf+b.ha+Df+b.xa+Df+b.ia+Df+b.ya+Df+b.ka+Df+b.Pa,d=this.jd(c);if(!d){d=this.z(Ef,{x1:b.ha,y1:b.xa,x2:b.ia,y2:b.ya,gradientUnits:Ff});var f=this.z(Vd,{offset:Gf,style:Hf+b.ka});d[t](f);b=this.z(Vd,{offset:$e,style:Hf+b.Pa});d[t](b);d=this.Sc(c,d)}a[F](Af,If+d+id)}else a[F](Af,ge)};var Jf="stroke",Kf="stroke-width";
K.Ob=function(a,b){a=a.a();if(b){a[F](Jf,b.p);b=b.f;N(b)&&b[B](U)!=-1?a[F](Kf,ba(b)/this.Fa()):a[F](Kf,b)}else a[F](Jf,ge)};var Lf="svg",Mf="defs";K.k=function(){var a={width:this[y],height:this[J],overflow:he};a=this.z(Lf,a);var b=this.z(Tb);this.Sa=this.z(Mf);this.g=new qf(b,this);a[t](this.Sa);a[t](b);this.hb(a);this.je()};var Y=" ";K.yd=function(){return this.R+Y+this.Y+Y+(this.w?this.w+Y+this.Ca:Q)};var Nf="preserveAspectRatio",Of="viewBox";
K.je=function(){if(this.w||this.R||this.Y){this.a()[F](Nf,ge);this.Wb?this.lb():this.a()[F](Of,this.yd())}};var Pf="transform",Qf="scale(",Rf=") translate(";K.lb=function(){if(this.n&&(this.w||this.R||!this.Y)){var a=this.u();if(a[y]==0)oa(this.a()[C],he);else{oa(this.a()[C],Q);var b=-this.R,c=-this.Y,d=a[y]/this.w;a=a[J]/this.Ca;this.g.a()[F](Pf,Qf+d+Y+a+Rf+b+Y+c+id)}}};
K.u=function(){if(!lc)return ke(this.a());var a=this[y],b=this[J],c=N(a)&&a[B](of)!=-1,d=N(b)&&b[B](of)!=-1;if(!this.n&&(c||d))return k;var f,g;if(c){f=this.a()[I];g=ke(f);a=ba(a)*g[y]/100}if(d){f=f||this.a()[I];g=g||ke(f);b=ba(b)*g[J]/100}return new S(a,b)};na(K,function(){this.g[Ma]();yd(this.Sa);this.Z={}});var Sf="ellipse";K.vb=function(a,b,c,d,f,g,h){a=this.z(Sf,{cx:a,cy:b,rx:c,ry:d});f=new rf(a,this,f,g);this.m(f,h);return f};
var Tf="image",Uf="optimizeQuality",Vf="http://www.w3.org/1999/xlink",Wf="href";K.drawImage=function(a,b,c,d,f,g){a=this.z(Tf,{x:a,y:b,width:c,height:d,"image-rendering":Uf,preserveAspectRatio:ge});a.setAttributeNS(Vf,Wf,f);f=new vf(a,this);this.m(f,g);return f};var Xf="text-anchor",Yf="right",Zf="font-weight",$f="font-style",ag="rotate(",bg="text",cg="black";
K.na=function(a,b,c,d,f,g,h,j,n,s){var q=o[z](te(ue(o.atan2(f-c,d-b))));d=d-b;f=f-c;f=o[z](o.sqrt(d*d+f*f));var v=h[ta];d={"font-family":h.wb,"font-size":v};var D=o[z](v*0.85);v=o[z](c-v/2+D);D=b;if(g==Te){D+=o[z](f/2);d[Xf]=Ue}else if(g==Yf){D+=f;d[Xf]=Rd}d.x=D;d.y=v;if(h.Na)d[Zf]=bf;if(h.Db)d[$f]=df;if(q!=0)d.transform=ag+q+Y+b+Y+c+id;b=this.z(bg,d);b[t](this.s.T.createTextNode(a));if(j==k&&lc&&rc){a=cg;if(n instanceof X)a=n.p;j=new jf(1,a)}n=new uf(b,this,j,n);this.m(n,s);return n};var dg="path";
K.ma=function(a,b,c,d){a=this.z(dg,{d:tf(a)});b=new sf(a,this,b,c);this.m(b,d);return b};var eg="M",fg="L",gg="C",hg="A",ig="Z";function tf(a){var b=[];a.Xa(function(c,d){switch(c){case 0:b[u](eg);Array[x][u][H](b,d);break;case 1:b[u](fg);Array[x][u][H](b,d);break;case 2:b[u](gg);Array[x][u][H](b,d);break;case 3:c=d[3];b[u](hg,d[0],d[1],0,o.abs(c)>180?1:0,c>0?1:0,d[4],d[5]);break;case 4:b[u](ig);break}});return b[Qa](Y)}K=wf[x];
K.qb=function(a){var b=this.z(Tb);a=a||this.g;a.a()[t](b);return new qf(b,this)};var jg="_svgdef_",kg="id";K.Sc=function(a,b){if(a in this.Z)return this.Z[a];var c=jg+yf++;b[F](kg,c);this.Z[a]=c;a=this.Sa;a[t](b);return c};K.jd=function(a){return a in this.Z?this.Z[a]:k};K.D=function(){var a=this.u();wf.h.D[E](this);a||this[Aa](pf);if(this.Wb){a=this[y];var b=this[J];typeof a==eb&&a[B](of)!=-1&&typeof b==eb&&b[B](of)!=-1&&this.ca.Ib(lg(),Hd,this.lb);this.lb()}};
K.aa=function(){wf.h.aa[E](this);this.Wb&&this.ca.Oc(lg(),Hd,this.lb)};K.c=function(){delete this.Z;delete this.Sa;delete this.g;wf.h.c[E](this)};function lg(){if(!xf){xf=new Ed(400);xf.start()}return xf};function mg(a,b){Ge[E](this,a,b)}P(mg,Ge);na(mg[x],function(){yd(this.a())});function ng(a,b,c,d,f,g,h,j){Fe[E](this,a,b,h,j);this.we=c;this.xe=d;this.Ce=f;this.De=g}P(ng,Fe);function og(a,b,c,d){Ie[E](this,a,b,c,d)}P(og,Ie);og[x].Rb=function(a){this.a()[F](dg,pg(a))};function qg(a,b,c,d){Je[E](this,a,b,c,d)}P(qg,Je);function rg(a,b){He[E](this,a,b)}P(rg,He);function sg(a,b,c,d,f){ze[E](this,a,b,c,d,f);this.ca=new le(this)}P(sg,ze);function tg(a){return N(a)&&Bb(a,of)?a:ba(a[pa]())+U}function ug(a){return o[z]((ba(a[pa]())-0.5)*100)}function Z(a){return o[z](ba(a[pa]())*100)}K=sg[x];var vg="g_vml_:";K.K=function(a){return this.s[Ea](vg+a)};K.m=function(a,b){b=b||this.g;b.a()[t](a.a())};var wg="transparent",xg="gradient";
K.Nb=function(a,b){a=a.a();this.Wd(a);if(b instanceof X)if(b.p==wg)ga(a,l);else if(b.Ia!=1){ga(a,i);var c=this.K(Af);c.opacity=o[z](b.Ia*100)+of;ha(c,b.p);a[t](c)}else{ga(a,i);a.fillcolor=b.p}else if(b instanceof hf){ga(a,i);c=this.K(Af);ha(c,b.ka);c.color2=b.Pa;b=te(ue(o.atan2(b.ya-b.xa,b.ia-b.ha)));b=o[z](te(270-b));c.angle=b;ma(c,xg);a[t](c)}else ga(a,l)};var yg="1px";
K.Ob=function(a,b){a=a.a();if(b){a.stroked=i;var c=b.f;c=N(c)&&c[B](U)==-1?ba(c):c*this.Fa();var d=a.getElementsByTagName(Jf)[0];if(c<1){d=d||this.K(Jf);d.opacity=c;d.Ge=yg;ha(d,b.p);a[t](d)}else{d&&a[Ba](d);a.strokecolor=b.p;a.strokeweight=c+U}}else a.stroked=l};K.Wd=function(a){a.fillcolor=Q;for(var b=0;b<a.childNodes[w];b++){var c=a.childNodes[b];c.tagName==Af&&a[Ba](c)}};var zg="shape";
function Ag(a,b,c,d,f){var g=a[C];fa(g,ie);ja(g,ug(b)+U);g.top=ug(c)+U;p(g,Z(d)+U);r(g,Z(f)+U);if(a.tagName==zg)a.coordsize=Z(d)+Y+Z(f)}sg[x].pb=function(a){a=this.K(a);var b=this.zb();Ag(a,0,0,b[y],b[J]);return a};try{eval("document.namespaces")}catch(Bg){}K=sg[x];var Cg="g_vml_",Dg="urn:schemas-microsoft-com:vml",Eg="g_vml_\\:*{behavior:url(#default#VML)}",Fg="overflow:hidden;position:relative;width:",Gg=";height:",Hg="group",Ig="0 0";
K.k=function(){var a=this.s.T;if(!a.namespaces.g_vml_){a.namespaces.add(Cg,Dg);a=a.createStyleSheet();a.cssText=Eg}a=this[y];var b=this[J],c=this.s.k(se,{style:Fg+tg(a)+Gg+tg(b)});this.hb(c);var d=this.K(Hg),f=d[C];fa(f,ie);ja(f,f.top=0);p(f,this[y]);r(f,this[J]);d.coordsize=this.w?Z(this.w)+Y+Z(this.Ca):Z(a)+Y+Z(b);d.coordorigin=this.R!==aa?Z(this.R)+Y+Z(this.Y):Ig;c[t](d);this.g=new mg(d,this);Xc(c,pf,nb(this.Cb,this))};var Jg="propertychange";
K.Cb=function(){var a=ke(this.a()),b=this.g.a()[C];if(a[y]){p(b,a[y]+U);r(b,a[J]+U)}else{for(a=this.a();a&&a[Ia]&&a[Ia][Oa]!=ge;)a=a[I];a&&a[Ia]&&this.ca.Ib(a,Jg,this.Cb)}this[Aa](pf)};K.u=function(){var a=this.a();return new S(a[C].pixelWidth||a[ya]||1,a[C].pixelHeight||a[Pa]||1)};na(K,function(){this.g[Ma]()});var Kg="oval";K.vb=function(a,b,c,d,f,g,h){var j=this.K(Kg);Ag(j,a-c,b-d,c*2,d*2);a=new ng(j,this,a,b,c,d,f,g);this.m(a,h);return a};var Lg="src";
K.drawImage=function(a,b,c,d,f,g){var h=this.K(Tf);Ag(h,a,b,c,d);h[F](Lg,f);a=new rg(h,this);this.m(a,g);return a};var Mg="E",Ng="v",Og="textpathok",Pg="true",Qg="textpath",Rg="v-text-align";
K.na=function(a,b,c,d,f,g,h,j,n,s){var q=this.pb(zg),v=this.K(dg);b=eg+ug(b)+Ce+ug(c)+fg+ug(d)+Ce+ug(f)+Mg;v[F](Ng,b);v[F](Og,Pg);b=this.K(Qg);b[F](Uc,Pg);c=b[C];c.fontSize=h[ta]*this.Fa();c.fontFamily=h.wb;g!=k&&c[F](Rg,g);if(h.Na)c.fontWeight=bf;if(h.Db)c.fontStyle=df;b[F](eb,a);q[t](v);q[t](b);a=new qg(q,this,j,n);this.m(a,s);return a};K.ma=function(a,b,c,d){var f=this.pb(zg);f[F](dg,pg(a));a=new og(f,this,b,c);this.m(a,d);return a};var Sg="m",Tg="l",Ug="c",Vg="x",Wg="ae";
function pg(a){var b=[];a.Xa(function(c,d){switch(c){case 0:b[u](Sg);Array[x][u][H](b,qb(d,Z));break;case 1:b[u](Tg);Array[x][u][H](b,qb(d,Z));break;case 2:b[u](Ug);Array[x][u][H](b,qb(d,Z));break;case 4:b[u](Vg);break;case 3:var f=d[2]+d[3];c=Z(d[4]-V(f,d[0]));f=Z(d[5]-ve(f,d[1]));var g=Z(d[0]),h=Z(d[1]),j=o[z](d[2]*-65536);d=o[z](d[3]*-65536);b[u](Wg,c,f,g,h,j,d);break}});return b[Qa](Y)}sg[x].qb=function(a){var b=this.pb(Hg);a=a||this.g;a.a()[t](b);return new mg(b,this)};
sg[x].D=function(){sg.h.D[E](this);this.Cb()};sg[x].c=function(){this.g=k;sg.h.c[E](this)};function Xg(){}K=Xg[x];var Yg="#333333";K.kd=function(){return new jf(1,Yg)};var Zg="#f7f7f7",$g="#cccccc";K.qc=function(a,b,c){return new hf(a+c,b-c,a-c,b+c,Zg,$g)};var ah="#e0e0e0";K.pd=function(){return new jf(2,ah)};K.od=function(){return new X(Zg)};K.qd=function(){return new jf(2,Yg)};var bh="#666666";K.rd=function(){return new jf(1,bh)};K.md=function(){return new jf(1,bh)};var ch="#4684ee",dh="#3776d6";K.rc=function(a,b,c){return new hf(a+c,b-c,a-c,b+c,ch,dh)};var eh="#c63310";
K.td=function(){return new jf(1,eh)};var fh="#dc3912";K.sd=function(){return new X(fh,0.7)};function gh(a,b,c){this.gd=a;this.oe=b;this.backgroundColor=c}var hh="420";function ih(a,b,c){pe[E](this,c);this.f=a;this.A=b;a=a;b=b;c=c;var d=aa,f=aa;a=kc?new sg(a,b,c,d,f):mc&&(!zc(hh)||nc)?new kf(a,b,c,d,f):new wf(a,b,c,d,f);a.k();this.j=a=a;this.fb=[]}P(ih,pe);K=ih[x];K.q=0;K.B=100;K.yc=5;K.qa=2;K.$b=0;K.yb=k;K.wa=k;K.kb=k;K.Tb=k;K.Ub=k;K.Xb=k;K.me=k;K.dc=270;K.Ac=0;K.db=k;K.Ha=k;K.pa=k;K.Q=k;K.uc=function(){return this.q};var jh="valuemin";
K.jb=function(a){this.q=a;this.a()&&Dd(this.a(),jh,a)};K.tc=function(){return this.B};var kh="valuemax";K.ib=function(a){this.B=a;this.a()&&Dd(this.a(),kh,a)};var lh="valuenow";K.setValue=function(a,b){this.$b=a;this.yb=b||k;this.La();a=this.Zb(a);if(this.Ha==k){this.Ha=a;this.Ta()}else{this.Q=new Jd([this.Ha],[a],400,Id);a=[Pd,Od,Rd];Xc(this.Q,a,this.Kd,l,this);Xc(this.Q,Rd,this.Jd,l,this);this.Q.play(l)}this.a()&&Dd(this.a(),lh,this.$b)};
K.ee=function(a,b){this.yc=o.max(1,a);this.qa=o.max(1,b);this.U()};K.Pb=function(a){this.pa=a;this.U()};K.Jc=function(a){this.kb=a;this.U()};K.fe=function(a){this.Ub=a;this.U()};K.ie=function(a){this.Xb=a;this.Ta()};K.de=function(a){this.wa=a;this.U()};K.mb=function(a,b,c){this.fb[u](new gh(a,b,c));this.U()};var mh="goog-gauge";K.k=function(){this.hb(this.pc().k(se,mh,this.j.a()))};K.Zc=function(){this.j[Ma]();this.db=k};var nh="arial";
K.U=function(){if(this.n){this.Zc();var a,b,c=o.min(this.f,this.A);c=o[z](0.45*c);var d=this.f/2,f=this.A/2,g=this.wa;if(!g)g=ih[x].wa=new Xg;var h=this.j,j=this.wa.kd(),n=g.qc(d,f,c);h.ub(d,f,c,j,n);c-=j.f;c=o[z](c*0.9);j=g.pd();n=g.od(d,f,c);h.ub(d,f,c,j,n);c-=j.f*2;var s=c*0.75;for(j=0;j<this.fb[w];j++){n=this.fb[j];b=n.gd;var q=n.oe,v=h.Qa();b=this.Yb(b);q=this.Yb(q);v.arc(d,f,c,c,b,q-b,l);v.arc(d,f,s,s,q,b-q,i);v.close();n=new X(n.backgroundColor);h.ma(v,k,n)}if(this.kb||this.Tb){j=this.Ub;if(!j){j=
o[z](c*0.16);this.Ub=j=new Xd(j,nh)}n=new X(Yg);if(this.kb){b=f-o[z](c*0.35);h.na(this.kb,0,b,this.f,b,Te,j,k,n)}if(this.Tb){b=f+o[z](c*0.35);h.na(this.Tb,0,b,this.f,b,Te,j,k,n)}}j=this.yc;s=this.qa;n=c*0.8;q=c*0.9;var D=j*s;j=this.B-this.q;var Ec=j/D,We=h.Qa(),Xe=h.Qa(),th=new X(Yg),Fc=this.me;Fc||(Fc=new Xd(o[z](c*0.14),nh));var od=Fc[ta];for(j=0;j<=D;j++){var O=this.Yb(j*Ec+this.q),ib=j%s==0,ra=ib?n:q;v=ib?We:Xe;a=d+V(O,ra);b=f+ve(O,ra);v[Ka](a,b);a=d+V(O,c);b=f+ve(O,c);v[sa](a,b);if(ib&&this.pa){b=
o[A](j/s);if(v=this.pa[b]){a=d+V(O,ra-od/2);b=f+ve(O,ra-od/2);ra=Te;if(O>280||O<90){ra=Yf;O=0;a=a}else if(O>=90&&O<260){ra=Ne;O=a;a=this.f}else{ib=o.min(a,this.f-a);O=a-ib;a=a+ib;b+=o[z](od/4)}h.na(v,O,b,a,b,ra,Fc,k,th)}}}j=g.rd();h.ma(Xe,j,k);j=g.qd();h.ma(We,j,k);this.La();this.Fe=this.Zb(this.value);this.Ac=c;this.Ta()}};K.Kd=function(a){this.Ha=a.x;this.Ta()};K.Jd=function(){this.La()};K.La=function(){if(this.Q){cd(this.Q);this.Q.stop(l);this.Q=k}};
K.Zb=function(a){var b=this.B-this.q;a=(a-this.q)/b;a=o.max(a,-0.02);return a=o.min(a,1.02)};K.Yb=function(a){a=this.Zb(a);return this.Qc(a)};K.Qc=function(a){var b=te((360-this.dc)/2+90);return this.dc*a+b};
K.Ta=function(){if(this.n){var a=this.Ac,b=this.j,c=this.wa,d=this.f/2,f=this.A/2,g=this.Qc(this.Ha),h=o[z](a*0.95),j=o[z](a*0.3),n=V(g,h);h=ve(g,h);var s=V(g,j);j=ve(g,j);g=te(g+90);var q=a*0.07,v=V(g,q);q=ve(g,q);g=b.Qa();g[Ka](d+n,f+h);g.Ra(d+v,f+q,d-s+v/2,f-j+q/2,d-s,f-j);g.Ra(d-s-v/2,f-j-q/2,d-v,f-q,d+n,f+h);n=o[z](a*0.15);if(h=this.db)h[Ma]();else h=this.db=b.qb();if(this.yb){j=this.Xb;if(!j){s=o[z](a*0.18);j=new Xd(s,nh);j.Na=i;this.Xb=j}s=new X(cg);a=f+o[z](a*0.75);b.na(this.yb,0,a,this.f,
a,Te,j,k,s,h)}a=c.td();s=c.sd(d,f,n);b.ma(g,a,s,h);a=c.md();s=c.rc(d,f,n);b.ub(d,f,n,a,s,h)}};K.da=function(){this.U()};var oh="progressbar",ph="role",qh="live",rh="polite";K.D=function(){ih.h.D[E](this);var a=this.a(),b=a,c=oh;if(lc||Bd){b[F](ph,c);b.Be=c}Dd(a,qh,rh);Dd(a,jh,this.q);Dd(a,kh,this.B);Dd(a,lh,this.$b);this.U()};K.aa=function(){ih.h.aa[E](this);this.La()};K.c=function(){this.La();this.j.$();delete this.j;delete this.db;delete this.wa;delete this.fb;ih.h.c[E](this)};function sh(){}P(sh,Xg);sh[x].qc=function(){return new X($g)};sh[x].rc=function(){return new X(ch)};function $(a,b,c){this.Ba=a;this.f=b;this.A=c;this.Ea=[];this.I=[];this.pa=[];this.mc=[];this.Eb=[];this.q=0;this.B=100;this.Mb=this.Lb=this.bc=this.ac=this.Bb=this.Ab=k}var uh=new sh;K=$[x];K.qa=2;K.jb=function(a){if(this.q!=a){this.q=a;this.I[w]>0&&this.ta()}};K.uc=function(){return this.q};K.ib=function(a){if(this.B!=a){this.B=a;this.I[w]>0&&this.ta()}};K.tc=function(){return this.B};
K.Ec=function(a,b,c,d,f,g){this.Ab=a;this.Bb=b;this.ac=c;this.bc=d;this.Lb=f;this.Mb=g;this.I[w]>0&&this.ta()};K.Kc=function(a,b,c){var d=this.I[w]!=a[w];this.I=a;this.mc=b;this.Eb=c;d?this.ta():this.pe()};K.Pb=function(a){if(a[w]==1)a=[Q,a[0],Q];this.pa=a;this.Ea[w]>0&&this.ta()};K.be=function(a){if(this.qa!=a){this.qa=a;this.Ea[w]>0&&this.ta()}};K.ke=function(a,b){return b<=o[A](this.f/a)*o[A](this.A/a)};K.ob=function(a,b){return o.min(o[A](this.f/b),o[A](this.A/a))};
var vh="border: 0; padding: 0; margin: 0;",wh="table",xh="tbody",yh="tr",zh="td",Ah=" width: ",Bh="px;",Ch="#c0ffc0",Dh="#ffffa0",Eh="#ffc0c0";
K.ta=function(){var a=this.I[w],b=4,c=1,d=1;if(a>1){var f=this.f*this.A;f=o[A](o.sqrt(f/a));d=o[A](this.f/f);for(c=o[A](this.A/f);!this.ke(f,a);){var g=this.ob(c,d+1),h=this.ob(c+1,d);if(g>=h){f=g;d++}if(h>=g){f=h;c++}}}f=this.ob(c,d);f-=b;g=kd();h=vh;var j=g.k(wh,{style:h,cellpadding:2,cellspacing:0,align:Te}),n=g.k(xh,k);g[t](j,n);b=[];for(var s=0,q=0;q<c;q++){var v=g.k(yh,{style:h});g[t](n,v);for(var D=0;D<d;D++){var Ec=g.k(zh,{style:h+Ah+f+Bh});b[s++]=Ec;g[t](v,Ec)}}g.Dc(this.Ba);g[t](this.Ba,
j);this.Ea=[];c=o[z](f*0.1);c=new Xd(c,nh);for(d=0;d<a;d++){g=this.Ea[d]=new ih(f,f);g.jb(this.q);g.ib(this.B);g.Jc(this.Eb[d]);g.fe(c);g.ie(c);g.de(uh);h=this.pa;j=h[w];g.ee(j>1?j-1:4,this.qa);j>0&&g.Pb(h);g.setValue(this.I[d],this.mc[d]);this.Ab!=k&&this.Bb!=k&&g.mb(this.Ab,this.Bb,Ch);this.ac!=k&&this.bc!=k&&g.mb(this.ac,this.bc,Dh);this.Lb!=k&&this.Mb!=k&&g.mb(this.Lb,this.Mb,Eh);g.Xd(b[d])}};K.pe=function(){for(var a=0;a<this.I[w];a++){var b=this.Ea[a];b.Jc(this.Eb[a]);b.setValue(this.I[a],ca(this.I[a]))}};
var Fh=$,Gh=aa,Hh="GaugeStrip"[xa](Ra),Ih=Gh||L;!(Hh[0]in Ih)&&Ih.execScript&&Ih.execScript("var "+Hh[0]);for(var Jh;Hh[w]&&(Jh=Hh.shift());)if(!Hh[w]&&Fh!==aa)Ih[Jh]=Fh;else Ih=Ih[Jh]?Ih[Jh]:(Ih[Jh]={});$[x].setMinimum=$[x].jb;$[x].setMaximum=$[x].ib;$[x].getMinimum=$[x].uc;$[x].getMaximum=$[x].tc;$[x].setBackgroundColors=$[x].Ec;$[x].setValues=$[x].Kc;function Kh(a){this.Ba=a;this.s=kd()}Kh[x].f=0;Kh[x].A=0;Kh[x].Cd=function(a){var b=this.Ba,c;a:{if(a){c=a[y];if(typeof c==M&&c>=30&&1){c=c;break a}}if(b){c=b.clientWidth;if(c>=30){c=c;break a}}c=32}a:{if(a){a=a[J];if(typeof a==M&&a>=30&&1){a=a;break a}}if(b){a=b.clientHeight;if(a>=30){a=a;break a}}a=32}if(c!=this.f||a!=this.A){this.Lc=new $(b,c,a);this.f=c;this.A=a}};
Kh[x].t=function(a,b){b=b||{};var c=this.Ba;if(!c)e(m("Container is not defined"));if(!a)e(m("Data table is not defined"));this.Cd(b);c=this.Lc;b.min!=k&&c.jb(b.min);b.max!=k&&c.ib(b.max);var d=[];d=(d=b.majorTicks)&&d[w]?d:[ca(c.q),Q,Q,Q,ca(c.B)];c.Pb(d);b.minorTicks!=k&&c.be(b.minorTicks);var f=d=k;if(b.greenFrom!=k&&b.greenTo!=k){d=b.greenFrom;f=b.greenTo}var g=k,h=k;if(b.yellowFrom!=k&&b.yellowTo!=k){g=b.yellowFrom;h=b.yellowTo}var j=k,n=k;if(b.redFrom!=k&&b.redTo!=k){j=b.redFrom;n=b.redTo}c.Ec(d,
f,g,h,j,n);b=[];c=[];d=[];if(a.getNumberOfColumns()==2&&a.getColumnType(0)==eb&&a.getColumnType(1)==M)for(f=0;f<a.getNumberOfRows();f++){if(a[Na](f,0)!=k&&a[Na](f,1)!=k){d[u](a[Na](f,0));b[u](a[Na](f,1));c[u](a.getFormattedValue(f,1))}}else for(g=0;g<a.getNumberOfColumns();g++)if(a.getColumnType(g)==M)for(f=0;f<a.getNumberOfRows();f++){h=a[Na](f,g);if(h!=k){b[u](a[Na](f,g));c[u](a.getFormattedValue(f,g));d[u](a.getColumnLabel(g))}}this.Lc.Kc(b,c,d)};google_exportSymbol("google.visualization.Gauge",Kh);google_exportProperty(Kh[x],"draw",Kh[x].t); })();
google.loader.loaded({"module":"visualization","version":"1.0","components":["default","gauge"]});
google.loader.eval.visualization = function() {eval(arguments[0])}})()

/**************** content/js/ext/raphael.js *****************/
function init_raphael(document) {

/*!
 * Raphael 1.2.5 - JavaScript Vector Library
 *
 * Copyright (c) 2008 - 2009 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */


window.Raphael = (function () {
    var separator = /[, ]+/,
        doc = document,
        win = window,
        oldRaphael = {
            was: "Raphael" in win,
            is: win.Raphael
        },
        R = function () {
            if (R.is(arguments[0], "array")) {
                var a = arguments[0],
                    cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                    res = cnv.set();
                for (var i = 0, ii = a[length]; i < ii; i++) {
                    var j = a[i] || {};
                    ({circle:1, rect:1, path:1, ellipse:1, text:1, image:1})[has](j.type) && res[push](cnv[j.type]().attr(j));
                }
                return res;
            }
            return create[apply](R, arguments);
        },
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        E = "",
        events = ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup"],
        has = "hasOwnProperty",
        isit = /^\[object\s+|\]$/gi,
        join = "join",
        length = "length",
        proto = "prototype",
        lowerCase = String[proto].toLowerCase,
        mmax = Math.max,
        mmin = Math.min,
        nu = "number",
        toString = "toString",
        objectToString = Object[proto][toString],
        paper = {},
        pow = Math.pow,
        push = "push",
        rg = /^(?=[\da-f]$)/,
        ISURL = /^url\(['"]?([^\)]+)['"]?\)$/i,
        round = Math.round,
        S = " ",
        setAttribute = "setAttribute",
        split = "split",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = String[proto].toUpperCase,
        availableAttrs = {"clip-rect": "0 0 10e9 10e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {"clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
        rp = "replace";
    R.version = "1.2.5";
    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    R.svg = !(R.vml = R.type == "VML");
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        return ((type == "object" || type == "undefined") && typeof o == type) || (o == null && type == "null") || lowerCase.call(objectToString.call(o)[rp](isit, E)) == type;
    };
    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            toHex = cacher(function (color) {
                var bod;
                color = (color + E).replace(trim, E);
                try {
                    var document = new ActiveXObject("htmlfile");
                    document.write("<body>");
                    document.close();
                    bod = document.body;
                } catch(e) {
                    bod = createPopup().document.body;
                }
                var range = bod.createTextRange();
                try {
                    bod.style.color = color;
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value[toString](16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = doc.createElement("i");
            i.className = "Rapha\xebl Colour Picker";
            i.style.cssText = "display:none";
            doc.body[appendChild](i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    };
    R.hsb2rgb = cacher(function (hue, saturation, brightness) {
        if (R.is(hue, "object") && "h" in hue && "s" in hue && "b" in hue) {
            brightness = hue.b;
            saturation = hue.s;
            hue = hue.h;
        }
        var red,
            green,
            blue;
        if (brightness == 0) {
            return {r: 0, g: 0, b: 0, hex: "#000"};
        }
        if (hue > 1 || saturation > 1 || brightness > 1) {
            hue /= 255;
            saturation /= 255;
            brightness /= 255;
        }
        var i = ~~(hue * 6),
            f = (hue * 6) - i,
            p = brightness * (1 - saturation),
            q = brightness * (1 - (saturation * f)),
            t = brightness * (1 - (saturation * (1 - f)));
        red = [brightness, q, p, p, t, brightness, brightness][i];
        green = [t, brightness, brightness, q, p, p, t][i];
        blue = [p, p, t, brightness, brightness, q, p][i];
        red *= 255;
        green *= 255;
        blue *= 255;
        var rgb = {r: red, g: green, b: blue},
            r = (~~red)[toString](16),
            g = (~~green)[toString](16),
            b = (~~blue)[toString](16);
        r = r[rp](rg, "0");
        g = g[rp](rg, "0");
        b = b[rp](rg, "0");
        rgb.hex = "#" + r + g + b;
        return rgb;
    }, R);
    R.rgb2hsb = cacher(function (red, green, blue) {
        if (R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (R.is(red, "string")) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness};
    }, R);
    var p2s = /,?([achlmqrstvxz]),?/gi;
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array[proto].slice.call(arguments, 0),
                args = arg[join]("\u25ba"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count[push](args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour + E).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        colour = colour + E;
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !({hs: 1, rg: 1})[has](colour.substring(0, 2)) && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            rgb = colour.match(/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgb\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|rgb\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hs[bl]\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hs[bl]\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt(rgb[3].substring(3) + rgb[3].substring(3), 16);
                green = toInt(rgb[3].substring(2, 3) + rgb[3].substring(2, 3), 16);
                red = toInt(rgb[3].substring(1, 2) + rgb[3].substring(1, 2), 16);
            }
            if (rgb[4]) {
                rgb = rgb[4][split](/\s*,\s*/);
                red = toFloat(rgb[0]);
                green = toFloat(rgb[1]);
                blue = toFloat(rgb[2]);
            }
            if (rgb[5]) {
                rgb = rgb[5][split](/\s*,\s*/);
                red = toFloat(rgb[0]) * 2.55;
                green = toFloat(rgb[1]) * 2.55;
                blue = toFloat(rgb[2]) * 2.55;
            }
            if (rgb[6]) {
                rgb = rgb[6][split](/\s*,\s*/);
                red = toFloat(rgb[0]);
                green = toFloat(rgb[1]);
                blue = toFloat(rgb[2]);
                return R.hsb2rgb(red, green, blue);
            }
            if (rgb[7]) {
                rgb = rgb[7][split](/\s*,\s*/);
                red = toFloat(rgb[0]) * 2.55;
                green = toFloat(rgb[1]) * 2.55;
                blue = toFloat(rgb[2]) * 2.55;
                return R.hsb2rgb(red, green, blue);
            }
            rgb = {r: red, g: green, b: blue};
            var r = (~~red)[toString](16),
                g = (~~green)[toString](16),
                b = (~~blue)[toString](16);
            r = r[rp](rg, "0");
            g = g[rp](rg, "0");
            b = b[rp](rg, "0");
            rgb.hex = "#" + r + g + b;
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, "array") && R.is(pathString[0], "array")) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            (pathString + E)[rp](/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c[rp](/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig, function (a, b) {
                    b && params[push](+b);
                });
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    };
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path[length]; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X[push](x);
                Y[push](y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, "array") || !R.is(pathArray && pathArray[0], "array")) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res[toString] = R._path2string;
            return res;
        },
        pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, "array") || !R.is(pathArray && pathArray[0], "array")) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[push](["M", x, y]);
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i][length];
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, "array") || !R.is(pathArray && pathArray[0], "array")) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    default:
                        x = res[i][res[i][length] - 2];
                        y = res[i][res[i][length] - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var PI = Math.PI,
                _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * Math.cos(rad) - y * Math.sin(rad),
                        Y = x * Math.sin(rad) + y * Math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = Math.cos(PI / 180 * angle),
                    sin = Math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                rx = mmax(rx, Math.abs(x));
                ry = mmax(ry, Math.abs(y));
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = Math.asin((y1 - cy) / ry),
                    f2 = Math.asin((y2 - cy) / ry);

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (Math.abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * Math.cos(f2);
                y2 = cy + ry * Math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = Math.cos(f1),
                s1 = Math.sin(f1),
                c2 = Math.cos(f2),
                s2 = Math.sin(f2),
                t = Math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res)[join](",")[split](",");
                var newres = [];
                for (var i = 0, ii = res[length]; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        }),
        findDotsAtSegment = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t,
                x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
                mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
                my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
                nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
                ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
                ax = (1 - t) * p1x + t * c1x,
                ay = (1 - t) * p1y + t * c1y,
                cx = (1 - t) * c2x + t * p2x,
                cy = (1 - t) * c2y + t * p2y;
            return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}};
        }),
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            !isFinite(t1) && (t1 = .5);
            !isFinite(t2) && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / 2 / a;
            !isFinite(t1) && (t1 = .5);
            !isFinite(t2) && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i][length] > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi[length]) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                };
            for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg[length],
                    seg2len = p2 && seg2[length];
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient[length]; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots[push](dot);
            }
            for (var i = 1, ii = dots[length] - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        getContainer = function () {
            var container,
                x,
                y,
                width,
                height;
            if (R.is(arguments[0], "string") || R.is(arguments[0], "object")) {
                if (R.is(arguments[0], "string")) {
                    container = doc.getElementById(arguments[0]);
                } else {
                    container = arguments[0];
                }
                if (container.tagName) {
                    if (arguments[1] == null) {
                        return {
                            container: container,
                            width: container.style.pixelWidth || container.offsetWidth,
                            height: container.style.pixelHeight || container.offsetHeight
                        };
                    } else {
                        return {container: container, width: arguments[1], height: arguments[2]};
                    }
                }
            } else if (R.is(arguments[0], nu) && arguments[length] > 3) {
                return {container: 1, x: arguments[0], y: arguments[1], width: arguments[2], height: arguments[3]};
            }
        },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) if (add[has](prop) && !(prop in con)) {
                switch (typeof add[prop]) {
                    case "function":
                        (function (f) {
                            con[prop] = con === that ? f : function () { return f[apply](that, arguments); };
                        })(add[prop]);
                    break;
                    case "object":
                        con[prop] = con[prop] || {};
                        plugins.call(this, con[prop], add[prop]);
                    break;
                    default:
                        con[prop] = add[prop];
                    break;
                }
            }
        },
        tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        };

    // SVG
    if (R.svg) {
        paper.svgns = "http://www.w3.org/2000/svg";
        paper.xlink = "http://www.w3.org/1999/xlink";
        var round = function (num) {
            return +num + (~~num === num) * .5;
        },
            roundPath = function (path) {
                for (var i = 0, ii = path[length]; i < ii; i++) {
                    if (lowerCase.call(path[i][0]) != "a") {
                        for (var j = 1, jj = path[i][length]; j < jj; j++) {
                            path[i][j] = round(path[i][j]);
                        }
                    } else {
                        path[i][6] = round(path[i][6]);
                        path[i][7] = round(path[i][7]);
                    }
                }
                return path;
            },
            $ = function (el, attr) {
                if (attr) {
                    for (var key in attr) if (attr[has](key)) {
                        el[setAttribute](key, attr[key]);
                    }
                } else {
                    return doc.createElementNS(paper.svgns, el);
                }
            };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                fx = .5, fy = .5,
                s = o.style;
            gradient = (gradient + E)[rp](/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    if (pow(fx - .5, 2) + pow(fy - .5, 2) > .25) {
                        fy = Math.sqrt(.25 - pow(fx - .5, 2)) + .5;
                    }
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180)],
                    max = 1 / (mmax(Math.abs(vector[2]), Math.abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var el = $(type + "Gradient");
            el.id = "r" + (R._id++)[toString](36);
            type == "radial" ? $(el, {fx: fx, fy: fy}) : $(el, {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            };
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                    "": [0],
                    "none": [0],
                    "-": [3, 1],
                    ".": [1, 1],
                    "-.": [3, 1, 1, 1],
                    "-..": [3, 1, 1, 1, 1, 1],
                    ". ": [1, 3],
                    "- ": [4, 3],
                    "--": [8, 3],
                    "- .": [4, 3, 1, 3],
                    "--.": [8, 3, 1, 3],
                    "--..": [8, 3, 1, 3, 1, 3]
                },
                node = o.node,
                attrs = o.attrs,
                rot = o.rotate(),
                addDashes = function (o, value) {
                    value = dasharray[lowerCase.call(value)];
                    if (value) {
                        var width = o.attrs["stroke-width"] || "1",
                            butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                            dashes = [];
                        var i = value[length];
                        while (i--) {
                            dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                        }
                        $(node, {"stroke-dasharray": dashes[join](",")});
                    }
                };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = (rot + E)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) if (params[has](att)) {
                if (!availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "rotation":
                        o.rotate(value, true);
                        break;
                    // Hyperlink
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (lowerCase.call(pn.tagName) != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl[appendChild](node);
                            pn = hl;
                        }
                        pn.setAttributeNS(o.paper.xlink, att, value);
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "clip-rect":
                        var rect = (value + E)[split](separator);
                        if (rect[length] == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = "r" + (R._id++)[toString](36);
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el[appendChild](rc);
                            o.paper.defs[appendChild](el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                            clip && clip.parentNode.removeChild(clip);
                            $(node, {"clip-path": E});
                            delete o.clip;
                        }
                    break;
                    case "path":
                        if (value && o.type == "path") {
                            attrs.path = roundPath(pathToAbsolute(value));
                            $(node, {d: attrs.path});
                        }
                        break;
                    case "width":
                        node[setAttribute](att, value);
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                        node[setAttribute](att, round(value));
                        o.pattern && updatePosition(o);
                        break;
                    case "height":
                        node[setAttribute](att, value);
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                        node[setAttribute](att, round(value));
                        o.pattern && updatePosition(o);
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node[setAttribute](att, value);
                        }
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(o.paper.xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        node.style.strokeWidth = value;
                        // Need following line for Firefox
                        node[setAttribute](att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"]);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value);
                        break;
                    case "translation":
                        var xy = (value + E)[split](separator);
                        xy[0] = +xy[0] || 0;
                        xy[1] = +xy[1] || 0;
                        if (rotxy) {
                            rotxy[1] += xy[0];
                            rotxy[2] += xy[1];
                        }
                        translate.call(o, xy[0], xy[1]);
                        break;
                    case "scale":
                        var xy = (value + E)[split](separator);
                        o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
                        break;
                    case "fill":
                        var isURL = (value + E).match(ISURL);
                        if (isURL) {
                            var el = $("pattern"),
                                ig = $("image");
                            el.id = "r" + (R._id++)[toString](36);
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse"});
                            $(ig, {x: 0, y: 0});
                            ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                            el[appendChild](ig);

                            var img = doc.createElement("img");
                            img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                            img.onload = function () {
                                $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                doc.body.removeChild(this);
                                paper.safari();
                            };
                            doc.body[appendChild](img);
                            img.src = isURL[1];
                            o.paper.defs[appendChild](el);
                            node.style.fill = "url(#" + el.id + ")";
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        if (!R.getRGB(value).error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((({circle: 1, ellipse: 1})[has](o.type) || (value + E).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                    case "stroke":
                        node[setAttribute](att, R.getRGB(value).hex);
                        break;
                    case "gradient":
                        (({circle: 1, ellipse: 1})[has](o.type) || (value + E).charAt() != "r") && addGradientFill(node, value, o.paper);
                        break;
                    case "opacity":
                    case "fill-opacity":
                        if (attrs.gradient) {
                            var gradient = doc.getElementById(node.getAttribute("fill")[rp](/^url\(#|\)$/g, E));
                            if (gradient) {
                                var stops = gradient.getElementsByTagName("stop");
                                stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att[rp](/(\-.)/g, function (w) {
                            return upperCase.call(w.substring(1));
                        });
                        node.style[cssrule] = value;
                        // Need following line for Firefox
                        node[setAttribute](att, value);
                        break;
                }
            }
            
            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2;
        var tuneText = function (el, params) {
            if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                return;
            }
            var a = el.attrs,
                node = el.node,
                fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

            if (params[has]("text")) {
                a.text = params.text;
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                var texts = (params.text + E)[split]("\n");
                for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                    var tspan = $("tspan");
                    i && $(tspan, {dy: fontSize * leading, x: a.x});
                    tspan[appendChild](doc.createTextNode(texts[i]));
                    node[appendChild](tspan);
                }
            } else {
                var texts = node.getElementsByTagName("tspan");
                for (var i = 0, ii = texts[length]; i < ii; i++) {
                    i && $(texts[i], {dy: fontSize * leading, x: a.x});
                }
            }
            $(node, {y: a.y});
            var bb = el.getBBox(),
                dif = a.y - (bb.y + bb.height / 2);
            dif && isFinite(dif) && $(node, {y: a.y + dif});
        };
        var Element = function (node, svg) {
            var X = 0,
                Y = 0;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.paper = svg;
            this.attrs = this.attrs || {};
            this.transformations = []; // rotate, translate, scale
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg: 0, cx: 0, cy: 0},
                sx: 1,
                sy: 1
            };
            !svg.bottom && (svg.bottom = this);
            this.prev = svg.top;
            svg.top && (svg.top.next = this);
            svg.top = this;
            this.next = null;
        };
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = (deg + E)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function () {
            if (this.removed) {
                return this;
            }
            if (arguments[length] == 0) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                return res;
            }
            if (arguments[length] == 1 && R.is(arguments[0], "string")) {
                if (arguments[0] == "translation") {
                    return translate.call(this);
                }
                if (arguments[0] == "rotation") {
                    return this.rotate();
                }
                if (arguments[0] == "scale") {
                    return this.scale();
                }
                if (arguments[0] == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[arguments[0]];
            }
            if (arguments[length] == 1 && R.is(arguments[0], "array")) {
                var values = {};
                for (var j in arguments[0]) if (arguments[0][has](j)) {
                    values[arguments[0][j]] = this.attrs[arguments[0][j]];
                }
                return values;
            }
            if (arguments[length] == 2) {
                var params = {};
                params[arguments[0]] = arguments[1];
                setFillAndStroke(this, params);
            } else if (arguments[length] == 1 && R.is(arguments[0], "object")) {
                setFillAndStroke(this, arguments[0]);
            }
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var svg = this.paper,
                node = element.node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        
        var theCircle = function (svg, x, y, r) {
            x = round(x);
            y = round(y);
            var el = $("circle");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        };
        var theRect = function (svg, x, y, w, h, r) {
            x = round(x);
            y = round(y);
            var el = $("rect");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
            res.type = "rect";
            $(el, res.attrs);
            return res;
        };
        var theEllipse = function (svg, x, y, rx, ry) {
            x = round(x);
            y = round(y);
            var el = $("ellipse");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
            res.type = "ellipse";
            $(el, res.attrs);
            return res;
        };
        var theImage = function (svg, src, x, y, w, h) {
            var el = $("image");
            $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
            el.setAttributeNS(svg.xlink, "href", src);
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, src: src};
            res.type = "image";
            return res;
        };
        var theText = function (svg, x, y, text) {
            var el = $("text");
            $(el, {x: x, y: y, "text-anchor": "middle"});
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
            res.type = "text";
            setFillAndStroke(res, res.attrs);
            return res;
        };
        var setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas[setAttribute]("width", this.width);
            this.canvas[setAttribute]("height", this.height);
            return this;
        };
        var create = function () {
            var con = getContainer[apply](null, arguments),
                container = con && con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            paper.canvas = $("svg");
            var cnvs = paper.canvas;
            paper.width = width || 512;
            paper.height = height || 342;
            cnvs[setAttribute]("width", paper.width);
            cnvs[setAttribute]("height", paper.height);
            if (container == 1) {
                cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                doc.body[appendChild](cnvs);
            } else {
                if (container.firstChild) {
                    container.insertBefore(cnvs, container.firstChild);
                } else {
                    container[appendChild](cnvs);
                }
            }
            container = { canvas: cnvs };
            for (var prop in paper) if (paper[has](prop)) {
                container[prop] = paper[prop];
            }
            container.bottom = container.top = null;
            plugins.call(container, container, R.fn);
            container.clear();
            container.raphael = R;
            return container;
        };
        paper.clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        paper.remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                delete this[i];
            }
        };
    }

    // VML
    if (R.vml) {
        var path2vml = function (path) {
            var total =  /[ahqtv]/ig,
                command = pathToAbsolute;
            (path + E).match(total) && (command = path2curve);
            total =  /[clmz]/g;
            if (command == pathToAbsolute && !(path + E).match(total)) {
                var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
                    bites = /([clmz]),?([^clmz]*)/gi,
                    val = /-?[^,\s-]+/g;
                var res = (path + E)[rp](bites, function (all, command, args) {
                    var vals = [];
                    args[rp](val, function (value) {
                        vals[push](round(value));
                    });
                    return map[command] + vals;
                });
                return res;
            }
            var pa = command(path), p, res = [], r;
            for (var i = 0, ii = pa[length]; i < ii; i++) {
                p = pa[i];
                r = lowerCase.call(pa[i][0]);
                r == "z" && (r = "x");
                for (var j = 1, jj = p[length]; j < jj; j++) {
                    r += round(p[j]) + (j != jj - 1 ? "," : E);
                }
                res[push](r);
            }
            return res[join](S);
        };
        
        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, VML) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + VML.width + "px;height:" + VML.height + "px";
            g.coordsize = VML.coordsize;
            g.coordorigin = VML.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = VML.width + "px";
            ol.height = VML.height + "px";
            el.coordsize = this.coordsize;
            el.coordorigin = this.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, VML);
            p.isAbsolute = true;
            p.type = "path";
            p.path = [];
            p.Path = E;
            pathString && setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            VML.canvas[appendChild](g);
            return p;
        };
        var setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                a = o.attrs,
                s = node.style,
                xy,
                res = o;
            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            if (params.path && o.type == "path") {
                a.path = params.path;
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = (params.translation + E)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx +=+ xy[0];
                    o._.rt.cy +=+ xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = (params.scale + E)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = (params["clip-rect"] + E)[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                        dstyle = div.style,
                        group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = " progid:DXImageTransform.Microsoft.Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null || 
                params["stroke-width"] != null ||
                params.fill != null ||
                params.stroke != null ||
                params["stroke-width"] != null ||
                params["stroke-opacity"] != null ||
                params["fill-opacity"] != null ||
                params["stroke-dasharray"] != null ||
                params["stroke-miterlimit"] != null ||
                params["stroke-linejoin"] != null ||
                params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName("fill") && node.getElementsByTagName("fill")[0]),
                    newfill = false;
                !fill && (newfill = fill = createNode("fill"));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1);
                    opacity < 0 && (opacity = 0);
                    opacity > 1 && (opacity = 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || (params.fill + E).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                    params["stroke-width"] ||
                    params["stroke-opacity"] != null ||
                    params["stroke-dasharray"] ||
                    params["stroke-miterlimit"] ||
                    params["stroke-linejoin"] ||
                    params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                stroke.on && params.stroke && (stroke.color = R.getRGB(params.stroke).hex);
                var opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1),
                    width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity < 0 && (opacity = 0);
                opacity > 1 && (opacity = 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;
                
                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                var s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = (res.node.string + E)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);

                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                    break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                    break;
                    default:
                        res.node.style["v-text-align"] = "center";
                    break;
                }
            }
        };
        var addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                fill = o.node.getElementsByTagName("fill"),
                type = "linear",
                fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = (gradient + E)[rp](/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    if (pow(fx - .5, 2) + pow(fy - .5, 2) > .25) {
                        fy = Math.sqrt(.25 - pow(fx - .5, 2)) + .5;
                    }
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = fill[0] || createNode("fill");
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.type = (type == "radial") ? "gradientradial" : "gradient";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors.value = clrs[length] ? clrs[join](",") : "0% " + fill.color;
                if (type == "radial") {
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        var Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = (deg + E)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName("fill");
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        Element[proto].setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                x,
                y,
                w,
                h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "rect":
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2;
            if (this.type == "path" || this.type == "text") {
                (gs.left != left + "px") && (gs.left = left + "px");
                (gs.top != top + "px") && (gs.top = top + "px");
                this.X = this.type == "text" ? x : -left;
                this.Y = this.type == "text" ? y : -top;
                this.W = w;
                this.H = h;
                (os.left != -left + "px") && (os.left = -left + "px");
                (os.top != -top + "px") && (os.top = -top + "px");
            } else {
                (gs.left != left + "px") && (gs.left = left + "px");
                (gs.top != top + "px") && (gs.top = top + "px");
                this.X = x;
                this.Y = y;
                this.W = w;
                this.H = h;
                (gs.width != this.paper.width + "px") && (gs.width = this.paper.width + "px");
                (gs.height != this.paper.height + "px") && (gs.height = this.paper.height + "px");
                (os.left != x - left + "px") && (os.left = x - left + "px");
                (os.top != y - top + "px") && (os.top = y - top + "px");
                (os.width != w + "px") && (os.width = w + "px");
                (os.height != h + "px") && (os.height = h + "px");
                var arcsize = (+params.r || 0) / mmin(w, h);
                if (this.type == "rect" && this.arcsize != arcsize && (arcsize || this.arcsize)) {
                    // We should replace element with the new one
                    var o = createNode(arcsize ? "roundrect" : "rect");
                    o.arcsize = arcsize;
                    this.Group[appendChild](o);
                    this.node.parentNode.removeChild(this.node);
                    this.node = o;
                    this.arcsize = arcsize;
                    this.attr(this.attrs);
                }
            }
        };
        Element[proto].hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].attr = function () {
            if (this.removed) {
                return this;
            }
            if (arguments[length] == 0) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                return res;
            }
            if (arguments[length] == 1 && R.is(arguments[0], "string")) {
                if (arguments[0] == "translation") {
                    return translate.call(this);
                }
                if (arguments[0] == "rotation") {
                    return this.rotate();
                }
                if (arguments[0] == "scale") {
                    return this.scale();
                }
                if (arguments[0] == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[arguments[0]];
            }
            if (this.attrs && arguments[length] == 1 && R.is(arguments[0], "array")) {
                var values = {};
                for (var i = 0, ii = arguments[0][length]; i < ii; i++) {
                    values[arguments[0][i]] = this.attrs[arguments[0][i]];
                };
                return values;
            }
            var params;
            if (arguments[length] == 2) {
                params = {};
                params[arguments[0]] = arguments[1];
            }
            arguments[length] == 1 && R.is(arguments[0], "object") && (params = arguments[0]);
            if (params) {
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || (params.gradient + E).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (this.type != "path" || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        Element[proto].toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };

        var theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        var theRect = function (vml, x, y, w, h, r) {
            var g = createNode("group"),
                o = createNode("roundrect"),
                arcsize = (+r || 0) / (mmin(w, h));
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            o.arcsize = arcsize;
            var res = new Element(o, g, vml);
            res.type = "rect";
            setFillAndStroke(res, {stroke: "#000"});
            res.arcsize = arcsize;
            res.setBox({x: x, y: y, width: w, height: h, r: r});
            vml.canvas[appendChild](g);
            return res;
        };
        var theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        var theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                o = createNode("image"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        };
        var theText = function (vml, x, y, text) {
            var g = createNode("group"),
                el = createNode("shape"),
                ol = el.style,
                path = createNode("path"),
                ps = path.style,
                o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x), round(y), round(x) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = text + E;
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        };
        var setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        };
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            var createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            var createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        var create = function () {
            var con = getContainer[apply](null, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = {},
                c = res.canvas = doc.createElement("div"),
                cs = c.style;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = "1000 1000";
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999px;top:-9999px;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("width:{0};height:{1};position:absolute;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
                container = {
                    style: {
                        width: width,
                        height: height
                    }
                };
            } else {
                container.style.width = width;
                container.style.height = height;
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            for (var prop in paper) if (paper[has](prop)) {
                res[prop] = paper[prop];
            }
            plugins.call(res, res, R.fn);
            res.top = res.bottom = null;
            res.raphael = R;
            return res;
        };
        paper.clear = function () {
            this.canvas.innerHTML = E;
            this.bottom = this.top = null;
        };
        paper.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                delete this[i];
            }
        };
    }

    // rest
    // Safari or Chrome (WebKit) rendering bug workaround method
    if ({"Apple Computer, Inc.": 1, "Google Inc.": 1}[navigator.vendor] && !(navigator.userAgent.indexOf("Version/4.0") + 1)) {
        paper.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99);
            setTimeout(function () {rect.remove();});
        };
    } else {
        paper.safari = function () {};
    }

    // Events
    var addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e);
                };
                obj.addEventListener(type, f, false);
                return function () {
                    obj.removeEventListener(type, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e || win.event);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                if (type == "mouseover") {
                    obj.attachEvent("onmouseenter", f);
                    return function () {
                        obj.detachEvent("onmouseenter", f);
                        return detacher();
                    };
                } else if (type == "mouseout") {
                    obj.attachEvent("onmouseleave", f);
                    return function () {
                        obj.detachEvent("onmouseleave", f);
                        return detacher();
                    };
                }
                return detacher;
            };
        }
    })();
    for (var i = events[length]; i--;) {
        (function (eventName) {
            Element[proto][eventName] = function (fn) {
                if (R.is(fn, "function")) {
                    this.events = this.events || {};
                    this.events[eventName] = this.events[eventName] || {};
                    this.events[eventName][fn] = this.events[eventName][fn] || [];
                    this.events[eventName][fn][push](addEvent(this.shape || this.node, eventName, fn, this));
                }
                return this;
            };
            Element[proto]["un" + eventName] = function (fn) {
                var e = this.events;
                e &&
                e[eventName] &&
                e[eventName][fn] &&
                e[eventName][fn][length] &&
                e[eventName][fn].shift()() &&
                !e[eventName][fn][length] &&
                delete e[eventName][fn];
                return this;
            };

        })(events[i]);
    }
    Element[proto].hover = function (f_in, f_out) {
        return this.mouseover(f_in).mouseout(f_out);
    };
    paper.circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    paper.rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    paper.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    paper.path = function (pathString) {
        pathString && !R.is(pathString, "string") && !R.is(pathString[0], "array") && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    paper.image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    paper.text = function (x, y, text) {
        return theText(this, x || 0, y || 0, text || E);
    };
    paper.set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    paper.setSize = setSize;
    Element[proto].scale = function (x, y, cx, cy) {
        if (x == null && y == null) {
            return {x: this._.sx, y: this._.sy, toString: function () { return this.x + S + this.y; }};
        }
        y = y || x;
        !+y && (y = x);
        var dx,
            dy,
            dcx,
            dcy,
            a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2,
                kx = x / this._.sx,
                ky = y / this._.sy;
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var dirx = ~~(x / Math.abs(x)),
                diry = ~~(y / Math.abs(y)),
                s = this.node.style,
                ncx = cx + (rcx - cx) * kx,
                ncy = cy + (rcy - cy) * ky;
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * dirx * kx,
                        newh = a.height * diry * ky,
                        newr = a.r * mmin(kx, ky),
                        newx = ncx - neww / 2,
                        newy = ncy - newh / 2;
                    this.attr({
                        width: neww,
                        height: newh,
                        x: newx,
                        y: newy,
                        r: newr
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * dirx * kx,
                        ry: a.ry * diry * ky,
                        r: a.r * mmin(dirx * kx, diry * ky),
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                            j,
                            P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= kx;
                            p[path[i][length] - 1] *= ky;
                            p[1] *= dirx * kx;
                            p[2] *= diry * ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= kx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= ky;
                            }
                         } else {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? kx : ky;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path),
                        dx = ncx - dim2.x - dim2.width / 2,
                        dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;

                    this.attr({path: path});
                break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = " progid:DXImageTransform.Microsoft.Matrix(M11="[concat](dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                s = p / 4;
            return pow(2, -10 * n) * Math.sin((n - s) * (2 * Math.PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };

    var animationElements = {length : 0},
        animation = function () {
            var Now = +new Date;
            for (var l in animationElements) if (l != "length" && animationElements[has](l)) {
                var e = animationElements[l];
                if (e.stop) {
                    delete animationElements[l];
                    animationElements[length]--;
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    prev = e.prev || 0,
                    that = e.el,
                    callback = e.callback,
                    set = {},
                    now;
                if (time < ms) {
                    var pos = R.easing_formulas[easing] ? R.easing_formulas[easing](time / ms) : time / ms;
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case "number":
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ][join](",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i][join](S);
                                }
                                now = now[join](S);
                                break;
                            case "csv":
                                switch (attr) {
                                    case "translation":
                                        var x = diff[attr][0] * (time - prev),
                                            y = diff[attr][1] * (time - prev);
                                        t.x += x;
                                        t.y += y;
                                        now = x + S + y;
                                    break;
                                    case "rotation":
                                        now = +from[attr][0] + pos * ms * diff[attr][0];
                                        from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                    break;
                                    case "scale":
                                        now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                    break;
                                    case "clip-rect":
                                        now = [];
                                        var i = 4;
                                        while (i--) {
                                            now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                        }
                                    break;
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    that._run && that._run.call(that);
                } else {
                    (t.x || t.y) && that.translate(-t.x, -t.y);
                    to.scale && (to.scale = to.scale + E);
                    that.attr(to);
                    delete animationElements[l];
                    animationElements[length]--;
                    that.in_animation = null;
                    R.is(callback, "function") && callback.call(that);
                }
                e.prev = time;
            }
            R.svg && paper.safari();
            animationElements[length] && setTimeout(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : (color < 0 ? 0 : color);
        },
        translate = function (x, y) {
            if (x == null) {
                return {x: this._.tx, y: this._.ty};
            }
            this._.tx += +x;
            this._.ty += +y;
            switch (this.type) {
                case "circle":
                case "ellipse":
                    this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                    break;
                case "rect":
                case "image":
                case "text":
                    this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                    break;
                case "path":
                    var path = pathToRelative(this.attrs.path);
                    path[0][1] += +x;
                    path[0][2] += +y;
                    this.attr({path: path});
                break;
            }
            return this;
        };
    Element[proto].animateWith = function (element, params, ms, easing, callback) {
        animationElements[element.id] && (params.start = animationElements[element.id].start);
        return this.animate(params, ms, easing, callback);
    };
    Element[proto].onAnimation = function (f) {
        this._run = f || null;
        return this;
    };
    Element[proto].animate = function (params, ms, easing, callback) {
        if (R.is(easing, "function") || !easing) {
            callback = easing || null;
        }
        var from = {},
            to = {},
            diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr)) {
                from[attr] = this.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "number":
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        to[attr] = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = (params[attr] + E)[split](separator),
                            from2 = (from[attr] + E)[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                            break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                            break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = (from[attr] + E)[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                            break;
                            case "clip-rect":
                                from[attr] = (from[attr] + E)[split](separator);
                                diff[attr] = [];
                                var i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            break;
                        }
                        to[attr] = values;
                }
            }
        }
        this.stop();
        this.in_animation = 1;
        animationElements[this.id] = {
            start: params.start || +new Date,
            ms: ms,
            easing: easing,
            from: from,
            diff: diff,
            to: to,
            el: this,
            callback: callback,
            t: {x: 0, y: 0}
        };
        ++animationElements[length] == 1 && animation();
        return this;
    };
    Element[proto].stop = function () {
        animationElements[this.id] && animationElements[length]--;
        delete animationElements[this.id];
        return this;
    };
    Element[proto].translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    Element[proto][toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;

    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
            len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in Element[proto]) if (Element[proto][has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, "array") && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr[apply](this.items[i], arguments);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            set = this,
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        this.items[--i].animate(params, ms, easing || collector, collector);
        while (i--) {
            this.items[i].animateWith(this.items[len - 1], params, ms, easing || collector, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
    };
    Set[proto].getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items[length]; i--;) {
            var box = this.items[i].getBBox();
            x[push](box.x);
            y[push](box.y);
            w[push](box.x + box.width);
            h[push](box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    paper.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paper.print = function (x, y, string, font, size, origin) {
        origin = origin || "middle"; // baseline|middle
        var out = this.set(),
            letters = (string + E)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };

    R.format = function (token) {
        var args = R.is(arguments[1], "array") ? [0][concat](arguments[1]) : arguments,
            rg = /\{(\d+)\}/g;
        token && R.is(token, "string") && args[length] - 1 && (token = token[rp](rg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        var r = win.Raphael, u;
        if (oldRaphael.was) {
            win.Raphael = oldRaphael.is;
        } else {
            try {
                delete win.Raphael;
            } catch (e) {
                win.Raphael = u;
            }
        }
        return r;
    };
    R.el = Element[proto];
    return R;
})();

}


/**************** content/js/ext/g.raphael.js *****************/
function init_graphael() {

/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
 
 
(function () {
    Raphael.fn.g = Raphael.fn.g || {};
    Raphael.fn.g.markers = {
        disc: "disc",
        o: "disc",
        flower: "flower",
        f: "flower",
        diamond: "diamond",
        d: "diamond",
        square: "square",
        s: "square",
        triangle: "triangle",
        t: "triangle",
        star: "star",
        "*": "star",
        cross: "cross",
        x: "cross",
        plus: "plus",
        "+": "plus",
        arrow: "arrow",
        "->": "arrow"
    };
    Raphael.fn.g.shim = {stroke: "none", fill: "#000", "fill-opacity": 0};
    Raphael.fn.g.txtattr = {font: "12px Arial, sans-serif"};
    Raphael.fn.g.colors = [];
    var hues = [.6, .2, .05, .1333, .75, 0];
    for (var i = 0; i < 10; i++) {
        if (i < hues.length) {
            Raphael.fn.g.colors.push("hsb(" + hues[i] + ", .75, .75)");
        } else {
            Raphael.fn.g.colors.push("hsb(" + hues[i - hues.length] + ", 1, .5)");
        }
    }
    Raphael.fn.g.text = function (x, y, text) {
        return this.text(x, y, text).attr(this.g.txtattr);
    };
    Raphael.fn.g.labelise = function (label, val, total) {
        if (label) {
            return (label + "").replace(/(##+(?:\.#+)?)|(%%+(?:\.%+)?)/g, function (all, value, percent) {
                if (value) {
                    return (+val).toFixed(value.replace(/^#+\.?/g, "").length);
                }
                if (percent) {
                    return (val * 100 / total).toFixed(percent.replace(/^%+\.?/g, "").length) + "%";
                }
            });
        } else {
            return (+val).toFixed(0);
        }
    };

    Raphael.fn.g.finger = function (x, y, width, height, dir, ending, isPath) {
        // dir 0 for horisontal and 1 for vertical
        if ((dir && !height) || (!dir && !width)) {
            return isPath ? "" : this.path();
        }
        ending = {square: "square", sharp: "sharp", soft: "soft"}[ending] || "round";
        var path;
        height = Math.round(height);
        width = Math.round(width);
        x = Math.round(x);
        y = Math.round(y);
        switch (ending) {
            case "round":
            if (!dir) {
                var r = Math.floor(height / 2);
                if (width < r) {
                    r = width;
                    path = ["M", x + .5, y + .5 - Math.floor(height / 2), "l", 0, 0, "a", r, Math.floor(height / 2), 0, 0, 1, 0, height, "l", 0, 0, "z"];
                } else {
                    path = ["M", x + .5, y + .5 - r, "l", width - r, 0, "a", r, r, 0, 1, 1, 0, height, "l", r - width, 0, "z"];
                }
            } else {
                var r = Math.floor(width / 2);
                if (height < r) {
                    r = height;
                    path = ["M", x - Math.floor(width / 2), y, "l", 0, 0, "a", Math.floor(width / 2), r, 0, 0, 1, width, 0, "l", 0, 0, "z"];
                } else {
                    path = ["M", x - r, y, "l", 0, r - height, "a", r, r, 0, 1, 1, width, 0, "l", 0, height - r, "z"];
                }
            }
            break;
            case "sharp":
            if (!dir) {
                var half = Math.floor(height / 2);
                path = ["M", x, y + half, "l", 0, -height, Math.max(width - half, 0), 0, Math.min(half, width), half, -Math.min(half, width), half + (half * 2 < height), "z"];
            } else {
                var half = Math.floor(width / 2);
                path = ["M", x + half, y, "l", -width, 0, 0, -Math.max(height - half, 0), half, -Math.min(half, height), half, Math.min(half, height), half, "z"];
            }
            break;
            case "square":
            if (!dir) {
                path = ["M", x, y + Math.floor(height / 2), "l", 0, -height, width, 0, 0, height, "z"];
            } else {
                path = ["M", x + Math.floor(width / 2), y, "l", 1 - width, 0, 0, -height, width - 1, 0, "z"];
            }
            break;
            case "soft":
            var r;
            if (!dir) {
                r = Math.min(width, Math.round(height / 5));
                path = ["M", x + .5, y + .5 - Math.floor(height / 2), "l", width - r, 0, "a", r, r, 0, 0, 1, r, r, "l", 0, height - r * 2, "a", r, r, 0, 0, 1, -r, r, "l", r - width, 0, "z"];
            } else {
                r = Math.min(Math.round(width / 5), height);
                path = ["M", x - Math.floor(width / 2), y, "l", 0, r - height, "a", r, r, 0, 0, 1, r, -r, "l", width - 2 * r, 0, "a", r, r, 0, 0, 1, r, r, "l", 0, height - r, "z"];
            }
        }
        if (isPath) {
            return path.join(",");
        } else {
            return this.path(path);
        }
    };

    // Symbols
    Raphael.fn.g.disc = function (cx, cy, r) {
        return this.circle(cx, cy, r);
    };
    Raphael.fn.g.line = function (cx, cy, r) {
        return this.rect(cx - r, cy - r / 5, 2 * r, 2 * r / 5);
    };
    Raphael.fn.g.square = function (cx, cy, r) {
        r = r * .7;
        return this.rect(cx - r, cy - r, 2 * r, 2 * r);
    };
    Raphael.fn.g.triangle = function (cx, cy, r) {
        r *= 1.75;
        return this.path("M".concat(cx, ",", cy, "m0-", r * .58, "l", r * .5, ",", r * .87, "-", r, ",0z"));
    };
    Raphael.fn.g.diamond = function (cx, cy, r) {
        return this.path(["M", cx, cy - r, "l", r, r, -r, r, -r, -r, r, -r, "z"]);
    };
    Raphael.fn.g.flower = function (cx, cy, r, n) {
        r = r * 1.25;
        var rout = r,
            rin = rout * .5;
        n = +n < 3 || !n ? 5 : n;
        var points = ["M", cx, cy + rin, "Q"],
            R;
        for (var i = 1; i < n * 2 + 1; i++) {
            R = i % 2 ? rout : rin;
            points = points.concat([+(cx + R * Math.sin(i * Math.PI / n)).toFixed(3), +(cy + R * Math.cos(i * Math.PI / n)).toFixed(3)]);
        }
        points.push("z");
        return this.path(points.join(","));
    };
    Raphael.fn.g.star = function (cx, cy, r, r2) {
        r2 = r2 || r * .5;
        var points = ["M", cx, cy + r2, "L"],
            R;
        for (var i = 1; i < 10; i++) {
            R = i % 2 ? r : r2;
            points = points.concat([(cx + R * Math.sin(i * Math.PI * .2)).toFixed(3), (cy + R * Math.cos(i * Math.PI * .2)).toFixed(3)]);
        }
        points.push("z");
        return this.path(points.join(","));
    };
    Raphael.fn.g.cross = function (cx, cy, r) {
        r = r / 2.5;
        return this.path("M".concat(cx - r, ",", cy, "l", [-r, -r, r, -r, r, r, r, -r, r, r, -r, r, r, r, -r, r, -r, -r, -r, r, -r, -r, "z"]));
    };
    Raphael.fn.g.plus = function (cx, cy, r) {
        r = r / 2;
        return this.path("M".concat(cx - r / 2, ",", cy - r / 2, "l", [0, -r, r, 0, 0, r, r, 0, 0, r, -r, 0, 0, r, -r, 0, 0, -r, -r, 0, 0, -r, "z"]));
    };
    Raphael.fn.g.arrow = function (cx, cy, r) {
        return this.path("M".concat(cx - r * .7, ",", cy - r * .4, "l", [r * .6, 0, 0, -r * .4, r, r * .8, -r, r * .8, 0, -r * .4, -r * .6, 0], "z"));
    };

    // Tooltips
    Raphael.fn.g.tag = function (x, y, text, angle, r) {
        angle = angle || 0;
        r = r == null ? 5 : r;
        text = text == null ? "$9.99" : text;
        var R = .5522 * r,
            res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function () {
            this.rotate(0, x, y);
            var bb = this[1].getBBox();
            if (bb.height >= r * 2) {
                this[0].attr({path: ["M", x, y + r, "a", r, r, 0, 1, 1, 0, -r * 2, r, r, 0, 1, 1, 0, r * 2, "m", 0, -r * 2 -d, "a", r + d, r + d, 0, 1, 0, 0, (r + d) * 2, "L", x + r + d, y + bb.height / 2 + d, "l", bb.width + 2 * d, 0, 0, -bb.height - 2 * d, -bb.width - 2 * d, 0, "L", x, y - r - d].join(",")});
            } else {
                var dx = Math.sqrt(Math.pow(r + d, 2) - Math.pow(bb.height / 2 + d, 2));
                // ["c", -R, 0, -r, R - r, -r, -r, 0, -R, r - R, -r, r, -r, R, 0, r, r - R, r, r, 0, R, R - r, r, -r, r]
                // "a", r, r, 0, 1, 1, 0, -r * 2, r, r, 0, 1, 1, 0, r * 2,
                this[0].attr({path: ["M", x, y + r, "c", -R, 0, -r, R - r, -r, -r, 0, -R, r - R, -r, r, -r, R, 0, r, r - R, r, r, 0, R, R - r, r, -r, r, "M", x + dx, y - bb.height / 2 - d, "a", r + d, r + d, 0, 1, 0, 0, bb.height + 2 * d, "l", r + d - dx + bb.width + 2 * d, 0, 0, -bb.height - 2 * d, "L", x + dx, y - bb.height / 2 - d].join(",")});
            }
            this[1].attr({x: x + r + d + bb.width / 2, y: y});
            angle = (360 - angle) % 360;
            this.rotate(angle, x, y);
            angle > 90 && angle < 270 && this[1].attr({x: x - r - d - bb.width / 2, y: y, rotation: [180 + angle, x, y]});
            return this;
        };
        res.update();
        return res;
    };
    Raphael.fn.g.popupit = function (x, y, set, dir, size) {
        dir = dir == null ? 2 : dir;
        size = size || 5;
        x = Math.round(x) + .5;
        y = Math.round(y) + .5;
        var bb = set.getBBox(),
            w = Math.round(bb.width / 2),
            h = Math.round(bb.height / 2),
            dx = [0, w + size * 2, 0, -w - size * 2],
            dy = [-h * 2 - size * 3, -h - size, 0, -h - size],
            p = ["M", x - dx[dir], y - dy[dir], "l", -size, (dir == 2) * -size, -Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, -size, -size,
                "l", 0, -Math.max(h - size, 0), (dir == 3) * -size, -size, (dir == 3) * size, -size, 0, -Math.max(h - size, 0), "a", size, size, 0, 0, 1, size, -size,
                "l", Math.max(w - size, 0), 0, size, !dir * -size, size, !dir * size, Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, size, size,
                "l", 0, Math.max(h - size, 0), (dir == 1) * size, size, (dir == 1) * -size, size, 0, Math.max(h - size, 0), "a", size, size, 0, 0, 1, -size, size,
                "l", -Math.max(w - size, 0), 0, "z"].join(","),
            xy = [{x: x, y: y + size * 2 + h}, {x: x - size * 2 - w, y: y}, {x: x, y: y - size * 2 - h}, {x: x + size * 2 + w, y: y}][dir];
        set.translate(xy.x - w - bb.x, xy.y - h - bb.y);
        return this.path(p).attr({fill: "#000", stroke: "none"}).insertBefore(set.node ? set : set[0]);
    };
    Raphael.fn.g.popup = function (x, y, text, dir, size) {
        dir = dir == null ? 2 : dir;
        size = size || 5;
        text = text || "$9.99";
        var res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function (X, Y, withAnimation) {
            X = X || x;
            Y = Y || y;
            var bb = this[1].getBBox(),
                w = bb.width / 2,
                h = bb.height / 2,
                dx = [0, w + size * 2, 0, -w - size * 2],
                dy = [-h * 2 - size * 3, -h - size, 0, -h - size],
                p = ["M", X - dx[dir], Y - dy[dir], "l", -size, (dir == 2) * -size, -Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, -size, -size,
                    "l", 0, -Math.max(h - size, 0), (dir == 3) * -size, -size, (dir == 3) * size, -size, 0, -Math.max(h - size, 0), "a", size, size, 0, 0, 1, size, -size,
                    "l", Math.max(w - size, 0), 0, size, !dir * -size, size, !dir * size, Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, size, size,
                    "l", 0, Math.max(h - size, 0), (dir == 1) * size, size, (dir == 1) * -size, size, 0, Math.max(h - size, 0), "a", size, size, 0, 0, 1, -size, size,
                    "l", -Math.max(w - size, 0), 0, "z"].join(","),
                xy = [{x: X, y: Y + size * 2 + h}, {x: X - size * 2 - w, y: Y}, {x: X, y: Y - size * 2 - h}, {x: X + size * 2 + w, y: Y}][dir];
            if (withAnimation) {
                this[0].animate({path: p}, 500, ">");
                this[1].animate(xy, 500, ">");
            } else {
                this[0].attr({path: p});
                this[1].attr(xy);
            }
            return this;
        };
        return res.update(x, y);
    };
    Raphael.fn.g.flag = function (x, y, text, angle) {
        angle = angle || 0;
        text = text || "$9.99";
        var res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function (x, y) {
            this.rotate(0, x, y);
            var bb = this[1].getBBox(),
                h = bb.height / 2;
            this[0].attr({path: ["M", x, y, "l", h + d, -h - d, bb.width + 2 * d, 0, 0, bb.height + 2 * d, -bb.width - 2 * d, 0, "z"].join(",")});
            this[1].attr({x: x + h + d + bb.width / 2, y: y});
            angle = 360 - angle;
            this.rotate(angle, x, y);
            angle > 90 && angle < 270 && this[1].attr({x: x - r - d - bb.width / 2, y: y, rotation: [180 + angle, x, y]});
            return this;
        };
        return res.update(x, y);
    };
    Raphael.fn.g.label = function (x, y, text) {
        var res = this.set();
        res.push(this.rect(x, y, 10, 10).attr({stroke: "none", fill: "#000"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function () {
            var bb = this[1].getBBox(),
                r = Math.min(bb.width + 10, bb.height + 10) / 2;
            this[0].attr({x: bb.x - r / 2, y: bb.y - r / 2, width: bb.width + r, height: bb.height + r, r: r});
        };
        res.update();
        return res;
    };
    Raphael.fn.g.labelit = function (set) {
        var bb = set.getBBox(),
            r = Math.min(20, bb.width + 10, bb.height + 10) / 2;
        return this.rect(bb.x - r / 2, bb.y - r / 2, bb.width + r, bb.height + r, r).attr({stroke: "none", fill: "#000"}).insertBefore(set[0]);
    };
    Raphael.fn.g.drop = function (x, y, text, size, angle) {
        size = size || 30;
        angle = angle || 0;
        var res = this.set();
        res.push(this.path(["M", x, y, "l", size, 0, "A", size * .4, size * .4, 0, 1, 0, x + size * .7, y - size * .7, "z"]).attr({fill: "#000", stroke: "none", rotation: [22.5 - angle, x, y]}));
        angle = (angle + 90) * Math.PI / 180;
        res.push(this.text(x + size * Math.sin(angle), y + size * Math.cos(angle), text).attr(this.g.txtattr).attr({"font-size": size * 12 / 30, fill: "#fff"}));
        res.drop = res[0];
        res.text = res[1];
        return res;
    };
    Raphael.fn.g.blob = function (x, y, text, angle, size) {
        angle = (+angle + 1 ? angle : 45) + 90;
        size = size || 12;
        var rad = Math.PI / 180,
            fontSize = size * 12 / 12;
        var res = this.set();
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x + size * Math.sin((angle) * rad), y + size * Math.cos((angle) * rad) - fontSize / 2, text).attr(this.g.txtattr).attr({"font-size": fontSize, fill: "#fff"}));
        res.update = function (X, Y, withAnimation) {
            X = X || x;
            Y = Y || y;
            var bb = this[1].getBBox(),
                w = Math.max(bb.width + fontSize, size * 25 / 12),
                h = Math.max(bb.height + fontSize, size * 25 / 12),
                x2 = X + size * Math.sin((angle - 22.5) * rad),
                y2 = Y + size * Math.cos((angle - 22.5) * rad),
                x1 = X + size * Math.sin((angle + 22.5) * rad),
                y1 = Y + size * Math.cos((angle + 22.5) * rad),
                dx = (x1 - x2) / 2,
                dy = (y1 - y2) / 2,
                rx = w / 2,
                ry = h / 2,
                k = -Math.sqrt(Math.abs(rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx) / (rx * rx * dy * dy + ry * ry * dx * dx)),
                cx = k * rx * dy / ry + (x1 + x2) / 2,
                cy = k * -ry * dx / rx + (y1 + y2) / 2;
            if (withAnimation) {
                this.animate({x: cx, y: cy, path: ["M", x, y, "L", x1, y1, "A", rx, ry, 0, 1, 1, x2, y2, "z"].join(",")}, 500, ">");
            } else {
                this.attr({x: cx, y: cy, path: ["M", x, y, "L", x1, y1, "A", rx, ry, 0, 1, 1, x2, y2, "z"].join(",")});
            }
            return this;
        };
        res.update(x, y);
        return res;
    };

    Raphael.fn.g.colorValue = function (value, total, s, b) {
        return "hsb(" + [Math.min((1 - value / total) * .4, 1), s || .75, b || .75] + ")";
    };

    Raphael.fn.g.snapEnds = function (from, to, steps) {
        var f = from,
            t = to;
        if (f == t) {
            return {from: f, to: t, power: 0};
        }
        function round(a) {
            return Math.abs(a - .5) < .25 ? Math.floor(a) + .5 : Math.round(a);
        }
        var d = (t - f) / steps,
            r = Math.floor(d),
            R = r,
            i = 0;
        if (r) {
            while (R) {
                i--;
                R = Math.floor(d * Math.pow(10, i)) / Math.pow(10, i);
            }
            i ++;
        } else {
            while (!r) {
                i = i || 1;
                r = Math.floor(d * Math.pow(10, i)) / Math.pow(10, i);
                i++;
            }
            i && i--;
        }
        var t = round(to * Math.pow(10, i)) / Math.pow(10, i);
        if (t < to) {
            t = round((to + .5) * Math.pow(10, i)) / Math.pow(10, i);
        }
        var f = round((from - (i > 0 ? 0 : .5)) * Math.pow(10, i)) / Math.pow(10, i);
        return {from: f, to: t, power: i};
    };
    Raphael.fn.g.axis = function (x, y, length, from, to, steps, orientation, labels, type, dashsize) {
        dashsize = dashsize == null ? 2 : dashsize;
        type = type || "t";
        steps = steps || 10;
        var path = type == "|" || type == " " ? ["M", x + .5, y, "l", 0, .001] : orientation == 1 || orientation == 3 ? ["M", x + .5, y, "l", 0, -length] : ["M", x, y + .5, "l", length, 0],
            ends = this.g.snapEnds(from, to, steps),
            f = ends.from,
            t = ends.to,
            i = ends.power,
            j = 0,
            text = this.set();
        d = (t - f) / steps;
        var label = f,
            rnd = i > 0 ? i : 0;
            dx = length / steps;
        if (+orientation == 1 || +orientation == 3) {
            var Y = y,
                addon = (orientation - 1 ? 1 : -1) * (dashsize + 3 + !!(orientation - 1));
            while (Y >= y - length) {
                type != "-" && type != " " && (path = path.concat(["M", x - (type == "+" || type == "|" ? dashsize : !(orientation - 1) * dashsize * 2), Y + .5, "l", dashsize * 2 + 1, 0]));
                text.push(this.text(x + addon, Y, (labels && labels[j++]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr).attr({"text-anchor": orientation - 1 ? "start" : "end"}));
                label += d;
                Y -= dx;
            }
            if (Math.round(Y + dx - (y - length))) {
                type != "-" && type != " " && (path = path.concat(["M", x - (type == "+" || type == "|" ? dashsize : !(orientation - 1) * dashsize * 2), y - length + .5, "l", dashsize * 2 + 1, 0]));
                text.push(this.text(x + addon, y - length, (labels && labels[j]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr).attr({"text-anchor": orientation - 1 ? "start" : "end"}));
            }
        } else {
            var X = x,
                label = f,
                rnd = i > 0 ? i : 0,
                addon = (orientation ? -1 : 1) * (dashsize + 9 + !orientation),
                dx = length / steps,
                txt = 0,
                prev = 0;
            while (X <= x + length) {
                type != "-" && type != " " && (path = path.concat(["M", X + .5, y - (type == "+" ? dashsize : !!orientation * dashsize * 2), "l", 0, dashsize * 2 + 1]));
                text.push(txt = this.text(X, y + addon, (labels && labels[j++]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr));
                var bb = txt.getBBox();
                if (prev >= bb.x - 5) {
                    text.pop(text.length - 1).remove();
                } else {
                    prev = bb.x + bb.width;
                }
                label += d;
                X += dx;
            }
            if (Math.round(X - dx - x - length)) {
                type != "-" && type != " " && (path = path.concat(["M", x + length + .5, y - (type == "+" ? dashsize : !!orientation * dashsize * 2), "l", 0, dashsize * 2 + 1]));
                text.push(this.text(x + length, y + addon, (labels && labels[j]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr));
            }
        }
        var res = this.path(path);
        res.text = text;
        res.all = this.set([res, text]);
        res.remove = function () {
            this.text.remove();
            this.constructor.prototype.remove.call(this);
        };
        return res;
    };

    Raphael.el.lighter = function (times) {
        times = times || 2;
        var fs = [this.attrs.fill, this.attrs.stroke];
        this.fs = this.fs || [fs[0], fs[1]];
        fs[0] = Raphael.rgb2hsb(Raphael.getRGB(fs[0]).hex);
        fs[1] = Raphael.rgb2hsb(Raphael.getRGB(fs[1]).hex);
        fs[0].b = Math.min(fs[0].b * times, 1);
        fs[0].s = fs[0].s / times;
        fs[1].b = Math.min(fs[1].b * times, 1);
        fs[1].s = fs[1].s / times;
        this.attr({fill: "hsb(" + [fs[0].h, fs[0].s, fs[0].b] + ")", stroke: "hsb(" + [fs[1].h, fs[1].s, fs[1].b] + ")"});
    };
    Raphael.el.darker = function (times) {
        times = times || 2;
        var fs = [this.attrs.fill, this.attrs.stroke];
        this.fs = this.fs || [fs[0], fs[1]];
        fs[0] = Raphael.rgb2hsb(Raphael.getRGB(fs[0]).hex);
        fs[1] = Raphael.rgb2hsb(Raphael.getRGB(fs[1]).hex);
        fs[0].s = Math.min(fs[0].s * times, 1);
        fs[0].b = fs[0].b / times;
        fs[1].s = Math.min(fs[1].s * times, 1);
        fs[1].b = fs[1].b / times;
        this.attr({fill: "hsb(" + [fs[0].h, fs[0].s, fs[0].b] + ")", stroke: "hsb(" + [fs[1].h, fs[1].s, fs[1].b] + ")"});
    };
    Raphael.el.original = function () {
        if (this.fs) {
            this.attr({fill: this.fs[0], stroke: this.fs[1]});
            delete this.fs;
        }
    };
})();

}


/**************** content/js/ext/g.bar.js *****************/
function init_graphael_bar() {

/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.barchart = function (x, y, width, height, values, opts) {
    opts = opts || {};
    var type = {round: "round", sharp: "sharp", soft: "soft"}[opts.type] || "square",
        gutter = parseFloat(opts.gutter || "20%"),
        chart = this.set(),
        bars = this.set(),
        covers = this.set(),
        covers2 = this.set(),
        total = Math.max.apply(Math, values),
        stacktotal = [],
        paper = this,
        multi = 0,
        colors = opts.colors || this.g.colors,
        len = values.length;
    if (this.raphael.is(values[0], "array")) {
        total = [];
        multi = len;
        len = 0;
        for (var i = values.length; i--;) {
            bars.push(this.set());
            total.push(Math.max.apply(Math, values[i]));
            len = Math.max(len, values[i].length);
        }
        if (opts.stacked) {
            for (var i = len; i--;) {
                var tot = 0;
                for (var j = values.length; j--;) {
                    tot +=+ values[j][i] || 0;
                }
                stacktotal.push(tot);
            }
        }
        for (var i = values.length; i--;) {
            if (values[i].length < len) {
                for (var j = len; j--;) {
                    values[i].push(0);
                }
            }
        }
        total = Math.max.apply(Math, opts.stacked ? stacktotal : total);
    }
    
    total = (opts.to) || total;
    var barwidth = width / (len * (100 + gutter) + gutter) * 100,
        barhgutter = barwidth * gutter / 100,
        barvgutter = opts.vgutter == null ? 20 : opts.vgutter,
        stack = [],
        X = x + barhgutter,
        Y = (height - 2 * barvgutter) / total;
    if (!opts.stretch) {
        barhgutter = Math.round(barhgutter);
        barwidth = Math.floor(barwidth);
    }
    !opts.stacked && (barwidth /= multi || 1);
    for (var i = 0; i < len; i++) {
        stack = [];
        for (var j = 0; j < (multi || 1); j++) {
            var h = Math.round((multi ? values[j][i] : values[i]) * Y),
                top = y + height - barvgutter - h,
                bar = this.g.finger(Math.round(X + barwidth / 2), top + h, barwidth, h, true, type).attr({stroke: colors[multi ? j : i], fill: colors[multi ? j : i]});
            if (multi) {
                bars[j].push(bar);
            } else {
                bars.push(bar);
            }
            bar.y = top;
            bar.x = Math.round(X + barwidth / 2);
            bar.w = barwidth;
            bar.h = h;
            bar.value = multi ? values[j][i] : values[i];
            if (!opts.stacked) {
                X += barwidth;
            } else {
                stack.push(bar);
            }
        }
        if (opts.stacked) {
            var cvr;
            covers2.push(cvr = this.rect(stack[0].x - stack[0].w / 2, y, barwidth, height).attr(this.g.shim));
            cvr.bars = this.set();
            var size = 0;
            for (var s = stack.length; s--;) {
                stack[s].toFront();
            }
            for (var s = 0, ss = stack.length; s < ss; s++) {
                var bar = stack[s],
                    cover,
                    h = (size + bar.value) * Y,
                    path = this.g.finger(bar.x, y + height - barvgutter - !!size * .5, barwidth, h, true, type, 1);
                cvr.bars.push(bar);
                size && bar.attr({path: path});
                bar.h = h;
                bar.y = y + height - barvgutter - !!size * .5 - h;
                covers.push(cover = this.rect(bar.x - bar.w / 2, bar.y, barwidth, bar.value * Y).attr(this.g.shim));
                cover.bar = bar;
                cover.value = bar.value;
                size += bar.value;
            }
            X += barwidth;
        }
        X += barhgutter;
    }
    covers2.toFront();
    X = x + barhgutter;
    if (!opts.stacked) {
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < (multi || 1); j++) {
                var cover;
                covers.push(cover = this.rect(Math.round(X), y + barvgutter, barwidth, height - barvgutter).attr(this.g.shim));
                cover.bar = multi ? bars[j][i] : bars[i];
                cover.value = cover.bar.value;
                X += barwidth;
            }
            X += barhgutter;
        }
    }
    chart.label = function (labels, isBottom) {
        labels = labels || [];
        this.labels = paper.set();
        var L, l = -Infinity;
        if (opts.stacked) {
            for (var i = 0; i < len; i++) {
                var tot = 0;
                for (var j = 0; j < (multi || 1); j++) {
                    tot += multi ? values[j][i] : values[i];
                    if (j == multi - 1) {
                        var label = paper.g.labelise(labels[i], tot, total);
                        L = paper.g.text(bars[i * (multi || 1) + j].x, y + height - barvgutter / 2, label).insertBefore(covers[i * (multi || 1) + j]);
                        var bb = L.getBBox();
                        if (bb.x - 7 < l) {
                            L.remove();
                        } else {
                            this.labels.push(L);
                            l = bb.x + bb.width;
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < (multi || 1); j++) {
                    var label = paper.g.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], total);
                    L = paper.g.text(bars[i * (multi || 1) + j].x, isBottom ? y + height - barvgutter / 2 : bars[i * (multi || 1) + j].y - 10, label).insertBefore(covers[i * (multi || 1) + j]);
                    var bb = L.getBBox();
                    if (bb.x - 7 < l) {
                        L.remove();
                    } else {
                        this.labels.push(L);
                        l = bb.x + bb.width;
                    }
                }
            }
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        covers2.hide();
        covers.show();
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.hoverColumn = function (fin, fout) {
        covers.hide();
        covers2.show();
        fout = fout || function () {};
        covers2.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.click = function (f) {
        covers2.hide();
        covers.show();
        covers.click(f);
        return this;
    };
    chart.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    chart.eachColumn = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers2.length; i--;) {
            f.call(covers2[i]);
        }
        return this;
    };
    chart.clickColumn = function (f) {
        covers.hide();
        covers2.show();
        covers2.click(f);
        return this;
    };
    chart.push(bars, covers, covers2);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
};
Raphael.fn.g.hbarchart = function (x, y, width, height, values, opts) {
    opts = opts || {};
    var type = {round: "round", sharp: "sharp", soft: "soft"}[opts.type] || "square",
        gutter = parseFloat(opts.gutter || "20%"),
        chart = this.set(),
        bars = this.set(),
        covers = this.set(),
        covers2 = this.set(),
        total = Math.max.apply(Math, values),
        stacktotal = [],
        paper = this,
        multi = 0,
        colors = opts.colors || this.g.colors,
        len = values.length;
    if (this.raphael.is(values[0], "array")) {
        total = [];
        multi = len;
        len = 0;
        for (var i = values.length; i--;) {
            bars.push(this.set());
            total.push(Math.max.apply(Math, values[i]));
            len = Math.max(len, values[i].length);
        }
        if (opts.stacked) {
            for (var i = len; i--;) {
                var tot = 0;
                for (var j = values.length; j--;) {
                    tot +=+ values[j][i] || 0;
                }
                stacktotal.push(tot);
            }
        }
        for (var i = values.length; i--;) {
            if (values[i].length < len) {
                for (var j = len; j--;) {
                    values[i].push(0);
                }
            }
        }
        total = Math.max.apply(Math, opts.stacked ? stacktotal : total);
    }
    
    total = (opts.to) || total;
    var barheight = Math.floor(height / (len * (100 + gutter) + gutter) * 100),
        bargutter = Math.floor(barheight * gutter / 100),
        stack = [],
        Y = y + bargutter,
        X = (width - 1) / total;
    !opts.stacked && (barheight /= multi || 1);
    for (var i = 0; i < len; i++) {
        stack = [];
        for (var j = 0; j < (multi || 1); j++) {
            var val = multi ? values[j][i] : values[i],
                bar = this.g.finger(x, Y + barheight / 2, Math.round(val * X), barheight - 1, false, type).attr({stroke: colors[multi ? j : i], fill: colors[multi ? j : i]});
            if (multi) {
                bars[j].push(bar);
            } else {
                bars.push(bar);
            }
            bar.x = x + Math.round(val * X);
            bar.y = Y + barheight / 2;
            bar.w = Math.round(val * X);
            bar.h = barheight;
            bar.value = +val;
            if (!opts.stacked) {
                Y += barheight;
            } else {
                stack.push(bar);
            }
        }
        if (opts.stacked) {
            var cvr = this.rect(x, stack[0].y - stack[0].h / 2, width, barheight).attr(this.g.shim);
            covers2.push(cvr);
            cvr.bars = this.set();
            var size = 0;
            for (var s = stack.length; s--;) {
                stack[s].toFront();
            }
            for (var s = 0, ss = stack.length; s < ss; s++) {
                var bar = stack[s],
                    cover,
                    val = Math.round((size + bar.value) * X),
                    path = this.g.finger(x, bar.y, val, barheight - 1, false, type, 1);
                cvr.bars.push(bar);
                size && bar.attr({path: path});
                bar.w = val;
                bar.x = x + val;
                covers.push(cover = this.rect(x + size * X, bar.y - bar.h / 2, bar.value * X, barheight).attr(this.g.shim));
                cover.bar = bar;
                size += bar.value;
            }
            Y += barheight;
        }
        Y += bargutter;
    }
    covers2.toFront();
    Y = y + bargutter;
    if (!opts.stacked) {
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < multi; j++) {
                var cover = this.rect(x, Y, width, barheight).attr(this.g.shim);
                covers.push(cover);
                cover.bar = bars[j][i];
                Y += barheight;
            }
            Y += bargutter;
        }
    }
    chart.label = function (labels, isRight) {
        labels = labels || [];
        this.labels = paper.set();
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < multi; j++) {
                var  label = paper.g.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], total);
                var X = isRight ? bars[i * (multi || 1) + j].x - barheight / 2 + 3 : x + 5,
                    A = isRight ? "end" : "start",
                    L;
                this.labels.push(L = paper.g.text(X, bars[i * (multi || 1) + j].y, label).attr({"text-anchor": A}).insertBefore(covers[0]));
                if (L.getBBox().x < x + 5) {
                    L.attr({x: x + 5, "text-anchor": "start"});
                } else {
                    bars[i * (multi || 1) + j].label = L;
                }
            }
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        covers2.hide();
        covers.show();
        fout = fout || function () {};
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.hoverColumn = function (fin, fout) {
        covers.hide();
        covers2.show();
        fout = fout || function () {};
        covers2.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    chart.eachColumn = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers2.length; i--;) {
            f.call(covers2[i]);
        }
        return this;
    };
    chart.click = function (f) {
        covers2.hide();
        covers.show();
        covers.click(f);
        return this;
    };
    chart.clickColumn = function (f) {
        covers.hide();
        covers2.show();
        covers2.click(f);
        return this;
    };
    chart.push(bars, covers, covers2);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
};

}


/**************** content/js/ext/g.dot.js *****************/
function init_graphael_dot() {

/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.dotchart = function (x, y, width, height, valuesx, valuesy, size, opts) {
    function drawAxis(ax) {
        +ax[0] && (ax[0] = paper.g.axis(x + gutter, y + gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 2, opts.axisxlabels || null, opts.axisxtype || "t"));
        +ax[1] && (ax[1] = paper.g.axis(x + width - gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 3, opts.axisylabels || null, opts.axisytype || "t"));
        +ax[2] && (ax[2] = paper.g.axis(x + gutter, y + height - gutter + maxR, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 0, opts.axisxlabels || null, opts.axisxtype || "t"));
        +ax[3] && (ax[3] = paper.g.axis(x + gutter - maxR, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 1, opts.axisylabels || null, opts.axisytype || "t"));
    }
    opts = opts || {};
    var xdim = this.g.snapEnds(Math.min.apply(Math, valuesx), Math.max.apply(Math, valuesx), valuesx.length - 1),
        minx = xdim.from,
        maxx = xdim.to,
        gutter = opts.gutter || 10,
        ydim = this.g.snapEnds(Math.min.apply(Math, valuesy), Math.max.apply(Math, valuesy), valuesy.length - 1),
        miny = ydim.from,
        maxy = ydim.to,
        len = Math.max(valuesx.length, valuesy.length, size.length),
        symbol = this.g.markers[opts.symbol] || "disc",
        res = this.set(),
        series = this.set(),
        max = opts.max || 100,
        top = Math.max.apply(Math, size),
        R = [],
        paper = this,
        k = Math.sqrt(top / Math.PI) * 2 / max;

    for (var i = 0; i < len; i++) {
        R[i] = Math.min(Math.sqrt(size[i] / Math.PI) * 2 / k, max);
    }
    gutter = Math.max.apply(Math, R.concat(gutter));
    var axis = this.set(),
        maxR = Math.max.apply(Math, R);
    if (opts.axis) {
        var ax = (opts.axis + "").split(/[,\s]+/);
        drawAxis(ax);
        var g = [], b = [];
        for (var i = 0, ii = ax.length; i < ii; i++) {
            var bb = ax[i].all ? ax[i].all.getBBox()[["height", "width"][i % 2]] : 0;
            g[i] = bb + gutter;
            b[i] = bb;
        }
        gutter = Math.max.apply(Math, g.concat(gutter));
        for (var i = 0, ii = ax.length; i < ii; i++) if (ax[i].all) {
            ax[i].remove();
            ax[i] = 1;
        }
        drawAxis(ax);
        for (var i = 0, ii = ax.length; i < ii; i++) if (ax[i].all) {
            axis.push(ax[i].all);
        }
        res.axis = axis;
    }
    var kx = (width - gutter * 2) / ((maxx - minx) || 1),
        ky = (height - gutter * 2) / ((maxy - miny) || 1);
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        var sym = this.raphael.is(symbol, "array") ? symbol[i] : symbol,
            X = x + gutter + (valuesx[i] - minx) * kx,
            Y = y + height - gutter - (valuesy[i] - miny) * ky;
        sym && R[i] && series.push(this.g[sym](X, Y, R[i]).attr({fill: opts.heat ? this.g.colorValue(R[i], maxR) : Raphael.fn.g.colors[0], "fill-opacity": opts.opacity ? R[i] / max : 1, stroke: "none"}));
    }
    var covers = this.set();
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        var X = x + gutter + (valuesx[i] - minx) * kx,
            Y = y + height - gutter - (valuesy[i] - miny) * ky;
        covers.push(this.circle(X, Y, maxR).attr(this.g.shim));
        opts.href && opts.href[i] && covers[i].attr({href: opts.href[i]});
        covers[i].r = +R[i].toFixed(3);
        covers[i].x = +X.toFixed(3);
        covers[i].y = +Y.toFixed(3);
        covers[i].X = valuesx[i];
        covers[i].Y = valuesy[i];
        covers[i].value = size[i] || 0;
        covers[i].dot = series[i];
    }
    res.covers = covers;
    res.series = series;
    res.push(series, axis, covers);
    res.hover = function (fin, fout) {
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    res.click = function (f) {
        covers.click(f);
        return this;
    };
    res.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    res.href = function (map) {
        var cover;
        for (var i = covers.length; i--;) {
            cover = covers[i];
            if (cover.X == map.x && cover.Y == map.y && cover.value == map.value) {
                cover.attr({href: map.href});
            }
        }
    };
    return res;
};

}


/**************** content/js/ext/g.line.js *****************/
function init_graphael_line() {

/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.linechart = function (x, y, width, height, valuesx, valuesy, opts) {
    function shrink(values, dim) {
        var k = values.length / dim,
            j = 0,
            l = k,
            sum = 0,
            res = [];
        while (j < values.length) {
            l--;
            if (l < 0) {
                sum += values[j] * (1 + l);
                res.push(sum / k);
                sum = values[j++] * -l;
                l += k;
            } else {
                sum += values[j++];
            }
        }
        return res;
    }
    opts = opts || {};
    if (!this.raphael.is(valuesx[0], "array")) {
        valuesx = [valuesx];
    }
    if (!this.raphael.is(valuesy[0], "array")) {
        valuesy = [valuesy];
    }
    var allx = Array.prototype.concat.apply([], valuesx),
        ally = Array.prototype.concat.apply([], valuesy),
        xdim = this.g.snapEnds(Math.min.apply(Math, allx), Math.max.apply(Math, allx), valuesx[0].length - 1),
        minx = xdim.from,
        maxx = xdim.to,
        gutter = opts.gutter || 10,
        kx = (width - gutter * 2) / (maxx - minx),
        ydim = this.g.snapEnds(Math.min.apply(Math, ally), Math.max.apply(Math, ally), valuesy[0].length - 1),
        miny = ydim.from,
        maxy = ydim.to,
        ky = (height - gutter * 2) / (maxy - miny),
        len = Math.max(valuesx[0].length, valuesy[0].length),
        symbol = opts.symbol || "",
        colors = opts.colors || Raphael.fn.g.colors,
        that = this,
        columns = null,
        dots = null,
        chart = this.set(),
        path = [];

    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        len = Math.max(len, valuesy[i].length);
    }
    var shades = this.set();
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        if (opts.shade) {
            shades.push(this.path().attr({stroke: "none", fill: colors[i], opacity: opts.nostroke ? 1 : .3}));
        }
        if (valuesy[i].length > width - 2 * gutter) {
            valuesy[i] = shrink(valuesy[i], width - 2 * gutter);
            len = width - 2 * gutter;
        }
        if (valuesx[i] && valuesx[i].length > width - 2 * gutter) {
            valuesx[i] = shrink(valuesx[i], width - 2 * gutter);
        }
    }
    var axis = this.set();
    if (opts.axis) {
        var ax = (opts.axis + "").split(/[,\s]+/);
        +ax[0] && axis.push(this.g.axis(x + gutter, y + gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 2));
        +ax[1] && axis.push(this.g.axis(x + width - gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 3));
        +ax[2] && axis.push(this.g.axis(x + gutter, y + height - gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 0));
        +ax[3] && axis.push(this.g.axis(x + gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 1));
    }
    var lines = this.set(),
        symbols = this.set(),
        line;
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        if (!opts.nostroke) {
            lines.push(line = this.path().attr({
                stroke: colors[i],
                "stroke-width": opts.width || 2,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": opts.dash || ""
            }));
        }
        var sym = this.raphael.is(symbol, "array") ? symbol[i] : symbol,
            symset = this.set();
        path = [];
        for (var j = 0, jj = valuesy[i].length; j < jj; j++) {
            var X = x + gutter + ((valuesx[i] || valuesx[0])[j] - minx) * kx;
            var Y = y + height - gutter - (valuesy[i][j] - miny) * ky;
            (Raphael.is(sym, "array") ? sym[j] : sym) && symset.push(this.g[Raphael.fn.g.markers[this.raphael.is(sym, "array") ? sym[j] : sym]](X, Y, (opts.width || 2) * 3).attr({fill: colors[i], stroke: "none"}));
            path = path.concat([j ? "L" : "M", X, Y]);
        }
        symbols.push(symset);
        if (opts.shade) {
            shades[i].attr({path: path.concat(["L", X, y + height - gutter, "L",  x + gutter + ((valuesx[i] || valuesx[0])[0] - minx) * kx, y + height - gutter, "z"]).join(",")});
        }
        !opts.nostroke && line.attr({path: path.join(",")});
    }
    function createColumns(f) {
        // unite Xs together
        var Xs = [];
        for (var i = 0, ii = valuesx.length; i < ii; i++) {
            Xs = Xs.concat(valuesx[i]);
        }
        Xs.sort();
        // remove duplicates
        var Xs2 = [],
            xs = [];
        for (var i = 0, ii = Xs.length; i < ii; i++) {
            Xs[i] != Xs[i - 1] && Xs2.push(Xs[i]) && xs.push(x + gutter + (Xs[i] - minx) * kx);
        }
        Xs = Xs2;
        ii = Xs.length;
        var cvrs = f || that.set();
        for (var i = 0; i < ii; i++) {
            var X = xs[i] - (xs[i] - (xs[i - 1] || x)) / 2,
                w = ((xs[i + 1] || x + width) - xs[i]) / 2 + (xs[i] - (xs[i - 1] || x)) / 2,
                C;
            f ? (C = {}) : cvrs.push(C = that.rect(X - 1, y, Math.max(w + 1, 1), height).attr({stroke: "none", fill: "#000", opacity: 0}));
            C.values = [];
            C.symbols = that.set();
            C.y = [];
            C.x = xs[i];
            C.axis = Xs[i];
            for (var j = 0, jj = valuesy.length; j < jj; j++) {
                Xs2 = valuesx[j] || valuesx[0];
                for (var k = 0, kk = Xs2.length; k < kk; k++) {
                    if (Xs2[k] == Xs[i]) {
                        C.values.push(valuesy[j][k]);
                        C.y.push(y + height - gutter - (valuesy[j][k] - miny) * ky);
                        C.symbols.push(chart.symbols[j][k]);
                    }
                }
            }
            f && f.call(C);
        }
        !f && (columns = cvrs);
    }
    function createDots(f) {
        var cvrs = f || that.set(),
            C;
        for (var i = 0, ii = valuesy.length; i < ii; i++) {
            for (var j = 0, jj = valuesy[i].length; j < jj; j++) {
                var X = x + gutter + ((valuesx[i] || valuesx[0])[j] - minx) * kx,
                    nearX = x + gutter + ((valuesx[i] || valuesx[0])[j ? j - 1 : 1] - minx) * kx,
                    Y = y + height - gutter - (valuesy[i][j] - miny) * ky;
                f ? (C = {}) : cvrs.push(C = that.circle(X, Y, Math.abs(nearX - X) / 2).attr({stroke: "none", fill: "#000", opacity: 0}));
                C.x = X;
                C.y = Y;
                C.value = valuesy[i][j];
                C.line = chart.lines[i];
                C.shade = chart.shades[i];
                C.symbol = chart.symbols[i][j];
                C.symbols = chart.symbols[i];
                C.axis = (valuesx[i] || valuesx[0])[j];
                f && f.call(C);
            }
        }
        !f && (dots = cvrs);
    }
    chart.push(lines, shades, symbols, axis, columns, dots);
    chart.lines = lines;
    chart.shades = shades;
    chart.symbols = symbols;
    chart.axis = axis;
    chart.hoverColumn = function (fin, fout) {
        !columns && createColumns();
        columns.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.clickColumn = function (f) {
        !columns && createColumns();
        columns.click(f);
        return this;
    };
    chart.hrefColumn = function (cols) {
        var hrefs = that.raphael.is(arguments[0], "array") ? arguments[0] : arguments;
        if (!(arguments.length - 1) && typeof cols == "object") {
            for (var x in cols) {
                for (var i = 0, ii = columns.length; i < ii; i++) if (columns[i].axis == x) {
                    columns[i].attr("href", cols[x]);
                }
            }
        }
        !columns && createColumns();
        for (var i = 0, ii = hrefs.length; i < ii; i++) {
            columns[i] && columns[i].attr("href", hrefs[i]);
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        !dots && createDots();
        dots.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.click = function (f) {
        !dots && createDots();
        dots.click(f);
        return this;
    };
    chart.each = function (f) {
        createDots(f);
        return this;
    };
    chart.eachColumn = function (f) {
        createColumns(f);
        return this;
    };
    return chart;
};

}


/**************** content/js/ext/g.pie.js *****************/
function init_graphael_pie() {

/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.piechart = function (cx, cy, r, values, opts) {
    opts = opts || {};
    var paper = this,
        sectors = [],
        covers = this.set(),
        chart = this.set(),
        series = this.set(),
        order = [],
        len = values.length,
        angle = 0,
        total = 0,
        others = 0,
        cut = 9,
        defcut = true;
    chart.covers = covers;
    if (len == 1) {
        series.push(this.circle(cx, cy, r).attr({fill: this.g.colors[0], stroke: opts.stroke || "#fff", "stroke-width": opts.strokewidth == null ? 1 : opts.strokewidth}));
        covers.push(this.circle(cx, cy, r).attr(this.g.shim));
        total = values[0];
        values[0] = {value: values[0], order: 0, valueOf: function () { return this.value; }};
        series[0].middle = {x: cx, y: cy};
        series[0].mangle = 180;
    } else {
        function sector(cx, cy, r, startAngle, endAngle, fill) {
            var rad = Math.PI / 180,
                x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                xm = cx + r / 2 * Math.cos(-(startAngle + (endAngle - startAngle) / 2) * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad),
                ym = cy + r / 2 * Math.sin(-(startAngle + (endAngle - startAngle) / 2) * rad),
                res = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(Math.abs(endAngle - startAngle) > 180), 1, x2, y2, "z"];
            res.middle = {x: xm, y: ym};
            return res;
        }
        for (var i = 0; i < len; i++) {
            total += values[i];
            values[i] = {value: values[i], order: i, valueOf: function () { return this.value; }};
        }
        values.sort(function (a, b) {
            return b.value - a.value;
        });
        for (var i = 0; i < len; i++) {
            if (defcut && values[i] * 360 / total <= 1.5) {
                cut = i;
                defcut = false;
            }
            if (i > cut) {
                defcut = false;
                values[cut].value += values[i];
                values[cut].others = true;
                others = values[cut].value;
            }
        }
        len = Math.min(cut + 1, values.length);
        others && values.splice(len) && (values[cut].others = true);
        for (var i = 0; i < len; i++) {
            var mangle = angle - 360 * values[i] / total / 2;
            if (!i) {
                angle = 90 - mangle;
                mangle = angle - 360 * values[i] / total / 2;
            }
            if (opts.init) {
                var ipath = sector(cx, cy, 1, angle, angle - 360 * values[i] / total).join(",");
            }
            var path = sector(cx, cy, r, angle, angle -= 360 * values[i] / total);
            var p = this.path(opts.init ? ipath : path).attr({fill: opts.colors && opts.colors[i] || this.g.colors[i] || "#666", stroke: opts.stroke || "#fff", "stroke-width": (opts.strokewidth == null ? 1 : opts.strokewidth), "stroke-linejoin": "round"});
            p.value = values[i];
            p.middle = path.middle;
            p.mangle = mangle;
            sectors.push(p);
            series.push(p);
            opts.init && p.animate({path: path.join(",")}, (+opts.init - 1) || 1000, ">");
        }
        for (var i = 0; i < len; i++) {
            var p = paper.path(sectors[i].attr("path")).attr(this.g.shim);
            opts.href && opts.href[i] && p.attr({href: opts.href[i]});
            p.attr = function () {};
            covers.push(p);
            series.push(p);
        }
    }

    chart.hover = function (fin, fout) {
        fout = fout || function () {};
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    mx: sector.middle.x,
                    my: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                cover.mouseover(function () {
                    fin.call(o);
                }).mouseout(function () {
                    fout.call(o);
                });
            })(series[i], covers[i], i);
        }
        return this;
    };
    // x: where label could be put
    // y: where label could be put
    // value: value to show
    // total: total number to count %
    chart.each = function (f) {
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    x: sector.middle.x,
                    y: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                f.call(o);
            })(series[i], covers[i], i);
        }
        return this;
    };
    chart.click = function (f) {
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    mx: sector.middle.x,
                    my: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                cover.click(function () { f.call(o); });
            })(series[i], covers[i], i);
        }
        return this;
    };
    chart.inject = function (element) {
        element.insertBefore(covers[0]);
    };
    var legend = function (labels, otherslabel, mark, dir) {
        var x = cx + r + r / 5,
            y = cy,
            h = y + 10;
        labels = labels || [];
        dir = (dir && dir.toLowerCase && dir.toLowerCase()) || "east";
        mark = paper.g.markers[mark && mark.toLowerCase()] || "disc";
        chart.labels = paper.set();
        for (var i = 0; i < len; i++) {
            var clr = series[i].attr("fill"),
                j = values[i].order,
                txt;
            values[i].others && (labels[j] = otherslabel || "Others");
            labels[j] = paper.g.labelise(labels[j], values[i], total);
            chart.labels.push(paper.set());
            chart.labels[i].push(paper.g[mark](x + 5, h, 5).attr({fill: clr, stroke: "none"}));
            chart.labels[i].push(txt = paper.text(x + 20, h, labels[j] || values[j]).attr(paper.g.txtattr).attr({fill: opts.legendcolor || "#000", "text-anchor": "start"}));
            covers[i].label = chart.labels[i];
            h += txt.getBBox().height * 1.2;
        }
        var bb = chart.labels.getBBox(),
            tr = {
                east: [0, -bb.height / 2],
                west: [-bb.width - 2 * r - 20, -bb.height / 2],
                north: [-r - bb.width / 2, -r - bb.height - 10],
                south: [-r - bb.width / 2, r + 10]
            }[dir];
        chart.labels.translate.apply(chart.labels, tr);
        chart.push(chart.labels);
    };
    if (opts.legend) {
        legend(opts.legend, opts.legendothers, opts.legendmark, opts.legendpos);
    }
    chart.push(series, covers);
    chart.series = series;
    chart.covers = covers;
    return chart;
};

}


/**************** content/js/ext/strftime.js *****************/
/*
 strftime for Javascript
 Copyright (c) 2008, Philip S Tellis <philip@bluesmoon.info>
 All rights reserved.
 
 This code is distributed under the terms of the BSD licence
 
 Redistribution and use of this software in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

   * Redistributions of source code must retain the above copyright notice, this list of conditions
     and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other materials provided
     with the distribution.
   * The names of the contributors to this file may not be used to endorse or promote products
     derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * \file strftime.js
 * \author Philip S Tellis \<philip@bluesmoon.info\>
 * \version 1.3
 * \date 2008/06
 * \brief Javascript implementation of strftime
 * 
 * Implements strftime for the Date object in javascript based on the PHP implementation described at
 * http://www.php.net/strftime  This is in turn based on the Open Group specification defined
 * at http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html This implementation does not
 * include modified conversion specifiers (i.e., Ex and Ox)
 *
 * The following format specifiers are supported:
 *
 * \copydoc formats
 *
 * \%a, \%A, \%b and \%B should be localised for non-English locales.
 *
 * \par Usage:
 * This library may be used as follows:
 * \code
 *     var d = new Date();
 *
 *     var ymd = d.strftime('%Y/%m/%d');
 *     var iso = d.strftime('%Y-%m-%dT%H:%M:%S%z');
 *
 * \endcode
 *
 * \sa \link Date.prototype.strftime Date.strftime \endlink for a description of each of the supported format specifiers
 * \sa Date.ext.locales for localisation information
 * \sa http://www.php.net/strftime for the PHP implementation which is the basis for this
 * \sa http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html for feedback
 */

//! Date extension object - all supporting objects go in here.
Date.ext = {};

//! Utility methods
Date.ext.util = {};

/**
\brief Left pad a number with something
\details Takes a number and pads it to the left with the passed in pad character
\param x	The number to pad
\param pad	The string to pad with
\param r	[optional] Upper limit for pad.  A value of 10 pads to 2 digits, a value of 100 pads to 3 digits.
		Default is 10.

\return The number left padded with the pad character.  This function returns a string and not a number.
*/
Date.ext.util.xPad=function(x, pad, r)
{
	if(typeof(r) == 'undefined')
	{
		r=10;
	}
	for( ; parseInt(x, 10)<r && r>1; r/=10)
		x = pad.toString() + x;
	return x.toString();
};

/**
\brief Currently selected locale.
\details
The locale for a specific date object may be changed using \code Date.locale = "new-locale"; \endcode
The default will be based on the lang attribute of the HTML tag of your document
*/
Date.prototype.locale = 'en-GB';
/*
 * COMMENTED IT OUR FOR NOW
 *
//! \cond FALSE
if(document.getElementsByTagName('html') && document.getElementsByTagName('html')[0].lang)
{
	Date.prototype.locale = document.getElementsByTagName('html')[0].lang;
}
//! \endcond
 */

/**
\brief Localised strings for days of the week and months of the year.
\details
To create your own local strings, add a locale object to the locales object.
The key of your object should be the same as your locale name.  For example:
   en-US,
   fr,
   fr-CH,
   de-DE
Names are case sensitive and are described at http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
Your locale object must contain the following keys:
\param a	Short names of days of week starting with Sunday
\param A	Long names days of week starting with Sunday
\param b	Short names of months of the year starting with January
\param B	Long names of months of the year starting with February
\param c	The preferred date and time representation in your locale
\param p	AM or PM in your locale
\param P	am or pm in your locale
\param x	The  preferred date representation for the current locale without the time.
\param X	The preferred time representation for the current locale without the date.

\sa Date.ext.locales.en for a sample implementation
\sa \ref localisation for detailed documentation on localising strftime for your own locale
*/
Date.ext.locales = { };

/**
 * \brief Localised strings for English (British).
 * \details
 * This will be used for any of the English dialects unless overridden by a country specific one.
 * This is the default locale if none specified
 */
Date.ext.locales.en = {
	a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	c: '%a %d %b %Y %T %Z',
	p: ['AM', 'PM'],
	P: ['am', 'pm'],
	x: '%d/%m/%y',
	X: '%T'
};

//! \cond FALSE
// Localised strings for US English
Date.ext.locales['en-US'] = Date.ext.locales.en;
Date.ext.locales['en-US'].c = '%a %d %b %Y %r %Z';
Date.ext.locales['en-US'].x = '%D';
Date.ext.locales['en-US'].X = '%r';

// Localised strings for British English
Date.ext.locales['en-GB'] = Date.ext.locales.en;

// Localised strings for Australian English
Date.ext.locales['en-AU'] = Date.ext.locales['en-GB'];
//! \endcond

//! \brief List of supported format specifiers.
/**
 * \details
 * \arg \%a - abbreviated weekday name according to the current locale
 * \arg \%A - full weekday name according to the current locale
 * \arg \%b - abbreviated month name according to the current locale
 * \arg \%B - full month name according to the current locale
 * \arg \%c - preferred date and time representation for the current locale
 * \arg \%C - century number (the year divided by 100 and truncated to an integer, range 00 to 99)
 * \arg \%d - day of the month as a decimal number (range 01 to 31)
 * \arg \%D - same as %m/%d/%y
 * \arg \%e - day of the month as a decimal number, a single digit is preceded by a space (range ' 1' to '31')
 * \arg \%g - like %G, but without the century
 * \arg \%G - The 4-digit year corresponding to the ISO week number
 * \arg \%h - same as %b
 * \arg \%H - hour as a decimal number using a 24-hour clock (range 00 to 23)
 * \arg \%I - hour as a decimal number using a 12-hour clock (range 01 to 12)
 * \arg \%j - day of the year as a decimal number (range 001 to 366)
 * \arg \%m - month as a decimal number (range 01 to 12)
 * \arg \%M - minute as a decimal number
 * \arg \%n - newline character
 * \arg \%p - either `AM' or `PM' according to the given time value, or the corresponding strings for the current locale
 * \arg \%P - like %p, but lower case
 * \arg \%r - time in a.m. and p.m. notation equal to %I:%M:%S %p
 * \arg \%R - time in 24 hour notation equal to %H:%M
 * \arg \%S - second as a decimal number
 * \arg \%t - tab character
 * \arg \%T - current time, equal to %H:%M:%S
 * \arg \%u - weekday as a decimal number [1,7], with 1 representing Monday
 * \arg \%U - week number of the current year as a decimal number, starting with
 *            the first Sunday as the first day of the first week
 * \arg \%V - The ISO 8601:1988 week number of the current year as a decimal number,
 *            range 01 to 53, where week 1 is the first week that has at least 4 days
 *            in the current year, and with Monday as the first day of the week.
 * \arg \%w - day of the week as a decimal, Sunday being 0
 * \arg \%W - week number of the current year as a decimal number, starting with the
 *            first Monday as the first day of the first week
 * \arg \%x - preferred date representation for the current locale without the time
 * \arg \%X - preferred time representation for the current locale without the date
 * \arg \%y - year as a decimal number without a century (range 00 to 99)
 * \arg \%Y - year as a decimal number including the century
 * \arg \%z - numerical time zone representation
 * \arg \%Z - time zone name or abbreviation
 * \arg \%% - a literal `\%' character
 */
Date.ext.formats = {
	a: function(d) { return Date.ext.locales[d.locale].a[d.getDay()]; },
	A: function(d) { return Date.ext.locales[d.locale].A[d.getDay()]; },
	b: function(d) { return Date.ext.locales[d.locale].b[d.getMonth()]; },
	B: function(d) { return Date.ext.locales[d.locale].B[d.getMonth()]; },
	c: 'toLocaleString',
	C: function(d) { return Date.ext.util.xPad(parseInt(d.getFullYear()/100, 10), 0); },
	d: ['getDate', '0'],
	e: ['getDate', ' '],
	g: function(d) { return Date.ext.util.xPad(parseInt(Date.ext.util.G(d)/100, 10), 0); },
	G: function(d) {
			var y = d.getFullYear();
			var V = parseInt(Date.ext.formats.V(d), 10);
			var W = parseInt(Date.ext.formats.W(d), 10);

			if(W > V) {
				y++;
			} else if(W===0 && V>=52) {
				y--;
			}

			return y;
		},
	H: ['getHours', '0'],
	I: function(d) { var I=d.getHours()%12; return Date.ext.util.xPad(I===0?12:I, 0); },
	j: function(d) {
			var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
			ms += d.getTimezoneOffset()*60000;
			var doy = parseInt(ms/60000/60/24, 10)+1;
			return Date.ext.util.xPad(doy, 0, 100);
		},
	m: function(d) { return Date.ext.util.xPad(d.getMonth()+1, 0); },
	M: ['getMinutes', '0'],
	p: function(d) { return Date.ext.locales[d.locale].p[d.getHours() >= 12 ? 1 : 0 ]; },
	P: function(d) { return Date.ext.locales[d.locale].P[d.getHours() >= 12 ? 1 : 0 ]; },
	S: ['getSeconds', '0'],
	u: function(d) { var dow = d.getDay(); return dow===0?7:dow; },
	U: function(d) {
			var doy = parseInt(Date.ext.formats.j(d), 10);
			var rdow = 6-d.getDay();
			var woy = parseInt((doy+rdow)/7, 10);
			return Date.ext.util.xPad(woy, 0);
		},
	V: function(d) {
			var woy = parseInt(Date.ext.formats.W(d), 10);
			var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
			// First week is 01 and not 00 as in the case of %U and %W,
			// so we add 1 to the final result except if day 1 of the year
			// is a Monday (then %W returns 01).
			// We also need to subtract 1 if the day 1 of the year is 
			// Friday-Sunday, so the resulting equation becomes:
			var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
			if(idow == 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4)
			{
				idow = 1;
			}
			else if(idow === 0)
			{
				idow = Date.ext.formats.V(new Date('' + (d.getFullYear()-1) + '/12/31'));
			}

			return Date.ext.util.xPad(idow, 0);
		},
	w: 'getDay',
	W: function(d) {
			var doy = parseInt(Date.ext.formats.j(d), 10);
			var rdow = 7-Date.ext.formats.u(d);
			var woy = parseInt((doy+rdow)/7, 10);
			return Date.ext.util.xPad(woy, 0, 10);
		},
	y: function(d) { return Date.ext.util.xPad(d.getFullYear()%100, 0); },
	Y: 'getFullYear',
	z: function(d) {
			var o = d.getTimezoneOffset();
			var H = Date.ext.util.xPad(parseInt(Math.abs(o/60), 10), 0);
			var M = Date.ext.util.xPad(o%60, 0);
			return (o>0?'-':'+') + H + M;
		},
	Z: function(d) { return d.toString().replace(/^.*\(([^)]+)\)$/, '$1'); },
	'%': function(d) { return '%'; }
};

/**
\brief List of aggregate format specifiers.
\details
Aggregate format specifiers map to a combination of basic format specifiers.
These are implemented in terms of Date.ext.formats.

A format specifier that maps to 'locale' is read from Date.ext.locales[current-locale].

\sa Date.ext.formats
*/
Date.ext.aggregates = {
	c: 'locale',
	D: '%m/%d/%y',
	h: '%b',
	n: '\n',
	r: '%I:%M:%S %p',
	R: '%H:%M',
	t: '\t',
	T: '%H:%M:%S',
	x: 'locale',
	X: 'locale'
};

//! \cond FALSE
// Cache timezone values because they will never change for a given JS instance
Date.ext.aggregates.z = Date.ext.formats.z(new Date());
Date.ext.aggregates.Z = Date.ext.formats.Z(new Date());
//! \endcond

//! List of unsupported format specifiers.
/**
 * \details
 * All format specifiers supported by the PHP implementation are supported by
 * this javascript implementation.
 */
Date.ext.unsupported = { };


/**
 * \brief Formats the date according to the specified format.
 * \param fmt	The format to format the date in.  This may be a combination of the following:
 * \copydoc formats
 *
 * \return	A string representation of the date formatted based on the passed in parameter
 * \sa http://www.php.net/strftime for documentation on format specifiers
*/
Date.prototype.strftime=function(fmt)
{
	// Fix locale if declared locale hasn't been defined
	// After the first call this condition should never be entered unless someone changes the locale
	if(!(this.locale in Date.ext.locales))
	{
		if(this.locale.replace(/-[a-zA-Z]+$/, '') in Date.ext.locales)
		{
			this.locale = this.locale.replace(/-[a-zA-Z]+$/, '');
		}
		else
		{
			this.locale = 'en-GB';
		}
	}

	var d = this;
	// First replace aggregates
	while(fmt.match(/%[cDhnrRtTxXzZ]/))
	{
		fmt = fmt.replace(/%([cDhnrRtTxXzZ])/g, function(m0, m1)
				{
					var f = Date.ext.aggregates[m1];
					return (f == 'locale' ? Date.ext.locales[d.locale][m1] : f);
				});
	}


	// Now replace formats - we need a closure so that the date object gets passed through
	var str = fmt.replace(/%([aAbBCdegGHIjmMpPSuUVwWyY%])/g, function(m0, m1) 
			{
				var f = Date.ext.formats[m1];
				if(typeof(f) == 'string') {
					return d[f]();
				} else if(typeof(f) == 'function') {
					return f.call(d, d);
				} else if(typeof(f) == 'object' && typeof(f[0]) == 'string') {
					return Date.ext.util.xPad(d[f[0]](), f[1]);
				} else {
					return m1;
				}
			});
	d=null;
	return str;
};

/**
 * \mainpage strftime for Javascript
 *
 * \section toc Table of Contents
 * - \ref intro_sec
 * - <a class="el" href="strftime.js">Download full source</a> / <a class="el" href="strftime-min.js">minified</a>
 * - \subpage usage
 * - \subpage format_specifiers
 * - \subpage localisation
 * - \link strftime.js API Documentation \endlink
 * - \subpage demo
 * - \subpage changelog
 * - \subpage faq
 * - <a class="el" href="http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html">Feedback</a>
 * - \subpage copyright_licence
 *
 * \section intro_sec Introduction
 *
 * C and PHP developers have had access to a built in strftime function for a long time.
 * This function is an easy way to format dates and times for various display needs.
 *
 * This library brings the flexibility of strftime to the javascript Date object
 *
 * Use this library if you frequently need to format dates in javascript in a variety of ways.  For example,
 * if you have PHP code that writes out formatted dates, and want to mimic the functionality using
 * progressively enhanced javascript, then this library can do exactly what you want.
 *
 *
 *
 *
 * \page usage Example usage
 *
 * \section usage_sec Usage
 * This library may be used as follows:
 * \code
 *     var d = new Date();
 *
 *     var ymd = d.strftime('%Y/%m/%d');
 *     var iso = d.strftime('%Y-%m-%dT%H:%M:%S%z');
 *
 * \endcode
 *
 * \subsection examples Examples
 * 
 * To get the current time in hours and minutes:
 * \code
 * 	var d = new Date();
 * 	d.strftime("%H:%M");
 * \endcode
 *
 * To get the current time with seconds in AM/PM notation:
 * \code
 * 	var d = new Date();
 * 	d.strftime("%r");
 * \endcode
 *
 * To get the year and day of the year for August 23, 2009:
 * \code
 * 	var d = new Date('2009/8/23');
 * 	d.strftime("%Y-%j");
 * \endcode
 *
 * \section demo_sec Demo
 *
 * Try your own examples on the \subpage demo page.  You can use any of the supported
 * \subpage format_specifiers.
 *
 *
 *
 *
 * \page localisation Localisation
 * You can localise strftime by implementing the short and long forms for days of the
 * week and months of the year, and the localised aggregates for the preferred date
 * and time representation for your locale.  You need to add your locale to the
 * Date.ext.locales object.
 *
 * \section localising_fr Localising for french
 *
 * For example, this is how we'd add French language strings to the locales object:
 * \dontinclude index.html
 * \skip Generic french
 * \until };
 * The % format specifiers are all defined in \ref formats.  You can use any of those.
 *
 * This locale definition may be included in your own source file, or in the HTML file
 * including \c strftime.js, however it must be defined \em after including \c strftime.js
 *
 * The above definition includes generic french strings and formats that are used in France.
 * Other french speaking countries may have other representations for dates and times, so we
 * need to override this for them.  For example, Canadian french uses a Y-m-d date format,
 * while French french uses d.m.Y.  We fix this by defining Canadian french to be the same
 * as generic french, and then override the format specifiers for \c x for the \c fr-CA locale:
 * \until End french
 *
 * You can now use any of the French locales at any time by setting \link Date.prototype.locale Date.locale \endlink
 * to \c "fr", \c "fr-FR", \c "fr-CA", or any other french dialect:
 * \code
 *     var d = new Date("2008/04/22");
 *     d.locale = "fr";
 *
 *     d.strftime("%A, %d %B == %x");
 * \endcode
 * will return:
 * \code
 *     mardi, 22 avril == 22.04.2008
 * \endcode
 * While changing the locale to "fr-CA":
 * \code
 *     d.locale = "fr-CA";
 *
 *     d.strftime("%A, %d %B == %x");
 * \endcode
 * will return:
 * \code
 *     mardi, 22 avril == 2008-04-22
 * \endcode
 *
 * You can use any of the format specifiers defined at \ref formats
 *
 * The locale for all dates defaults to the value of the \c lang attribute of your HTML document if
 * it is set, or to \c "en" otherwise.
 * \note
 * Your locale definitions \b MUST be added to the locale object before calling
 * \link Date.prototype.strftime Date.strftime \endlink.
 *
 * \sa \ref formats for a list of format specifiers that can be used in your definitions
 * for c, x and X.
 *
 * \section locale_names Locale names
 *
 * Locale names are defined in RFC 1766. Typically, a locale would be a two letter ISO639
 * defined language code and an optional ISO3166 defined country code separated by a -
 * 
 * eg: fr-FR, de-DE, hi-IN
 *
 * \sa http://www.ietf.org/rfc/rfc1766.txt
 * \sa http://www.loc.gov/standards/iso639-2/php/code_list.php
 * \sa http://www.iso.org/iso/country_codes/iso_3166_code_lists/english_country_names_and_code_elements.htm
 * 
 * \section locale_fallback Locale fallbacks
 *
 * If a locale object corresponding to the fully specified locale isn't found, an attempt will be made
 * to fall back to the two letter language code.  If a locale object corresponding to that isn't found
 * either, then the locale will fall back to \c "en".  No warning will be issued.
 *
 * For example, if we define a locale for de:
 * \until };
 * Then set the locale to \c "de-DE":
 * \code
 *     d.locale = "de-DE";
 *
 *     d.strftime("%a, %d %b");
 * \endcode
 * In this case, the \c "de" locale will be used since \c "de-DE" has not been defined:
 * \code
 *     Di, 22 Apr
 * \endcode
 *
 * Swiss german will return the same since it will also fall back to \c "de":
 * \code
 *     d.locale = "de-CH";
 *
 *     d.strftime("%a, %d %b");
 * \endcode
 * \code
 *     Di, 22 Apr
 * \endcode
 *
 * We need to override the \c a specifier for Swiss german, since it's different from German german:
 * \until End german
 * We now get the correct results:
 * \code
 *     d.locale = "de-CH";
 *
 *     d.strftime("%a, %d %b");
 * \endcode
 * \code
 *     Die, 22 Apr
 * \endcode
 *
 * \section builtin_locales Built in locales
 *
 * This library comes with pre-defined locales for en, en-GB, en-US and en-AU.
 *
 * 
 *
 *
 * \page format_specifiers Format specifiers
 * 
 * \section specifiers Format specifiers
 * strftime has several format specifiers defined by the Open group at 
 * http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html
 *
 * PHP added a few of its own, defined at http://www.php.net/strftime
 *
 * This javascript implementation supports all the PHP specifiers
 *
 * \subsection supp Supported format specifiers:
 * \copydoc formats
 * 
 * \subsection unsupportedformats Unsupported format specifiers:
 * \copydoc unsupported
 *
 *
 *
 *
 * \page demo strftime demo
 * <div style="float:right;width:45%;">
 * \copydoc formats
 * </div>
 * \htmlinclude index.html
 *
 *
 *
 *
 * \page faq FAQ
 * 
 * \section how_tos Usage
 *
 * \subsection howtouse Is there a manual on how to use this library?
 *
 * Yes, see \ref usage
 *
 * \subsection wheretoget Where can I get a minified version of this library?
 *
 * The minified version is available <a href="strftime-min.js" title="Minified strftime.js">here</a>.
 *
 * \subsection which_specifiers Which format specifiers are supported?
 *
 * See \ref format_specifiers
 *
 * \section whys Why?
 *
 * \subsection why_lib Why this library?
 *
 * I've used the strftime function in C, PHP and the Unix shell, and found it very useful
 * to do date formatting.  When I needed to do date formatting in javascript, I decided
 * that it made the most sense to just reuse what I'm already familiar with.
 *
 * \subsection why_another Why another strftime implementation for Javascript?
 *
 * Yes, there are other strftime implementations for Javascript, but I saw problems with
 * all of them that meant I couldn't use them directly.  Some implementations had bad
 * designs.  For example, iterating through all possible specifiers and scanning the string
 * for them.  Others were tied to specific libraries like prototype.
 *
 * Trying to extend any of the existing implementations would have required only slightly
 * less effort than writing this from scratch.  In the end it took me just about 3 hours
 * to write the code and about 6 hours battling with doxygen to write these docs.
 *
 * I also had an idea of how I wanted to implement this, so decided to try it.
 *
 * \subsection why_extend_date Why extend the Date class rather than subclass it?
 *
 * I tried subclassing Date and failed.  I didn't want to waste time on figuring
 * out if there was a problem in my code or if it just wasn't possible.  Adding to the
 * Date.prototype worked well, so I stuck with it.
 *
 * I did have some worries because of the way for..in loops got messed up after json.js added
 * to the Object.prototype, but that isn't an issue here since {} is not a subclass of Date.
 *
 * My last doubt was about the Date.ext namespace that I created.  I still don't like this,
 * but I felt that \c ext at least makes clear that this is external or an extension.
 *
 * It's quite possible that some future version of javascript will add an \c ext or a \c locale
 * or a \c strftime property/method to the Date class, but this library should probably
 * check for capabilities before doing what it does.
 *
 * \section curiosity Curiosity
 *
 * \subsection how_big How big is the code?
 *
 * \arg 26K bytes with documentation
 * \arg 4242 bytes minified using <a href="http://developer.yahoo.com/yui/compressor/">YUI Compressor</a>
 * \arg 1477 bytes minified and gzipped
 *
 * \subsection how_long How long did it take to write this?
 *
 * 15 minutes for the idea while I was composing this blog post:
 * http://tech.bluesmoon.info/2008/04/javascript-date-functions.html
 *
 * 3 hours in one evening to write v1.0 of the code and 6 hours the same
 * night to write the docs and this manual.  As you can tell, I'm fairly
 * sleepy.
 *
 * Versions 1.1 and 1.2 were done in a couple of hours each, and version 1.3
 * in under one hour.
 *
 * \section contributing Contributing
 *
 * \subsection how_to_rfe How can I request features or make suggestions?
 *
 * You can leave a comment on my blog post about this library here:
 * http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html
 *
 * \subsection how_to_contribute Can I/How can I contribute code to this library?
 *
 * Yes, that would be very nice, thank you.  You can do various things.  You can make changes
 * to the library, and make a diff against the current file and mail me that diff at
 * philip@bluesmoon.info, or you could just host the new file on your own servers and add
 * your name to the copyright list at the top stating which parts you've added.
 *
 * If you do mail me a diff, let me know how you'd like to be listed in the copyright section.
 *
 * \subsection copyright_signover Who owns the copyright on contributed code?
 *
 * The contributor retains copyright on contributed code.
 *
 * In some cases I may use contributed code as a template and write the code myself.  In this
 * case I'll give the contributor credit for the idea, but will not add their name to the
 * copyright holders list.
 *
 *
 *
 *
 * \page copyright_licence Copyright & Licence
 *
 * \section copyright Copyright
 * \dontinclude strftime.js
 * \skip Copyright
 * \until rights
 *
 * \section licence Licence
 * \skip This code
 * \until SUCH DAMAGE.
 *
 *
 *
 * \page changelog ChangeLog
 *
 * \par 1.3 - 2008/06/17:
 * - Fixed padding issue with negative timezone offsets in %r
 *   reported and fixed by Mikko <mikko.heimola@iki.fi>
 * - Added support for %P
 * - Internationalised %r, %p and %P
 *
 * \par 1.2 - 2008/04/27:
 * - Fixed support for c (previously it just returned toLocaleString())
 * - Add support for c, x and X
 * - Add locales for en-GB, en-US and en-AU
 * - Make en-GB the default locale (previous was en)
 * - Added more localisation docs
 *
 * \par 1.1 - 2008/04/27:
 * - Fix bug in xPad which wasn't padding more than a single digit
 * - Fix bug in j which had an off by one error for days after March 10th because of daylight savings
 * - Add support for g, G, U, V and W
 *
 * \par 1.0 - 2008/04/22:
 * - Initial release with support for a, A, b, B, c, C, d, D, e, H, I, j, m, M, p, r, R, S, t, T, u, w, y, Y, z, Z, and %
 */


/**************** content/js/ext/dygraph-canvas.js *****************/
function init_dygraph_canvas(document) {


// Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
// All Rights Reserved.

/**
 * @fileoverview Based on PlotKit, but modified to meet the needs of dygraphs.
 * In particular, support for:
 * - grid overlays 
 * - error bars
 * - dygraphs attribute system
 */

/**
 * Creates a new DygraphLayout object.
 * @param {Object} options Options for PlotKit.Layout
 * @return {Object} The DygraphLayout object
 */
DygraphLayout = function(dygraph, options) {
  this.dygraph_ = dygraph;
  this.options = {};  // TODO(danvk): remove, use attr_ instead.
  Dygraph.update(this.options, options ? options : {});
  this.datasets = new Array();
};

DygraphLayout.prototype.attr_ = function(name) {
  return this.dygraph_.attr_(name);
};

DygraphLayout.prototype.addDataset = function(setname, set_xy) {
  this.datasets[setname] = set_xy;
};

DygraphLayout.prototype.evaluate = function() {
  this._evaluateLimits();
  this._evaluateLineCharts();
  this._evaluateLineTicks();
};

DygraphLayout.prototype._evaluateLimits = function() {
  this.minxval = this.maxxval = null;
  for (var name in this.datasets) {
    var series = this.datasets[name];
    var x1 = series[0][0];
    if (!this.minxval || x1 < this.minxval) this.minxval = x1;

    var x2 = series[series.length - 1][0];
    if (!this.maxxval || x2 > this.maxxval) this.maxxval = x2;
  }
  this.xrange = this.maxxval - this.minxval;
  this.xscale = (this.xrange != 0 ? 1/this.xrange : 1.0);

  this.minyval = this.options.yAxis[0];
  this.maxyval = this.options.yAxis[1];
  this.yrange = this.maxyval - this.minyval;
  this.yscale = (this.yrange != 0 ? 1/this.yrange : 1.0);
};

DygraphLayout.prototype._evaluateLineCharts = function() {
  // add all the rects
  this.points = new Array();
  for (var setName in this.datasets) {
    var dataset = this.datasets[setName];
    for (var j = 0; j < dataset.length; j++) {
      var item = dataset[j];
      var point = {
        x: ((parseFloat(item[0]) - this.minxval) * this.xscale),
        y: 1.0 - ((parseFloat(item[1]) - this.minyval) * this.yscale),
        xval: parseFloat(item[0]),
        yval: parseFloat(item[1]),
        name: setName
      };

      // limit the x, y values so they do not overdraw
      if (point.y <= 0.0) {
        point.y = 0.0;
      }
      if (point.y >= 1.0) {
        point.y = 1.0;
      }
      if ((point.x >= 0.0) && (point.x <= 1.0)) {
        this.points.push(point);
      }
    }
  }
};

DygraphLayout.prototype._evaluateLineTicks = function() {
  this.xticks = new Array();
  for (var i = 0; i < this.options.xTicks.length; i++) {
    var tick = this.options.xTicks[i];
    var label = tick.label;
    var pos = this.xscale * (tick.v - this.minxval);
    if ((pos >= 0.0) && (pos <= 1.0)) {
      this.xticks.push([pos, label]);
    }
  }

  this.yticks = new Array();
  for (var i = 0; i < this.options.yTicks.length; i++) {
    var tick = this.options.yTicks[i];
    var label = tick.label;
    var pos = 1.0 - (this.yscale * (tick.v - this.minyval));
    if ((pos >= 0.0) && (pos <= 1.0)) {
      this.yticks.push([pos, label]);
    }
  }
};


/**
 * Behaves the same way as PlotKit.Layout, but also copies the errors
 * @private
 */
DygraphLayout.prototype.evaluateWithError = function() {
  this.evaluate();
  if (!this.options.errorBars) return;

  // Copy over the error terms
  var i = 0; // index in this.points
  for (var setName in this.datasets) {
    var j = 0;
    var dataset = this.datasets[setName];
    for (var j = 0; j < dataset.length; j++, i++) {
      var item = dataset[j];
      var xv = parseFloat(item[0]);
      var yv = parseFloat(item[1]);

      if (xv == this.points[i].xval &&
          yv == this.points[i].yval) {
        this.points[i].errorMinus = parseFloat(item[2]);
        this.points[i].errorPlus = parseFloat(item[3]);
      }
    }
  }
};

/**
 * Convenience function to remove all the data sets from a graph
 */
DygraphLayout.prototype.removeAllDatasets = function() {
  delete this.datasets;
  this.datasets = new Array();
};

/**
 * Change the values of various layout options
 * @param {Object} new_options an associative array of new properties
 */
DygraphLayout.prototype.updateOptions = function(new_options) {
  Dygraph.update(this.options, new_options ? new_options : {});
};

// Subclass PlotKit.CanvasRenderer to add:
// 1. X/Y grid overlay
// 2. Ability to draw error bars (if required)

/**
 * Sets some PlotKit.CanvasRenderer options
 * @param {Object} element The canvas to attach to
 * @param {Layout} layout The DygraphLayout object for this graph.
 * @param {Object} options Options to pass on to CanvasRenderer
 */
DygraphCanvasRenderer = function(dygraph, element, layout, options) {
  // TODO(danvk): remove options, just use dygraph.attr_.
  this.dygraph_ = dygraph;

  // default options
  this.options = {
    "strokeWidth": 0.5,
    "drawXAxis": true,
    "drawYAxis": true,
    "axisLineColor": "black",
    "axisLineWidth": 0.5,
    "axisTickSize": 3,
    "axisLabelColor": "black",
    "axisLabelFont": "Arial",
    "axisLabelFontSize": 9,
    "axisLabelWidth": 50,
    "drawYGrid": true,
    "drawXGrid": true,
    "gridLineColor": "rgb(128,128,128)"
  };
  Dygraph.update(this.options, options);

  this.layout = layout;
  this.element = element;
  this.container = this.element.parentNode;

  this.height = this.element.height;
  this.width = this.element.width;

  // --- check whether everything is ok before we return
  if (!this.isIE && !(DygraphCanvasRenderer.isSupported(this.element)))
      throw "Canvas is not supported.";

  // internal state
  this.xlabels = new Array();
  this.ylabels = new Array();

  this.area = {
    x: this.options.yAxisLabelWidth + 2 * this.options.axisTickSize,
    y: 0
  };
  this.area.w = this.width - this.area.x - this.options.rightGap;
  this.area.h = this.height - this.options.axisLabelFontSize -
                2 * this.options.axisTickSize;

  this.container.style.position = "relative";
  this.container.style.width = this.width + "px";
};

DygraphCanvasRenderer.prototype.clear = function() {
  if (this.isIE) {
    // VML takes a while to start up, so we just poll every this.IEDelay
    try {
      if (this.clearDelay) {
        this.clearDelay.cancel();
        this.clearDelay = null;
      }
      var context = this.element.getContext("2d");
    }
    catch (e) {
      // TODO(danvk): this is broken, since MochiKit.Async is gone.
      this.clearDelay = MochiKit.Async.wait(this.IEDelay);
      this.clearDelay.addCallback(bind(this.clear, this));
      return;
    }
  }

  var context = this.element.getContext("2d");
  context.clearRect(0, 0, this.width, this.height);

  for (var i = 0; i < this.xlabels.length; i++) {
    var el = this.xlabels[i];
    el.parentNode.removeChild(el);
  }
  for (var i = 0; i < this.ylabels.length; i++) {
    var el = this.ylabels[i];
    el.parentNode.removeChild(el);
  }
  this.xlabels = new Array();
  this.ylabels = new Array();
};


DygraphCanvasRenderer.isSupported = function(canvasName) {
  var canvas = null;
  try {
    if (typeof(canvasName) == 'undefined' || canvasName == null)
      canvas = document.createElement("canvas");
    else
      canvas = canvasName;
    var context = canvas.getContext("2d");
  }
  catch (e) {
    var ie = navigator.appVersion.match(/MSIE (\d\.\d)/);
    var opera = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
    if ((!ie) || (ie[1] < 6) || (opera))
      return false;
    return true;
  }
  return true;
};

/**
 * Draw an X/Y grid on top of the existing plot
 */
DygraphCanvasRenderer.prototype.render = function() {
  // Draw the new X/Y grid
  var ctx = this.element.getContext("2d");
  if (this.options.drawYGrid) {
    var ticks = this.layout.yticks;
    ctx.save();
    ctx.strokeStyle = this.options.gridLineColor;
    ctx.lineWidth = this.options.axisLineWidth;
    for (var i = 0; i < ticks.length; i++) {
      var x = this.area.x;
      var y = this.area.y + ticks[i][0] * this.area.h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + this.area.w, y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  if (this.options.drawXGrid) {
    var ticks = this.layout.xticks;
    ctx.save();
    ctx.strokeStyle = this.options.gridLineColor;
    ctx.lineWidth = this.options.axisLineWidth;
    for (var i=0; i<ticks.length; i++) {
      var x = this.area.x + ticks[i][0] * this.area.w;
      var y = this.area.y + this.area.h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, this.area.y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Do the ordinary rendering, as before
  this._renderLineChart();
  this._renderAxis();
};


DygraphCanvasRenderer.prototype._renderAxis = function() {
  if (!this.options.drawXAxis && !this.options.drawYAxis)
    return;

  var context = this.element.getContext("2d");

  var labelStyle = {
    "position": "absolute",
    "fontSize": this.options.axisLabelFontSize + "px",
    "zIndex": 10,
    "color": this.options.axisLabelColor,
    "width": this.options.axisLabelWidth + "px",
    "overflow": "hidden"
  };
  var makeDiv = function(txt) {
    var div = document.createElement("div");
    for (var name in labelStyle) {
      div.style[name] = labelStyle[name];
    }
    div.appendChild(document.createTextNode(txt));
    return div;
  };

  // axis lines
  context.save();
  context.strokeStyle = this.options.axisLineColor;
  context.lineWidth = this.options.axisLineWidth;

  if (this.options.drawYAxis) {
    if (this.layout.yticks) {
      for (var i = 0; i < this.layout.yticks.length; i++) {
        var tick = this.layout.yticks[i];
        if (typeof(tick) == "function") return;
        var x = this.area.x;
        var y = this.area.y + tick[0] * this.area.h;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - this.options.axisTickSize, y);
        context.closePath();
        context.stroke();

        var label = makeDiv(tick[1]);
        var top = (y - this.options.axisLabelFontSize / 2);
        if (top < 0) top = 0;

        if (top + this.options.axisLabelFontSize + 3 > this.height) {
          label.style.bottom = "0px";
        } else {
          label.style.top = top + "px";
        }
        label.style.left = "0px";
        label.style.textAlign = "right";
        label.style.width = this.options.yAxisLabelWidth + "px";
        this.container.appendChild(label);
        this.ylabels.push(label);
      }

      // The lowest tick on the y-axis often overlaps with the leftmost
      // tick on the x-axis. Shift the bottom tick up a little bit to
      // compensate if necessary.
      var bottomTick = this.ylabels[0];
      var fontSize = this.options.axisLabelFontSize;
      var bottom = parseInt(bottomTick.style.top) + fontSize;
      if (bottom > this.height - fontSize) {
        bottomTick.style.top = (parseInt(bottomTick.style.top) -
            fontSize / 2) + "px";
      }
    }

    context.beginPath();
    context.moveTo(this.area.x, this.area.y);
    context.lineTo(this.area.x, this.area.y + this.area.h);
    context.closePath();
    context.stroke();
  }

  if (this.options.drawXAxis) {
    if (this.layout.xticks) {
      for (var i = 0; i < this.layout.xticks.length; i++) {
        var tick = this.layout.xticks[i];
        if (typeof(dataset) == "function") return;

        var x = this.area.x + tick[0] * this.area.w;
        var y = this.area.y + this.area.h;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + this.options.axisTickSize);
        context.closePath();
        context.stroke();

        var label = makeDiv(tick[1]);
        label.style.textAlign = "center";
        label.style.bottom = "0px";

        var left = (x - this.options.axisLabelWidth/2);
        if (left + this.options.axisLabelWidth > this.width) {
          left = this.width - this.options.xAxisLabelWidth;
          label.style.textAlign = "right";
        }
        if (left < 0) {
          left = 0;
          label.style.textAlign = "left";
        }

        label.style.left = left + "px";
        label.style.width = this.options.xAxisLabelWidth + "px";
        this.container.appendChild(label);
        this.xlabels.push(label);
      }
    }

    context.beginPath();
    context.moveTo(this.area.x, this.area.y + this.area.h);
    context.lineTo(this.area.x + this.area.w, this.area.y + this.area.h);
    context.closePath();
    context.stroke();
  }

  context.restore();
};


/**
 * Overrides the CanvasRenderer method to draw error bars
 */
DygraphCanvasRenderer.prototype._renderLineChart = function() {
  var context = this.element.getContext("2d");
  var colorCount = this.options.colorScheme.length;
  var colorScheme = this.options.colorScheme;
  var errorBars = this.layout.options.errorBars;

  var setNames = [];
  for (var name in this.layout.datasets) setNames.push(name);
  var setCount = setNames.length;

  //Update Points
  for (var i = 0; i < this.layout.points.length; i++) {
    var point = this.layout.points[i];
    point.canvasx = this.area.w * point.x + this.area.x;
    point.canvasy = this.area.h * point.y + this.area.y;
  }

  // create paths
  var isOK = function(x) { return x && !isNaN(x); };

  var ctx = context;
  if (errorBars) {
    for (var i = 0; i < setCount; i++) {
      var setName = setNames[i];
      var color = colorScheme[i % colorCount];

      // setup graphics context
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = this.options.strokeWidth;
      var prevX = -1;
      var prevYs = [-1, -1];
      var count = 0;
      var yscale = this.layout.yscale;
      // should be same color as the lines but only 15% opaque.
      var rgb = new RGBColor(color);
      var err_color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.15)';
      ctx.fillStyle = err_color;
      ctx.beginPath();
      for (var j = 0; j < this.layout.points.length; j++) {
        var point = this.layout.points[j];
        count++;
        if (point.name == setName) {
          if (!point.y || isNaN(point.y)) {
            prevX = -1;
            continue;
          }
          var newYs = [ point.y - point.errorPlus * yscale,
                        point.y + point.errorMinus * yscale ];
          newYs[0] = this.area.h * newYs[0] + this.area.y;
          newYs[1] = this.area.h * newYs[1] + this.area.y;
          if (prevX >= 0) {
            ctx.moveTo(prevX, prevYs[0]);
            ctx.lineTo(point.canvasx, newYs[0]);
            ctx.lineTo(point.canvasx, newYs[1]);
            ctx.lineTo(prevX, prevYs[1]);
            ctx.closePath();
          }
          prevYs[0] = newYs[0];
          prevYs[1] = newYs[1];
          prevX = point.canvasx;
        }
      }
      ctx.fill();
    }
  }

  for (var i = 0; i < setCount; i++) {
    var setName = setNames[i];
    var color = colorScheme[i%colorCount];

    // setup graphics context
    context.save();
    var point = this.layout.points[0];
    var pointSize = this.dygraph_.attr_("pointSize");
    var prevX = null, prevY = null;
    var drawPoints = this.dygraph_.attr_("drawPoints");
    var points = this.layout.points;
    for (var j = 0; j < points.length; j++) {
      var point = points[j];
      if (point.name == setName) {
        if (!isOK(point.canvasy)) {
          // this will make us move to the next point, not draw a line to it.
          prevX = prevY = null;
        } else {
          // A point is "isolated" if it is non-null but both the previous
          // and next points are null.
          var isIsolated = (!prevX && (j == points.length - 1 ||
                                       !isOK(points[j+1].canvasy)));

          if (!prevX) {
            prevX = point.canvasx;
            prevY = point.canvasy;
          } else {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = this.options.strokeWidth;
            ctx.moveTo(prevX, prevY);
            prevX = point.canvasx;
            prevY = point.canvasy;
            ctx.lineTo(prevX, prevY);
            ctx.stroke();
          }

          if (drawPoints || isIsolated) {
           ctx.beginPath();
           ctx.fillStyle = color;
           ctx.arc(point.canvasx, point.canvasy, pointSize,
                   0, 2 * Math.PI, false);
           ctx.fill();
          }
        }
      }
    }
  }

  context.restore();
};

}


/**************** content/js/ext/dygraph.js *****************/
function init_dygraph(document) {
	
// Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
// All Rights Reserved.

/**
 * @fileoverview Creates an interactive, zoomable graph based on a CSV file or
 * string. Dygraph can handle multiple series with or without error bars. The
 * date/value ranges will be automatically set. Dygraph uses the
 * &lt;canvas&gt; tag, so it only works in FF1.5+.
 * @author danvdk@gmail.com (Dan Vanderkam)

  Usage:
   <div id="graphdiv" style="width:800px; height:500px;"></div>
   <script type="text/javascript">
     new Dygraph(document.getElementById("graphdiv"),
                 "datafile.csv",  // CSV file with headers
                 { }); // options
   </script>

 The CSV file is of the form

   Date,SeriesA,SeriesB,SeriesC
   YYYYMMDD,A1,B1,C1
   YYYYMMDD,A2,B2,C2

 If the 'errorBars' option is set in the constructor, the input should be of
 the form

   Date,SeriesA,SeriesB,...
   YYYYMMDD,A1,sigmaA1,B1,sigmaB1,...
   YYYYMMDD,A2,sigmaA2,B2,sigmaB2,...

 If the 'fractions' option is set, the input should be of the form:

   Date,SeriesA,SeriesB,...
   YYYYMMDD,A1/B1,A2/B2,...
   YYYYMMDD,A1/B1,A2/B2,...

 And error bars will be calculated automatically using a binomial distribution.

 For further documentation and examples, see http://www.danvk.org/dygraphs

 */

/**
 * An interactive, zoomable graph
 * @param {String | Function} file A file containing CSV data or a function that
 * returns this data. The expected format for each line is
 * YYYYMMDD,val1,val2,... or, if attrs.errorBars is set,
 * YYYYMMDD,val1,stddev1,val2,stddev2,...
 * @param {Object} attrs Various other attributes, e.g. errorBars determines
 * whether the input data contains error ranges.
 */
Dygraph = function(div, data, opts) {
  if (arguments.length > 0) {
    if (arguments.length == 4) {
      // Old versions of dygraphs took in the series labels as a constructor
      // parameter. This doesn't make sense anymore, but it's easy to continue
      // to support this usage.
      this.warn("Using deprecated four-argument dygraph constructor");
      this.__old_init__(div, data, arguments[2], arguments[3]);
    } else {
      this.__init__(div, data, opts);
    }
  }
};

Dygraph.NAME = "Dygraph";
Dygraph.VERSION = "1.2";
Dygraph.__repr__ = function() {
  return "[" + this.NAME + " " + this.VERSION + "]";
};
Dygraph.toString = function() {
  return this.__repr__();
};

// Various default values
Dygraph.DEFAULT_ROLL_PERIOD = 1;
Dygraph.DEFAULT_WIDTH = 480;
Dygraph.DEFAULT_HEIGHT = 320;
Dygraph.AXIS_LINE_WIDTH = 0.3;

// Default attribute values.
Dygraph.DEFAULT_ATTRS = {
  highlightCircleSize: 3,
  pixelsPerXLabel: 60,
  pixelsPerYLabel: 30,

  labelsDivWidth: 250,
  labelsDivStyles: {
    // TODO(danvk): move defaults from createStatusMessage_ here.
  },
  labelsSeparateLines: false,
  labelsKMB: false,

  strokeWidth: 1.0,

  axisTickSize: 3,
  axisLabelFontSize: 14,
  xAxisLabelWidth: 50,
  yAxisLabelWidth: 50,
  rightGap: 5,

  showRoller: false,
  xValueFormatter: Dygraph.dateString_,
  xValueParser: Dygraph.dateParser,
  xTicker: Dygraph.dateTicker,

  delimiter: ',',

  sigma: 2.0,
  errorBars: false,
  fractions: false,
  wilsonInterval: true,  // only relevant if fractions is true
  customBars: false
};

// Various logging levels.
Dygraph.DEBUG = 1;
Dygraph.INFO = 2;
Dygraph.WARNING = 3;
Dygraph.ERROR = 3;

Dygraph.prototype.__old_init__ = function(div, file, labels, attrs) {
  // Labels is no longer a constructor parameter, since it's typically set
  // directly from the data source. It also conains a name for the x-axis,
  // which the previous constructor form did not.
  if (labels != null) {
    var new_labels = ["Date"];
    for (var i = 0; i < labels.length; i++) new_labels.push(labels[i]);
    Dygraph.update(attrs, { 'labels': new_labels });
  }
  this.__init__(div, file, attrs);
};

/**
 * Initializes the Dygraph. This creates a new DIV and constructs the PlotKit
 * and interaction &lt;canvas&gt; inside of it. See the constructor for details
 * on the parameters.
 * @param {String | Function} file Source data
 * @param {Array.<String>} labels Names of the data series
 * @param {Object} attrs Miscellaneous other options
 * @private
 */
Dygraph.prototype.__init__ = function(div, file, attrs) {
  // Support two-argument constructor
  if (attrs == null) { attrs = {}; }

  // Copy the important bits into the object
  // TODO(danvk): most of these should just stay in the attrs_ dictionary.
  this.maindiv_ = div;
  this.file_ = file;
  this.rollPeriod_ = attrs.rollPeriod || Dygraph.DEFAULT_ROLL_PERIOD;
  this.previousVerticalX_ = -1;
  this.fractions_ = attrs.fractions || false;
  this.dateWindow_ = attrs.dateWindow || null;
  this.valueRange_ = attrs.valueRange || null;
  this.wilsonInterval_ = attrs.wilsonInterval || true;

  // Clear the div. This ensure that, if multiple dygraphs are passed the same
  // div, then only one will be drawn.
  div.innerHTML = "";

  // If the div isn't already sized then give it a default size.
  if (div.style.width == '') {
    div.style.width = Dygraph.DEFAULT_WIDTH + "px";
  }
  if (div.style.height == '') {
    div.style.height = Dygraph.DEFAULT_HEIGHT + "px";
  }
  this.width_ = parseInt(div.style.width, 10);
  this.height_ = parseInt(div.style.height, 10);

  // Dygraphs has many options, some of which interact with one another.
  // To keep track of everything, we maintain two sets of options:
  //
  //  this.user_attrs_   only options explicitly set by the user. 
  //  this.attrs_        defaults, options derived from user_attrs_, data.
  //
  // Options are then accessed this.attr_('attr'), which first looks at
  // user_attrs_ and then computed attrs_. This way Dygraphs can set intelligent
  // defaults without overriding behavior that the user specifically asks for.
  this.user_attrs_ = {};
  Dygraph.update(this.user_attrs_, attrs);

  this.attrs_ = {};
  Dygraph.update(this.attrs_, Dygraph.DEFAULT_ATTRS);

  // Make a note of whether labels will be pulled from the CSV file.
  this.labelsFromCSV_ = (this.attr_("labels") == null);

  // Create the containing DIV and other interactive elements
  this.createInterface_();

  // Create the PlotKit grapher
  // TODO(danvk): why does the Layout need its own set of options?
  this.layoutOptions_ = { 'xOriginIsZero': false };
  Dygraph.update(this.layoutOptions_, this.attrs_);
  Dygraph.update(this.layoutOptions_, this.user_attrs_);
  Dygraph.update(this.layoutOptions_, {
    'errorBars': (this.attr_("errorBars") || this.attr_("customBars")) });

  this.layout_ = new DygraphLayout(this, this.layoutOptions_);

  // TODO(danvk): why does the Renderer need its own set of options?
  this.renderOptions_ = { colorScheme: this.colors_,
                          strokeColor: null,
                          axisLineWidth: Dygraph.AXIS_LINE_WIDTH };
  Dygraph.update(this.renderOptions_, this.attrs_);
  Dygraph.update(this.renderOptions_, this.user_attrs_);
  this.plotter_ = new DygraphCanvasRenderer(this,
                                            this.hidden_, this.layout_,
                                            this.renderOptions_);

  this.createStatusMessage_();
  this.createRollInterface_();
  this.createDragInterface_();

  this.start_();
};

Dygraph.prototype.attr_ = function(name) {
  if (typeof(this.user_attrs_[name]) != 'undefined') {
    return this.user_attrs_[name];
  } else if (typeof(this.attrs_[name]) != 'undefined') {
    return this.attrs_[name];
  } else {
    return null;
  }
};

// TODO(danvk): any way I can get the line numbers to be this.warn call?
Dygraph.prototype.log = function(severity, message) {
  if (typeof(console) != 'undefined') {
    switch (severity) {
      case Dygraph.DEBUG:
        console.debug('dygraphs: ' + message);
        break;
      case Dygraph.INFO:
        console.info('dygraphs: ' + message);
        break;
      case Dygraph.WARNING:
        console.warn('dygraphs: ' + message);
        break;
      case Dygraph.ERROR:
        console.error('dygraphs: ' + message);
        break;
    }
  }
}
Dygraph.prototype.info = function(message) {
  this.log(Dygraph.INFO, message);
}
Dygraph.prototype.warn = function(message) {
  this.log(Dygraph.WARNING, message);
}
Dygraph.prototype.error = function(message) {
  this.log(Dygraph.ERROR, message);
}

/**
 * Returns the current rolling period, as set by the user or an option.
 * @return {Number} The number of days in the rolling window
 */
Dygraph.prototype.rollPeriod = function() {
  return this.rollPeriod_;
};

Dygraph.addEvent = function(el, evt, fn) {
  var normed_fn = function(e) {
    if (!e) var e = window.event;
    fn(e);
  };
  if (window.addEventListener) {  // Mozilla, Netscape, Firefox
    el.addEventListener(evt, normed_fn, false);
  } else {  // IE
    el.attachEvent('on' + evt, normed_fn);
  }
};

/**
 * Generates interface elements for the Dygraph: a containing div, a div to
 * display the current point, and a textbox to adjust the rolling average
 * period.
 * @private
 */
Dygraph.prototype.createInterface_ = function() {
  // Create the all-enclosing graph div
  var enclosing = this.maindiv_;

  this.graphDiv = document.createElement("div");
  this.graphDiv.style.width = this.width_ + "px";
  this.graphDiv.style.height = this.height_ + "px";
  enclosing.appendChild(this.graphDiv);

  // Create the canvas for interactive parts of the chart.
  // this.canvas_ = document.createElement("canvas");
  this.canvas_ = Dygraph.createCanvas();
  this.canvas_.style.position = "absolute";
  this.canvas_.width = this.width_;
  this.canvas_.height = this.height_;
  this.canvas_.style.width = this.width_ + "px";    // for IE
  this.canvas_.style.height = this.height_ + "px";  // for IE
  this.graphDiv.appendChild(this.canvas_);

  // ... and for static parts of the chart.
  this.hidden_ = this.createPlotKitCanvas_(this.canvas_);

  var dygraph = this;
  Dygraph.addEvent(this.hidden_, 'mousemove', function(e) {
    dygraph.mouseMove_(e);
  });
  Dygraph.addEvent(this.hidden_, 'mouseout', function(e) {
    dygraph.mouseOut_(e);
  });
}

/**
 * Creates the canvas containing the PlotKit graph. Only plotkit ever draws on
 * this particular canvas. All Dygraph work is done on this.canvas_.
 * @param {Object} canvas The Dygraph canvas over which to overlay the plot
 * @return {Object} The newly-created canvas
 * @private
 */
Dygraph.prototype.createPlotKitCanvas_ = function(canvas) {
  // var h = document.createElement("canvas");
  var h = Dygraph.createCanvas();
  h.style.position = "absolute";
  h.style.top = canvas.style.top;
  h.style.left = canvas.style.left;
  h.width = this.width_;
  h.height = this.height_;
  h.style.width = this.width_ + "px";    // for IE
  h.style.height = this.height_ + "px";  // for IE
  this.graphDiv.appendChild(h);
  return h;
};

// Taken from MochiKit.Color
Dygraph.hsvToRGB = function (hue, saturation, value) {
  var red;
  var green;
  var blue;
  if (saturation === 0) {
    red = value;
    green = value;
    blue = value;
  } else {
    var i = Math.floor(hue * 6);
    var f = (hue * 6) - i;
    var p = value * (1 - saturation);
    var q = value * (1 - (saturation * f));
    var t = value * (1 - (saturation * (1 - f)));
    switch (i) {
      case 1: red = q; green = value; blue = p; break;
      case 2: red = p; green = value; blue = t; break;
      case 3: red = p; green = q; blue = value; break;
      case 4: red = t; green = p; blue = value; break;
      case 5: red = value; green = p; blue = q; break;
      case 6: // fall through
      case 0: red = value; green = t; blue = p; break;
    }
  }
  red = Math.floor(255 * red + 0.5);
  green = Math.floor(255 * green + 0.5);
  blue = Math.floor(255 * blue + 0.5);
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
};


/**
 * Generate a set of distinct colors for the data series. This is done with a
 * color wheel. Saturation/Value are customizable, and the hue is
 * equally-spaced around the color wheel. If a custom set of colors is
 * specified, that is used instead.
 * @private
 */
Dygraph.prototype.setColors_ = function() {
  // TODO(danvk): compute this directly into this.attrs_['colorScheme'] and do
  // away with this.renderOptions_.
  var num = this.attr_("labels").length - 1;
  this.colors_ = [];
  var colors = this.attr_('colors');
  if (!colors) {
    var sat = this.attr_('colorSaturation') || 1.0;
    var val = this.attr_('colorValue') || 0.5;
    for (var i = 1; i <= num; i++) {
      var hue = (1.0*i/(1+num));
      this.colors_.push( Dygraph.hsvToRGB(hue, sat, val) );
    }
  } else {
    for (var i = 0; i < num; i++) {
      var colorStr = colors[i % colors.length];
      this.colors_.push(colorStr);
    }
  }

  // TODO(danvk): update this w/r/t/ the new options system. 
  this.renderOptions_.colorScheme = this.colors_;
  Dygraph.update(this.plotter_.options, this.renderOptions_);
  Dygraph.update(this.layoutOptions_, this.user_attrs_);
  Dygraph.update(this.layoutOptions_, this.attrs_);
}

// The following functions are from quirksmode.org
// http://www.quirksmode.org/js/findpos.html
Dygraph.findPosX = function(obj) {
  var curleft = 0;
  if (obj.offsetParent) {
    while (obj.offsetParent) {
      curleft += obj.offsetLeft;
      obj = obj.offsetParent;
    }
  }
  else if (obj.x)
    curleft += obj.x;
  return curleft;
};
                   
Dygraph.findPosY = function(obj) {
  var curtop = 0;
  if (obj.offsetParent) {
    while (obj.offsetParent) {
      curtop += obj.offsetTop;
      obj = obj.offsetParent;
    }
  }
  else if (obj.y)
    curtop += obj.y;
  return curtop;
};

/**
 * Create the div that contains information on the selected point(s)
 * This goes in the top right of the canvas, unless an external div has already
 * been specified.
 * @private
 */
Dygraph.prototype.createStatusMessage_ = function(){
  if (!this.attr_("labelsDiv")) {
    var divWidth = this.attr_('labelsDivWidth');
    var messagestyle = {
      "position": "absolute",
      "fontSize": "14px",
      "zIndex": 10,
      "width": divWidth + "px",
      "top": "0px",
      "left": (this.width_ - divWidth - 2) + "px",
      "background": "white",
      "textAlign": "left",
      "overflow": "hidden"};
    Dygraph.update(messagestyle, this.attr_('labelsDivStyles'));
    var div = document.createElement("div");
    for (var name in messagestyle) {
      div.style[name] = messagestyle[name];
    }
    this.graphDiv.appendChild(div);
    this.attrs_.labelsDiv = div;
  }
};

/**
 * Create the text box to adjust the averaging period
 * @return {Object} The newly-created text box
 * @private
 */
Dygraph.prototype.createRollInterface_ = function() {
  var display = this.attr_('showRoller') ? "block" : "none";
  var textAttr = { "position": "absolute",
                   "zIndex": 10,
                   "top": (this.plotter_.area.h - 25) + "px",
                   "left": (this.plotter_.area.x + 1) + "px",
                   "display": display
                  };
  var roller = document.createElement("input");
  roller.type = "text";
  roller.size = "2";
  roller.value = this.rollPeriod_;
  for (var name in textAttr) {
    roller.style[name] = textAttr[name];
  }

  var pa = this.graphDiv;
  pa.appendChild(roller);
  var dygraph = this;
  //this.rollPeriod_ = length;
  //this.drawGraph_(this.rawData_);
  roller.onChange = function() { dygraph.adjustRoll(roller.value); };
  return roller;
};

// These functions are taken from MochiKit.Signal
Dygraph.pageX = function(e) {
  if (e.pageX) {
    return (!e.pageX || e.pageX < 0) ? 0 : e.pageX;
  } else {
    var de = document;
    var b = document.body;
    return e.clientX +
        (de.scrollLeft || b.scrollLeft) -
        (de.clientLeft || 0);
  }
};

Dygraph.pageY = function(e) {
  if (e.pageY) {
    return (!e.pageY || e.pageY < 0) ? 0 : e.pageY;
  } else {
    var de = document;
    var b = document.body;
    return e.clientY +
        (de.scrollTop || b.scrollTop) -
        (de.clientTop || 0);
  }
};

/**
 * Set up all the mouse handlers needed to capture dragging behavior for zoom
 * events.
 * @private
 */
Dygraph.prototype.createDragInterface_ = function() {
  var self = this;

  // Tracks whether the mouse is down right now
  var mouseDown = false;
  var dragStartX = null;
  var dragStartY = null;
  var dragEndX = null;
  var dragEndY = null;
  var prevEndX = null;

  // Utility function to convert page-wide coordinates to canvas coords
  var px = 0;
  var py = 0;
  var getX = function(e) { return Dygraph.pageX(e) - px };
  var getY = function(e) { return Dygraph.pageX(e) - py };

  // Draw zoom rectangles when the mouse is down and the user moves around
  Dygraph.addEvent(this.hidden_, 'mousemove', function(event) {
    if (mouseDown) {
      dragEndX = getX(event);
      dragEndY = getY(event);

      self.drawZoomRect_(dragStartX, dragEndX, prevEndX);
      prevEndX = dragEndX;
    }
  });

  // Track the beginning of drag events
  Dygraph.addEvent(this.hidden_, 'mousedown', function(event) {
    mouseDown = true;
    px = Dygraph.findPosX(self.canvas_);
    py = Dygraph.findPosY(self.canvas_);
    dragStartX = getX(event);
    dragStartY = getY(event);
  });

  // If the user releases the mouse button during a drag, but not over the
  // canvas, then it doesn't count as a zooming action.
  Dygraph.addEvent(document, 'mouseup', function(event) {
    if (mouseDown) {
      mouseDown = false;
      dragStartX = null;
      dragStartY = null;
    }
  });

  // Temporarily cancel the dragging event when the mouse leaves the graph
  Dygraph.addEvent(this.hidden_, 'mouseout', function(event) {
    if (mouseDown) {
      dragEndX = null;
      dragEndY = null;
    }
  });

  // If the mouse is released on the canvas during a drag event, then it's a
  // zoom. Only do the zoom if it's over a large enough area (>= 10 pixels)
  Dygraph.addEvent(this.hidden_, 'mouseup', function(event) {
    if (mouseDown) {
      mouseDown = false;
      dragEndX = getX(event);
      dragEndY = getY(event);
      var regionWidth = Math.abs(dragEndX - dragStartX);
      var regionHeight = Math.abs(dragEndY - dragStartY);

      if (regionWidth < 2 && regionHeight < 2 &&
          self.attr_('clickCallback') != null &&
          self.lastx_ != undefined) {
        // TODO(danvk): pass along more info about the points.
        self.attr_('clickCallback')(event, self.lastx_, self.selPoints_);
      }

      if (regionWidth >= 10) {
        self.doZoom_(Math.min(dragStartX, dragEndX),
                     Math.max(dragStartX, dragEndX));
      } else {
        self.canvas_.getContext("2d").clearRect(0, 0,
                                           self.canvas_.width,
                                           self.canvas_.height);
      }

      dragStartX = null;
      dragStartY = null;
    }
  });

  // Double-clicking zooms back out
  Dygraph.addEvent(this.hidden_, 'dblclick', function(event) {
    if (self.dateWindow_ == null) return;
    self.dateWindow_ = null;
    self.drawGraph_(self.rawData_);
    var minDate = self.rawData_[0][0];
    var maxDate = self.rawData_[self.rawData_.length - 1][0];
    if (self.attr_("zoomCallback")) {
      self.attr_("zoomCallback")(minDate, maxDate);
    }
  });
};

/**
 * Draw a gray zoom rectangle over the desired area of the canvas. Also clears
 * up any previous zoom rectangles that were drawn. This could be optimized to
 * avoid extra redrawing, but it's tricky to avoid interactions with the status
 * dots.
 * @param {Number} startX The X position where the drag started, in canvas
 * coordinates.
 * @param {Number} endX The current X position of the drag, in canvas coords.
 * @param {Number} prevEndX The value of endX on the previous call to this
 * function. Used to avoid excess redrawing
 * @private
 */
Dygraph.prototype.drawZoomRect_ = function(startX, endX, prevEndX) {
  var ctx = this.canvas_.getContext("2d");

  // Clean up from the previous rect if necessary
  if (prevEndX) {
    ctx.clearRect(Math.min(startX, prevEndX), 0,
                  Math.abs(startX - prevEndX), this.height_);
  }

  // Draw a light-grey rectangle to show the new viewing area
  if (endX && startX) {
    ctx.fillStyle = "rgba(128,128,128,0.33)";
    ctx.fillRect(Math.min(startX, endX), 0,
                 Math.abs(endX - startX), this.height_);
  }
};

/**
 * Zoom to something containing [lowX, highX]. These are pixel coordinates
 * in the canvas. The exact zoom window may be slightly larger if there are no
 * data points near lowX or highX. This function redraws the graph.
 * @param {Number} lowX The leftmost pixel value that should be visible.
 * @param {Number} highX The rightmost pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoom_ = function(lowX, highX) {
  // Find the earliest and latest dates contained in this canvasx range.
  var points = this.layout_.points;
  var minDate = null;
  var maxDate = null;
  // Find the nearest [minDate, maxDate] that contains [lowX, highX]
  for (var i = 0; i < points.length; i++) {
    var cx = points[i].canvasx;
    var x = points[i].xval;
    if (cx < lowX  && (minDate == null || x > minDate)) minDate = x;
    if (cx > highX && (maxDate == null || x < maxDate)) maxDate = x;
  }
  // Use the extremes if either is missing
  if (minDate == null) minDate = points[0].xval;
  if (maxDate == null) maxDate = points[points.length-1].xval;

  this.dateWindow_ = [minDate, maxDate];
  this.drawGraph_(this.rawData_);
  if (this.attr_("zoomCallback")) {
    this.attr_("zoomCallback")(minDate, maxDate);
  }
};

/**
 * When the mouse moves in the canvas, display information about a nearby data
 * point and draw dots over those points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @param {Object} event The mousemove event from the browser.
 * @private
 */
Dygraph.prototype.mouseMove_ = function(event) {
  var canvasx = Dygraph.pageX(event) - Dygraph.findPosX(this.hidden_);
  var points = this.layout_.points;

  var lastx = -1;
  var lasty = -1;

  // Loop through all the points and find the date nearest to our current
  // location.
  var minDist = 1e+100;
  var idx = -1;
  for (var i = 0; i < points.length; i++) {
    var dist = Math.abs(points[i].canvasx - canvasx);
    if (dist > minDist) break;
    minDist = dist;
    idx = i;
  }
  if (idx >= 0) lastx = points[idx].xval;
  // Check that you can really highlight the last day's data
  if (canvasx > points[points.length-1].canvasx)
    lastx = points[points.length-1].xval;

  // Extract the points we've selected
  this.selPoints_ = [];
  for (var i = 0; i < points.length; i++) {
    if (points[i].xval == lastx) {
      this.selPoints_.push(points[i]);
    }
  }

  if (this.attr_("highlightCallback")) {
    this.attr_("highlightCallback")(event, lastx, this.selPoints_);
  }

  // Clear the previously drawn vertical, if there is one
  var circleSize = this.attr_('highlightCircleSize');
  var ctx = this.canvas_.getContext("2d");
  if (this.previousVerticalX_ >= 0) {
    var px = this.previousVerticalX_;
    ctx.clearRect(px - circleSize - 1, 0, 2 * circleSize + 2, this.height_);
  }

  var isOK = function(x) { return x && !isNaN(x); };

  if (this.selPoints_.length > 0) {
    var canvasx = this.selPoints_[0].canvasx;

    // Set the status message to indicate the selected point(s)
    var replace = this.attr_('xValueFormatter')(lastx, this) + ":";
    var clen = this.colors_.length;
    for (var i = 0; i < this.selPoints_.length; i++) {
      if (!isOK(this.selPoints_[i].canvasy)) continue;
      if (this.attr_("labelsSeparateLines")) {
        replace += "<br/>";
      }
      var point = this.selPoints_[i];
      var c = new RGBColor(this.colors_[i%clen]);
      replace += " <b><font color='" + c.toHex() + "'>"
              + point.name + "</font></b>:"
              + this.round_(point.yval, 2);
    }
    this.attr_("labelsDiv").innerHTML = replace;

    // Save last x position for callbacks.
    this.lastx_ = lastx;

    // Draw colored circles over the center of each selected point
    ctx.save()
    for (var i = 0; i < this.selPoints_.length; i++) {
      if (!isOK(this.selPoints_[i%clen].canvasy)) continue;
      ctx.beginPath();
      ctx.fillStyle = this.colors_[i%clen];
      ctx.arc(canvasx, this.selPoints_[i%clen].canvasy, circleSize,
              0, 2 * Math.PI, false);
      ctx.fill();
    }
    ctx.restore();

    this.previousVerticalX_ = canvasx;
  }
};

/**
 * The mouse has left the canvas. Clear out whatever artifacts remain
 * @param {Object} event the mouseout event from the browser.
 * @private
 */
Dygraph.prototype.mouseOut_ = function(event) {
  // Get rid of the overlay data
  var ctx = this.canvas_.getContext("2d");
  ctx.clearRect(0, 0, this.width_, this.height_);
  this.attr_("labelsDiv").innerHTML = "";
};

Dygraph.zeropad = function(x) {
  if (x < 10) return "0" + x; else return "" + x;
}

/**
 * Return a string version of the hours, minutes and seconds portion of a date.
 * @param {Number} date The JavaScript date (ms since epoch)
 * @return {String} A time of the form "HH:MM:SS"
 * @private
 */
Dygraph.prototype.hmsString_ = function(date) {
  var zeropad = Dygraph.zeropad;
  var d = new Date(date);
  if (d.getSeconds()) {
    return zeropad(d.getHours()) + ":" +
           zeropad(d.getMinutes()) + ":" +
           zeropad(d.getSeconds());
  } else if (d.getMinutes()) {
    return zeropad(d.getHours()) + ":" + zeropad(d.getMinutes());
  } else {
    return zeropad(d.getHours());
  }
}

/**
 * Convert a JS date (millis since epoch) to YYYY/MM/DD
 * @param {Number} date The JavaScript date (ms since epoch)
 * @return {String} A date of the form "YYYY/MM/DD"
 * @private
 * TODO(danvk): why is this part of the prototype?
 */
Dygraph.dateString_ = function(date, self) {
  var zeropad = Dygraph.zeropad;
  var d = new Date(date);

  // Get the year:
  var year = "" + d.getFullYear();
  // Get a 0 padded month string
  var month = zeropad(d.getMonth() + 1);  //months are 0-offset, sigh
  // Get a 0 padded day string
  var day = zeropad(d.getDate());

  var ret = "";
  var frac = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  if (frac) ret = " " + self.hmsString_(date);

  return year + "/" + month + "/" + day + ret;
};

/**
 * Round a number to the specified number of digits past the decimal point.
 * @param {Number} num The number to round
 * @param {Number} places The number of decimals to which to round
 * @return {Number} The rounded number
 * @private
 */
Dygraph.prototype.round_ = function(num, places) {
  var shift = Math.pow(10, places);
  return Math.round(num * shift)/shift;
};

/**
 * Fires when there's data available to be graphed.
 * @param {String} data Raw CSV data to be plotted
 * @private
 */
Dygraph.prototype.loadedEvent_ = function(data) {
  this.rawData_ = this.parseCSV_(data);
  this.drawGraph_(this.rawData_);
};

Dygraph.prototype.months =  ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
Dygraph.prototype.quarters = ["Jan", "Apr", "Jul", "Oct"];

/**
 * Add ticks on the x-axis representing years, months, quarters, weeks, or days
 * @private
 */
Dygraph.prototype.addXTicks_ = function() {
  // Determine the correct ticks scale on the x-axis: quarterly, monthly, ...
  var startDate, endDate;
  if (this.dateWindow_) {
    startDate = this.dateWindow_[0];
    endDate = this.dateWindow_[1];
  } else {
    startDate = this.rawData_[0][0];
    endDate   = this.rawData_[this.rawData_.length - 1][0];
  }

  var xTicks = this.attr_('xTicker')(startDate, endDate, this);
  this.layout_.updateOptions({xTicks: xTicks});
};

// Time granularity enumeration
Dygraph.SECONDLY = 0;
Dygraph.TEN_SECONDLY = 1;
Dygraph.THIRTY_SECONDLY  = 2;
Dygraph.MINUTELY = 3;
Dygraph.TEN_MINUTELY = 4;
Dygraph.THIRTY_MINUTELY = 5;
Dygraph.HOURLY = 6;
Dygraph.SIX_HOURLY = 7;
Dygraph.DAILY = 8;
Dygraph.WEEKLY = 9;
Dygraph.MONTHLY = 10;
Dygraph.QUARTERLY = 11;
Dygraph.BIANNUAL = 12;
Dygraph.ANNUAL = 13;
Dygraph.DECADAL = 14;
Dygraph.NUM_GRANULARITIES = 15;

Dygraph.SHORT_SPACINGS = [];
Dygraph.SHORT_SPACINGS[Dygraph.SECONDLY]        = 1000 * 1;
Dygraph.SHORT_SPACINGS[Dygraph.TEN_SECONDLY]    = 1000 * 10;
Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_SECONDLY] = 1000 * 30;
Dygraph.SHORT_SPACINGS[Dygraph.MINUTELY]        = 1000 * 60;
Dygraph.SHORT_SPACINGS[Dygraph.TEN_MINUTELY]    = 1000 * 60 * 10;
Dygraph.SHORT_SPACINGS[Dygraph.THIRTY_MINUTELY] = 1000 * 60 * 30;
Dygraph.SHORT_SPACINGS[Dygraph.HOURLY]          = 1000 * 3600;
Dygraph.SHORT_SPACINGS[Dygraph.HOURLY]          = 1000 * 3600 * 6;
Dygraph.SHORT_SPACINGS[Dygraph.DAILY]           = 1000 * 86400;
Dygraph.SHORT_SPACINGS[Dygraph.WEEKLY]          = 1000 * 604800;

// NumXTicks()
//
//   If we used this time granularity, how many ticks would there be?
//   This is only an approximation, but it's generally good enough.
//
Dygraph.prototype.NumXTicks = function(start_time, end_time, granularity) {
  if (granularity < Dygraph.MONTHLY) {
    // Generate one tick mark for every fixed interval of time.
    var spacing = Dygraph.SHORT_SPACINGS[granularity];
    return Math.floor(0.5 + 1.0 * (end_time - start_time) / spacing);
  } else {
    var year_mod = 1;  // e.g. to only print one point every 10 years.
    var num_months = 12;
    if (granularity == Dygraph.QUARTERLY) num_months = 3;
    if (granularity == Dygraph.BIANNUAL) num_months = 2;
    if (granularity == Dygraph.ANNUAL) num_months = 1;
    if (granularity == Dygraph.DECADAL) { num_months = 1; year_mod = 10; }

    var msInYear = 365.2524 * 24 * 3600 * 1000;
    var num_years = 1.0 * (end_time - start_time) / msInYear;
    return Math.floor(0.5 + 1.0 * num_years * num_months / year_mod);
  }
};

// GetXAxis()
//
//   Construct an x-axis of nicely-formatted times on meaningful boundaries
//   (e.g. 'Jan 09' rather than 'Jan 22, 2009').
//
//   Returns an array containing {v: millis, label: label} dictionaries.
//
Dygraph.prototype.GetXAxis = function(start_time, end_time, granularity) {
  var ticks = [];
  if (granularity < Dygraph.MONTHLY) {
    // Generate one tick mark for every fixed interval of time.
    var spacing = Dygraph.SHORT_SPACINGS[granularity];
    var format = '%d%b';  // e.g. "1 Jan"
    // TODO(danvk): be smarter about making sure this really hits a "nice" time.
    if (granularity < Dygraph.HOURLY) {
      start_time = spacing * Math.floor(0.5 + start_time / spacing);
    }
    for (var t = start_time; t <= end_time; t += spacing) {
      var d = new Date(t);
      var frac = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
      if (frac == 0 || granularity >= Dygraph.DAILY) {
        // the extra hour covers DST problems.
        ticks.push({ v:t, label: new Date(t + 3600*1000).strftime(format) });
      } else {
        ticks.push({ v:t, label: this.hmsString_(t) });
      }
    }
  } else {
    // Display a tick mark on the first of a set of months of each year.
    // Years get a tick mark iff y % year_mod == 0. This is useful for
    // displaying a tick mark once every 10 years, say, on long time scales.
    var months;
    var year_mod = 1;  // e.g. to only print one point every 10 years.

    if (granularity == Dygraph.MONTHLY) {
      months = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
    } else if (granularity == Dygraph.QUARTERLY) {
      months = [ 0, 3, 6, 9 ];
    } else if (granularity == Dygraph.BIANNUAL) {
      months = [ 0, 6 ];
    } else if (granularity == Dygraph.ANNUAL) {
      months = [ 0 ];
    } else if (granularity == Dygraph.DECADAL) {
      months = [ 0 ];
      year_mod = 10;
    }

    var start_year = new Date(start_time).getFullYear();
    var end_year   = new Date(end_time).getFullYear();
    var zeropad = Dygraph.zeropad;
    for (var i = start_year; i <= end_year; i++) {
      if (i % year_mod != 0) continue;
      for (var j = 0; j < months.length; j++) {
        var date_str = i + "/" + zeropad(1 + months[j]) + "/01";
        var t = Date.parse(date_str);
        if (t < start_time || t > end_time) continue;
        ticks.push({ v:t, label: new Date(t).strftime('%b %y') });
      }
    }
  }

  return ticks;
};


/**
 * Add ticks to the x-axis based on a date range.
 * @param {Number} startDate Start of the date window (millis since epoch)
 * @param {Number} endDate End of the date window (millis since epoch)
 * @return {Array.<Object>} Array of {label, value} tuples.
 * @public
 */
Dygraph.dateTicker = function(startDate, endDate, self) {
  var chosen = -1;
  for (var i = 0; i < Dygraph.NUM_GRANULARITIES; i++) {
    var num_ticks = self.NumXTicks(startDate, endDate, i);
    if (self.width_ / num_ticks >= self.attr_('pixelsPerXLabel')) {
      chosen = i;
      break;
    }
  }

  if (chosen >= 0) {
    return self.GetXAxis(startDate, endDate, chosen);
  } else {
    // TODO(danvk): signal error.
  }
};

/**
 * Add ticks when the x axis has numbers on it (instead of dates)
 * @param {Number} startDate Start of the date window (millis since epoch)
 * @param {Number} endDate End of the date window (millis since epoch)
 * @return {Array.<Object>} Array of {label, value} tuples.
 * @public
 */
Dygraph.numericTicks = function(minV, maxV, self) {
  // Basic idea:
  // Try labels every 1, 2, 5, 10, 20, 50, 100, etc.
  // Calculate the resulting tick spacing (i.e. this.height_ / nTicks).
  // The first spacing greater than pixelsPerYLabel is what we use.
  var mults = [1, 2, 5];
  var scale, low_val, high_val, nTicks;
  // TODO(danvk): make it possible to set this for x- and y-axes independently.
  var pixelsPerTick = self.attr_('pixelsPerYLabel');
  for (var i = -10; i < 50; i++) {
    var base_scale = Math.pow(10, i);
    for (var j = 0; j < mults.length; j++) {
      scale = base_scale * mults[j];
      low_val = Math.floor(minV / scale) * scale;
      high_val = Math.ceil(maxV / scale) * scale;
      nTicks = (high_val - low_val) / scale;
      var spacing = self.height_ / nTicks;
      // wish I could break out of both loops at once...
      if (spacing > pixelsPerTick) break;
    }
    if (spacing > pixelsPerTick) break;
  }

  // Construct labels for the ticks
  var ticks = [];
  for (var i = 0; i < nTicks; i++) {
    var tickV = low_val + i * scale;
    var label = self.round_(tickV, 2);
    if (self.attr_("labelsKMB")) {
      var k = 1000;
      if (tickV >= k*k*k) {
        label = self.round_(tickV/(k*k*k), 1) + "B";
      } else if (tickV >= k*k) {
        label = self.round_(tickV/(k*k), 1) + "M";
      } else if (tickV >= k) {
        label = self.round_(tickV/k, 1) + "K";
      }
    }
    ticks.push( {label: label, v: tickV} );
  }
  return ticks;
};

/**
 * Adds appropriate ticks on the y-axis
 * @param {Number} minY The minimum Y value in the data set
 * @param {Number} maxY The maximum Y value in the data set
 * @private
 */
Dygraph.prototype.addYTicks_ = function(minY, maxY) {
  // Set the number of ticks so that the labels are human-friendly.
  // TODO(danvk): make this an attribute as well.
  var ticks = Dygraph.numericTicks(minY, maxY, this);
  this.layout_.updateOptions( { yAxis: [minY, maxY],
                                yTicks: ticks } );
};

// Computes the range of the data series (including confidence intervals).
// series is either [ [x1, y1], [x2, y2], ... ] or
// [ [x1, [y1, dev_low, dev_high]], [x2, [y2, dev_low, dev_high]], ...
// Returns [low, high]
Dygraph.prototype.extremeValues_ = function(series) {
  var minY = null, maxY = null;

  var bars = this.attr_("errorBars") || this.attr_("customBars");
  if (bars) {
    // With custom bars, maxY is the max of the high values.
    for (var j = 0; j < series.length; j++) {
      var y = series[j][1][0];
      if (!y) continue;
      var low = y - series[j][1][1];
      var high = y + series[j][1][2];
      if (low > y) low = y;    // this can happen with custom bars,
      if (high < y) high = y;  // e.g. in tests/custom-bars.html
      if (maxY == null || high > maxY) {
        maxY = high;
      }
      if (minY == null || low < minY) {
        minY = low;
      }
    }
  } else {
    for (var j = 0; j < series.length; j++) {
      var y = series[j][1];
      if (!y) continue;
      if (maxY == null || y > maxY) {
        maxY = y;
      }
      if (minY == null || y < minY) {
        minY = y;
      }
    }
  }

  return [minY, maxY];
};

/**
 * Update the graph with new data. Data is in the format
 * [ [date1, val1, val2, ...], [date2, val1, val2, ...] if errorBars=false
 * or, if errorBars=true,
 * [ [date1, [val1,stddev1], [val2,stddev2], ...], [date2, ...], ...]
 * @param {Array.<Object>} data The data (see above)
 * @private
 */
Dygraph.prototype.drawGraph_ = function(data) {
  var minY = null, maxY = null;
  this.layout_.removeAllDatasets();
  this.setColors_();
  this.attrs_['pointSize'] = 0.5 * this.attr_('highlightCircleSize');

  // Loop over all fields in the dataset
  for (var i = 1; i < data[0].length; i++) {
    var series = [];
    for (var j = 0; j < data.length; j++) {
      var date = data[j][0];
      series[j] = [date, data[j][i]];
    }
    series = this.rollingAverage(series, this.rollPeriod_);

    // Prune down to the desired range, if necessary (for zooming)
    var bars = this.attr_("errorBars") || this.attr_("customBars");
    if (this.dateWindow_) {
      var low = this.dateWindow_[0];
      var high= this.dateWindow_[1];
      var pruned = [];
      for (var k = 0; k < series.length; k++) {
        if (series[k][0] >= low && series[k][0] <= high) {
          pruned.push(series[k]);
        }
      }
      series = pruned;
    }

    var extremes = this.extremeValues_(series);
    var thisMinY = extremes[0];
    var thisMaxY = extremes[1];
    if (!minY || thisMinY < minY) minY = thisMinY;
    if (!maxY || thisMaxY > maxY) maxY = thisMaxY;

    if (bars) {
      var vals = [];
      for (var j=0; j<series.length; j++)
        vals[j] = [series[j][0],
                   series[j][1][0], series[j][1][1], series[j][1][2]];
      this.layout_.addDataset(this.attr_("labels")[i], vals);
    } else {
      this.layout_.addDataset(this.attr_("labels")[i], series);
    }
  }

  // Use some heuristics to come up with a good maxY value, unless it's been
  // set explicitly by the user.
  if (this.valueRange_ != null) {
    this.addYTicks_(this.valueRange_[0], this.valueRange_[1]);
  } else {
    // Add some padding and round up to an integer to be human-friendly.
    var span = maxY - minY;
    var maxAxisY = maxY + 0.1 * span;
    var minAxisY = minY - 0.1 * span;

    // Try to include zero and make it minAxisY (or maxAxisY) if it makes sense.
    if (minAxisY < 0 && minY >= 0) minAxisY = 0;
    if (maxAxisY > 0 && maxY <= 0) maxAxisY = 0;

    if (this.attr_("includeZero")) {
      if (maxY < 0) maxAxisY = 0;
      if (minY > 0) minAxisY = 0;
    }

    this.addYTicks_(minAxisY, maxAxisY);
  }

  this.addXTicks_();

  // Tell PlotKit to use this new data and render itself
  this.layout_.evaluateWithError();
  this.plotter_.clear();
  this.plotter_.render();
  this.canvas_.getContext('2d').clearRect(0, 0,
                                         this.canvas_.width, this.canvas_.height);
};

/**
 * Calculates the rolling average of a data set.
 * If originalData is [label, val], rolls the average of those.
 * If originalData is [label, [, it's interpreted as [value, stddev]
 *   and the roll is returned in the same form, with appropriately reduced
 *   stddev for each value.
 * Note that this is where fractional input (i.e. '5/10') is converted into
 *   decimal values.
 * @param {Array} originalData The data in the appropriate format (see above)
 * @param {Number} rollPeriod The number of days over which to average the data
 */
Dygraph.prototype.rollingAverage = function(originalData, rollPeriod) {
  if (originalData.length < 2)
    return originalData;
  var rollPeriod = Math.min(rollPeriod, originalData.length - 1);
  var rollingData = [];
  var sigma = this.attr_("sigma");

  if (this.fractions_) {
    var num = 0;
    var den = 0;  // numerator/denominator
    var mult = 100.0;
    for (var i = 0; i < originalData.length; i++) {
      num += originalData[i][1][0];
      den += originalData[i][1][1];
      if (i - rollPeriod >= 0) {
        num -= originalData[i - rollPeriod][1][0];
        den -= originalData[i - rollPeriod][1][1];
      }

      var date = originalData[i][0];
      var value = den ? num / den : 0.0;
      if (this.attr_("errorBars")) {
        if (this.wilsonInterval_) {
          // For more details on this confidence interval, see:
          // http://en.wikipedia.org/wiki/Binomial_confidence_interval
          if (den) {
            var p = value < 0 ? 0 : value, n = den;
            var pm = sigma * Math.sqrt(p*(1-p)/n + sigma*sigma/(4*n*n));
            var denom = 1 + sigma * sigma / den;
            var low  = (p + sigma * sigma / (2 * den) - pm) / denom;
            var high = (p + sigma * sigma / (2 * den) + pm) / denom;
            rollingData[i] = [date,
                              [p * mult, (p - low) * mult, (high - p) * mult]];
          } else {
            rollingData[i] = [date, [0, 0, 0]];
          }
        } else {
          var stddev = den ? sigma * Math.sqrt(value * (1 - value) / den) : 1.0;
          rollingData[i] = [date, [mult * value, mult * stddev, mult * stddev]];
        }
      } else {
        rollingData[i] = [date, mult * value];
      }
    }
  } else if (this.attr_("customBars")) {
    var low = 0;
    var mid = 0;
    var high = 0;
    var count = 0;
    for (var i = 0; i < originalData.length; i++) {
      var data = originalData[i][1];
      var y = data[1];
      rollingData[i] = [originalData[i][0], [y, y - data[0], data[2] - y]];

      if (y && !isNaN(y)) {
        low += data[0];
        mid += y;
        high += data[2];
        count += 1;
      }
      if (i - rollPeriod >= 0) {
        var prev = originalData[i - rollPeriod];
        if (prev[1][1] && !isNaN(prev[1][1])) {
          low -= prev[1][0];
          mid -= prev[1][1];
          high -= prev[1][2];
          count -= 1;
        }
      }
      rollingData[i] = [originalData[i][0], [ 1.0 * mid / count,
                                              1.0 * (mid - low) / count,
                                              1.0 * (high - mid) / count ]];
    }
  } else {
    // Calculate the rolling average for the first rollPeriod - 1 points where
    // there is not enough data to roll over the full number of days
    var num_init_points = Math.min(rollPeriod - 1, originalData.length - 2);
    if (!this.attr_("errorBars")){
      if (rollPeriod == 1) {
        return originalData;
      }

      for (var i = 0; i < originalData.length; i++) {
        var sum = 0;
        var num_ok = 0;
        for (var j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
          var y = originalData[j][1];
          if (!y || isNaN(y)) continue;
          num_ok++;
          sum += originalData[j][1];
        }
        if (num_ok) {
          rollingData[i] = [originalData[i][0], sum / num_ok];
        } else {
          rollingData[i] = [originalData[i][0], null];
        }
      }

    } else {
      for (var i = 0; i < originalData.length; i++) {
        var sum = 0;
        var variance = 0;
        var num_ok = 0;
        for (var j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
          var y = originalData[j][1][0];
          if (!y || isNaN(y)) continue;
          num_ok++;
          sum += originalData[j][1][0];
          variance += Math.pow(originalData[j][1][1], 2);
        }
        if (num_ok) {
          var stddev = Math.sqrt(variance) / num_ok;
          rollingData[i] = [originalData[i][0],
                            [sum / num_ok, sigma * stddev, sigma * stddev]];
        } else {
          rollingData[i] = [originalData[i][0], [null, null, null]];
        }
      }
    }
  }

  return rollingData;
};

/**
 * Parses a date, returning the number of milliseconds since epoch. This can be
 * passed in as an xValueParser in the Dygraph constructor.
 * TODO(danvk): enumerate formats that this understands.
 * @param {String} A date in YYYYMMDD format.
 * @return {Number} Milliseconds since epoch.
 * @public
 */
Dygraph.dateParser = function(dateStr, self) {
  var dateStrSlashed;
  var d;
  if (dateStr.length == 10 && dateStr.search("-") != -1) {  // e.g. '2009-07-12'
    dateStrSlashed = dateStr.replace("-", "/", "g");
    while (dateStrSlashed.search("-") != -1) {
      dateStrSlashed = dateStrSlashed.replace("-", "/");
    }
    d = Date.parse(dateStrSlashed);
  } else if (dateStr.length == 8) {  // e.g. '20090712'
    // TODO(danvk): remove support for this format. It's confusing.
    dateStrSlashed = dateStr.substr(0,4) + "/" + dateStr.substr(4,2)
                       + "/" + dateStr.substr(6,2);
    d = Date.parse(dateStrSlashed);
  } else {
    // Any format that Date.parse will accept, e.g. "2009/07/12" or
    // "2009/07/12 12:34:56"
    d = Date.parse(dateStr);
  }

  if (!d || isNaN(d)) {
    self.error("Couldn't parse " + dateStr + " as a date");
  }
  return d;
};

/**
 * Detects the type of the str (date or numeric) and sets the various
 * formatting attributes in this.attrs_ based on this type.
 * @param {String} str An x value.
 * @private
 */
Dygraph.prototype.detectTypeFromString_ = function(str) {
  var isDate = false;
  if (str.indexOf('-') >= 0 ||
      str.indexOf('/') >= 0 ||
      isNaN(parseFloat(str))) {
    isDate = true;
  } else if (str.length == 8 && str > '19700101' && str < '20371231') {
    // TODO(danvk): remove support for this format.
    isDate = true;
  }

  if (isDate) {
    this.attrs_.xValueFormatter = Dygraph.dateString_;
    this.attrs_.xValueParser = Dygraph.dateParser;
    this.attrs_.xTicker = Dygraph.dateTicker;
  } else {
    this.attrs_.xValueFormatter = function(x) { return x; };
    this.attrs_.xValueParser = function(x) { return parseFloat(x); };
    this.attrs_.xTicker = Dygraph.numericTicks;
  }
};

/**
 * Parses a string in a special csv format.  We expect a csv file where each
 * line is a date point, and the first field in each line is the date string.
 * We also expect that all remaining fields represent series.
 * if the errorBars attribute is set, then interpret the fields as:
 * date, series1, stddev1, series2, stddev2, ...
 * @param {Array.<Object>} data See above.
 * @private
 *
 * @return Array.<Object> An array with one entry for each row. These entries
 * are an array of cells in that row. The first entry is the parsed x-value for
 * the row. The second, third, etc. are the y-values. These can take on one of
 * three forms, depending on the CSV and constructor parameters:
 * 1. numeric value
 * 2. [ value, stddev ]
 * 3. [ low value, center value, high value ]
 */
Dygraph.prototype.parseCSV_ = function(data) {
  var ret = [];
  var lines = data.split("\n");

  // Use the default delimiter or fall back to a tab if that makes sense.
  var delim = this.attr_('delimiter');
  if (lines[0].indexOf(delim) == -1 && lines[0].indexOf('\t') >= 0) {
    delim = '\t';
  }

  var start = 0;
  if (this.labelsFromCSV_) {
    start = 1;
    this.attrs_.labels = lines[0].split(delim);
  }

  var xParser;
  var defaultParserSet = false;  // attempt to auto-detect x value type
  var expectedCols = this.attr_("labels").length;
  for (var i = start; i < lines.length; i++) {
    var line = lines[i];
    if (line.length == 0) continue;  // skip blank lines
    if (line[0] == '#') continue;    // skip comment lines
    var inFields = line.split(delim);
    if (inFields.length < 2) continue;

    var fields = [];
    if (!defaultParserSet) {
      this.detectTypeFromString_(inFields[0]);
      xParser = this.attr_("xValueParser");
      defaultParserSet = true;
    }
    fields[0] = xParser(inFields[0], this);

    // If fractions are expected, parse the numbers as "A/B"
    if (this.fractions_) {
      for (var j = 1; j < inFields.length; j++) {
        // TODO(danvk): figure out an appropriate way to flag parse errors.
        var vals = inFields[j].split("/");
        fields[j] = [parseFloat(vals[0]), parseFloat(vals[1])];
      }
    } else if (this.attr_("errorBars")) {
      // If there are error bars, values are (value, stddev) pairs
      for (var j = 1; j < inFields.length; j += 2)
        fields[(j + 1) / 2] = [parseFloat(inFields[j]),
                               parseFloat(inFields[j + 1])];
    } else if (this.attr_("customBars")) {
      // Bars are a low;center;high tuple
      for (var j = 1; j < inFields.length; j++) {
        var vals = inFields[j].split(";");
        fields[j] = [ parseFloat(vals[0]),
                      parseFloat(vals[1]),
                      parseFloat(vals[2]) ];
      }
    } else {
      // Values are just numbers
      for (var j = 1; j < inFields.length; j++) {
        fields[j] = parseFloat(inFields[j]);
      }
    }
    ret.push(fields);

    if (fields.length != expectedCols) {
      this.error("Number of columns in line " + i + " (" + fields.length +
                 ") does not agree with number of labels (" + expectedCols +
                 ") " + line);
    }
  }
  return ret;
};

/**
 * The user has provided their data as a pre-packaged JS array. If the x values
 * are numeric, this is the same as dygraphs' internal format. If the x values
 * are dates, we need to convert them from Date objects to ms since epoch.
 * @param {Array.<Object>} data
 * @return {Array.<Object>} data with numeric x values.
 */
Dygraph.prototype.parseArray_ = function(data) {
  // Peek at the first x value to see if it's numeric.
  if (data.length == 0) {
    this.error("Can't plot empty data set");
    return null;
  }
  if (data[0].length == 0) {
    this.error("Data set cannot contain an empty row");
    return null;
  }

  if (this.attr_("labels") == null) {
    this.warn("Using default labels. Set labels explicitly via 'labels' " +
              "in the options parameter");
    this.attrs_.labels = [ "X" ];
    for (var i = 1; i < data[0].length; i++) {
      this.attrs_.labels.push("Y" + i);
    }
  }

  if (Dygraph.isDateLike(data[0][0])) {
    // Some intelligent defaults for a date x-axis.
    this.attrs_.xValueFormatter = Dygraph.dateString_;
    this.attrs_.xTicker = Dygraph.dateTicker;

    // Assume they're all dates.
    var parsedData = Dygraph.clone(data);
    for (var i = 0; i < data.length; i++) {
      if (parsedData[i].length == 0) {
        this.error("Row " << (1 + i) << " of data is empty");
        return null;
      }
      if (parsedData[i][0] == null
          || typeof(parsedData[i][0].getTime) != 'function') {
        this.error("x value in row " << (1 + i) << " is not a Date");
        return null;
      }
      parsedData[i][0] = parsedData[i][0].getTime();
    }
    return parsedData;
  } else {
    // Some intelligent defaults for a numeric x-axis.
    this.attrs_.xValueFormatter = function(x) { return x; };
    this.attrs_.xTicker = Dygraph.numericTicks;
    return data;
  }
};

/**
 * Parses a DataTable object from gviz.
 * The data is expected to have a first column that is either a date or a
 * number. All subsequent columns must be numbers. If there is a clear mismatch
 * between this.xValueParser_ and the type of the first column, it will be
 * fixed. Returned value is in the same format as return value of parseCSV_.
 * @param {Array.<Object>} data See above.
 * @private
 */
Dygraph.prototype.parseDataTable_ = function(data) {
  var cols = data.getNumberOfColumns();
  var rows = data.getNumberOfRows();

  // Read column labels
  var labels = [];
  for (var i = 0; i < cols; i++) {
    labels.push(data.getColumnLabel(i));
  }
  this.attrs_.labels = labels;

  var indepType = data.getColumnType(0);
  if (indepType == 'date') {
    this.attrs_.xValueFormatter = Dygraph.dateString_;
    this.attrs_.xValueParser = Dygraph.dateParser;
    this.attrs_.xTicker = Dygraph.dateTicker;
  } else if (indepType == 'number') {
    this.attrs_.xValueFormatter = function(x) { return x; };
    this.attrs_.xValueParser = function(x) { return parseFloat(x); };
    this.attrs_.xTicker = Dygraph.numericTicks;
  } else {
    this.error("only 'date' and 'number' types are supported for column 1 " +
               "of DataTable input (Got '" + indepType + "')");
    return null;
  }

  var ret = [];
  for (var i = 0; i < rows; i++) {
    var row = [];
    if (!data.getValue(i, 0)) continue;
    if (indepType == 'date') {
      row.push(data.getValue(i, 0).getTime());
    } else {
      row.push(data.getValue(i, 0));
    }
    for (var j = 1; j < cols; j++) {
      row.push(data.getValue(i, j));
    }
    ret.push(row);
  }
  return ret;
}

// These functions are all based on MochiKit.
Dygraph.update = function (self, o) {
  if (typeof(o) != 'undefined' && o !== null) {
    for (var k in o) {
      self[k] = o[k];
    }
  }
  return self;
};

Dygraph.isArrayLike = function (o) {
  var typ = typeof(o);
  if (
      (typ != 'object' && !(typ == 'function' && 
        typeof(o.item) == 'function')) ||
      o === null ||
      typeof(o.length) != 'number' ||
      o.nodeType === 3
     ) {
    return false;
  }
  return true;
};

Dygraph.isDateLike = function (o) {
  if (typeof(o) != "object" || o === null ||
      typeof(o.getTime) != 'function') {
    return false;
  }
  return true;
};

Dygraph.clone = function(o) {
  // TODO(danvk): figure out how MochiKit's version works
  var r = [];
  for (var i = 0; i < o.length; i++) {
    if (Dygraph.isArrayLike(o[i])) {
      r.push(Dygraph.clone(o[i]));
    } else {
      r.push(o[i]);
    }
  }
  return r;
};


/**
 * Get the CSV data. If it's in a function, call that function. If it's in a
 * file, do an XMLHttpRequest to get it.
 * @private
 */
Dygraph.prototype.start_ = function() {
  if (typeof this.file_ == 'function') {
    // CSV string. Pretend we got it via XHR.
    this.loadedEvent_(this.file_());
  } else if (Dygraph.isArrayLike(this.file_)) {
    this.rawData_ = this.parseArray_(this.file_);
    this.drawGraph_(this.rawData_);
  } else if (typeof this.file_ == 'object' &&
             typeof this.file_.getColumnRange == 'function') {
    // must be a DataTable from gviz.
    this.rawData_ = this.parseDataTable_(this.file_);
    this.drawGraph_(this.rawData_);
  } else if (typeof this.file_ == 'string') {
    // Heuristic: a newline means it's CSV data. Otherwise it's an URL.
    if (this.file_.indexOf('\n') >= 0) {
      this.loadedEvent_(this.file_);
    } else {
      var req = new XMLHttpRequest();
      var caller = this;
      req.onreadystatechange = function () {
        if (req.readyState == 4) {
          if (req.status == 200) {
            caller.loadedEvent_(req.responseText);
          }
        }
      };

      req.open("GET", this.file_, true);
      req.send(null);
    }
  } else {
    this.error("Unknown data format: " + (typeof this.file_));
  }
};

/**
 * Changes various properties of the graph. These can include:
 * <ul>
 * <li>file: changes the source data for the graph</li>
 * <li>errorBars: changes whether the data contains stddev</li>
 * </ul>
 * @param {Object} attrs The new properties and values
 */
Dygraph.prototype.updateOptions = function(attrs) {
  // TODO(danvk): this is a mess. Rethink this function.
  if (attrs.rollPeriod) {
    this.rollPeriod_ = attrs.rollPeriod;
  }
  if (attrs.dateWindow) {
    this.dateWindow_ = attrs.dateWindow;
  }
  if (attrs.valueRange) {
    this.valueRange_ = attrs.valueRange;
  }
  Dygraph.update(this.user_attrs_, attrs);

  this.labelsFromCSV_ = (this.attr_("labels") == null);

  // TODO(danvk): this doesn't match the constructor logic
  this.layout_.updateOptions({ 'errorBars': this.attr_("errorBars") });
  if (attrs['file'] && attrs['file'] != this.file_) {
    this.file_ = attrs['file'];
    this.start_();
  } else {
    this.drawGraph_(this.rawData_);
  }
};

/**
 * Adjusts the number of days in the rolling average. Updates the graph to
 * reflect the new averaging period.
 * @param {Number} length Number of days over which to average the data.
 */
Dygraph.prototype.adjustRoll = function(length) {
  this.rollPeriod_ = length;
  this.drawGraph_(this.rawData_);
};

/**
 * Create a new canvas element. This is more complex than a simple
 * document.createElement("canvas") because of IE and excanvas.
 */
Dygraph.createCanvas = function() {
  var canvas = document.createElement("canvas");

  isIE = (/MSIE/.test(navigator.userAgent) && !window.opera);
  if (isIE) {
    canvas = G_vmlCanvasManager.initElement(canvas);
  }

  return canvas;
};


/**
 * A wrapper around Dygraph that implements the gviz API.
 * @param {Object} container The DOM object the visualization should live in.
 */
Dygraph.GVizChart = function(container) {
  this.container = container;
}

Dygraph.GVizChart.prototype.draw = function(data, options) {
  this.container.innerHTML = '';
  this.date_graph = new Dygraph(this.container, data, options);
}

// Older pages may still use this name.
DateGraph = Dygraph;

}


/**************** content/js/ext/rgbcolor.js *****************/
/**
 * A class to parse color values
 *
 * NOTE: modified by danvk. I removed the "getHelpXML" function to reduce the
 * file size.
 *
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
function RGBColor(color_string)
{
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }


}

return myOverlay
})();
