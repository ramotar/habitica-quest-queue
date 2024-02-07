/**
 * Quest Queue v0.0.1 by @Turac
 *
 * Based on Quest Queue with Link (Release 1) by @Snefferdy:
 * https://habitica.fandom.com/wiki/Quest_Queue
 *
 * Ported to the Habitica GAS Template
 */

/* ========================================== */
/* [Users] Required script data to fill in    */
/* ========================================== */
const USER_ID = "PasteYourUserIdHere";
const API_TOKEN = "PasteYourApiTokenHere";
// IMPORTANT: Do not share your API token with anyone!

/* ========================================== */
/* [Users] Required customizations to fill in */
/* ========================================== */
// [Authors] Place all mandatory user-modified variables here
// - e.g. skill to use, number of times to use, task to use skill on, etc.
const SPREADSHEET_URL = "";
const SPREADSHEET_TAB_NAME_QUEUE = "Quest Queue";
const SPREADSHEET_TAB_NAME_INVENTORY = "Inventory Data";

/* ========================================== */
/* [Users] Optional customizations to fill in */
/* ========================================== */
// [Authors] Place all optional user-modified variables here
// - e.g. enable/disable notifications, enable/disable script features, etc.
const USER01_ID = "";//Paste @username here (after "//") for future reference if desired
const USER01_LAUNCHQUESTS_URL = "";
const USER02_ID = "";//
const USER02_LAUNCHQUESTS_URL = "";
const USER03_ID = "";//
const USER03_LAUNCHQUESTS_URL = "";
const USER04_ID = "";//
const USER04_LAUNCHQUESTS_URL = "";
const USER05_ID = "";//
const USER05_LAUNCHQUESTS_URL = "";
const USER06_ID = "";//
const USER06_LAUNCHQUESTS_URL = "";
const USER07_ID = "";//
const USER07_LAUNCHQUESTS_URL = "";
const USER08_ID = "";//
const USER08_LAUNCHQUESTS_URL = "";
const USER09_ID = "";//
const USER09_LAUNCHQUESTS_URL = "";
const USER10_ID = "";//
const USER10_LAUNCHQUESTS_URL = "";
const USER11_ID = "";//
const USER11_LAUNCHQUESTS_URL = "";
const USER12_ID = "";//
const USER12_LAUNCHQUESTS_URL = "";
const USER13_ID = "";//
const USER13_LAUNCHQUESTS_URL = "";
const USER14_ID = "";//
const USER14_LAUNCHQUESTS_URL = "";
const USER15_ID = "";//
const USER15_LAUNCHQUESTS_URL = "";
const USER16_ID = "";//
const USER16_LAUNCHQUESTS_URL = "";
const USER17_ID = "";//
const USER17_LAUNCHQUESTS_URL = "";
const USER18_ID = "";//
const USER18_LAUNCHQUESTS_URL = "";
const USER19_ID = "";//
const USER19_LAUNCHQUESTS_URL = "";
const USER20_ID = "";//
const USER20_LAUNCHQUESTS_URL = "";
const USER21_ID = "";//
const USER21_LAUNCHQUESTS_URL = "";
const USER22_ID = "";//
const USER22_LAUNCHQUESTS_URL = "";
const USER23_ID = "";//
const USER23_LAUNCHQUESTS_URL = "";
const USER24_ID = "";//
const USER24_LAUNCHQUESTS_URL = "";
const USER25_ID = "";//
const USER25_LAUNCHQUESTS_URL = "";
const USER26_ID = "";//
const USER26_LAUNCHQUESTS_URL = "";
const USER27_ID = "";//
const USER27_LAUNCHQUESTS_URL = "";
const USER28_ID = "";//
const USER28_LAUNCHQUESTS_URL = "";
const USER29_ID = "";//
const USER29_LAUNCHQUESTS_URL = "";
const USER30_ID = "";//
const USER30_LAUNCHQUESTS_URL = "";

/* ========================================== */
/* [Users] Do not edit code below this line   */
/* ========================================== */

// [Authors] Place your user ID and script name here
// - This is used for the "X-Client" HTTP header
// - See https://habitica.fandom.com/wiki/Guidance_for_Comrades#X-Client_Header
const AUTHOR_ID = "7d2dce0e-4197-407b-b40f-8b5530774486";
const SCRIPT_NAME = "Quest Queue";

// [Authors] Add global variables here
// - Note that these do not persist in between script calls
// - If you want to save values between calls, use PropertiesService
// - See https://developers.google.com/apps-script/reference/properties/properties-service
const scriptProperties = PropertiesService.getScriptProperties();

/* =================================== */
/* [Authors] Below you find functions, */
/*   that are only used once during    */
/*   installation, update or removal   */
/* =================================== */

function install() {
  // [Authors] These are one-time initial setup instructions that we'll ask
  //   the user to manually execute only once, during initial script setup
  // - Add triggers and webhooks for your script to service the events you care about
  // - Feel free to do all other one-time setup actions here as well
  //   e.g. creating tasks, reward buttons, etc.

  // check, if setup was already executed
  if (!getInstallTime()) {

    // if all options entered by the user are valid
    if (validateOptions()) {
      // create triggers
      createTriggers();
      // create webhooks
      createWebhooks();

      // save the time the installation was completed
      updateInstallTime();

      logInfo("Installation of the script succesfully finished!");
    }
  }
  else {
    logError("Installation of the script was already executed before")
  }
}

function uninstall() {
  // [Authors] These are one-time instructions that we'll tell the user to
  //   execute during script removal
  // - Add deleteWebhooks() here, if you created a webhook during initial setup
  // - Remove all other permanent changes the script has introduced during initial
  //   setup and normal use

  // delete triggers
  deleteTriggers();
  // delete webhooks
  deleteWebhooks();

  // remove the install time
  deleteInstallTime();

  logInfo("Removal of the script succesfully finished!");
}

function update() {
  // [Authors] This function updates the script after the user changed settings.
  // - It simply uninstalls and installs again.
  uninstall();
  install();
}

function createTriggers() {
  // [Authors] This function is used to create your necessary triggers
  // - Below you find an example trigger, that recurs every hour
  // - Feel free to modify this trigger or add additional triggers

  logInfo("Creating triggers");

  ScriptApp.newTrigger("processTrigger")
    .timeBased()
    .everyHours(1)
    .create();
}

function createWebhooks() {
  // [Authors] This function is used to create webhooks to your script
  // - Below you find an example webhook, that gets called, when a task is scored
  // - Feel free to modify this webhook or add additional webhooks

  logInfo("Creating webhooks");

  let webhookData = {
    "type": "questActivity",
    "options": {
      "questFinished": true
    }
  }
  api_createWebhook(webhookData);
}

function deleteTriggers() {
  // [Authors] This function deletes all existing triggers for your script

  let triggers = ScriptApp.getProjectTriggers();
  if (triggers.length > 0) {

    logInfo("Deleting triggers");

    for (let trigger of triggers) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function deleteWebhooks() {
  // [Authors] This function deletes all existing webhooks to your script

  let response = api_fetch("https://habitica.com/api/v3/user/webhook", GET_PARAMS);
  let obj = parseJSON(response);
  let webhooks = obj.data;

  if (webhooks.length > 0) {

    console.log("Deleting webhooks");

    let webAppURL = getWebAppURL();

    for (let webhook of webhooks) {
      if (webhook.url == webAppURL) {
        api_fetch("https://habitica.com/api/v3/user/webhook/" + webhook.id, DELETE_PARAMS);
      }
    }
  }
}

function validateOptions() {
  // [Authors] This function is used to validate the options entered by the user
  // - Validation of the predefined script data is already programmed
  // - Usually check for the right type and value

  let valid = true;

  if (typeof INT_USER_ID !== "string" || !TOKEN_REGEXP.test(INT_USER_ID)) {
    logError("USER_ID must equal your Habitica User ID.\n\ne.g. const USER_ID = \"12345678-90ab-416b-cdef-1234567890ab\";\n\nYour Habitica User ID can be found at https://habitica.com/user/settings/api");
    valid = false;
  }

  if (typeof INT_API_TOKEN !== "string" || !TOKEN_REGEXP.test(INT_API_TOKEN)) {
    logError("API_TOKEN must equal your Habitica API Token.\n\ne.g. const API_TOKEN = \"2345678-90ab-416b-cdef-1234567890ab\";\n\nYour Habitica API Token can be found at https://habitica.com/user/settings/api");
    valid = false;
  }

  // test credentials
  if (valid) {
    valid = testCredentials();
  }

  if (!valid) {
    logInfo("Please fix the above errors, create a new version of the deployment, and run the doOneTimeSetup() function again.\nIf you aren't sure how to do this, see \"Changing the Settings\" in the documentation for this script.");
  }

  return valid;
}

function testCredentials() {
  // [Authors] This function tests the user credentials

  try {
    api_getUser();
  }
  catch (error) {
    if (error.message.startsWith("Request failed") && error.cause.getResponseCode() == 401) {
      logError("Your USER_ID and/or API_TOKEN is incorrect. Both of these can be found at https://habitica.com/user/settings/api");
      return false;
    }
    else {
      throw error;
    }
  }

  return true;
}
