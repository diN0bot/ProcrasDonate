
    Template.compile(["<style> \n<!--\n\t#procrasdonate_extn_top_bar {\n\t\tbackground-color: #f2e3f7;\n\t\tcolor: #000000;\n\t\tfont-size: 12px;\n\t\tmargin: 0 0 0 0;\n\t\tpadding: 4px 0px;\n\t\ttext-align: center;\n\t\theight: 24px;\n\t}\n\t\n\t#procrasdonate_extn_top_bar img {\n\t\tfloat: left;\n\t\tmargin-left: 10px;\n\t}\n\t\n\t#procrasdonate_extn_top_bar a {\n\t\tcolor: blue;\n\t\ttext-decoration: underline;\n\t\tborder: none;\n\t}\n\t\n\t#close_procrasdonate_extn_top_bar {\n\t\tfloat: right;\n\t\tcursor: pointer;\n\t\tmargin: 4px 10px;\n\t}\n-->\n</style>\n   \n <div id=\"procrasdonate_extn_top_bar\">\n \t<a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "PROGRESS_URL"], []], "\">\n \t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" />\n \t</a>\n \t<div id=\"close_procrasdonate_extn_top_bar\">[x]</div>\n \t\n \t<p>\n\t\t", ["if", [[true, ["var", ["latest_report", "is_read"], []]]], 1, ["\n\t\t\t<a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MESSAGES_URL"], []], "\">New progress report.</a>\n\t\t"], ["\n\t\t\tGood work!\n\t\t"]], "\n\t</p>\n\t", ["nop"], "\n</div>\n"], "top_bar");
    