
    Template.compile(["<table id=\"progress_explanation\" style=\"width: ", ["var", ["width"], []], "px; margin: auto;\">\n<tbody>\n\t<tr>\n\t\t<td>This week so far:<br \/>", ["var", ["pd_this_week_hrs_unlimited"], []], " hours\n\t\t\t", ["ifequal", ["var", ["pd_this_week_hrs_unlimited"], []], ["var", ["pd_this_week_hrs"], []], ["\n\t\t\t\t", "\n\t\t\t"], ["\n\t\t\t\t", "\n\t\t\t"]], "\n\t\t<\/td>\n\t\t<td>Last week:<br \/>", ["var", ["pd_last_week_hrs_unlimited"], []], " hours\n\t\t\t", ["ifequal", ["var", ["pd_last_week_hrs_unlimited"], []], ["var", ["pd_last_week_hrs"], []], ["\n\t\t\t"], ["\n\t\t\t\t", "\n\t\t\t"]], "\n\t\t<\/td>\n\t\t<td>All time average:<br \/>", ["var", ["pd_total_hrs_unlimited"], []], " hours\n\t\t\t", ["ifequal", ["var", ["pd_total_hrs_unlimited"], []], ["var", ["pd_total_hrs"], []], ["\n\t\t\t"], ["\n\t\t\t\t", "\n\t\t\t"]], "\n\t\t<\/td>\n\t<\/tr>\n\t<tr>\n\t\t<td><img class=\"laptop\" src=\"", ["var", ["this_week_laptop"], []], "\" \/><\/td>\n\t\t<td><img class=\"laptop\" src=\"", ["var", ["last_week_laptop"], []], "\" \/><\/td>\n\t\t<td><img class=\"laptop\" src=\"", ["var", ["total_laptop"], []], "\" \/><\/td>\n\t<\/tr>\n<\/tbody>\n<\/table>\n"], "progress_explanation_snippet");
    