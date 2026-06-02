/**
 * Validator for email address.
 * Tested against cases listed here: http://blogs.msdn.com/b/testing123/archive/2009/02/05/email-address-test-cases.aspx
 * 
 * @param {string} email	The email address to be validated
 * return {boolean}
 */
function isValidEmailAddress(email) {
	
	if (!email) return false;
	
	var matches = email.match(/^([^@]+)@([a-zA-Z0-9\[][a-zA-Z0-9\-\.\]]{0,254})$/);
	
	if (!matches || matches.length != 3) return false;
	
	var local = matches[1];
	var domain = matches[2];
	
	// If the local part has a space or " but isn't inside quotes its invalid
	if ((local.indexOf('"') >= 0 || local.indexOf(' ') >= 0) && (local.charAt(0) != '"' || local.charAt(local.length - 1) != '"')) {
		return false;
	}
	
	// If there are not exactly 0 and 2 quotes, its invalid
	var quotesMatch = local.match(/"/g);
	if (quotesMatch && quotesMatch.length != 2) {
		return false;
	}
	
	// If the local part starts or ends with a dot (.), its invalid
	if (local.charAt(0) == '.' || local.charAt(local.length - 1) == '.') {
		return false;
	}
	
	// Check the domain has at least 1 dot in it
	if (domain.indexOf('.') < 0) {
		return false;
	}
	
	// Check that local part has valid chars	
	if (!local.match(/^([\ \"\w\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~\.]{1,64})$/)) {
		return false;
	}
	
	// Email with consecutive dots is invalid
	if (email.match(/[\.][\.]+/g)) {
		return false;
	}
	
	// If domain is IP check if its valid
	var maybeIp = domain.match(/^(\[?)([0-9\.]+)(\]?)$/);
	var validIp = domain.match(/^(\[?)([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})(\]?)$/);
	if (maybeIp && !validIp) {
		return false;
	}	

	return true;
	
};

/**
 * Check if the passed hex color is valid
 * 
 * @param {string} hex		Hexadecimal colors (without the #)
 */
function validHexColor(hex) {
	var matcher = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
	return matcher.test(hex);
};

/**
 * Normalize 3 chracter hex colors to 6 character hex color
 * 
 * @param {string} hex
 * @return {string} 	The normalized hex color
 */
function normalizeHexColor(hex) {
	if (validHexColor(hex) && hex.length == 4) {
		var p = hex.split('');
		return (p[0] + p[1] + p[1] + p[2] + p[2] + p[3] + p[3]);
	}
	return hex;
};