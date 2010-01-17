
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<h5>Where would you like to receive weekly feedback and alerts?</h5>  \n\n<p>We do not share your email; not even with organizations that you donate to.\n</p>\n\n<p><label>Email </label><input\n\ttype=\"text\"\n\tid=\"email\"\n\tname=\"email\" \n\tvalue=\"", ["var", ["email"], []], "\" />\n</p>\n\n<h5>Do you deduct charitable donations from your taxes?</h5>\n<p></p>\n<div class=\"split_arrow_div\" class=\"left\">\n\t<img class=\"split_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/SplitArrows.png\" />\n</div>\n\n\n<div id=\"tax_deductions_middle\">\n</div>\n\n<br>\n\n<div id=\"terms_of_service_box\">\n\t<h2>Terms of service</h2>\n\t<p><input\n\t\ttype=\"checkbox\"\n\t\tid=\"tos\"\n\t\tname=\"tos\"\n\t\t", ["if", [[false, ["var", ["tos"], []]]], 1, ["checked"], []], " />\n\t   <span>I have read and agree to the following Terms of Service.</span>\n\t   </p>\n\t\n\tBy using our service you agree to the following:\n\t\n\t<p>- You are responsible for abiding by these terms as well as any updates that ProcrasDonate may make \n\t\tto these terms without warning or notification.\n\t</p>\n\t<p>- You understand how our service works and are willingly participating.\n\t</p>\n\t<p>- You will pay all pledges that have been properly made on your behalf in full.\n\t</p>\n\t<p>- Voluntary monthly fees and a percentage that you determine of each transaction will be\n\t\tpaid to ProcrasDonate.\n\t</p>\n\t<p>- You are solely responsible for any content that you add to this site. \n\t</p>\n\t<p>- Illegal, unfriendly, or otherwise problematic content will be removed.\n\t</p>\n\t<p>- Your individual records and settings are under your control.  \n\tAlthough our central server will collect your records to approve payments \n\tand collect community statistics - a reasonable effort will be made to keep\n\tyour browsing history and other records anonymous.\n\t</p>\n\t<p>- All rights are reserved including ProcrasDonate intellectual property of\n\t\tour business model and any software beyond the open source software \n\t\tthat we are using.\n\t</p>\n\t<p> Thanks for ProcrasDonating!\n\t</p>\n</div>\t\n\n", ["var", ["arrows"], []], "\n"], "register_updates_middle");
    