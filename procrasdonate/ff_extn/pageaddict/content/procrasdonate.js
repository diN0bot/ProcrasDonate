// ProcrasDonate is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2, or (at your option)
// any later version.
// 
// ProcrasDonate is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details

// ProcrasDonate is built on top of PageAddict, which is likewise GPL
// licensed. Some aspects of PageAddict are used directly, enhanced,
// rewritten or completely new.

/*******************************************************************************
 * DOCUMENTATION
 * 
 * __OVERVIEW__
 * 
 * ProcrasDonate keeps track of how long users spend on different sites. Time
 * spent on procrastination sites is summed, and then a proportional donation is
 * made to user-selected recipients.
 * 
 * In addition to setting the donation rate (cents per hour procrastinated),
 * users can set a procrasdonation goal and limit. Currently, procrastination
 * may continue after the time limit is reached, but donations are halted.
 * 
 * Payment is currently performed entirely through TipJoy, a social
 * micro-payment service that integrates with twitter.
 * 
 * For more details visit http://ProcrasDonate.com
 * 
 * __POSTS TO TIPJOY AND PROCRASDONATE.COM__
 * 
 * Every day, the previous day's url visits are aggregated into
 * total time spent and total donation amounts for site and recipients.
 * 
 * POST 1: This information is sent to the ProcrasDonation server so that it
 * may pay recipients and update the leader boards.
 * 
 * POST 2: The total amount owed is paid to ProcrasDonate via TipJoy.
 * 
 * (ProcrasDoante aggregates across all users and sends one daily donation
 * to recipients)
 * 
 * __PAYMENTS__
 * 
 * Users can select multiple recipients. Each recipient takes a user-specified
 * percent of the total rate (cents per hour) donated.
 * 
 * Users can also choose to support ProcrasDonate by donating some percentage to
 * ProcrasDonate. This is not done by making ProcrasDonate a recipient, but by
 * specifying a support amount (currently between 0 and 10%). The support amount
 * skims the top.
 * 
 * __HTML INSERTION__
 * 
 * This extension stores user information locally on the
 * user's browser. The ProcrasDonate.com server serves the general website, but
 * certain user-specific pages are necessarily overwritten by the extension.
 * 
 * In particular, the settings and my impact pages are overwritten by the
 * plugin. In fact, both pages have a multiple states, or tabs, that may be
 * viewed.
 * 
 * Note that CSS is still served by the ProcrasDonate.com server
 * 
 * __IMPLEMENTATION DETAILS__
 * 
 * insert_<state_name>_<tab_name> - responsible for overwriting #content div with 
 * new html, including tabs, buttons and middle (<-everything else). More or less 
 * follows the same pattern:
 * 	 1. constructs html string:
 *       a. calls <state_name>_tab_snippet() to get tab/track string
 *       b. calls <state_name>_wrapper(<tab_name>_middle()) to get middle
 *   2. inserts string into DOM
 *   3. calls activate_<state_name>_tab_snippet() to activate js events
 *   4. calls activate_<tabn_name>_middle(), if necessary, to activate js events
 * 
 * The activation of tab events involves constructing functinos that handle form processing
 * of events, if necessary, before calling the event, which is one of the insert_blah_blah
 * functions mentioned above. Processors receive the event as a parameter so that they may
 * delay insertion until after ajax calls are made (eg, twitter account verification). In 
 * this case the processor should always return false to prevent the event from occurring 
 * naturally.
 * 
 * __KNOWN PROBLEMS__
 * 
 * Almost every page loads gives the following error: Error: start_recording is
 * not defined Time recording appears to work fine, so not sure if this yields
 * any actual bugs. Would be nice to keep this from happening so as not to
 * pollute the error list.
 * 
 * GETs hang
 * 
 * can't seem to include jquery or json2 from script-compiler-overlay.xul
 * 
 * 
 * __VARIABLES IN GM STORE__
 * 
 * 'last_24hr_mark' -> int = seconds since epoch. marks start of 24hr period. if current time
 * 		is more than 24hrs since mark, then daily tasks are performed and last_24hrs_mark
 * 		is updated. note that the hour and minute should remain constant. only the day
 * 		and year need change. this is to maintain a random distribution of daily marks.
 * 
 * 'last_week_mark' -> int = seconds since epoch. like last_24hr_mark but marks start of week.
 * 
 * 'twitter_username'
 * 'twitter_password'
 * 'recipients' = uncertain format
 * 'cents_per_hour'
 * 'hr_per_day_goal' = goal number of hours to donate each day
 * 'hr_per_day_max' = max number of hours from which to donate each day
 * 
 * 'settings_state' = enumeration of settings page state
 * 
 * 'impact_state' = enumeration of impact page state
 * 
 * 'register_state' = enumeration of registration state
 * 
 * __UN-USED OR TO-BE-CLASSIFIED VARIABLES__
 * 
 * href = something like 'bilumi_org' or 'www_google_com__search' tag = user
 * generated string like 'work' or 'games'
 * 
 * 'first_visit' = 'last_visit' -> int = absolute time of last visit in seconds
 * (glocal)
 * 
 * href+'_last' -> int = absolute time of last visit in seconds (per ref)
 * href+'_count' -> int = number of visits. wrong? it's number of seconds
 * visited.
 * 
 * 'page_addict_start' AND window.page_addict_start = True if timing
 * 
 * 'visited' = list of href's visited for < 1 second. ';' separated
 * 'tagmatch_list' = list of "pattern=tag" pairs, ';' separated 'tag_list' =
 * 
 * tag+'_times'
 * tag+'_spent' tag+'_restricted' = use of tag is restricted
 * tag+'_max_time' = max time in minutes before content is blocked
 * 
 * 'total_times'
 * 'total_spent'
 * 
 * 'idle_timeout_mode' = boolean. based on preferences. if hasn't been set yet,
 * is based on platform.
 * 
 * 
 * __WINDOW STORE__
 * 
 * page_addict_start = why here and mirror GM STORE 'page_addict_start'? synch
 * issues?
 * 
 * total = tag_counts = unsort_arr =
 * 
 * idle_time = seconds idle as counted by monitor_activity(), which is called
 * every second (see start_recording)
 * 
 * user_active = boolean. set to true in record_activity(), which is triggered
 * by click, scroll and key event listeners. set to false in monitor_activity(),
 * which is called every second from start_recording
 ******************************************************************************/

