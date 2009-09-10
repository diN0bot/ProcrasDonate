
function signaturize_query(query, secret_key) {
	// turn into pairs
	var ordered = [];
	var lowercased = {};
	for ( var name in query ) {
		var lowered = name.toLowerCase();
		ordered.push( lowered );
		lowercased[lowered] = query[name];
	}
	ordered = ordered.sort();
	
	var qstr = "";
	for ( var i = 0; i < ordered.length; i++ ) {
		qstr += ordered[i]+lowercased[name];
	}
	
	// calculate the signature
	var signature = sign(secret_key, qstr);
	
	// PYTHON     z/RodgBDqU0O6HnZX/YtynDV6QU=
	//     JS     E%2BAgbtn05bIS9AILzDfqhYivWZ85u9qC2cJdPm6vnPg%3D
	
	// update query
	query["awsSignature"] = signature;

	return query;
}

function encodeNameValuePairs(pairs) {
	for ( var i = 0; i < pairs.length; i++) {
		var name = "";
		var value = "";

		var pair = pairs[i];
		var index = pair.indexOf("=");

		// take care of special cases like "&foo&", "&foo=&" and "&=foo&"
		if (index == -1) {
			name = pair;
		} else if (index == 0) {
			value = pair;
		} else {
			name = pair.substring(0, index);
			if (index < pair.length - 1) {
				value = pair.substring(index + 1);
			}
		}

		// decode and encode to make sure we undo any incorrect encoding
		name = encodeURIComponent(decodeURIComponent(name));

		value = value.replace(/\+/g, "%20");
		value = encodeURIComponent(decodeURIComponent(value));

		pairs[i] = name + "=" + value;
	}

	return pairs;
}


function sign(secret, message) {
	var messageBytes = str2binb(message);
	var secretBytes = str2binb(secret);

	if (secretBytes.length > 16) {
		secretBytes = core_sha256(secretBytes, secret.length * chrsz);
	}

	var ipad = Array(16), opad = Array(16);
	for ( var i = 0; i < 16; i++) {
		ipad[i] = secretBytes[i] ^ 0x36363636;
		opad[i] = secretBytes[i] ^ 0x5C5C5C5C;
	}

	var imsg = ipad.concat(messageBytes);
	var ihash = core_sha256(imsg, 512 + message.length * chrsz);
	var omsg = opad.concat(ihash);
	var ohash = core_sha256(omsg, 512 + 256);

	var b64hash = binb2b64(ohash);
	var urlhash = encodeURIComponent(b64hash);

	return urlhash;
}

Date.prototype.toISODate = new Function("with (this)\n    return "
		+ "getFullYear()+'-'+addZero(getMonth()+1)+'-'"
		+ "+addZero(getDate())+'T'+addZero(getHours())+':'"
		+ "+addZero(getMinutes())+':'+addZero(getSeconds())+'.000Z'");

function addZero(n) {
	return (n < 0 || n > 9 ? "" : "0") + n;
}

function getNowTimeStamp() {
	var time = new Date();
	var gmtTime = new Date(time.getTime() + (time.getTimezoneOffset() * 60000));
	return gmtTime.toISODate();
}
