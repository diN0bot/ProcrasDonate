
    Template.compile(["<div id=\"register_track\">\n", "\n\t<ul>\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t<img src=\"", ["var", ["item", "img"], []], "\" />\n\t\t</li>\n\t\t<li class=\"bar\">\n\t\t\t", ["if", [[true, ["var", ["forloop", "last"], []]]], 1, ["\n\t\t\t\t<img src=\"", ["var", ["item", "bar"], []], "\" />\n\t\t\t"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n\t\n", "\n\t<ul class=\"menu_text\">\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["var", ["item", "value"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n</div>\n\n", ["if", [[false, ["var", ["substate_menu_items", "prev"], []]]], 1, ["\n<img\n  id=\"", ["var", ["substate_menu_items", "prev", "id"], []], "\"\n  class=\"prev\"\n  src=\"/procrasdonate_media/img/BackArrow.png\" />\n"], ["\n<img\n  id=\"", ["var", ["substate_menu_items", "prev", "id"], []], "\"\n  class=\"prev\"\n  src=\"/procrasdonate_media/img/Spacer.png\" />\n"]], "\n\n", ["ifequal", ["var", ["substate_menu_items", "next", "value"], []], ["var", "XXX", []], ["\n<img\n  id=\"", ["var", ["substate_menu_items", "next", "id"], []], "\"\n  class=\"done\"\n  src=\"/procrasdonate_media/img/DoneButton.png\" />\n"], ["\n\t", ["if", [[false, ["var", ["substate_menu_items", "next"], []]]], 1, ["\n\t<img\n\t  id=\"", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\t  class=\"next\"\n\t  src=\"/procrasdonate_media/img/NextArrow.png\" />\n\t"], []], "\n"]], "\n"], "register_submenu");
    