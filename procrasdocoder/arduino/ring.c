/*
 */

#define DEBUG  1

#include <WiServer.h>

#define WIRELESS_MODE_INFRA 1
#define WIRELESS_MODE_ADHOC 2

#include "Wire.h"
#include "BlinkM_funcs.h"

// ---------------------------------------------------------------------------------
// BlinkM configuration parameters -------------------------------------------------

// set this if you're plugging a BlinkM directly into an Arduino,
// into the standard position on analog in pins 2,3,4,5
// otherwise you can set it to false or just leave it alone
const boolean BLINKM_ARDUINO_POWERED = true;

int blinkm_addr = 0x09;

// End of BlinkM configuration parameters ------------------------------------------
// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------
// Wireless configuration parameters -----------------------------------------------

//////// YOU MUST SET THESE BASED ON YOUR OWN WIRELESS NETWORK CONFIGURATION

unsigned char local_ip[] = {192,168,1,222}; // IP address of WiShield
unsigned char gateway_ip[] = {192,168,1,1}; // router or gateway IP address
unsigned char subnet_mask[] = {255,255,255,0};	// subnet mask for the local network

const prog_char ssid[] PROGMEM = {"your wireless network name"}; // max 32 bytes

unsigned char security_type = 1;	// 0 - open; 1 - WEP; 2 - WPA; 3 - WPA2

// WPA/WPA2 passphrase
const prog_char security_passphrase[] PROGMEM = {"your wpa network password"}; // max 64 characters

// WEP 128-bit keys 

// user this site to generate from password, unless password is already
// in hex, which means it consists only of numbers and the letters a-f.
//	  http://www.wepkey.com/
// edit g2100.c keyLen to 5 or 13 (bytes) for 64- or 128-bit, respectively
// leave zeros (0x00) for rest of values
// eg, a password of "12345abcde" turns into the following:
prog_uchar wep_keys[] PROGMEM = { 
0x12, 0x34, 0x5a, 0xbc, 0xde, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Key 0
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Key 1
0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Key 2
0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // Key 3
};

// setup the wireless mode
// infrastructure - connect to AP
// adhoc - connect to another WiFi device
unsigned char wireless_mode = WIRELESS_MODE_INFRA;

unsigned char ssid_len;
unsigned char security_passphrase_len;
// End of wireless configuration parameters ----------------------------------------
// ---------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------
// ProcrasDoCoderRing configuration parameters --------------------------------------

// a simple red led to light up for debugging purposes
int ping_pin =	7;
// a switch to trigger receiving updated counts from the server
int switch_pin = 6;
int switch_state = LOW;

// IP Address for procrasdonate.com 
uint8 ip[] = {72,14,185,232};
// A request that gets procrasdonate data
GETrequest pinger(ip, 80, "procrasdonate.com", "/procrasdocoder/");

// ping update time in milliseconds
long updateTime = 0;

// example response from ProcrasDoCoder server
//   ^u:165,v:0,p:20338,d:0$
// help from snippet here 
//   http://www.arduino.cc/cgi-bin/yabb2/YaBB.pl?num=1231812230
#define START_CHAR '^'
#define END_CHAR '$'
// const
#define MAX_STRING_LEN 20
#define USER_IDX 0
// visitor to adwords
#define VISITOR_IDX 1
#define PLEDGE_IDX 2
#define DONATION_IDX 3
#define COUNTS_LEN 4

long counts[4]; // counts

// loop vars from packet processor
char tmpStr[MAX_STRING_LEN] = "";
boolean inside_message = false;
int count_idx = -1;

// End of ProcrasDoCoderRing configuration parameters ------------------------------
// ---------------------------------------------------------------------------------

/* Initiates blink sequence based on last read count.
 * 
 * Called once incoming packet reaches the completion of a count, eg u:165, is read. 
 * The new count, in this case 165, will be stored in tmpStr.
 * The count type, in this case matching 'u', will be stored in counts_idx
 */
void _process_new_count() {
	//Serial.print("tmpStr = ");
	//Serial.println(tmpStr);
	long new_count = atol(tmpStr);
	
	Serial.print("old_count = ");
	Serial.println(counts[count_idx]);
	Serial.print("new_count = ");
	Serial.println(new_count);

	if (counts[count_idx] != new_count) {
		switch(count_idx) {
            case USER_IDX:
				_blink_for_new_users();
				break;
            case VISITOR_IDX:
				_blink_for_new_visitors();
				break;
            case PLEDGE_IDX:
				_blink_for_new_pledgers();
				break;
            case DONATION_IDX:
				_blink_for_new_donators();
				break;
		}
	}
	counts[count_idx] = new_count;
	count_idx = -1;
	clearStr(tmpStr);
}

/* General method for initiating a blink sequence.
 * Will fade to each hue for half a second, then turn off.
 * @param hues: list of ints from 0-255 representing hue
 * @param len: length of list. eit.
 */
void _blink_sequence(int hues[], int len) {
	for (int i = 0; i < len; i++) {
		BlinkM_fadeToHSB( blinkm_addr, hues[i], 255, 255 );
		delay(500);
	}
	BlinkM_fadeToHSB( blinkm_addr, 0, 0, 0 );
	delay(500);
}

void _blink_for_new_users() {
	Serial.println("\n ----- NEW USERS! ----- \n");
	int x[] = {35, 85, 35, 35, 85, 35};
	_blink_sequence(x, 6);
}

void _blink_for_new_visitors() {
	Serial.println("\n ----- NEW VISITORS! ----- \n");
	int x[] = {100, 150, 100, 100, 150, 100};
	_blink_sequence(x, 6);
}

void _blink_for_new_pledgers() {
	Serial.println("\n ----- NEW PLEDGERS! ----- \n");
	int x[] = {165, 215, 165, 165, 215, 165};
	_blink_sequence(x, 6);
}

void _blink_for_new_donators() {
	Serial.println("\n ----- NEW DONATORS! ----- \n");
	int x[] = {230, 255, 230, 230, 255, 230};
	_blink_sequence(x, 6);
}

/* Processes incoming packet from web request. That is, the full HTTP Response
 * is partitioned into multiple calls to process_procrasdocoder. Because of this, 
 * we store our parsing state in global variables, and call _process_new_count
 * whenever we happen to reach the end of a count section (u:165,)
 */
void process_procrasdocoder(char* data, int len) {
	// Note that the data is not null-terminated, may be broken up into smaller packets, and 
	// includes the HTTP header. 
	//Serial.print("\nprocess update of length: ");
	//Serial.println(len);
	
	char ch;
	while (len-- > 0) {
		ch = *(data++);
		if (inside_message) {
			//Serial.print(ch);
			switch (ch) {
				case 'u':
					count_idx = USER_IDX;
					break;
				case 'v':
					count_idx = VISITOR_IDX;
					break;
				case 'p':
					count_idx = PLEDGE_IDX;
					break;
				case 'd':
					count_idx = DONATION_IDX;
					break;
				case ':':
					break;
				case ',':
					_process_new_count();
					break;
				case '$':
					_process_new_count();
					inside_message = false;
					break;
				default: // must be a value. might be more than one character.
					addChar(ch, tmpStr);
					break;
			}
		} else {
			if (ch == START_CHAR) {
				inside_message = true;
			}
		}
	}
}

/* Not necessary for the app, but good to know we can server webpages 
 * if necessary. Unfortunately, the requesting machine has to be on the
 * same local network...
 *
 * The url must match the local_ip configuration parameter above, eg http://192.168.1.222
 * @param URL the path after the IP. http://192.168.1.222/foo/bar will cause url_dispatch
 * to be called with URL equal to "/foo/bar"
 */
boolean url_dispatch(char* URL) {
	// Check if the requested URL matches "/"
	Serial.println("--->process...");
	if (strcmp(URL, "/") == 0) {
		// Use WiServer's print and println functions to write out the page content
		WiServer.print("<html>");
		WiServer.print("I am wifly");
		WiServer.print("</html>");
		
		digitalWrite(ping_pin, HIGH);
		delay(1000);
		digitalWrite(ping_pin, LOW);
		
		// URL was recognized
		return true;
	}
	// URL not found
	return false;
}

void setup() {
	WiServer.init(url_dispatch);
	
	// Enable Serial output and ask WiServer to generate log messages (optional)
	Serial.begin(57600);
	WiServer.enableVerboseMode(true);
	
	// Have the processData function called when data is returned by the server
	pinger.setReturnFunc(process_procrasdocoder);
	
	pinMode(ping_pin, OUTPUT);
	pinMode(switch_pin, INPUT);
	
	Serial.println("WiFly setup complete");
	
	if( BLINKM_ARDUINO_POWERED ) {
		BlinkM_beginWithPower();
	} else {
		BlinkM_begin();
	}
	delay(1000);  // some startup light is good
	
	BlinkM_stopScript(blinkm_addr);  // turn off startup script
	
	Serial.println("BlinkM setup complete");
}

void loop(){
	// Check if it's time to get an update
	if (millis() >= updateTime) {
		pinger.submit();
		
		// Get another update....1 minute from now
		updateTime = millis() + 1000*30;
	}
	
	// Run WiServer
	WiServer.server_task();
	
	// Check if switch is pushed
	int switch_val = digitalRead(switch_pin);
	if (switch_val == HIGH && switch_state == LOW ) {
		pinger.submit();
		digitalWrite(ping_pin, HIGH);
		delay(1000);
		digitalWrite(ping_pin, LOW);
	}
	switch_state = switch_val;
	
	delay(10);
}


// ---------------------------------------------------------------------------------
// Utilities -----------------------------------------------------------------------


// Function to clear a string
void clearStr (char* str) {
	int len = strlen(str);
	for (int c = 0; c < len; c++) {
		str[c] = 0;
	}
}

//Function to add a char to a string and check its length
void addChar (char ch, char* str) {
	// Check the max size of the string to make sure it doesn't grow too
	// big.
	if (strlen(str) > MAX_STRING_LEN - 2) {
		// do nothing
		
	} else {
		// Add char to string
		str[strlen(str)] = ch;
	}
}

// Function to check the current tag for a specific string
boolean match (char* a, char* b) {
	if ( strcmp(a, b) == 0 ) {
		return true;
	} else {
		return false;
	}
}

// End of utilities ----------------------------------------------------------------
// ---------------------------------------------------------------------------------

