/* ========================================== */
/* [Users] Do not edit code below this line   */
/* ========================================== */

/**
 * Some parts of the following script are from Print Quest Info v4.1.2 and Quest Tracker by @bumbleshoot
 */
let spreadsheet = SpreadsheetApp.openById(SPREADSHEET_URL.match(/[^\/]{44}/)[0]);

function doPost(e) {

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
