
    Template.compile(["<h2>My Messages</h2>\n\n<ul id=\"report_list\">\n\t", ["for", ["report"], ["var", ["reports"], []], false, ["\n\t\t<li id=\"report_", ["var", ["report", "id"], []], "\" class=\"report\">\n\t\t\t<div class=\"is_read_holder ", ["if", [[false, ["var", ["report", "is_read"], []]]], 1, ["is_read"], []], "\">\n\t\t\t\t", ["if", [[true, ["var", ["report", "is_read"], []]]], 1, ["\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/Dash.png\" />\n\t\t\t\t"], []], "\n\t\t\t</div>\n\t\t\t<div class=\"open_close_arrow is_closed\">\n\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/RightArrow.png\" />\n\t\t\t</div>\n\t\t\t<div class=\"report_meta\">", ["var", ["report", "friendly_datetime"], []], "</div>\n\t\t\t<div class=\"subject\">", ["var", ["report", "subject"], []], "</div>\n\t\t\t<div class=\"report_message\">", ["var", ["report", "message"], []], "</div> \n\t\t</li>\n\t"]], "\n</ul>\n"], "messages_all_middle");
    