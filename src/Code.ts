/**
 * https://developers.google.com/apps-script/guides/clasp
 * https://developers.google.com/apps-script/guides/typescript
 * https://github.com/google/clasp/blob/master/docs/typescript.md
 * https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson
 * https://www.typescriptlang.org/tsconfig#strict
 * ! is this needed?  https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/
 * https://typescript-eslint.io/getting-started
 *
 * Google Drive folder
 * https://drive.google.com/drive/folders/1aemNXKvhQpSX9hTuY49Fu4iNFPy6XYj-
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function runScratchMain() {
  Scratch.main();
}

interface Game {
  name: string;
  identifier: string;
  id: number;
  icon: { type: string; title: string; URL: string };
  hasProgressiveJackpot: string;
  hasRapidDrawings: boolean;
  hasTwoDrawings: boolean;
  gameType: string;
  topPrize: number;
  price: number;
  odds: string;
  tags: Array<string>;
  startDate: string;
  gamesLobbyOrder: number;
}

interface PrizeTier {
  tierNumber: number;
  prizeAmount: number;
  totalPrizes: number;
  paidPrizes: number;
  prizesRemaining: number;
  prizeDescription: string;
  odds: string;
  type: string;
}

interface GamePrize {
  massGameID: number;
  gameName: string;
  gameIdentifier: string;
  startDate: string;
  ticketCost: number;
  odds: string;
  prizeTiers: Array<PrizeTier>;
}

function pause() {
  // ! delay before making more server requests
  Utilities.sleep(2000);
  return;
}

function getScratchGames() {
  const httpResponse = UrlFetchApp.fetch(
    "https://www.masslottery.com/api/v1/games"
  );
  const contentStr = httpResponse.getContentText();
  const contentJson = <Array<Game>>JSON.parse(contentStr);

  pause();

  return contentJson.filter(
    (game) => game.gameType.toUpperCase() === "SCRATCH"
  );
}

function setupSheets(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  scratchGames: Array<Game>
) {
  const gameSheets = ss
    .getSheets()
    .filter((sheet) => sheet.getName() !== "Ticket Odds");
  const ticketOddsSheet = ss.getSheetByName("Ticket Odds");
  if (!ticketOddsSheet) {
    throw "Ticket Odds sheet not available";
  }
  const tosLastRow = ticketOddsSheet?.getLastRow() - 1;
  const tosLastCol = ticketOddsSheet?.getLastColumn();

  // start with a clean slate
  gameSheets.forEach((sheet) => ss.deleteSheet(sheet));

  if (tosLastRow > 0 && tosLastCol > 0) {
    ticketOddsSheet?.getRange(2, 1, tosLastRow, tosLastCol).clearContent();
  }

  scratchGames.forEach((game) => ss.insertSheet(game.identifier));

  return ticketOddsSheet;
}

function updateTicketOddsSheet(
  ticketOddsSheet: GoogleAppsScript.Spreadsheet.Sheet,
  gamePrize: GamePrize,
  prizeTiersArr: Array<PrizeTier>
) {
  const cashValue = prizeTiersArr.reduce(function (acc, prizeTier) {
    const oddsArr = prizeTier.odds.split("in").map((row) => +row.trim());

    return acc + (oddsArr[0] / oddsArr[1]) * prizeTier.prizeAmount;
  }, 0);

  ticketOddsSheet.appendRow([
    gamePrize.odds,
    cashValue,
    gamePrize.ticketCost,
    gamePrize.gameName,
    gamePrize.startDate,
  ]);
  return;
}

function processTicket(
  game: Game,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  ticketOddsSheet: GoogleAppsScript.Spreadsheet.Sheet
) {
  const httpResponse = UrlFetchApp.fetch(
    "https://www.masslottery.com/api/v1/instant-game-prizes?gameID=" + game.id
  );
  const contentStr = httpResponse.getContentText();
  const gamePrize = <GamePrize>JSON.parse(contentStr);
  const gamePrizeArr = Object.entries(gamePrize);
  const prizeTiersArr = gamePrizeArr[6][1] as Array<PrizeTier>;
  const sheet = ss.getSheetByName(game.identifier);
  if (!sheet) {
    throw "Game sheet not available";
  }

  sheet.getRange(1, 1, 6, 2).setValues(gamePrizeArr.slice(0, 6));
  // prizeTiers header
  sheet.getRange(7, 1, 1).setValue(gamePrizeArr[6][0]);
  // prizeTiers data
  let rowNum = 7;
  prizeTiersArr.forEach(function (row) {
    const rowArr = Object.entries(row);
    const numRows = rowArr.length;
    sheet?.getRange(rowNum + 1, 3, numRows, 2).setValues(rowArr);
    rowNum += numRows + 1;
  });

  updateTicketOddsSheet(ticketOddsSheet, gamePrize, prizeTiersArr);

  pause();

  return;
}

const Scratch = (function () {
  function main() {
    const ss = SpreadsheetApp.openById(
      "1cY4AgTl_6rpNkk49CqgwUOHo0iD2v-HsPPmHov_Dm3w"
    );
    const scratchGames = getScratchGames();
    const ticketOddsSheet = setupSheets(ss, scratchGames);
    if (!ticketOddsSheet) {
      throw "Ticket Odds sheet not available";
    }

    scratchGames.forEach((game) => processTicket(game, ss, ticketOddsSheet));

    return;
  }

  return { main };
})();
