/**
 * https://developers.google.com/apps-script/guides/clasp
 * https://developers.google.com/apps-script/guides/typescript
 * https://github.com/google/clasp/blob/master/docs/typescript.md
 * https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson-or-jsconfigjson
 * https://www.typescriptlang.org/tsconfig#strict
 * ! is this needed?  https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/
 * https://typescript-eslint.io/getting-started
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

const Scratch = (function () {
  function main() {
    // "https://www.masslottery.com/api/v1/games";
    // "https://www.masslottery.com/api/v1/instant-game-prizes?gameID=420";
    // SpreadsheetApp;
    // UrlFetchApp;
    // JSON;

    const httpResponse = UrlFetchApp.fetch(
      "https://www.masslottery.com/api/v1/games"
    );
    const contentStr = httpResponse.getContentText();
    const contentJson = <Array<Game>>JSON.parse(contentStr);
    contentJson.forEach(function (game) {
      console.log(game.gameType);
    });

    return;
  }

  return { main };
})();
