import { fetchWrapper } from "../utils/FetchWrapper";

const baseUrl = process.env.EXPO_PUBLIC_API_URL + '/api/game';

export const gameResultService = {
    finishGame,
    getHebdoLeaderBoard,
    getGameLeaderBoard,
};

function finishGame(mode: string, region: string, lvl: number, timeTaken: number, accuracy: number, score: number) {
    return fetchWrapper.post(baseUrl + '/finish', { mode, region, lvl, timeTaken, accuracy, score });
}
function getHebdoLeaderBoard() {
    return fetchWrapper.get(baseUrl + `/leaderboard/weekly`);
}

function getGameLeaderBoard(mode: string, region: string, lvl: number) {
    return fetchWrapper.get(baseUrl + `/leaderboard/${mode}/${region}/${lvl}`);
}