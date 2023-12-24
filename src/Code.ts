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

interface PrizeTiers {
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
  prizeTiers: Array<PrizeTiers>;
}

const Scratch = (function () {
  function main() {
    // "https://www.masslottery.com/api/v1/games";
    // "https://www.masslottery.com/api/v1/instant-game-prizes?gameID=420";
    // SpreadsheetApp;
    // UrlFetchApp;
    // JSON;

    const ss = SpreadsheetApp.openById(
      "1cY4AgTl_6rpNkk49CqgwUOHo0iD2v-HsPPmHov_Dm3w"
    );
    let httpResponse = UrlFetchApp.fetch(
      "https://www.masslottery.com/api/v1/games"
    );
    let contentStr = httpResponse.getContentText();
    const contentJson = <Array<Game>>JSON.parse(contentStr);
    const scratchGames = contentJson.filter(function (game) {
      return game.gameType.toUpperCase() === "SCRATCH";
    });

    // const sheets = ss.getSheets();
    const sheetName = scratchGames[0].name;
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet();
      sheet.setName(sheetName);
    }

    // ! delay before making more server requests
    Utilities.sleep(1000);
    httpResponse = UrlFetchApp.fetch(
      "https://www.masslottery.com/api/v1/instant-game-prizes?gameID=" +
        scratchGames[0].id
    );
    contentStr = httpResponse.getContentText();
    const gamePrize = <GamePrize>JSON.parse(contentStr);
    const gamePrizeArr2 = Object.entries(gamePrize);
    sheet.clearContents();
    sheet.getRange(1, 1, 6, 2).setValues(gamePrizeArr2.slice(0, 6));
    sheet.getRange(7, 1, 1).setValue(gamePrizeArr2[6][0]);

    let rowNum = 7;
    (gamePrizeArr2[6][1] as Array<string>).forEach(function (row) {
      const rowArr = Object.entries(row);
      const numRows = rowArr.length;
      sheet?.getRange(rowNum + 1, 3, numRows, 2).setValues(rowArr);
      rowNum += numRows + 1;
    });

    // ! delay before making more server requests
    Utilities.sleep(5000);

    // todo: delete sheets for inactive games
    return;
  }

  return { main };
})();
