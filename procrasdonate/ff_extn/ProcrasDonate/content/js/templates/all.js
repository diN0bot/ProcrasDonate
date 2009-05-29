
    Template.compile(["<form name='account_form' onSubmit='return false'>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr>\n\t\t\t\t<td><label class='right'>ProcrasDonation rate</label></td>\n\t\t\t\t<td><input class='left' type='text' size='4' name='cents_per_hr' value='", ["var", ["cents_per_hr"], []], "'></td>\n\t\t\t\t<td><div class='help'>&cent; per hour</div></td>\n\t\t\t</tr>\n\t\t\t\n\t\t\t<tr>\n\t\t\t\t<td><label class='right'>ProcrasDonation goal</label></td>\n\t\t\t\t<td><input class='left' id='hr_per_week_goal' type='text' size='4' name='hr_per_week_goal' value='", ["var", ["hr_per_week_goal"], []], "'></td>\n\t\t\t\t<td>\n\t\t\t\t\t<div class='help'>hours per day</div>\n\t\t\t\t\t<span id='cents_per_week_goal'></span>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t\t\n\t\t\t<tr>\n\t\t\t\t<td><label class='right'>ProcrasDonation limit</label></td>\n\t\t\t\t<td><input class='press_enter_for_next left' id='hr_per_week_max' type='text' size='4' name='hr_per_week_max' value='", ["var", ["hr_per_week_max"], []], "'></td>\n\t\t\t\t<td><div class='help'>hours per day</div></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</form>\n"], "donation_amounts_middle");
    
    Template.compile(["<div id='ranks'>\n\t", ["if", [[false, ["var", ["show_tags"], []]]], 1, ["\n\t<!--<fieldset class='rank_legend' style='-moz-border-radius:1em;'>-->\n\t<div class='rank_legend'>\n\t\t<h3>Site Classification Legend</h3>\n\t\t<!--<legend>Legend</legend>-->\n\t\t<label>ProcrasDonate:</label><div class='bar procrasdonate'></div>\n\t\t<label>TimeWellSpent:</label><div class='bar timewellspent'></div>\n\t\t<label>Other:</label><div class='bar other'></div>\n\t</div>\n\t<!--</fieldset>-->\n\t<h3>Most Visited Sites</h3>\n\t"], ["\n\t<h3>Most Supported Recipient</h3>\n\t"]], "\n</div>\n<table>\n\t<tbody>\n\t\t", ["for", ["name", "text1", "text2", "bar_class"], ["var", ["data"], []], false, ["\n\t\t<tr class=\"site_rank\">\n\t\t\t<td class=\"site_name\">", ["var", ["name"], []], "</td>\n\t\t\t<td class=\"rank\">\n\t\t\t\t<div class=\"bar ", ["var", ["bar_class"], []], "\" style=\"width: ", ["var", ["width"], []], "%\">\n\t\t\t\t\t", ["if", [[false, ["var", ["show_tags"], []]]], 1, ["\n\t\t\t\t\t<div class=\"rank_text\">", ["var", ["text1"], []], "</div>\n\t\t\t\t\t"], ["\n\t\t\t\t\t<div class=\"rank_text\">$", ["var", ["text2"], []], "</div>\n\t\t\t\t\t"]], "\n\t\t\t\t</div>\n\t\t\t</td>\n\t\t</tr>\n\t\t"]], "\n\t</tbody>\n</table>\n\n"], "impact_sites_middle");
    
    Template.compile(["<div id='thin_column'>\n\t", ["var", ["tab_snippet"], []], "\n\t<div id='messages'></div>\n\t<div id='errors'></div>\n\t<div id='success'></div>\n\t", ["var", ["middle"], []], "\n</div>\n\n"], "impact_wrapper_snippet");
    
    Template.compile(["<div class=\"site\">\n\t", ["var", ["inner"], []], "\n</div>\n\n"], "make_site_box");
    
    Template.compile([["var", ["inner"], []], "\n<span class='img_link move_to_undefined'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/RightArrow.png'>\n</span>\n"], "procrasdonate_wrap");
    
    Template.compile(["<div class='recipient'>\n\t<div class='name'><a href='", ["var", ["url"], []], "'>", ["var", ["name"], []], "</a></div>\n\t<div class='description'>", ["var", ["description"], []], "</div>\n</div>\n"], "recipient_snippet");
    
    Template.compile(["<div id='site_classifications'>\n\t<div id='procrasdonate_col' class='column'>\n\t\t<div class='title'>Procras Donate</div>\n\t\t", ["var", ["procrasdonate_text"], []], "\n\t</div>\n\t<div id='undefined_col' class='column'>\n\t\t<div class='title'><-~-></div>\n\t\t", ["var", ["undefined_text"], []], "\n\t</div>\n\t<div id='timewellspent_col' class='column'>\n\t\t<div class='title'>Time Well Spent</div>\n\t\t", ["var", ["timewellspent_text"], []], "\n\t</div>\n</div>\n"], "site_classifications_middle");
    
    Template.compile(["<h3>Support ProcrasDonate automatically.</h3>\n\n<p>What <i>percentage</i> of your donations would <b>you</b> like to use to pay for this service?</p>\n\t\n<form name='account_form' onSubmit='return false'>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr>\n\t\t\t\t<td><label class='right'>Support ProcrasDonate: </label></td>\n\t\t\t\t<td><div id='support_slider' class='slider' alt='", ["var", ["pct"], []], "'></div></td>\n\t\t\t\t<td><input id='support_input' class='press_enter_for_next input' alt='", ["var", ["pct"], []], "' value='", ["var", ["pct"], []], "' size='1'/></td>\n\t\t\t\t<td><span class='help'>% of total donation</span></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</form>\n"], "support_middle");
    
    Template.compile(["<span class='img_link move_to_undefined'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/LeftArrow.png'>\n</span>\n", ["var", ["inner"], []], "\n"], "timewellspent_wrap");
    
    Template.compile(["<form name='account_form' onSubmit='return false'>\n\t\n\t<h3>Procrasdonate uses your Twitter account.</h3>\n\t<p style='text-align: left;'>Click <a href='https://twitter.com/signup'>HERE</a> if you're not on twitter yet.</p>\n\t<p style='text-align: left;'><span id='what_is_twitter' class='link'>What is Twitter?</span></p>\n\t\n\t<h3>Please sign in:</h3>\n\t\n\t<table>\n\t\t<tbody>\n\t\t\t<tr>\n\t\t\t\t<td><label class='right'>Twitter username </label></td>\n\t\t\t\t<td><input class='left' type='text' name='twitter_username' value='", ["var", ["twitter_username"], []], "'></td>\n\t\t\t</tr>\n\t\t\t\n\t\t\t<tr class='above_helprow'>\n\t\t\t\t<td><label class='right'>Twitter password</label></td>\n\t\t\t\t<td><input class='press_enter_for_next left' type='password' name='twitter_password' value='", ["var", ["twitter_password"], []], "'></td>\n\t\t\t</tr>\n\t\t\t\n\t\t\t<tr class='helprow'>\n\t\t\t\t<td></td>\n\t\t\t\t<td><div class='help'><a href='", ["var", ["constants", "PRIVACY_URL"], []], "'>Privacy Guarantee</a></div></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t\n\t<h2><a name='tos'></a>Terms of Use</h2>\n\t<img src='", ["var", ["constants", "MEDIA_URL"], []], "img/TermsOfUse.png' class='small-image'>\n\t<input type='checkbox'>\n\t<p>By using our service you agree to the following:\n\t\t<ul class='paragraph_list'>\n\t\t\t<li>ProcrasDonate may update these terms of service without warning or notification.\n\t\t\t<li>You understand how our service works and are willingly participating.\n\t\t\t<li>You agree to pay all pledges made on your behalf in full.\n\t\t\t<li>A percentage that you determine of your donations is donated to our service.\n\t\t\t<li>You are responsible for any content you add to this site.\n\t\t\t<li>Illegal, unfriendly, or otherwise problematic content will be removed.\n\t\t\t<li>Your individual records and settings are private and not accessible by our company.\n\t\t\t<li>Your summary records are used for community statistics and other as yet undetermined uses (hopefully that will support the service financially).\n\t\t\t<li>All rights are reserved including ProcrasDonate intellectual property of software and our business model.\n\t\t\t</li><li><b>Thanks for ProcrasDonating!</b>\n\t\t</ul>\n\t</p>\n\t\n</form>\n"], "twitter_account_middle");
    
    Template.compile(["<span class='img_link move_to_procrasdonate'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/LeftArrow.png'>\n</span>\n", ["var", ["inner"], []], "\n<span class='img_link move_to_timewellspent'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/RightArrow.png'>\n</span>\n"], "undefined_wrap");
    
    Template.compile(["<div id='thin_column'>\n\t", ["var", ["tab_snippet"], []], "\n\t<div id='messages'></div>\n\t<div id='errors'></div>\n\t<div id='success'></div>\n\t", ["var", ["middle"], []], "\n</div>\n\n"], "wrapper_snippet");
    