/** *********************** GLOBAL VARIABLES ********************************* */

// constants.PD_URL is actually overwritten later by 
// generated_input during install process

var constants = {};

(function CONSTANTS() {
	/*
	 * Define all global variables here.
	 */
	constants.MEDIA_URL = '/procrasdonate_media/';
	constants.PD_HOST = 'ProcrasDonate.com';
	constants.PD_URL = 'https://' + constants.PD_HOST;
	constants.PD_API_URL = 'https://' + constants.PD_HOST;
	//constants.PD_URL = 'http://localhost:8000';
	//constants.PD_API_URL = 'http://localhost:8000';
	constants.VALID_HOSTS = ['localhost:8000', 'procrasdonate.com'];
	
	constants.PROCRASDONATE_URL = '/';
	constants.REGISTER_URL = '/register/';
	constants.HOME_URL = '/';
	constants.COMMUNITY_URL = '/community/';
	constants.FAQ_URL = '/faq/';
	constants.IMPACT_URL = '/my_impact/';
	constants.SETTINGS_URL = '/my_settings/';
	constants.PROGRESS_URL = '/my_progress/';
	constants.MESSAGES_URL = '/my_messages/';

	constants.FEEDBACK_URL = 'http://feedback.procrasdonate.com/';

	constants.COMMUNITY_URL = '/our_community';
	constants.PRIVACY_URL = '/privacy_guarantee/';
	constants.RECIPIENTS_URL = '/';
	
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
	constants.TIMING_TEST_SUITE_URL = '/dev/timing_test_suite/';
	
	constants.AMAZON_USER_URL = "https://payments.amazon.com";

	// enumeration of settings page state
	constants.DEFAULT_SETTINGS_STATE = "overview";
	constants.SETTINGS_STATE_ENUM = [
	    'overview'
		/*'account', 
		'recipients', 
		'donation_amounts', 
		'support', 
		//'site_classifications',
		'payment_system'*/
	];
	constants.SETTINGS_STATE_TAB_NAMES = ['XXX'];
		//'Email', 'Recipients', 'Donations', 'Support', /*'Sites',*/ 'Amazon'];
	constants.SETTINGS_STATE_INSERTS = [
	    "insert_settings_overview",
		/*"insert_settings_account", 
		"insert_settings_recipients", 
		"insert_settings_donation_amounts", 
		"insert_settings_support", 
		//"insert_settings_site_classifications", 
		"insert_settings_payment_system"*/
	];
	constants.SETTINGS_STATE_PROCESSORS = [
	    "process_settings_overview",
		/*"process_account", 
		"process_recipients", 
		"process_donation", 
		"process_support", 
		//"process_site_classifications", 
		"process_payment_system"*/
	];

	// enumeration of progress page state
	constants.DEFAULT_PROGRESS_STATE = "overview";
	constants.PROGRESS_STATE_ENUM = [
		"overview", 
	];
	constants.PROGRESS_STATE_TAB_NAMES = [
		"XXX"
	];
	constants.PROGRESS_STATE_INSERTS = [
		"insert_progress_overview",
	];
	
	// enumeration of messages page state
	constants.DEFAULT_MESSAGES_STATE = "all";
	constants.MESSAGES_STATE_ENUM = [
		"all", "thankyous", "newsletters", "weekly", "tax"
	];
	constants.MESSAGES_STATE_TAB_NAMES = [
		"All Messages", "Thankyou Notes", "Newsletters", "Weekly Feedback", "Tax Records"
	];
	constants.MESSAGES_STATE_INSERTS = [
		"insert_messages_all",
		"insert_messages_thankyous",
		"insert_messages_newsletters",
		"insert_messages_weekly",
		"insert_messages_tax",
	];
	
	//enumeration of impact page state
	constants.DEFAULT_IMPACT_STATE = "totals";
	constants.IMPACT_STATE_ENUM = ['totals', 'show_all', 'tax_deductible', 'other'];
	constants.IMPACT_STATE_TAB_NAMES = ["Totals", "Show All", "Tax-deductible", "Other"]; 
	constants.IMPACT_STATE_INSERTS = [
		"insert_impact_totals", 
		"insert_impact_show_all", 
		"insert_impact_tax_deductible",
		"insert_impact_other"
	];
	/* OLD
	////// SUBSTATES/////
	constants.DEFAULT_IMPACT_SUBSTATE = "this_week";
	constants.DEFAULT_IMPACT_RECIPIENTS_SUBSTATE = 'nonprofits';
	constants.DEFAULT_IMPACT_SITES_SUBSTATE = 'procrasdonate';
	constants.IMPACT_SUBSTATE_INSERTS = [
		"today",
		"this_week",
		"all_time",
		"daily",
		"weekly"
	];*/
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
	constants.DEFAULT_REGISTER_STATE = "incentive";
	constants.REGISTER_STATE_ENUM = [
		'incentive', 
		'charities', 
		'content', 
		'support', 
		'updates', 
		'payments',
		'done'
	];
	constants.REGISTER_STATE_TAB_NAMES = [
		'Incentive', 'Charities', 'Content', 'Support', 'Updates', 'Payments', 'XXX'];
	constants.REGISTER_STATE_INSERTS = [
		"insert_register_incentive", 
		"insert_register_charities", 
		"insert_register_content", 
		"insert_register_support", 
		"insert_register_updates",
		"insert_register_payments",
		"insert_register_done"
	];
	constants.REGISTER_STATE_PROCESSORS = [
		"process_register_incentive", 
		"process_register_charities", 
		"process_register_content", 
		"process_register_support", 
		"process_register_updates",
		"process_register_payments",
		"process_register_done"
	];
	
	constants.DEFAULT_HASH = "nohash";
	constants.DEFAULT_PRIVATE_KEY = "no_private_key";
	constants.DEFAULT_USERNAME = "";
	constants.DEFAULT_PASSWORD = "";
	constants.DEFAULT_EMAIL = "";
	constants.DEFAULT_PROCRASDONATE_REASON = "ProcrasDonating for a good cause";
	constants.DEFAULT_TIMEWELLSPENT_REASON = "TimeWellSpent for a good cause";
	constants.PD_DEFAULT_DOLLARS_PER_HR = 2;
	constants.PD_DEFAULT_HR_PER_WEEK_GOAL = 20;
	constants.PD_DEFAULT_HR_PER_WEEK_MAX = 30;
	constants.TWS_DEFAULT_DOLLARS_PER_HR = 2;
	constants.TWS_DEFAULT_HR_PER_WEEK_GOAL = 20;
	constants.TWS_DEFAULT_HR_PER_WEEK_MAX = 30;
	constants.DEFAULT_SUPPORT_PCT = _prefify_float(0.10);
	constants.DEFAULT_MONTHLY_FEE = _prefify_float(1.00);
	constants.DEFAULT_PAYMENT_THRESHHOLD = 10;
	
	constants.DEFAULT_MIN_AUTH_TIME = 12;
	constants.DEFAULT_MIN_AUTH_UNITS = 'months';
	
	constants.DEFAULT_MAX_IDLE = 3*60; // 3 minutes
	constants.DEFAULT_FLASH_MAX_IDLE = 20*60; // 20 minutes
	
	constants.DEFAULT_WEEKLY_AFFIRMATIONS = _dbify_bool(true);
	constants.DEFAULT_ORG_THANK_YOUS = _dbify_bool(true);
	constants.DEFAULT_ORG_NEWSLETTERS = _dbify_bool(true);
	constants.DEFAULT_TOS = _dbify_bool(false);
	
	// flag for whether to make payments or not--
	// eg, if db corruption or some other error
	constants.DEFAULT_PREVENT_PAYMENTS = false;
		
	// FPS DEFAULTS
	constants.DEFAULT_GLOBAL_AMOUNT_LIMIT = _prefify_float(100.00);
    constants.DEFAULT_CREDIT_LIMIT = _prefify_float(20.00);
    constants.DEFAULT_FPS_CBUI_VERSION = "2009-01-09";
    constants.DEFAULT_FPS_API_VERSION = "2008-09-17";
    constants.DEFAULT_PAYMENT_REASON = "Proudly ProcrasDonating for a good cause!";
	
	// then we can call CONSTANTS() whenever and it's not going to overwrite stuff 	
	CONSTANTS = function() { return constants; }
	return constants;
})();
