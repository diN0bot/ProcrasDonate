
    Template.compile(["<h1>My Impact</h1>\n\n<h2>Donations and Pledges</h2>\n\n<ul id=\"impact_submenu\">\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li id=\"", ["var", ["item", "id"], []], "\"\n\t\t\tclass=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["var", ["item", "value"], []], "</li>\n\t"]], "\n</ul>\n\n<table id=\"impact_table\" cellspacing=\"0\">\n<thead>\n\t<tr>\n\t\t", ["for", ["header"], ["var", ["table_headers"], []], false, ["\n\t\t\t<th>", ["var", ["header"], []], "</th>\n\t\t"]], "\n\t</tr>\n</thead>\n<tbody>\n\t", ["for", ["row"], ["var", ["table_rows"], []], false, ["\n\t<tr class=\"", ["if", [[false, ["var", ["forloop", "is_odd"], []]]], 1, ["odd"], ["even"]], "\">\n\t\t", ["for", ["cell"], ["var", ["row"], []], false, ["\n\t\t\t<td>", ["var", ["cell"], []], "</td>\n\t\t"]], "\n\t</tr>\n\t"]], "\n</tbody>\n</table>\n"], "impact_middle");
    