
    Template.compile([["var", ["substate_menu"], []], "\n\n<form method=\"post\" action=\"", ["var", ["action"], []], "\">\n\t", ["for", ["param"], ["var", ["form_params"], []], false, ["\n\t\t<input\n\t\t\ttype=\"hidden\"\n\t\t\tname=\"", ["var", ["param", "name"], []], "\"\n\t\t\tvalue=\"", ["var", ["param", "value"], []], "\"\n\t\t\tclass=\"", ["var", ["param", "name"], []], "\" />\n\t"]], "\n\t<input\n\t\ttype=\"image\"\n\t\tclass=\"go_to_amazon_button\"\n\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/GoAmazonButton.png\"\n\t\tid=\"top_go_to_amazon_button\" />\n</form>\n\n<div id=\"multi_auth_status\">\n\t", ["var", ["multi_auth_status"], []], "\n</div>\n\n<h1>Approving payments</h1>\n<p>Your final step is to automate turning pledges into payments.</p>\n<ul>\n\t<li>Payments to registered 501c3 non-profits will be fully tax deductible.</li>\n\t<li>Payments will be fully refundable up to 30 days after they are made.</li>\n\t<li>No one else will be able to make payments on your behalf.</li>\n</ul>\n\n", ["if", [[true, ["var", ["multi_auth"], []]], [true, ["var", ["multiuse", "good_to_go"], []]]], 1, ["\n\t<p>Click on <span id=\"go_to_amazon\" class=\"link\">Go to Amazon to approve payments</span>\n\t\twhen you are ready.</p>\n\t\n\t<h2>Determining an overall limit</h2>\n\t<p>How often do you want to have to re-authorize payments for your account?</p>\n\t<p>Once every <input\n\t\ttype=\"text\"\n\t\tid=\"min_auth_time_input\"\n\t\tclass=\"min_auth_time\"\n\t\tname=\"min_auth_time\" \n\t\tvalue=\"", ["var", ["min_auth_time", "time"], []], "\" />\n\t\t<span class=\"units min_auth_units\">", ["var", ["min_auth_time", "units"], []], "</span>\n\t   </p>\n\t\n\t<p>You will donate <i>at most</i>\n\t\t<b>$<span id=\"max_amount_paid\">", ["var", ["max_amount_paid"], []], "</span></b>\n\t\t\n\t\tin <span id=\"min_auth_time_display\">", ["var", ["min_auth_time", "time"], []], "</span>\n\t\t<span id=\"min_auth_units_display\">", ["var", ["min_auth_time", "units"], []], "</span>,\n\t\t\n\t\tbased on your\n\t\tProcrasDonation rate of $", ["var", ["pd_dollars_per_hr"], []], " per hour and limit of\n\t\t", ["var", ["pd_hr_per_week_max"], []], " hours per week.</p>\n\t\n\t\t<form method=\"post\" action=\"", ["var", ["action"], []], "\">\n\t\t\t", ["for", ["param"], ["var", ["form_params"], []], false, ["\n\t\t\t\t<input\n\t\t\t\t\ttype=\"hidden\"\n\t\t\t\t\tname=\"", ["var", ["param", "name"], []], "\"\n\t\t\t\t\tvalue=\"", ["var", ["param", "value"], []], "\"\n\t\t\t\t\tclass=\"", ["var", ["param", "name"], []], "\" />\n\t\t\t"]], "\n\t\t\t<input\n\t\t\t\ttype=\"image\"\n\t\t\t\tclass=\"go_to_amazon_button\"\n\t\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/GoAmazonButton.png\" />\n\t\t</form>\n"], []], "\n"], "register_payments_middle");
    