/* ========================================== */
/* [Users] Required script data to fill in    */
/* ========================================== */
const USER_ID = "";
const API_TOKEN = "";// Do not share this with anyone
const WEB_APP_URL = "";
const SPREADSHEET_URL = "";
const SPREADSHEET_TAB_NAME_QUEUE = "Quest Queue";
const SPREADSHEET_TAB_NAME_INVENTORY = "Inventory Data";

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

/**
 * Some parts of the following script are from Print Quest Info v4.1.2 and Quest Tracker by @bumbleshoot
 */
const PARAMS = {
  "headers": {
    "x-api-user": USER_ID,
    "x-api-key": API_TOKEN,
    "x-client": "7d2dce0e-4197-407b-b40f-8b5530774486-Quest Queue V1"
  },
  "muteHttpExceptions": true
};
const GET_PARAMS = Object.assign({ "method": "get" }, PARAMS);
const POST_PARAMS = Object.assign({ "method": "post" }, PARAMS);
const scriptProperties = PropertiesService.getScriptProperties();


let members;
let content;
let spreadsheet = SpreadsheetApp.openById(SPREADSHEET_URL.match(/[^\/]{44}/)[0]);

function doPost(e) {

  // get API data
  members = JSON.parse(fetch("https://habitica.com/api/v3/groups/party/members?includeAllPublicFields=true", GET_PARAMS)).data;
  if (typeof members === "undefined") {
    members = [JSON.parse(fetch("https://habitica.com/api/v3/user", GET_PARAMS)).data];
    console.log("members was undefined")
  }

  writeInventory();

  let url = getLaunchCode();
  if (url.startsWith('http')) {
    UrlFetchApp.fetch(url);
  }
}


function writeInventory() {
  var sheet = spreadsheet.getSheetByName(SPREADSHEET_TAB_NAME_INVENTORY);

  let values = [];
  for (let key in members) {
    if (members.hasOwnProperty(key)) {
      let member = members[key];
      if (member.hasOwnProperty("auth")) {
        values.push(member.auth);
      }
    }
  }

  let memberQuests = {};
  for (member of members) {
    let memberName = member.auth.local.username;
    memberQuests[memberName] = Object.keys(member.items.quests).filter(questKey => member.items.quests[questKey] > 0);
  }

  var data = [];

  for (var memberName in memberQuests) {
    var memberId = members.find(m => m.auth.local.username === memberName).id;
    var launchURL = '';
    for (let i = 1; i <= 30; i++) {
      let varId = 'USER' + ((i < 10) ? '0' + i : i) + '_ID';
      let varUrl = 'USER' + ((i < 10) ? '0' + i : i) + '_LAUNCHQUESTS_URL';
      if (eval(varId) === memberId) {
        launchURL = eval(varUrl);
        break;
      }
    }
    var memberData = [memberName, launchURL].concat(memberQuests[memberName]);
    var filledData = [];
    for (let i = 0; i < 107; i++) {
      if (memberData[i + 2]) {
        filledData.push(memberData[i + 2]);
      } else {
        filledData.push('');
      }
    }
    data.push([memberData[0], memberData[1], ...filledData]);
  }

  for (let i = 0; i < data.length; i++) {
    sheet.getRange(i + 2, 1).setValue(data[i][0]);
    sheet.getRange(i + 2, 2).setValue(data[i][1]);
    for (let j = 0; j < 107; j++) {
        sheet.getRange(i + 2, j + 3).setValue(data[i][j + 2]);
    }
  }

  //Overwrite extra rows in the spreadsheet
  for (let i = data.length + 1; i < 31; i++) {
    for (let j = 0; j < 109; j++) {
      sheet.getRange(i + 1, j + 1).setValue('');
    }
  }
}



function getLaunchCode() {
  var agenda = spreadsheet.getSheetByName(SPREADSHEET_TAB_NAME_QUEUE);
  var launchCode = agenda.getRange("D1").getValue();
  agenda.deleteRow(1);
  return launchCode;
}



/**
 * fetch(url, params) from Print Quest Info v4.1.2 by @bumbleshoot
 *
 * Wrapper for Google Apps Script's UrlFetchApp.fetch(url, params):
 * https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params
 *
 * Retries failed API calls up to 2 times & handles Habitica's rate
 * limiting.
 *
 */
 function fetch(url, params) {

  // try up to 3 times
  for (let i=0; i<3; i++) {

    // if rate limit reached
    let rateLimitRemaining = scriptProperties.getProperty("X-RateLimit-Remaining");
    let rateLimitReset = scriptProperties.getProperty("X-RateLimit-Reset");
    if (rateLimitRemaining != null && Number(rateLimitRemaining) < 1) {

      // wait until rate limit reset
      let waitUntil = new Date(rateLimitReset);
      waitUntil.setSeconds(waitUntil.getSeconds() + 1);
      let now = new Date();
      Utilities.sleep(Math.max(waitUntil.getTime() - now.getTime(), 0));
    }

    // call API
    let response = UrlFetchApp.fetch(url, params);

    // store rate limiting data
    scriptProperties.setProperties({
      "X-RateLimit-Reset": response.getHeaders()["x-ratelimit-reset"],
      "X-RateLimit-Remaining": response.getHeaders()["x-ratelimit-remaining"]
    });

    // if success, return response
    if (response.getResponseCode() < 300 || (response.getResponseCode() === 404 && (url === "https://habitica.com/api/v3/groups/party" || url.startsWith("https://habitica.com/api/v3/groups/party/members")))) {
      return response;

    // if 3xx or 4xx or failed 3 times, throw exception
    } else if (response.getResponseCode() < 500 || i >= 2) {
      throw new Error("Request failed for https://habitica.com returned code " + response.getResponseCode() + ". Truncated server response: " + response.getContentText());
    }
  }
}

/**
 * Create Webhook from "Quest Tracker" by @bumbleshoot
 */
function createWebhook() {

  console.log("Creating webhook");

  let webhook = {
    "url": WEB_APP_URL,
    "label": DriveApp.getFileById(ScriptApp.getScriptId()).getName(),
    "type": "questActivity",
    "options": {
      "questFinished": true
    }
  };

  webhook = Object.assign({
    "contentType": "application/json",
    "payload": JSON.stringify(webhook)
  }, POST_PARAMS);

  fetch("https://habitica.com/api/v3/user/webhook", webhook);
}
