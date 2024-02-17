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
  let sheet = spreadsheet.getSheetByName(SPREADSHEET_SHEET_NAME_TEST);
  let oldies = spreadsheet.getSheetByName(SPREADSHEET_SHEET_NAME_OLDIES);

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

  // Update the member list
  let partyMembers = api_getPartyMembers();
  for (let i = 0; i < partyMembers.length; i++) {
    let member = partyMembers[i];
    let column = SPREADSHEET_OFFSET_MEMBER_COLUMN + i;

    // Extract the member currently in this column (aka column-member)
    let columnMemberID = sheet.getRange(3, column).getValue();
    // While the column-member is not the member in the list
    while (columnMemberID != member.id) {
      // If end of list has been reached or if column-member is still in the party
      if (columnMemberID == "" || partyMembers.some((member) => member.id == columnMemberID)) {
        // Create a new column for the member
        sheet.insertColumnBefore(column);
        sheet.getRange(1, column, 3).setValues([
          [member.profile.name], [member.auth.local.username], [member.id]
        ])
        break;
      }
      else {
        // Column-member left the party, send him to the oldies page
        let lastOldie = oldies.getLastColumn();
        oldies.insertColumnAfter(lastOldie);
        sheet.getRange(1, column, 4, 1).copyTo(
          oldies.getRange(1, lastOldie + 1, 4, 1)
        )
        // Insert a new column at the end and delete the old one
        sheet.insertColumnBefore(sheet.getMaxColumns());
        sheet.deleteColumn(column);
      }
      // Update column-member ID
      columnMemberID = sheet.getRange(3, column).getValue();
    }

    // Update the user name if changed
    let nameRange = sheet.getRange(1, column);
    if (nameRange.getValue() != member.profile.name) {
      nameRange.setValue(member.profile.name);
    }
  }

  for (let i = 0; i < 30; i++) {
    let column = SPREADSHEET_OFFSET_MEMBER_COLUMN + i;

    // Number the members
    sheet.getRange(5, column).setValue(i + 1);

    // Hide users without link
    if (!sheet.getRange(4, column).getValue().toString().startsWith("https://script.google.com/macros/s/")) {
      sheet.hideColumns(column);
    }
  }

  // Reduce to maximum 30 member columns
  let columnNumber = sheet.getMaxColumns();
  let maxColumnNumber = SPREADSHEET_OFFSET_MEMBER_COLUMN + 30;
  if (columnNumber > maxColumnNumber) {
    sheet.deleteColumns(maxColumnNumber, columnNumber - maxColumnNumber);
  }

  // Update quest inventory
  for (let i = 0; i < questsByLevel.length; i++) {
    let quest = questsByLevel[i];
    let row = SPREADSHEET_OFFSET_QUEST_ROW + i;
    for (let j = 0; j < partyMembers.length; j++) {
      let member = partyMembers[j];
      let column = SPREADSHEET_OFFSET_MEMBER_COLUMN + j;

      let cell = sheet.getRange(row, column);
      let questCount = member.items.quests[quest.key];
      if (questCount == undefined) questCount = 0;

      if (cell.getValue() != questCount) {
        cell.setValue(questCount);
      }
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
