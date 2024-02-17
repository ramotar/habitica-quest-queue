// [Authors] Place all other functions in this or other separate files
// - Ideally prefix functions that access the API with "api_" to quickly see which ones
//   access the API and to be able to budget your 30 requests per minute limit well

function processWebhookInstant(type, data) {
  // [Authors] This function gets called immediately,
  //   whenever a webhook of your script is activated.
  // - Place immediate reactions here.
  // - Make sure, that the processing time does not exceed 30 seconds.
  //   Otherwise you risk the deactivation of your webhook.

  return launchQuestInRow(1);
}

function processWebhookDelayed(type, data) {
  // [Authors] This function gets called asynchronously,
  //   whenever a webhook of your script is activated.
  // - Here you can take care of heavy work, that may take longer.
  // - It may take up to 30 - 60 seconds for this function to activate
  //   after the webhook was triggered.

  let row = data.row;
  let spreadsheet = openSpreadsheet();

  let party = api_getParty();

  // Check if there is a quest invite
  if (party.quest.key != undefined) {
    // Remove the quest from the queue
    let questQueue = spreadsheet.getSheetByName(SPREADSHEET_SHEET_NAME_QUEUE);
    questQueue.deleteRow(row);

    // If the quest is not yet started
    if (party.quest.active == false) {
      scheduleForceStart();
    }
  }
  else {
    notifyUserOfError(
      new Error(
        "Quest Queue failed to started the quest in row " + row + ".",
        { cause: data.error }
      )
    );

    // Try launching the next quest in the queue
    row = row + 1;
    let result = launchQuestInRow(row, spreadsheet);

    if (result !== false) {
      // Retrigger this function for further processing
      var trigger = ScriptApp.newTrigger('doPostTriggered').timeBased().after(1).create();
      CacheService.getScriptCache().put(
        trigger.getUniqueId(),
        JSON.stringify(result)
      );
    }
  }
}

function processTrigger() {
  // [Authors] This function gets called by the example trigger.
  // - This is the place for recurrent tasks.

  updateInventory();
}

function launchQuestInRow(row, spreadsheet = null) {
  spreadsheet = (spreadsheet ? spreadsheet : openSpreadsheet());
  let questQueue = spreadsheet.getSheetByName(SPREADSHEET_SHEET_NAME_QUEUE);
  let questLink = questQueue.getRange(row, 4).getValue().toString();

  let errorString = "";

  try {
    if (questLink.startsWith("https://script.google.com/macros/s/") && questLink.includes("/exec?questId=")) {
      let response = UrlFetchApp.fetch(questLink);

      // In case of a successful request, parse the returned message
      if (parseQuestLinkResponse(response)) {
        // Quest was successfully started, delete the corresponding row ...
        questQueue.deleteRow(row);
        // ... schedule a force start ...
        scheduleForceStart();
        // ... and no further processing needed
        return false;
      }

      errorString = response.getContentText();
    }
    else {
      errorString = "Invalid link for launching a quest in row " + row + ": " + (questLink == "" ? "(empty string)" : questLink);
    }
  }
  catch (error) {
    errorString = error.toString();
  }

  return {
    "row": row,
    "error": errorString
  }
}

function parseQuestLinkResponse(response) {
  let contentText = response.getContentText();

  let result;
  try {
    result = JSON.parse(contentText);
  }
  catch (error) {
  }

  if (result != undefined && result.hasOwnProperty("responseCode")) {
    if (result.responseCode == 200) {
      return true;
    }
  }

  return false;
}

function scheduleForceStart() {
  if (FORCE_START_QUESTS) {
    var delay = FORCE_START_DELAY * 60 * 1000;
    ScriptApp.newTrigger('forceStartQuest').timeBased().after(delay).create();
  }
}

function forceStartQuest(event) {
  const triggerId = event.triggerUid;

  // Delete the trigger
  let triggers = ScriptApp.getProjectTriggers();
  for (let trigger of triggers) {
    if (trigger.getUniqueId() === triggerId) {
      ScriptApp.deleteTrigger(trigger);
      break;
    }
  }

  try {
    api_fetch("https://habitica.com/api/v3/groups/party/quests/force-start", POST_PARAMS);
  }
  catch (error) {
    let cause = error.cause;
    if (cause.responseCode == 401 && cause.message == "The quest has already started.") {
      // Everything is fine, do nothing
    }
    else {
      notifyUserOfError(error);
      // Re-throw the error
      throw error;
    }
  }
}

function updateInventory() {
  let spreadsheet = openSpreadsheet();
  let queue = spreadsheet.getSheetByName(SPREADSHEET_SHEET_NAME_QUEUE);
  let sheet = spreadsheet.getSheetByName(SPREADSHEET_SHEET_NAME_INVENTORY);
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

  // Increase queue length back to 1000 rows
  let rowCount = queue.getMaxRows();
  if (rowCount < 1000) {
    // Insert new rows
    queue.insertRowsAfter(rowCount, 1000 - rowCount);

    // Copy the last row to the new rows
    let lastRow = queue.getRange(rowCount, 1, 1, queue.getMaxColumns());
    lastRow.copyTo(queue.getRange(rowCount + 1, 1, 1000 - rowCount));
  }
}

function openSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}
