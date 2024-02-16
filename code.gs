// [Authors] Place all other functions in this or other separate files
// - Ideally prefix functions that access the API with "api_" to quickly see which ones
//   access the API and to be able to budget your 30 requests per minute limit well

function processWebhookInstant(type, data) {
  // [Authors] This function gets called immediately,
  //   whenever a webhook of your script is activated.
  // - Place immediate reactions here.
  // - Make sure, that the processing time does not exceed 30 seconds.
  //   Otherwise you risk the deactivation of your webhook.

  // get API data
  let members = api_getPartyMembers();
  if (typeof members === "undefined") {
    members = [api_getUser()];
    console.log("members was undefined")
  }

  writeInventory(members);

  let url = getLaunchCode();
  if (url.startsWith('http')) {
    UrlFetchApp.fetch(url);
  }
}

function processWebhookDelayed(type, data) {
  // [Authors] This function gets called asynchronously,
  //   whenever a webhook of your script is activated.
  // - Here you can take care of heavy work, that may take longer.
  // - It may take up to 30 - 60 seconds for this function to activate
  //   after the webhook was triggered.
}

function processTrigger() {
  // [Authors] This function gets called by the example trigger.
  // - This is the place for recurrent tasks.
}

function updateInventory() {
  let sheet = spreadsheet.getSheetByName(SPREADSHEET_TAB_NAME_TEST);

  // Update the quest list
  let content = api_getContent();
  let questsByLevel = content.questsByLevel;

  for (let i = 0; i < questsByLevel.length; i++) {
    let quest = questsByLevel[i];
    let row = SPREADSHEET_OFFSET_QUEST_ROW + i;

    if (sheet.getRange(row, 2).getValue() != quest.key) {
      sheet.insertRowBefore(row);
      sheet.getRange(row, 1, 2).setValues([
        [quest.text, quest.key]
      ]);
    }
  }
}

function writeInventory(members) {
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
