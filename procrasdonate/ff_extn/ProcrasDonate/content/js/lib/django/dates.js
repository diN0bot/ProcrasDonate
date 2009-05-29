

function _(s) { return s; }

WEEKDAYS = {
    0:_('Monday'), 1:_('Tuesday'), 2:_('Wednesday'), 3:_('Thursday'), 4:_('Friday'),
    5:_('Saturday'), 6:_('Sunday')
}
WEEKDAYS_ABBR = {
    0:_('Mon'), 1:_('Tue'), 2:_('Wed'), 3:_('Thu'), 4:_('Fri'),
    5:_('Sat'), 6:_('Sun')
}
WEEKDAYS_REV = {
    'monday':0, 'tuesday':1, 'wednesday':2, 'thursday':3, 'friday':4,
    'saturday':5, 'sunday':6
}
MONTHS = {
    1:_('January'), 2:_('February'), 3:_('March'), 4:_('April'), 5:_('May'), 6:_('June'),
    7:_('July'), 8:_('August'), 9:_('September'), 10:_('October'), 11:_('November'),
    12:_('December')
}
MONTHS_3 = {
    1:_('jan'), 2:_('feb'), 3:_('mar'), 4:_('apr'), 5:_('may'), 6:_('jun'),
    7:_('jul'), 8:_('aug'), 9:_('sep'), 10:_('oct'), 11:_('nov'), 12:_('dec')
}
MONTHS_3_REV = {
    'jan':1, 'feb':2, 'mar':3, 'apr':4, 'may':5, 'jun':6, 'jul':7, 'aug':8,
    'sep':9, 'oct':10, 'nov':11, 'dec':12
}
MONTHS_AP = { // month names in Associated Press style
    1:_('Jan.'), 2:_('Feb.'), 3:_('March'), 4:_('April'), 5:_('May'), 6:_('June'), 7:_('July'),
    8:_('Aug.'), 9:_('Sept.'), 10:_('Oct.'), 11:_('Nov.'), 12:_('Dec.')
}


function to_date(value) {
	if (isString(value)) {
    // Convert strings of form "2007-10-06 08:17:56" to Date() objects
		// Is this cross-browser compatible?
		return new Date(value.replace(/-/g,'/'));
  } else {
    if (DEBUG_TEMPLATES)
			Error("Invalid argument in to_date(): '"+value+"'");
		return new Date();
  }
}

function cap(s) {
  return s.substr(0,1).toUpperCase()+s.substr(1);
}

function date_format(value, arg) {
  if (arg == undefined) {
    arg = settings.DATE_FORMAT;
  }
  var t = to_date(value);
  var out = "";
  for (var i=0; i<arg.length; i++) {
    var c = arg[i];
    switch (c) {
      case '\\': i++;
      
      break; case 'a': out += (t.getHours() > 11 ? 'p.m.' : 'a.m.');
      break; case 'A': out += (t.getHours() > 11 ? 'PM' : 'AM');
      break; case 'B': RAISE("Not implemented!");
      break; case 'f': RAISE("Not implemented!");
      break; case 'g': var h=t.getHours(); h = (h==0 ? "12" : (h > 12 ? h-12 : h)); out += h.toString();
      break; case 'G': out += t.getHours().toString();
      break; case 'h': var h=t.getHours(); out += (h<10 ? "0"+h.toString() : h.toString());
      break; case 'H': 
        var h=t.getHours(); 
        h = (h==0 ? "12" : (h > 12 ? h-12 : h)); 
        out += (h<10 ? "0"+h.toString() : h.toString());
      break; case 'i': var h=t.getMinutes(); out += (h<10 ? "0"+h.toString() : h.toString());
      break; case 'P': RAISE("Not implemented!");
      break; case 's': var h=t.getSeconds(); out += (h<10 ? "0"+h.toString() : h.toString());
      
      break; case 'b': out += MONTHS_3[t.getMonth()+1];
      break; case 'd': var h=t.getDate(); out += (h<10 ? "0"+h.toString() : h.toString());
      break; case 'D': out += cap(WEEKDAYS_ABBR[t.getDay()]);
      break; case 'F': out += cap(MONTHS[t.getMonth()+1]);
      break; case 'I': RAISE("Not implemented!");
      break; case 'j': out += t.getDate().toString();
      break; case 'l': out += WEEKDAYS[t.getDay()];
      break; case 'L': RAISE("Not implemented!");
      break; case 'm': var h=t.getMonth()+1; out += (h<10 ? "0"+h.toString() : h.toString());
      break; case 'M': out += cap(MONTHS_3[t.getMonth()+1]);
      break; case 'n': out += (t.getMonth()+1).toString();
      break; case 'N': out += MONTHS_AP[t.getMonth()+1];
      break; case 'O': RAISE("Not implemented!");
      break; case 'r': RAISE("Not implemented!");
      break; case 'S': 
        var h=t.getDate(); 
        out += (h==11||h==12||h==13 ? "th" : 
                (h%10==1 ? "st" : 
                 (h%10==2 ? "nd" : 
                  (h%10==3 ? "rd" : "th"))));
      break; case 't': RAISE("Not implemented!");
      break; case 'T': RAISE("Not implemented!");
      break; case 'U': RAISE("Not implemented!");
      break; case 'w': out += t.getDay().toString();
      break; case 'W': RAISE("Not implemented!");
      break; case 'y': var h=t.getYear() % 100; out += (h<10 ? "0"+h.toString() : h.toString());
      break; case 'Y': out += t.getFullYear().toString();
      break; case 'z': RAISE("Not implemented!");
      break; case 'Z': RAISE("Not implemented!");
      break; default: out += c;
    }
  }
  return out;
}
