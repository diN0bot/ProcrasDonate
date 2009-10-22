
    Template.compile(["<ul>\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li id=\"", ["var", ["item", "id"], []], "\"\n\t\t\tclass=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["var", ["item", "value"], []], "</li>\n\t"]], "\n</ul>\n"], "clickable_substate_menu");
    