/** *********************** GLOBAL VARIABLES ********************************* */

var constants = {};

(function CONSTANTS() {
	/*
	 * Define all global variables here.
	 */
	constants.MEDIA_URL = '/procrasdonate_media/';
	constants.PD_HOST = 'procrasdonate.com';
	//constants.PD_URL = 'http://' + constants.PD_HOST;
	constants.PD_URL = 'http://localhost:8000';
	constants.VALID_HOSTS = ['localhost:8000', 'procrasdonate.com'];
	
	constants.PROCRASDONATE_URL = '/';
	constants.REGISTER_URL = '/register/';
	constants.HOME_URL = '/home/';
	constants.LEARN_URL = '/learn_more/';
	constants.IMPACT_URL = '/my_impact/';
	constants.SETTINGS_URL = '/settings/';

	constants.FEEDBACK_URL = 'http://feedback.procrasdonate.com/';

	constants.COMMUNITY_URL = '/our_community';
	constants.PRIVACY_URL = '/privacy_guarantee/';
	constants.RECIPIENTS_URL = '/recipients';
	
	constants.AUTHORIZE_PAYMENTS_URL = '/fps/user/payment/authorize/';
	constants.AUTHORIZE_PAYMENTS_CALLBACK_URL = '/fps/user/payment/authorize_callback/';
	
	constants.SEND_EMAIL_URL = '/post/email/';
	constants.SEND_DATA_URL = '/post/data/';
	constants.RECEIVE_DATA_URL = '/get/data/';
	
	// FPS
	constants.AUTHORIZE_PAYMENTS_URL = '/fps/user/payment/authorize/';
	constants.AUTHORIZE_PAYMENTS_CALLBACK_URL = '/fps/user/payment/authorize_callback/';
	constants.MAKE_PAYMENT_URL = '/fps/user/payment/pay/';
	constants.SETTLE_DEBT_URL = '/fps/user/payment/settle_debt/';
	
	constants.AUTHORIZE_MULTIUSE_URL = '/fps/user/multiuse/authorize/';
	constants.PAY_MULTIUSE_URL = '/fps/user/multiuse/pay/';
	constants.CANCEL_MULTIUSE_TOKEN_URL = '/fps/user/multiuse/cancel_token/';
	
	constants.ON_INSTALL_URL = '/on_install/';
	constants.AFTER_INSTALL_URL = '/after_install/';
	constants.AFTER_UPGRADE_URL = '/after_upgrade/';
	
	// used for development and testing
	constants.MANUAL_TEST_SUITE_URL = '/dev/manual_test_suite/';
	constants.AUTOMATIC_TEST_SUITE_URL = '/dev/automatic_test_suite/';

	// enumeration of settings page state
	constants.SETTINGS_STATE_ENUM = [
		'account', 
		'recipients', 
		'donation_amounts', 
		'support', 
		/*'site_classifications',*/
		'payment_system'
	];
	constants.SETTINGS_STATE_TAB_NAMES = [
		'Email', 'Recipients', 'Donations', 'Support', /*'Sites',*/ 'Amazon'];
	constants.SETTINGS_STATE_INSERTS = [
		"insert_settings_account", 
		"insert_settings_recipients", 
		"insert_settings_donation_amounts", 
		"insert_settings_support", 
		/*"insert_settings_site_classifications",*/ 
		"insert_settings_payment_system"
	];
	constants.SETTINGS_STATE_PROCESSORS = [
		"process_account", 
		"process_recipients", 
		"process_donation", 
		"process_support", 
		/*"process_site_classifications",*/ 
		"process_payment_system"
	];
	//enumeration of impact page state
	constants.IMPACT_STATE_ENUM = ['recipients', 'sites', 'goals'];//, 'history'];
	constants.IMPACT_STATE_TAB_NAMES = ['Recipients', 'Sites', 'Goals'];//, 'History'];
	constants.IMPACT_STATE_INSERTS = [
		"insert_impact_recipients", 
		"insert_impact_sites", 
		"insert_impact_goals"
	];//, insert_impact_history];
	constants.IMPACT_SUBSTATE_INSERTS = [
	                                     "today",
	                                     "this_week",
	                                     "all_time",
	                                     "daily",
	                                     "weekly"
	];
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
		'account', 
		'recipients', 
		'donation_amounts', 
		'support', 
		/*'site_classifications',*/ 
		'payment_system', 
		'done'
	];
	constants.REGISTER_STATE_TAB_NAMES = [
		'Email', 'Recipients', 'Donation', 'Support', /*'Sites', */'Amazon', 'XXX'];
	constants.REGISTER_STATE_INSERTS = [
		"insert_register_account", 
		"insert_register_recipients", 
		"insert_register_donation_amounts", 
		"insert_register_support", 
		/*"insert_register_site_classifications",*/ 
		"insert_register_payment_system", 
		"insert_register_done"
	];
	constants.REGISTER_STATE_PROCESSORS = [
		"process_account", 
		"process_recipients", 
		"process_donation", 
		"process_support", 
		/*"process_site_classifications",*/
		"process_payment_system", 
		"process_done"
	];
	
	constants.DEFAULT_HASH = "nohash";
	constants.DEFAULT_USERNAME = "";
	constants.DEFAULT_PASSWORD = "";
	constants.DEFAULT_EMAIL = "";
	constants.DEFAULT_PROCRASDONATE_REASON = "ProcrasDonating for a good cause";
	constants.DEFAULT_TIMEWELLSPENT_REASON = "TimeWellSpent for a good cause";
	constants.PD_DEFAULT_CENTS_PER_HR = 95;
	constants.PD_DEFAULT_HR_PER_WEEK_GOAL = 20;
	constants.PD_DEFAULT_HR_PER_WEEK_MAX = 30;
	constants.TWS_DEFAULT_CENTS_PER_HR = 95;
	constants.TWS_DEFAULT_HR_PER_WEEK_GOAL = 20;
	constants.TWS_DEFAULT_HR_PER_WEEK_MAX = 30;
	constants.DEFAULT_SUPPORT_PCT = _prefify_float(10);
	
	constants.DEFAULT_SETTINGS_STATE = "twitter_account";
	constants.DEFAULT_REGISTER_STATE = "twitter_account";
	constants.DEFAULT_IMPACT_STATE = "recipients";
	constants.DEFAULT_IMPACT_SUBSTATE = "this_week";
	
	constants.DEFAULT_IMPACT_RECIPIENTS_SUBSTATE = 'nonprofits';
	constants.DEFAULT_IMPACT_SITES_SUBSTATE = 'procrasdonate';
	
	// FPS DEFAULTS
	constants.DEFAULT_GLOBAL_AMOUNT_LIMIT = 100.00;
    constants.DEFAULT_CREDIT_LIMIT = 20.00;
    constants.DEFAULT_FPS_CBUI_VERSION = "2009-01-09";
    constants.DEFAULT_FPS_API_VERSION = "2008-09-17";
    constants.DEFAULT_PAYMENT_REASON = "Proudly ProcrasDonating for a good cause!";
	
	// then we can call CONSTANTS() whenever and it's not going to overwrite stuff 	
	CONSTANTS = function() { return constants; }
	return constants;
})();
