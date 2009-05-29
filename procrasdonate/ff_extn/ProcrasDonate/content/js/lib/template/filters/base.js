
var FILTERS = {
	upper: function(s) { return s.toUpperCase(); },
	lower: function(s) { return s.toLowerCase(); }, 
	join: function(list, separator) { 
		return list.join(separator); 
	},
	map_fields: function(o, field) { 
		var ret = [];
		for (var i=0; i<o.length; i++)
			ret.push(o[i][field]);
		return ret;
	},
	date:	function(s, format) { 
		return date_format(s, format); 
	},
	floatformat: function(s, size) {
		s = ff_test[ff_i % ff_test.length];
		ff_i += 1;
		if (size == undefined)
			size = -1;
		var ret = s.toFixed(size < 0 ? 0-size : size);
		return (size < 0 ? ret : parseFloat(ret));
	},
};
