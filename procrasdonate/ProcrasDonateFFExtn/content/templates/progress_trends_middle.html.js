
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n<h3>Trends</h3>\n\n<p>Plot of daily totals in hours over time</p>\n\n<div class=\"trend_title\"><span id=\"trend_title_A\">", ["var", ["A_label"], []], "</span> \n\t<span id=\"trend_title_and\">", ["if", [[false, ["var", ["B_label"], []]]], 1, ["and"], []], "</span>\n\t<span id=\"trend_title_B\">", ["if", [[false, ["var", ["B_label"], []]]], 1, [["var", ["B_label"], []]], []], "</span>\n\ttrend</div>\n<div id=\"legend\"></div>\n<div class=\"trend_yaxis\">Hours</div>\n<div id=\"trend_chart\"></div>\n<div class=\"trend_xaxis\">Days</div>\n\n<h3>Select data to view</h3>\n<p>At most 2 trends can be graphed simultaneously.</p>\n\n<div class=\"trend_list tag_list\" alt=\"", ["var", ["tagtype", "id"], []], "\" >\n<h4>Classification totals</h4>\n<ul>\n\t<li><input type=\"checkbox\" class=\"", ["var", ["ProcrasDonate", "id"], []], "\" checked value=\"ProcrasDonate\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" />\n\t\tProcrasDonate\n\t</li>\n\t<li>\n\t\t<input type=\"checkbox\" class=\"", ["var", ["TimeWellSpent", "id"], []], "\" checked value=\"TimeWellSpent\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" />\n\t\tTimeWellSpent\n\t</li>\n\t<li>\n\t\t<input type=\"checkbox\" class=\"", ["var", ["Unsorted", "id"], []], "\" value=\"Unsorted\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/UnsortedIcon.png\" />\n\t\tUnsorted\n\t</li>\n</ul>\n</div>\n\n<div class=\"trend_list sitegroup_list\" alt=\"", ["var", ["sitegrouptype", "id"], []], "\">\n<h4>Most visited websites</h4>\n<ul>\n\t", ["for", ["t"], ["var", ["sitegroup_totals"], []], false, [" \n\t\t<li title=\"", ["var", ["t", "sitegroup", "host"], []], "\">\n\t\t\t<input type=\"checkbox\" class=\"", ["var", ["t", "sitegroup", "id"], []], "\" value=\"", ["var", ["t", "sitegroup", "host"], []], "\" />\n\t\t\t<img src=\"", ["var", ["t", "sitegroup", "tag", "icon"], []], "\" />\n\t\t\t", ["var", ["t", "hours_int"], []], " hours: ", ["var", ["t", "sitegroup", "host"], []], "\n\t\t</li>\n\t"]], " \n</ul>\n</div>\n"], "progress_trends_middle");
    