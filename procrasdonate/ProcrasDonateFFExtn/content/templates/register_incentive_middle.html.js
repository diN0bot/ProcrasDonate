
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<h5>What is your incentive to waste less time online? \n\t<span class=\"subheader\"><\/span><\/h5>\n<p id=\"rate_error\" class=\"error\"><\/p>\n\n<p> ''I will donate\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"pd_dollars_per_hr\"\n\t\tname=\"pd_dollars_per_hr\" \n\t\tvalue=\"", ["var", ["pd_dollars_per_hr"], []], "\"\n\t\tsize=\"4\" \/>\n\t   <span class=\"units\"><\/span>\n  \tdollars for every hour I spend on websites I mark as ProcrasDonate.''<\/p>\n   \n\n<h5>How many hours do you <i>want<\/i> to spend ProcrasDonating every week?\n\t<span class=\"subheader\"> <\/span><\/h5>\n<p id=\"goal_error\" class=\"error\"><\/p>\n\n<div class=\"example_gauge\">\n\t<div id=\"happy_example_gauge\"><\/div>\n<\/div>\n\n<p>''I would like to set a goal of\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"pd_hr_per_week_goal\"\n\t\tname=\"pd_hr_per_week_goal\" \n\t\tvalue=\"", ["var", ["pd_hr_per_week_goal"], []], "\" \n\t\tsize=\"4\"\/>\n\t   <span class=\"units\"><\/span>\n\thours of ProcrasDonating per week. My goal is for feedback only and will not change my donations.''<\/p>\n\n\n<h5>What is your weekly limit?\n\t<span class=\"subheader\"><\/span><\/h5>\n<p id=\"max_error\" class=\"error\"><\/p>\n<p>''I would like to keep track of at most\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"pd_hr_per_week_max\"\n\t\tname=\"pd_hr_per_week_max\" \n\t\tvalue=\"", ["var", ["pd_hr_per_week_max"], []], "\"\n\t\tsize=\"4\" \/>\n\t   <span class=\"units\"><\/span>\n   hours per week.  No donations will be made beyond this point.''<\/p>\n\n", ["var", ["arrows"], []], "\n"], "register_incentive_middle");
    