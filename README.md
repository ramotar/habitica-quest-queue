# Quest Queue by Turac
This version of the **Quest Queue** is a port of the original [Quest Queue](https://habitica.fandom.com/wiki/Quest_Queue) by [Snefferdy](https://habitica.com/profile/7d2dce0e-4197-407b-b40f-8b5530774486) to the [Habitica GAS Template](https://habitica.fandom.com/wiki/Habitica_GAS_Template) by Turac.

## Features
This version basically features the same capabilities as the original script, but has some improvements:

* improved spreadsheet for easier scheduling
* better error handling and recovery
* built-in force-start option

## Installation
For the installation follow the [installation instructions](https://habitica.fandom.com/wiki/Habitica_GAS_Template#Installation) for the GAS Template.

Additional information and steps are given below.

### Getting the script
You can find the source code of the script on [Google Apps Script](https://script.google.com/home/projects/169PoeLHqZnicfFkBoW1xreQxtWSx7Ch-_QT0W0VpYXMa3laQNwafquVh).

In addition you need the corresponding spreadsheet for the queue. Follow the instructions below:

1. Go to the template spreadsheet on [Google Sheets](https://docs.google.com/spreadsheets/d/18nrN_QuUDWt67Z71uVX4TIjsZ2yO5AInvnTIz_tTOgw/edit?usp=sharing).
2. If you're not already signed in to your Google Account, you need to sign in.
3. In the "File" menu on the top, click on "Make a copy" (looks like two sheets of paper).
4. Remove "Copy of ..." from the name of your copy and click "Make a copy".
5. Your copy of the spreadsheet will open now. Please note, that you need the ID of your sheet for the next step. You can find the ID in the URL between `.../d/` and `/edit...`.

### Configuring the script
There are a few additional configurations, that need to be made for the Quest Queue in particular:

1. Copy the ID of your spreadsheet and replace `PasteYourSpreadsheetIdHere` in *setup.gs*. It should now look something like this: `const SPREADSHEET_ID = "18nrN_QuUDWt67Z71uVX4TIjsZ2yO5AInvnTIz_tTOgw";`.
2. Choose, whether the queue shall force-start quests after a specified time, even if not all party members accepted the quest invite. Change the value of `const FORCE_START_QUESTS = true;` to `false`, if you don't want this to happen or if you have another script taking care of this task.
3. If force-start is activated, you can specify the delay via `const FORCE_START_DELAY = 5;`. The delay is in minutes since the quest invite.
4. Don't forget to save your project.

### Deploying the script
After successful deployment, your spreadsheet should be filled with all your party members in the `Party Inventory` sheet.

Since you haven't inserted their Launch Quest links yet, all columns are hidden. Click on the small arrows in the header row to the right of column B. You will get a short warning, that this sheet is protected to prevent unwanted modifications. You can safely ignore it for the following steps (or suppress the warning for the next 5 minutes).

Now, you can see all your party members. The final step is to insert Launch Quest links in row 4 for those members, that are using the Launch Quest with Link script. On the next inventory update, those members won't be hidden again. This way you have a good overview over all quests available to the party via Launch Quest links.

### Using the queue
Finally, you can use your queue. Simply go to the `Quest Queue` sheet and start chossing members in column A and their quests in column B.

When the current quest is finished, the queue will automatically invite the party to the first quest you selected and remove it from the queue.

## Contributions
Users and authors alike can contribute to this template and a hassle-free script experience for everyone:

|  |  |  |
| :---: | :---: | --- |
| :lady_beetle: | [Issues](https://github.com/ramotar/habitica-quest-queue/issues) | If you detect an issue, feel free to raise it |

## Acknowledgement
* This version is based on the original [Quest Queue](https://habitica.fandom.com/wiki/Quest_Queue) by [Snefferdy](https://habitica.com/profile/7d2dce0e-4197-407b-b40f-8b5530774486)
