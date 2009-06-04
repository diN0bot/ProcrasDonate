/** *********************** GLOBAL VARIABLES ********************************* */

var constants = {};

(function CONSTANTS() {
	/*
	 * Define all global variables here.
	 */
	constants.MEDIA_URL = '/procrasdonate_media/';
	constants.PD_HOST = 'procrasdonate.com';
	constants.PD_URL = 'http://' + constants.PD_HOST;
	constants.VALID_HOSTS = ['localhost:8000', 'procrasdonate.com'];
	
	constants.PROCRASDONATE_URL = '/';
	constants.REGISTER_URL = '/register/';
	constants.HOME_URL = '/home/';
	constants.LEARN_URL = '/learn_more/';
	constants.IMPACT_URL = '/my_impact/';
	constants.SETTINGS_URL = '/settings/';
	
	constants.COMMUNITY_URL = '/our_community';
	constants.PRIVACY_URL = '/privacy_guarantee/';
	constants.RECIPIENTS_URL = '/recipients';
	
	constants.POST_TOTALS_URL = '/post/totals/';
	constants.POST_PAYMENTS_URL = '/post/payments/';
	
	// used for development testing
	constants.RESET_STATE = '/reset_state/';
	constants.ADD_RANDOM_VISITS = '/add_random_visits/';
	constants.TRIGGER_DAILY_CYCLE = '/trigger_daily_cycle/';
	constants.TRIGGER_WEEKLY_CYCLE = '/trigger_weekly_cycle/';
	
	// enumeration of settings page state
	constants.SETTINGS_STATE_ENUM = [
		'twitter_account', 
		'recipients', 
		'donation_amounts', 
		'support', 
		'site_classifications', 
		'balance'
	];
	constants.SETTINGS_STATE_TAB_NAMES = [
		'Twitter', 'Recipients', 'Donations', 'Support', 'Sites', 'Balance'];
	constants.SETTINGS_STATE_INSERTS = [
		"insert_settings_twitter_account", 
		"insert_settings_recipients", 
		"insert_settings_donation_amounts", 
		"insert_settings_support", 
		"insert_settings_site_classifications", 
		"insert_settings_balance"
	];
	constants.SETTINGS_STATE_PROCESSORS = [
		"process_twitter_account", 
		"process_recipients", 
		"process_donation", 
		"process_support", 
		"process_site_classifications", 
		"process_balance"
	];
	//enumeration of impact page state
	constants.IMPACT_STATE_ENUM = ['recipients', 'sites', 'goals'];//, 'history'];
	constants.IMPACT_STATE_TAB_NAMES = ['Recipients', 'Sites', 'Goals'];//, 'History'];
	constants.IMPACT_STATE_INSERTS = [
		"insert_impact_recipients", 
		"insert_impact_sites", 
		"insert_impact_goals"
	];//, insert_impact_history];
	/*
	// impact substate: recipients
	constants.IMPACT_RECIPIENTS_SUBSTATE_ENUM = ['nonprofits', 'contentproviders'];
	constants.IMPACT_RECIPIENTS_SUBSTATE_TAB_NAMES = ['Non-Profits', 'Content Providers'];
	constants.IMPACT_RECIPIENTS_SUBSTATE_INSERTS = [insert_impact_recipients_nonprofits, insert_impact_recipients_contentproviders];
	// impact substate: sites
	constants.IMPACT_SITES_SUBSTATE_ENUM = ['procrasdonate', 'timewellspent', 'other'];
	constants.IMPACT_SITES_SUBSTATE_TAB_NAMES = ['ProcrasDonate', 'Time Well Spent', 'Un-Sorted'];
	constants.IMPACT_SITES_SUBSTATE_INSERTS = [insert_impact_recipients_nonprofits, insert_impact_recipients_contentproviders];
	*/
	// enumeration of register track state
	constants.REGISTER_STATE_ENUM = [
		'twitter_account', 
		'recipients', 
		'donation_amounts', 
		'support', 
		'site_classifications', 
		'balance', 
		'done'
	];
	constants.REGISTER_STATE_TAB_NAMES = [
		'Twitter', 'Recipients', 'Donation', 'Support', 'Sites', 'Balance', 'XXX'];
	constants.REGISTER_STATE_INSERTS = [
		"insert_register_twitter_account", 
		"insert_register_recipients", 
		"insert_register_donation_amounts", 
		"insert_register_support", 
		"insert_register_site_classifications", 
		"insert_register_balance", 
		"insert_register_done"
	];
	constants.REGISTER_STATE_PROCESSORS = [
		"process_twitter_account", 
		"process_recipients", 
		"process_donation", 
		"process_support", 
		"process_site_classifications", 
		"process_balance", 
		"process_done"
	];
	
	constants.DEFAULT_USERNAME = "";
	constants.DEFAULT_PASSWORD = "";
	constants.DEFAULT_EMAIL = "";
	constants.DEFAULT_PROCRASDONATE_REASON = "ProcrasDonating for a good cause";
	constants.DEFAULT_TIMEWELLSPENT_REASON = "TimeWellSpent for a good cause";
	constants.DEFAULT_CENTS_PER_HR = 95;
	constants.DEFAULT_HR_PER_WEEK_GOAL = 20;
	constants.DEFAULT_HR_PER_WEEK_MAX = 30;
	
	constants.DEFAULT_SETTINGS_STATE = "twitter_account";
	constants.DEFAULT_REGISTER_STATE = "twitter_account";
	constants.DEFAULT_IMPACT_STATE = "recipients";
	
	constants.DEFAULT_IMPACT_RECIPIENTS_SUBSTATE = 'nonprofits';
	constants.DEFAULT_IMPACT_SITES_SUBSTATE = 'procrasdonate';
	
	// then we can call CONSTANTS() whenever and it's not going to overwrite stuff 	
	CONSTANTS = function() { return constants; }
	return constants;
})();
