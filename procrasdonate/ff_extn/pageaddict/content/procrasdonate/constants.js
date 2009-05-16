/** *********************** GLOBAL VARIABLES ********************************* */

var constants = {};

function CONSTANTS() {
	/*
	 * Define all global variables here.
	 */
	constants.MEDIA_URL = '/procrasdonate_media/';
	constants.PD_HOST = 'localhost:8000';
	constants.PD_URL = 'http://' + constants.PD_HOST;
	
	constants.PROCRASDONATE_URL = constants.PD_URL+'/';
	constants.START_URL = constants.PD_URL+'/start_now/';
	constants.LEARN_URL = constants.PD_URL+'/home/';
	constants.IMPACT_URL = constants.PD_URL+'/my_impact/';
	constants.SETTINGS_URL = constants.PD_URL+'/settings/';
	
	constants.COMMUNITY_URL = constants.PD_URL+'/our_community';
	constants.PRIVACY_URL = constants.PD_URL+'/privacy_guarantee/';
	constants.RECIPIENTS_URL = constants.PD_URL+'/recipients';
	constants.POST_DATA_URL = constants.PD_URL+'/data/';
	
	// these don't exist. used for development testing
	constants.RESET_URL = constants.PD_URL+'/reset/';
	
	// enumeration of settings page state
	constants.SETTINGS_STATE_ENUM = ['twitter_account', 'recipients', 'donation_amounts', 'support', 'site_classifications', 'balance'];
	constants.SETTINGS_STATE_TAB_NAMES = ['Twitter', 'Recipients', 'Donations', 'Support', 'Sites', 'Balance'];
	constants.SETTINGS_STATE_INSERTS = [insert_settings_twitter_account, insert_settings_recipients, insert_settings_donation_amounts, insert_settings_support, insert_settings_site_classifications, insert_settings_balance];
	constants.SETTINGS_STATE_PROCESSORS = [process_twitter_account, process_recipients, process_donation, process_support, process_site_classifications, process_balance];
	//enumeration of impact page state
	constants.IMPACT_STATE_ENUM = ['site_ranks', 'procrasdonations', 'timewellspents', 'others', 'site_classifications'];
	constants.IMPACT_STATE_TAB_NAMES = ['Site Rankings', 'ProcrasDonations', 'Time Well Spents', 'Others', 'Re-Classify Sites'];
	constants.IMPACT_STATE_INSERTS = [insert_impact_site_ranks, insert_impact_visits, insert_impact_history];
	// enumeration of register track state
	constants.REGISTER_STATE_ENUM = ['twitter_account', 'recipients', 'donation_amounts', 'support', 'site_classifications', 'balance', 'done'];
	constants.REGISTER_STATE_TAB_NAMES = ['Twitter', 'Recipients', 'Donation', 'Support', 'Sites', 'Balance', 'XXX'];
	constants.REGISTER_STATE_INSERTS = [insert_register_twitter_account, insert_register_recipients, insert_register_donation_amounts, insert_register_support, insert_register_site_classifications, insert_register_balance, insert_register_done];
	constants.REGISTER_STATE_PROCESSORS = [process_twitter_account, process_recipients, process_donation, process_support, process_site_classifications, process_balance, process_done];
	
	constants.DEFAULT_USERNAME = "";
	constants.DEFAULT_PASSWORD = "";
	constants.DEFAULT_RECIPIENTS = "Bilumi*http://bilumi.org*80;ProcrasDonate*http://ProcrasDonate.com*20')";
	constants.DEFAULT_SUPPORT_PCT = 5;
	constants.DEFAULT_CENTS_PER_HOUR = "95";
	constants.DEFAULT_HOUR_PER_DAY_GOAL = "2";
	constants.DEFAULT_HOUR_PER_DAY_MAX = "3";
	
	constants.DEFAULT_SETTINGS_STATE = "twitter_account";
	constants.DEFAULT_REGISTER_STATE = "twitter_account";
	constants.DEFAULT_IMPACT_STATE = "visits";
	
	// then we can call CONSTANTS() whenever and it's not going to overwrite stuff 	
	CONSTANTS = function() { return constants; }
}
