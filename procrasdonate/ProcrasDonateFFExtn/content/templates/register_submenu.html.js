
    Template.compile(["<div id=\"", ["var", ["submenu_id"], []], "\" class=\"extn_submenu\">\n", "\n\t<ul>\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["<a href=\"", ["var", ["item", "url"], []], "\">"], []], "\n\t\t\t\t<img src=\"", ["var", ["item", "img"], []], "\" />\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["</a>"], []], "\n\t\t</li>\n\t\t<li class=\"bar\">\n\t\t\t", ["if", [[true, ["var", ["forloop", "last"], []]]], 1, ["\n\t\t\t\t<img src=\"", ["var", ["item", "bar"], []], "\" />\n\t\t\t"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n\t\n", "\n\t<ul class=\"menu_text\">\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["<a href=\"", ["var", ["item", "url"], []], "\">"], []], "\n\t\t\t\t", ["var", ["item", "value"], []], "\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["</a>"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n</div>\n\n", ["if", [[false, ["var", ["substate_menu_items", "prev"], []]]], 1, ["\n\t", ["if", [[false, ["var", ["substate_menu_items", "prev", "url"], []]]], 1, ["<a href=\"", ["var", ["substate_menu_items", "prev", "url"], []], "\">"], []], "\n\t\t<img\n\t\t  id=\"", ["var", ["substate_menu_items", "prev", "id"], []], "\"\n\t\t  class=\"prev\"\n\t\t  src=\"/procrasdonate_media/img/BackArrow.png\" />\n  ", ["if", [[false, ["var", ["substate_menu_items", "prev", "url"], []]]], 1, ["</a>"], []], "\n"], ["\n\t", ["if", [[true, ["var", ["substate_menu_items", "no_spacers"], []]]], 1, ["\n\t<img\n\t  id=\"\"\n\t  class=\"prev\"\n\t  src=\"/procrasdonate_media/img/Spacer.png\" />\n\t"], []], "\n"]], "\n\n", ["if", [[false, ["var", ["substate_menu_items", "next"], []]]], 1, ["\n\t", ["ifequal", ["var", ["substate_menu_items", "next", "value"], []], ["var", "XXX", []], ["\n\t\t<img\n\t\t  id=\"", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\t\t  class=\"done\"\n\t\t  src=\"/procrasdonate_media/img/DoneButton.png\" />\n\t"], ["\n\t\t", ["if", [[false, ["var", ["substate_menu_items", "next", "url"], []]]], 1, ["<a href=\"", ["var", ["substate_menu_items", "next", "url"], []], "\">"], []], "\n\t\t\t<img\n\t\t\t  id=\"", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\t\t\t  class=\"next\"\n\t\t\t  src=\"/procrasdonate_media/img/NextArrow.png\" />\n\t\t", ["if", [[false, ["var", ["substate_menu_items", "next", "url"], []]]], 1, ["</a>"], []], "\n\t"]], "\n"], ["\n\t", ["if", [[true, ["var", ["substate_menu_items", "no_spacers"], []]]], 1, ["\n\t<img\n\t  id=\"\"\n\t  class=\"next\"\n\t  src=\"/procrasdonate_media/img/Spacer.png\" />\n\t"], []], "\n"]], "\n\n"], "register_submenu");
    